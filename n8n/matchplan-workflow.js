// ORCH - Matchplan - v1 — n8n-Workflow-SDK-Code (validiert)
// Backend für Lenards Matchplan-PWA:
//   GET  /webhook/matchplan-briefing  → Morgen-Briefing (Markus/Langdock + Gedächtnis aus lenard_logbuch)
//   POST /webhook/matchplan-checkin   → Abend-Check-in → privates Logbuch (n8n Data Table);
//                                       "Brauchst du was?" zusätzlich ins Haupt-Logbuch (Airtable)
// Voraussetzung: n8n Data Table "lenard_logbuch" mit Spalten
//   datum (string), stimmung (number), gefuehlt (number), frage (string), antwort (string), anfrage (string)
import { workflow, node, trigger, ifElse, expr } from '@n8n/workflow-sdk';

const briefingWebhook = trigger({
  type: 'n8n-nodes-base.webhook',
  version: 2.1,
  config: {
    name: 'GET Briefing',
    parameters: { httpMethod: 'GET', path: 'matchplan-briefing', responseMode: 'responseNode', options: { allowedOrigins: '*' } },
    position: [-600, 0]
  },
  output: [{ query: {}, headers: {}, webhookUrl: 'https://aiva179.app.n8n.cloud/webhook/matchplan-briefing' }]
});

const getCheckins = node({
  type: 'n8n-nodes-base.dataTable',
  version: 1.1,
  config: {
    name: 'Letzte Check-ins',
    alwaysOutputData: true,
    parameters: {
      resource: 'row',
      operation: 'get',
      dataTableId: { __rl: true, mode: 'name', value: 'lenard_logbuch' },
      returnAll: false,
      limit: 7,
      orderBy: true,
      orderByColumn: 'createdAt',
      orderByDirection: 'DESC'
    },
    position: [-380, 0]
  },
  output: [{ id: 1, datum: '2026-07-04', stimmung: 4, gefuehlt: 7, frage: 'Was würde morgen leichter machen?', antwort: 'Mehr Schlaf vor Matchtagen', anfrage: '' }]
});

const buildPrompt = node({
  type: 'n8n-nodes-base.code',
  version: 2,
  config: {
    name: 'Briefing-Prompt bauen',
    parameters: {
      mode: 'runOnceForAllItems',
      jsCode: 'const rows = $input.all().map(i => i.json).filter(r => r && (r.datum || r.stimmung != null));\n' +
        'const memory = rows.map(r => "- " + r.datum + ": Stimmung " + (r.stimmung ?? "-") + "/5, gefühlt fit " + (r.gefuehlt ?? "-") + "/10" + (r.antwort ? ", Notiz: \"" + r.antwort + "\"" : "") + (r.anfrage ? ", Anfrage: \"" + r.anfrage + "\"" : "")).join("\\n");\n' +
        'const heute = new Date().toLocaleDateString("sv-SE", { timeZone: "America/Los_Angeles" });\n' +
        'const prompt = "Heute ist " + heute + " (Irvine, Kalifornien). Erstelle Lenards Morgen-Briefing auf Basis seiner aktuellen Whoop-Daten (Recovery, Schlafstunden, Strain von gestern).\\n\\n" +\n' +
        '  (memory ? "Lenards letzte Abend-Check-ins (privat, nur für dich als Kontext):\\n" + memory + "\\n\\n" : "Es liegen noch keine Abend-Check-ins vor.\\n\\n") +\n' +
        '  "Antworte AUSSCHLIESSLICH mit einem JSON-Objekt, ohne Markdown, ohne Codeblock, exakt in diesem Format:\\n" +\n' +
        '  \'{"recovery": <Zahl 0-100 oder null>, "sleepHours": <Zahl oder null>, "sleepGoal": <Zahl oder null>, "strainYesterday": <Zahl oder null>, "text": ["<Absatz 1: Einordnung des heutigen Tages anhand der Whoop-Werte, max. 2 Sätze>", "<Absatz 2: Bezug auf seine letzten Check-ins, zitiere Lenard wörtlich wenn möglich, max. 2 Sätze>"], "todos": []}\\n\' +\n' +
        '  "Wenn du keinen Zugriff auf aktuelle Whoop-Werte hast, setze die Zahlenfelder auf null und schreibe die Text-Absätze trotzdem. Sprich Lenard direkt mit du an. Ton: Teamkollege, locker, konkret — kein Coach-Sprech, keine Floskeln.";\n' +
        'return [{ json: { prompt: prompt, messageId: "briefing-" + heute + "-" + $execution.id } }];'
    },
    position: [-160, 0]
  },
  output: [{ prompt: 'Heute ist 2026-07-05 …', messageId: 'briefing-2026-07-05-123' }]
});

