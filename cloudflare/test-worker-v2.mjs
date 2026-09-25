// Lokaler Test für worker-anthropic-cache-v2.js (Node 22, ohne Abhängigkeiten).
// Aufruf: node cloudflare/test-worker-v2.mjs            (schnelle Tests)
//         node cloudflare/test-worker-v2.mjs --puls     (zusätzlich 25-s-Heartbeat-Test)
import { readFileSync, writeFileSync, mkdtempSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import assert from 'node:assert/strict';

const quelle = readFileSync(new URL('./worker-anthropic-cache-v2.js', import.meta.url), 'utf8');
const tmp = join(mkdtempSync(join(tmpdir(), 'worker-')), 'worker.mjs');
writeFileSync(tmp, quelle);
const worker = (await import(tmp)).default;

let letzterUpstream = null;
let upstreamAntwort = null;
globalThis.fetch = async (url, init) => {
  const body = init && init.body !== undefined ? init.body : (init instanceof Request ? await init.text() : undefined);
  letzterUpstream = { url: String(url), body };
  return upstreamAntwort();
};

const sse = (ereignisse, { verzoegerung = 0, abschneiden = false } = {}) => () => {
  const enc = new TextEncoder();
  const stream = new ReadableStream({
    async start(c) {
      for (const e of ereignisse) {
        if (verzoegerung) await new Promise(r => setTimeout(r, verzoegerung));
        c.enqueue(enc.encode(`event: ${e.type}\ndata: ${JSON.stringify(e)}\n\n`));
      }
      c.close();
    }
  });
  return new Response(stream, { status: 200, headers: { 'content-type': 'text/event-stream', 'request-id': 'req_test' } });
};

const agentStream = [
  { type: 'message_start', message: { id: 'msg_1', type: 'message', role: 'assistant', model: 'claude-sonnet-4-6', content: [], stop_reason: null, stop_sequence: null, usage: { input_tokens: 10, cache_creation_input_tokens: 2000, cache_read_input_tokens: 5000, output_tokens: 1 } } },
  { type: 'ping' },
  { type: 'content_block_start', index: 0, content_block: { type: 'thinking', thinking: '', signature: '' } },
  { type: 'content_block_delta', index: 0, delta: { type: 'thinking_delta', thinking: 'Ich prüfe ' } },
  { type: 'content_block_delta', index: 0, delta: { type: 'thinking_delta', thinking: 'das Mandat.' } },
  { type: 'content_block_delta', index: 0, delta: { type: 'signature_delta', signature: 'sig123' } },
  { type: 'content_block_stop', index: 0 },
  { type: 'content_block_start', index: 1, content_block: { type: 'text', text: '' } },
  { type: 'content_block_delta', index: 1, delta: { type: 'text_delta', text: 'Ich suche ' } },
  { type: 'content_block_delta', index: 1, delta: { type: 'text_delta', text: 'Kandidaten.' } },
  { type: 'content_block_stop', index: 1 },
  { type: 'content_block_start', index: 2, content_block: { type: 'tool_use', id: 'toolu_1', name: 'Findus_LinkedIn_suchen', input: {} } },
  { type: 'content_block_delta', index: 2, delta: { type: 'input_json_delta', partial_json: '{"such_keywords": "Country Man' } },
  { type: 'content_block_delta', index: 2, delta: { type: 'input_json_delta', partial_json: 'ager", "such_orte": ["München"]}' } },
  { type: 'content_block_stop', index: 2 },
  { type: 'message_delta', delta: { stop_reason: 'tool_use', stop_sequence: null }, usage: { output_tokens: 87 } },
  { type: 'message_stop' }
];

const anfrage = (body, pfad = '/v1/messages') => new Request('https://pd-anthropic-cache.example' + pfad, {
  method: 'POST', headers: { 'content-type': 'application/json', 'x-api-key': 'TEST', 'anthropic-version': '2023-06-01' }, body: typeof body === 'string' ? body : JSON.stringify(body)
});
const agentBody = () => ({ model: 'claude-sonnet-4-6', max_tokens: 16000, system: 'Du bist Findus.', tools: [{ name: 'Findus_LinkedIn_suchen', input_schema: { type: 'object' } }], messages: [{ role: 'user', content: 'Suche Kandidaten' }] });

let ok = 0;
const test = async (name, fn) => { await fn(); ok++; console.log('✓', name); };

await test('Einzelaufruf (ohne Werkzeuge): Bytes unverändert, keine Cache-Markierung', async () => {
  const roh = JSON.stringify({ model: 'claude-haiku-4-5', max_tokens: 300, system: 'Klassifiziere.', messages: [{ role: 'user', content: 'Rechnung' }] });
  upstreamAntwort = () => new Response('{"id":"msg_x"}', { status: 200, headers: { 'content-type': 'application/json' } });
  const r = await worker.fetch(anfrage(roh), {}, {});
  assert.equal(letzterUpstream.body, roh);
  assert.equal(await r.text(), '{"id":"msg_x"}');
});

await test('Agent ohne Streaming: Stream wird zu vollständiger Nachricht zusammengesetzt', async () => {
  upstreamAntwort = sse(agentStream);
  const r = await worker.fetch(anfrage(agentBody()), {}, {});
  const gesendet = JSON.parse(letzterUpstream.body);
  assert.equal(gesendet.stream, true);
  assert.deepEqual(gesendet.system[0].cache_control, { type: 'ephemeral' });
  assert.deepEqual(gesendet.messages[0].content[0].cache_control, { type: 'ephemeral' });
  assert.equal(r.status, 200);
  assert.equal(r.headers.get('request-id'), 'req_test');
  const text = await r.text();
  assert.match(text, /^ /, 'beginnt mit Puls-Leerzeichen');
  const m = JSON.parse(text); // JSON.parse akzeptiert führende Leerzeichen
  assert.equal(m.stop_reason, 'tool_use');
  assert.deepEqual(m.usage, { input_tokens: 10, cache_creation_input_tokens: 2000, cache_read_input_tokens: 5000, output_tokens: 87 });
  assert.deepEqual(m.content[0], { type: 'thinking', thinking: 'Ich prüfe das Mandat.', signature: 'sig123' });
  assert.deepEqual(m.content[1], { type: 'text', text: 'Ich suche Kandidaten.' });
  assert.deepEqual(m.content[2], { type: 'tool_use', id: 'toolu_1', name: 'Findus_LinkedIn_suchen', input: { such_keywords: 'Country Manager', such_orte: ['München'] } });
});

await test('Fehler vor Stream-Beginn (credit balance, 400) mit echtem Status', async () => {
  const fehler = '{"type":"error","error":{"type":"invalid_request_error","message":"Your credit balance is too low to access the Anthropic API."}}';
  upstreamAntwort = () => new Response(fehler, { status: 400, headers: { 'content-type': 'application/json' } });
  const r = await worker.fetch(anfrage(agentBody()), {}, {});
  assert.equal(r.status, 400);
  assert.equal(await r.text(), fehler);
});

await test('429 und 529 mit echtem Status', async () => {
  for (const status of [429, 529]) {
    upstreamAntwort = () => new Response('{"type":"error"}', { status, headers: { 'content-type': 'application/json' } });
    const r = await worker.fetch(anfrage(agentBody()), {}, {});
    assert.equal(r.status, status);
  }
});

await test('Abbruch mitten im Stream (overloaded): ungültiges JSON mit PROXY-ABBRUCH', async () => {
  upstreamAntwort = sse([agentStream[0], agentStream[7], { type: 'error', error: { type: 'overloaded_error', message: 'Overloaded' } }]);
  const orig = console.error; console.error = () => {};
  const text = await (await worker.fetch(anfrage(agentBody()), {}, {})).text();
  console.error = orig;
  assert.throws(() => JSON.parse(text));
  assert.match(text, /PROXY-ABBRUCH overloaded_error: Overloaded/);
});

await test('Stream endet ohne message_stop: PROXY-ABBRUCH', async () => {
  upstreamAntwort = sse(agentStream.slice(0, 10));
  const orig = console.error; console.error = () => {};
  const text = await (await worker.fetch(anfrage(agentBody()), {}, {})).text();
  console.error = orig;
  assert.throws(() => JSON.parse(text));
  assert.match(text, /PROXY-ABBRUCH Stream ohne message_stop/);
});

await test('Client streamt selbst: Stream unverändert durchgereicht', async () => {
  upstreamAntwort = sse(agentStream);
  const r = await worker.fetch(anfrage({ ...agentBody(), stream: true }), {}, {});
  assert.equal(r.headers.get('content-type'), 'text/event-stream');
  assert.match(await r.text(), /event: message_stop/);
});

await test('count_tokens und GET unverändert durchgereicht', async () => {
  upstreamAntwort = () => new Response('{"input_tokens":12}', { status: 200 });
  const roh = JSON.stringify(agentBody());
  await worker.fetch(anfrage(roh, '/v1/messages/count_tokens'), {}, {});
  assert.equal(letzterUpstream.url, 'https://api.anthropic.com/v1/messages/count_tokens');
});

await test('Höchstens 4 Cache-Markierungen (vorhandene zählen mit)', async () => {
  upstreamAntwort = sse(agentStream);
  const body = agentBody();
  body.tools = [1, 2, 3, 4].map(i => ({ name: 't' + i, input_schema: { type: 'object' }, cache_control: { type: 'ephemeral' } }));
  await (await worker.fetch(anfrage(body), {}, {})).text();
  const gesendet = JSON.parse(letzterUpstream.body);
  assert.equal(typeof gesendet.system, 'string');
  assert.equal(typeof gesendet.messages[0].content, 'string');
});

await test('CPU-Zeit bei großer Antwort (16.000 Tokens als ~5.300 Text-Stücke + Werkzeugaufruf)', async () => {
  const gross = [agentStream[0], { type: 'content_block_start', index: 0, content_block: { type: 'text', text: '' } }];
  for (let i = 0; i < 5300; i++) gross.push({ type: 'content_block_delta', index: 0, delta: { type: 'text_delta', text: 'Kandidat Nr. ' + i + ', ' } });
  gross.push({ type: 'content_block_stop', index: 0 }, { type: 'message_delta', delta: { stop_reason: 'end_turn' }, usage: { output_tokens: 16000 } }, { type: 'message_stop' });
  const enc = new TextEncoder();
  const stuecke = gross.map(e => enc.encode(`event: ${e.type}\ndata: ${JSON.stringify(e)}\n\n`));
  upstreamAntwort = () => new Response(new ReadableStream({ start(c) { for (const s of stuecke) c.enqueue(s); c.close(); } }), { status: 200, headers: { 'content-type': 'text/event-stream' } });
  for (let i = 0; i < 3; i++) await (await worker.fetch(anfrage(agentBody()), {}, {})).text(); // aufwärmen
  const t0 = process.cpuUsage();
  const m = JSON.parse(await (await worker.fetch(anfrage(agentBody()), {}, {})).text());
  const cpu = process.cpuUsage(t0);
  assert.equal(m.usage.output_tokens, 16000);
  console.log(`   CPU gesamt (Worker + Test-Attrappe): ${((cpu.user + cpu.system) / 1000).toFixed(1)} ms`);
});

if (process.argv.includes('--puls')) {
  await test('Puls: Antwortkopf und Leerzeichen kommen sofort, Leerzeichen alle 10 s', async () => {
    upstreamAntwort = sse(agentStream, { verzoegerung: 1500 }); // 17 Ereignisse × 1,5 s ≈ 25 s
    const t0 = Date.now();
    const r = await worker.fetch(anfrage(agentBody()), {}, {});
    const reader = r.body.getReader();
    const dec = new TextDecoder();
    const zeiten = [];
    let text = '';
    for (;;) {
      const { value, done } = await reader.read();
      if (done) break;
      const s = dec.decode(value);
      if (s.trim() === '') zeiten.push(Date.now() - t0);
      text += s;
    }
    const dauer = Date.now() - t0;
    console.log(`   Leerzeichen nach ms: ${zeiten.join(', ')} | Gesamt ${dauer} ms`);
    assert.ok(zeiten[0] < 500, 'erstes Leerzeichen sofort');
    assert.ok(zeiten.length >= 3, 'mindestens 3 Pulse in ~25 s');
    assert.equal(JSON.parse(text).stop_reason, 'tool_use');
    assert.ok(dauer - 17 * 1500 < 1000, 'Schlussantwort ohne Verzögerung');
  });
}

console.log(`\n${ok} Tests bestanden.`);
