// Ben — Durchreiche-Server.
//
// Der Server hält nichts. Er nimmt den Verlauf entgegen, den der Browser
// mitschickt, ruft die Anthropic-API auf, streamt die Antwort zurück und
// vergisst alles, sobald die Antwort durch ist. Es gibt keine Datenbank,
// keine Sitzung, keine Datei, in die Gesprächsinhalte geschrieben werden.

import http from "node:http";
import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import { fileURLToPath } from "node:url";
import Anthropic from "@anthropic-ai/sdk";

const wurzel = path.dirname(fileURLToPath(import.meta.url));
const oeffentlich = path.join(wurzel, "public");

const konfig = {
  port: Number(process.env.PORT || 8080),
  zugangscode: process.env.ZUGANGSCODE || "",
  modell: process.env.ANTHROPIC_MODEL || "claude-opus-5",
  maxTokens: Number(process.env.MAX_TOKENS || 16000),
  aufwand: process.env.EFFORT || "low",
  // Ab hier wird der Verlauf abgebrochen statt still gekürzt. Rund 120.000
  // Tokens; deutscher Text liegt bei etwa 3,3 Zeichen je Token.
  maxZeichen: Number(process.env.MAX_VERLAUF_ZEICHEN || 400000),
  agentName: process.env.AGENT_NAME || "",
  klientName: process.env.KLIENT_NAME || "",
  partnerinName: process.env.PARTNERIN_NAME || "",
};

if (!process.env.ANTHROPIC_API_KEY) {
  console.error("ANTHROPIC_API_KEY fehlt. Ohne Schlüssel kann Ben nicht antworten.");
  process.exit(1);
}
// Ohne ZUGANGSCODE ist die App offen erreichbar. Das ist eine bewusste
// Möglichkeit, keine Panne — dann ist die Adresse selbst die einzige Hürde.
const offen = !konfig.zugangscode;

// --- Systemprompt ---------------------------------------------------------
// prompt.md enthält den Text der Coachin wörtlich. Namen werden nur ersetzt,
// wenn die passenden Umgebungsvariablen gesetzt sind; sonst bleibt die Datei
// unverändert, wie sie auf der Platte liegt.

function systempromptLaden() {
  let text = fs.readFileSync(path.join(wurzel, "prompt.md"), "utf8");
  if (konfig.agentName) text = text.replace(/\bBen\b/g, konfig.agentName);
  if (konfig.klientName) text = text.replace(/\bMarc(s?)\b/g, `${konfig.klientName}$1`);
  if (konfig.partnerinName) text = text.replace(/\bSophie\b/g, konfig.partnerinName);
  return text;
}

const systemprompt = systempromptLaden();
const namen = {
  agent: konfig.agentName || "Ben",
  klient: konfig.klientName || "Marc",
};

const anthropic = new Anthropic({
  // Der Prototyp lief in Timeouts und gab bei 429 sofort auf. Vier Versuche
  // mit exponentiellem Backoff übernimmt das SDK, zehn Minuten Zeitfenster
  // reichen auch für die lange Abschluss-Zusammenfassung.
  maxRetries: 4,
  timeout: 600000,
});

// --- Zugang ---------------------------------------------------------------

const codeDigest = offen ? null : crypto.createHash("sha256").update(konfig.zugangscode).digest();

function codeStimmt(eingabe) {
  if (offen) return true;
  if (typeof eingabe !== "string" || eingabe.length === 0) return false;
  const digest = crypto.createHash("sha256").update(eingabe).digest();
  return crypto.timingSafeEqual(digest, codeDigest);
}

// --- HTTP-Grundlagen ------------------------------------------------------

const MIME = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".svg": "image/svg+xml",
  ".ico": "image/x-icon",
};

const CSP = [
  "default-src 'self'",
  "script-src 'self'",
  "style-src 'self'",
  "img-src 'self' data:",
  "connect-src 'self'",
  "base-uri 'none'",
  "form-action 'none'",
  "frame-ancestors 'none'",
].join("; ");

