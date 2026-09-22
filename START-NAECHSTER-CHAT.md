# START HIER — aiva (Biancas eigenes Team)

> Kurzfassung für den Einstieg. Details stehen in `docs/HANDOVER-orchestrierung-v4.md`,
> neueste Abschnitte zuerst lesen: **20.19 → 20.18 → 20.17 → 20.16**.
> Nicht verwechseln: **PD / CENTCOM ist ein Kundenprojekt** und liegt im Ordner darüber.

**Stand: 14.08.2026, abends — Bianca ist ab jetzt drei Wochen im Urlaub.**

---

## Was ohne Bianca weiterläuft

- **Montag 15:38: das Rundschreiben geht raus.** Automatisch, an **16 Empfängerinnen**.
  Workflow `ORCH - Rundschreiben Versand (16 Kontakte) - v2` (`8wAdOJCD6onoJ2lY`, aktiv).
  Danach setzt er bei jedem Kontakt ein Häkchen — der Brief kann sich nicht wiederholen.
  ⚠ Absender ist `aimeetseva@gmail.com` (Anzeige „Bianca Enderlin", Antwort an `bianca@enderlin.info`).
  Bianca kennt das und hat es so entschieden.
- **Anmeldungen zum Identitätscheck** laufen über
  `https://aiva179.app.n8n.cloud/webhook/identitaetscheck` (18.09., 11:30, 49 €).
  Jede Anmeldung → Airtable `Anmeldungen` + Bestätigung an die Person + Meldung an Bianca.
  **Rechnung stellt das Team von Hand**, danach die Haken in Airtable setzen.
- **Sam schreibt zweimal täglich an** (10:00 und 16:00, rund 20 Vernetzungsanfragen).
  Freigaben sammeln sich im Cockpit an — in drei Wochen etwa sechzig. Das ist bekannt
  und ungeklärt (Bianca wollte es sich ansehen, kam nicht mehr dazu).
- **Telefonie, Website-Chat, Lead-Routing** laufen wie gehabt.

## Cockpit

`https://aiva179.app.n8n.cloud/webhook/aiva-cockpit?key=7f7ac47671ef94fa`

---

## Was auf Biancas Rückkehr wartet

1. **Sams Nachschub** — die Freigabe-Regel für die Zeit ohne sie ist nie entschieden worden.
2. **Der neue Kurs „Wie nutze ich KI, ohne zu verdummen"** ist nicht gebaut. Bewusst nicht
   angekündigt — er wird der erste Beitrag nach der Rückkehr, dann mit Kaufmöglichkeit.
3. **Zyklusintelligenz-Chatbot** und **„Richy Rich"** (Finanzcoach für junge Menschen):
   beide bewusst aus dem Rundschreiben herausgehalten, warten auf einen eigenen Anlass.
4. **Absenderadresse sauber ziehen** — für echten Versand als `bianca@enderlin.info`
   bräuchte es einen SMTP-Zugang; der n8n-Gmail-Baustein kann es beim Senden nicht.
5. **Reizarm unter eigener Adresse** — läuft unter `bianca179.github.io/aiva/reizarm/`,
   eine eigene Domain geht nur über die GitHub-Pages-Einstellungen (nicht von hier aus).
6. **Donna als sprechendes CRM** — Biancas Wunsch: Lesezugriff auf alles
   (Kontakte, Produkte, Leads, Kooperationspartner, Bühnen, Redaktionsplan),
   Schreiben eng wie heute, Massenversand nie. Vorbereitet, nicht gebaut.

---

## Alle Produkt-Links (Stand 14.08.)

| Voca | `https://voca-mxp6.onrender.com/` |
|---|---|
| TennisShift | `https://tennisshift.netlify.app/` |
| Future Me | `https://www.biancaenderlin.de/zukunfts-ich` |
| Reizarm | `https://bianca179.github.io/aiva/reizarm/` |
| Digitales Team | `https://www.biancaenderlin.de/digitales-team` |
| Retreat Identitätsshift | `https://www.biancaenderlin.de/identitaetsshift` |
| Identitätscheck 18.09. | `https://aiva179.app.n8n.cloud/webhook/identitaetscheck` |

---

## Zwei Bau-Lehren vom 14.08. (sparen der nächsten Sitzung Stunden)

- **Der n8n-Form-Trigger ist auf dieser Instanz unbrauchbar.** `/form/<pfad>` antwortet
  HTTP 401 mit Basic-Auth-Abfrage, auch mit `authentication: 'none'`. `/webhook/` läuft.
  Formulare also immer als Webhook + selbst gebautes HTML.
- **Der Airtable-Node liefert Felder unter `fields`**, nicht flach: `$json.fields.Name`.
  Ein Probelauf mit einem einzigen Datensatz hat das gefunden, bevor es 16-fach schiefging.

---

## Arbeitsweise (gilt weiter)

Nachsehen statt behaupten. Vor jedem Umbau Biancas Go. Ein Beleg pro Aussage, exakte IDs nennen.
Anweisungen an Bianca: ein Schritt pro Zeile, nummeriert, keine geratenen Klickpfade.
Fortschritt laufend ins Handover schreiben und pushen.
