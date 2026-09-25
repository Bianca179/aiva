# Bauplan: Massensuche Interroll (GVL / Regionalleiter technischer Vertrieb Süddeutschland)

Stand 25.09.2026, Sitzung „Search". Status: **PLAN + ROAST — nichts gebaut.** Bau erst nach Biancas Go.

## Ziel und Rechnung
- Philipp möchte **50 Antworten**. Erfahrung: 100 Ansprachen → 10 Antworten (10 %).
- → rund **500 passende, angesprochene Kandidaten**.
- Nach Filtern (Region, Titel, Off-Limits, Dubletten) bleibt erfahrungsgemäß nur ein Teil der Rohtreffer übrig
  → Ziel **1.500–2.500 Rohtreffer**.

## Grenzen (Unipile-Doku, 25.09.2026)
| | Wert |
|---|---|
| Treffer je Suche (Sales Navigator) | max. 2.500 |
| Empfehlung Profile je Tag (Sales Navigator) | max. 2.500 |
| Vernetzungsanfragen (bezahltes Konto) | 80–100 pro Tag, ca. **200 pro Woche** |
| InMails an offene Profile | max. 800 pro Monat; Empfehlung 30–50 pro Tag |

**Folge:** Die Suche ist nicht der Engpass. Der Engpass ist die **Ansprache**: 500 Kontakte = ca. 2,5–3 Wochen
Vernetzungsanfragen, oder schneller mit InMails an offene Profile. Ansprache bleibt bei Philipp (kein Versand ohne ihn).

## Ablauf (Vorschlag)
1. **Suchdesign einmalig (Findus, ein Lauf):** 6–10 kurze Titel×Branche-Kombinationen + Zielfirmen Pool A/B.
2. **Sales-Navigator-Suchen als URL (Philipp oder Bianca, einmalig):** im Sales Navigator mit allen Filtern bauen
   (Geografie: Bayern/BW-Regionen der PLZ 80–87, 89, Vorarlberg, Tirol; Funktion Vertrieb; Firmen AUSSCHLIESSEN:
   Interroll + 8 Klienten + Off-Limits) und die Such-URLs in die Tabelle „Massensuche-Aufträge" kopieren.
   Vorteil: Filter wirken exakt (auch Firmenausschluss), kein Modell rät.
3. **Workflow `PD - Massensuche` (ohne KI):** liest die URLs, holt alle Seiten über Unipile (Cursor), höchstens
   ca. 1.000 Profile pro Tag (unter der Empfehlung), verteilt über mehrere Tage.
4. **Automatisch filtern:** Dublette gegen Persons (LinkedIn-URL), Funnel und frühere Zeilen; Firma = Off-Limits/Klient → „gesperrt".
5. **Ablage in Airtable-Tabelle `Longlist-Roh`** (SSOT, neu, Freigabe Bianca 25.09.): Name, Titel, Firma, Ort,
   LinkedIn-URL, Suche, Datum, Status (neu / dublette / gesperrt / passt / passt nicht / übernommen), Notiz.
6. **Optional Vorsortierung mit Haiku** in Paketen: Titel/Branche/Region „passt / passt nicht / prüfen".
   Kosten grob < 1 $ für 2.500 Zeilen (Schätzung, Beleg nach Testpaket).
7. **Sichtung durch Philipp/Bianca** in einer Airtable-Ansicht; Auswahl → Funnel „vorgeschlagen" (bestehender Weg
   über `PD - Cockpit-Kandidat` übernimmt dann Ansprache-Aufgabe).
8. **Ansprache:** Philipp, im Tempo der Grenzen oben; Texte aus Skill `TEMPLATE-linkedin-und-nachrichten`.

## Roast (eigene Schwachstellen)
- **Engpass Ansprache, nicht Suche** — ohne Plan für ca. 200 Anfragen/Woche bringen 2.500 Treffer nichts.
- **Kontosperre:** zu schnelles Abrufen gefährdet Philipps LinkedIn-Konto → Tageslimit fest im Workflow, Pausen zwischen Seiten.
- **Datenschutz:** 1.500–2.500 Personenprofile im SSOT. Vorschlag: nicht ausgewählte Zeilen nach 60 Tagen löschen
  (Löschlauf; braucht Biancas Entscheidung — Löschen nur mit Go).
- **Firma fehlt im Treffer** (heute 7 von 10 bei Classic): mit Sales Navigator besser, aber nicht garantiert → Status „prüfen".
- **Qualität der Rücklaufquote:** 10 % galten für die bisherigen, handverlesenen 100. Bei Masse eher niedriger →
  eher 600–700 Ansprachen einplanen.
- **Unipile Sales-Navigator-Suche per URL** ist laut Doku möglich, aber hier noch ungetestet → erster Schritt ist ein
  Test mit EINER URL und EINER Seite.

## Schritte mit je eigener Freigabe
1. Tabelle `Longlist-Roh` + `Massensuche-Aufträge` im SSOT anlegen (Freigabe liegt vor: „ad 2 ja").
2. Test: eine Sales-Navigator-URL, eine Seite (25 Treffer) über Unipile → Rohzeilen prüfen.
3. Workflow `PD - Massensuche` bauen (inaktiv), BAUSTELLEN-Eintrag.
4. Echtlauf über mehrere Tage.
5. Optional Haiku-Vorsortierung.
