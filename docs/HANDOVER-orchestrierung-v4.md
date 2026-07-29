# HANDOVER v4 — Orchestrierung Bianca (Kernteam live)

**Stand:** 21.07.2026 · Ersetzt/erweitert HANDOVER v3 (07.07.) + DIRIGENT-v2-Plan (14.07.)
**Nächste Session:** „Lies dieses HANDOVER, dann starten wir das **Marketingteam**." Kernteam läuft — nicht neu bauen, nur andocken.

> Kurz-Einstieg: Alles läuft über **n8n** (Instanz `aiva179.app.n8n.cloud`) + **Airtable-Registry** + **Slack** + **Langdock**-Agenten. Prinzip: Ein Dirigent-Workflow routet Slack-Kanal → Registry → Langdock-Agent → Antwort im Thread. Registry-getrieben = whitelabel-fähig.

---

## 1 · Was JETZT live ist (n8n, alle aktiv)

| Workflow | ID | Trigger | Zweck |
|---|---|---|---|
| **ORCH - Dirigent - v2** | `SpWLJA34XuMpI6qs` | Webhook `/slack-dirigent` | Herzstück: Kanal→Registry→Langdock, **Gedächtnis**, **A2A**, Identität (sendAsUser) |
| **ORCH - Donna Morgenpost - v1** | `YG0GEWgHdxkqfkVR` | tgl. 07:00 + stündl. 9–17 | Inbox-Triage, Entwürfe, Termine + gestrige Reflexion, Briefing-DM |
| **ORCH - Donna Wochenreview - v1** | `4GBtzm8U2GwYW5aj` | Fr 16:00 | Wochenrückblick + Planung nächste Woche, DM an Bianca |
| **ORCH - aurea Lexware-Sync - v1** | `m6VbW9Mj7f6QrZXT` | Mo–Fr 07:30 | Offene Forderungen/Verbindlichkeiten aus Lexware → Lagebild in #aurea (nur lesend) |
| **ORCH - Donna Rechnungen → Lexware - v1** | `yWMtiz2SLUfmK1yi` | Mo–Fr 8/13/18 | Rechnungen aus Gmail-Label an Lexware weiterleiten (PDF), Dublettenschutz |
| ORCH - Abendreflexion - v1 | `iL8zq1PqPhSfu3J8` | tgl. 17:00, #reflexion | Bestand (schreibt Reflexionen ins Logbuch, Quelle=Bianca) |

**Abgelöst/archiviert:** `ORCH - Agent-Router - v1.1` (`tGFc00UTTW2hcmVX`, archiviert — Vorgänger ohne Gedächtnis). Alte Telegram-„Donna" (`08Ujzde2NU7wRtzI`) existiert noch — kann echte Mails senden, widerspricht Stufe-1; prüfen/abschalten falls noch aktiv.

**Slack Event-URL** zeigt auf `https://aiva179.app.n8n.cloud/webhook/slack-dirigent` (Cutover erfolgt 20.07.).

---

## 2 · Infrastruktur-IDs

**Airtable Basis:** `app9r4BK5FJTU219P`
| Tabelle | ID | Zweck |
|---|---|---|
| Team (Registry) | `tbl72m0LzgoCmadrV` | Agenten-Stammdaten, Routing, Berichtslinien, A2A |
| Logbuch | `tblkp0LVz3voBPEhr` | Stufe-1-Aktionen + Reflexionen (⚠ geteilt mit Kunde, s.u.) |
| Präzedenzfälle | `tblr5qCqZpfDL89Ot` | Biancas Entscheidungen = Handlungsgrundlage |
| Skills | `tblaaT3X4iNpHgwG9` | Skill-Katalog |
| **Gedächtnis** (NEU 21.07.) | `tblKLft0WgrALNlIH` | Persistentes Kanal-Gesprächsgedächtnis |

**Registry-Feld-IDs (Team):** Name `fldZQsvqAXDTSQfVE` · Langdock-Agent-ID `fld04Yh1SHrrzADs1` · Slack-Kanal-ID `fldNjed0mlP1Utss7` · Reports an `fldZrDNti1gvvQDun` · From field: Reports an `fldQxSvGsROeofNS5` · Stufe-1-Scope `fldu0tRPwJ3VqJC4T` · A2A aktiv `fldKJpZloI0uL0DfW` · Status `flduDsuhfnUaq47YD` · Cluster `fldK1kmsy75amZcgV`

**Gedächtnis-Feld-IDs:** Kanal `fldVPlpqtPWjVtYUK` · Rolle `fldAYX0lS4SAxOxge` (user/assistant) · Text `fldS5T8iF6I2XUaYn` · Agent `fldk2CMkLEXcUIlOI` · Zeit `fldEFUeok181UTbrc` · Ts `fld4cGKhT9pGTGwOR` · ThreadTs `flddpfQ4DRlEUxI9D`

