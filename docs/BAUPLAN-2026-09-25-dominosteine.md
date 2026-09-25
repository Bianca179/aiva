# Bauplan: fehlende Dominosteine Rhineshore (Entwurf 25.09.2026, nicht freigegeben)

Grundlage ist der Befund in `PROTOKOLL-2026-09-25-prozesscheck.md`. Alle Uhrzeiten MESZ.
Gebaut wird nichts ohne Biancas Go. Jeder Umbau wird vorher gesichert, alte Knoten werden umbenannt statt gelöscht.

## Begriffe (Philipps Sprache)
- **Mandat** = Suchauftrag bzw. Auftrag eines Unternehmens (Tabelle Mandates). Das Unternehmen selbst steht in der Tabelle Klients.
- **Kandidat** = Person im Funnel eines Mandats.
- **Akquise** = Unternehmen, mit dem noch kein Mandat besteht.

## D1 Vertrag im Postausgang → Mandat vorschlagen

**Testfall (gefunden 25.09.):** B+P, gesendet am 21.09. um 22:49 an Franz Kögl (IntraFind Software AG), cc Arne Paul Bender.
Betreff „IntraFind x Birn+Partners | Rahmenvertrag Executive Search“, Postausgang `recvqY9JWEuecTBlD`.
Text: „anbei unser Angebot in Form eines Rahmenvertrags“.
- Der Postausgangs-Pass hat die Mail erkannt, aber nur als Zusage behandelt. Er hat den Task `recIW7rCqblRdsJWr` „IntraFind (Franz Kögl) - Rahmenvertrag nachfassen“ angelegt (fällig 28.09.).
- Ein Mandat für IntraFind gibt es nicht. Laut Mail vom 21.09. geht es um eine Co-Geschäftsleitung.

**Messung Postausgang 17.–25.09. (88 Mails):**
- Einfache Stichwortsuche (Vertrag, Angebot, Beauftragung, unterschrieben …): 5 Treffer, davon 1 echter Vertragsversand (IntraFind).
- Die 4 Fehltreffer: „Team-Vertrag“ (Gelsenwasser), „NDA unterzeichne ich gerne“ (FHDW), zwei interne Mails.
- Das Modell hat den IntraFind-Fall inhaltlich richtig verstanden („Rahmenvertrag ohne Unterschrift verschickt“). Stichworte allein wären also zu ungenau, der Modellaufruf reicht.
- Die Stichprobe ist klein, eine echte Trefferquote lässt sich aus einem einzigen Fall noch nicht ableiten.

**Bau:**
1. Im Prompt von „Zusage denken“ (Postausgangs-Pass `8LJ0D5YUa1rrAd9n`) zusätzliche Felder abfragen: `vertrag_versendet` (angebot | vertrag_unterschrieben | nein), `klient`, `position`. Die alte Prompt-Fassung wird gesichert.
2. Kostenloses Zweitsignal: In `$select` des Graph-Abrufs `hasAttachments` ergänzen. Anhangnamen nur abrufen, wenn der Text unklar ist.
3. Bei einem Treffer: Karte „Mandat anlegen?“ im Cockpit mit Klient, Position und Link zur Mail. Philipp bestätigt mit einem Klick, danach laufen Mandatsakte und Funnel anlegen.
4. Test: Die IntraFind-Mail wird als Testdaten eingespielt (pin data). Kein Live-Lauf, kein Versand.
- Kosten: rund 0,03 Cent zusätzlich pro Mail (Haiku 4.5; Schätzung).

## D2 CV → Person anlegen

1. CV-Ablage `UHjMLLUPOAoR8rUx` im Takt des Inbox-Passes laufen lassen (08/12/15 Uhr statt nur 08:10).
2. Kein Drive-Trigger auf den CV-Ordner, weil Flow F dort selbst ablegt und sonst doppelt verarbeitet würde.
3. Scheitert die Dokumenterkennung (API-Fehler), wird der Lauf rot und meldet sich im #maschinenraum, statt still „unklar“ einzustufen.
4. Der Klick „Dokument prüfen“ bekommt den Dateinamen in den Titel, damit die Dublettenprüfung nicht alles verschluckt.

## D3 Transkript → auswerten

**Befund:** Flow I `gwWSt4dyvyXnFgQd` ordnet Text-Transkripte über Centcom zu (Typ, Kandidat, Klient, Mandat). Audio-Transkripte (ElevenLabs `rcUw0zVcI7ZUlWoP`) überspringen diesen Schritt. Sie schreiben nur Referenz, Link und Text, ohne Typ und ohne Mandat.

**Bau:**
1. Nach der Transkription durchläuft das Audio-Transkript dieselbe Zuordnung wie Text-Transkripte. Zusätzliche Hinweise: Dateiname und Kalendertermin.
2. Verteilung nach Typ:
   - **Kandidatengespräch:** Person anlegen bzw. finden, Funnel-Eintrag, Dossier bauen (Kandidatenprofil), Scorecard, Funnel aktualisieren. Fletcher (Kandidatenvorstellung) nur als Entwurf zur Freigabe durch Philipp.
   - **Gespräch mit dem Auftraggeber zu einem Mandat** (Briefing, Status, Feedback zu Kandidaten): Eintrag beim Mandat bzw. in der Mandatsakte. Bewertungskriterien werden angepasst, wenn sich das Anforderungsprofil ändert.
   - **Gespräch mit einem Unternehmen ohne Mandat:** Akquise-Pipeline.
   - **Assessment** (z. B. Backhaus): zum Assessment-Mandat.
3. Ergebnis als Karte im Cockpit.

## Offen
- D1: Legt ein versendetes Angebot bzw. ein unversendeter Rahmenvertrag schon ein Mandat an (Status z. B. „Angebot“), oder erst der unterschriebene Vertrag?
- D3: Wird die Zuordnung zu Kandidatengespräch, Auftraggeber-Gespräch oder Akquise bestätigt?