function grundkopfzeilen(res) {
  res.setHeader("Content-Security-Policy", CSP);
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("Referrer-Policy", "no-referrer");
  res.setHeader("Cross-Origin-Opener-Policy", "same-origin");
}

function jsonAntwort(res, status, objekt) {
  const koerper = JSON.stringify(objekt);
  res.writeHead(status, {
    "Content-Type": "application/json; charset=utf-8",
    "Cache-Control": "no-store",
  });
  res.end(koerper);
}

const MAX_KOERPER = 4 * 1024 * 1024;

function koerperLesen(req) {
  return new Promise((erfuellen, ablehnen) => {
    const teile = [];
    let laenge = 0;
    req.on("data", (stueck) => {
      laenge += stueck.length;
      if (laenge > MAX_KOERPER) {
        ablehnen(new Error("zu-gross"));
        req.destroy();
        return;
      }
      teile.push(stueck);
    });
    req.on("end", () => {
      try {
        erfuellen(JSON.parse(Buffer.concat(teile).toString("utf8")));
      } catch {
        ablehnen(new Error("kein-json"));
      }
    });
    req.on("error", ablehnen);
  });
}

// --- Statische Dateien ----------------------------------------------------

function statischAusliefern(req, res, urlPfad) {
  const relativ = urlPfad === "/" ? "index.html" : decodeURIComponent(urlPfad).replace(/^\/+/, "");
  const ziel = path.resolve(oeffentlich, relativ);
  if (ziel !== oeffentlich && !ziel.startsWith(oeffentlich + path.sep)) {
    res.writeHead(403).end();
    return;
  }
  fs.readFile(ziel, (fehler, inhalt) => {
    if (fehler) {
      res.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
      res.end("Nicht gefunden.");
      return;
    }
    const endung = path.extname(ziel);
    res.writeHead(200, {
      "Content-Type": MIME[endung] || "application/octet-stream",
      // Der Verlauf steht nicht in diesen Dateien, aber die Seite soll auf
      // einem geteilten Gerät nicht aus dem Cache wieder auftauchen.
      "Cache-Control": endung === ".html" ? "no-store" : "public, max-age=3600",
    });
    res.end(inhalt);
  });
}

// --- Gespräch -------------------------------------------------------------

function verlaufPruefen(verlauf) {
  if (!Array.isArray(verlauf) || verlauf.length === 0) return "Kein Verlauf übergeben.";
  let zeichen = 0;
  for (const eintrag of verlauf) {
    if (!eintrag || (eintrag.role !== "user" && eintrag.role !== "assistant")) {
      return "Verlauf hat eine unbekannte Form.";
    }
    if (typeof eintrag.content !== "string" || eintrag.content.length === 0) {
      return "Verlauf hat eine unbekannte Form.";
    }
    zeichen += eintrag.content.length;
  }
  if (verlauf[0].role !== "user") return "Der Verlauf muss mit einer Nachricht von dir beginnen.";
  if (zeichen > konfig.maxZeichen) return "zu-lang";
  return null;
}

function nachrichtenBauen(verlauf) {
  return verlauf.map(({ role, content }, i) => {
    const block = { type: "text", text: content };
    if (i === verlauf.length - 1) block.cache_control = { type: "ephemeral", ttl: "1h" };
    return { role, content: [block] };
  });
}