**n8n-Credentials (Referenzen, keine Secrets):** Gmail `AoEYEWFBZ9zCOhcK` (NEU, „Gmail account", Postfach aimeetseva@gmail.com mit verifiziertem Alias `bianca@enderlin.info`) · Slack `prP7iCIQ4gY38qJP` · Airtable `zWqHnt0xhODSDQ26` · Langdock (Bearer) `0WRSAYT7BDItXmcQ` · Google Calendar `95iezphiEusNZWZT` · Lexware Office (Bearer) `WDuvzC5hxOdLAnoj`
> ⚠ Altes Gmail-Credential `carSSWTuIx5bqTV4` war tot (revoked) — ersetzt durch `AoEYEWFBZ9zCOhcK`.

**Langdock:** Endpoint `POST https://api.langdock.com/agent/v1/chat/completions`, Auth httpBearerAuth, Body `{agentId, messages:[{id, role, parts:[{type:'text', text}]}]}`.
Agent-IDs: Donna `0b904a65-5692-445a-8d84-65815fba5aa1` · aurea `20488d09-c29a-45b9-afb3-2663cd1d0d80` · Dagobert Duck `ea678f4d-018f-4cdf-8126-0b092a5c7ef1`.

**Slack-Kanäle (Kern):** #donna `C0994PQCAHZ` · #aurea `C0BF4UUV7C5` · Ophra `C0BESSU1BHV` · Bianca (User) `U094G4R4W2X` · Team `T094G4R4VRR`. Weitere Kanal-IDs in der Registry.

**Lexware:** Zieladresse `aiva@inbox.lexware.email`, Absender MUSS `bianca@enderlin.info` sein, Beleg als Anhang. Gmail-Label „Rechnungen" = `bianca@enderlin.info/Rechnungen` (`Label_962653628868526258`). Schutz-Labels: Lexware-gesendet `Label_3`, Lexware-manuell `Label_4`, Donna-verarbeitet `Label_2`.

---

## 3 · Gedächtnis-Architektur (NEU, Kern der Session)

Dirigent v2 hat jetzt **persistentes, kanalweites Gesprächsgedächtnis** (nicht mehr nur Thread-Historie):
- **Lesen:** Knoten „Gedächtnis laden" holt letzte 21 Tage für den Kanal aus Tabelle Gedächtnis → Dirigent-Routing baut daraus `messages[]` + aktuelle Nachricht. Wirkt auch bei **neuer** Nachricht (nicht nur Thread-Reply) — die alte Amnesie-Grenze ist weg.
- **Schreiben:** Nach jeder Antwort schreiben „Gedächtnis vorbereiten" + „Gedächtnis schreiben" zwei Zeilen (user + assistant).
- **Robust:** Leeres Gedächtnis oder Airtable-Fehler bricht nichts ab (onError:continueRegularOutput, alwaysOutputData). Gilt für ALLE Agenten am Dirigenten (kanal-/registry-gesteuert).
- **Stufe 2 offen:** Aktives Fakten-Recall aus Logbuch/Präzedenzfällen NICHT gebaut — Betriebsregeln gehören in den Langdock-Prompt (BIANCA.md), nicht per Aufruf injiziert.

A2A (Delegation): sichtbar in Slack, entlang Berichtslinie (Reports an / From field), Hop-Limit 2, Kill-Switch Feld „A2A aktiv". Donna→aurea getestet. Donna & aurea haben A2A aktiv; aurea reports an Donna.

---

## 4 · Donnas Betriebsordnung (Präzedenzfälle 20.07., verknüpft mit Donna)

- **Inbox Zero:** jede Mail triagiert + abgelegt; liegen bleibt nur, was Biancas Aufmerksamkeit braucht.
- **Rechnung/Beleg** → an Lexware weiterleiten (ohne Rückfrage, Stufe 1) + Übergabe an **aurea** für Liquiditätsplan (liegt in Drive; aurea besitzt ihn — Donna nicht verwässern).
- **Newsletter** → an Petterson, archivieren.
- **Terminanfrage** → prüfen, blockieren, Mitveranstalter-Freigabe.
- **Angebot** → IMMER nur Entwurf zur Freigabe (Stufe 2). Zuständigkeit Angebotserstellung: Offerta (im Onboarding, Platzhalter).
- **Privates** → nie bearbeiten, nur melden.
- **Default sonst** → Entwurf in Biancas Stimme.
- **Fokus-Schutz (Dauerauftrag):** Biancas Fokusverlust kostet Geld → bündeln statt unterbrechen, ein Thema pro Nachricht, Sprints/Quick Wins, Angefangenes bis zum Abschluss nachhalten („fängt gut an, lässt nach").
- **Rhythmen:** Fr OKR-Update mit **Ophra** → Zusammenfassung an Bianca ZUR FREIGABE · Mi Sales-Stände von **Sam Sales** (nicht Max) · tgl. Abendreflexion + Skill-Training mit **Dagobert Duck** und **Petra**.

Stufe-1-Scope ist auch in Donnas Registry-Zeile (`recWAmi8Jwk2DGp0Y`) hinterlegt.

---

## 5 · Bekannte Fallstricke / Gelöstes (wichtig für nächste Builds)

1. **Geteiltes Logbuch:** Qualitaetia (JUMIS-Kunden-QM, eigenes Outlook, NICHT Biancas Gmail) schreibt in DASSELBE Logbuch (`tblkp0LVz3voBPEhr`). Wochenreview filtert `{Quelle}!='Qualitaetia'`. **Whitelabel-Fix später: getrennte Logbücher pro Kontext.**
2. **Gmail-Suche & Bindestriche:** Label-Namen mit `-` (z.B. „Lexware-gesendet") werden vom `-`-Operator zerlegt → in Query IMMER quoten: `-label:"Lexware-gesendet"`.
3. **`resultSizeEstimate` unzuverlässig** (Gmail) — echte Zahl nur aus `messages.length`.
4. **Langdock-Datenhoheit:** aurea hatte fremde Kundendaten als Quelle (bereinigt). Donnas Langdock-Agent zieht noch einen **fremden „Philipp/Rhineshore"-Skill „daily-briefing"** — Bianca muss ihn in Langdock entfernen. Bei jedem Agenten prüfen: nur eigene Quellen.
5. **n8n Airtable-Node** liefert Records als `json.fields.{...}` (nicht flach).
6. **Executive-Kommunikation:** Donnas Antworten zu lang/Markdown-lastig. Prompt-Baustein für Langdock steht bereit (kurz, Slack-tauglich, keine Mandatsprüfung erklären). Bianca fügt ein.

---

## 6 · OFFEN auf Biancas Seite (Langdock — kein n8n-Zugriff)
- [ ] Donnas fremden „daily-briefing/Philipp"-Skill entfernen.
- [ ] Executive-Kommunikations-Baustein in Donnas Langdock-Prompt einfügen.
- [ ] Betriebsregeln (Präzedenzfälle) als „Verfassung" in Langdock/BIANCA.md verankern (Stufe-2-Ersatz).
- [ ] Lexware-Weiterleitung in Lexware gegenprüfen (16 Juli-Rechnungen gesendet 21.07.).
- [ ] 1 Rechnung ohne PDF („Lexware-manuell") von Hand schicken.

---

## 7 · NÄCHSTER SCHRITT: Marketingteam

**Ziel Bianca:** Multiagentensystem sauber aufbauen → später Whitelabel für das Kernteam, DANN Marketingteam. Schritt für Schritt.

**Was wir wissen:**
- **Max** = Senior Marketing Stratege, berichtet an **Constance** (CCO). Zentraler Ansprechpartner Marketing.
- Berichtslinien (HANDOVER v3): Linni/Max/Voca → Constance · Sam Sales → Donna · Leandra → Sam · Rest → Bianca.
- **Linni:** LinkedIn-Stimme; LinkedIn Lead wird in Linni fusioniert. Bestehender Linni-Workflow (`11UxePeldz86cqxp`, inaktiv, ~140 Nodes) ist eine **Vorlagen-Kopie mit Guardrail-Verletzung** (LinkedIn-Post ohne Freigabe, fremde Base/Person-ID, Feldname-Bruch). NICHT reparieren — neu & schlank am Dirigenten aufsetzen, mit Stufe-2-Freigabe-Gate vor jedem Post.
- **Voca** (Assistenz), Marketing-Team-Cluster in Registry vorhanden.
- Marketing-Team-Flow existierte nie als eigener n8n-Workflow (HANDOVER v3, Befund 5).

**Vorgehen (Vorschlag):**
1. Registry-Setup: Max/Constance/Linni/Voca je Langdock-Agent-ID + Slack-Kanal-ID + Reports-an + A2A-Haken. (Bianca liefert IDs — wie bei aurea/Dagobert.)
2. Kanäle anlegen (falls fehlen), Bot beitreten.
3. Am Dirigenten testen: Constance → Max/Linni Delegation (A2A entlang Berichtslinie, schon gebaut — keine Codeänderung nötig).
4. Linni-Flow neu: LinkedIn-Post NUR mit Human-Approval (Stufe 2).
5. Danach Content-Rhythmen (Findus Trends, Petterson Research).

**Whitelabel-Prinzip (durchgängig beibehalten):** Alles registry-/kanal-getrieben, keine hartcodierten Agenten. Neuer Kunde = eigene Airtable-Basis + eigene Credentials + gleiche Workflows. Kunden- und Eigenkontext strikt trennen (Logbuch/Datenquellen/Skills).

---

## 9 · Update 22.07.2026 (Nachtrag)

**Erreichbarkeits-Regel bestätigt:** Eine Agentin ist via Slack ansprechbar, wenn ihre Registry-Zeile BEIDES hat — Slack-Kanal-ID UND Langdock-Agent-ID — und der Bot (`U0996QVDBAR`) im Kanal ist (Bot ist überall Mitglied, kein Problem).

**Jetzt live ansprechbar (10):** Donna, aurea, Ophra, Petra, Dagobert Duck, Harvey Specter, Gaia, Future Me, Helga, **Elena** (ID `db53ae9d-6ded-4700-96f4-09c33c318074` heute nachgetragen).

**Kanal vorhanden, aber Langdock-ID FEHLT (12 — noch nicht erreichbar):** Constanze (`C0BF4UV31MK`, CCO — für Marketing zuerst nötig!), Petterson (`C0BFA5UKX6D`), Offerta (`C0BF4UU3V0V`), Findus (`C0BFC05PYSG`), Nova (`C0BG2J08Z2L`), Podcast Producer (`C0BF682EHDL`), Kira (`C0BF682HGDU`), Ina (`C0BF683LKLN`), Paula (`C0BFA5TTY1F`), Vera (`C0BF88D3U82`), Soreia (`C0BF88CEG2W`), Qualitaetia (`C0BF88DTWQ2`). → Freischalten = nur ID eintragen. **Qualitaetia NICHT** ins Kernteam-Routing (JUMIS-Kundin, separater Kontext).

**Dirigent v2 robuster gemacht (no_text-Fix):** Donnas Langdock-Agent geriet zeitweise in **Werkzeug-Schleifen** (nur reasoning + tool-calls, `messages:[]`, keine Textantwort) → Slack „no_text" → Lauf brach ab → Donna schwieg intermittierend. Neuer Knoten **„Antwort aufbereiten"** (zwischen Langdock und Antwort im Thread) liest Text robust (messages[].content ODER result[].content[].text) und postet bei leerem Ergebnis eine Rückmeldung statt abzustürzen; leere Antworten werden nicht ins Gedächtnis geschrieben. Getestet (leer + normal), published.
> **ROOT CAUSE bleibt Langdock:** Donnas fremder „Philipp/daily-briefing"-Skill/Tools lösen die Schleifen aus. Bianca muss den Skill in Langdock entfernen — dann finished Donna wieder zuverlässig mit Text.

**OFFENE BEOBACHTUNGEN (in Ruhe anschauen, noch NICHT gelöst):**
- ⚠️ **Morgenpost liefert „immer den gleichen Text"** (Bianca 22.07.) — Ursache noch nicht diagnostiziert. Kandidaten: leere/duplizierte Inbox-Ergebnisse, Klassifikations-Output identisch, oder stündliche Läufe posten Gleiches. Nächste Session gezielt debuggen (echte Morgenpost-Execution ansehen: `YG0GEWgHdxkqfkVR`).
- ⚠️ **Donna-Zuverlässigkeit** hängt am Langdock-Skill-Cleanup (s.o.).

**Linni:** Bianca tauscht gerade die Credentials in Linni (`11UxePeldz86cqxp`). Erinnerung: Linni-Workflow ist Vorlagen-Kopie mit Guardrail-Verletzung — nicht scharf schalten ohne Freigabe-Gate; besser neu/schlank aufsetzen.

**→ Vollständige Architektur-Analyse von Linni (140 Nodes) + daraus abgeleitete Bauprinzipien für ALLE künftigen Agenten:** siehe **`docs/MULTIAGENT-ARCHITEKTUR-PATTERNS.md`**. Enthält 7 übernehmenswerte Patterns (LLM-Fallback, persistentes Gedächtnis, Default-Zweige, Retry, Kritiker-Agent, Kanal-Umschaltung, Stop-and-Error) + die zentrale Fehlerlehre („Qualitäts-Tool haben ≠ als Gate verdrahten" — Linnis LinkedIn-Autopost hat trotz vorhandenem Kritiker-Agenten KEINE Freigabe-Kette) + Checkliste für jeden neuen Workflow. **Vor dem Bau des Marketingteams lesen.**

**Gedächtnis-Fix-Detail:** „Gedächtnis vorbereiten" liest Antwort jetzt aus „Antwort aufbereiten" (nicht mehr direkt aus Langdock).

### ENTSCHEIDUNG 22.07. (Nachtrag 29.07.): Echte DMs = 7 eigene Slack-Apps

Bianca will DMs zu Donna, Linni, aurea, Gaia, Soreia, Petra, Dagobert Duck senden (nicht nur Kanäle). Slack bindet eine DM an eine ECHTE Bot-Identität — der `sendAsUser`-Trick des Kanal-Dirigenten funktioniert in DMs nicht. Entscheidung (bewusst gegen die einfachere Alternative "eine DM + @Mention-Routing"): **7 eigene Slack-Apps**, eine pro Agentin.

**Gebaut (29.07.):**
- Registry-Feld **„Slack App ID"** (`fld5nA3LMMuCLQZKw`, Team-Tabelle) — nicht-sensibler Routing-Schlüssel, KEIN Bot-Token in Airtable (Sicherheitsentscheidung: Tokens gehören in n8n-Credentials, nicht in Airtable-Klartext).
- **ORCH - DM-Dirigent - v1** (`t9Gz9uYuRA07o0ut`), Webhook `/slack-dm-dirigent`, AKTIV. Empfang → nur `channel_type=im` + kein Bot-Echo → Registry → Agent über „Slack App ID" (`api_app_id` aus dem Event) auflösen → Gedächtnis (gleiche Tabelle wie Kanal-Dirigent, Kanal-Feld = DM-Channel-ID) → Langdock-Aufruf → robuste Antwortaufbereitung (gleicher no_text-Fix wie Kanal-Dirigent). Getestet (simuliert), published.
- **Versand ist PLATZHALTER** — NoOp-Node mit TODO-Notiz. Jede Agentin braucht ihre eigene Slack-App + Bot-Token, bevor ihr Zweig fertig verdrahtet werden kann (n8n-Credential pro Agentin + eigener HTTP-Node `chat.postMessage`, gesteuert per Switch auf `agentName`).

**Nächste Schritte (iterativ, wie beim Langdock-ID-Sammeln):**
1. Bianca legt EINE Slack-App an (Pilot: Donna) nach der Anleitung im Sticky-Note des Workflows.
2. Bianca schickt App-ID + Bot-Token.
3. Claude legt n8n-Credential an, ergänzt Switch-Zweig für Donna, testet End-to-End, trägt App-ID in Registry ein.
4. Wiederholen für Linni, aurea, Gaia, Soreia, Petra, Dagobert Duck.

**Offene Datenpunkte:** Linni hat noch keine Langdock-Agent-ID in der Registry (Zeile existiert, Status „inaktiv", Kanal+ID fehlen) — vor dem DM-Test nachtragen. Soreia hat Kanal, aber noch keine Langdock-ID (aus der 12er-Liste oben).

### ENTSCHEIDUNG 22.07.: Single Source of Truth = Airtable (eigene Basis)

Bianca will eine SSOT für **To-dos, OKRs, Kontakte, Projekte, Produkte, Vorhaben** — bisher Notion, wird kaum noch genutzt. **Entscheidung: Airtable, in einer EIGENEN neuen Basis** („Steuerzentrale"), getrennt von der Agenten-Basis `app9r4BK5FJTU219P` (Registry/Logbuch/Präzedenzfälle/Gedächtnis), verknüpft bzw. per n8n angebunden.

Begründung: Die Agentinnen (Donna, Ophra, aurea) lesen/schreiben Airtable bereits nativ über n8n — eine SSOT nützt nur, wenn die Agentinnen sie bedienen können. Ophras Freitags-OKR-Runde und Donnas To-do-/Ideenmanagement brauchen echte Daten an einem Ort. Relationale Daten = Airtable-Stärke. Notion kann ausgemustert werden.

**Geplantes Schema (im neuen Fenster bauen):**
- **Projekte** (Herzstück, alles hängt dran)
- **To-dos** → Link Projekt + OKR · Status, Priorität, Fällig, Quick-Win?, Owner (Bianca/Agent)
- **OKRs** → Objective + Key Results, Quartal, Fortschritt · Ophra pflegt
- **Kontakte** → Link Projekt + Sales-Funnel
- **Produkte/Angebote** → an Angebotsarchitektur-v1 andocken
- **Vorhaben/Ideen** → Inbox für Donnas Ideenmanagement

**AUSNAHME Buch:** Bianca schreibt ihr erstes Buch. Manuskript/Prosa **NICHT** in Airtable (Fließtext in Zellen = Qual), sondern **Google Docs** (Drive ist bereits angebunden). In Airtable nur als *Projekt*-Zeile (+ optional Kapitel-Tabelle mit Status) und Link-Feld aufs Doc. Airtable = operative Steuerzentrale, Docs = Schreibwerkstatt.

---

## 10 · Update 27.07.2026 (Morgenpost-Fix, SSOT „Steuerzentrale", Marketingteam-Start)

**Morgenpost „immer der gleiche Text" — diagnostiziert und gefixt.** Executions vom 26./27.07. geprüft (Klassifikation, Dedup-Label `Label_2`, Slack-Versand): technisch alles sauber, Inhalte variierten korrekt je Mail-Batch, keine einzige Fehler-Execution seit dem Credential-Fix. **Echte Ursache stand in Biancas eigener Reflexion vom 23.07.** (geladen im Morgenpost-Run vom 24.07., Abschnitt „Aus deiner gestrigen Reflexion"): „Donnas Antworten und Briefings in Slack sind zu lange und immer dieselben Worte." Konkreter Treiber: der Code in „Briefing bauen" hängte an **jede** Nachricht denselben hartcodierten Schlusssatz („Fokus-Tipp: Erst die persönlichen, dann Entwürfe freigeben. Ein Block, kein Hin und Her.") — wortgleich, unabhängig vom Inhalt. **Bianca-Entscheidung 27.07.: Morgenpost bleibt bei Donna** (ihre Reflexion vom 23.07 hatte noch „Aurea macht die Morgenpost" vorgeschlagen — das ist überholt: „Donna ist meine Executive Assistant, orchestriert Kalender/Mails/To-dos"). **Fix:** Fokus-Tipp-Zeile aus „Briefing bauen" entfernt, Rest der Logik unverändert. Published, aktive Version `2f81b82e-4e7d-4192-8bd4-c00dd8daa2fe`.

### SSOT „Steuerzentrale" gebaut (nicht „SSOT" genannt — Kollisionsgefahr!)
⚠️ Im Account existiert bereits eine Basis **namens „SSOT"** (`app2lmhCxLhMkdfmN`) — das ist aber das komplette Philipp-Dicke-Recruiting-System (Mandates/Persons/Funnel/Bewertungskriterien/Logbook/Akquise-Pipeline…), NICHT Biancas eigene Steuerzentrale. Um Verwechslung auszuschließen, heißt Biancas neue Basis bewusst **„Steuerzentrale"**.

- **Basis-ID:** `appqscSUAbAqQGMpk` (Workspace AIVa)
- **Projekte** (`tblrEiq8TU41vbwfr`, Herzstück) — Beschreibung, Status, Bereich (Kernteam/Orchestrierung · Marketing · Buch · Privat · Sonstiges), Start/Ziel-Datum, Dokument-Link (fürs Buch-Manuskript in Google Docs)
- **OKRs** (`tblcMMxoHoGiaUdZO`) + **Key Results** (`tblJqMFNWCOilvUoB`) — zweistufig wie im Philipp-SSOT, Ophra pflegt
- **To-dos** (`tblM729OMi3huDFXl`) — Link Projekt + Key Results, Status/Priorität/Fällig/Quick-Win/Owner (Bianca/Donna/aurea/Ophra/Agent)
- **Kontakte** (`tblNDQZsFwjluKZMo`) — Link Projekt, Sales-Funnel-Status
- **Produkte** (`tblNRHkpgTfWHo82Y`) — Link Projekt, Angebotsarchitektur-Link
- **Vorhaben** (`tblVQ3zZ7M47TjUO5`) — Ideen-Inbox, Link Projekt (optional)

Alle Links stehen, Basis ist leer (keine Testdaten). **Offen:** n8n-Anbindung an Donna/Ophra (welcher Flow liest/schreibt was, wann) — noch nicht gebaut, Bianca-Entscheidung nötig.

### Marketingteam-Start
- **Constance/Constanze → umbenannt in „CC Top"** (Bianca-Entscheidung 27.07.: „CC" = Content Creatorin, „Top" = führt die Content-Einheit auf oberster Ebene — nicht mehr „Chief Content Officer"). Registry-Zeile `rec17io3O7jW90Kam`: Name geändert, Langdock-Agent-ID `ce0d3a4d-705b-41af-a586-86f559bd4ca1` gesetzt. **Prompt v3.0 destilliert** aus den vorhandenen v1.0/v2.0-Stellenbeschreibungen (v2 war bereits eine Verfeinerung von v1, keine inhaltlichen Widersprüche) — nur Name/Titel/Naming-Note umgestellt, Rolle/Scope/Boundaries/Skills inhaltlich unverändert. Jetzt offizielle „Stellenbeschreibung".
- **Max** (`recpuJq4MSNRV1nRP`) und **Linni** (`recJptXj7mbaZ6oYo`) hatten bereits korrekte Langdock-Agent-IDs (`1fa670a1-...` bzw. `1835c388-...`) — vorher schon gesetzt, nur bestätigt.
- **Voca** (`recBqdxuLuJHN8Nl8`) hatte noch keine Langdock-Agent-ID — jetzt `94095850-022f-48c3-aee9-9c64857076bb` gesetzt.
- **A2A aktiv** für CC Top, Max, Linni, Voca angehakt (Delegation entlang Berichtslinie → CC Top, Hop-Limit 2 — gleiches Muster wie Donna/aurea).
- **Neue Slack-Kanäle:** `#max` (`C0BLV0B32JC`), `#voca` (`C0BKUCWGR35`) angelegt und in Registry hinterlegt.
- ⚠️ **Architektur-Fund zu Linni:** Kanal `#linni` ließ sich NICHT anlegen (`name_taken`) — Linni hat bereits einen **eigenen Slack-Bot-User** (`U0ANKK4QAHF`), mit dem Bianca seit 14.07. direkt per DM spricht, NICHT über einen Kanal. Das ist ein Sonderfall: alle anderen Kernteam-/Marketing-Agentinnen (Donna, aurea, Max, CC Top, Ophra) haben KEINEN eigenen Bot-User, sondern laufen über den EINEN gemeinsamen Dirigent-Bot mit `sendAsUser`-Anzeigenamen-Override — kein echter Slack-User, der direkt angeschrieben werden kann. **Offene Bianca-Entscheidung:** (a) Linnis Sonderweg (eigener Bot pro Agentin) generalisieren — aufwändig, braucht pro Agentin ein eigenes Slack-App-Setup über api.slack.com (nicht per MCP-Tool machbar), oder (b) im Dirigenten ein DM-Routing bauen (Mention-Erkennung am Nachrichtenanfang, Lookup in Registry, Antwort mit sendAsUser im selben DM-Thread) — reine n8n-Änderung, deutlich schlanker. Bianca hat sich noch nicht entschieden.
- **Redaktionsplan-Basis** (`appdluooiLRvhNMm2`) geprüft: bestehende „Imported table" wirkt wie Fremd-Vorlage (Feld „Kanal" nur Option „Instagram", Feld „Status Philip"), enthält aber bereits ein „Go von Charlie Checker"-Häkchen — passt zum Kritiker-Gate-Pattern aus `MULTIAGENT-ARCHITEKTUR-PATTERNS.md`, aber **noch nicht geprüft, ob dieses Häkchen tatsächlich als Blocker verdrahtet ist oder nur ein Status-Feld ist** (genau die zentrale Fehlerlehre aus dem Patterns-Dokument — Tool haben ≠ als Gate verdrahtet). Bianca baut den Redaktionsplan gerade parallel selbst um, gemeinsame Durchsicht später.
- **Neue Anforderung (noch nicht gebaut): LinkedIn-DMs versenden.** Bianca möchte, dass das Marketingteam LinkedIn-Direktnachrichten an echte Personen verschicken kann. In der Registry wurde **kein Agent gefunden, der eingehende LinkedIn-Antworten überwacht**. Zweck/Scope (Kaltakquise? Antworten auf Kommentare? Networking-Pflege?) noch ungeklärt — braucht wegen direkter Personenansprache zwingend ein Freigabe-Gate pro Nachricht (noch strenger als beim LinkedIn-Post-Gate). Bianca baut parallel, gemeinsame Durchsicht später.

---

## 11 · Update 28.07.2026 (Donna-Pilot nativ, Marketing-Team komplett architektiert)

**Kontext:** Bianca geht am 13.08.2026 auf den Camino (Flug Madrid, danach Camino Inglés) — will das digitale Team vorher live UND getestet haben, nicht erst am Abreisetag fertig. Daraus die heutige Session-Priorität: Donna + mindestens ein Team wirklich fertig, nicht nur geplant.

### Grundsatzentscheidung: Architektur-Fork aufgelöst
Nach Diskussion (native n8n-Agenten vs. Langdock-gehostete Agenten) die Regel gefunden, die den ganzen Tag getragen hat: **Gedächtnis/eigener Workflow braucht es nur bei echten Beziehungen (Donna ↔ Bianca), nicht bei abgeschlossenen Aufgaben** (Linni schreibt einen Post = stateless Auftrag, kein Gedächtnis nötig). Damit: Donna bleibt der Leuchtturm für „nativ + eigener Bot", die meisten anderen Rollen laufen als **Sub-Agenten-Werkzeuge innerhalb EINES Orchestrierungs-Workflows** (Linni-„Manni"-Muster: ein Agent, mehrere `agentTool`-Sub-Agenten, kein Langdock beteiligt). Community-Screenshots von Bianca bestätigten unabhängig: Langdock-Agent lässt sich NICHT in den n8n-Sprachmodell-Slot einhängen (anderes Antwortformat) — nur per HTTP-Request als Blackbox aufrufbar. Erklärt auch das alte Dirigent-Muster.

**Individuelle Slack-Bots:** Bianca hat klar entschieden (nicht zum ersten Mal gesagt, diesmal verstanden): **jede Agentin, mit der man wirklich redet, bekommt einen eigenen Slack-Bot**, keine geteilte Bot-Identität mehr. Aufwand ist ihr bewusst und akzeptiert. Beleg per Kanal-Mitgliedschaft (nicht nur Namenssuche, die war unzuverlässig): `#donna`/`#aurea` haben nur EINEN Bot-User (`U0996QVDBAR`), der sich per `sendAsUser` verkleidet — nur Linni hat wirklich einen eigenen (`U0ANKK4QAHF`).

**Postgres erneut geprüft, erneut tot:** Credential `o0Fa9onWOQK9XPJH` zeigt auf `127.0.0.1:5432` — „Connection refused", exakt derselbe Fehler wie im Schwesterprojekt. Entscheidung: kein Postgres-Gedächtnis vorerst. Kurzzeit = RAM-Puffer, Langzeit = Airtable-Logbuch/Kondensat (portabel, kein neuer Infrastruktur-Punkt, der kaputtgehen kann).

### Donna-Pilot (`ORCH - Donna - v1`, `J22CV0Ovkjj9Zd6f`) — technisch fertig, wartet auf Biancas Slack-Bot
Bereits vorhandener, nie aktivierter nativer Agent (Claude Sonnet, RAM-Memory, Kalender/Gmail/Logbuch/Registry-Tools) gefunden und fertiggestellt:
- **Steuerzentrale-Werkzeuge ergänzt:** Projekte durchsuchen/anlegen, To-do anlegen, Vorhaben anlegen — schließt die Lücke von heute Morgen, wo Langdock-Donna nur lesen, nicht schreiben konnte.
- **Prompt v3.0:** echte Registry-Stellenbeschreibung (Conscious-Operating-System-Queen, 8-Punkte-Aufgaben, Fokus-Schutz, Rhythmen) + technisches Gerüst der alten v2.0 (Stufe-1/2, Zeeg-Link, Slack-Formatregeln) verschmolzen. Notion-Referenzen durch Steuerzentrale ersetzt.
- **Fehlt noch (Biancas Teil):** eigene Slack-App (Checkliste als To-dos im Projekt „Donna-Rollout (nativ, eigener Bot)" in der Steuerzentrale hinterlegt, Owner Bianca).
- Nie live getestet (bewusst — Workflow hat kaputte Nebenzweige im alten Chat-Teil, die den echten Test nicht betreffen).

### Linni-Workflow (`11UxePeldz86cqxp`) — zwei echte Bugs gefunden und gefixt
1. **Cross-Base-Mismatch:** „Search LinkedIn Posts for Today" las aus der fremden Vorlagen-Basis `LinkedIn Posts Manni`, „Update Status to Posted" schrieb in Biancas eigene `LinkedIn Posts Linni` — zwei verschiedene Basen, hätte nie funktioniert. Beide zeigen jetzt auf **Steuerzentrale/Redaktionsplan**.
2. **Schein-Freigabe-Gate:** Filter stand auf `Status = "Ready"`, ein Wert, den auch der Agent selbst hätte setzen können. Jetzt `Status = "Freigegeben"` — ein Wort, das nur Bianca von Hand einträgt.
3. **Offen:** „Post to LinkedIn" hat noch eine festverdrahtete fremde Personen-ID (`3csPv-h--Z`) — braucht Biancas echte LinkedIn-URN.
4. Nebenbefund: der Chat-Agent-Teil („Manni", ~140 Nodes gesamt) hat mehrere vorbestehende, unabhängige Fehler (getrennte Model-Nodes ohne Verbindung, Slack/Telegram-Nodes mit fehlenden Pflichtfeldern) — betrifft NICHT die Posting-Kette, aber noch nicht bereinigt.

### Marketing-Team — strukturell komplett, zwei neue Workflows
**Hierarchie final** (Registry `app9r4BK5FJTU219P`, Reports-an korrigiert — Max reportete vorher fälschlich an CC Top, jetzt umgekehrt):
```
Max (Marketing Lead) ── Findus (News) ── Trend-Scout (Trends, neu)
                    └── CC Top (Content-Governance)
                         ├── Linni (LinkedIn) · Ina (Instagram) · Soreia (Newsletter/Substack)
                         ├── Podcast Producer · Vera (Video-Prompts) · Voca (Voice of Brand Sheriff)
                         └── Nora · Claudia · Selma (Zielgruppen-Feedback-Personas, max. 3-5 Runden, 20 als Notbremse)
```
**Leandra** aktiviert (Langdock-ID `b3cfa80e-6246-45fd-bbd5-aa2b4eac27f3`, Kanal `#leandra` `C0BKV12HWD9`). Sam Sales/Soreia noch ohne Langdock-ID (müssen in Langdock angelegt werden, Biancas Teil).

**Neue Airtable-Tabelle „Redaktionsplan"** in der Steuerzentrale (`tbld1fEJeD29wy4PT`, nicht die alte separate Basis) — eine Referenz für alle Kanäle. Pipeline-Status: `Idee → Wartet auf Themenwahl → Ausgewählt → Entwurf → Nora-Feedback → Überarbeitung → Wartet auf Freigabe → Freigegeben → Geplant → Gepostet`. Feld „CC Top Empfehlung" für die Vorauswahl-Begründung. Wichtig aus der alten Linni-Vorlage übernommen: nur das ERSTE Bild im Visual-Feld wird gepostet.

**`ORCH - Marketing Recherche - v1`** (`dXHZnY0KaS9iNgSo`, inaktiv): Findus (News) + Trend-Scout (Trends) als zwei native Agenten mit Google-Suche (SerpAPI — Credential fehlt noch, Bianca), jeden Montag 08:00, schreiben Funde als „Idee" in den Redaktionsplan. Danach macht **CC Top eine Vorauswahl** (eigener Agent-Schritt, strukturierter Output) und setzt Status auf „Wartet auf Themenwahl" mit kurzer Empfehlung — **erst Bianca wählt manuell aus** (Status → „Ausgewählt"), bevor die teure Produktion anläuft. Diese Stufe kam erst nach Rückfrage von Bianca rein („ich möchte das Thema auswählen, nicht dass alles automatisch durchläuft") — wichtige Lücke, die vorher fehlte.

**`ORCH - Marketing Produktion - v1`** (`9pi1p59HQWc6ASXJ`, inaktiv): täglich 09:00, sucht Redaktionsplan-Zeilen mit Status „Ausgewählt". **CC Top orchestriert** als Hauptagent mit 8 Sub-Agenten-Werkzeugen (Linni/Ina/Soreia/Podcast Producer/Vera als Kanal-Ausführende, Nora/Claudia/Selma als Zielgruppen-Feedback) — schreibt am Ende Status „Wartet auf Freigabe" zurück, NIE „Freigegeben" selbst. 21 Nodes, alle Prompts aus den echten Registry-Stellenbeschreibungen übernommen (nicht neu erfunden), Anthropic direkt (kein Langdock).

**Noch fehlend, analog zu Linni gebraucht:** eigene „Freigegeben → Posten"-Workflows für Instagram/Newsletter/Podcast/Video — blockiert auf Plattform-Zugänge, die Bianca noch besorgt.

### Erkannte, noch offene Strukturlücken (Biancas eigener Einwand, berechtigt)
1. **Skills nicht faktorisiert:** Alle Sub-Agenten-Prompts heute wurden als vollständige Einzeltexte geschrieben statt aus dem vorhandenen Skills-Katalog (Airtable, Team-Basis) zusammengesetzt. „Feedbackgespräche führen" sollte ein Skill sein, den JEDE Agentin hat, nicht nur Helga (die führt sie, hat aber selbst noch keinen eigenen Workflow, der ihr overhaupt Arbeit gibt — sie existiert schon, Langdock-ID + Kanal, nur ungenutzt).
2. **Prompts liegen fest im n8n-Workflow, nicht dynamisch aus Airtable gezogen** — Helga könnte sonst Prompts pflegen, ohne n8n anzufassen. Geplante Lösung (noch nicht gebaut): Kernpersönlichkeit (Stellenbeschreibung) + zutreffende Skills zur Laufzeit aus Airtable zusammensetzen.
3. **Templates ohne Zuhause:** Post-Vorlagen/Angebots-Vorlagen sollen als neue Tabellen in die Steuerzentrale, Design/Branding-Assets nach Google Drive (Airtable nur Link, wie beim Buchmanuskript) — noch nicht gebaut.
4. **Zentrales Unternehmenswissen (Branding/Tonalität) für alle Agenten:** Entscheidung gegen Langdock-Wissensdatenbank (Lock-in) UND gegen eigene Vektor-Datenbank (zu groß für Biancas tatsächliche Dokumentenmenge, außerdem dieselbe Postgres-Abhängigkeit, die schon zweimal gescheitert ist). Empfehlung: kleines „Markenkern"-Dokument direkt in jeden Prompt einbinden, kein Suchsystem nötig. Noch nicht gebaut.
5. Repo für Skills (Biancas ursprünglicher Wunsch von Session-Beginn): Airtable bleibt die lebendige Quelle, Repo wird periodischer versionierter Export — noch nicht gebaut.

### Bewusst NICHT angefasst
**Sales-Team:** Bianca explizit „noch nicht, lass uns teamweise arbeiten" — Leandra wurde nur aktiviert, weil sie schon vorher in Bearbeitung war, kein Produktions-Workflow für Sales gebaut.

### Nachtrag selben Tages: Morgenpost-Feinschliff + neuer Kalender-Wächter
- **Morgenpost-Titel zeitabhängig gemacht:** hieß bisher immer „Morgenpost", auch nachmittags bei den stündlichen Läufen. Jetzt: „Morgenpost" nur vor 9 Uhr, sonst „Update HH:mm Uhr".
- **Neuer Workflow „ORCH - Kalender-Wächter - v1"** (`SxSYRyWaqH9tc58u`, **aktiv**): Auslöser war ein Beinahe-Fehler — eine kurzfristige Zeeg-Kundenbuchung wurde nicht rechtzeitig bemerkt, weil Bianca/Donna den Kalender nur zu ihren zwei täglichen Check-in-Zeitpunkten aktiv anschauen. Stündlich (Minute :07) prüft der neue Workflow den Google Kalender auf Termine, die in der letzten Stunde neu **angelegt** wurden (gefiltert auf `created`, nicht nur `updated`, damit reine Verschiebungen nicht jedes Mal eine Nachricht auslösen) und schickt bei Fund sofort eine Slack-DM an Bianca. Kein Zeeg-Zugriff nötig — arbeitet rein über den bestehenden Google-Kalender.
- Zwei reguläre Stufe-1-E-Mail-Entwürfe angelegt (Antwort an Weingut Pardellerhof + neue Anfrage an Weingut Gruberhof, beide im Kontext von Biancas Buch-Unterkunftssuche) — Routinearbeit, nicht architekturrelevant, nur der Vollständigkeit halber erwähnt.

**Nächste Session:** Skills-Katalog + dynamisches Prompt-Pulling nachziehen (Bianca wollte das vor weiterem Bauen klären), dann Templates-Struktur, dann Sales-Team nach demselben Muster wie Marketing.

---

## 8 · Referenzen
- n8n-Instanz: `aiva179.app.n8n.cloud`
- Frühere Docs: HANDOVER v3 (07.07.), DIRIGENT-v2-Plan (14.07.), SESSION 07.07. (Morgenpost-Spez).
- Master-Ordner (Langdock/Drive): CLAUDE.md, BIANCA.md, Angebotsarchitektur-v1.
