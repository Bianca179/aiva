// Lokaler Test der Wächter-Zweige für „PD - Verbrauch zählen" mit echten Läufen.
// Aufruf: node n8n/waechter/test-zweige.mjs <Ordner mit Testdaten> (liste.json, <id>.json, optional alle/<id>.json)
import { readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import assert from 'node:assert/strict';

const ordner = process.argv[2];
const lade = n => JSON.parse(readFileSync(join(ordner, n), 'utf8'));
const code = n => readFileSync(new URL('./' + n, import.meta.url), 'utf8');
const NAMEN = { '75lT7ogXUNBDwDwW': 'PD - CENTCOM still (Verteiler)', 'Hw3kgSmYG8zSm8QM': 'PD - Voicespiegel', 'Rii70C8nlIsbSgHC': 'PD - LinkedIn-Pass',
  'OM7PyMRW0YsNUwJ0': 'PD - Komponist', 'SvC6VfroWvcuhAy1': 'PD - Bravo 6 (Rolle)', 'uhJLPwsa8wTFTDAa': 'Centcom', '8LJ0D5YUa1rrAd9n': 'CENTCOM - Postausgangs-Pass v2' };

function knoten(quelle, { state, input, jetzt }) {
  const kd = { 'Workflows lesen': Object.entries(NAMEN).map(([id, name]) => ({ json: { id, name } })) };
  const echt = Date.now; if (jetzt) Date.now = () => jetzt;
  try {
    return new Function('$getWorkflowStaticData', '$', '$input', quelle)(() => state, n => ({ all: () => kd[n], first: () => kd[n][0] }), { all: () => input });
  } finally { Date.now = echt; }
}

let ok = 0;
const test = (name, fn) => { fn(); ok++; console.log('✓', name); };
const ids = ['5673', '5665', '5668', '5661', '5819', '5667', '5822', '5760'];
const laeufe = ids.map(id => ({ json: lade(id + '.json') }));

const state = {};
const aus = knoten(code('zweig-laeufe-pruefen.js'), { state, input: laeufe, jetzt: Date.parse('2026-09-25T14:05:00Z') });
const text = aus.length ? aus[0].json.text : '';
console.log('\n--- Meldung Läufe ---\n' + text + '\n');

test('Stilles credit balance (5673, 5668, 5661) gemeldet', () => {
  for (const n of ['PD - CENTCOM still', 'PD - LinkedIn-Pass', 'PD - Komponist']) assert.match(text, new RegExp(n + '[^\\n]*GUTHABEN'));
});
test('Voicespiegel-Timeout (5665) gemeldet', () => assert.match(text, /PD - Voicespiegel[^\n]*Zeitüberschreitung/));
test('Zitierter Alarmtext (5667) und fehlerfreie Läufe (5819, 5822, 5760) nicht gemeldet', () => {
  for (const id of ['5667', '5819', '5822', '5760']) assert.doesNotMatch(text, new RegExp('Lauf ' + id + '>'));
});
test('Sperre 6 h', () => {
  const zweit = knoten(code('zweig-laeufe-pruefen.js'), { state, input: laeufe, jetzt: Date.parse('2026-09-25T15:05:00Z') });
  assert.equal(zweit.length, 0);
});
test('Keine Eingabe → keine Meldung', () => assert.equal(knoten(code('zweig-laeufe-pruefen.js'), { state: {}, input: [] }).length, 0));

const liste = lade('liste.json').map(json => ({ json }));
test('Zeitplan: Klick-Abgleich 13:15 fehlt → gemeldet', () => {
  const ohne = liste.filter(i => !(i.json.workflowId === 'o8dp531ELw35wRQN' && i.json.startedAt.startsWith('2026-09-25T11:1')));
  const r = knoten(code('zweig-zeitplan-pruefen.js'), { state: {}, input: ohne, jetzt: Date.parse('2026-09-25T12:07:00Z') });
  console.log('\n--- Meldung Zeitplan ---\n' + r[0].json.text + '\n');
  assert.match(r[0].json.text, /\*PD - Klick-Abgleich\* · Zeitplan · \*Nicht gelaufen\* – geplant 25\.09\. 13:15/);
});
test('Zeitplan: alles gelaufen → keine Meldung', () => {
  for (const t of ['2026-09-25T05:07:00Z', '2026-09-25T07:07:00Z', '2026-09-25T11:07:00Z', '2026-09-25T12:07:00Z']) {
    const r = knoten(code('zweig-zeitplan-pruefen.js'), { state: {}, input: liste, jetzt: Date.parse(t) });
    assert.equal(r.length, 0, t + ': ' + (r[0] && r[0].json.text));
  }
});

if (existsSync(join(ordner, 'alle'))) {
  test('Probe über alle heruntergeladenen Läufe: kein Absturz', () => {
    const src = lade('liste.json').filter(e => existsSync(join(ordner, 'alle', e.id + '.json')));
    const alle = src.map(e => ({ json: JSON.parse(readFileSync(join(ordner, 'alle', e.id + '.json'))) }));
    const r = knoten(code('zweig-laeufe-pruefen.js'), { state: {}, input: alle, jetzt: Date.parse('2026-09-25T14:25:00Z') });
    console.log(`   ${alle.length} Läufe geprüft, ${r.length ? r[0].json.text.split('\n').filter(z => z.startsWith('•')).length : 0} Befunde`);
  });
}
console.log(`\n${ok} Tests bestanden.`);