async function gespraechFuehren(req, res) {
  let koerper;
  try {
    koerper = await koerperLesen(req);
  } catch (fehler) {
    jsonAntwort(res, 400, {
      fehler: fehler.message === "zu-gross" ? "Die Anfrage ist zu groß." : "Die Anfrage war unlesbar.",
    });
    return;
  }

  if (!codeStimmt(koerper.code)) {
    jsonAntwort(res, 401, { fehler: "Der Zugangscode stimmt nicht." });
    return;
  }

  const problem = verlaufPruefen(koerper.verlauf);
  if (problem === "zu-lang") {
    jsonAntwort(res, 413, {
      fehler:
        "Das Gespräch ist so lang geworden, dass es nicht mehr vollständig übertragen werden kann. " +
        "Sichere es bitte als PDF und sag der Coachin Bescheid — abschneiden würde bedeuten, dass " +
        `${namen.agent} übersprungene Themen verliert.`,
    });
    return;
  }
  if (problem) {
    jsonAntwort(res, 400, { fehler: problem });
    return;
  }

  res.writeHead(200, {
    "Content-Type": "application/x-ndjson; charset=utf-8",
    "Cache-Control": "no-store",
    "X-Accel-Buffering": "no",
  });

  const zeile = (objekt) => {
    if (!res.writableEnded) res.write(JSON.stringify(objekt) + "\n");
  };

  let etwasGesendet = false;
  try {
    const stream = anthropic.messages.stream({
      model: konfig.modell,
      max_tokens: konfig.maxTokens,
      // Zwei Cache-Punkte: der Prompt (rund 5.000 Tokens, ändert sich nie)
      // und das Ende des bisherigen Verlaufs, das beim nächsten Zug gelesen
      // wird. Eine Stunde Haltbarkeit statt der üblichen fünf Minuten — er
      // denkt zwischen zwei Antworten oft länger nach, und ein abgelaufener
      // Cache macht genau diese Pausen teuer.
      system: [
        { type: "text", text: systemprompt, cache_control: { type: "ephemeral", ttl: "1h" } },
      ],
      output_config: { effort: konfig.aufwand },
      messages: nachrichtenBauen(koerper.verlauf),
    });

    for await (const ereignis of stream) {
      if (ereignis.type === "content_block_delta" && ereignis.delta.type === "text_delta") {
        etwasGesendet = true;
        zeile({ text: ereignis.delta.text });
      }
    }

    const nachricht = await stream.finalMessage();
    if (nachricht.stop_reason === "max_tokens") {
      zeile({ hinweis: "Die Antwort wurde abgeschnitten. Schreib „bitte weiter“, damit es weitergeht." });
    }
    zeile({ fertig: true });
  } catch (fehler) {
    // Absichtlich ohne Inhalt: geloggt wird die Fehlerklasse, nie der Verlauf.
    console.error("Anthropic-Aufruf fehlgeschlagen:", fehler?.status ?? "", fehler?.name ?? "Fehler");
    zeile({ fehler: fehlertextFuer(fehler), abgebrochen: etwasGesendet });
  } finally {
    res.end();
  }
}

function fehlertextFuer(fehler) {
  const status = fehler?.status;
  if (status === 401 || status === 403) {
    return "Der API-Schlüssel wird nicht akzeptiert. Das muss die Coachin prüfen lassen.";
  }
  if (status === 429) {
    return "Gerade sind zu viele Anfragen unterwegs. Warte einen Moment und sende erneut.";
  }
  if (status >= 500) {
    return "Der Dienst antwortet gerade nicht. Deine Antwort ist gespeichert — versuch es gleich noch einmal.";
  }
  return "Die Verbindung ist abgerissen. Deine Antwort ist gespeichert — versuch es noch einmal.";
}

// --- Server ---------------------------------------------------------------

const server = http.createServer((req, res) => {
  grundkopfzeilen(res);
  const urlPfad = new URL(req.url, "http://localhost").pathname;

  if (req.method === "POST" && urlPfad === "/api/zugang") {
    koerperLesen(req)
      .then((koerper) => {
        if (codeStimmt(koerper.code)) jsonAntwort(res, 200, { ok: true, offen, namen });
        else jsonAntwort(res, 401, { fehler: "Der Zugangscode stimmt nicht." });
      })
      .catch(() => jsonAntwort(res, 400, { fehler: "Die Anfrage war unlesbar." }));
    return;
  }

  if (req.method === "POST" && urlPfad === "/api/chat") {
    gespraechFuehren(req, res);
    return;
  }

  if (req.method === "GET" || req.method === "HEAD") {
    statischAusliefern(req, res, urlPfad);
    return;
  }

  res.writeHead(405).end();
});

server.listen(konfig.port, () => {
  console.log(`Ben läuft auf Port ${konfig.port} (Modell ${konfig.modell}).`);
  if (offen) {
    console.log("Kein ZUGANGSCODE gesetzt — wer die Adresse kennt, kommt rein.");
  }
});
