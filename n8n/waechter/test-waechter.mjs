// Lokaler Test der Code-Knoten von „PD - Stille-Fehler-Wächter" mit echten Läufen.
// Aufruf: node n8n/waechter/test-waechter.mjs <Ordner mit Testdaten>
// Testdaten (nicht im Repo, enthalten Inhalte): liste.json (GET /executions, 500 Stück) und <id>.json (GET /executions/<id>?includeData=true)
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import assert from 'node:assert/strict';

const ordner = process.argv[2];
const lade = n => JSON.parse(readFileSync(join(ordner, n), 'utf8'));
const code = n => readFileSync(new URL('./' + n, import.meta.url), 'utf8');

// n8n-Umgebung nachbauen
function knoten(quelle, { state, knotenDaten, input }) {
  const $ = name => ({ first: () => knotenDaten[name][0], all: () => knotenDaten[name] });
  const fn = new Function('$getWorkflowStaticData', '$', '$input', quelle);
  return fn(() => state, $, { all: () => input });
}
function lauf({ state, liste, details, jetzt }) {
  const echtesNow = Date.now;
  if (jetzt) Date.now = () => jetzt;
  try {
    const listeItem = [{ json: { data: liste } }];
    const auswahl = knoten(code('auswaehlen.js'), { state, knotenDaten: { 'Läufe auflisten': listeItem } });
    const gelesen = auswahl.map(a => ({ json: a.json.id ? details[a.json.id] : { data: [] } }));
    const aus = knoten(code('auswerten.js'), { state, input: gelesen, knotenDaten: { 'Läufe auflisten': listeItem, 'Auswählen': auswahl } });
    return { auswahl, aus };
  } finally { Date.now = echtesNow; }
}

const volleListe = lade('liste.json');
const ids = ['5673', '5665', '5668', '5661', '5819', '5667', '5822', '5760'];
const details = Object.fromEntries(ids.map(id => [id, lade(id + '.json')]));
let ok = 0;
const test = (name, fn) => { fn(); ok++; console.log('✓', name); };

test('Erster Lauf: merkt sich nur den Stand, meldet keine alten Läufe', () => {
  const state = {};
  const { auswahl } = lauf({ state, liste: volleListe, details, jetzt: Date.parse('2026-09-25T14:05:00Z') });
  assert.equal(auswahl.length, 1); assert.equal(auswahl[0].json.id, null);
  assert.ok(state.geprueft.length > 400);
});

// Zweiter Lauf: die acht Testläufe gelten als neu
const state = {};
lauf({ state, liste: volleListe, details, jetzt: Date.parse('2026-09-25T14:05:00Z') });
state.geprueft = state.geprueft.filter(id => !ids.includes(id));
state.gemeldet = {};
const { auswahl, aus } = lauf({ state, liste: volleListe, details, jetzt: Date.parse('2026-09-25T14:05:00Z') });
const text = aus.length ? aus[0].json.text : '';
console.log('\n--- Meldung ---\n' + text + '\n---------------\n');

test('Nur relevante Workflows werden mit Inhalt gelesen', () => {
  assert.deepEqual(auswahl.map(a => a.json.id).sort(), ids.slice().sort());
});
test('Stilles „credit balance" in CENTCOM still (5673), LinkedIn-Pass (5668), Komponist (5661) gemeldet', () => {
  assert.match(text, /Anthropic-Guthaben leer/);
  for (const n of ['PD - CENTCOM still', 'PD - LinkedIn-Pass', 'PD - Komponist']) assert.match(text, new RegExp(n + '[^\\n]*GUTHABEN'));
});
test('Voicespiegel-Timeout (5665) gemeldet', () => assert.match(text, /PD - Voicespiegel[^\n]*Zeitüberschreitung/));
test('Zitierter Alarmtext in Centcom-Slack-Eingang (5667) wird NICHT gemeldet', () => assert.doesNotMatch(text, /Lauf 5667/));
test('Erfolgreiche Läufe ohne Fehler (5819 Bravo 6, 5822 Centcom, 5760 Postausgang) nicht gemeldet', () => {
  for (const id of ['5819', '5822', '5760']) assert.doesNotMatch(text, new RegExp('Lauf ' + id + '>'));
});
test('Sperre: gleicher Befund innerhalb 6 h nicht noch einmal', () => {
  state.geprueft = state.geprueft.filter(id => !ids.includes(id));
  const zweit = lauf({ state, liste: volleListe, details, jetzt: Date.parse('2026-09-25T15:05:00Z') });
  assert.ok(!zweit.aus.length || !/GUTHABEN/.test(zweit.aus[0].json.text));
});
test('Nicht gelaufen: Klick-Abgleich 13:15 fehlt in gekürzter Liste → gemeldet; mit Liste nicht', () => {
  const st = { geprueft: volleListe.map(e => String(e.id)), gemeldet: {} };
  const ohne = volleListe.filter(e => !(e.workflowId === 'o8dp531ELw35wRQN' && e.startedAt.startsWith('2026-09-25T11:1')));
  const r1 = lauf({ state: st, liste: ohne, details, jetzt: Date.parse('2026-09-25T12:05:00Z') }); // 14:05 Berlin, prüft 12:36–13:35
  assert.match(r1.aus[0].json.text, /\*PD - Klick-Abgleich\* · Zeitplan · \*Nicht gelaufen\* – geplant 25\.09\. 13:15/);
  const st2 = { geprueft: volleListe.map(e => String(e.id)), gemeldet: {} };
  const r2 = lauf({ state: st2, liste: volleListe, details, jetzt: Date.parse('2026-09-25T12:05:00Z') });
  assert.ok(!r2.aus.length || !/Klick-Abgleich · Zeitplan/.test(r2.aus[0].json.text));
});
test('Nichts Neues → keine Slack-Meldung', () => {
  const st = { geprueft: volleListe.map(e => String(e.id)), gemeldet: {} };
  const r = lauf({ state: st, liste: volleListe, details, jetzt: Date.parse('2026-09-25T09:05:00Z') }); // 11:05 Berlin, Fenster 09:36–10:35
  assert.equal(r.aus.length, 0);
});
console.log(`\n${ok} Tests bestanden.`);
