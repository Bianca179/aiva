# CLAUDE.md — Arbeitsregeln (von Bianca festgelegt)

## Infrastruktur — nicht verwechseln
- **Es gibt nur EINE n8n-Instanz: `aiva179.app.n8n.cloud`.** Auch Rhineshore / PD / CENTCOM (Philipp Dicke)
  läuft dort. Bianca kann kein zweites n8n verbinden — **niemals vorschlagen, ein weiteres n8n oder einen
  weiteren n8n-Connector anzubinden.**
- Ist ein Workflow über MCP nicht lesbar, liegt das an der Workflow-Einstellung „Available in MCP"
  (z. B. `Centcom`, `ci4w3WN32fuIMhS2`) — Bianca bitten, sie dort einzuschalten.
- Rhineshore-/PD-SSOT: Airtable-Base `app2lmhCxLhMkdfmN` („SSOT").
  Biancas eigene Basen: Steuerzentrale `appqscSUAbAqQGMpk`, Agenten/Registry `app9r4BK5FJTU219P`.
- **AIVA Cockpit** (`HPl4FtmXeISou9FN`) = Biancas eigenes Dashboard, NICHT Philipps/Rhineshore.

## Arbeitsweise
- **Erst Ergebnisse und Protokolle ansehen, dann urteilen:** Airtable `Konversationen` (Agenten-Outputs),
  Funnel, Akquise-Pipeline — nicht nur die Workflow-Konfiguration.
- **Protokoll führen:** je Session `docs/PROTOKOLL-<datum>-<thema>.md` anlegen, laufend fortschreiben, pushen.
  Ältere Session-Protokolle liegen in Google Drive (Ordner `1XC51IQPrVdghUl4JXg0UtB8A9dHLj9Y_`) —
  Hintergrund, aber nicht automatisch aktuell; heutigen Stand prüfen.
- Vor jedem Umbau an Live-Workflows Biancas Go. Nachsehen statt behaupten, exakte IDs nennen.
- Keys/Tokens nie im Chat — als Umgebungsvariable oder n8n-Credential.
- Antworten auf Deutsch, knapp, ein Schritt pro Zeile.