const callMarkus = node({
  type: 'n8n-nodes-base.httpRequest',
  version: 4.4,
  config: {
    name: 'Markus aufrufen (Langdock)',
    onError: 'continueErrorOutput',
    parameters: {
      method: 'POST',
      url: 'https://api.langdock.com/agent/v1/chat/completions',
      authentication: 'genericCredentialType',
      genericAuthType: 'httpHeaderAuth',
      sendBody: true,
      specifyBody: 'json',
      jsonBody: expr('{{ JSON.stringify({ agentId: "1f5336d8-7ccd-4a78-968f-80d1427ce588", messages: [{ id: $json.messageId, role: "user", parts: [{ type: "text", text: $json.prompt }] }] }) }}'),
      options: { timeout: 95000 }
    },
    credentials: { httpHeaderAuth: { id: 'SEVpdOHkxo9MMQww', name: 'Header Auth account' } },
    position: [60, 0]
  },
  output: [{ messages: [{ role: 'assistant', content: '{"recovery": 61, "sleepHours": 7.4, "sleepGoal": 8.5, "strainYesterday": 14.2, "text": ["…"], "todos": []}' }] }]
});

const parseBriefing = node({
  type: 'n8n-nodes-base.code',
  version: 2,
  config: {
    name: 'Briefing parsen',
    parameters: {
      mode: 'runOnceForAllItems',
      jsCode: 'const resp = $input.all()[0].json;\n' +
        'let content = resp.messages && resp.messages[0] ? resp.messages[0].content : (resp.output ?? "");\n' +
        'if (Array.isArray(content)) content = content.map(c => c.text ?? "").join("");\n' +
        'let b = null;\n' +
        'const m = String(content).match(/\\{[\\s\\S]*\\}/);\n' +
        'if (m) { try { b = JSON.parse(m[0]); } catch (e) {} }\n' +
        'if (!b || !Array.isArray(b.text)) b = { recovery: null, sleepHours: null, sleepGoal: null, strainYesterday: null, text: [String(content).slice(0, 600) || "Briefing konnte gerade nicht geladen werden."], todos: [] };\n' +
        'b.from = "Markus";\n' +
        'b.generatedAt = new Date().toISOString();\n' +
        'return [{ json: b }];'
    },
    position: [280, 0]
  },
  output: [{ recovery: 61, sleepHours: 7.4, sleepGoal: 8.5, strainYesterday: 14.2, text: ['…'], todos: [], from: 'Markus', generatedAt: '2026-07-05T13:00:00.000Z' }]
});

const respondBriefing = node({
  type: 'n8n-nodes-base.respondToWebhook',
  version: 1.5,
  config: {
    name: 'Briefing senden',
    parameters: {
      respondWith: 'firstIncomingItem',
      options: { responseHeaders: { entries: [{ name: 'Access-Control-Allow-Origin', value: '*' }] } }
    },
    position: [500, 0]
  }
});

const respondBriefingError = node({
  type: 'n8n-nodes-base.respondToWebhook',
  version: 1.5,
  config: {
    name: 'Briefing-Fehler senden',
    parameters: {
      respondWith: 'json',
      responseBody: '{ "error": "briefing_failed" }',
      options: { responseCode: 502, responseHeaders: { entries: [{ name: 'Access-Control-Allow-Origin', value: '*' }] } }
    },
    position: [280, 220]
  }
});

const checkinWebhook = trigger({
  type: 'n8n-nodes-base.webhook',
  version: 2.1,
  config: {
    name: 'POST Check-in',
    parameters: { httpMethod: 'POST', path: 'matchplan-checkin', responseMode: 'responseNode', options: { allowedOrigins: '*' } },
    position: [-600, 460]
  },
  output: [{ body: { date: '2026-07-05', mood: 4, felt: 7, question: 'Was würde morgen leichter machen?', reflection: 'Frühes Schlafengehen', request: 'Neue Griffbänder' } }]
});

const normalizeCheckin = node({
  type: 'n8n-nodes-base.code',
  version: 2,
  config: {
    name: 'Check-in normalisieren',
    parameters: {
      mode: 'runOnceForAllItems',
      jsCode: 'const raw = $input.all()[0].json;\n' +
        'const b = raw.body ?? raw;\n' +
        'const heute = new Date().toLocaleDateString("sv-SE", { timeZone: "America/Los_Angeles" });\n' +
        'return [{ json: {\n' +
        '  datum: String(b.date ?? heute),\n' +
        '  stimmung: b.mood != null ? Number(b.mood) : null,\n' +
        '  gefuehlt: b.felt != null ? Number(b.felt) : null,\n' +
        '  frage: String(b.question ?? ""),\n' +
        '  antwort: String(b.reflection ?? ""),\n' +
        '  anfrage: String(b.request ?? "")\n' +
        '} }];'
    },
    position: [-380, 460]
  },
  output: [{ datum: '2026-07-05', stimmung: 4, gefuehlt: 7, frage: 'Was würde morgen leichter machen?', antwort: 'Frühes Schlafengehen', anfrage: 'Neue Griffbänder' }]
});

