# Protokoll 25.09.2026 — Search-Roast Findus (Kandidaten) & Bravo 6 (Kunden), Rhineshore/PD

> Laufendes Protokoll dieser Session. Neueste Einträge unten. Stand = 25.09.2026.
> Ältere Drive-Protokolle (SESSION-*.md bis 14.08., roast-2026-09 / IMPORT-PROTOKOLL vom 20.09.) sind
> **nicht aktuell** — nur Hintergrund.

## Feste Regeln (von Bianca, gelten dauerhaft)
- **Es gibt nur EINE n8n-Instanz: `aiva179.app.n8n.cloud`.** Rhineshore/PD/CENTCOM läuft dort.
  Bianca kann kein zweites n8n verbinden. **Nie wieder vorschlagen, ein zweites n8n / einen weiteren
  n8n-Connector anzubinden.**
- Rhineshore-SSOT = Airtable-Base `app2lmhCxLhMkdfmN` („SSOT", Philipp Dicke). Biancas eigene Basen
  (Steuerzentrale `appqscSUAbAqQGMpk`, Agenten `app9r4BK5FJTU219P`) sind NICHT Rhineshore.
- Das **AIVA Cockpit** (`HPl4FtmXeISou9FN`) ist Biancas eigenes Dashboard — nicht Rhineshore/Philipp.
- Protokoll führen: diese Datei laufend fortschreiben und pushen.
- Keys/Tokens nie im Chat — als Umgebungsvariable / n8n-Credential hinterlegen.
- Erst in Ergebnissen/Protokollen nachsehen (Airtable `Konversationen`, Funnel), nicht nur Workflow-Konfiguration.

## Verlauf
1. **Erster Roast (falsch fundiert):** nur Konfiguration geprüft — Prototyp `CENTCOM Agent — Prototyp (R59)`
   (`HxT6lSSVzWASixKq`) und die Sub-Workflows `PD - Findus` (`H28gFYuhj1fNCOU4`) / `PD - Bravo 6`
   (`vTsTzieIyRPvIZHO`, beide 0 Executions). Ergebnisse ignoriert → Fehlschlüsse (z. B. „nach GO passiert nichts").
2. **Korrektur anhand der echten Läufe** (Airtable `Konversationen`, Agent=Findus/Bravo 6):
   | Datum | Mandat | Ergebnis |
   |---|---|---|
   | 19.09. | Interroll GVL Süd | nur Suchdesign/Booleans, LinkedIn-Credential-Fehler, Google blockt |
   | 21.09. | Actoom Country Manager DACH W1 | 20 Kandidaten (16/20 außerhalb Region) |
   | 21.09. | Cofibra Country Manager | 17 neue Kandidaten |
   | 21.09. | Heaten GL Vertrieb | 20 Kandidaten aus 50 Rohtreffern |
   | 22.09. | Actoom W2 | 14 Kandidaten, Ortsfilter Bayern/BW |
   23.09.: 54 Funnel-Einträge übernommen (Actoom + Heaten, Stage `vorgeschlagen`).
3. **Befunde aus den echten Läufen:**
   - Off-Limits-Feld 4/5 Läufe `nicht_geliefert` (nur Heaten gefüllt).
   - Kriterien: Actoom vermischt mit Fremdmandaten; Cofibra + Heaten leer.
   - Heaten: Persons/Funnel-Abruf leer → kein Dublettencheck.
   - Klientenliste nie verfügbar → alles „prüfen".
   - Cofibra-Longlist (17) NICHT im Funnel.
   - Unvollständige Namen übernommen (Tim S., Arnd K., Thomas G.); `Sourcing Status` bei allen 54 leer.
   - Websuche praktisch ausgefallen (Google JS-Challenge).
   - Bravo 6: einziger Lauf 17.08. (newen-Vorbriefing, keine Kundensuche, LinkedIn-Auth-Fehler).
4. **Sichtbarkeit:** Die Live-Läufe sind über MCP nicht sichtbar. Einzige Workflows mit MCP-Sperre:
   `Centcom` (`ci4w3WN32fuIMhS2`) und `PD - Triage-Nachlauf newen` (`DNr7HOyzHEI7WQFI`).
   → Vermutlich laufen Findus/Bravo 6 in `Centcom`. Lösung: dort „Available in MCP" einschalten
   (gleiche Instanz, kein zweiter Connector).
5. **Bianca-Entscheidung Bravo 6 wöchentlich:** Lauf **dienstags**; Ausgabe **Akquise-Pipeline (SSOT)
   + Dashboard**; festes Suchprofil existiert laut Bianca bereits (Prompt oder Skills).
   - Gesucht in SSOT `Prompts` (bravo 6: nur Methode, kein Profil), `Skills` (kein Bravo-6-Skill),
     `Kondensate` (kein Bravo-6-Eintrag). Einziges festes Profil: Quantum (Energy/IT, ≥5 Mio €, ≥20 FTE — Investment).
   - `Akquise-Pipeline` ist leer (0 Einträge).
   - Offen: Profil-Fundort, Philipps Dashboard (in `Centcom`?), Uhrzeit Dienstag.
6. **Session-Protokolle gefunden:** Google Drive, Ordner `1XC51IQPrVdghUl4JXg0UtB8A9dHLj9Y_`
   (SESSION-*.md, PD-HANDOVER, SYSTEMBESCHREIBUNG-CENTCOM, START-NAECHSTER-CHAT) + `roast-2026-09` (Zip)
   + `IMPORT-PROTOKOLL-2026-09-20`. Laut Bianca veraltet, nur zum Aufschlauen.
