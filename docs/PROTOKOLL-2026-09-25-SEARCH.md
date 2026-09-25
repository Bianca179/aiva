# Protokoll 25.09.2026 — Search-Roast Findus (Kandidaten) & Bravo 6 (Kunden), Rhineshore/PD

> Laufendes Protokoll dieser Session. Neueste Einträge unten. Stand = 25.09.2026.
> Ältere Drive-Protokolle (SESSION-*.md bis 14.08., roast-2026-09 / IMPORT-PROTOKOLL vom 20.09.) sind
> **nicht aktuell** — nur Hintergrund.

## Feste Regeln (von Bianca, gelten dauerhaft)
- **Zwei n8n-Instanzen:** `aiva179` (Werkstatt, per MCP) und `rhineshore.app.n8n.cloud` (Live CENTCOM/PD,
  nur per REST-API mit Header-Datei `n8n-header.txt`, Key gibt Bianca pro Sitzung). **Nie vorschlagen, ein
  zweites n8n per Connector anzubinden** — geht nicht. Key nie in Befehlszeile, nie im Chat anfordern.
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
7. **KORREKTUR (nach Lesen der Drive-Protokolle):** Punkt 4 war falsch. Findus/Bravo 6 laufen NICHT in
   `Centcom` auf aiva179, sondern auf **rhineshore.app.n8n.cloud** (Findus `oTeQ7TTbTxP0Dfxu`,
   Bravo 6 `SvC6VfroWvcuhAy1`, Cockpit `JeWWDbDK8aE8hmWW`). Erste Fassung von CLAUDE.md („nur eine Instanz")
   war falsch und ist korrigiert. REST-API erreichbar (HTTP 401 ohne Key).
8. **Relevanter aktueller Stand (CENTCOM-OFFENE-PUNKTE-2026-09-25, Stand 09:45, Drive-Doc
   `1uyMXPuH-aGTleERRFFSlU33DyMiX6ZjGn6oYFGLN92I`):**
   - P1: Proxy-Timeout (pd-anthropic-cache Worker) legt alle LangChain-Agenten lahm, auch Findus → betrifft
     auch einen Bravo-6-Wochenlauf. Bianca-Entscheidung offen (Base URL auf api.anthropic.com oder Cloudflare-Diagnose).
   - Findus bewusst ohne Automatik (Entscheidung 08.08., Off-Limits). Cofibra-Mandat seit 22.09. `lost`
     → fehlende Cofibra-Übernahme ist korrekt, kein Fehler.
   - Akquise war „bewusst geparkt — Zuruf-Weg genügt"; neu (heute): Bravo 6 wöchentlich dienstags.
   - Ziel für Akquise: Akquise-Pipeline im SSOT (Pipedrive für B+P abgeschaltet).
   - Kein Bravo-6-Zielprofil in Drive dokumentiert.
9. **Wartet auf:** API-Key für rhineshore (per Header-Datei), dann Bravo 6 `SvC6VfroWvcuhAy1` lesen
   (Profil?), Bau-Plan Dienstagslauf vorlegen → Biancas Go.
10. **Rhineshore-API-Zugang steht** (Key in Scratchpad-Header-Datei, nicht im Repo). 114 Workflows gelesen.
    - `PD - Bravo 6 (Rolle)` `SvC6VfroWvcuhAy1`: aktiv, **noch nie gelaufen** (0 Executions). Der Lauf vom 17.08.
      stammte aus der alten Fassung `66CuEFz05gjsgrRh` (inaktiv). Prompt = Airtable `Prompts`/„bravo 6".
      Werkzeuge: Klients, Akquise-Pipeline, Mandate, Kondensat (nur lesen), Unipile LinkedIn (api60), HTTP-Abruf
      (URL, keine Websuche). **Kein Schreibwerkzeug**, kein Zeitplan. Modell Sonnet 4.6 über Credential
      „Anthropic account" `nrZkUZIQhvT2REnB` (dasselbe wie Findus/Centcom).
    - Centcom ruft Bravo 6 mit dem Hinweis auf: „Rufe mit einem vollständigen Auftragstext auf: welche
      Branche/Region/Größe gesucht wird" → das Profil kommt vom Aufrufer.
    - **Ergebnis der Suche nach dem festen Profil:** in keinem der 114 Workflows, nicht im Prompt „bravo 6",
      nicht in Skills/Kondensaten, nicht in Drive. Es existiert nur die Methode (80 km, Signale, Entscheider).
    - Findus `oTeQ7TTbTxP0Dfxu`: 8 Läufe 19.–22.09. (3 Fehler am 21.09., danach erfolgreich).
11. **Plan Bravo-6-Wochenlauf vorgelegt** (wartet auf Profil + Go; siehe Chat 25.09.).
12. **Frage Bianca: Wo macht die Kundensuche auf Executive-Level Sinn?** Empfehlung (aus Mandatshistorie
    abgeleitet, von Philipp zu bestätigen): Signale statt Branchenliste — (1) lange offene Exec-Stellenanzeigen
    (Unipile Kategorie `jobs`), (2) ausländische Firmen mit DACH-Markteintritt → Country Manager,
    (3) Jobwechsel im eigenen Netzwerk (Persons), (4) PE/Nachfolge/Führungswechsel (braucht News-/Registerquelle).
13. **Go Bianca: „ad 3 go 2 + 3"** → Schritt 2 (Wochenlauf-Workflow) + Schritt 3 (Ausgabe Akquise-Pipeline).
    Schritt 1 (Profil als Airtable-Eintrag) NICHT freigegeben → Profil steht im Knoten „Suchauftrag (hier anpassen)".
    - **Angelegt: `PD - Bravo 6 Wochenlauf` `gIrwBH3fA49Po9It` auf rhineshore — INAKTIV**, kein Testlauf, kein Publish.
    - Ablauf: Dienstag 07:00 (Europe/Berlin, Cron `0 0 7 * * 2`) → Suchauftrag → `PD - Bravo 6 (Rolle)`
      `SvC6VfroWvcuhAy1` (unverändert) → Pipeline + Klients lesen → VORSCHLAG-Block auslesen, Dubletten raus
      (Rechtsformen inkl. AS/AB/BV normalisiert) → Akquise-Pipeline anlegen (Stage `identifiziert`,
      Intent `search-akquise`/`investment`, Branche nur bestehende Werte sonst `Other`, kein typecast).
    - Error-Workflow wie andere PD-Workflows: `SdR76scsRwpxkSU0`.
    - Auswertelogik lokal getestet (Dubletten gegen Klients Heaten/Actoom, Branchen-Mapping); zwei Fehler gefunden und behoben.
    - Suchauftrag = ENTWURF (Executive-Level, DACH, 50–2.000 MA, Signale: Exec-Stellenanzeigen via Unipile `jobs`,
      DACH-Markteintritt, Führungswechsel/Nachfolge/PE) — von Bianca/Philipp zu bestätigen.
    - **Offen:** Suchauftrag bestätigen; P1 Proxy-Timeout; Go für Testlauf; Go für Aktivierung;
      Cockpit-Karte (Schritt 4) separat.
