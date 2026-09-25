// PD - Verbrauch zählen · Wächter-Zweig „Wächter: Läufe prüfen" (P4.1)
// Hängt hinter „Lauf lesen" und prüft dieselben Läufe, die der Zähler ohnehin lädt — kein eigener Download.
// Strukturelle Prüfung: Knotenfehler, json.error bei „weitermachen", Anthropic-Fehlerantwort bei neverError,
// leere Agenten-Antwort. Kein Textsuchen im ganzen Lauf (zitierte Alarmtexte würden sonst gemeldet).
// Gleiche Kombination Workflow + Kategorie höchstens alle 6 Stunden. Kein KI-Modell.

const BASIS = 'https://rhineshore.app.n8n.cloud';
const SPERRE_MS = 6 * 3600 * 1000;
// Workflows ohne Fehler-Workflow: dort meldet der Wächter auch rote Läufe mit sonstigen Fehlern
const OHNE_FEHLERALARM = new Set(['3mTqQ3zOAnqoMERh', '8LzkOa0iFOKfThsR', 'TWrqGjacJgpfkk1A', 'VufJGSTnRHFRPUDg', 'sC0Oha2cKFcTCjgw']);

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

function fehlerAusLauf(ex, name) {
  const funde = [];
  const rd = (ex.data && ex.data.resultData) || {};
  const runData = rd.runData || {};
  const still = ex.status === 'success';
  const gesehen = new Set();
  const neu = (knoten, text, code) => {
    const kat = kategorie(text, code);
    const melden = kat || still || OHNE_FEHLERALARM.has(ex.workflowId);
    const k = kat || 'Sonstiger Knotenfehler';
    if (!melden || gesehen.has(k)) return;
    gesehen.add(k);
    funde.push({ workflowId: ex.workflowId, workflow: name, knoten, kategorie: k, still,
      text: String(text || '').replace(/\s+/g, ' ').slice(0, 160), lauf: String(ex.id) });
  };
  for (const [knoten, runs] of Object.entries(runData)) {
    // Selbst geheilt: gelingt derselbe Knoten später im selben Lauf (z. B. Werkzeug-Rückfrage „Mehrdeutig … bitte
    // mit Record-ID erneut aufrufen"), ist ein früherer Fehler dort kein stiller Ausfall — außer bei Anthropic-Kategorien.
    const geheilt = (runs || []).some(r => !r.error);
    for (const run of runs || []) {
      if (run.error && geheilt && !kategorie([run.error.message, run.error.description].join(' '), run.error.httpCode)) continue;
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
  if (ex.status === 'success' && antwort && antwort.length) {
    const letzte = antwort[antwort.length - 1];
    const j = (((letzte.data || {}).main || [])[0] || [])[0];
    const txt = j && j.json ? (j.json.text ?? j.json.output ?? j.json.antwort) : undefined;
    if (!j || typeof txt !== 'string' || !txt.trim()) {
      funde.push({ workflowId: ex.workflowId, workflow: name, knoten: 'Antwort zurueckgeben', kategorie: 'Leere Agenten-Antwort', still: true, text: '', lauf: String(ex.id) });
    }
  }
  return funde;
}

// ---- Hauptteil ----
const state = $getWorkflowStaticData('global');
state.gemeldet = state.gemeldet || {};
const jetzt = Date.now();
const namen = {};
for (const i of $('Workflows lesen').all()) namen[i.json.id] = i.json.name;

let funde = [];
for (const i of $input.all()) {
  const ex = i.json;
  if (!ex || !ex.id) continue;
  funde = funde.concat(fehlerAusLauf(ex, namen[ex.workflowId] || ex.workflowId));
}

for (const [k, t] of Object.entries(state.gemeldet)) if (jetzt - t > 48 * 3600 * 1000) delete state.gemeldet[k];
const zuMelden = funde.filter(f => {
  const k = f.workflowId + '|' + f.kategorie;
  if (state.gemeldet[k] && jetzt - state.gemeldet[k] < SPERRE_MS) return false;
  state.gemeldet[k] = jetzt;
  return true;
});
if (!zuMelden.length) return [];

const zeile = f => `• *${f.workflow}* · ${f.knoten} · *${f.kategorie}*${f.still ? ' (Lauf stand auf „erfolgreich")' : ''}` +
  (f.text ? ` – ${f.text}` : '') + ` – <${BASIS}/workflow/${f.workflowId}/executions/${f.lauf}|Lauf ${f.lauf}>`;
const guthaben = zuMelden.some(f => f.kategorie === 'GUTHABEN');
let text = (guthaben ? ':moneybag: *Anthropic-Guthaben leer* (Konto „Anthropic Rhineshore") – Agenten antworten nicht, bis aufgeladen ist.\n' : '') +
  `:mag: *Stille-Fehler-Wächter* – ${zuMelden.length} Befund${zuMelden.length === 1 ? '' : 'e'}\n` + zuMelden.map(zeile).join('\n');
if (text.length > 3500) text = text.slice(0, 3450) + '\n… (gekürzt)';
return [{ json: { text } }];
