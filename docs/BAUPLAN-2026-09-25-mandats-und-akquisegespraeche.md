# Bauplan: Mandatsgespräche und Akquisegespräche auswerten (25.09.2026, entschieden und gebaut, live 21:32)

Anschluss an D3 (Flow I `gwWSt4dyvyXnFgQd`). Bisher werden nur Kandidaten-Interviews ausgewertet. Gespräche mit Auftraggebern und Akquise-Gespräche werden nur eingeordnet und gemeldet.
Alle Uhrzeiten MESZ. Gebaut wird erst nach Roast und Go von Bianca, mit Sicherung vorher.

## Ist-Stand (gelesen 25.09. abends)
- **Flow I** ordnet ein nach `Kandidaten-Interview | Klienten-Call | Akquise | Intern | Sonstiges`.
- In der Tabelle Transkripte gibt es dafür ein **zweites Vokabular**: `kandidaten_erstgespraech, kandidaten_folge, klient_meeting, akquise_gespraech, sparring, sprachmemo, MacWhisper, Sonstiges`. Flow I legt per Typecast neue Werte daneben an („Kandidaten-Interview“).
- **MacWhisper-Eingang** (`wdDlQLmF6WOIosjZ`, Webhook) schreibt Transkripte direkt, ohne Einordnung und ohne Auswertung. Beispiel: das Backhaus-Gespräch vom 21.09. Dieser Weg umgeht Flow I komplett.
- Die Tabelle **Transkripte** hat Verknüpfungsfelder `Kandidat`, `Klient`, `Akquise-Target`. Flow I befüllt nur `Mandate`.
- **Akquise-Pipeline** (`tblidsrc64j3CelcF`) hat die Felder Unternehmen Name, Intent (search-akquise/investment), Branche, Signal, Stage (identifiziert, qualifiziert, kontakt, meeting, angebot, won, lost, nicht_verfolgt), Bridge Contact, Last Activity Date, Notes und Transkripte. Einträge legt bisher nur der Bravo-6-Wochenlauf an.
- **PD - Mandat aktualisieren** (`NyChgxzhDL3fPIkW`) hängt Notizen mit Datum oben an (Zusatz „ueber CENTCOM“).
- **Bravo 7 (Rolle)** (`z2P1EB99wznVJfjZ`) analysiert Akquise-Gespräche. Die Rolle hat nur Lesewerkzeuge und gibt Freitext zurück.

## Soll

### G1 Einheitliche Gesprächstypen
- Die Einordnung liefert: `Kandidaten-Erstgespräch | Kandidaten-Folgegespräch | Mandatsgespräch | Akquisegespräch | Intern | Sonstiges`. Das sind Philipps Begriffe.
- Die alten Auswahlwerte werden umbenannt, nicht gelöscht:
  - klient_meeting → Mandatsgespräch
  - akquise_gespraech → Akquisegespräch
  - kandidaten_erstgespraech → Kandidaten-Erstgespräch
  - kandidaten_folge → Kandidaten-Folgegespräch
- Regel: Hat das Unternehmen ein offenes Mandat (auch „in Anbahnung“), ist es ein **Mandatsgespräch** zu diesem Mandat, sonst ein **Akquisegespräch**.
- Der Transkripte-Eintrag wird verknüpft mit Mandat, Kandidat (Person), Klient bzw. Akquise-Target.

### G2 Kandidaten-Folgegespräch (Korrektur D3b)
Heute wird jedes Kandidatengespräch als Erstgespräch behandelt. Das zweite Gespräch mit Jacoby am Mittwoch würde deshalb die Erstgespräch-Daten überschreiben.
- Folgegespräch: Die Stufe bleibt, wie sie ist. Die Scorecard heißt „Folgegespräch <Datum>“ und bezieht die frühere Scorecard ein. Die Funnel-Notiz wird ergänzt.
- Kandidatenprofil und Vorstellung werden nur neu erzeugt, wenn Philipp das anstößt.

### G3 Mandatsgespräch → Mandat
1. Zusammenfassung und Action Items kommen mit Datum und Link zum Transkript in die Mandat-Notizen (über PD - Mandat aktualisieren).
2. Ein Abgleich mit den Bewertungskriterien des Mandats (Direktaufruf Haiku) prüft, ob sich das Anforderungsprofil geändert hat: Region, Gehaltsband, Muss-Kriterien, Anzahl Kandidaten, Zeitplan.
   - Bei Änderungen: Klick für Philipp „<Mandat>: Anforderungen geändert – Kriterien anpassen?“ mit Liste.
   - Die Bewertungskriterien selbst werden nicht automatisch geändert.
