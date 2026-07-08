# Reparatur: Workflow „ORCH - Matchplan - v1" (ID `ayMEcGwaFf5c87TD`)

Beim Import sind drei Dinge verloren gegangen / kaputtgegangen. Bitte per
`update_workflow` (n8n MCP) diese drei Operationen ausführen:

## 1. Credential am Langdock-Node setzen

- Node: **„Markus aufrufen (Langdock)"**
- Credential-Typ: `httpHeaderAuth`
- Credential: **„Header Auth account"** (ID `SEVpdOHkxo9MMQww`)

## 2. Credential am Airtable-Node setzen

- Node: **„Anfrage ins Haupt-Logbuch"**
- Credential-Typ: `airtableTokenApi`
- Credential: **„Airtable Personal Access Token account"** (ID `zWqHnt0xhODSDQ26`)

## 3. jsCode des Nodes „Briefing-Prompt bauen" ERSETZEN

Beim Import wurden die `\"`-Escapes in der `memory`-Zeile zerstört (aus `\"` wurde `"`),
der Code ist dadurch syntaktisch kaputt. Den Parameter `jsCode` komplett durch den
folgenden Code ersetzen (nutzt einfache Anführungszeichen, ist escape-sicher):

```javascript
const rows = $input.all().map(i => i.json).filter(r => r && (r.datum || r.stimmung != null));
const memory = rows.map(r => "- " + r.datum + ": Stimmung " + (r.stimmung ?? "-") + "/5, gefühlt fit " + (r.gefuehlt ?? "-") + "/10" + (r.antwort ? ", Notiz: '" + r.antwort + "'" : "") + (r.anfrage ? ", Anfrage: '" + r.anfrage + "'" : "")).join("\n");
const heute = new Date().toLocaleDateString("sv-SE", { timeZone: "America/Los_Angeles" });
const prompt = "Heute ist " + heute + " (Irvine, Kalifornien). Erstelle Lenards Morgen-Briefing auf Basis seiner aktuellen Whoop-Daten (Recovery, Schlafstunden, Strain von gestern).\n\n" +
  (memory ? "Lenards letzte Abend-Check-ins (privat, nur für dich als Kontext):\n" + memory + "\n\n" : "Es liegen noch keine Abend-Check-ins vor.\n\n") +
  "Antworte AUSSCHLIESSLICH mit einem JSON-Objekt, ohne Markdown, ohne Codeblock, exakt in diesem Format:\n" +
  '{"recovery": <Zahl 0-100 oder null>, "sleepHours": <Zahl oder null>, "sleepGoal": <Zahl oder null>, "strainYesterday": <Zahl oder null>, "text": ["<Absatz 1: Einordnung des heutigen Tages anhand der Whoop-Werte, max. 2 Sätze>", "<Absatz 2: Bezug auf seine letzten Check-ins, zitiere Lenard wörtlich wenn möglich, max. 2 Sätze>"], "todos": []}\n' +
  "Wenn du keinen Zugriff auf aktuelle Whoop-Werte hast, setze die Zahlenfelder auf null und schreibe die Text-Absätze trotzdem. Sprich Lenard direkt mit du an. Ton: Teamkollege, locker, konkret — kein Coach-Sprech, keine Floskeln.";
return [{ json: { prompt: prompt, messageId: "briefing-" + heute + "-" + $execution.id } }];
```

## 4. Danach testen

`GET https://aiva179.app.n8n.cloud/webhook/matchplan-briefing` aufrufen.
Erwartet: JSON mit `recovery`, `sleepHours`, `strainYesterday`, `text[]`, `from: "Markus"`.
Prüfen: Sind die Zahlen echte Whoop-Werte (nicht null)? Wenn null → Markus hat über
die API keinen Whoop-Zugriff; das bitte zurückmelden.

Außerdem: `POST /webhook/matchplan-checkin` mit Body
`{"mood": 4, "felt": 7, "question": "Test", "reflection": "Testeintrag", "request": ""}`
→ erwartet `{"ok": true}` und eine neue Zeile in der Data Table `lenard_logbuch`.
