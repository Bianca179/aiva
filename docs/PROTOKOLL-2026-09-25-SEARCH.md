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
14. **Bianca: ad1 Suchauftrag passt · ad3 Testlauf ja · ad4 Aktivierung ja · ad5 Cockpit-Karte Go.**
    - **Schreibzugriff auf rhineshore von Claude Code blockiert** („Production Deploy"-Sperre der Rechteprüfung).
      Nicht geändert. Steht so auch im Offene-Punkte-Doc: PUT/POST braucht eine Freigaberegel unter /permissions.
    - Vorbereitet (lokal, nicht hochgeladen):
      a) Wochenlauf: temporärer Test-Webhook (zufällige Adresse) → aktivieren → Test auslösen → Webhook wieder entfernen.
      b) Cockpit `JeWWDbDK8aE8hmWW`: Sicherung `SICHERUNG-cockpit-2026-09-25-vor-akquise.json` im Scratchpad
         (enthält Tokens → NICHT ins Repo). Patch: neuer Knoten „Akquise neu lesen" (Pipeline, Stage identifiziert,
         letzte 14 Tage, max. 10) zwischen „Wartet auf dich" und „HTML bauen"; Karte „NEUE AKQUISE-TARGETS · BRAVO 6"
         im Reiter HEUTE unter „Zuruf an CENTCOM", nur sichtbar bei Treffern. Lokal gerendert und getestet (inkl. HTML-Escaping).
         Vor dem Hochladen Cockpit neu abrufen (heute 11:08 zuletzt geändert) und nur bei unveränderter versionId ersetzen.
    - P1 für Bravo 6: nutzt Credential „Anthropic account" `nrZkUZIQhvT2REnB` (wie Findus/Centcom), nicht
      „Anthropic Rhineshore" `SAq68yfgETKLhMev`. Einstellungen per API nicht lesbar → Testlauf zeigt es.
15. **Umsetzung nach Freigabe Schreibzugriff (A erledigt):**
    - Wochenlauf `gIrwBH3fA49Po9It`: temporärer Test-Webhook → **aktiviert** → Test 1 (Exec 5797) scheiterte am
      Aufrufschutz: API-Key gehört Philipps Konto → Workflow lag in Philipps Projekt, Bravo 6 erlaubt nur gleichen
      Eigentümer. **Workflow in Biancas Projekt `qB9AeAby4SGYpgzk` übertragen** (Bravo 6 unverändert).
    - Test 2 (Exec 5800, 12:37): **„Your credit balance is too low to access the Anthropic API"** (Bad request) im
      Aufruf von Bravo 6 → Credential **„Anthropic account" `nrZkUZIQhvT2REnB` ohne Guthaben**. Kein Proxy-Problem.
      Die Fehlermeldung „Bad request" im Alarmkanal stammt von diesem Test.
    - Test-Webhook wieder entfernt; Wochenlauf aktiv (dienstags 07:00), 8 Knoten.
    - **Cockpit `JeWWDbDK8aE8hmWW` ersetzt** (versionId vorher 8786efc2… geprüft, neu f41e0f39…): Karte
      „NEUE AKQUISE-TARGETS · BRAVO 6". Sicherung lokal + n8n-Versionierung. Erster Cockpit-Aufruf danach wird beobachtet.
    - **Anthropic-Inventur (aktive Workflows):**
      „Anthropic account" `nrZk…` (KEIN GUTHABEN): Centcom, CENTCOM still (Verteiler), Findus, Bravo 6, McGonnagal, Fletcher.
      „Anthropic Rhineshore" `SAq68…` (Proxy pd-anthropic-cache, Timeouts): Inbox-Pass, Postausgangs-Pass, CV-Intake,
      Dossier, Router, Bravo 7, Delta 3, Dokumenttyp, Entwurf schreiben, Klick-Abgleich, LinkedIn-Pass, Monk,
      Monk Dokumente, Termin vorbereiten, Voicespiegel (teils per HTTP direkt).
    - Frage Bianca: Anthropic nachhaltig lösen — hier oder eigene Session? → Empfehlung eigene Session (s. Chat).
