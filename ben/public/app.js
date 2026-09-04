// Alles, was Marc schreibt, bleibt in diesem Browser. Der Server bekommt den
// Verlauf nur zu sehen, solange er eine Antwort erzeugt, und behält nichts.

import { alsPdfSichern, alsTextSichern } from "/export.js";

const SCHLUESSEL = {
  verlauf: "ben.verlauf",
  entwurf: "ben.entwurf",
  code: "ben.code",
  begonnen: "ben.begonnen",
};

const KICKOFF = "Lass uns anfangen.";

const el = {
  schwelle: document.getElementById("schwelle"),
  zugangForm: document.getElementById("zugang-form"),
  zugangFeld: document.getElementById("zugang-feld"),
  zugangKnopf: document.getElementById("zugang-knopf"),
  zugangFehler: document.getElementById("zugang-fehler"),
  anwendung: document.getElementById("anwendung"),
  dateizeile: document.getElementById("dateizeile"),
  verlauf: document.getElementById("verlauf"),
  eingabeForm: document.getElementById("eingabe-form"),
  eingabeFeld: document.getElementById("eingabe-feld"),
  sendenKnopf: document.getElementById("senden-knopf"),
  pdfKnopf: document.getElementById("pdf-knopf"),
  txtKnopf: document.getElementById("txt-knopf"),
  loeschenKnopf: document.getElementById("loeschen-knopf"),
};

let verlauf = [];
let namen = { agent: "Ben", klient: "Marc" };
let code = "";
let laeuft = false;

// --- Speicher -------------------------------------------------------------

function lesen(schluessel, ersatz) {
  try {
    const roh = localStorage.getItem(schluessel);
    return roh === null ? ersatz : JSON.parse(roh);
  } catch {
    return ersatz;
  }
}

function schreiben(schluessel, wert) {
  try {
    localStorage.setItem(schluessel, JSON.stringify(wert));
  } catch {
    // Voller oder gesperrter Speicher. Das Gespräch läuft weiter, es wird
    // nur nicht mehr gesichert — dafür gibt es die Zeile unten im Verlauf.
    speicherWarnung();
  }
}

let warnungGezeigt = false;
function speicherWarnung() {
  if (warnungGezeigt) return;
  warnungGezeigt = true;
  const p = document.createElement("p");
  p.className = "beitrag beitrag-fehler";
  p.textContent =
    "Dieser Browser kann das Gespräch gerade nicht speichern (privates Fenster oder voller Speicher). " +
    "Sichere es als PDF, bevor du den Tab schließt.";
  el.verlauf.append(p);
}

function verlaufSichern() {
  schreiben(SCHLUESSEL.verlauf, verlauf);
}

// --- Darstellung ----------------------------------------------------------

function absaetzeSetzen(behaelter, text) {
  behaelter.replaceChildren();
  for (const stueck of text.split(/\n{2,}/)) {
    const p = document.createElement("p");
    const zeilen = stueck.split("\n");
    zeilen.forEach((zeile, i) => {
      if (i > 0) p.append(document.createElement("br"));
      p.append(document.createTextNode(zeile));
    });
    behaelter.append(p);
  }
}

function zeichnen() {
  el.verlauf.replaceChildren();
  for (const eintrag of verlauf) {
    if (eintrag.verborgen) continue;

    const block = document.createElement("div");
    block.className = "beitrag " + (eintrag.rolle === "assistant" ? "beitrag-ben" : "beitrag-klient");

    if (eintrag.rolle === "assistant" && !eintrag.text) {
      block.classList.add("wartet");
      block.append(document.createElement("p"));
    } else {
      absaetzeSetzen(block, eintrag.text);
    }
    el.verlauf.append(block);

    if (eintrag.fehler) {
      const zeile = document.createElement("p");
      zeile.className = "beitrag-fehler";
      zeile.append(document.createTextNode(eintrag.fehler + " "));
      const knopf = document.createElement("button");
      knopf.type = "button";
      knopf.textContent = "Erneut senden";
      knopf.addEventListener("click", () => {
        delete eintrag.fehler;
        verlaufSichern();
        zeichnen();
        benFragen();
      });
      zeile.append(knopf);
      el.verlauf.append(zeile);
    }
  }

  if (verlauf.every((e) => e.verborgen)) {
    const p = document.createElement("p");
    p.className = "leerzeile";
    p.textContent = "Einen Moment.";
    el.verlauf.append(p);
  }
}

let letzterBlock = null;

function nachUntenRollen(erzwingen = false) {
  const abstand = document.documentElement.scrollHeight - window.scrollY - window.innerHeight;
  if (erzwingen || abstand < 240) {
    window.scrollTo({ top: document.documentElement.scrollHeight });
  }
}

// --- Gespräch -------------------------------------------------------------

function sendbaresVerlauf() {
  return verlauf
    .filter((e) => e.text)
    .map((e) => ({ role: e.rolle, content: e.text }));
}

