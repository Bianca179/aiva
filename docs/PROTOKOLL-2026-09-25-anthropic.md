# Protokoll 25.09.2026 — Anthropic-Zugang Rhineshore/CENTCOM nachhaltig

> Laufendes Protokoll dieser Session. Neueste Einträge unten. Startprompt: `docs/START-SESSION-ANTHROPIC.md`.

## Feste Fakten (nicht erneut fragen)
- „Anthropic account" `nrZkUZIQhvT2REnB` = Biancas eigenes Konto, ohne Guthaben. Bianca trägt keine Rhineshore-Kosten.
- **Ziel-Credential: „Anthropic Rhineshore" `SAq68yfgETKLhMev` = Philipps Konto.** Guthaben und Auto-Reload verantwortet **Philipp**.
  Der Key in `SAq68…` wurde am 25.09. zwischen 06:20 und 10:20 getauscht (06:20 „credit balance too low", 10:20 wieder ok).
- Sicherung vor jedem Ersetzen: **nur n8n-Versionierung** (Bianca 25.09.); alte `versionId` je Umbau hier notieren.

## Verlauf
1. **Stand gelesen:** `CLAUDE.md`, `docs/PROTOKOLL-2026-09-25-SEARCH.md` (Punkt 15), Drive `CENTCOM-OFFENE-PUNKTE-2026-09-25 (Stand 09:45)`,
   Proxy-Code `worker-anthropic-cache.js` (Drive `1HBCi_g0zHzWYOWh7Cj5B7y1vpWHcCZlD`).
2. **Inventur (nur lesend), 116 Workflows, 55 aktiv:**
   - `nrZk…` aktiv (6): Centcom `uhJLPwsa8wTFTDAa`, CENTCOM still `75lT7ogXUNBDwDwW`, Findus `oTeQ7TTbTxP0Dfxu`,
     Bravo 6 `SvC6VfroWvcuhAy1`, McGonnagal `L5OJCDruVuwGf5Mh`, Fletcher `VufJGSTnRHFRPUDg` (alle LangChain).
   - `nrZk…` inaktiv (21), darunter **`PD - Komponist` `OM7PyMRW0YsNUwJ0`: inaktiv, läuft aber täglich als Sub-Workflow
     von `PD - Puls` `bUb7kRN6JoJenkN9`** (Exec 5661, 25.09. 06:15: credit balance).
   - `SAq68…` über **LangChain = über den Proxy** (9, aktiv): Postausgangs-Pass v2, CV-Intake (nur ALT-Knoten), Dossier,
     Bravo 7, Delta 3, Dokumenttyp, Monk, Monk Dokumente, Voicespiegel.
   - `SAq68…` über **HTTP direkt an api.anthropic.com** (kein Proxy): Inbox-Pass v2.1b, Router, Entwurf schreiben,
     Klick-Abgleich, LinkedIn-Pass, Termin vorbereiten, CV-Intake.
   - Korrektur: „Entwurf schreiben ruft ohne Credential auf" stimmt nicht — Code-Knoten „Prompt bauen" setzt nur die URL,
     Aufruf im HTTP-Knoten „Modell (Anthropic)" mit `SAq68…`.
3. **Stille Fehler:** Centcom, CENTCOM still, Komponist, LinkedIn-Pass stehen trotz „credit balance"/„timed out" auf
   `success`. `PD - Fehleralarm` `SdR76scsRwpxkSU0` sieht nur Status `error` → Wächter muss Laufinhalte prüfen.
4. **Caching-Rechnung (Findus Exec 4847, 22.09., 7 Runden, n8n-Schätzwerte, Sonnet 4.6):** ohne Cache 0,344 $/Lauf,
   mit Proxy 0,163 $ (−53 %). Einzelaufruf (Postausgangs-Pass, Haiku, 6.615 Tok.): mit Proxy +25 % (Cache-Write ohne Read).
   HTTP-Knoten cachen bereits selbst (LinkedIn-Pass 10:20: 5.093 Tok. aus Cache).
5. **Entscheidungen Bianca:** PR #11 gemergt (CLAUDE.md jetzt auf `main`). **Proxy behalten, nur für Agenten, Timeout bis
   Dienstag (Bravo-6-Wochenlauf 29.09. 07:00) lösen.** Inaktive Workflows nicht umstellen; stattdessen entfernt Bianca
   den Key aus `nrZk…` (Ausnahme Komponist → wird umgestellt). ZZ-ARCHIV unberührt.
6. **Beleg Timeout:** Findus Exec 4790 (21.09., Credential `nrZk…`): Knoten „Claude (Findus-Gehirn)" nach 125 s:
   „The origin web server did not return a complete response within the 120-second Proxy Read Timeout window" (Cloudflare).
   Runde 7 in Exec 4847 brauchte 75 s für 2.759 Ausgabe-Tokens; maxTokens der Agenten 16.000–20.000.
   Offen/unbelegt: Voicespiegel „Request timed out" nach 10,6 s (Exec 5665) — braucht Cloudflare-Logs.
7. **Paket 1 umgesetzt (Go Bianca):** Credential `nrZk…` → `SAq68…` im Claude-Knoten, sonst nichts geändert.
   | Workflow | Knoten | versionId vorher | versionId neu (aktiv) |
   |---|---|---|---|
   | PD - Bravo 6 (Rolle) `SvC6VfroWvcuhAy1` | Claude (Bravo-6-Gehirn) | `754e03bd-4c28-4a09-8d74-dbba5b459111` | `ad44018e-ec60-4deb-af8f-f60b91a850c6` |
   | PD - Findus (Rolle) `oTeQ7TTbTxP0Dfxu` | Claude (Findus-Gehirn) | `204d2ee3-26c1-4698-a43c-50b53d5ee5fe` | `8f9cd942-93f5-4b42-a549-2bade111604f` |
   | Centcom `uhJLPwsa8wTFTDAa` | Claude (CENTCOM-Gehirn) | `f644e17b-6fc1-4654-8e26-93cad54b4911` | `a6cd126b-e3f7-49d1-9fd2-4658dfeb8ce6` |
   Neue Version ist sofort aktiv (activeVersionId = versionId), kein separates Publish nötig. Rückweg: n8n-Versionierung.
   Testlauf steht aus (Go Bianca).
8. **Worker v2 freigegeben (Go Bianca), Cloudflare-Tarif: kostenlos** (10 ms CPU je Anfrage).
9. **Worker v2 gebaut** (`cloudflare/worker-anthropic-cache-v2.js`, Drive `1NM_2Leg-YBuoGg9KchJyb7L91WYzbBoY`,
   neben v1; v1 unverändert). Cache nur bei Anfragen mit Werkzeugen (Agenten); Agenten-Anfragen holt der Worker als Stream,
   n8n bekommt sofort den Kopf + alle 10 s ein Leerzeichen + am Ende die normale JSON-Antwort. Fehler vor Stream-Beginn
   mit echtem Status; Abbruch mitten im Stream → absichtlich ungültiges JSON „PROXY-ABBRUCH …" (Lauf wird rot).
   Lokal getestet (`node cloudflare/test-worker-v2.mjs --puls`): 11/11 bestanden, u. a. credit balance 400, 429/529,
   Abbruch, Werkzeugaufruf, Thinking-Signatur, Puls nach 0/10/20 s bei 25-s-Antwort.
   CPU der reinen Worker-Logik bei 16.000 Ausgabe-Tokens ca. 3–5 ms (Node, warm) — Free-Tarif erlaubt 10 ms; kalter Start
   in Cloudflare unbelegt. Überschreitung → sichtbarer Fehler (kein stilles Scheitern). Beim Umzug zu Philipp: Workers Paid erwägen.
   Deployment durch Bianca (Cloudflare-Dashboard), Rückweg: Cloudflare-Rollback auf vorige Version.
10. **Worker v2 von Bianca deployed. Testlauf (Go Bianca) Bravo-6-Wochenlauf, 25.09. 13:47 UTC:**
    - Temporärer Test-Webhook eingebaut (versionId `4814e850-…`), ausgelöst, sofort wieder entfernt
      (versionId `ae85c93f-1f9a-4977-b01b-c6c3aa8de210`, 8 Knoten, aktiv, Dienstag 07:00 unverändert).
    - **Wochenlauf Exec 5818: success** (2 min 35 s). **Bravo 6 Exec 5819: success** über `SAq68…` + Worker v2.
      5 Modellrunden: 4,3 / 7,8 / 13,1 / 9,9 / **105,5 s** — letzte Runde knapp unter der früheren 120-s-Abbruchgrenze, lief durch.
    - **6 Einträge in der Akquise-Pipeline angelegt** (Stage `identifiziert`, Intent `search-akquise`, Branche `Other`),
      Signale: Exec-Vakanzen auf LinkedIn (GF Deutschland, Country Manager, General Manager DACH, Country Director, Vertriebsleitung).
    - **Kostentreiber gefunden:** Werkzeug „HTTP Request" lädt LinkedIn-Stellenseiten als rohes HTML (357.000 und 309.000 Zeichen)
      in den Verlauf → letzte Runde ca. 270.000 Eingabe-Tokens (n8n-Schätzung). Vorschlag: Abruf kürzen/HTML entfernen (eigener Umbau, Go nötig).
    - Findus und Centcom: Test per Slack-Zuruf durch Bianca (beide haben keinen API-Auslöser).
11. **Slack-Test Centcom (Bianca, 13:53 UTC):** Exec 5820 und 5822 success, Antworten kamen. Centcom kennt den Begriff
    „Klicks" nicht (fragt nach) — Punkt für Offene Punkte (Vokabular Cockpit ↔ Centcom). Findus wurde NICHT aufgerufen:
    Centcom hat die Mandatsliste selbst aus dem SSOT gezogen („Findus ist für Sourcing innerhalb eines Mandats"). Findus ungetestet.
12. **Paket 2 umgesetzt (Go Bianca):** Credential `nrZk…` → `SAq68…`.
    | Workflow | Knoten | versionId vorher | versionId neu |
    |---|---|---|---|
    | PD - CENTCOM still (Verteiler) `75lT7ogXUNBDwDwW` | Claude (still) | `0fa06590-c8c5-4c91-9acf-caede3ee0ae8` | `dc427b6e-c82a-400b-93de-fb0e1b846487` |
    | PD - McGonnagal (Rolle) `L5OJCDruVuwGf5Mh` | Claude (McGonnagal-Gehirn) | `0bbf8f51-7fad-48a1-b8ca-65f543ec6c61` | `fd808da6-e0bd-4b7f-859b-325e63459c14` |
    | Fletcher — Kandidatenvorstellung `VufJGSTnRHFRPUDg` | Claude (Fletcher) | `1b08a82a-9002-4f1f-bf35-f98937cc1bdb` | `bf5f2da2-e696-4424-910a-f4cebb117104` |
    | PD - Komponist `OM7PyMRW0YsNUwJ0` (inaktiv, von Puls aufgerufen) | Kopf texten (HTTP) | `1fff9a45-78a6-4aea-b54b-68e0e711599f` | `7e8b0dc0-8296-4da9-8f77-9cf45163db94` |
13. **Gegenprobe (alle 116 Workflows neu gelesen):** kein aktiver Workflow nutzt `nrZk…`; kein inaktiver, der (auch über Ketten)
    von einem aktiven aufgerufen wird. 19 inaktive (Altfassungen, ZZ-ARCHIV) nutzen `nrZk…` noch → Bianca entfernt den Key.
    **Ziel 1 erreicht.**
14. **Kosten der Tests (Schätzung aus n8n-Tokenzahlen, Listenpreise; genaue Zahl nur in der Anthropic Console):**
    Bravo 6 (Sonnet 4.6): 343.314 Eingabe + 6.459 Ausgabe ≈ 1,13 $ (mit Cache-Schreibaufschlag höchstens ≈ 1,40 $).
    Centcom 2 Zurufe (Sonnet 5): 132.177 Eingabe + 2.146 Ausgabe ≈ 0,29 $. Zusammen ≈ 1,40–1,70 $.
15. **Plan Bravo-6-HTML-Abruf:** Werkzeug „HTTP Request" in Bravo 6 erhält dieselben Einstellungen wie das bewährte in Findus
    (nur Seiteninhalt, ohne script/style/nav/…, gekürzt auf 6.000 Zeichen, Timeout 15 s).
16. **Entscheidungen Bianca:** HTML-Abruf Go; Test erst im echten Wochenlauf Dienstag 29.09. 07:00; Findus-Test beim nächsten echten Auftrag.
17. **Bravo 6 `SvC6VfroWvcuhAy1`, Knoten „HTTP Request" umgebaut:** Parameter 1:1 aus Findus übernommen (nur Seiteninhalt,
    script/style/nav/footer/header/svg/noscript/iframe entfernt, max. 6.000 Zeichen, Timeout 15 s). URL-Parameter unverändert.
    versionId `ad44018e-ec60-4deb-af8f-f60b91a850c6` → `af77d339-e23c-4bb4-9f46-85ac81d46744` (sofort aktiv).
    Erwartung: letzte Runde statt ca. 270.000 nur ca. 40.000 Eingabe-Tokens (≈ 0,30 $ statt 1,13 $ je Wochenlauf) — Beleg Dienstag.
18. **Vorprüfung Wächter:** alle 55 aktiven Workflows speichern Erfolgs- und Fehlerdaten (Standard) → Wächter kann Laufinhalte lesen.
    `PD - Fehleralarm` schreibt mit Slack-Credential „Slack account" `4uKZNVEDjJYBbPWa` in Kanal `C0BJE4M6Y92` (#maschinenraum).
    Sitzungs-API-Key läuft am 01.10.2026 ab → Wächter braucht eigenen, dauerhaften Key (Credential legt Bianca an).
19. **Korrekturen Bianca zum Wächter-Plan:** Slack-Credential ist „Slack account" `4uKZNVEDjJYBbPWa` (das einzige in rhineshore).
    Datenmenge ernst nehmen; keine Kostenrückkehr; alles direkt in rhineshore bauen, nichts verschieben; Philipp nicht @-erwähnen.
    Dauerhafter API-Key für den Wächter: Bianca holt ihn bei Gelegenheit nach. Sitzungs-Key gilt bis 01.10.2026 22:00 UTC.
20. **Wächter lokal gebaut (noch NICHT auf rhineshore):** `n8n/waechter/` (auswaehlen.js, auswerten.js, workflow.json, test-waechter.mjs).
    Stündlich Mo–Fr 06–21 Uhr (≈ 330 Ausführungen/Monat), kein KI-Modell, speichert eigene Erfolgsläufe nicht.
    Liest nur Läufe der 23 Anthropic-Workflows mit Inhalt; prüft strukturell (Knotenfehler, `json.error` bei „weitermachen",
    Anthropic-Fehlerantwort bei neverError, leere Agenten-Antwort, Zeitplan nicht gelaufen). Sperre 6 h je Workflow+Kategorie.
    - Tests mit echten Läufen: 9/9 bestanden (u. a. zitierter Alarmtext in Centcom 5667 wird NICHT gemeldet).
    - Probe über alle 110 relevanten Läufe 23.09. 16:45 – 25.09. 14:20: 11 Befunde, alle echt, darunter bisher unbekannt:
      **Router 5672 „credit balance" (Lauf grün)**; **CENTCOM still 5340: Airtable-Filter „Unknown field names: geschäftsbereich"
      im Werkzeug Mandate_lesen (Lauf grün)**; CV-Intake 5401 „Invalid URL" (Lauf grün).
    - Datenmenge real: 110 Läufe = 51 MB in 45 h (≈ 1,1 MB/h). Größter Brocken Inbox-Pass: bis 7,3 MB je Lauf (3× werktags).
21. **Wächter nicht als eigener Workflow**, sondern als Zweig in `PD - Verbrauch zählen` `kKIevwJ1wAvZOet2` (parallele Sitzung,
    Kostenzähler fürs Cockpit, Tabelle „Modellverbrauch" `sJMaUoMxkn739kZp`) → keine zusätzlichen Downloads/Ausführungen. Go Bianca.
    Tabelle 18.–25.09.: 34,57 $ über „Anthropic account" (Bianca), 2,96 $ über „Anthropic Rhineshore". Größter Treiber
    **CENTCOM still 25,46 $** (59 Läufe, 11,2 Mio. Eingabe-Tokens, bis 15 Aufrufe/600.000 Tokens je Lauf).
22. **Zähler repariert (Go Bianca „mach du das"):**
    - Befund: seit Aktivierung keine neuen Zeilen (höchste lauf_id 5805 = einmalige Nachbefüllung 12:47 UTC). Exec 5845 (15:07 UTC)
      rot: „Workflows lesen does not have access to the credential"; kein Fehler-Workflow → still.
    - Zweiter Befund: Filter „Workflows lesen" `activeWorkflows: false` → API liefert NUR die 60 inaktiven Workflows.
    - Credential „rhineshore Verbrauch" `k2DNRjogvCUwAVn8`: Verbindungstest rot („Couldn't connect") → Bianca hat neuen
      n8n-API-Key ohne Ablauf eingetragen (15:45 UTC). Derselbe Key dient künftig dem Wächter.
    - Fehler-Workflow `SdR76scsRwpxkSU0` gesetzt. Filter leeren per API nicht möglich (n8n setzt `false` wieder ein) →
      auf `activeWorkflows: true` gestellt (nur aktive; inaktiver Komponist wird nicht gezählt, Cent-Beträge).
      versionId `419ce2a2-d91e-4153-8e9c-a20188263f4f` → `d7a269aa-b87f-4376-b210-aa4dffb71370` (aktiv).
23. **Wächter-Zweige lokal gebaut und getestet** (`n8n/waechter/zweig-laeufe-pruefen.js`, `zweig-zeitplan-pruefen.js`,
    Test `test-zweige.mjs` 8/8, Probe 110 Läufe → 11 Befunde). „Läufe prüfen" hinter „Lauf lesen", „Zeitplan prüfen" hinter
    „Läufe lesen", beide „bei Fehler weitermachen" (Zähler wird nie gestört), Slack über „Slack account" nach #maschinenraum.
24. **Zähler läuft wieder:** Lauf 18:07 MESZ fehlerfrei, 18 neue Zeilen (u. a. Bravo 6 Exec 5819 = 1,13 $, deckt sich mit Schätzung).
    Findus lief 2× echt über „Anthropic Rhineshore" + Worker v2 (Exec 5855, 5859, success; letzte Runden 100 s und 110 s).
    Exec 5855: „Beide LinkedIn-Suchen liefern 0 Treffer — technisches Problem" (Unipile) → offener Punkt.
25. **BAUSTELLEN-2026-09-25 (Drive):** Sitzungen legen neue Fassungen an (Drive kann nicht bearbeiten). Zweimal Fork (Prozesscheck,
    Search) → zusammengeführt, gültig: Doc `1uXmiNPvV-bTw1pD5n5-lDXlnp-oVLcYROkUGZk7G5Pw`. Zeilen „Anthropic-Zugang" eingetragen,
    `PD - Verbrauch zählen` belegt bis 21:00. Search hat Findus/Bravo 6 (Tavily) nach meinen Änderungen umgebaut; geprüft 18:14:
    Credential „Anthropic Rhineshore" und HTML-Abruf 6.000 Zeichen erhalten.
26. **Wächter-Zweig in `PD - Verbrauch zählen` eingebaut (Go Bianca):** „Wächter: Zeitplan prüfen" (hinter „Läufe lesen"),
    „Wächter: Läufe prüfen" (hinter „Lauf lesen"), „Wächter: nach maschinenraum" (Slack account → C0BJE4M6Y92), Hinweis-Notiz.
    Code-Knoten „bei Fehler weitermachen"; Knoten unterhalb des Zählers → Zähler rechnet/speichert zuerst.
    versionId `d7a269aa-b87f-4376-b210-aa4dffb71370` → `b7046a88-d06c-4d73-af0b-e5aa2054fae3` (aktiv). Erster Lauf: nächste volle Stunde :07.