16. **Bianca: „Anthropic account" nrZk… ist ihr eigenes Konto (mehrfach gesagt) — Kosten trägt sie NICHT.** In CLAUDE.md festgehalten. Startprompt für eigene Anthropic-Session: `docs/START-SESSION-ANTHROPIC.md`.
17. **Cockpit nach Änderung geprüft:** Exec 5808 (12:53) erfolgreich, „Akquise neu lesen" fehlerfrei, Seite vollständig; Akquise-Karte erwartungsgemäß ausgeblendet (Pipeline leer).
18. **13:35 — Stand nach Anthropic-Session (Branch `claude/upbeat-carson-feyx90`, parallel):** Ziel-Credential für alle
    Agenten = „Anthropic Rhineshore" `SAq68…` (Philipps Konto), Proxy bleibt, Timeout-Fix bis Di 29.09. 07:00.
    Rhineshore-API-Key dieser Session ist gelöscht (401) → keine Prüfung/Änderung auf rhineshore mehr möglich ohne neuen Key.
    Bianca: „wie machen wir mit der Search weiter?" → Fahrplan vorgelegt (Chat).
19. **Block 1 (Go Bianca, 13:45) — Findus nachgeschärft:**
    - Live-Prüfung zuerst: **F1 (Off-Limits-Feld), F2 (Kriterien je Mandat), F4 (Umlaute/LinkedIn-URL) waren bereits
      umgesetzt** (Findus-Version `8f9cd942…`, Credential schon `SAq68…`). Keine Änderung nötig.
    - **F5 kein Fehler:** Longlist-Einträge stehen bewusst ohne Sourcing Status auf „vorgeschlagen"; `PD - Cockpit-Kandidat`
      `Fn1N8PrNcFLlkXon` setzt bei „übernehmen" `identified` + legt Ansprache-Aufgabe an; „ablehnen" braucht Grund.
    - **F3 umgesetzt:** Knoten `Findus_Klients_lesen` (nur lesen, Tabelle Klients, alle Einträge, Felder Klient Name/
      Beziehungstyp/Hauptsitz/Branche) in `PD - Findus (Rolle)` ergänzt — Version vorher `8f9cd942…`, nachher `cb041c4a…`.
      Prompt `findus` (Airtable Prompts `recU0ySXivoKFhXdR`): Werkzeugliste + KLIENTEN-SPERRE ('klient' = gesperrt,
      'ehemaliger Klient'/leer = Prüfpunkt). Alte Stellen gesichert in Drive
      `VERALTET-prompt-findus-2026-09-25 (vor Klienten-Regel)` `1lnye4vkJWEg3d-_3jLfGbrYyJJBrkalv`.
    - Kein Testlauf (braucht Biancas Go; Anthropic-Timeout-Fix läuft parallel).
    - Nebenbefund (Block 3): Prompt nennt Werkzeug „Websuche", das es nicht gibt (nur „HTTP Request" = einzelne URL).
20. **Stand aus Anthropic-Session gelesen:** Worker v2 deployed; Bravo-6-Wochenlauf-Test 25.09. 13:47 erfolgreich (Exec 5818/5819),
    **6 Firmen in der Akquise-Pipeline** (Stage identifiziert). Bravo-6-„HTTP Request" dort auf Seiteninhalt gekürzt.
21. **ad 1 Go (Findus-Test):** Test-Workflow `PD - TEST Findus Klienten-Sperre` `H79EOEXmQe5NfQQb` angelegt, in Biancas Projekt
    übertragen, aktiviert, ausgelöst (15:37, Findus-Exec 5855), wird nach Ende deaktiviert (nicht gelöscht).
    Auftrag: Heaten GL Vertrieb, höchstens 2 LinkedIn-Suchen, max. 10 Vorschläge, Off-Limits + Klientenliste ausweisen.
22. **ad 3 DuckDuckGo-Test (Go Bianca):** Test-Workflow `PD - TEST DuckDuckGo` `j8XIP3aX8fEhTbEX` (Exec 5856, 15:38):
    6 Anfragen an `html.duckduckgo.com` von n8n Cloud aus → **alle HTTP 202 mit Sperrseite, 0 Treffer — schon ab der ersten Anfrage.**
    Workflow danach deaktiviert (nicht gelöscht). Ergebnis: kostenlose Suchmaschine per HTTP Request ist von rhineshore aus
    nicht nutzbar (Google 19.09. ebenfalls gesperrt) → Websuche nur über Such-API mit Freikontingent.