async function benFragen() {
  if (laeuft) return;
  laeuft = true;
  el.sendenKnopf.disabled = true;

  const antwort = { rolle: "assistant", text: "" };
  verlauf.push(antwort);
  zeichnen();
  nachUntenRollen(true);

  // Der eben gezeichnete Ben-Block, damit beim Streamen nicht der ganze
  // Verlauf neu aufgebaut werden muss.
  const bloecke = el.verlauf.querySelectorAll(".beitrag-ben");
  letzterBlock = bloecke[bloecke.length - 1] || null;

  let fehlertext = null;

  try {
    const res = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code, verlauf: sendbaresVerlauf() }),
    });

    if (!res.ok) {
      let nachricht = "Der Server hat die Anfrage abgelehnt.";
      try {
        const daten = await res.json();
        if (daten.fehler) nachricht = daten.fehler;
      } catch { /* Antwort ohne JSON */ }
      if (res.status === 401) {
        verlauf.pop();
        zeichnen();
        zugangVerloren();
        return;
      }
      throw new Error(nachricht);
    }

    const leser = res.body.getReader();
    const dekoder = new TextDecoder();
    let rest = "";

    for (;;) {
      const { done, value } = await leser.read();
      if (done) break;
      rest += dekoder.decode(value, { stream: true });
      const zeilen = rest.split("\n");
      rest = zeilen.pop();

      for (const zeile of zeilen) {
        if (!zeile.trim()) continue;
        let daten;
        try {
          daten = JSON.parse(zeile);
        } catch {
          continue;
        }
        if (daten.text) {
          antwort.text += daten.text;
          if (letzterBlock) {
            letzterBlock.classList.remove("wartet");
            absaetzeSetzen(letzterBlock, antwort.text);
          }
          nachUntenRollen();
        } else if (daten.hinweis) {
          antwort.text += "\n\n" + daten.hinweis;
        } else if (daten.fehler) {
          fehlertext = daten.fehler;
        }
      }
    }

    if (!fehlertext && !antwort.text) {
      fehlertext = "Es kam keine Antwort zurück. Versuch es noch einmal.";
    }
  } catch (fehler) {
    fehlertext = fehler.message || "Die Verbindung ist abgerissen. Versuch es noch einmal.";
  } finally {
    laeuft = false;
    el.sendenKnopf.disabled = false;
  }

  if (fehlertext) {
    // Eine halbe Frage ist schlechter als keine — der Rumpf fliegt raus.
    // Seine eigene Antwort davor bleibt selbstverständlich stehen.
    verlauf.pop();
    const letzte = verlauf[verlauf.length - 1];
    if (letzte) letzte.fehler = fehlertext;
  }

  verlaufSichern();
  zeichnen();
  nachUntenRollen();
}

function senden(text) {
  const sauber = text.trim();
  if (!sauber || laeuft) return;
  verlauf.push({ rolle: "user", text: sauber });
  // Zuerst sichern, dann senden. Fällt danach irgendetwas aus, ist seine
  // Antwort trotzdem schon auf der Platte.
  verlaufSichern();
  el.eingabeFeld.value = "";
  entwurfSichern();
  hoeheAnpassen();
  zeichnen();
  nachUntenRollen(true);
  benFragen();
}

// --- Zugang ---------------------------------------------------------------

async function zugangPruefen(eingabe) {
  const res = await fetch("/api/zugang", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ code: eingabe }),
  });
  if (!res.ok) return null;
  const daten = await res.json();
  return daten.namen || namen;
}

