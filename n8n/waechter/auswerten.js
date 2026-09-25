// PD - Stille-Fehler-Wächter · Knoten „Auswerten"
// Prüft die gelesenen Läufe strukturell (Fehler-Einträge je Knoten, Anthropic-Fehlerantworten
// in HTTP-Knoten, leere Agenten-Antworten) und die Zeitpläne („nicht gelaufen").
// Kein Textsuchen im ganzen Lauf — sonst würden zitierte Alarmtexte (z. B. in Slack-Nachrichten) gemeldet.
// Gleiche Kombination Workflow + Kategorie höchstens alle 6 Stunden. Kein KI-Modell.

const BASIS = 'https://rhineshore.app.n8n.cloud';
const SPERRE_MS = 6 * 3600 * 1000;
// Workflows ohne Fehler-Workflow: dort meldet der Wächter auch rote Läufe mit sonstigen Fehlern
const OHNE_FEHLERALARM = new Set(['3mTqQ3zOAnqoMERh', '8LzkOa0iFOKfThsR', 'TWrqGjacJgpfkk1A', 'VufJGSTnRHFRPUDg', 'sC0Oha2cKFcTCjgw']);
// Zeitgesteuerte Workflows (Stand 25.09.; bei Änderung des Zeitplans hier nachziehen). Zeiten Europe/Berlin.
const ZEITPLAN = [
  { id: 'TmwShtK9D4kt5KEa', name: 'CENTCOM – Inbox-Pass v2.1b', cron: ['0 0 8 * * 1-5', '0 0 12 * * 1-5', '0 0 15 * * 1-5', '0 0 9 * * 6'] },
  { id: '8LJ0D5YUa1rrAd9n', name: 'CENTCOM - Postausgangs-Pass v2', cron: ['0 50 6,12 * * 1-5'] },
  { id: '8LzkOa0iFOKfThsR', name: 'PD - Termin vorbereiten', cron: ['0 0 17 * * 1-5', '0 10 7 * * 1-5'] },
  { id: 'GAUWB6soXqqezKrJ', name: 'PD - Aufgaben-Verteiler v3 (Router)', cron: ['0 45 8,14 * * 1-5'] },
  { id: 'Hw3kgSmYG8zSm8QM', name: 'PD - Voicespiegel', cron: ['0 0 19 * * *'] },
  { id: 'Rii70C8nlIsbSgHC', name: 'PD - LinkedIn-Pass', cron: ['0 20 8,12,16 * * 1-5'] },
  { id: 'o8dp531ELw35wRQN', name: 'PD - Klick-Abgleich', cron: ['0 15 7,13 * * 1-5'] },
  { id: 'gIrwBH3fA49Po9It', name: 'PD - Bravo 6 Wochenlauf', cron: ['0 0 7 * * 2'] },
];

function kategorie(text, code) {
  const t = String(text || '');
  const c = Number(code) || 0;
  if (/credit balance/i.test(t)) return 'GUTHABEN';
  if (/PROXY-ABBRUCH|is not valid JSON|Unexpected token/i.test(t)) return 'Proxy-Abbruch';
  if (/timed out|timeout|Proxy Read Timeout|\b524\b/i.test(t)) return 'Zeitüberschreitung';
  if (/Invalid URL/i.test(t)) return 'Invalid URL';
  if (c === 401 || c === 403 || /authentication_error|permission_error|invalid x-api-key/i.test(t)) return 'Schlüssel ungültig (401/403)';
  if (c === 429 || /rate_limit_error/i.test(t)) return 'Rate-Limit (429)';
  if (c === 529 || /overloaded_error/i.test(t)) return 'Anthropic überlastet (529)';
  if (c >= 500 || /api_error/i.test(t)) return 'Serverfehler (5xx)';
  return null; // sonstiger Fehler
}

function fehlerAusLauf(sel, ex) {
  const funde = [];
  const rd = (ex.data && ex.data.resultData) || {};
  const runData = rd.runData || {};
  const still = sel.status === 'success';
  const gesehen = new Set();
  const neu = (knoten, text, code) => {
    const kat = kategorie(text, code);
    const melden = kat || still || OHNE_FEHLERALARM.has(sel.workflowId);
    const k = kat || 'Sonstiger Knotenfehler';
    if (!melden || gesehen.has(k)) return;
    gesehen.add(k);
    funde.push({ workflowId: sel.workflowId, workflow: sel.workflow, knoten, kategorie: k, still,
      text: String(text || '').replace(/\s+/g, ' ').slice(0, 160), lauf: sel.id });
  };
  for (const [knoten, runs] of Object.entries(runData)) {
    for (const run of runs || []) {
      if (run.error) {
        const e = run.error;
        neu(knoten, [e.message, e.description].filter(Boolean).join(' – '), e.httpCode || (e.context && e.context.httpCode));
      }
      const main = (run.data && run.data.main) || [];
      for (const zweig of main) for (const it of zweig || []) {
        const j = it && it.json;
        if (!j || !j.error || typeof j.error !== 'object') continue;
        if (j.type === 'error' && (j.error.type || j.error.message)) {
          // HTTP-Knoten mit „neverError": Anthropic-Fehlerantwort steht als normales Ergebnis im Ausgang
          neu(knoten, j.error.type + ': ' + j.error.message, null);
        } else if (typeof j.error.message === 'string' && (j.error.name || j.error.description)) {
          // Knoten mit „bei Fehler weitermachen": Fehler steht als json.error im Ausgang, Lauf bleibt grün
          neu(knoten, [j.error.message, j.error.description].filter(Boolean).join(' – '), j.error.httpCode);
        }
      }
    }
  }
  if (!funde.length && rd.error) neu(rd.lastNodeExecuted || '?', [rd.error.message, rd.error.description].filter(Boolean).join(' – '), rd.error.httpCode);
  // Leere Agenten-Antwort
  const antwort = runData['Antwort zurueckgeben'];
  if (sel.status === 'success' && antwort && antwort.length) {
    const letzte = antwort[antwort.length - 1];
    const j = (((letzte.data || {}).main || [])[0] || [])[0];
    const txt = j && j.json ? (j.json.text ?? j.json.output ?? j.json.antwort) : undefined;
    if (!j || typeof txt !== 'string' || !txt.trim()) {
      funde.push({ workflowId: sel.workflowId, workflow: sel.workflow, knoten: 'Antwort zurueckgeben', kategorie: 'Leere Agenten-Antwort', still: true, text: '', lauf: sel.id });
    }
  }
  return funde;
}

