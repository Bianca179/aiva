// PD - Anthropic-Caching-Proxy (Cloudflare Worker), v2, 25.09.2026
// Vorgänger: worker-anthropic-cache.js (10.08.2026, Drive 1HBCi_g0zHzWYOWh7Cj5B7y1vpWHcCZlD).
//
// Änderungen gegenüber v1:
// (1) Cache-Markierungen NUR für Agenten (Anfrage enthält Werkzeuge). Einzelaufrufe laufen
//     unverändert durch — dort kostet ein Cache-Write ohne späteren Read 25 % mehr.
// (2) Timeout-Schutz für Agenten: Cloudflare bricht nach 120 s ohne vollständige Antwort ab
//     (Beleg: Findus Exec 4790, 21.09.). Der Worker holt die Antwort deshalb als Stream von
//     Anthropic, schickt n8n sofort den Antwortkopf und alle 10 s ein Leerzeichen und am Ende
//     die vollständige Nachricht als normales JSON (Leerzeichen vor JSON sind gültig).
//     Fehler vor Stream-Beginn (credit balance, 401, 429, 5xx) gehen mit echtem Status durch.
//     Bricht der Stream mittendrin ab, liefert der Worker absichtlich ungültiges JSON mit
//     „PROXY-ABBRUCH", damit der Lauf in n8n rot wird statt still „erfolgreich".
// Der API-Schlüssel bleibt in n8n und läuft nur durch (wird hier NICHT gespeichert).

const UPSTREAM = 'https://api.anthropic.com';
const HEARTBEAT_MS = 10000;
const MAX_BREAKPOINTS = 4;

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const upstream = UPSTREAM + url.pathname + url.search;

    // Alles außer POST /v1/messages (auch /v1/messages/count_tokens) unverändert durchreichen
    if (request.method !== 'POST' || url.pathname !== '/v1/messages') {
      return fetch(upstream, request);
    }

    const raw = await request.text();
    const headers = new Headers(request.headers);
    headers.delete('content-length');

    let body;
    try {
      body = JSON.parse(raw);
    } catch (e) {
      return fetch(upstream, { method: 'POST', headers, body: raw }); // kein JSON — unverändert weiter
    }

    const istAgent = Array.isArray(body.tools) && body.tools.length > 0;
    if (!istAgent) {
      return fetch(upstream, { method: 'POST', headers, body: raw }); // Einzelaufruf — Bytes unverändert
    }

    markiereCache(body);

    // Client streamt selbst: Stream unverändert durchreichen (Events halten die Verbindung offen)
    if (body.stream === true) {
      return fetch(upstream, { method: 'POST', headers, body: JSON.stringify(body) });
    }

    body.stream = true;
    const antwort = await fetch(upstream, { method: 'POST', headers, body: JSON.stringify(body) });
    const typ = antwort.headers.get('content-type') || '';
    if (!antwort.ok || !typ.includes('text/event-stream')) {
      return antwort; // Fehler (400 credit balance, 401, 429, 5xx) mit echtem Status weitergeben
    }

    const { readable, writable } = new TransformStream();
    const writer = writable.getWriter();
    const enc = new TextEncoder();
    const arbeit = sammleStream(antwort.body, writer, enc);
    if (ctx && ctx.waitUntil) ctx.waitUntil(arbeit);

    const kopf = new Headers({ 'content-type': 'application/json' });
    const rid = antwort.headers.get('request-id');
    if (rid) kopf.set('request-id', rid);
    return new Response(readable, { status: 200, headers: kopf });
  }
};

// Cache-Markierungen wie v1: letzter System-Block + letzter Inhaltsblock der letzten Nachricht.
// Höchstens 4 Markierungen je Anfrage (API-Grenze) — vorhandene werden mitgezählt.
function markiereCache(body) {
  try {
    let frei = MAX_BREAKPOINTS - zaehleMarkierungen(body);
    if (frei > 0 && typeof body.system === 'string' && body.system.length > 0) {
      body.system = [{ type: 'text', text: body.system, cache_control: { type: 'ephemeral' } }];
      frei--;
    } else if (frei > 0 && Array.isArray(body.system) && body.system.length > 0) {
      const last = body.system[body.system.length - 1];
      if (last && typeof last === 'object' && !last.cache_control) { last.cache_control = { type: 'ephemeral' }; frei--; }
    }
    if (frei > 0 && Array.isArray(body.messages) && body.messages.length > 0) {
      const m = body.messages[body.messages.length - 1];
      if (typeof m.content === 'string' && m.content.length > 0) {
        m.content = [{ type: 'text', text: m.content, cache_control: { type: 'ephemeral' } }];
      } else if (Array.isArray(m.content) && m.content.length > 0) {
        const lb = m.content[m.content.length - 1];
        if (lb && typeof lb === 'object' && lb.type !== 'thinking' && lb.type !== 'redacted_thinking' && !lb.cache_control) {
          lb.cache_control = { type: 'ephemeral' };
        }
      }
    }
  } catch (e) {
    // Im Zweifel lieber ohne Markierung durchreichen als scheitern
  }
}

