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

## Jacoby-Audio und Nachbesserungen (25.09., 20:00–20:35)

**Befund Jacoby-Audio:** Philipp hat die Aufnahme „2026-09-21_17_16_56_interroll_süd_nico_jacoby.mp3“ um 19:22 in den Drive-Ordner Transkripte gelegt und Centcom im Chat auf die „audio datei“ verwiesen. Centcom suchte die Datei in Slack, meldete um 19:33 „BLOCKIERT … Audiodatei kann keines meiner Werkzeuge transkribieren“ und legte einen Lücken-Task für Bianca an (19:34). Flow I hat die Aufnahme um 19:50 automatisch verarbeitet (Exec 5982): Transkript `recHwBiTLXb52KymQ`, Funnel `recwGJYcnUEizQnUx`, Scorecard „On Hold“ (K.-o. Technik offen), Kandidatenprofil, Vorstellungsentwurf. Ursachen:
- Centcom kannte den Transkript-Weg nicht.
- Die Ergebnis-Meldung geht nur nach #maschinenraum.
- Flow I prüft den Ordner nur um :20 und :50.
- Die Scorecard kannte die Funnel-Angaben nicht.

**Entscheidungen Bianca:** Punkte 1–3 (Philipp informieren, Task schließen, Meldung in den Centcom-Chat) nein; Punkt 5 (Takt 5 Minuten) nein; Punkte 4 und 6 ja.

| Zeit | Was | Ergebnis |
|---|---|---|
| 20:23 | Flow I `gwWSt4dyvyXnFgQd` (Punkt 6) | Neuer Knoten „Funnel lesen (Details)“. Der Kontext für McGonnagal enthält jetzt Gehaltsvorstellung, Kommentar, Screening Status, Gesamtstatus, Stage und die letzten 2.500 Zeichen der Funnel-Notizen, mit dem Hinweis, dass beantwortete Punkte nicht als offen bewertet werden. Test am Jacoby-Funnel erfolgreich (`Kfp632XkG6dgIyf4`). Version 056df8d4. |
| 20:29 | Centcom `uhJLPwsa8wTFTDAa` (Punkt 4) | Neues Werkzeug „Transkripte_lesen“ (Airtable, Tabelle Transkripte, höchstens 3 Treffer, neueste zuerst, nur lesen). Version ee6e2bea. |
| 20:30 | Prompt „centcom“ (Airtable `recZ8KGZGnUVadmfr`, Punkt 4) | `Transkripte_lesen` in <lesen> aufgenommen und erklärt. <nicht_direkt_verfuegbar>: Transkripte liest CENTCOM selbst. Neuer Abschnitt <audio_und_transkripte>: Audio im Ordner Transkripte wird automatisch verarbeitet (:20/:50); nicht BLOCKIERT melden, keinen Lücken-Task anlegen, kurz auf die automatische Verarbeitung verweisen. Eintrag im Feld Notiz. Sicherung: `docs/sicherungen/prompt-centcom-2026-09-25-vor-transkripte.txt`. Eingespielt über `5jhiDM1YeWpa3zLd` mit Längenprüfung (Exec 6027), danach deaktiviert. |

Nachtrag 20:40: Der Lücken-Task „Lücke: Slack-Audiodatei Interroll Süd (Nico Jacoby) nicht auffindbar“ (`recY9IoyN17f7OMyH`) ist auf Erledigt gesetzt (Go Bianca), mit Vermerk in der Beschreibung. Philipp ist laut Bianca informiert.

## G1–G5 Mandats- und Akquisegespräche (25.09., 20:50–21:39)

Plan und Roast: `docs/BAUPLAN-2026-09-25-mandats-und-akquisegespraeche.md`.

**Entscheidungen Bianca:**
- Action Items: für jeden Punkt eine eigene Aufgabe.
- Unbekannte Akquise-Unternehmen: automatisch in der Pipeline anlegen (Stufe meeting).
- Sparring und Sprachmemo: werden ausgewertet.
- Go schließt Publish ein.

| Zeit | Was | Ergebnis |
|---|---|---|
| 20:55 | Sicherung | Stand vorher: `gwWSt4dyvyXnFgQd` (vor G1–G5), `wdDlQLmF6WOIosjZ` |
| 20:55–21:30 | Test-Kopie `ZW3UFEDqQVlUkH68` | Alle Schreib- und Meldeknoten sind durch Stubs ersetzt. 21 Läufe (Exec 6058–6081) mit 15 echten Transkripten, dabei wurde nichts geschrieben. Geprüfte Wege: Mandat, Akquise, Notiz, Kandidat, Folgegespräch-Erkennung, Person unklar. Danach deaktiviert, nicht gelöscht. |
| 21:32 | Flow I `gwWSt4dyvyXnFgQd` | Live, Version 178c319f, 80 Knoten. Details siehe unten. |
| 21:32 | MacWhisper-Eingang `wdDlQLmF6WOIosjZ` | Live, Version 90be6fad. Nach „Transkript speichern“ neuer Knoten „Flow I: einordnen und auswerten“: Aufruf von Flow I mit record_id, ohne auf das Ergebnis zu warten. |
| 21:33 | Aufruftest `4R4T8s6bsIBh1iAw` | Exec 6083 erfolgreich. Weg: Von MacWhisper → Verteiler, Ergebnis Typ Sonstiges, Route nichts. Danach deaktiviert. |

