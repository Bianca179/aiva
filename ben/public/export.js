// PDF und Textdatei entstehen vollständig im Browser. Für den Export
// verlässt kein Wort dieses Gerät.

const JSPDF_PFAD = "/vendor/jspdf.umd.min.js";

function datumsZeile(begonnen) {
  const heute = new Date().toLocaleDateString("de-DE", {
    day: "numeric", month: "long", year: "numeric",
  });
  const start = begonnen ? new Date(begonnen) : null;
  if (!start || Number.isNaN(start.getTime())) return heute;
  const startText = start.toLocaleDateString("de-DE", {
    day: "numeric", month: "long", year: "numeric",
  });
  return startText === heute ? heute : `${startText} bis ${heute}`;
}

function dateiname(endung) {
  const d = new Date();
  const teil = [
    d.getFullYear(),
    String(d.getMonth() + 1).padStart(2, "0"),
    String(d.getDate()).padStart(2, "0"),
  ].join("-");
  return `gespraech-${teil}.${endung}`;
}

function herunterladen(blob, name) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = name;
  document.body.append(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

// --- Textdatei ------------------------------------------------------------

export function alsTextSichern(beitraege, namen, begonnen) {
  const zeilen = [
    "Gespräch mit " + namen.agent,
    datumsZeile(begonnen),
    "",
    "".padEnd(60, "-"),
    "",
  ];
  for (const beitrag of beitraege) {
    zeilen.push(beitrag.rolle === "assistant" ? namen.agent + ":" : namen.klient + ":");
    zeilen.push(beitrag.text.trim());
    zeilen.push("");
  }
  herunterladen(
    new Blob([zeilen.join("\n")], { type: "text/plain;charset=utf-8" }),
    dateiname("txt")
  );
}

// --- PDF ------------------------------------------------------------------

let jspdfGeladen = null;

function jspdfLaden() {
  if (window.jspdf?.jsPDF) return Promise.resolve(window.jspdf.jsPDF);
  if (jspdfGeladen) return jspdfGeladen;
  jspdfGeladen = new Promise((erfuellen, ablehnen) => {
    const skript = document.createElement("script");
    skript.src = JSPDF_PFAD;
    skript.onload = () =>
      window.jspdf?.jsPDF ? erfuellen(window.jspdf.jsPDF) : ablehnen(new Error("jsPDF fehlt"));
    skript.onerror = () => ablehnen(new Error("jsPDF nicht ladbar"));
    document.head.append(skript);
  });
  return jspdfGeladen;
}

export async function alsPdfSichern(beitraege, namen, begonnen) {
  const JsPDF = await jspdfLaden();
  const doc = new JsPDF({ unit: "mm", format: "a4" });

  const seiteBreit = 210;
  const seiteHoch = 297;
  const randLinks = 25;
  const randRechts = 25;
  const randOben = 25;
  const randUnten = 22;
  const breite = seiteBreit - randLinks - randRechts;
  const einzug = 8;

  let y = randOben;

  const seitenumbruchPruefen = (hoehe) => {
    if (y + hoehe <= seiteHoch - randUnten) return;
    doc.addPage();
    y = randOben;
  };

  const schreiben = (text, { groesse, stil, farbe, links, maxBreite, abstand }) => {
    doc.setFont("helvetica", stil);
    doc.setFontSize(groesse);
    doc.setTextColor(farbe);
    const zeilenhoehe = groesse * 0.3528 * 1.45;
    for (const absatz of text.split(/\n+/)) {
      const zeilen = doc.splitTextToSize(absatz.trim(), maxBreite);
      for (const zeile of zeilen) {
        seitenumbruchPruefen(zeilenhoehe);
        doc.text(zeile, links, y);
        y += zeilenhoehe;
      }
      y += zeilenhoehe * 0.35;
    }
    y += abstand;
  };

  // Kopf
  doc.setFont("helvetica", "normal");
  doc.setFontSize(16);
  doc.setTextColor(30);
  doc.text("Gespräch mit " + namen.agent, randLinks, y);
  y += 7;
  doc.setFontSize(10);
  doc.setTextColor(120);
  doc.text(datumsZeile(begonnen), randLinks, y);
  y += 5;
  doc.setDrawColor(200);
  doc.line(randLinks, y, seiteBreit - randRechts, y);
  y += 10;

  for (const beitrag of beitraege) {
    const istBen = beitrag.rolle === "assistant";
    // Sprecher immer benennen, damit in der Sitzung nichts verwechselt wird.
    seitenumbruchPruefen(14);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8);
    doc.setTextColor(140);
    doc.text((istBen ? namen.agent : namen.klient).toUpperCase(), istBen ? randLinks : randLinks + einzug, y);
    y += 4.5;

    schreiben(beitrag.text, {
      groesse: istBen ? 11 : 10.5,
      stil: "normal",
      farbe: istBen ? 30 : 80,
      links: istBen ? randLinks : randLinks + einzug,
      maxBreite: istBen ? breite : breite - einzug,
      abstand: 4,
    });
  }

  // Seitenzahlen
  const seiten = doc.getNumberOfPages();
  for (let i = 1; i <= seiten; i++) {
    doc.setPage(i);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(150);
    doc.text(`${i} / ${seiten}`, seiteBreit / 2, seiteHoch - 12, { align: "center" });
  }

  herunterladen(doc.output("blob"), dateiname("pdf"));
}