const insertCheckin = node({
  type: 'n8n-nodes-base.dataTable',
  version: 1.1,
  config: {
    name: 'Check-in speichern',
    parameters: {
      resource: 'row',
      operation: 'insert',
      dataTableId: { __rl: true, mode: 'name', value: 'lenard_logbuch' },
      columns: {
        mappingMode: 'defineBelow',
        value: {
          datum: expr('{{ $json.datum }}'),
          stimmung: expr('{{ $json.stimmung }}'),
          gefuehlt: expr('{{ $json.gefuehlt }}'),
          frage: expr('{{ $json.frage }}'),
          antwort: expr('{{ $json.antwort }}'),
          anfrage: expr('{{ $json.anfrage }}')
        },
        schema: [
          { id: 'datum', displayName: 'datum', required: false, defaultMatch: false, display: true, type: 'string', canBeUsedToMatch: true },
          { id: 'stimmung', displayName: 'stimmung', required: false, defaultMatch: false, display: true, type: 'number', canBeUsedToMatch: false },
          { id: 'gefuehlt', displayName: 'gefuehlt', required: false, defaultMatch: false, display: true, type: 'number', canBeUsedToMatch: false },
          { id: 'frage', displayName: 'frage', required: false, defaultMatch: false, display: true, type: 'string', canBeUsedToMatch: false },
          { id: 'antwort', displayName: 'antwort', required: false, defaultMatch: false, display: true, type: 'string', canBeUsedToMatch: false },
          { id: 'anfrage', displayName: 'anfrage', required: false, defaultMatch: false, display: true, type: 'string', canBeUsedToMatch: false }
        ]
      }
    },
    position: [-160, 460]
  },
  output: [{ id: 1, createdAt: '2026-07-05T20:00:00.000Z', updatedAt: '2026-07-05T20:00:00.000Z' }]
});

const respondCheckinOk = node({
  type: 'n8n-nodes-base.respondToWebhook',
  version: 1.5,
  config: {
    name: 'Check-in bestätigen',
    parameters: {
      respondWith: 'json',
      responseBody: '{ "ok": true }',
      options: { responseHeaders: { entries: [{ name: 'Access-Control-Allow-Origin', value: '*' }] } }
    },
    position: [60, 460]
  }
});

const hasRequest = ifElse({
  version: 2.3,
  config: {
    name: 'Anfrage vorhanden?',
    parameters: {
      conditions: {
        options: { caseSensitive: true, leftValue: '', typeValidation: 'strict', version: 2 },
        conditions: [{ leftValue: expr("{{ $('Check-in normalisieren').item.json.anfrage }}"), operator: { type: 'string', operation: 'notEmpty' }, rightValue: '' }],
        combinator: 'and'
      }
    },
    position: [280, 460]
  }
});

const logRequest = node({
  type: 'n8n-nodes-base.airtable',
  version: 2.2,
  config: {
    name: 'Anfrage ins Haupt-Logbuch',
    parameters: {
      resource: 'record',
      operation: 'create',
      base: { __rl: true, mode: 'id', value: 'app9r4BK5FJTU219P' },
      table: { __rl: true, mode: 'id', value: 'tblkp0LVz3voBPEhr' },
      columns: {
        mappingMode: 'defineBelow',
        value: {
          Inhalt: expr("Lenard braucht: {{ $('Check-in normalisieren').item.json.anfrage }} (via Matchplan-Check-in)"),
          Datum: expr('{{ $today.toFormat("yyyy-MM-dd") }}'),
          Quelle: 'Lenard (Matchplan)',
          Typ: 'Stufe-1-Aktion'
        }
      },
      options: { typecast: true }
    },
    credentials: { airtableTokenApi: { id: 'zWqHnt0xhODSDQ26', name: 'Airtable Personal Access Token account' } },
    position: [500, 460]
  },
  output: [{ id: 'recXXXXXXXXXXXXXX' }]
});

export default workflow('matchplan-v1', 'ORCH - Matchplan - v1')
  .add(briefingWebhook)
  .to(getCheckins)
  .to(buildPrompt)
  .to(callMarkus
    .onError(respondBriefingError))
  .to(parseBriefing)
  .to(respondBriefing)
  .add(checkinWebhook)
  .to(normalizeCheckin)
  .to(insertCheckin)
  .to(respondCheckinOk)
  .to(hasRequest
    .onTrue(logRequest));