**Flow I im Einzelnen:**
- **G1 Typen:** Die Einordnung liefert Kandidaten-Erstgespräch, Kandidaten-Folgegespräch, Mandatsgespräch, Akquisegespräch, Sparring, Sprachmemo, Intern oder Sonstiges. Action Items werden nur für Philipp und sein Team erfasst.
- **G1 Verteiler „Gespraech verteilen“:** Hat das Unternehmen ein offenes Mandat, gilt das Gespräch als Mandatsgespräch, sonst als Akquisegespräch.
  - Eigene Firmen sind kein Akquise-Ziel: B+P, Rhineshore, newen, Contio, Quantum Capital, Alpine Advisors.
  - Assessment-, Mentoring- und Coaching-Mandate werden nur geparkt.
- **G2 Folgegespräch:** Ein Gespräch gilt als Folgegespräch, wenn der Typ es sagt, wenn der Funnel schon ein anderes Erstgespräch-Datum hat oder wenn schon eine Scorecard existiert.
  - Die Scorecard heißt dann „Folgegespräch“.
  - Die Erstgespräch-Daten bleiben unverändert.
  - Kandidatenprofil, Dossier und Fletcher werden übersprungen.
  - Das Transkript wird mit dem Kandidaten verknüpft.
- **Person-Abgleich:** Zuerst exakt nach Name, dann über den Funnel des Mandats, dann über Vor- und Nachname.
  - Ist die Person unklar, entsteht die Aufgabe „Kandidat zuordnen“ mit Meldung. Es wird keine neue Person angelegt.
  - Ohne erkannten Namen entsteht die Aufgabe „Kandidat oder Mandat nicht erkannt“.
- **G3 Mandatsgespräch:**
  - Die Kriterien werden gelesen und per Haiku ausgewertet.
  - Die Notiz wird über PD - Mandat aktualisieren an das Mandat gehängt, das Transkript mit dem Mandat verknüpft.
  - Zu jedem Action Item entsteht eine Aufgabe.
  - Geänderte Anforderungen und Kandidaten-Feedback werden zu einer Aufgabe gebündelt. Die Kriterien selbst ändern sich nicht, ebenso wenig die Funnel-Stufe.
  - Ist das Mandat mehrdeutig, entsteht die Aufgabe „Welches Mandat?“.
- **G4 Akquisegespräch:**
  - Bravo 7 analysiert das Gespräch und schlägt die nächste Handlung mit Frist vor.
  - In der Akquise-Pipeline wird der Eintrag angelegt oder ergänzt: Stufe mindestens meeting, Notiz vorangestellt, Transkript verknüpft.
  - Mehrere Treffer führen zu einer Aufgabe statt einer Neuanlage.
- **Sparring und Sprachmemo:** Aus den Action Items entstehen Aufgaben, dazu kommt eine Meldung.
- **G6 Meldung:** Jeder Weg meldet in #maschinenraum, was angelegt oder ergänzt wurde.
- Anlegende Knoten laufen ohne „Retry on fail“. Aufgaben werden über PD - Task anlegen (dedupliziert) angelegt.

**Korrekturen aus den Testläufen:**
- Name-Schutz: Die Antwort „Name nicht genannt“ gilt nicht mehr als Kandidat.
- Nachname allein erzeugt keine Dublette mehr.
- Quantum wird nicht mehr als Akquise-Ziel geführt.
- Fehlende Kriterien werden nicht mehr als „Anforderung geändert“ gewertet.
- Markdown wird aus den Aufgabentiteln von Bravo 7 entfernt.

**Offen:**
- Die etwa 25 alten MacWhisper-Transkripte mit Status „neu“ werden nicht nachverarbeitet. Ein Nachlauf ist möglich, braucht aber ein eigenes Go.
- Aufgaben aus Sparring können unruhig werden; nach der ersten Woche prüfen.
- Flow G Kondensate `TEzt3sVQgttVydv0` ist weiter kaputt (Langdock) und unverändert.

**BAUSTELLEN:** aktuelle Fassung 21:39 in Drive `1AzQ5FDSe3l3AZLomHkbL1PhZFMjS_bUIlkE2FDoA2to`. Flow I und der MacWhisper-Eingang sind frei.

## Nachtrag 26.09.
- Header-Datei mit dem API-Key im Scratchpad gelöscht, nachdem Bianca den Key in n8n gelöscht hatte. Keine weitere Kopie gefunden.
- **MacWhisper-Altbestand:** 24 Transkripte mit Status „neu“ und ohne Auswertung, aufgenommen vom 31.07. bis 21.09.2026.
  - Aufteilung: 1 aus dem Juli, 7 aus dem August, 16 aus dem September.
  - Nachlauf erst nach Biancas Bestätigung. Er braucht einen neuen API-Key.
- **Flow G Kondensate** (`TEzt3sVQgttVydv0`, So 18:00) ist der einzige Workflow, der die Kondensate der Agenten schreibt.
  - Gelesen werden sie von Findus, Monk, Monk Dokumente, McGonnagal, Bravo 6, Bravo 7, Delta 3 und Fletcher.
  - Die Memory-Sitzung hat Flow G nicht verändert. Der Voicespiegel schreibt nur die Kondensate voice-lernen und daten-lernen.
  - Reparatur vorgeschlagen: den Langdock-Aufruf durch einen direkten Claude-Aufruf ersetzen. Braucht ein Go.
- **Übersicht „CENTCOM Wochentakt“ für Philipp** als Artifact: https://claude.ai/artifact/RydmQN9XRwnSJMqfACSPQs. Grundlage sind die Zeitpläne der aktiven Workflows, Stand 25.09. 21:02.
