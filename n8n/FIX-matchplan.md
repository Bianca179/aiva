# Arbeitsauftrag: Live-Whoop-Abruf + englisches Briefing

Workflow: **„ORCH - Matchplan - v1"** (ID `ayMEcGwaFf5c87TD`).
Stand: Credentials-Reparatur und Chat-Verkabelung sind erledigt; der Whoop-OAuth2-Credential
(„Whoop OAuth2") existiert und ist connected. Jetzt fehlt: Live-Abruf der Whoop-Daten und
Umstellung des Briefings auf Englisch. Bitte per `update_workflow` folgende Operationen
ausführen (atomar in 1–2 Aufrufen):

## 1. Drei Live-Abruf-Nodes hinzufügen (HTTP Request v4.4)

Alle drei: `authentication: "genericCredentialType"`, `genericAuthType: "oAuth2Api"`,
`options: { timeout: 15000 }`, Node-Setting `onError: "continueRegularOutput"` (Briefing
darf nicht sterben, wenn Whoop hakt):

| Node-Name | Methode | URL |
|---|---|---|
| `Whoop Recovery (live)` | GET | `https://api.prod.whoop.com/developer/v1/recovery?limit=1` |
| `Whoop Sleep (live)` | GET | `https://api.prod.whoop.com/developer/v1/activity/sleep?limit=1` |
| `Whoop Cycle (live)` | GET | `https://api.prod.whoop.com/developer/v1/cycle?limit=2` |

## 2. Verkabelung ändern

- ENTFERNEN: `Letzte Check-ins` → `Whoop-Werte lesen`
- NEU: `Letzte Check-ins` → `Whoop Recovery (live)` → `Whoop Sleep (live)` →
  `Whoop Cycle (live)` → `Whoop-Werte lesen` (Rest bleibt: → `Briefing-Prompt bauen`)

## 3. jsCode von „Briefing-Prompt bauen" KOMPLETT ersetzen (englischer Prompt + Live-Werte)

```javascript
function firstRecords(nodeName) {
  try {
    const j = $(nodeName).all()[0].json;
    if (j && Array.isArray(j.records) && j.records.length) return j.records;
  } catch (e) {}
  return null;
}
const recRecs = firstRecords('Whoop Recovery (live)');
const sleepRecs = firstRecords('Whoop Sleep (live)');
const cycleRecs = firstRecords('Whoop Cycle (live)');
let live = null;
if (recRecs || sleepRecs || cycleRecs) {
  live = {};
  if (recRecs && recRecs[0].score) {
    live.recovery = Math.round(recRecs[0].score.recovery_score);
    live.hrv = Math.round(recRecs[0].score.hrv_rmssd_milli);
    live.rhr = Math.round(recRecs[0].score.resting_heart_rate);
  }
  if (sleepRecs && sleepRecs[0].score && sleepRecs[0].score.stage_summary) {
    const s = sleepRecs[0].score.stage_summary;
    const ms = (s.total_in_bed_time_milli || 0) - (s.total_awake_time_milli || 0);
    if (ms > 0) live.sleepHours = Math.round(ms / 360000) / 10;
  }
  if (cycleRecs) {
    const prev = cycleRecs.length > 1 ? cycleRecs[1] : cycleRecs[0];
    if (prev.score && prev.score.strain != null) live.strain = Math.round(prev.score.strain * 10) / 10;
    if (cycleRecs.length > 1 && cycleRecs[0].score && cycleRecs[0].score.strain != null) live.strainToday = Math.round(cycleRecs[0].score.strain * 10) / 10;
  }
}
const tableRows = $input.all().map(i => i.json).filter(r => r && r.datum);
const t = tableRows[0] || null;
const w = (live && (live.recovery != null || live.sleepHours != null)) ? live : (t ? { recovery: t.recovery, sleepHours: t.schlaf_stunden, strain: t.strain, hrv: t.hrv, rhr: t.rhr } : null);
const checkRows = $('Letzte Check-ins').all().map(i => i.json).filter(r => r);
const rows = checkRows.filter(r => r.stimmung != null);
const fokusRow = checkRows.find(r => r.fokus && String(r.fokus).trim());
const fokus = fokusRow ? String(fokusRow.fokus).trim() : "";
const memory = rows.map(r => "- " + r.datum + ": mood " + (r.stimmung ?? "-") + "/5, felt fitness " + (r.gefuehlt ?? "-") + "/10" + (r.antwort ? ", note: '" + r.antwort + "'" : "") + (r.anfrage ? ", request: '" + r.anfrage + "'" : "")).join("\n");
const today = new Date().toLocaleDateString("sv-SE", { timeZone: "America/Los_Angeles" });
let whoopBlock;
if (w) {
  whoopBlock = "Lenard's current Whoop data (live): recovery " + (w.recovery ?? "unknown") + " %, sleep last night " + (w.sleepHours ?? "unknown") + " h, strain yesterday " + (w.strain ?? "unknown") + (w.strainToday != null ? ", strain so far today " + w.strainToday : "") + ", HRV " + (w.hrv ?? "unknown") + " ms, resting heart rate " + (w.rhr ?? "unknown") + " bpm.\n\n";
} else {
  whoopBlock = "No Whoop data is currently available.\n\n";
}
const prompt = "Today is " + today + " (Irvine, California). Write Lenard's morning briefing IN ENGLISH.\n\nIMPORTANT: You cannot run any actions or tools in this channel. Do not try, and do not load skills. Use only the values from the context below. If no Whoop values are given, set the number fields to null.\n\n" +
  whoopBlock +
  (fokus ? "Lenard's current weekly focus: '" + fokus + "'.\n\n" : "") +
  (memory ? "Lenard's recent evening check-ins (private, context for you only):\n" + memory + "\n\n" : "No evening check-ins yet.\n\n") +
  "Reply ONLY with a JSON object, no markdown, no code fences, exactly in this format:\n" +
  '{"recovery": <number 0-100 or null>, "sleepHours": <number or null>, "sleepGoal": <number or null>, "strainYesterday": <number or null>, "focus": <"the weekly focus as a string" or null>, "eveningQuestion": "<one short question for the evening check-in today>", "fuel": {"why": "<1 sentence: why this nutrition today, tied to recovery/strain/match plan>", "meals": ["Breakfast: <specific>", "Lunch: <specific>", "Dinner: <specific>"]}, "text": ["<paragraph 1: what today should look like based on the Whoop numbers, max 2 sentences>", "<paragraph 2: tie in the recent check-ins and the weekly focus, quote Lenard verbatim if possible, max 2 sentences>"], "todos": []}\n' +
  "Copy the Whoop numbers from the context into the JSON fields exactly. For eveningQuestion: one single specific question about today (Whoop numbers, recent check-ins or weekly focus), personal and concrete, no generic coach talk, max 15 words. For focus: copy the weekly focus above verbatim, or null if none is known. For fuel: you are also Lenard's nutrition coach, so suggest specific meals that fit recovery, strain and training, no generic tips. Address Lenard directly as you. Tone: teammate, casual, concrete. No coach speak, no fluff. Everything in English.";
return [{ json: { ldMessages: [{ id: "briefing-" + today + "-" + $execution.id, role: "user", parts: [{ type: "text", text: prompt }] }] } }];
```

## 4. In „Briefing parsen" den deutschen Fallback-String ersetzen

`'Briefing konnte gerade nicht geladen werden.'` → `'Briefing is unavailable right now.'`
(nur dieser String, Rest des Codes bleibt.)

## 5. Publish

Draft veröffentlichen (`publish_workflow`).

## 6. Hinweis

Die Credentials der HTTP-Request-Nodes können NICHT per MCP gesetzt werden
(Sicherheitsregel, führt zu 401). Bianca ordnet sie danach in der n8n-UI zu:
- „Markus aufrufen (Langdock)" → Credential **„Header Auth account"**
- die drei „Whoop … (live)"-Nodes → Credential **„Whoop OAuth2"**
Danach erneut publish. Test: `GET /webhook/matchplan-briefing` → JSON mit echten Zahlen.
