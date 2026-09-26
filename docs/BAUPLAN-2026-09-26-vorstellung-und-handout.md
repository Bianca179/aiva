# Bauplan: Kandidatenvorstellung nur bei „weiter“, Candidate Handout automatisch (26.09.2026)

Entscheidungen von Bianca am 26.09.: Frage 1 ja, Frage 2 ja. Gebaut wird mit einem neuen API-Key und einer Sicherung vor dem Bau.

## V1 Kandidatenvorstellung (Fletcher) nur bei „weiter“
**Ist-Stand:** In Flow I `gwWSt4dyvyXnFgQd` (Version 178c319f) läuft nach jedem Erstgespräch die Kette „Erstgespraech?“ → „Kandidatenprofil (Dossier bauen)“ → „Kandidatenvorstellung (Fletcher, Entwurf)“. Die Empfehlung der Scorecard spielt dabei keine Rolle. „Scorecard auswerten“ liefert das Feld `vorschlag` mit einem dieser Werte: Sehr gut, Gut, Weiter, On Hold, Absage, oder leer.

**Bau:**
- Zwischen Dossier und Fletcher kommt ein neues IF „Vorstellung sinnvoll?“. Es ist wahr, wenn `vorschlag` einer der Werte Sehr gut, Gut oder Weiter ist.
- Das Kandidatenprofil (Dossier) entsteht weiter nach jedem Erstgespräch.
- Bei On Hold, Absage oder leerem Vorschlag entsteht keine Vorstellung. Die Meldung in #maschinenraum nennt dann den Grund, zum Beispiel „Vorstellung nicht erstellt (Scorecard: On Hold)“.
  - Philipp kann die Vorstellung jederzeit über CENTCOM anstoßen, das Werkzeug Fletcher bleibt.

**Roast:**
- **R1:** Nach einem Folgegespräch kann die Scorecard von „On Hold“ auf „Weiter“ springen, zum Beispiel bei Jacoby. Die Vorstellung fehlt dann.
  - Gegenmaßnahme: Beim Folgegespräch mit „weiter“ wird Fletcher aufgerufen, wenn noch keine Vorstellung existiert.
  - Vor dem Bau prüfen: Gibt es im Funnel ein Feld mit dem Link zur Vorstellung? Wenn nicht, prüft der Workflow stattdessen, ob im Mandatsordner schon ein Doc „Kandidatenvorstellung <Name>“ liegt.
- **R2:** Erkennt der Regex die Empfehlung nicht, ist `vorschlag` leer. Dann entsteht keine Vorstellung, und die Meldung weist darauf hin. Lieber eine Vorstellung zu wenig als ein falscher Kundenentwurf.
- **R3:** Die Vorstellung für Jacoby vom 25.09. (On Hold) existiert bereits. Sie wird nicht gelöscht; Philipp entscheidet selbst.

## V2 Candidate Handout automatisch beim ersten Kandidaten
**Ist-Stand:**
- PD - Monk Dokumente `TWrqGjacJgpfkk1A` erzeugt das Handout nur, wenn CENTCOM es anstößt (Werkzeug Monk_Dokument_erstellen), mit dem Dokumenttyp „handout“.
- Der Workflow schreibt den Link in das Mandatsfeld „Candidate Handout Link“. Vorlage: Templates „Candidate Handout (CI-Master)“ (aktiv).
- Das Cockpit zeigt ein fehlendes Handout ab dem ersten Kandidaten als Lücke an.

**Bau:** Ein neuer Workflow „PD - Handout nachziehen“. Er wird nach Biancas Projekt verschoben, weil Monk Dokumente nur Aufrufe aus demselben Projekt annimmt.
- **Takt:** Mo–Fr stündlich um :40, von 07:40 bis 18:40. Ein Lauf besteht nur aus einer Airtable-Abfrage; ein Modell wird nur aufgerufen, wenn wirklich ein Handout fehlt.
- **Auswahl:** Mandate mit Status active, Mandate Type search, mindestens 1 Funnel-Eintrag und leerem „Candidate Handout Link“. Höchstens 2 pro Lauf.
- **Ausschluss:** Assessment-, Mentoring- und Coaching-Mandate werden über Mandate Type ausgeschlossen, zusätzlich über den Titel (Regex wie in Flow I).
- **Je Mandat:** Aufruf von Monk Dokumente mit dokumenttyp „candidate handout“ und dem Mandatstitel.
  - Monk Dokumente trägt den Link selbst ein, damit gilt das Mandat im nächsten Lauf als erledigt.
  - Danach eine Aufgabe über PD - Task anlegen (dedupliziert): „Candidate Handout <Mandat> prüfen“, mit dem Link.
- **Kein Versand.** Das Handout bleibt ein Entwurf im Mandatsordner.
- **Fehler:** Scheitert der Aufruf, wird der Link nicht gesetzt und der nächste Lauf versucht es erneut. Nach 2 Fehlschlägen am selben Tag wird das Mandat bis zum Folgetag ausgelassen, damit keine Kostenschleife entsteht.

**Roast:**
- **R4 Erster Lauf:** Heute fehlt das Handout nur bei einem Such-Mandat: Actoom Country Manager DACH `rec0DaXTrnPg6VDAa`, 46 Funnel-Einträge, die Suche startet neu. Durable `rec2lNnjG3TeZNOcZ` ist ein Assessment und wird ausgeschlossen. Der erste Lauf erzeugt also genau 1 Handout.
- **R5 Kosten:** Ein Sonnet-Aufruf pro Handout, etwa 0,05–0,10 $ (Schätzung). Das passiert einmal pro Mandat.
- **R6 Kalender-Spiegel:** Der Takt kollidiert nicht mit dem Kalender-Spiegel (:07/:22/:37/:52). „Retry on fail“ nur an lesenden Knoten.
- **R7 Parallele Sitzungen:** Vor dem Bau in BAUSTELLEN eintragen. Monk Dokumente und Task anlegen werden nur aufgerufen, nicht verändert.
- **R8 Wochentakt:** Die Übersicht für Philipp bekommt eine neue Zeile „Candidate Handout“.

## Test
- **V1:** In der Test-Kopie von Flow I mit Stubs: einmal Scorecard „On Hold“ (Jacoby-Transkript), einmal „Weiter“. Erwartung: im ersten Fall keine Vorstellung, im zweiten eine Vorstellung.
- **V2:** Ein Probelauf ohne Schreibzugriff zeigt die ausgewählten Mandate (erwartet: nur Actoom). Danach ein Lauf mit Biancas Go.
