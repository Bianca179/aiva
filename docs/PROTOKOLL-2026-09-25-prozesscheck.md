# Prozesscheck Rhineshore, 25.09.2026 (nur lesend)

Geprüft wurden die Ausführungen vom 25.09. auf rhineshore.app.n8n.cloud und die SSOT `app2lmhCxLhMkdfmN`.
Es gab keine Läufe und keine Änderungen.

## Befunde

| # | Station | Befund | Beleg |
|---|---|---|---|
| B1 | Anthropic-Zugang | Die Verbindung „Anthropic Rhineshore" `SAq68yfgETKLhMev` scheitert auf dem Weg über die Base URL (Proxy): 12:37 „Your credit balance is too low" (Bravo 6 `SvC6VfroWvcuhAy1`, Exec 5801, und Wochenlauf `gIrwBH3fA49Po9It`, Exec 5800); 06:10 „Bad request" (Dokumenttyp erkennen). Knoten mit fest eingetragener URL api.anthropic.com (Inbox-Pass, Entwurf schreiben) laufen. | Exec 5656, 5659, 5801, 5800 |
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

- **Anthropic-Zugang:** Die Verbindung „Anthropic Rhineshore" `SAq68yfgETKLhMev` wurde heute um 10:26 (MESZ) zuletzt gespeichert. Der Proxy v2 (Drive `1NM_2Leg-YBuoGg9KchJyb7L91WYzbBoY`) reicht laut Code den Schlüssel aus n8n nur durch. Proxy und Direktaufruf verwenden also denselben Schlüssel. Verlauf: 12:37 „credit balance too low" (Bravo 6, Exec 5801); 13:47 Bravo 6 wieder erfolgreich (Exec 5819). Zu welchem Konto der Schlüssel gehört, ist über die API nicht sichtbar.
- **Neue Fehler 15:01/15:07:** `PD - Entwurf schreiben` darf von einem aufrufenden Workflow nicht gerufen werden („cannot be called by this workflow", Exec 5842). `PD - Verbrauch zählen` hat keinen Zugriff auf die Verbindung (Exec 5845). Die Ursache ist nicht geklärt.
- **CV-Trigger:** Einen Drive-Trigger auf den CV-Ordner `1gT3Q8xP7nKLCJppFXfD4HGnJ4osDb_hV` gibt es nicht. Der einzige Drive-Trigger ist Flow I (Transkripte-Ordner). CV-Intake wird nur von Flow F (08:10) aufgerufen.
- **Backhaus:** Das Mandat `rec2lNnjG3TeZNOcZ` („Leadership-Assessment Frau Backhaus (Durable)", active) existiert seit 19.09. (Datenlücke-Import). Im Postausgang ist keine Mail mit Vertrag zu Backhaus/Durable gespeichert.
