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
  PD - Bravo 6 (Rolle) `SvC6VfroWvcuhAy1`, PD - Bravo 6 Wochenlauf `gIrwBH3fA49Po9It` (aktiv, Di 07:00), PD - Cockpit `JeWWDbDK8aE8hmWW`
  (`https://rhineshore.app.n8n.cloud/webhook/cockpit`), Long-/Shortlist `PxHsuMYG6lnlWdBI`,
  PD - Verbrauch zählen `kKIevwJ1wAvZOet2` (Kostenzähler → Tabelle „Modellverbrauch" `sJMaUoMxkn739kZp`, fürs Cockpit;
  enthält den Stille-Fehler-Wächter P4.1 → #maschinenraum), PD - Fehleralarm `SdR76scsRwpxkSU0` (Fehler-Workflow, nur rote Läufe).
- **n8n-API-Credential in rhineshore:** „rhineshore Verbrauch" `k2DNRjogvCUwAVn8` (Key ohne Ablauf, von Bianca 25.09.).
  Nicht neu anlegen — wiederverwenden. Workflows, die Läufe lesen, brauchen dieses Credential.
- Rhineshore-/PD-SSOT: Airtable-Base `app2lmhCxLhMkdfmN` („SSOT").
  Biancas eigene Basen: Steuerzentrale `appqscSUAbAqQGMpk`, Agenten/Registry `app9r4BK5FJTU219P`.
- **AIVA Cockpit** (`HPl4FtmXeISou9FN`, aiva179) = Biancas eigenes Dashboard, NICHT Philipps.
- **Anthropic auf rhineshore (Stand 25.09. abends, Protokoll `docs/PROTOKOLL-2026-09-25-anthropic.md`):**
  - **Einziges Ziel-Credential: „Anthropic Rhineshore" `SAq68yfgETKLhMev` = Philipps Konto.** Guthaben/Auto-Reload: Philipp.
    Kein aktiver Workflow nutzt mehr etwas anderes. Neue Anthropic-Knoten immer mit `SAq68…`.
  - „Anthropic account" `nrZkUZIQhvT2REnB` = **Biancas eigenes Konto** (nicht erneut fragen!), Bianca trägt keine
    Rhineshore-Kosten → **nie verwenden**. Nur noch in inaktiven Altfassungen/ZZ-ARCHIV; Key wird von Bianca entfernt.
  - `SAq68…` hat als Base URL den Proxy `https://pd-anthropic-cache.bianca-317.workers.dev` (Cloudflare Worker v2,
    Code `cloudflare/worker-anthropic-cache-v2.js`, Drive `1NM_2Leg-YBuoGg9KchJyb7L91WYzbBoY`). Wirkt nur auf LangChain-Knoten:
    Cache nur für Agenten (Anfragen mit Werkzeugen), Schutz vor Cloudflares 120-s-Abbruch per Stream + Puls.
    HTTP-Knoten rufen api.anthropic.com direkt auf und cachen selbst. Worker liegt noch auf Biancas Cloudflare-Konto (Free).
  - Kosten je Lauf/Workflow: Tabelle „Modellverbrauch" (Zähler, stündlich :07). Größter Treiber bisher CENTCOM still.
- Der rhineshore-API-Key gehört Philipps n8n-Konto → per API angelegte Workflows landen in Philipps Projekt;
  PD-Workflows liegen in Biancas Projekt `qB9AeAby4SGYpgzk` (ggf. per `/transfer` verschieben). Ein Workflow kann nur
  Credentials und Unterworkflows seines Projekts nutzen (sonst „does not have access" / „cannot be called by this workflow").
- Filter `activeWorkflows: false` im n8n-Knoten bzw. `?active=false` liefert NUR inaktive Workflows (nicht „alle").
  Per API lässt sich die Option nicht entfernen (n8n setzt `false` wieder ein) → `true` setzen oder in der Oberfläche löschen.

## Regeln im Rhineshore-System (aus CENTCOM-OFFENE-PUNKTE, 25.09.)
- Nichts löschen (umbenennen statt löschen), keine Credentials anfassen, Sicherung vor jedem Ersetzen.
- Keine manuellen Läufe, kein Publish, kein Umbau ohne Biancas Go — jeweils eigene Frage.
- Kein Versand nach außen ohne Philipp. Für Philipp muss alles mit einem Klick gehen.
- Keine Annahmen, bei Lücken fragen. Erst planen, dann roasten, dann bauen.
- Neue Workflows heißen `PD - <Funktion>`.
- Nicht anfassen (parallele Sitzung): Kalender-Spiegel v2 `hMq7EO1uhC1Umh7c`, Sensor Kalender `yY2R1ghTcv6A4MJJ`.
- **Parallele Sitzungen — Baustellenliste:** Vor jeder Änderung an einem rhineshore-Workflow in Drive das Dokument
  `BAUSTELLEN-<Datum>` lesen (alle Fassungen mit diesem Titel ohne `VERALTET-`) und prüfen, ob der Workflow belegt ist;
  eigene Änderungen dort VOR dem Umbau eintragen, danach auf „frei" setzen. Drive kann nicht bearbeiten → neue Fassung
  anlegen, alte in `VERALTET-… (Stand hh:mm Sitzung)` umbenennen; nach dem Anlegen erneut suchen, Forks zusammenführen.
- Vor jedem PUT die `versionId` prüfen (anderer Stand → erst neu lesen). Nach dem PUT prüfen, ob die Änderung übernommen wurde.
- Sicherung vor dem Ersetzen = n8n-Versionierung; alte `versionId` im Protokoll notieren (keine lokalen Sicherungen nötig).
- Aufrufer-Suche nach Workflow-ID im Knoten-JSON findet auch bloße Erwähnungen (z. B. in Code) — nur `executeWorkflow`-/Tool-Knoten zählen.

## Arbeitsweise
- **Erst den aktuellen Stand lesen:** neuestes `CENTCOM-OFFENE-PUNKTE-<Datum>` in Google Drive, dann Ergebnisse
  (Airtable `Konversationen`, Funnel, Akquise-Pipeline) — nicht nur Workflow-Konfiguration.
- **Protokoll führen:** in Drive als `OFFENE-PUNKTE-<Datum> (Stand hh:mm)`, ersetzte Fassungen mit Präfix
  `VERALTET-`; zusätzlich `docs/PROTOKOLL-<datum>-<thema>.md` in diesem Repo.
- Ältere Session-Protokolle (Drive-Ordner `1XC51IQPrVdghUl4JXg0UtB8A9dHLj9Y_`) = Hintergrund, nicht aktuell.
- Nie eine Vermutung als Diagnose ausgeben. Exakte IDs nennen.
- Antworten auf Deutsch, knapp; Anweisungen an Bianca nummeriert, ein Schritt pro Zeile.
