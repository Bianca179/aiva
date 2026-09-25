# CLAUDE.md — Arbeitsregeln (von Bianca festgelegt)

## Infrastruktur — nicht verwechseln
- **Zwei n8n-Instanzen:**
  - `aiva179.app.n8n.cloud` = Biancas Werkstatt. Nur DIESE ist per n8n-MCP verbunden.
  - `rhineshore.app.n8n.cloud` = Live-System Rhineshore / PD / CENTCOM (Philipp Dicke).
    Erreichbar **nur per REST-API** (`/api/v1/...`) mit Header-Datei `n8n-header.txt` im Scratchpad.
- **Niemals vorschlagen, ein zweites n8n per MCP/Connector anzubinden** — das geht nicht.
  Stattdessen: Bianca gibt den API-Key pro Sitzung aus (nicht im Chat anfordern); er gehört ausschließlich
  in die Header-Datei, **nie in eine Befehlszeile**, und wird nach der Sitzung gelöscht.
- Die `PD - …`-/CENTCOM-Workflows auf aiva179 sind alte Kopien/Prototypen — **nicht** der Live-Stand.
- Live-IDs auf rhineshore (Stand 25.09.): Centcom `uhJLPwsa8wTFTDAa`, PD - Findus (Rolle) `oTeQ7TTbTxP0Dfxu`,
  PD - Bravo 6 (Rolle) `SvC6VfroWvcuhAy1`, PD - Bravo 6 Wochenlauf `gIrwBH3fA49Po9It` (inaktiv), PD - Cockpit `JeWWDbDK8aE8hmWW`
  (`https://rhineshore.app.n8n.cloud/webhook/cockpit`), Long-/Shortlist `PxHsuMYG6lnlWdBI`.
- Rhineshore-/PD-SSOT: Airtable-Base `app2lmhCxLhMkdfmN` („SSOT").
  Biancas eigene Basen: Steuerzentrale `appqscSUAbAqQGMpk`, Agenten/Registry `app9r4BK5FJTU219P`.
- **AIVA Cockpit** (`HPl4FtmXeISou9FN`, aiva179) = Biancas eigenes Dashboard, NICHT Philipps.
- **Anthropic auf rhineshore:** „Anthropic account" `nrZkUZIQhvT2REnB` = **Biancas eigenes Konto** (nicht erneut
  fragen!). Bianca trägt die Kosten für Rhineshore NICHT → alle Rhineshore-Agenten müssen über Philipps Konto laufen.
  „Anthropic Rhineshore" `SAq68yfgETKLhMev` (Proxy pd-anthropic-cache) = Rhineshore-Zugang.
  Der rhineshore-API-Key gehört Philipps n8n-Konto → per API angelegte Workflows landen in Philipps Projekt;
  PD-Workflows liegen in Biancas Projekt `qB9AeAby4SGYpgzk` (ggf. per `/transfer` verschieben).

## Regeln im Rhineshore-System (aus CENTCOM-OFFENE-PUNKTE, 25.09.)
- Nichts löschen (umbenennen statt löschen), keine Credentials anfassen, Sicherung vor jedem Ersetzen.
- Keine manuellen Läufe, kein Publish, kein Umbau ohne Biancas Go — jeweils eigene Frage.
- Kein Versand nach außen ohne Philipp. Für Philipp muss alles mit einem Klick gehen.
- Keine Annahmen, bei Lücken fragen. Erst planen, dann roasten, dann bauen.
- Neue Workflows heißen `PD - <Funktion>`.
- Nicht anfassen (parallele Sitzung): Kalender-Spiegel v2 `hMq7EO1uhC1Umh7c`, Sensor Kalender `yY2R1ghTcv6A4MJJ`.

## Arbeitsweise
- **Erst den aktuellen Stand lesen:** neuestes `CENTCOM-OFFENE-PUNKTE-<Datum>` in Google Drive, dann Ergebnisse
  (Airtable `Konversationen`, Funnel, Akquise-Pipeline) — nicht nur Workflow-Konfiguration.
- **Protokoll führen:** in Drive als `OFFENE-PUNKTE-<Datum> (Stand hh:mm)`, ersetzte Fassungen mit Präfix
  `VERALTET-`; zusätzlich `docs/PROTOKOLL-<datum>-<thema>.md` in diesem Repo.
- Ältere Session-Protokolle (Drive-Ordner `1XC51IQPrVdghUl4JXg0UtB8A9dHLj9Y_`) = Hintergrund, nicht aktuell.
- Nie eine Vermutung als Diagnose ausgeben. Exakte IDs nennen.
- Antworten auf Deutsch, knapp; Anweisungen an Bianca nummeriert, ein Schritt pro Zeile.
