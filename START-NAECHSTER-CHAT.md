# START HIER — aiva (Biancas eigenes Team)

> Kurzfassung für den Einstieg. Details stehen in `docs/HANDOVER-orchestrierung-v4.md`,
> neueste Abschnitte zuerst lesen: **20.15 → 20.14 → 20.13**.
> Nicht verwechseln: **PD / CENTCOM ist ein Kundenprojekt** und liegt im Ordner darüber.

**Stand: 12.08.2026, abends**

---

## Was seit heute läuft

- **Telefonie auf deutscher Festnetznummer.** `+49 7156 4229016` → Donna nimmt an,
  Sophia wählt darüber heraus. Die alte US-Nummer ist freigegeben, es gibt nur noch diese eine.
  Aus- und eingehender Testanruf erfolgreich.
- **KI-Hinweis bei allen drei Agentinnen** (Sophia, Leandra, Donna): Sie sagen im ersten Satz,
  dass sie eine KI sind und dass das Gespräch verarbeitet wird. Datenschutzerklärung ist ergänzt.
- **Angebots-Entwürfe für C-Leads auf Knopfdruck.** Im Cockpit erzeugt ein Klick ein
  individuelles Angebot als **Entwurf** in Lexware. Versand bleibt Biancas Klick dort.
- **Produkte mit Links** bei allen Agentinnen abrufbar (Voca, TennisShift, Future Self,
  Retreat, Digitales Team, Identitätscheck, Leadership Circle; Reizarm noch ohne Live-URL).

## Cockpit

`https://aiva179.app.n8n.cloud/webhook/aiva-cockpit?key=7f7ac47671ef94fa`
Sam-Freigaben, Marketing-Freigaben, To-dos abhaken, C-Leads mit Angebots-Knopf.

---

## Die vier Entscheidungen für die nächste Sitzung

Bianca ist **drei Wochen abwesend** und will ein **Rundschreiben** mit ihren Produkten
und den im September startenden Kursen. Vorher muss geklärt sein:

1. **Empfängerkreis.** Die Tabelle *Kontakte* hat **kein Einwilligungsfeld**, die 209 Einträge
   stammen überwiegend aus LinkedIn-Kaltakquise. Eine Werbemail dorthin ist in Deutschland
   angreifbar. Welche Liste mit nachweisbarer Einwilligung gibt es — oder wird daraus ein
   LinkedIn-Beitrag statt einer Mail?
2. **September-Termine.** In der Produkte-Tabelle steht bei keinem Angebot ein Datum.
   Was startet wann?
3. **Wie weit darf die Kette ohne Bianca laufen?** Identitätscheck (49 €, Zeeg-Link) geht
   autonom. Alles Höherpreisige endet heute bei ihr.
4. **Freigabe-Regel für Sams Nachschub.** Er legt werktags 06:30 neue Entwürfe an; in drei
   Wochen sammeln sich rund sechzig an, die niemand freigibt.

**Zuerst prüfen:** Bianca sagt, Donna habe Zugriff auf Mails und Kalender. Die **Telefon-Donna**
(`agent_1801kznxw02af899y3exzwytmsxq`) hat Kalender-Lesezugriff, aber **kein Postfach-Werkzeug**.
Klären, welche Donna auf welcher Oberfläche was darf, bevor der Abwesenheits-Workflow darauf baut.

---

## Offene Kleinigkeiten

- **Reizarm** ist nicht deployed (liegt in `reizarm/` im Repo). Sobald live: URL ins Feld
  *Angebotsarchitektur-Link* des Produkts `recdlmD22rdhuBrfN`, dann teilen die Agentinnen sie automatisch.
- **Lexware-Artikel-Tool sagt „netto"**, obwohl Biancas Leistungen nach § 4 UStG
  umsatzsteuerfrei sind. Formulierung ändern, sobald Bianca es bestätigt.
- **Zwei Test-Angebote in Lexware** (AG0004, AG0005, „TESTLAUF Musterwerk AG") — die API kann
  Belege nicht löschen, das macht Bianca in der Oberfläche.
- **Verwaistes ElevenLabs-Werkzeug** `tool_3301kzkrhb5qez0brm4qcveppe66` (altes `produkt_info`)
  und die **Fehlversuch-Donna** `agent_1101kznx2r44ercss3aysbmdw9ad` — beide löschbar, Go nötig.
- **Linnis 140-Node-Post-Strecke** ist weiterhin ungetestet; sie wartet auf einen freigegebenen
  Redaktionsplan-Eintrag.
- **Rechnung AG0003 heinekingmedia, 2.170 €**, überfällig seit 16.07.

---

## Arbeitsweise (gilt weiter)

Nachsehen statt behaupten. Vor jedem Umbau Biancas Go. Ein Beleg pro Aussage, exakte IDs nennen.
Anweisungen an Bianca: ein Schritt pro Zeile, nummeriert, keine geratenen Klickpfade.
Fortschritt laufend ins Handover schreiben und pushen.