function zaehleMarkierungen(body) {
  let n = 0;
  const zaehle = (bloecke) => { if (Array.isArray(bloecke)) for (const b of bloecke) if (b && b.cache_control) n++; };
  zaehle(body.tools);
  zaehle(body.system);
  if (Array.isArray(body.messages)) for (const m of body.messages) zaehle(m.content);
  return n;
}

// Liest den SSE-Stream von Anthropic, setzt daraus die fertige Nachricht zusammen
// (gleiche Form wie eine Antwort ohne Streaming) und schreibt sie an n8n.
async function sammleStream(stream, writer, enc) {
  // Puls: sofort ein Leerzeichen (Antwortkopf geht raus), dann alle 10 s eins.
  // Nicht awaiten — sonst blockiert der Gegendruck, solange n8n noch nicht liest.
  let timer = null;
  const puls = () => {
    writer.write(enc.encode(' ')).catch(() => {});
    timer = setTimeout(puls, HEARTBEAT_MS);
  };
  puls();

  let nachricht = null;
  const teilJson = {};
  let abbruch = null;
  let gestoppt = false;

  try {
    const reader = stream.getReader();
    const dec = new TextDecoder();
    let puffer = '';
    for (;;) {
      const { value, done } = await reader.read();
      if (done) break;
      puffer += dec.decode(value, { stream: true });
      let grenze;
      while ((grenze = puffer.indexOf('\n\n')) !== -1) {
        const block = puffer.slice(0, grenze);
        puffer = puffer.slice(grenze + 2);
        const daten = datenzeile(block);
        if (!daten) continue;
        const ev = JSON.parse(daten);
        switch (ev.type) {
          case 'message_start':
            nachricht = ev.message;
            nachricht.content = [];
            break;
          case 'content_block_start': {
            const b = ev.content_block;
            if (b.type === 'tool_use' || b.type === 'server_tool_use') teilJson[ev.index] = '';
            nachricht.content[ev.index] = b;
            break;
          }
          case 'content_block_delta': {
            const b = nachricht.content[ev.index];
            const d = ev.delta;
            if (d.type === 'text_delta') b.text = (b.text || '') + d.text;
            else if (d.type === 'input_json_delta') teilJson[ev.index] += d.partial_json;
            else if (d.type === 'thinking_delta') b.thinking = (b.thinking || '') + d.thinking;
            else if (d.type === 'signature_delta') b.signature = d.signature;
            else if (d.type === 'citations_delta') (b.citations = b.citations || []).push(d.citation);
            break;
          }
          case 'content_block_stop':
            if (ev.index in teilJson) {
              const s = teilJson[ev.index];
              nachricht.content[ev.index].input = s ? JSON.parse(s) : {};
              delete teilJson[ev.index];
            }
            break;
          case 'message_delta':
            Object.assign(nachricht, ev.delta);
            if (ev.usage) nachricht.usage = Object.assign(nachricht.usage || {}, ev.usage);
            break;
          case 'message_stop':
            gestoppt = true;
            break;
          case 'error':
            abbruch = (ev.error && (ev.error.type + ': ' + ev.error.message)) || 'unbekannter Fehler';
            break;
          // 'ping' und unbekannte Ereignisse: ignorieren
        }
        if (abbruch) break;
      }
      if (abbruch) break;
    }
    if (!abbruch && (!nachricht || !gestoppt)) abbruch = 'Stream ohne message_stop beendet';
  } catch (e) {
    abbruch = 'Stream-Fehler: ' + (e && e.message);
  }

  clearTimeout(timer);
  try {
    if (abbruch) {
      console.error('PROXY-ABBRUCH', abbruch);
      await writer.write(enc.encode('PROXY-ABBRUCH ' + abbruch)); // absichtlich ungültiges JSON → Lauf wird rot
    } else {
      await writer.write(enc.encode(JSON.stringify(nachricht)));
    }
  } finally {
    try { await writer.close(); } catch (e) {}
  }
}

function datenzeile(block) {
  let daten = '';
  for (const zeile of block.split('\n')) {
    if (zeile.startsWith('data:')) daten += zeile.slice(5).trimStart();
  }
  return daten;
}