23. **Findus-Test Ergebnis (Exec 5855, 15:37–15:39, success; Test-Workflow `H79EOEXmQe5NfQQb` danach deaktiviert):**
    - **Klienten-Sperre wirkt:** `Findus_Klients_lesen` 1× aufgerufen; Off-Limits getrennt ausgewiesen: Mandatsfeld (INNIO,
      Clarke Energy) + 8 aktuelle Klienten gesperrt (Optimed, Interroll, Heaten, Actoom, Glas-Lerchenmüller, heinekingmedia,
      Durable, Cofibra) + Kendox (ehemaliger Klient) als Prüfpunkt. Bestand Heaten (34 Funnel-Einträge) korrekt gelesen,
      Pools A–D + Booleans geliefert.
    - **LinkedIn: 0 Treffer in allen 3 Suchen** (kein technischer Fehler, Unipile antwortet sauber): Booleans zu lang
      (5 Titel × 7–8 Begriffe + NOT-Klauseln im Keyword-String); ein Aufruf ohne Keywords. Die Erfahrung vom 21.09.
      („kurze Booleans, max. 3 OR je Gruppe, kein NOT im Keyword-String, NOT über Sales Navigator/Filter") steht nur im
      Vorlage-Workflow `PD - Sourcing starten` `0xmEtvzNamAzRhil`, NICHT im Findus-Prompt → Vorschlag: in Prompt übernehmen.
24. **Go Bianca 1+2+3.** Kritik Bianca: Die Boolean-Lehre vom 21.09. war schon bekannt — warum zweimal?
    Ursache: Die Lehre stand nur im Auftragstext der Vorlage `PD - Sourcing starten` `0xmEtvzNamAzRhil`, nicht im
    Findus-Prompt; jeder andere Auftragsweg (Centcom, Test) bekam sie nicht. **Neue Regel in CLAUDE.md:** Lehren gehören in
    den Agenten-Prompt/Kondensat, nie nur in einen Auftrag; vor Tests Protokolle/Vorlagen nach Lehren durchsuchen.
    - **Findus-Prompt `recU0ySXivoKFhXdR` geändert:** Werkzeugliste korrigiert (Findus_LinkedIn_Orte, HTTP Request statt
      nicht existierender „Websuche"), SUCHKANAELE (HTTP Request nie für Suchmaschinen, max. 3 Abrufe), neuer Abschnitt
      LINKEDIN-SUCHREGELN (Keywords Pflicht; 1 Titel- AND 1 Branchengruppe, max. 3 OR je Gruppe; kein NOT/Ort im Keyword-String,
      Region über such_orte, Off-Limits/Klienten nach der Suche filtern; erst classic, dann sales_navigator; bei 0 Treffern
      vereinfachen; max. 5 Suchen), AUSGABE max. 1.200 Wörter / 20 Tabellenzeilen. Sicherung der alten Stellen:
      Drive `VERALTET-prompt-findus-2026-09-25 (vor LinkedIn-Suchregeln)` `1ZsG4WuQ9RJe1xm3rQxQ9mlaanxVoNMZX`.
    - Test 2 gestartet (gleicher Heaten-Auftrag, Test-Workflow `H79EOEXmQe5NfQQb` reaktiviert, danach wieder deaktiviert).
    - **Block 3 Recherche (25.09.):** Tavily: 1.000 Credits/Monat frei, keine Kreditkarte; Basic-Suche 1 Credit, Advanced 2;
      danach 0,008 $/Credit. Brave Search API: 5 $ Freiguthaben/Monat (= 1.000 Anfragen), danach 5 $/1.000, Kreditkarte Pflicht,
      Speichern von Ergebnissen für KI nur mit Sonderplan. Geschätzter Bedarf ca. 150 Suchen/Monat.
25. **Findus-Test 2 (Exec 5859, 17:47–17:49 MESZ, success):** LinkedIn-Suchregeln greifen — 2 kurze Booleans
    (je 3 Titel AND 3 Branchenbegriffe, kein NOT, Orte über IDs) → **je 10 Treffer**; 10 Kandidaten in der Longlist
    (Schwerpunkt NRW = Mandatsregion Remscheid), Klientenliste gelesen. Offen: bei 7 von 10 fehlt die aktuelle Firma im
    LinkedIn-Treffer → Off-Limits-/Klientenprüfung für diese nur manuell möglich; Antwort 1.778 Wörter statt max. 1.200.
    Test-Workflow wieder deaktiviert.
26. **BAUSTELLEN-Dokument (Bianca-Anweisung):** Drive `BAUSTELLEN-2026-09-25` gelesen, keine Kollision. Da Google Docs mit
    den verfügbaren Werkzeugen nicht bearbeitbar sind: neue Fassung `1TS3cGqv8-kPl2ua9HxWqrSmg1UxSEXa5HxPoRY4h6HY` mit allen
    bisherigen Zeilen + Zeilen dieser Sitzung (Findus, Test-Workflows, Cockpit, Wochenlauf — alle „frei"); alte Fassung
    umbenannt in `VERALTET-BAUSTELLEN-2026-09-25 (Stand 17:47)` `1ZlPgENl3sMwICZX1HTY5QCfwxiEn3-A8T7WO00SXBso`.
    Vermerk zu den 17:01-Fehlern („cannot be called by this workflow"): nicht diese Sitzung; mögliche Ursache Projekt-Eigentümer
    bei per API angelegten Workflows (→ /transfer).
27. **Websuche (Tavily) eingebaut (Go Bianca „bau ein"):** Credential `tavily` Bearer Auth `CYRiV69Dc0HY8qck` (Bianca; zusätzlich
    existiert ein Header-Auth-Credential `tavily` `3AghToOeAsBrXcBO` — nicht angefasst). Erster PUT abgelehnt („no access to
    credentials"): Credential lag nur in Biancas Projekt, API-Key = Philipps Konto → Bianca hat es mit Philipp geteilt.
    - Knoten „Websuche" (POST api.tavily.com/search, basic, max. 5 Treffer, thema general|news) in
      Findus `oTeQ…` (Version `cb041c4a…` → `92914acb…`) und Bravo 6 `SvC6…` (`af77d339…` → `158c0f8d…`).
    - Prompts: findus (Werkzeugliste + Suchkanäle: Websuche für Unternehmen, max. 5), bravo 6 (Suchkanäle neu: Websuche für
      Signale max. 8, LinkedIn-Regeln wie Findus, HTTP Request nie für Suchmaschinen). Sicherung Drive
      `VERALTET-prompts-findus-bravo6-2026-09-25 (vor Websuche Tavily)` `1v1sGDxfhJ5tKcUP8X7BlCqvrdX4zzmj7`.
    - BAUSTELLEN: Fork-Chaos 17:55 (Search + Memory-Pilot gleichzeitig) → Prozesscheck hat 18:05 zusammengeführt; Forks
      umbenannt; Einträge Findus/Bravo 6 belegt 18:05 → frei 18:20 (aktuelle Fassung `1mkcybTQ-nvvO3cYn8esKk3BQog2fNV6Inpk3IFTRz9k`).
    - Test steht aus (eigene Frage an Bianca).
28. **Bianca 20:05:** Interroll-Masse: Philipp will 50 Antworten (Erfahrung 10 % → ca. 500 Ansprachen); Staging-Tabelle ja;
    Philipp hat Sales Navigator; Go für Websuche-Test.
    - BAUSTELLEN: Fassung 18:20 (Anthropic-Zugang) gelesen; neue Fassung 20:10 `1dsZ_GLtXIBAWZIAGZ9hzdzx1WGQQJFdC8TXkmeZv_MY`
      mit `H79EOEXmQe5NfQQb` belegt; Vorfassung umbenannt.
    - Test-Workflow `H79E…` Auftrag geändert (Interroll Neu-Start, 1–3 Websuchen, max. 2 LinkedIn-Suchen), Version `d78584a6…`,
      aktiviert und ausgelöst 20:13.
    - **Bauplan Massensuche** (nur Plan + Roast): `docs/BAUPLAN-2026-09-25-interroll-massensuche.md`. Kern: Engpass ist die
      Ansprache (ca. 200 Vernetzungsanfragen/Woche), nicht die Suche (Sales Navigator 2.500 Treffer/Suche).
29. **Websuche-Test (Findus Exec 6007, 20:12–20:15, success; Test-Workflow wieder deaktiviert):**
    - **Websuche (Tavily) funktioniert:** 3 Suchen, je 5 Treffer mit Textauszug; Zielfirmen werden mit Domain belegt
      (z. B. Bonfiglioli, Linde MH, MLOG, Columbus McKinnon via induux.de; Dematic/KION via statista.de), der Rest
      sauber als ANNAHME markiert.
    - LinkedIn: 2 von 3 Suchen je 10 Treffer; **1 Aufruf wieder ohne Keywords** (trotz Regel 1) → Vorschlag: Werkzeug
      technisch sperren (leere Keywords gar nicht erst an Unipile senden). Booleans teils ohne Klammern/AND.
    - Antwort 1.767 Wörter (Ziel max. 1.200) — Längengrenze wird ignoriert → Vorschlag: maxTokens senken oder Ausgabe kürzen lassen.
30. **BAUSTELLEN nach Test:** Fork 20:19 (Memory-Pilot) / 20:20 (Search) → von Search zusammengeführt
    (`1gummvYMrgMpY8Q0Oo4lCXGxRCjsLnsscqxLkzh9B_uA`, 20:25), Forks umbenannt, Nachprüfung ohne weitere Fassung.
    H79E, Findus, Bravo 6 = frei. Hinweis: Suche „title = …" findet nicht zuverlässig alle Fassungen →
    `title contains 'BAUSTELLEN' and createdTime > …` nutzen. Vorschlag an Bianca: Baustellen-Liste als Airtable-Tabelle
    (Zeilen einzeln bearbeitbar → keine Forks).