3. Feedback zu Kandidaten (Auftraggeber sagt z. B. „X nicht weiter“) wird im Klick aufgelistet. Die Funnel-Stufe ändert sich nicht automatisch.
4. Mehrere passende Mandate beim Klienten (z. B. Interroll Mitte und Süd) und keine eindeutige Zuordnung: Klick „Welches Mandat?“ statt Raten.

### G4 Akquisegespräch → Akquise-Pipeline
1. Den Eintrag in der Akquise-Pipeline suchen (Name normalisiert, gleiche Dublettenlogik wie bei den Klients in D1).
2. Bravo 7 beauftragen: Analyse und empfohlene nächste Akquisehandlung.
3. Schreiben:
   - Vorhandener Eintrag: Notes ergänzen, Last Activity Date setzen, Stufe auf „meeting“ heben (nur wenn sie vorher früher stand), Transkript verknüpfen.
   - Neuer Eintrag: Intent search-akquise, Stufe meeting, Signal = Kern des Gesprächs.
4. Ein Klick für Philipp mit der empfohlenen nächsten Handlung (PD - Task anlegen, mit Dublettenprüfung).

### G5 MacWhisper-Eingang anschließen
Transkripte, die über MacWhisper kommen, laufen danach durch dieselbe Einordnung und Auswertung wie Flow I. Geplant ist, dass Flow I dafür einen zweiten Eingang bekommt, statt die Logik zu kopieren.

### G6 Meldung
Die bestehende Meldung in #maschinenraum nennt je Gesprächstyp, was angelegt bzw. ergänzt wurde.

## Roast
| # | Risiko | Gegenmaßnahme |
|---|---|---|
| R1 | Die Umbenennung der Auswahlwerte bricht Workflows, die die alten Werte schreiben (Audio transkribieren, MacWhisper-Eingang) oder filtern. | Vorher alle Workflows nach den alten Werten durchsuchen (erledigt: nur diese beiden schreiben sie) und im selben Schritt anpassen. Umbenennen statt löschen. |
| R2 | Falsche Einordnung Mandats- vs. Akquisegespräch. | Harte Regel über offene Mandate beim Klienten (G1), nicht nur Modellurteil. |
| R3 | Erst- vs. Folgegespräch falsch erkannt. | Regel: Gibt es schon einen Funnel-Eintrag mit Erstgespräch-Datum oder eine Scorecard, ist es ein Folgegespräch. Sonst entscheidet das Modell. |
| R4 | Mandat-Notizen wachsen unbegrenzt. | Nur Zusammenfassung (max. 10 Zeilen) und Action Items, kein Volltext; der Volltext bleibt im Transkript. |
| R5 | Bravo 7 läuft über LangChain/Proxy (Sonnet), mit Kosten- und Timeout-Risiko. Die Ausgabe ist Freitext. | Fehler brechen die Kette nicht ab (Meldung „Bravo 7 fehlgeschlagen“). Die Pipeline wird trotzdem mit der Zusammenfassung gepflegt. |
| R6 | Dubletten in der Akquise-Pipeline (Bravo 6 legt auch an). | Namensnormalisierung wie in D1. Bei mehreren Treffern Klick statt Neuanlage. |
| R7 | Automatische Funnel-Änderung durch Feedback des Auftraggebers wäre ein Eingriff in Philipps Entscheidung. | Nur als Klick auflisten, nichts automatisch ändern. |
| R8 | Zu viele Klicks für Philipp. | Pro Gespräch höchstens ein Klick, der alles bündelt. |
| R9 | Parallele Sitzungen ändern an Audio transkribieren, MacWhisper-Eingang oder Task anlegen. | Vorher in BAUSTELLEN eintragen. |

## Entschieden (Bianca 25.09.) – ehemals offene Fragen
Antworten: 1. je Action Item eine Aufgabe; 2. automatisch anlegen (Stufe meeting); 3. Sparring/Sprachmemo werden ausgewertet. Umsetzung siehe PROTOKOLL-2026-09-25-prozesscheck.md, Abschnitt G1–G5.

Ursprüngliche Fragen:
1. Action Items aus Mandatsgesprächen: ein gebündelter Klick „Nachbereitung <Mandat> <Datum>“, oder je Action Item eine eigene Aufgabe?
2. Akquise: Legt ein Gespräch mit einem noch unbekannten Unternehmen automatisch einen Pipeline-Eintrag an (Stufe meeting), oder erst nach Philipps Klick?
3. Sollen „sparring“ und „sprachmemo“ (heute nur als alte Auswahlwerte vorhanden) etwas auslösen, oder nur abgelegt werden?
