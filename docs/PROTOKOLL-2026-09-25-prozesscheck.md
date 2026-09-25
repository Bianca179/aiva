# Prozesscheck Rhineshore, 25.09.2026 (nur lesend)

Geprüft wurden die Ausführungen vom 25.09. auf rhineshore.app.n8n.cloud und die SSOT `app2lmhCxLhMkdfmN`.
Alle Uhrzeiten MESZ. Es gab keine Läufe und keine Änderungen.

## Befunde

| # | Station | Befund | Beleg |
|---|---|---|---|
| B1 | Anthropic-Zugang | Die Verbindung „Anthropic Rhineshore" `SAq68yfgETKLhMev` scheitert auf dem Weg über die Base URL (Proxy): 14:37 „Your credit balance is too low" (Bravo 6 `SvC6VfroWvcuhAy1`, Exec 5801, und Wochenlauf `gIrwBH3fA49Po9It`, Exec 5800); 08:10 „Bad request" (Dokumenttyp erkennen). Knoten mit fest eingetragener URL api.anthropic.com (Inbox-Pass, Entwurf schreiben) laufen. | Exec 5656, 5659, 5801, 5800 |
| B2 | CV kommt | Der CV von Nico Jacoby (B+P, abgelegt als Drive `1na520erKbaRR3PBTiuxfSHI0k5v7MGsH`) wurde wegen B1 als „unklar" eingestuft → keine Person, kein Funnel. Auch der Aufgaben-Klick „Dokument prüfen" wurde nicht angelegt (Dedup auf gleichen Titel „uebergebener Text"). | Exec 5654 → 5658/5659; Persons/Funnel: kein Treffer „Jacoby" |
| B3 | CV kommt | Flow F `UHjMLLUPOAoR8rUx` läuft nur 1× täglich (08:10). CVs, die später eingehen, werden erst am nächsten Werktag verarbeitet. Die Gmail-Zuordnung ergab 0 Treffer. | Exec 5654 |
| B4 | Transkript | Das Audio „2026-09-24_17_30_01_interroll mitte_maximilian_gerlach.mp3" wurde transkribiert und nach Transkripte `reczgwwSHMVVUSukS` geschrieben, allerdings ohne Verknüpfung zu Person oder Mandat. Danach wertet kein Workflow automatisch aus (Dossier, Fletcher und Funnel aktualisieren starten nur, wenn Centcom sie aufruft). Maximilian Gerlach fehlt in Persons und Funnel. | Exec 5789, 5790 |
| B5 | Vertrag gesendet → Mandat | Der Postausgangs-Pass `8LJ0D5YUa1rrAd9n` sucht nur nach Zusagen und hat keine Vertragserkennung (0 Treffer „Vertrag"); Anhänge werden nicht gelesen. Eine Vertragserkennung gibt es nur im Inbox-Pass (eingehend), und auch dort legt sie nur eine Freigabekarte im Logbook an, kein Mandat. Ein gesendeter Vertrag kann so nie ein Mandat auslösen. | Workflow-Definition `8LJ0D5YUa1rrAd9n`, `TmwShtK9D4kt5KEa` |
| B6 | Mandat anlegen | Mandatsakte, Funnel anlegen und Bewertungskriterien haben keinen eigenen Auslöser; sie laufen nur über Centcom oder den Verteiler (bzw. Monk). Letzter Lauf Mandatsakte: 24.09. 19:21. | Workflow-Liste |
| B7 | Nebenbefund | `PD - Bravo 6 Wochenlauf` `gIrwBH3fA49Po9It` ist aktiv (CLAUDE.md sagt „inaktiv") und lief heute. | Exec 5800 |

## Offen / Entscheidungen Bianca
1. B1: Guthaben bzw. Konto hinter „Anthropic Rhineshore" prüfen, danach Weg A oder B aus P1.1.
2. B2: Jacoby-CV nach Behebung von B1 erneut verarbeiten (manueller Lauf, braucht Go).
3. B5: Welche gesendete Mail mit Vertrag (Postfach, Datum, Klient)?
4. Bau-Vorschläge B3–B6 erst planen und roasten, dann bauen.

## Nachtrag 25.09. (nachmittags)

- **Anthropic-Zugang:** Die Verbindung „Anthropic Rhineshore" `SAq68yfgETKLhMev` wurde heute um 10:26 (MESZ) zuletzt gespeichert. Der Proxy v2 (Drive `1NM_2Leg-YBuoGg9KchJyb7L91WYzbBoY`) reicht laut Code den Schlüssel aus n8n nur durch. Proxy und Direktaufruf verwenden also denselben Schlüssel. Verlauf: 14:37 „credit balance too low" (Bravo 6, Exec 5801); 15:47 Bravo 6 wieder erfolgreich (Exec 5819). Zu welchem Konto der Schlüssel gehört, ist über die API nicht sichtbar.
- **Neue Fehler 17:01/17:07:** `PD - Entwurf schreiben` darf von einem aufrufenden Workflow nicht gerufen werden („cannot be called by this workflow", Exec 5842). `PD - Verbrauch zählen` hat keinen Zugriff auf die Verbindung (Exec 5845). Die Ursache ist nicht geklärt.
- **CV-Trigger:** Einen Drive-Trigger auf den CV-Ordner `1gT3Q8xP7nKLCJppFXfD4HGnJ4osDb_hV` gibt es nicht. Der einzige Drive-Trigger ist Flow I (Transkripte-Ordner). CV-Intake wird nur von Flow F (08:10) aufgerufen.
- **Backhaus:** Das Mandat `rec2lNnjG3TeZNOcZ` („Leadership-Assessment Frau Backhaus (Durable)", active) existiert seit 19.09. (Datenlücke-Import). Im Postausgang ist keine Mail mit Vertrag zu Backhaus/Durable gespeichert.

## Entscheidungen Bianca (25.09., abends)
- Mandat schon beim versendeten Angebot/Rahmenvertrag, Status „Anbahnung“.
- Gespräche: Kandidat → Person/Funnel; Auftraggeber zu einem Mandat → Mandat/Mandatsakte; ohne Mandat → Akquise.
- Testfall für D1 ist die IntraFind-Mail vom 21.09. (`recvqY9JWEuecTBlD`), Task `recIW7rCqblRdsJWr`; ein Mandat fehlt.
- **Geparkt:** Leadership-Assessment/Mentoring (Backhaus/Durable, BRYCK) ist ein eigenes Geschäftsfeld und braucht eine eigene Heimat im Cockpit und eigene Abläufe. Wird später angegangen.

## Umbauten 25.09. (Go Bianca, inkl. Publish)

Sicherungen: n8n-Versionierung und lokale Sicherung im Scratchpad dieser Sitzung (`backup/<id>-2026-09-25-vorher.json`).

| Zeit | Workflow | Änderung | Vorher → Nachher (Version) |
|---|---|---|---|
| 17:48 | Flow F CV-Ablage `UHjMLLUPOAoR8rUx` | D2: Takt „0 10 8 * * 1-5“ → „0 20 8,12,15 * * 1-5“, Trigger umbenannt in „Taktung 08:20/12:20/15:20 Mo-Fr“. Dublettenschutz „Bereits abgelegt (Triage)“ war schon vorhanden. | f1912ffb → bd744be6 |
| 17:52 | Postausgangs-Pass `8LJ0D5YUa1rrAd9n` | D1: Neuer Zweig ab „Zusage pruefen“: Vertrag? (Stichwort) → Vertrag denken (Haiku 4.5 direkt, Verbindung Anthropic Rhineshore) → Vertrag pruefen (nicht auswertbar → Lauf rot) → Mandate lesen / Klients lesen → Mandat anlegen? (Dubletten: Message-ID in Notes; offenes Mandat beim Klienten ohne neue Position) → Klient anlegen (falls neu) → Mandat anlegen (Status „in Anbahnung“, Mandate Type Executive Search, Owner Philipp). Assessment/Mentoring wird bewusst nicht angelegt. Der Zusage-Prompt ist unverändert. | – → d9737123 |
| 17:57 | Flow I Transkript-Eingang `gwWSt4dyvyXnFgQd` | D3a: Audio-Transkripte laufen durch dieselbe Einordnung; der vorhandene Transkripte-Datensatz wird ergänzt (Zusammenfassung oben, Volltext unten) statt doppelt angelegt. Die Einordnung läuft jetzt über „Einordnen (Claude direkt)“ (Haiku 4.5) statt über die Langdock Assistant API, die seit 20.08.2026 abgeschaltet ist; der alte Knoten heißt „ALT - …“ und ist abgehängt. Fehler behoben: Die Mandatsliste im Prompt war immer leer (Airtable liefert `fields`), deshalb wurde nie ein Mandat verknüpft. | – → b9bc9080 |

**Tests (ohne Schreibzugriff auf Airtable):**
- `WtrpPZIKpsWj73d1` (Exec 5860): IntraFind → angebot_versendet, Klient IntraFind (neu), Titel „IntraFind – Position offen“. Gelsenwasser → kein_vertrag. FHDW → per Stichwortfilter aussortiert. Durable-Assessment → assessment_mentoring, nicht angelegt.
- `zfbdxarF4kL5cwsv` (Exec 5861–5864): Gerlach → Kandidaten-Interview, Maximilian Gerlach, Interroll Foerdertechnik GmbH, Mandat „Gebietsverkaufsleiter / Regionalleiter technischer Vertrieb Mitteldeutschland“. Würde den bestehenden Datensatz `reczgwwSHMVVUSukS` ergänzen.
- Beide Test-Workflows sind deaktiviert und in „ZZ-ARCHIV …“ umbenannt.

**Neuer Befund:** „CENTCOM Flow G — Kondensate“ `TEzt3sVQgttVydv0` (aktiv, sonntags 18:00) nutzt ebenfalls die abgeschaltete Langdock Assistant API; letzter Lauf am 20.09. rot (Exec 4657). Nicht angefasst.

**BAUSTELLEN:** Die Sitzungen „Search“ und „Memory-Pilot“ hatten um 17:55 gleichzeitig je eine neue Fassung angelegt. Zusammengeführt um 18:05 in Drive `1E7zZCocQ2L9ezKcAyTxMHiq1r8Imr0GOjDWEf-KfuAw`; die beiden Forks heißen jetzt VERALTET-….

## D3b und Altfälle (Go Bianca 25.09., abends)

| Zeit | Was | Ergebnis |
|---|---|---|
| 18:13 | Nachlauf Gerlach (`pchVutUGtT8reEZ7`, einmalig, Exec 5868) – gleichzeitig End-to-End-Test D3b | Transkript `reczgwwSHMVVUSukS` ergänzt (Typ Kandidaten-Interview, Mandat Interroll Mitteldeutschland). Person neu angelegt; Funnel `recPi2zdhocQBglE4` neu angelegt (Stufe erstgespraech, Datum 24.09.). Scorecard (McGonnagal, 93 s): Doc `1R8DNaxBpciXZCU6WGipFny2USm-Dbo01K6yB1u4IdDo`, Vorschlag „Weiter“ (Vorbehalt: CV fehlt, K.-o.-Kriterien Wohnort/Berufsjahre offen). Kandidatenprofil `1GTJ5MiapDppuqYxF3j_brQ0thmaLfB1M5vpQXEzb_dU`. Kandidatenvorstellung (Entwurf, lang) `1hMwjym-VQnSKO3NTOwjB_3W30kXbP32eeJb1iGti1uc`. Meldung im #maschinenraum. |
| 18:14 | Flow I `gwWSt4dyvyXnFgQd`: D3b live | Kette nach „Gedaechtnis schreiben“: Auswertung noetig? (nur Kandidaten-Interview mit Kandidat und Mandat) → Person suchen/anlegen → Funnel suchen / PD - Funnel anlegen → Scorecard (McGonnagal) → Scorecard-Doc im Mandatsordner → PD - Funnel aktualisieren (Datum, Vorschlag als Notiz; die Bewertung setzt Philipp) → Scorecard-Link → Dossier bauen → Fletcher (Entwurf) → Meldung. Fehler-Workflow auf PD - Fehleralarm gesetzt. Erkennung des Vorschlags korrigiert (McGonnagal schreibt **fett**). Version 8fe3a218. |
| 18:15 | IntraFind (Airtable direkt) | Klient `rec8VI9GstS70XhM2` „IntraFind Software AG“; Mandat `recvZFSFL8QN422LY` „IntraFind – Position offen“, Status in Anbahnung, Message-ID in Notes (damit D1 keine Dublette anlegt). |
| 18:16 | CV-Intake `sC0Oha2cKFcTCjgw`: Korrektur | Der Knoten „Kandidat anfragen (Claude direkt)“ enthielt „}}“ im Ausdruck → „invalid syntax“. Seit dem Umbau am Morgen wäre damit jeder CV gescheitert (erster echter CV: Jacoby, Exec 5880). Korrigiert zu „} }“. Version 51d65be7. |
| 18:17 | Nachlauf Jacoby (`9odwwx8fpuvXhh51`, Exec 5883) | Person `recNjvLkI80mbCBI1` Nico Jacoby (Crown Gabelstapler, Augsburg). Mandat nicht eindeutig (Interroll Mitte oder Süd) → Task für Philipp „welches Mandat ist gemeint?“. |

Beide Nachlauf-Workflows sind deaktiviert und in „ZZ-ARCHIV …“ umbenannt.

**Hinweise für Philipp:**
- Gerlach: Laut McGonnagal steht in den Notizen des Süddeutschland-Mandats „Telefonat mit Markus Gerlach“ (24.09.). Möglicherweise eine Verwechslung Markus/Maximilian, bitte prüfen.
- Jacoby: Wohnort Augsburg spricht eher für Interroll Süd; die Zuordnung per Task bestätigen.

**BAUSTELLEN:** aktuelle Fassung 18:25 in Drive `1zvPGyJwuSlNSs7tEgtf3_JKYYwgaVnvDig5Iq1FIBQ4`.