// Uhrzeit-Teile in Europe/Berlin
function berlin(d) {
  const p = Object.fromEntries(new Intl.DateTimeFormat('en-GB', { timeZone: 'Europe/Berlin', hour12: false, weekday: 'short',
    year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' }).formatToParts(d).map(x => [x.type, x.value]));
  const wt = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 }[p.weekday];
  return { min: +p.minute, std: +p.hour % 24, tag: +p.day, mon: +p.month, wt, text: `${p.day}.${p.month}. ${p.hour}:${p.minute}` };
}
function feld(ausdruck, wert) {
  if (ausdruck === '*') return true;
  return ausdruck.split(',').some(teil => {
    if (teil.includes('-')) { const [a, b] = teil.split('-').map(Number); return wert >= a && wert <= b; }
    return Number(teil) === wert;
  });
}
function passt(cron, b) {
  const [, m, h, dom, mon, dow] = cron.trim().split(/\s+/);
  return feld(m, b.min) && feld(h, b.std) && feld(dom, b.tag) && feld(mon, b.mon) && feld(dow, b.wt);
}

// Geplante Zeitpunkte im Fenster (jetzt-90 min, jetzt-30 min]: je Wächterlauf (stündlich) wird jeder Termin genau einmal geprüft
function nichtGelaufen(liste, jetzt) {
  const funde = [];
  for (const z of ZEITPLAN) {
    for (let t = jetzt - 89 * 60000; t <= jetzt - 30 * 60000; t += 60000) {
      const minute = Math.floor(t / 60000) * 60000;
      const b = berlin(new Date(minute));
      if (!z.cron.some(c => passt(c, b))) continue;
      const gelaufen = liste.some(e => e.workflowId === z.id && e.startedAt &&
        Date.parse(e.startedAt) >= minute - 2 * 60000 && Date.parse(e.startedAt) <= minute + 30 * 60000);
      if (!gelaufen) funde.push({ workflowId: z.id, workflow: z.name, knoten: 'Zeitplan', kategorie: 'Nicht gelaufen', still: false,
        text: `geplant ${b.text} Uhr, kein Lauf gefunden`, lauf: null, schluessel: z.id + '|fehlt|' + minute });
    }
  }
  return funde;
}

// ---- Hauptteil ----
const state = $getWorkflowStaticData('global');
state.gemeldet = state.gemeldet || {};
const jetzt = Date.now();
const auswahl = $('Auswählen').all();
const gelesen = $input.all();
const liste = ($('Läufe auflisten').first().json.data) || [];

let funde = [];
gelesen.forEach((item, i) => {
  const sel = auswahl[i] && auswahl[i].json;
  if (!sel || !sel.id) return;
  funde = funde.concat(fehlerAusLauf(sel, item.json));
  state.geprueft.push(sel.id);
});
state.geprueft = state.geprueft.slice(-1500);
funde = funde.concat(nichtGelaufen(liste, jetzt));

// Sperre: gleiche Kombination höchstens alle 6 Stunden
for (const [k, t] of Object.entries(state.gemeldet)) if (jetzt - t > 48 * 3600 * 1000) delete state.gemeldet[k];
const zuMelden = funde.filter(f => {
  const k = f.schluessel || (f.workflowId + '|' + f.kategorie);
  if (state.gemeldet[k] && jetzt - state.gemeldet[k] < SPERRE_MS) return false;
  state.gemeldet[k] = jetzt;
  return true;
});
if (!zuMelden.length) return [];

const zeile = f => `• *${f.workflow}* · ${f.knoten} · *${f.kategorie}*${f.still ? ' (Lauf stand auf „erfolgreich")' : ''}` +
  (f.text ? ` – ${f.text}` : '') + (f.lauf ? ` – <${BASIS}/workflow/${f.workflowId}/executions/${f.lauf}|Lauf ${f.lauf}>` : '');
const guthaben = zuMelden.some(f => f.kategorie === 'GUTHABEN');
let text = (guthaben ? ':moneybag: *Anthropic-Guthaben leer* (Konto „Anthropic Rhineshore") – Agenten antworten nicht, bis aufgeladen ist.\n' : '') +
  `:mag: *Stille-Fehler-Wächter* – ${zuMelden.length} Befund${zuMelden.length === 1 ? '' : 'e'}\n` + zuMelden.map(zeile).join('\n');
if (text.length > 3500) text = text.slice(0, 3450) + '\n… (gekürzt)';
return [{ json: { text } }];