// Der Code darf im Link stehen: .../#mein-code. Dann muss dem Klienten
// nichts diktiert werden, er tippt nur einen Link an.
function codeAusLink() {
  const roh = location.hash.replace(/^#/, "");
  if (!roh) return "";
  try {
    return decodeURIComponent(roh).trim();
  } catch {
    return roh.trim();
  }
}

// Nach dem Einlösen aus der Adresszeile nehmen — er soll nicht bei jedem
// Screenshot mit im Bild sein.
function linkAufraeumen() {
  if (!location.hash) return;
  history.replaceState(null, "", location.pathname + location.search);
}

function zugangVerloren() {
  laeuft = false;
  el.sendenKnopf.disabled = false;
  try { localStorage.removeItem(SCHLUESSEL.code); } catch { /* egal */ }
  code = "";
  el.anwendung.hidden = true;
  el.schwelle.hidden = false;
  el.zugangFehler.textContent = "Der Zugangscode wird nicht mehr akzeptiert. Bitte gib ihn erneut ein.";
  el.zugangFehler.hidden = false;
}

el.zugangForm.addEventListener("submit", async (ereignis) => {
  ereignis.preventDefault();
  const eingabe = el.zugangFeld.value.trim();
  if (!eingabe) return;
  el.zugangKnopf.disabled = true;
  el.zugangFehler.hidden = true;
  try {
    const gefunden = await zugangPruefen(eingabe);
    if (!gefunden) {
      el.zugangFehler.textContent = "Der Code stimmt nicht.";
      el.zugangFehler.hidden = false;
      return;
    }
    code = eingabe;
    namen = gefunden;
    schreiben(SCHLUESSEL.code, code);
    el.zugangFeld.value = "";
    starten();
  } catch {
    el.zugangFehler.textContent = "Keine Verbindung. Bist du online?";
    el.zugangFehler.hidden = false;
  } finally {
    el.zugangKnopf.disabled = false;
  }
});

// --- Eingabefeld ----------------------------------------------------------

function hoeheAnpassen() {
  el.eingabeFeld.style.height = "auto";
  el.eingabeFeld.style.height = el.eingabeFeld.scrollHeight + "px";
}

let entwurfTimer = null;
function entwurfSichern() {
  clearTimeout(entwurfTimer);
  entwurfTimer = setTimeout(() => schreiben(SCHLUESSEL.entwurf, el.eingabeFeld.value), 400);
}

el.eingabeFeld.addEventListener("input", () => {
  hoeheAnpassen();
  entwurfSichern();
});

el.eingabeFeld.addEventListener("keydown", (ereignis) => {
  if (ereignis.key === "Enter" && (ereignis.metaKey || ereignis.ctrlKey)) {
    ereignis.preventDefault();
    senden(el.eingabeFeld.value);
  }
});

el.eingabeForm.addEventListener("submit", (ereignis) => {
  ereignis.preventDefault();
  senden(el.eingabeFeld.value);
});

// --- Werkzeuge ------------------------------------------------------------

function sichtbareBeitraege() {
  return verlauf.filter((e) => !e.verborgen && e.text);
}

el.pdfKnopf.addEventListener("click", async () => {
  el.pdfKnopf.disabled = true;
  try {
    await alsPdfSichern(sichtbareBeitraege(), namen, lesen(SCHLUESSEL.begonnen, null));
  } catch {
    alert("Das PDF konnte nicht erzeugt werden. Die Textdatei funktioniert auch ohne PDF.");
  } finally {
    el.pdfKnopf.disabled = false;
  }
});

el.txtKnopf.addEventListener("click", () => {
  alsTextSichern(sichtbareBeitraege(), namen, lesen(SCHLUESSEL.begonnen, null));
});

el.loeschenKnopf.addEventListener("click", () => {
  const sicher = confirm(
    "Das ganze Gespräch wird aus diesem Browser gelöscht. Es gibt keine Kopie auf dem Server. " +
      "Wenn du es behalten möchtest, sichere es vorher als PDF.\n\nWirklich löschen?"
  );
  if (!sicher) return;
  try {
    localStorage.removeItem(SCHLUESSEL.verlauf);
    localStorage.removeItem(SCHLUESSEL.entwurf);
    localStorage.removeItem(SCHLUESSEL.begonnen);
  } catch { /* egal */ }
  location.reload();
});

// --- Start ----------------------------------------------------------------

function datumZeigen() {
  const roh = lesen(SCHLUESSEL.begonnen, null);
  if (!roh) return;
  const datum = new Date(roh);
  if (Number.isNaN(datum.getTime())) return;
  el.dateizeile.textContent =
    "Begonnen am " +
    datum.toLocaleDateString("de-DE", { day: "numeric", month: "long", year: "numeric" });
}

function starten() {
  el.schwelle.hidden = true;
  el.anwendung.hidden = false;

  verlauf = lesen(SCHLUESSEL.verlauf, []);
  if (!Array.isArray(verlauf)) verlauf = [];

  if (verlauf.length === 0) {
    schreiben(SCHLUESSEL.begonnen, new Date().toISOString());
    // Die API braucht eine erste Nachricht von ihm, damit Ben sprechen darf.
    // Sie wird nie angezeigt und steht in keinem Export.
    verlauf.push({ rolle: "user", text: KICKOFF, verborgen: true });
    verlaufSichern();
  }

  datumZeigen();
  el.eingabeFeld.value = lesen(SCHLUESSEL.entwurf, "") || "";
  hoeheAnpassen();
  zeichnen();
  nachUntenRollen(true);

  // Steht am Ende eine Antwort von ihm ohne Ben-Antwort, wurde beim letzten
  // Mal mittendrin abgebrochen. Dann einfach weitermachen.
  const letzte = verlauf[verlauf.length - 1];
  if (letzte && letzte.rolle === "user" && !letzte.fehler) benFragen();
}

async function vorstart() {
  // Der Reihe nach: Code aus dem Link, dann der gemerkte, dann der leere.
  // Der leere greift, wenn der Server ohne ZUGANGSCODE läuft — dann gibt es
  // gar keine Schwelle und die Adresse ist die einzige Hürde.
  const kandidaten = [...new Set([codeAusLink(), lesen(SCHLUESSEL.code, "") || "", ""])];

  for (const versuch of kandidaten) {
    let gefunden;
    try {
      gefunden = await zugangPruefen(versuch);
    } catch {
      return; // offline: die Schwelle bleibt stehen
    }
    if (!gefunden) continue;
    code = versuch;
    namen = gefunden;
    if (versuch) schreiben(SCHLUESSEL.code, versuch);
    linkAufraeumen();
    starten();
    return;
  }

  // Nichts hat gepasst: die Schwelle bleibt. Der falsche Code soll aber
  // nicht in der Adresszeile stehen bleiben.
  linkAufraeumen();
}

vorstart();
