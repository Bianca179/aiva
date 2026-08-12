# HANDOVER v4 — Orchestrierung Bianca (Kernteam live)

**Stand:** 21.07.2026 · Ersetzt/erweitert HANDOVER v3 (07.07.) + DIRIGENT-v2-Plan (14.07.)
**Nächste Session:** „Lies dieses HANDOVER, dann starten wir das **Marketingteam**." Kernteam läuft — nicht neu bauen, nur andocken.

> Kurz-Einstieg: Alles läuft über **n8n** (Instanz `aiva179.app.n8n.cloud`) + **Airtable-Registry** + **Slack** + **Langdock**-Agenten. Prinzip: Ein Dirigent-Workflow routet Slack-Kanal → Registry → Langdock-Agent → Antwort im Thread. Registry-getrieben = whitelabel-fähig.

---

## 1 · Was JETZT live ist (n8n, alle aktiv)

| Workflow | ID | Trigger | Zweck |
|---|---|---|---|
| **ORCH - Dirigent - v2** | `SpWLJA34XuMpI6qs` | Webhook `/slack-dirigent` | Herzstück: Kanal→Registry→Langdock, **Gedächtnis**, **A2A**, Identität (sendAsUser) |
| ~~ORCH - Donna Morgenpost - v1~~ | `YG0GEWgHdxkqfkVR` | tgl. 07:00 + stündl. 9–17 | **05.08. DEAKTIVIERT** — war entgegen der Sticky-Note-Doku live, siehe Abschnitt 13 |
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

## 12 · Update 29.07.2026 (DM-Dirigent + Zusammenführung mit der 27./28.07-Session)

**Ausgangslage:** Diese Session lief parallel zur 27./28.07-Session (Donna-Pilot nativ, Marketingteam) und wusste davon nichts, bis der Git-Push kollidierte. Sauber gemerged, nichts verloren — aber dadurch entstand ein Abgleichsbedarf, weil Bianca in DIESER Session „Donna, Linni, Petra, Dagobert Duck, Gaia per DM ansprechen" wollte, ohne von der bereits getroffenen Donna-Grundsatzentscheidung (Abschnitt 11) zu wissen.

**Gebaut (vor dem Abgleich):** Registry-Feld „Slack App ID" (`fld5nA3LMMuCLQZKw`) + **ORCH - DM-Dirigent - v1** (`t9Gz9uYuRA07o0ut`, aktiv, Webhook `/slack-dm-dirigent`) — generischer Langdock-DM-Router (Empfang → Registry → Gedächtnis → Langdock → robuste Antwort), Versand-Zweig pro Agentin noch Platzhalter. Getestet, funktioniert technisch.

**Abgleich mit Abschnitt 11 ergibt DREI verschiedene Fälle für die 5 gewünschten DM-Agentinnen:**

1. **Donna → NICHT über den DM-Dirigent.** Sie hat bereits einen eigenen, technisch fertigen nativen Workflow `ORCH - Donna - v1` (`J22CV0Ovkjj9Zd6f`, inaktiv) mit echten Schreibrechten (Kalender, Gmail-Entwürfe, Steuerzentrale, Logbuch) — das kann der generische Langdock-DM-Dirigent nicht leisten. Ihre künftige eigene Slack-App gehört an DIESEN Workflow (Slack-Trigger-Node „Slack Trigger (@Donna)"), nicht an den DM-Dirigenten. **Fund beim Prüfen (29.07.):** Der Trigger steht nur auf `app_mention` — für reines DM-Verhalten sollte zusätzlich `message.im` abonniert werden, sonst reagiert Donna in der DM nur auf explizites „@Donna", nicht auf normale Nachrichten. Vor Go-Live nachbessern.
2. **Linni → braucht KEINE neue Slack-App.** Sie hat bereits eine eigene (Bot-User `U0ANKK4QAHF`, seit 14.07. von Bianca direkt per DM angeschrieben) UND bereits ein n8n-Credential dafür (`Linni`, ID `798kHnNrNsTiWDAu`, slackApi). **Offene Entscheidung (Bianca):** Läuft ihr Chat künftig über den Chat-Agent-Teil („Manni") im alten Linni-Workflow (`11UxePeldz86cqxp`, gerade in Bearbeitung — Credentials werden getauscht, laut Abschnitt 11 hat dieser Teil aber „mehrere vorbestehende, unabhängige Fehler") ODER wird sie in den neuen DM-Dirigenten eingehängt (sauberer, hat Gedächtnis + no_text-Fix, braucht nur ihre Slack-App-ID in der Registry + das bestehende Credential im Versand-Zweig)? **Empfehlung: DM-Dirigent** — der alte Chat-Teil ist nicht das, was für die Kernbeziehung gebraucht wird, und die Fehler dort sind nicht trivial. Falls Bianca gerade den Slack-Bot-Token in Linnis altem Workflow ändert: den NEUEN Token danach an Claude geben, damit das „Linni"-Credential aktuell bleibt.
3. **Petra, Dagobert Duck, Gaia → wie ursprünglich geplant.** Kein Konflikt mit der anderen Session gefunden. Neue eigene Slack-App pro Agentin (Anleitung im Sticky-Note des DM-Dirigenten), dann Versand-Zweig ergänzen. Diese drei sind reine „abgeschlossene Aufgaben"-Charaktere im Sinne der Abschnitt-11-Regel — der DM-Dirigent mit Airtable-Gedächtnis ist architektonisch konsistent mit der dort getroffenen Postgres-Absage (Langzeit-Gedächtnis = Airtable, nicht Postgres).

**Nicht mehr offen, weil in Abschnitt 11 schon entschieden:** Individuelle Slack-Bots sind die generelle Linie (nicht mehr `sendAsUser`-Sharing) — deckt sich mit Biancas „7 eigene Slack-Apps"-Wahl in dieser Session. Kein Widerspruch, nur Donna und Linni sind Sonderfälle mit eigener Vorgeschichte.

---

## 13 · Update 05.08.2026 (Incident: Donna-Mailversand ohne Freigabe)

**Meldung Bianca:** Donna habe dreimal ungefragt Mails beantwortet und tatsächlich versendet, ohne dass Bianca sie je gesehen hat. **Klarstellung von Bianca:** der 13-Mail-„Kaminabend"-Batch (28.07., 14:31–14:32 UTC) war ein Fehlalarm meinerseits — der war wissentlich/gewollt von Bianca versendet. Die eigentlichen drei Vorfälle sind unabhängig davon.

**Bianca-Grundsatzentscheidung (verbindlich, in Prompt übernommen):** Donna DARF grundsätzlich Mails versenden — aber ausschließlich nach Freigabe oder auf ausdrücklichen Wunsch von Bianca. Niemals eigenständig. Immer Human-in-the-Loop.

**Forensik (Gmail-Sent-Suche, Fingerabdruck `aimeetseva@gmail.com` als Absender statt Biancas üblichem Alias `bianca@enderlin.info`):**
- 03.08., 08:52 UTC: automatisierte Antwort an Nevermann@economia-s.de ("Re: Rückfrage PDF").
- 31.07., 10:22:39 + 10:23:32 UTC (53 Sek. Abstand, Dublette): zwei Antworten im KP-recht.de/Hutter-Thread.
- Dritter Vorfall bislang nicht zweifelsfrei identifiziert — **Bianca-Bestätigung offen**, siehe Abschnitt „Offen" unten.
- Execution-Logs lieferten keinen direkten Beweis (`search_executions` auf `J22CV0Ovkjj9Zd6f` und global: 0 Treffer) — vermutlich weil manuelle Testläufe standardmäßig nicht geloggt werden (`saveManualExecutions`). Beweisführung daher zirkumstanziell über Zeitkorrelation + Absender-Fingerabdruck.

**Root Cause: NICHT abschließend geklärt.** Zwei Kandidaten:
1. Testläufe von `ORCH - Donna - v1` (`J22CV0Ovkjj9Zd6f`) während der Entwicklung (28.07., Abschnitt 11) — die gespeicherte Version war/ist Entwurf-only, aber ohne Execution-Log nicht auszuschließen, dass zwischenzeitlich eine Version mit Sendezugriff lief.
2. Donnas **Langdock-Agent** (Channel-Dirigent, `#donna`, Agent-ID `0b904a65-5692-445a-8d84-65815fba5aa1`) hat dort ggf. ein eigenes, für mich unsichtbares Gmail-Send-Tool/Skill konfiguriert — Langdock-Konfiguration liegt außerhalb meines Zugriffs.
   → Bereits in Abschnitt 6 als offener Punkt vermerkt: „Donnas fremden Philipp/daily-briefing-Skill entfernen" — dieselbe Kategorie Problem (fremde/unsichtbare Tools in Langdock).

**Sofortmaßnahmen umgesetzt (n8n-seitig):**
1. **Alte Telegram-„Donna"** (`08Ujzde2NU7wRtzI`, war `active:true`, 21 Nodes, ungegateter `$fromAI`-Mailversand, 0 Executions je) — `saveManualExecutions:true` gesetzt, dann **deaktiviert/unpublished**. Bestehende Validierungswarnungen (fehlende Node-Parameter) sind vorbestehend und nicht behoben, da der Workflow ohnehin stillgelegt ist.
2. **`ORCH - Donna - v1`** (`J22CV0Ovkjj9Zd6f`, weiterhin `active:false`, QS-Gate offen) strukturell gehärtet:
   - Neuer, gesonderter Tool-Node **„E-Mail senden (NUR nach Freigabe)"** (`gmailTool`, `resource: message`, `operation: send`, `sendTo`/`subject`/`message` per `$fromAI`) als `ai_tool` an den Agenten gehängt — getrennt vom bestehenden reinen Entwurf-Tool „E-Mail-Entwurf anlegen".
   - System-Prompt auf **v3.1** angehoben mit neuem, höchstpriorisiertem `<EmailRule>`-Block: Entwurf ist Standardfall/immer erlaubt; Versand nur bei eindeutiger, AKTUELLER Freigabeformulierung („sende das", „jetzt senden" etc.) mit expliziter Liste NICHT ausreichender Formulierungen („passt", „ok", „ja" ohne Sendebezug); absolute Ausnahme (nie senden, auch mit Freigabe) bei Angeboten/Geld/Recht/uninitiierten privaten Themen; Vorfall-Narrativ direkt im Prompt verankert, damit die Regel als Vertrauensfrage behandelt wird, nicht als Formalität.
   - Sticky-Note-Dokumentation im Canvas aktualisiert (v1.1), damit die In-Workflow-Doku nicht veraltet neben dem neuen Verhalten steht.
   - **Wichtig: dieser Workflow ist weiterhin inaktiv** (QS-Gate). Die Härtung ist somit vorsorglich für den künftigen Go-Live, behebt aber NICHT zwangsläufig den Mechanismus, der die drei realen Vorfälle verursacht hat, falls dieser stattdessen in Langdock liegt.

**Offen (Bianca-Antwort nötig, bevor Incident als geschlossen gilt):**
- [ ] Bestätigung: sind die zwei forensisch gefundenen Fälle (03.08. Nevermann, 31.07. KP-recht/Hutter-Dublette) 2 der 3 gemeldeten Vorfälle? Was war der dritte?
- [ ] Liefen diese drei Vorfälle über den Slack-Kanal `#donna` (= Langdock-Donna)? Falls ja: **Bianca muss selbst in Langdock nachsehen**, ob Donnas dortiger Agent ein Gmail-Send-Tool/Skill hat, und es entfernen bzw. gaten — dort habe ich keinen Zugriff.
- [ ] Nach Klärung: vollständiges Audit aller 70 Workflows auf ungegateten Mailversand fortsetzen (bisher nur Donna-bezogene Workflows geprüft; separate Kundenkontexte JUMIS/PD/CENTCOM nicht Teil dieser Prüfung, da anderer Scope).

### Nachtrag 05.08. (selben Tages): Bianca korrigiert — nicht Slack, sondern Morgenpost. Wahrscheinlicher Root Cause gefunden und deaktiviert.

Bianca stellte klar: **kein Slack-Bezug** bei den Vorfällen, und die Antworten kamen schneller raus, als sie überhaupt hätte reagieren können. Die zwei tatsächlich gemeinten Fälle: **KP-Recht** (bereits forensisch identifiziert, 31.07.) und **Weingut Morandell** (neu genannt, noch nicht einzeln verifiziert).

**Fund:** `ORCH - Donna Morgenpost - v1` (`YG0GEWgHdxkqfkVR`) stand entgegen der eigenen Canvas-Sticky-Note („INAKTIV bis QS + GO") tatsächlich auf **`active: true`** — lief seit mind. 20.–28.07. **täglich 07:00 + stündlich 9–17 Uhr vollautomatisch**, ganz ohne Slack-Interaktion und ohne jede Wartezeit für Bianca. Der Workflow ruft pro ungelesener Mail direkt per HTTP denselben Langdock-Agenten auf, der auch `#donna` bedient (Agent-ID `0b904a65-...`), mit dem Auftrag, NUR ein JSON `{kategorie, entwurf}` zurückzugeben; n8n selbst erzeugt aus der Antwort nur einen Gmail-**Entwurf** (`drafts.create`), nie einen Send-Call.

**Warum das trotzdem die plausibelste Erklärung ist:** n8n selbst kann hier technisch nicht senden (nur Draft-Endpoint verdrahtet) — aber genau derselbe Langdock-Donna-Agent, der laut Abschnitt 9 bereits nachweislich zu unvorhersehbarem Tool-Verhalten neigt („Werkzeug-Schleifen"), wurde hier vollkommen unbeaufsichtigt, stündlich, ohne Sticky-Note-Wahrheit und ohne jedes Freigabe-Gate mit echten Kunden-Mails gefüttert. Passt exakt auf Biancas Beschreibung: kein Slack, keine Reaktionszeit möglich. Ob der tatsächliche Versand technisch über ein Langdock-seitiges Gmail-Tool lief (das der Agent während des vermeintlich reinen Klassifikations-Calls selbst ausgelöst hat) bleibt letztlich nur in Langdock nachprüfbar — aber unabhängig vom genauen Mechanismus ist diese Automatik ein klarer Verstoß gegen Human-in-the-Loop und wurde deshalb sofort gestoppt, nicht erst nach abschließendem Beweis.

**Sofortmaßnahme:** Workflow per `unpublish_workflow` deaktiviert, `active: false` bestätigt. Execution-Log geprüft (40 Läufe 31.07.–03.08., alle 5–40 Sek. kurz, stündlich pünktlich) — Timing liefert keinen eindeutigen Sekunden-genauen Beweis für die exakten Versandzeitpunkte, aber untermauert, dass der Workflow durchgehend lief und pro Stunde mind. einmal Donnas Langdock-Agent unbeaufsichtigt mit echten Mail-Inhalten aufrief.

**Nächster Schritt vor Reaktivierung:** Bevor dieser Workflow je wieder aktiviert wird, muss (a) die Sticky-Note-Doku künftig mit dem echten `active`-Status abgeglichen werden (Ursache für die Fehleinschätzung: Workflow wurde am 28.07. fertiggestellt, aber offenbar zwischenzeitlich versehentlich published, ohne dass die QS-Gate-Freigabe je erteilt wurde), und (b) der `Donna klassifiziert`-Call entweder auf einen Langdock-Agenten ohne Tool-Zugriff umgestellt werden, oder die komplette Kette braucht ein echtes Freigabe-Gate vor jedem Versand — nicht nur vor dem Entwurf.

---

## 14 · Update 09.08.2026 (Donna DM live, Marketing-Team aktiv, LinkedIn-Bild-Kette gebaut & live)

Große Session. Vier Blöcke: Donna endlich per DM live, Marketing-Produktion getestet + Spezialistinnen aktiviert, ehrliche Linni-Klärung, und die komplette LinkedIn-Bild-→-Post-Kette (Magnific) gebaut, getestet und scharf geschaltet.

### 14.1 Sicherheit / Morgenpost endgültig entschärft
- **Zwei** Workflows heißen „ORCH - Donna Morgenpost - v1" (`YG0GEWgHdxkqfkVR` UND `P2t3h2YIrYg5jvtj`). **Beide `active:false`** — kein autonomer Mailversand mehr. Doppelung ist Aufräum-Kosmetik, kein Risiko.
- Alte Telegram-„Donna" (`08Ujzde2NU7wRtzI`): bleibt deaktiviert.

### 14.2 Donna — nativ, per DM LIVE (`ORCH - Donna - v1`, `J22CV0Ovkjj9Zd6f`, aktiv)
- **Architektur-Wechsel:** Der n8n-`slackTrigger` verifizierte sich nicht in Slack („wird nicht grün"). Ersetzt durch das **bewährte Plain-Webhook-Muster** (wie beim Dirigenten): neuer Webhook `Slack Events (DM)` Pfad **`/donna-dm`** + `Challenge beantworten` (RespondToWebhook, echot `body.challenge`) → verifiziert sich zuverlässig grün. IF `Kein Bot-Echo` filtert auf echte DMs (`body.event.channel_type='im'`, Text vorhanden, kein Bot/Subtype) → Endlosschleifen-Schutz.
- **Slack-App-Fund (wichtig):** Donna-DM ging erst, nachdem Bianca in der Slack-App **App Home → Messages Tab AN + „Allow users to send messages" angehakt** hat (das war der „senden nicht möglich"-Blocker). Profilbild/Name setzt Bianca in Basic Information/App Home.
- Credential: Slack „Donna" (`K59QwGFIa6Oqk2gm`, slackApi). Agent-Text/Memory/Antwort lesen `body.event.*`.
- **Mail-Versand bleibt gegated** (EmailRule v3.1, gesondertes Send-Tool). Getestet: echte DM kam an, Donna antwortet. **Offen:** Antwortlänge kürzen (Ein-Zeilen-Prompt-Tweak, bewusst verschoben).

### 14.3 Marketing-Produktion getestet + abnahmebereit (`9pi1p59HQWc6ASXJ`, inaktiv, Schedule)
- **2 echte Bugs gefixt:** (a) Status-Werte „Ausgewählt"/„Wartet auf Themenwahl" existierten nicht als Select-Optionen → Übergabe Recherche→Produktion war tot; jetzt angelegt. (b) `JSON.parse` direkt in Airtable-Ausdrücken war fragil → neuer Code-Node **„Ergebnis parsen"** mit robustem `###META###`-Format (Text pur + Meta-Zeile), fällt bei Fehlparse auf Original + Status „Überarbeitung" zurück.
- Zwei echte Testläufe: CC Top orchestriert, Nora/Claudia geben echtes Zielgruppen-Feedback, freigabereifer LinkedIn-Entwurf landet auf „Wartet auf Freigabe". Funktioniert.

### 14.4 Kanal-Spezialistinnen aktiviert (Delegation live)
- **Aktiviert:** Ina (`ZToSb9K4kbu3olf6`), Soreia (`UBv3GFZnIBZ5Sc7V`), Podcast Producer (`3a8YdcWUtj2cMRbc`), **Linni** (`11UxePeldz86cqxp`). Alle draft-level (schreiben nur Redaktionsplan), sicher.
- Soreia/Podcast Default-Status beim Anlegen von „Freigegeben" auf „Entwurf" korrigiert (Guardrail).
- **Linni-Klärung (Korrektur alter HANDOVER-Annahme):** Linnis Workflow **postet NICHT selbst auf LinkedIn** und hat **keine** hartcodierte fremde Personen-ID mehr. Ihr 08:34-Schedule verschiebt nur Airtable-Datensätze (erzeugt „LinkedIn Posts"-Slot, Status „Geplant"). Das echte Posten macht `ORCH-LinkedIn-Veröffentlichen` via Unipile.

### 14.5 LinkedIn-Bild-Kette (Magnific) — GEBAUT, GETESTET, LIVE
Biancas Ziel „regelmäßig mit Bild posten". Statt des nie gebauten „Visual Studio" (eigene Webseite, siehe Uploads SESSIONVERLAUF/ANFORDERUNGENPROTOKOLL) nur den benötigten Baustein in n8n gebaut.
- **Bild-Engine:** Freepik/Magnific **Seedream v4.5 Edit**: `POST https://api.freepik.com/v1/ai/text-to-image/seedream-v4-5-edit`, Auth-Header `x-freepik-api-key`, Body `{prompt, reference_images:[URL…]}`, async (Submit→`task_id`→Poll `.../{task_id}`→`data.generated[0]`). Credential in n8n: **„Magnific"** (`t9f0U4Bre7cxVZFP`, httpHeaderAuth).
- **5 Referenzbilder** aus Biancas Drive-Ordner `1dm45V7sF0Nggzxfc6-AZ_-wWPLE2zVg_`, „für alle mit Link" freigegeben, als `https://lh3.googleusercontent.com/d/<ID>`-URLs übergeben (funktioniert). Selber Ansatz wie das alte fal.ai (Seedream edit mit Referenzen) — nur Anbieter getauscht.
- **Neuer Workflow `ORCH - LinkedIn Bild erzeugen - v1` (`sxqFjkGedC1ph17C`, AKTIV, 08:40):** findet „LinkedIn Posts"-Slots Status=Geplant ohne Visual → Magnific → schreibt Bild ins Airtable-Attachment `Visual` (Airtable speichert eigene Kopie, Magnific-Link ist nur ~1h gültig). Prompt aktuell aus Slot-Titel = Platzhalter, **Feinschliff später** (Bianca ok).
- **`ORCH - LinkedIn Veröffentlichen - v1` (`NINDaWVJOWJuCvrA`, AKTIV, 08:45):** postet Text (aus Redaktionsplan) + Bild (aus `LinkedIn Posts.Visual`) via **Unipile** (`account_id tsvsLWt4TaqZa1hxPVNKnQ`, Cred „Unipile" `Xq9Itk6yLBjpzvel`). Kein Zapier, keine LinkedIn-API-Freigabe nötig.
- **Tägliche Live-Kette (gated durch Biancas „Freigegeben" im Redaktionsplan):** Linni 08:34 (Freigegeben→Slot Geplant) → Bild 08:40 → Veröffentlichen 08:45. Getestet mit Temp-Slot: Slot→Magnific→Visual lückenlos erfolgreich. Temp-Test + `TMP - Magnific Bild-Test` (archiviert) aufgeräumt.

### 14.6 Offen / nächste Schritte
- Donna: Antwortlänge kürzen (Prompt).
- Magnific-Prompt verfeinern (aktuell nur Titel; besser aus Redaktionsplan-Text/eigener Bild-Beschreibung).
- Publishing-Wege für Instagram/Newsletter/Podcast/Video (brauchen Zugänge; IG via Unipile möglich).
- SerpAPI-Key (serpapi.com) für die automatische Marketing-Recherche (`dXHZnY0KaS9iNgSo`).
- Video: Vera macht Prompts, keine Skripte — bei Bedarf umbauen. HeyGen bleibt für Avatar/Video.
- Volles „Kreativ-Studio" (eigene Oberfläche, Multi-Format) als späteres eigenes Projekt — Grill-Protokoll liegt in den Uploads.

---

## 15 · Sales-/Leads-Team „Sam Sales" (09.08., zwei High-Ticket-Produkte)

Ziel Biancas: zwei ~25k-Produkte per **LinkedIn-Kaltakquise** verkaufen — **Retreat „Identitätsshift"** (Führungskräfte/Unternehmerinnen unter Druck) und **Research-Team** (digitales Team für Boutique-Headhunter; „ein sprechendes, fleißiges CRM, das operative Arbeit abnimmt"). Preis wird im Outreach NIE genannt. Kaltakquise über Kontakte-Tabelle + LinkedIn. Kanal: LinkedIn-DM via Unipile. **Nie autonom senden — nur was Bianca freigibt.**

### 15.1 Datenmodell (Airtable Kontakte `tblNDQZsFwjluKZMo`, Base `appqscSUAbAqQGMpk`)
Bestehend: Name `fldEdGUrDFjztkMq8`, Firma `fld4nbGdMqwM4r262`, Rolle `fld6cwF1bTC6fUfcb`, Notizen `fldvuJaafLLtl3bGb`, Sales-Funnel-Status `fldHRpSSOKWM6pZ07` (Neu/Kontaktiert/Im Gespräch/Angebot/Kunde/Verloren), LinkedIn Member ID `fldAPZeXTNFnr6xCQ` (= Unipile `provider_id`).
Neu angelegt für die Akquise:
- **Akquise-Status** `fld6yi9TC8mjxtE8A` (singleSelect): Anschreiben → Entwurf – Wartet auf Freigabe → Freigegeben → **Vernetzungsanfrage gesendet** (via typecast erzeugt) → Gesendet / Übersprungen.
- **Akquise-Produkt** `fldp1mjiTL0iAkJ7N`: Retreat (Identitätsshift) / Research-Team (Boutique-Headhunter).
- **LinkedIn-Nachricht (Entwurf)** `fldo35fmK4PapiXCz` (multilineText), **LinkedIn Profil-URL** `fldwjMJvwNh09Jdsf` (url).
- **A/B-Test-Felder (09.08.):** `Akquise-Variante` `fldG4ZiCBhcaqFOPC` (A – mit Notiz / B – ohne Notiz), `Angenommen am` `fldY2ov9YbIiu3NWj` (date), `Notiz gesendet` `fldE8cOQqptcneO5p` (checkbox), `Antwort erhalten` `fldJkF84z4IxArMJ6` (checkbox, vorerst manuell).

### 15.2 Pipeline (3 Workflows, alle in Biancas Projekt)
1. **WF1 `ORCH - Sam Sales Akquise-Entwuerfe - v2` (`jtpl5UP0IvsESOCn`, AKTIV):** täglich 07:30. Kontakte mit Status=Anschreiben + URL → Public-ID aus URL → **Unipile-Profil holen** (`GET /api/v1/users/{id}` → `provider_id`) → **echte Posts holen** (`GET /api/v1/users/{provider_id}/posts`) → Code baut Recherche-Brief → **Sam Sales** (Claude Sonnet 4.6, temp 0.6) schreibt Opener mit echtem Bezug → speichert Entwurf + provider_id in „LinkedIn Member ID" + Status „Entwurf – Wartet auf Freigabe". Bei fehlenden Posts: Fallback ohne Erfinden. Alter Sam v1 (`wNnLu853uBF1NxeO`) **archiviert**.
2. **WF2 `ORCH - Sam Sales Versand - v1` (`UHpsLw9QOhAA6wLE`, gebaut):** täglich 10:00. Zwei Arme (fan-out): **Arm A** (`LEFT(Variante,1)='A'`, limit 5/Tag) → `POST /api/v1/users/invite` **mit** `message`=Opener; bei Fehler (Free-Notiz-Limit) **Auto-Fallback** auf invite **ohne** Notiz (`onError:continueErrorOutput` → Fallback-Node), setzt `Notiz gesendet` true/false. **Arm B** (`LEFT(Variante,1)!='A'`, limit 5/Tag) → invite ohne Notiz. Beide → Status „Vernetzungsanfrage gesendet" + Sales-Funnel „Kontaktiert".
3. **WF3 `ORCH - Sam Sales Vernetzt-Check - v1` (`UOBCmmA27mOOdQOs`, gebaut):** alle 4 h. Status=„Vernetzungsanfrage gesendet" → `GET /users/{memberId}` → wenn `network_distance='DISTANCE_1'` (angenommen): **Arm B** → Opener als **DM** (`POST /api/v1/chats`, multipart `account_id/attendees_ids/text`); **Arm A** → nur markieren (Opener war schon die Notiz). Beide → Status „Gesendet" + Sales-Funnel „Im Gespräch" + `Angenommen am`.

### 15.3 Sam-Prompt = Biancas Vertriebskonzept (Doc „Research-Team")
Sams System-Prompt trägt jetzt das volle Research-Team-Konzept. **Oberste Direktive = Biancas eiserne Regel:** „Der Outreach ist die Produktdemo — würde ein Headhunter merken, dass das KI ist? Wenn ja: nicht senden." → verbotene Buzzwords (KI, digital, Effizienz, Automatisierung, Tool, Lösung, Skalierung), kein Verkäufer-Sprech, keine Superlative/Emojis, nie Preis/Angebot/Call. Trigger-Aufhänger (offene Researcher-Stelle / lange offene Mandate / Post über Arbeitslast) + Bestands-Frage als Öffner. Retreat-Block ist Platzhalter (Feinschliff folgt von Bianca).

### 15.4 A/B-Test-Design (mit Bianca festgelegt)
Bianca: Free-Account, kein Sales Navigator, sendet ~10 Anfragen/Tag. Aufteilung **5/Tag Arm A (mit Notiz, Top-Leads) + 5/Tag Arm B (ohne Notiz → DM nach Annahme)**. Auto-Fallback A→B falls LinkedIn Notizen drosselt (zeigt echtes Notiz-Limit). Messung: Annahmequote + Antwortquote je Arm.

### 15.5 Unipile-Root-Cause GELÖST (09.08.) — alles live
- **Ursache war der DSN, nicht der Key:** Alle Workflows zeigten auf `api54.unipile.com:18482`, Biancas echter DSN ist aber **`api31.unipile.com:16114`**. Der Key ging an den falschen Unipile-Server → `401 missing/invalid_credentials`. Verifiziert per Auth-Test (`GET /accounts` → 200, LinkedIn-Account „Bianca Enderlin", `account_id tsvsLWt4TaqZa1hxPVNKnQ`, Free/kein Premium).
- **Fix:** alle Unipile-URLs auf `api31.unipile.com:16114` umgestellt; alte Credential gelöscht, **neue Credential „Unipile" = `pDCflyLLBRNGHz8u`** (Header Auth, `X-API-KEY`) an alle Unipile-Nodes gehängt — in WF1/WF2/WF3 UND im **Posting-Workflow** `NINDaWVJOWJuCvrA` (war dadurch auch tot, jetzt repariert).
- **WF1 Ende-zu-Ende bewiesen:** Profil + 6 echte Posts abgerufen, Recherche-Brief gefüllt, provider_id gespeichert. Sam erkannte beim Testkontakt (Bill Gates) korrekt die Nicht-Passung und verweigerte eine erfundene Nachricht — eiserne Regel bestätigt.
- **Status: WF1/WF2/WF3 AKTIV.** Hinweis: Bei völlig unpassenden/leeren Kontakten schreibt Sam statt eines Openers eine kurze Meta-Notiz („Datensatz prüfen") — gewollter Guardrail; landet im Entwurf-Feld, Bianca sieht es bei der Freigabe.
- **Offen (Biancas 4 Auflagen):** Trigger-Monitoring-Agent (offene Stellen/Alt-Mandate/LinkedIn-Signale); Kontaktliste 27→225 + Prio-A-Merkmale; Referenz-Zitat; Demo-Material anonymisieren. `Antwort erhalten` automatisieren (Inbox-Polling) ist eigener Build. Retreat-Brief (Feinschliff Sam-Prompt) folgt von Bianca.
- Später (Biancas 4 Auflagen): **Trigger-Monitoring-Agent** (offene Stellen/Alt-Mandate/LinkedIn-Signale) → liefert Sam scharfe Aufhänger; Kontaktliste 27→225 + Prio-A-Merkmale; Referenz-Zitat; Demo-Material anonymisieren. `Antwort erhalten` automatisieren (Inbox-Polling) ist eigener Build.

---

## 16 · Leandra — Inbound Empfang & Qualifizierung (09.08.)

Zweites Sales-Motion neben Sam (Sam = Outbound-Kalt). **Leandra = Inbound:** Website-Formular → Lead qualifizieren → A/B/C routen. Eigene Persona (nicht Sam, um Rollen sauber zu halten).

### 16.1 Produkte & Routing (mit Bianca festgelegt)
Produkte: Retreats, Workshops, kleine Bots. Regeln (Vorrang: Firmengröße zuerst):
- **A** (Angebot/Produktlink, vorerst *Entwurf zu Biancas Freigabe*): Bot · Einfacher Workshop · Panel/Keynote
- **B** (Anruf/Klärung): 90-Min-Workshop · unklare Anfragen
- **C** (Mail an Bianca + Gesprächsvorbereitung): Retreat · Inhouse · Tagesworkshop · **Firmengröße ≥ 20 → immer C** (überschreibt A/B)

### 16.2 Bausteine
- **Airtable-Tabelle „Leads (Inbound)"** `tblmDGs9lgCdivqpE` (Base appqscSUAbAqQGMpk): Name/E-Mail/Telefon/Firma/Firmengröße/Anliegen/Nachricht + Lead-Spur (A/B/C) + Lead-Status (Neu / Entwurf – Wartet auf Freigabe / Freigegeben / Anruf offen / C – Rückruf vorbereitet / Erledigt) + Angebot-Entwurf, Gesprächsvorbereitung, Qualifizierungs-Notiz.
- **Workflow `ORCH - Empfang & Qualifizierung (Leandra) - v1` (`sGGeiWqO1BJMxhJe`, AKTIV):**
  - Trigger: **Webhook POST `https://aiva179.app.n8n.cloud/webhook/lead-eingang`** (responseNode → sofort `{status:ok}`).
  - „Lead qualifizieren" (Code, defensive Feld-Fallbacks + Firmengröße-Range-Parsing „20+"/„6-19" + Anliegen-Mapping) setzt Spur deterministisch.
  - „Lead speichern" (Airtable create) → Switch A/B/C:
    - **A** → Status „Entwurf – Wartet auf Freigabe" + Slack-DM an Bianca (via **Donna** `K59QwGFIa6Oqk2gm`).
    - **B** → Status „Anruf offen" + Slack-DM (Donna).
    - **C** → **Leandra-Agent** (Claude Sonnet 4.6, `Claude (Leandra)`) erzeugt Gesprächsvorbereitung (Kurzprofil, Enneagramm-**Hypothese**, Bedarf, 3–5 Call-Fragen, Angebots-Passung, Eröffnungssatz; erfindet keine Fakten) → speichert + **Gmail an bianca@enderlin.info** (`Gmail account` AoEYEWFBZ9zCOhcK).
- **Live getestet (echter POST via n8n→n8n, Proxy blockt lokalen curl):** B-Spur (leerer Body → Donna-DM ok:true) und **C-Spur** (Musterwerk-AG-Lead → hochwertige Prep gespeichert + Mail) beide erfolgreich. Testdaten + `TMP - Leandra C-Test` aufgeräumt.

### 16.25 AUFGEKLÄRT + UMGEBAUT 10.08.: Die zweite Lead-Strecke „Lead-Routing A/B/C"
- **Fund:** Das Website-Formular (biancaenderlin.de, Rechner klassifiziert A/B/C im Browser) POSTet schon lange direkt an n8n — aber an den ALTEN Workflow **`Lead-Routing A/B/C – Bianca Enderlin` (`FmC7exobAoPLIdVK`, aktiv seit 05.08**, Webhook `/webhook/website-lead`, eigene n8n-DataTable, A=Sonnet-Sofortangebot per Mail, B=Twilio-TwiML-Blechansage, C=Sonnet-Prep-Mail). **Die geplante „Onepage-Mail-Erfassung" ist damit OBSOLET.** Dieses Projekt ist auch das „Kunden-Demo-Projekt" der Nummer `+15715865442`.
- **Zwei Bugs (Beleg Exec 2181):** (1) keine Telefon-Normalisierung → `01511…` statt `+4915…` → Twilio „Bad request"; (2) B-Mail behauptete bei Fehlschlag trotzdem „wurde angerufen" (onError continue + statischer Text).
- **Fixes + Umbau (Biancas Go, deployed + Ende-zu-Ende getestet Exec 2184):** Telefon→E.164 in „Normalize Lead"; **B-Zweig ersetzt: statt TwiML-Ansage → Airtable-Lead in „Leads (Inbound)" (Spur B, Status „Anruf gestartet") → SOFORTIGER Sophia-Outbound-Call** (outbound_call, lead_id=recId → Sophias Tools schreiben Ergebnis/Notiz zurück) → **ehrliche Mail** („Sophia ruft an" vs. „⚠️ ANRUF FEHLGESCHLAGEN — selbst anrufen"). Alter Twilio-Node entfernt. A/C-Zweige unangetastet.
- **Bewusst offen:** A-Zweig sendet weiter ungeprüfte Sonnet-Angebote direkt an Leads; C-Zweig und Leandra-Strecke (`sGGeiWqO1BJMxhJe`, `/webhook/lead-eingang`) laufen parallel — Vollkonsolidierung auf EINE Strecke wäre der nächste Roast.

### 16.26 ROAST 10.08. abends: Konsolidierung der zwei Lead-Strecken (Entscheidung offen, NICHTS gebaut)
Beide Workflows per n8n-MCP gelesen (`FmC7exobAoPLIdVK` + `sGGeiWqO1BJMxhJe`). Befunde:
1. **A-Zweig sendet ungeprüft:** „Angebot an Lead (A)" mailt Sonnet-Output direkt an die Lead-E-Mail — verstößt gegen Biancas eigene Regel (Sam: nie autonom senden). Zusatz-Bug: **Fallback-Texte A/C vertauscht** (A-Mail-Node trägt „Gesprächsvorbereitung konnte nicht erzeugt werden", C-Node „Angebot konnte nicht erzeugt werden") — bei Modell-Ausfall ginge dieser Satz als „Angebot" an einen Kunden.
2. **Missbrauchsvektor:** `/webhook/website-lead` ist unauthentifiziert (`allowedOrigins:"*"`), Klasse kommt vom Browser. Beliebiger POST mit `leadClass=B` + fremder Nummer löst sofort einen Sophia-Outbound-Call aus; `leadClass=A` verschickt Mails mit Biancas Signatur an beliebige Adressen.
3. **Datenhaltung asymmetrisch:** A/C-Leads landen NUR in der n8n-DataTable `2T5X2zWgBcXGODee` (kein Status, keine Prep, kein Sophia-Zugriff); B-Leads in BEIDEN Speichern. Alles Nachgelagerte (Sophia-lead_id, Lead-Status, Gesprächsvorbereitung, Freigabe) hängt an Airtable `tblmDGs9lgCdivqpE` → DataTable ist eine Sackgasse.
4. **Leandras Strecke = tote Infrastruktur:** bessere Mechanik (serverseitige deterministische Qualifizierung, Freigabe-Gate, Statusmodell, SSOT), aber kein Formular POSTet auf `/lead-eingang`. Zwei A/B/C-Definitionen driften (Browser-Score vs. Firmengröße≥20→C).
5. Klein: zwei Modelle (sonnet-5 vs. sonnet-4-6); B-Status „Anruf gestartet" wird VOR dem Anrufversuch gesetzt und bleibt bei Fehlschlag falsch stehen.

**Vorlage an Bianca (Optionen):** (1) **Transplantation** [Empfehlung]: `/website-lead` bleibt Eingang, Innenleben wird Leandra (serverseitige Qualifizierung, nur Airtable, A mit Gate, B unangetastet, C = Leandra-Prep), `sGGeiWqO1BJMxhJe` danach archivieren, DataTable exportieren+einfrieren. (2) Formular auf `/lead-eingang` umziehen + Sophia-B portieren (fasst fertigen B-Zweig an). (3) Minimal nur A-Gate (Doppelhaltung bleibt — nicht empfohlen).

### 16.27 UMGESETZT 10.08. abends: Transplantation nach Biancas Go (Option 1, deployed + getestet)
**Biancas Entscheidungen:** A bleibt **bewusst autonom** (Kleinkram/49-€-Einstieg — Ausnahme von der Sam-Regel, ihre explizite Entscheidung); DataTable stirbt nach Export; Leandra-Regeln qualifizieren serverseitig; Leandras WF `sGGeiWqO1BJMxhJe` bleibt vorerst unangetastet (aktiv, aber ohne Formular-Traffic).

**Umbau `FmC7exobAoPLIdVK` (28 Ops, publiziert `8665268f`):**
- Neuer Code-Node **„Lead qualifizieren"** nach Normalize: deterministisch auf die ECHTEN Formular-Select-Werte (per Live-Site geprüft): „1:1-Begleitung oder Retreat" / „Inhouse-Begleitung oder Digitales Team" → C · Budget „2.000 bis 10.000 €"/„über 10.000 €" → C-Override · „Identitätscheck oder KI-Coach (Einstieg)" → A · „Workshop oder Vortrag" + Unklares → B. Browser-Klasse/Score nur noch Teil der Qualifizierungs-Notiz. **Zwei Judgment-Calls dabei (Bianca kann kippen):** „Workshop oder Vortrag"→B statt Leandras Panel/Keynote→A (Formularwert ist mehrdeutig, Anruf klärt) und Budget≥2.000 €→C als Ersatz für „Firmengröße≥20→C" (Formular fragt keine Firmengröße, keine Teilnehmerzahl).
- **„Lead speichern"** (umgewidmeter Ex-B-Airtable-Node, Credential erhalten): JEDER Lead → `tblmDGs9lgCdivqpE`, Status Neu (B: „Anruf gestartet"); DataTable-Node entfernt.
- **A:** Fallback-Text-Bug gefixt (kundentauglicher Text statt vertauschtem Fragment); neuer Node „A: Status + Angebot speichern" (Status „Angebot gesendet (automatisch)" + Angebot-Entwurf ins CRM).
- **B:** unangetastet bis auf lead_id-Quelle = `$('Lead speichern').item.json.id` (der doppelte Airtable-Create ist weg).
- **C:** System-Prompt = Leandra (Sales Directrice, SPIN/Challenger, Text statt HTML, Website-Portfolio ergänzt), Modell bleibt sonnet-5; neuer Node „C: Prep speichern" (Gesprächsvorbereitung + Status); Mail an Bianca jetzt Textformat mit Lead-Daten + Einstufung + Prep.

**Belege:** DataTable-Export (nur 2 eigene Testzeilen, keine echten Leads) → `exports/datatable-leads-website-export-2026-08-10.json` (gitignored, nur lokal auf Biancas Rechner); TMP-Export-WF `DtLj08yQ79g44PDh` archiviert. **E2E-Tests über den Produktions-Webhook (curl geht von Biancas Rechner, kein Proxy-Problem): Exec 2197 = C-Spur** (Browser „A/20" → Server C, Record + Prep + Status „C – Rückruf vorbereitet" + Mail, danach gelöscht), **Exec 2198 = A-Spur** (Browser „C/95" → Server A, Angebots-Mail + Status + Angebot-Entwurf, danach gelöscht). B nicht erneut getestet (heute bereits Exec 2184, „fertig, nicht anfassen").

**Offen danach:** (a) DataTable `2T5X2zWgBcXGODee` ist nur noch verwaist — endgültig löschen macht Bianca in der n8n-UI (Datentabellen) oder bleibt eingefroren; (b) ~~Missbrauchsvektor~~ → **erledigt in 16.28**; (c) Leandras `/lead-eingang` läuft als traffic-loser Zweit-Eingang weiter — bei Onepage-Mail-Parser-Bau wiederverwenden oder archivieren.

### 16.28 NACHSCHÄRFUNG 10.08. spätabends (Biancas Go): Firmengröße-Regel + Webhook-Härtung, deployed + getestet
**Biancas Antworten auf die zwei Judgment-Calls:** Workshop/Vortrag→B bestätigt; Budget-Override ab 2.000 € bestätigt; **zusätzlich Firmengröße ≥ 20 → C** (wie Leandra-Regel 16.1) — dafür fragt das Formular Firmengröße jetzt ab.

**Website (Vibe-Section „Lead-Qualifizierungsformular", App `6a78beb67ba118ad565a3aa4`, Restore-Point `YW093I63ORDN4NzSLFv0I`, publiziert):** neues Select **Firmengröße** (1-5 / 6-19 / 20-99 / 100+, optional) + Formular sendet ein **Shared Secret** im Payload mit. Live verifiziert (Feld + Optionen im DOM).

**n8n `FmC7exobAoPLIdVK` (13 Ops, publiziert `edaf3111`):**
- **Zugangs-Check** (IF nach Normalize): POST ohne gültiges Secret → **403** + Hinweis-Mail an Bianca mit den Rohdaten (nichts geht still verloren, z. B. veralteter Browser-Tab; aber kein Anruf/Angebot/CRM-Eintrag auslösbar). Secret liegt NUR im Formular-Code + im IF-Node, bewusst nicht in diesem Doc. Ehrliche Einordnung: Das Secret steht im öffentlichen Seiten-JS — es stoppt Scanner/Zufallstreffer, nicht einen gezielten Angreifer; die eigentliche Entschärfung bleibt die serverseitige Spur-Wahl.
- **Qualifizierung:** Firmengröße-Parsing (Range→Maximum, „+"→Basiswert), **fg ≥ 20 → C mit Vorrang vor allem anderen**; Zahl geht ins Airtable-Feld Firmengröße, Rohwert in die Notiz.
- Webhook-CORS von `*` auf `https://biancaenderlin.de,https://www.biancaenderlin.de`.

**Belege:** Exec 2222 = POST ohne Secret → 403 + Mail (SENT). Exec 2223 = Secret + Firmengröße „20-99" + A-Anliegen + Browser „A/10" → **Spur C** (Vorrang), Firmengröße 99 im CRM, komplette C-Kette bis Mail. Testdatensatz gelöscht. Deploy-Reihenfolge war Website→n8n, damit kein Lead ins 403 läuft.

### 16.3 Offen (Leandra)
- **Formular anbinden — neuer Weg (Bianca 10.08.):** statt Webhook/Zapier fängt n8n **Onepages Lead-Benachrichtigungsmail** ab und parst sie. **Blockiert 10.08.:** Die Beispiel-Lead-Mail ist im verbundenen Gmail-Postfach nicht auffindbar (gesucht: from:onepage.io, Einsendung/Formular/Lead-Betreffe) — Bianca muss die Beispiel-Mail weiterleiten oder sagen, in welchem Postfach sie liegt; erst dann wird der Parser gebaut (nichts Ungetestetes ausliefern). Zielbild: Gmail-Trigger → Parse → POST an `https://aiva179.app.n8n.cloud/webhook/lead-eingang` (nutzt die komplette bestehende Qualifizierung).
- **A-Inhalte fehlen:** echte Angebote/Produktlinks (Bots / einfacher Workshop / Keynote) → dann schreibt Leandra echte Angebots-Entwürfe + separater **A-Versand-Workflow** (nach Freigabe Mail an Kunde).
- **Telefonassistent (Lead B) — geprüft:** Der vorhandene aktive `PD - Telefon-Backend (Voice-Tools, R97)` (`bPwOJvyVfuwync5x`) gehört zu **Philipps CENTCOM** (fremde Firma, Basis SSOT `app2lmhCxLhMkdfmN`, Mandate/Funnel) und ist **eingehend** (Mensch ruft an → 4 Voice-Webhooks: Tageslage/Wissen/Notiz/Auftrag, ElevenLabs-Agent). **Nicht** für Biancas ausgehende Lead-B-Anrufe nutzbar — falsche Richtung + fremde Daten, wird nicht angefasst. Phase 1 (jetzt): Leandra bereitet vor + meldet, Mensch ruft an. **Phase 2 = eigener ausgehender ElevenLabs-Anrufbot** (Nummer wählen, Leitfaden, Buchung/CRM-Rückschreibung) — eigenes Projekt (ElevenLabs-Credential `W7YE9YwJcFJFmk1Q` vorhanden).

### 16.4 Leandra-Identität + Aktivierung (Abgleich Personalübersicht)
- **Personalübersicht (Base `app9r4BK5FJTU219P`, Tabelle Team `tbl72m0LzgoCmadrV`):** Leandra ist dort als **„Sales Directrice / Buchungsgeneratorin"** definiert (Rollentyp Agentin; Trigger „Übergabe von Sam Sales"; Output Buchungsvorschläge/Terminkoordination/Funnel-Pflege; Methodik Solution/Challenger/SPIN Selling). Mein Inbound-Build ist eine operative Teilmenge davon. **Leandras Agent-Prompt daran angeglichen** (Sales-Directrice-Identität, Prep zielt auf Buchung, SPIN/Challenger-Fragen).
- **Alle vier Workflows jetzt publiziert/aktiv:** WF1 Entwürfe (`jtpl5UP0IvsESOCn`), WF2 Versand (`UHpsLw9QOhAA6wLE`, WF2 war noch auf api54+alte Cred → korrigiert), WF3 Vernetzt-Check (`UOBCmmA27mOOdQOs`), Leandra Empfang (`sGGeiWqO1BJMxhJe`).

---

## 17 · Sophia — Voice-Agent (ausgehende Anrufe, Phase 2)

Rollenteilung: **Leandra** bereitet vor (Text/Prep), **Sophia** ruft an (Stimme). Sophia = Setterin mit Closer-Skills, gestaffelt: High-Ticket → Termin für Bianca setzen; Low-Ticket → selbst buchen. **Nur warme Leads** (Formular-Leads, die Kontakt wollten) — keine Cold Calls (§7 UWG). Zeeg-Abschluss per E-Mail.

### 17.1 Architektur-Entscheidung (Hybrid)
- **Stimme/Echtzeit = ElevenLabs Conversational Agent** (niedrige Latenz, Turn-Taking). **Steuerung = n8n** (Tools/Webhooks). Wie Philipps CENTCOM-Backend.
- **Telefonie:** Nummer in **Twilio** (Biancas Setup), Twilio brückt zu ElevenLabs. Deutsche Nummer kommt noch (US → DE); dann verdrahten.
- Kalender = **Zeeg** (`https://zeeg.me/biancaenderlin/lookandfeel`) — Sophia bucht nicht live, sondern schickt den Zeeg-Link per Mail (Zeeg bleibt Single Source; optional später Zeeg-Webhook → CRM „Termin gebucht").
- Produktwissen = **FAQ** (Q&A) aus Portfolio destilliert; lebt in ElevenLabs-Wissensbasis + live-Lookup aus Airtable-Produkte.

### 17.2 Gebaut
- **FAQ-Rohentwurf** (Google Doc `1b6RoP18w-ZDTebr6EImLaPnurWB44Dkqi-8cCDwQsZ0`, „Sophia — Gesprächs-FAQ") aus dem Produktportfolio (inkl. Lichtenburg I/II/III + Pilgerbegleitung „Wege zurück in die eigene Führung", letztere BEHUTSAM = noch in Entwicklung). **Petra macht das Wort-Destillat.**
- **`ORCH - Sophia Voice-Tools - v1` (`A5qEeHOQ0BaorGMZ`, AKTIV):** 4 Webhooks für den ElevenLabs-Agenten:
  - `POST /webhook/sophia-lead-context` {lead_id} → Name/Firma/Anliegen/Nachricht + Leandras Prep als Sprech-Text.
  - `POST /webhook/sophia-produkt` {thema} → Live-Produktinfo aus Airtable-Produkte (`tblNRHkpgTfWHo82Y`).
  - `POST /webhook/sophia-zeeg-senden` {lead_id} → Gmail schickt Zeeg-Link an Lead-E-Mail + Status „Termin-Link gesendet".
  - `POST /webhook/sophia-ergebnis` {lead_id, status, notiz} → schreibt Lead-Status + `Anruf-Notiz` (neues Feld `fldknqPtZKLg9zSNc`) in Leads.
  - Alle antworten `{ "text": ... }` (Voice-Agent liest vor).

### 17.3 Offen (Sophia)
- **ElevenLabs-Agent anlegen** (deutsche Stimme + Sophia-Prompt + FAQ-Wissensbasis + die 4 Tools als Server-Tools) — via ElevenLabs-API/Dashboard.
- **Ausgehender Anruf-Trigger GEBAUT (inaktiv):** `ORCH - Sophia Anruf starten - v1` (`i9JHfn8I4jmKkmPR`). Werktags 10/14/17 Uhr → Leads „Anruf offen" (max 5) → `POST https://api.elevenlabs.io/v1/convai/twilio/outbound_call` (Cred Elevenlabs `W7YE9YwJcFJFmk1Q`) mit dynamischen Variablen name/firma/anliegen/prep/lead_id → Status „Anruf gestartet". **Zwei Platzhalter im Code-Node „Anruf vorbereiten": `PLATZHALTER_AGENT_ID` + `PLATZHALTER_PHONE_NUMBER_ID`** — nach Agent-Anlage + DE-Nummer eintragen, dann publish.
- **Twilio↔ElevenLabs** verdrahten (deutsche Nummer). Interne Preis-Ranges + Website-Claims in die FAQ (Petra/Bianca).
- Alter Stub `TMP - Sophia Setup` archiviert.

### 17.5 Fortschritt 09.08. (Abend) — Agent + Tools + CRM-Abgleich
- **ElevenLabs-Agent „Sophia" angelegt** (Dashboard, nicht n8n): `agent_id = agent_4801kzkjqe1vf4jsam5ffagvhqpe`. Voice = deutsche Library-Stimme; LLM = „Luna" (OpenAI, im Test validieren); strukturierter Prompt mit dynamischen Variablen `{{name}} {{firma}} {{anliegen}} {{prep}}`; Persona von „Ava" auf Sophia umgestellt.
- **agent_id im Anruf-Trigger eingetragen** (`i9JHfn8I4jmKkmPR`); nur noch `PLATZHALTER_PHONE_NUMBER_ID` offen (wartet auf DE-Nummer).
- **4 Webhook-Tools im Agenten** (über Formular, nicht JSON — JSON-Schema war fehleranfällig): `kalenderlink_senden`, `ergebnis_speichern`, `produkt_info`, `lead_kontext`. Regel: Tool-Name ohne Leerzeichen; `lead_id` = Werttyp „Dynamische Variable" `lead_id`; Rest „LLM-Aufforderung"; nur Körperparameter füllen.
- **CRM-Abgleich bekannt/neu (NEU):** Trigger hat jetzt Node **„Kontakt-Match"** (Airtable-Suche in Kontakte per E-Mail, `alwaysOutputData`+onError continue). „Anruf vorbereiten" baut daraus „BEKANNTER/NEUER KONTAKT" + Rolle/Funnel-Status/Notizen und hängt es vorne an `{{prep}}` — plus neue Variable `{{bekannt}}` (ja/nein). Keine ElevenLabs-Änderung nötig.
- **Bekanntes Risiko:** n8n hat beim ElevenLabs-**POST** (Agent-Create) den httpHeaderAuth-Header nicht gesendet (GET /voices ging). Beim Nummer-Schritt prüfen, ob der `POST /convai/twilio/outbound_call` mit Cred `Elevenlabs AIVa` (`pk48TyBk18g6woTX`) authentifiziert; sonst xi-api-key-Header manuell setzen.
- **Offen = nur noch:** DE-Nummer approved (Donna-Wächter meldet) → in ElevenLabs importieren → `phone_number_id` in den Trigger → publish → Testanruf.

### 17.6 Fortschritt 10.08. — Nummer importiert, Trigger LIVE, Auth-Rätsel gelöst
- **Root-Cause des Auth-Risikos gefunden:** Credential **„Elevenlabs AIVa" (`pk48TyBk18g6woTX`) sendet ihren Header GAR NICHT** (auch bei GET → 401 „Neither authorization header nor xi-api-key received", Execution 2148). Es war nie ein GET-vs-POST-Problem. Credential **„Elevenlabs" (`W7YE9YwJcFJFmk1Q`) funktioniert für GET UND POST** (bewiesen: Nummern-Liste 200 + Import-POST 200). → Überall nur noch `W7YE9YwJcFJFmk1Q` verwenden; „Elevenlabs AIVa" reparieren oder löschen.
- **Keine DE-Nummer in Twilio vorhanden** (Stand 10.08., Konto „AIVa"): nur `+14472612718` (an Studio-Flow/Telefonansage gebunden — nicht anfassen) und `+15715865442` (frei). Das Regulatory-Bundle ist genehmigt, aber die DE-Nummer muss noch GEKAUFT werden.
- **⚠ FEHLGRIFF + ROLLBACK (gleicher Tag):** `+15715865442` wurde als Sophias Nummer nach ElevenLabs importiert und der Trigger aktiviert — **falsch: die Nummer gehört zu einem KUNDEN-Demo-Projekt** (Biancas Stopp). Import gelöscht (DELETE 204, Kontroll-GET: Liste leer), Trigger **unpublished**, `PLATZHALTER_PHONE_NUMBER_ID` wiederhergestellt. **Nachtrag 14:35: Der EL-Import hatte auf der Twilio-Nummer auch voice_url/sms_url/status_callback auf api.elevenlabs.io gesetzt** — erst beim Bundle-Check entdeckt und per API auf den Ursprungszustand (leer) zurückgesetzt. Rollback damit wirklich vollständig. Lehre: ein EL-Nummernimport konfiguriert die Twilio-Seite MIT; beim Löschen der EL-Seite bleibt das stehen. **Lehre: Nummern im Twilio-Konto nie nach „frei/belegt" zuordnen — nur nach Biancas expliziter Ansage.**
- **Bleibt aus der Session:** Credential „Elevenlabs" hängt jetzt am Node „ElevenLabs Anruf starten" (vorher KEINE Credential dran); Schedule von „täglich" auf echte Werktage korrigiert (cron `0 10,14,17 * * 1-5`); Import-/Delete-Weg per n8n ist erprobt (Twilio-SID/-Token werden maschinell durchgereicht, kein Dashboard nötig).
- **Nummernkauf hängt (10.08., Regionalcode-Problem) — Befund per Twilio-API:** Validierte Adressen im Konto: Gerlingen 70839 (2×, inkl. Business-Eintrag „Germany: Local - Business 19.07.") + NEU heute Stuttgart 70499 „AIVa Office". KORREKTUR 10.08. nachmittags: **07156er-Nummern SIND verfügbar** (+49 7156 4229004 / …016, voice), Twilio labelt sie „Ditzingen" — das ist korrekt, denn das Ortsnetz 07156 heißt amtlich „Ditzingen" und **umfasst Gerlingen**; eine Gerlinger Adresse ist dafür regulatorisch gültig — **aber Twilios automatische Prüfung lehnt den Kauf trotzdem ab** (Bianca hat es probiert: „Region nicht passend"; der Abgleich vergleicht offenbar stur Adressort „Gerlingen" gegen Ortsnetz-Label „Ditzingen"). **Lösungsweg: Twilio-Support-Ticket** (manuelle Provisionierung, Ticket-Text liegt Bianca vor) **oder Mobile-Bundle**. Stand 10.08. nachmittags: Ticket/07156-Vorgang **im Review bei Twilio**; **Mobile-Bundle eingereicht: `BUb8a91047c978215e315e0c8b8180ce1e`, Status `pending-review` (14:29)** — Nummernkauf geht erst nach Genehmigung, Bianca hat ihre Wunsch-Mobilnummer schon ausgewählt. Nebenbefund 14:34: `+14472612718` (Telefonansage/Studio-Flow) ist nicht mehr im Konto — nicht durch Claude entfernt, vermutlich Kunden-/Demo-Aufräumen. **Donna bekommt laut Bianca eine ANDERE Lösung als eine weitere Twilio-Nummer (Details offen).**
- **ENTSCHEIDUNG Bianca (10.08. 15:00): `+15715865442` wird ÜBERGANGSWEISE für BEIDE genutzt** (geklärt: es ist ihre eigene US-Nummer vom 22.07., kein Kundeneigentum — der Vormittags-Stopp galt der Demo-VERWENDUNG). Erneut importiert: **`phone_number_id = phnum_0101kznw8e52et6twgq515pjr74e`** (Label „Sophia + Donna (AIVA)"). **Sophia-Trigger `i9JHfn8I4jmKkmPR` PUBLIZIERT/AKTIV** mit dieser ID. Bekannter Schönheitsfehler: +1-Absender bei DE-Leads, bis DE-Nummer da ist (dann nur Import + ID-Tausch). **Donna-Agent existiert in ElevenLabs noch NICHT** (Agentenliste 15:02: nur Sophia) — sobald Bianca ihn nach `docs/DONNA-VOICE-AGENT-SETUP.md` angelegt hat: Donna als Inbound-Agent der Nummer zuweisen. Kostenplan bleibt: 07156-Festnetz ($1,35) via Support-Ticket, Fallback geteilte DE-Mobilnummer ($30); US-Umleitung von Biancas Handy ist wegen Auslandsgebühren verworfen. **Offen: Testanruf — Biancas Handynummer fehlt noch.** Sobald eines durch ist: Nummer kaufen → Import per erprobtem n8n-Weg → `phone_number_id` in `i9JHfn8I4jmKkmPR` → publish → Testanruf. **Stuttgart 0711 ist ebenfalls verfügbar** (z. B. +49 711 9396…, voice, address_requirements=local → braucht Stuttgart-Adresse/Bundle). **DE-Mobilnummern (+49 158/157) sind verfügbar** (voice+SMS) und ortsUNabhängig — brauchen aber ein eigenes Bundle vom Typ Mobile (das genehmigte Bundle ist Typ Local-Business). DE-„National" (032) bietet Twilio nicht an (404). **Empfehlung: Mobile-Bundle beantragen (gleiche Firmen-Dokumente), dann Mobilnummern für Sophia + Donna — kein Regionalcode-Thema mehr.**
- **Offen:** Sophias echte Nummer (kommt von Bianca) → importieren → `phone_number_id` in den Trigger → publish → Testanruf auf Biancas Handynummer. Hilfs-Workflows `TMP - Sophia Nummern-Check` (`6sh9rAJ7KqY0zp8P`) + `TMP - Sophia Nummer-Import rueckgaengig` (`jBkj27IXDFluhEQs`) archiviert.

---

## 18 · Donna — Telefonie (09.08. abends, Dual-Modus Empfang + Assistenz)

**Biancas Entscheidungen (Abfrage 09.08.):** (1) Donna nimmt primär **eingehende Anrufe von (potenziellen) Kunden** entgegen, wenn Bianca nicht erreichbar ist; Donna darf Bianca nur in sehr dringenden Fällen anrufen (Ausnahme); Bianca-ruft-Donna-an sieht sie ohne Mehrwert (Slack reicht). (2) Nummer: **eigene DE-Nummer nach Bundle-Freigabe** (das Regulatory-Bundle `BUe29502df37de6b51cc875d3a64665da7` gilt nach Approval auch für weitere Nummern; Sophia behält ihre eigene). (3) Sophia-Übergabe: **Live-Transfer im Gespräch** („geil wäre es, wenn Donna direkt übergeben kann") → ElevenLabs-System-Tool „Transfer to AI Agent", Ziel Sophia `agent_4801kzkjqe1vf4jsam5ffagvhqpe`.

**Sicherheitsarchitektur: Dual-Modus per Caller-ID (von Bianca bestätigt):** Fremde Anrufer bekommen NUR Portfolio/Notiz/Zeeg; Kalender/To-dos/Steuerzentrale gibt es nur, wenn die Anrufer-Nummer Biancas Handynummer ist. Das Gate sitzt **im n8n-Webhook (Code), nicht nur im Prompt** — die Tools schicken `caller_id` als ElevenLabs-Systemvariable `system__caller_id` (plattform-gefüllt, vom LLM nicht fälschbar). **Fail-closed:** solange der Platzhalter `PLATZHALTER_BIANCA_HANDYNUMMER` nicht ersetzt ist, verweigern die internen Tools IMMER (getestet, Execution 2119).

### 18.1 Gebaut: `ORCH - Donna Voice-Tools - v1` (`eTQjKoyHfxuUV1vA`, AKTIV)
7 Webhooks (Muster = Sophia Voice-Tools, alle antworten `{"text": ...}` außer Init):
- `POST /webhook/donna-anruf-init` — **Conversation-Initiation-Webhook**: matcht `caller_id` gegen Biancas Nummer (→ Modus `assistentin`) sonst gegen Leads-Telefonnummern (letzte 9 Ziffern; → `bekannt` ja/nein + Kontext). Antwort: `{type: conversation_initiation_client_data, dynamic_variables: {modus, bekannt, anrufer_info, begruessung}}`. Getestet (Execution 2118): Lead-Match über Formatgrenzen (`01701234567` ↔ `+49 170 1234567`) funktioniert.
- `POST /webhook/donna-kalender` {zeitraum: heute/morgen/woche, caller_id} — **GEGATET**, liest `aimeetseva@gmail.com` (Google Calendar `95iezphiEusNZWZT`), deutscher Sprech-Text.
- `POST /webhook/donna-todos` {aktion: lesen/anlegen, task, beschreibung, faellig, caller_id} — **GEGATET**; anlegen → To-dos (`tblM729OMi3huDFXl`, Task/Beschreibung/Fällig/Owner=Bianca/Quelle=„Donna Telefon"); lesen → offene To-dos (`{Erledigt am}=BLANK()`), sortiert nach Fällig.
- `POST /webhook/donna-portfolio` {thema} — öffentlich, Produkte-Tabelle, **bewusst OHNE Preis-Feld**.
- `POST /webhook/donna-lead` {name, firma, telefon, email, anliegen, notiz} — öffentlich: legt Lead in „Leads (Inbound)" an (Status „Anruf offen" → Sophia-Rückruf-Pipeline) + Slack-DM an Bianca (Cred „Donna").
- `POST /webhook/donna-zeeg-senden` {email, name} — öffentlich: Zeeg-Link per Gmail.
- `POST /webhook/donna-ergebnis` {zusammenfassung, dringend: ja/nein} — öffentlich: Slack-DM (🚨 bei dringend) + Logbuch-Zeile (`tblkp0LVz3voBPEhr`, Quelle=Donna).

**Ein gemeinsames Zugangs-Gate** (Fan-in beider interner Webhooks → Code „Zugangs-Gate" → IF → Switch) statt Gate-Kopien pro Tool; die Nummer steht trotzdem an ZWEI Stellen (auch „Modus bestimmen" im Init) — beide sind in der Sticky-Note im Canvas benannt.

### 18.15 Donna-Agent GEBAUT per API (10.08. nachmittags)
Bianca kam mit der Dashboard-Anleitung nicht klar („zu ungenau") → Claude hat Donna komplett per ElevenLabs-API angelegt, **Referenz war Sophias funktionierende Config** (GET agent → exakte Tool-/Property-Syntax abgeschaut). **`agent_id = agent_1801kznxw02af899y3exzwytmsxq`**, verifiziert per GET:
- 6 Webhook-Tools (alle POST auf die donna-* n8n-Webhooks), `caller_id` in `kalender_lesen`+`todos` als `dynamic_variable: system__caller_id` (LLM-fälschungssicher).
- System-Tools: end_call, language_detection, **transfer_to_agent → Sophia** (Bedingung: konkretes Angebots-/Kaufinteresse).
- Init-Webhook `/donna-anruf-init` in `platform_settings.workspace_overrides` + **Flag `enable_conversation_initiation_client_data_from_webhook: true`** (ohne das Flag wird der Webhook bei Twilio-Inbound NICHT abgerufen — wichtige API-Lehre).
- **Donna ist Inbound-Agent der geteilten Nummer** `+15715865442` (`phnum_0101…`, PATCH verifiziert); Sophia nutzt dieselbe Nummer outbound.
- Stimme vorerst = Sophias (`fBs1tCpaSMsPcbMkLQlk`), LLM gpt-5.6-luna, temp 0 — Stimme kann Bianca im Dashboard per Klick tauschen.
- `docs/DONNA-VOICE-AGENT-SETUP.md` als ERLEDIGT markiert (nur noch Referenz).

### 18.16 GO-LIVE-STAND 10.08. abends
- **Sophia Ende-zu-Ende BEWIESEN (2 Testanrufe):** Anruf 1 (conv_6901…) kam an, brach nach 7 s ab — Log-Diagnose: „Call ended by remote party", KEIN Systemfehler. Anruf 2 (conv_6501…) voller Erfolg: Gespräch geführt, **Zeeg-Link-Mail versendet** (Lead-Status „Termin-Link gesendet" vom Webhook gesetzt) und **Anruf-Notiz von Sophias ergebnis-Tool geschrieben** — beide Tool-Ketten live belegt. Test-Lead auf „Erledigt". Sophia-Trigger AKTIV (werktags 10/14/17).
- **Biancas Feintuning-Wünsche:** (1) Antwortlatenz zu hoch — Metriken zeigen ~1,4–2 s LLM-TTFB (gpt-5.6-luna); schnelleres LLM im Dashboard testbar (Dropdown neben Stimme; gilt pro Agent — Donna ggf. mitziehen). (2) Bianca sucht eine andere Stimme aus (betrifft Sophia; Donna nutzt aktuell DIESELBE Stimme → bei der Gelegenheit für beide entscheiden). (3) Beobachtung: hohe Unterbrechungs-Empfindlichkeit — kurzes „Ja" schnitt Sophia zweimal das Wort ab.
- **Donna-Gate scharf:** Biancas Handynummer in beiden Code-Knoten eingetragen (`eTQjKoyHfxuUV1vA` publiziert) — Assistentin-Modus + interne Tools nur für ihre Caller-ID.
- **Noch UNGETESTET:** Donna eingehend — Test: Bianca ruft +1 571 586 5442 vom Handy an (→ „Hallo Bianca…", Kalender abfragbar) und einmal von fremder Nummer (→ Empfang, Kalender verweigert). Hinweis: Anruf in die USA, Auslandstarif, kurz halten.
- **Offene Loops:** DE-Nummer (07156-Ticket im Review / Mobile-Bundle pending) → bei Ankunft Import + ID-Tausch in Sophia-Trigger + Inbound-Umzug Donna; Onepage-Beispiel-Lead-Mail fehlt weiterhin (Leandra-Gmail-Erfassung blockiert); Donna-Stimme ggf. im Dashboard tauschen (aktuell = Sophias).

### 18.17 Gesprächsqualität-Fixes 10.08. (Sophia + Donna, per API, verifiziert)
- **Unterbrechungs-Problem** („Ja" würgte Sophia mitten im Satz ab): beiden Agenten `turn.interruption_ignore_terms` gesetzt (15 deutsche Backchannel-Wörter: ja/okay/mhm/genau/…). 
- **Tool-Latenz** (lange Stille bei Tool-Nutzung): Prompt-Regel ergänzt („TOOL-REGEL (Latenz): jeden Tool-Aufruf erst mit kurzem Satz ankündigen") — Prompt wurde per GET gelesen und angehängt, nicht überschrieben; Marker-Guard gegen Doppel-Append.
- **API-Lehre:** `PATCH /v1/convai/tools/{id}` mit `{tool_config:{…force_pre_tool_speech:true}}` antwortet **200, ändert aber NICHTS** (Feld wird ignoriert) — Tool-Verhalten daher über Agent-Prompt gelöst. Grundsatz-LLM-Wechsel (gpt-5.6-luna → schnelleres Modell) weiter offen, Biancas Entscheidung.
- **Aufräum-Kandidaten:** zwei verwaiste Tools aus Biancas manuellem Dashboard-Versuch (`Kalender_lesen` + `todos`, beide Methode GET, keine Agent-Bindung) — können gelöscht werden.
- **Biancas Stimm-Klon v1 ERSTELLT (10.08. abends): `voice_id = 1xslNb9LF1u3Fw7jay66`** („Bianca Klon v1"). Quelle: `D:\OrchestrierungPD\riverside_bianca_raw-audio_frauenquartett_0010.wav` (mono/16bit/44.1kHz, ~40 Min, davon ~36 Min aktive Sprache — genug für späteren Professional-Klon). **OHNE ffmpeg** gelöst: pures PowerShell (WAV-Header-Parsing + RMS-Stimmaktivitätsanalyse + Byte-Schnitt; Skripte im Session-Scratchpad), bestes 108-s-Fenster ab Sek. 355 (9,08 MB). Upload/TTS über TMP-Workflow `TMP - Stimm-Klon Upload` (`xMmB87XPzSkOyQ9q`, Webhooks `/klon-upload` + `/klon-probe`, Cred bleibt in n8n) — nach Gebrauch **unpublished** (offene Endpoints geschlossen), für Professional-Klon-Upload wiederverwendbar. Hörprobe an Bianca: `D:\OrchestrierungPD\bianca-klon-hoerprobe.mp3`. Zwecke laut Bianca: personalisierte Audio-Antworten auf Leads, Onlinekurse, Insta, YouTube Shorts. Biancas Urteil zu v1: „okay, aber das bin ich noch nicht" → Professional beauftragt.
- **Professional-Klon GESTARTET (10.08. abends): `voice_id = j3yIQSe3vLIAUrYa0AZo`** („Bianca Professional", language de). 22 Stücke à 100 s (36,7 Min aktivste Sprache, RMS-selektiert) per Proxy-Workflow `TMP - PVC Proxy` (`f1CHwgeTClyJB8vu`, `/pvc-json` + `/pvc-sample`, nach Gebrauch unpublished) hochgeladen — **22/22 OK**. **Nächste Schritte: (1) Bianca macht Sprecher-Verifizierung im Dashboard** (Voices → Bianca Professional → Verify, Text vorlesen), **(2) danach Training starten** (POST `/v1/voices/pvc/{id}/train` via Proxy erneut publishen), Training dauert Stunden. PVC-Chunks liegen im Session-Scratchpad (`pvc/bianca-pvc-01..22.wav`).

### 18.2 Offen (Reihenfolge für den Go-Live)
1. **Bianca:** Handynummer in beiden Code-Knoten eintragen (`Modus bestimmen` + `Zugangs-Gate`, Platzhalter `PLATZHALTER_BIANCA_HANDYNUMMER`).
2. **Bianca (Dashboard):** ElevenLabs-Agent „Donna" anlegen — **komplette Anleitung inkl. fertigem System-Prompt liegt jetzt in `docs/DONNA-VOICE-AGENT-SETUP.md`** (10.08.): Agent + First Message `{{begruessung}}`, 6 Webhook-Tools übers Formular (`caller_id` = Dynamische Variable `system__caller_id`), Conversation-Initiation-Webhook auf `/donna-anruf-init`, System-Tool „Transfer to AI Agent" → Sophia.
3. **Nach Bundle-OK:** zweite DE-Nummer kaufen → in ElevenLabs importieren → Donna als Inbound-Agent der Nummer zuweisen → Testanruf (dabei bekanntes Risiko prüfen: n8n sendet httpHeaderAuth bei ElevenLabs-POSTs manchmal nicht — betrifft hier nur künftige Outbound-Calls, Inbound läuft ohne n8n-Auth).
4. **Später (Ausnahme-Fall):** „Donna ruft Bianca an bei dringend" — Outbound-Trigger nach Sophia-Muster (`outbound_call`), bewusst noch nicht gebaut; v1 markiert Dringendes per 🚨-Slack-DM.

---

## 19 · Sam Lead-Search (offen, PRIORITÄT vor weiterem Versand) — 10.08.

**Feststellungen von Bianca zum Bestand:**
- Die 201 vorhandenen Kontakte in `Kontakte` sind **Mail-Kontakte** (darum **keine** `LinkedIn Profil-URL`, nur `LinkedIn Member ID`). Sie wurden **bereits kontaktiert** → **nicht erneut anschreiben**.
- Zielgruppen-Muster im Bestand: **ausschließlich Frauen**, ca. **die Hälfte in der Unternehmensübergabe-Phase** → starker, konkreter Anschreib-Winkel für Sam.

**Anforderung:** Sam braucht **frischen Lead-Nachschub** über eine **Lead-Search**, die *zuerst* laufen muss, bevor neu gesendet wird. Erst die mit `Akquise-Status = "Freigegeben"` (von Bianca gesetzt) versehenen Kontakte werden angeschrieben.

**Zu scopen (nächste Session):**
- **Quelle/Methode:** LinkedIn-Personensuche über **Unipile** mit Biancas **Free-Account** (kein Sales Navigator → Filter-Limits prüfen: welche Suchparameter die Unipile-Search-API ohne SN zulässt). Ergebnis liefert `provider_id` **und** `public_id`/Profil-URL → damit läuft die bestehende Recherche-Pipeline direkt.
- **Kriterien:** Frauen, Unternehmensübergabe-/Nachfolgephase (Retreat); Boutique-Headhunter/Inhaber:innen kleiner Personalberatungen DACH+Südtirol (Research-Team).
- **Flow:** Search → neue Kontakte in `Kontakte` anlegen (mit Profil-URL, `Akquise-Produkt`, `Akquise-Status="Anschreiben"`) → bestehende Entwuerfe-Pipeline (`jtpl5UP0IvsESOCn`) zieht sie automatisch → Entwurf → Biancas Freigabe → Versand.
- **Hinweis:** Bestehende Recherche nutzt `LinkedIn Profil-URL` (parst `/in/<publicId>`); falls Search nur `provider_id` liefert, „Profil holen" auf Member ID umstellen (Ein-Knoten-Umbau, Unipile `GET /users/{provider_id}` funktioniert mit beidem).

**Status Versand heute:** Nichts gesendet. Versand-Filter (`UHpsLw9QOhAA6wLE`) ist sauber gated (`Akquise-Status='Freigegeben'`) — kein Fehlversand möglich.

**Spur Donna:** Telefonie-Tools bereits gebaut (siehe §18, `eTQjKoyHfxuUV1vA`); Feinschliff/Go-Live läuft in eigener Session.

---

## 20 · Sam Salesteam — Abstimmung + verifizierter Lead-Search-Test (10.08., Abend)

### 20.1 Architektur-Klarstellung (Bianca hat zurecht „da stimmt was nicht" gesagt)
Zwei Dinge waren unsauber und sind jetzt entschieden:

1. **Kein manuelles Anstoßen, kein Extra-Workflow zum Klicken.** Alles läuft automatisch (Zeitplan + Datenstatus). **Biancas einziger Handgriff = die Freigabe** (bewusste Kontrolle bei Erstkontakt, nicht Umständlichkeit). „Auslösen per Knopf" ist explizit verworfen.
2. **Zwei getrennte Motions — nie wieder vermischen:**
   - **Spur 1 – Kalt/LinkedIn (Neukunden):** Lead-Search → neue Kontakte → Sam-Entwurf → **Freigabe** → Vernetzungsanfrage → nach Annahme DM. Das ist die bestehende, schon automatische Kette (`jtpl5UP0IvsESOCn` → `UHpsLw9QOhAA6wLE` → `UOBCmmA27mOOdQOs`); ihr fehlt nur die Lead-Quelle vorne.
   - **Spur 2 – Warm/E-Mail (bestehende Kontakte, z. B. die 5 aus Programmen/Workshops):** eigene, sanftere Bewegung. **Braucht Biancas/Petras Stimme.** NICHT durch den Kalt-LinkedIn-Rahmen pressen (genau das ging beim ersten Versuch schief — Christiane, Doris, Vanessa etc. sind warme E-Mail-Kontakte, keine LinkedIn-DM-Ziele).

### 20.2 Stimme-Schleife (für Spur 2, offen)
- **Stimme-Skill (Fundament):** ein hinterlegtes Dokument = Biancas Wörter/Rhythmus/Tabus/Beispielsätze. Sam liest es bei jedem Schreiben. **Petra (Speaking-Coach) kuratiert dieses eine Dokument** — der eigentliche, skalierende Hebel.
- **Petra als Freigabe-Schritt (Sicherheitsnetz):** Sam schreibt → Petra korrigiert → Korrektur fließt zurück ins Stimme-Dokument → wird jede Runde besser; später nur noch Stichprobe.
- **Wichtig:** Biancas Stimme wird NICHT erfunden. Fundament muss von Bianca/Petra kommen; Claude baut Maschine + Gerüst.
- Offene Detailfrage für nächste Session: Petra-Freigabe in Slack oder direkt in Airtable-Feld?
- Merke: Bianca will **Executive/CEO-Ton** — gleich sagen worum es geht, kein Fragen-Herantasten, kein Marketing-Sprech. Erste Chat-Entwürfe waren „nicht ihre Worte" → verworfen. Deshalb Stimme-Skill zwingend, bevor Spur 2 automatisiert wird.

### 20.3 VERIFIZIERT ✅ — Unipile LinkedIn-Suche läuft mit Free-Account
Test-Workflow **`TMP - Unipile Search Test` (`DNZCStD1ecCltSCB`)**, Execution **2180 = success**. Der Knackpunkt ist geklärt: **klassische Personensuche funktioniert ohne Sales Navigator.**

**Funktionierender Aufruf:**
- `POST https://api31.unipile.com:16114/api/v1/linkedin/search?account_id=tsvsLWt4TaqZa1hxPVNKnQ`
- Auth: httpHeaderAuth-Cred **`Unipile` (`pDCflyLLBRNGHz8u`)** (X-API-KEY).
- Body (JSON): `{ "api": "classic", "category": "people", "keywords": "Personalberatung Inhaberin" }`
- Antwort: `{ object:"LinkedinSearch", items:[…], paging:{start,page_count:10,total_count}, cursor }`. Pro Seite **10 Treffer**; Weiterblättern über `cursor` (base64) bzw. `start`.
- Jedes Item liefert: **`id` (= provider_id für invite), `public_identifier`, `profile_url`/`public_profile_url`, `name`, `headline`, `location`, `network_distance` (meist DISTANCE_2 = 2. Grad, ideal für Vernetzung), `premium`/`verified`.** → deckt ALLES ab, was die Entwuerfe-/Versand-Pipeline braucht.

**Beobachtete Limits/Fallen (wichtig fürs Bauen):**
- **`total_count` zeigt 1000** = LinkedIn-Kappungsgrenze der klassischen Suche, nicht echte Gesamtzahl. Realistisch die ersten ~100 Treffer nutzbar.
- **Keyword-Suche streut.** „Personalberatung Inhaberin" lieferte auch Männer (Fernholz, Wanner, Krüger, Desch) und Off-Target (Karrierecoaching, EAP-Beratung). **Kein Gender-Filter in der Classic-Suche.** → **Ein Qualifizierungs-/Filter-Schritt nach der Suche ist Pflicht** (Sam/Classifier bewertet headline+name, verwirft Off-Target; Frauen-Fokus ggf. über Vorname-Heuristik + headline).
- Commercial-Use-Limit von LinkedIn beachten (Free-Account hat monatliches Such-Kontingent) → nicht exzessiv paginieren.

### 20.4 Zu bauen (nächste Session) — Lead-Search-Workflow (Spur 1)
Design (plugt in die bestehende automatische Kette, kein manueller Trigger):
1. **Schedule** (z. B. 1×/Tag) → **Unipile-Suche** (Body wie oben; je Produkt eine Suche: Research-Team = Personalberatungs-Keywords; Retreat = Keywords für Unternehmerinnen/Nachfolge — Retreat ist schwerer zu filtern).
2. **Qualifizieren/Filtern** (Code oder Sam-Classifier): Off-Target + Männer (für Retreat/Frauen-Fokus) raus; Dubletten gegen `Kontakte` (per `public_identifier`/provider_id) raus.
3. **Kontakt anlegen** in `Kontakte`: `Name`, `LinkedIn Profil-URL` (= `public_profile_url`), `LinkedIn Member ID` (= `id`), `Rolle`/`Firma` aus headline, `Akquise-Produkt` (Research-Team bzw. Retreat), **`Akquise-Status = "Anschreiben"`**.
4. Ab hier läuft die **bestehende Pipeline automatisch**: Entwuerfe (`jtpl5UP0IvsESOCn`, 07:30) → Entwurf + Status „Wartet auf Freigabe" → **Biancas Freigabe** (+ Variante A/B) → Versand (`UHpsLw9QOhAA6wLE`, 10:00, gated auf „Freigegeben", 5+5 A/B) → Vernetzt-Check.
5. Tagesmenge an Biancas ~10 Anfragen/Tag koppeln (Free-Account); Search-Menge entsprechend deckeln.
- **Aufräumen:** `TMP - Unipile Search Test` (`DNZCStD1ecCltSCB`) danach archivieren oder als Basis des echten Workflows wiederverwenden.
- **Retreat-Ziel offen:** „beide parallel" gewählt — aber Retreat-Zielgruppe (Frauen in Führung/Übergabe) ist über Classic-Keywords schwer sauber zu treffen; Kriterien/Keywords in nächster Session schärfen.
- **Offene Startentscheidungen (zu Beginn der nächsten Session mit Bianca klären):**
  1. **Keywords je Produkt** — Claude-Vorschlag: Research-Team = Rotation aus „Personalberatung Inhaberin" / „Executive Search Gründerin" / „Headhunter Personalberatung Inhaberin DACH"; Retreat = „Unternehmerin Nachfolge" / „Geschäftsführerin Unternehmensübergabe" / „Gründerin Nachfolge Übergabe". Danach Filter-Schritt (Vorname-Heuristik + Headline) → Männer/Off-Target raus.
  2. **Tagesmenge neu angelegter, qualifizierter Leads** — Claude-Vorschlag: 6/Tag (3 Research-Team + 3 Retreat), Puffer unter Biancas ~10 Anfragen/Tag, schont Free-Account-Suchkontingent.

### 20.5 KORREKTUR 11.08. — Lead-Search ist bereits GEBAUT & LIVE (nicht mehr „zu bauen")
Read-only-Prüfung in n8n (auf Biancas ausdrücklichen Wunsch „erst schauen, nicht bauen") ergab: **Der Lead-Search-Workflow existiert schon und ist aktiv.** Der Bauplan in §20.4 ist damit erledigt — nächste Sam-Session = **prüfen & feintunen**, NICHT bauen.

- **`ORCH - Sam Lead-Search - v1` (`WZnBsihP0PqbKQpN`), AKTIV**, Schedule tägl. **06:30** (vor Entwuerfe 07:30). Von einer Parallel-Session gebaut.
- Kette: `Suchauftraege` (Keyword-Rotation) → `Suche Seite 1/2` (Unipile classic, 2 Seiten) → `Kandidaten flatten` (nur DISTANCE_2/3, URL bauen) → `Kandidaten sammeln` (dedupe intern, cap 40) → `Bestand laden` (Kontakte) → `Dubletten raus` (Member ID + Profil-URL) → `Qualifizieren (Sam)` (Claude Sonnet Classifier, temp 0, strenge Zielprofile) → `Auswahl + Felder` (max 5/Produkt) → `Kontakt anlegen` (Status „Anschreiben").
- **Deckt 5 Produkte ab** (Rotation: 2/Tag): Research-Team, Retreat, **Speaking Coach App (CEO-Sprech)**, **Future-Self (Begleit-App)**, **Leadership Circle (Jahresbegleitung)**. Stellschrauben: Keyword-Listen (Node `Suchauftraege`) + Classifier-Zielprofile.
- Design deckt sich mit §20.1–20.4 (kein manueller Trigger, Freigabe bleibt Gate, max 10/Tag). ✅

**Offene Prüf-/Klärpunkte (nächste Session, mit Biancas GO):**
1. **`Akquise-Produkt` hat nur 2 Optionen** (Retreat, Research-Team), Workflow schreibt aber 5 Namen mit `typecast:true` → Airtable legt 3 Optionen automatisch neu an. Klären: sind Speaking Coach App / Future-Self / Leadership Circle echte aktive Akquise-Produkte? Sollen alle 5 laufen oder erst nur Research-Team + Retreat?
2. Noch kein realer Lauf beobachtet → erste Ergebnisse ansehen, Classifier-Trefferqualität prüfen, Keywords/Zielprofile schärfen (v. a. Retreat).
3. **TMP-Testworkflow `DNZCStD1ecCltSCB` archivieren** (war überflüssig — echte Lead-Search existierte schon). NUR nach Biancas GO anfassen.

**Weiteres bereits Live entdeckt (read-only):** `ORCH - AIVA Cockpit (Dashboard) - v1` (`HPl4FtmXeISou9FN`, aktiv) mit Karten für Salesteam/Empfang/Marketing-Redaktionsplan/Donna/OKRs (Ophra) — parallel gebaut, im Handover bisher nicht dokumentiert.
- **Dashboard-Link:** `https://aiva179.app.n8n.cloud/webhook/aiva-cockpit?key=7f7ac47671ef94fa` (Key ist der einzige Schutz, steht im Code — nicht öffentlich teilen; bei Bedarf gegen neuen tauschen).
- **Änderung 11.08. (mit Biancas GO):** To-do-Karte hat jetzt je offene Aufgabe einen **„✅ Erledigt"-Button** (Muster wie Sam/Marketing-Freigabe-Buttons). Setzt `Erledigt am`=heute → Aufgabe fällt aus der Liste. Umgesetzt per `update_workflow`: `Aktion pruefen` + Switch `Tabelle?` um `todo` erweitert, neuer Airtable-Node `To-do erledigen` (Cred `zWqHnt0xhODSDQ26`), `HTML bauen` rendert Button. Publiziert (activeVersion `6f983ad8…`). Egress-Proxy blockt Claude-seitiges Rendern-Prüfen → Bianca verifiziert per Klick.

### 20.6 NEUE ANFORDERUNG — Redaktionsplan (Marketing: Linni / Vera / Insta), offen
Bianca hat die **Vorlage für Linnis Redaktionsplan** gefunden: Airtable `appVrzySbfvHEW8nc/tblgcNe0E9oT5KdVi/viwYVgqxaWrS8V3k0`. Sie passt sie noch auf sich an (= Vorlage).
Auftrag: **in den gesamten Redaktionsplan integrieren** und **analog für „Vera" und „Insta" (Instagram) je eine eigene Tabelle** im Redaktionsplan bauen.
**Status: NUR read-only ansehen + Plan vorschlagen. NICHT bauen ohne Biancas ausdrückliches GO** (neue, feste Regel: erst schauen/fragen, GO holen, dann bauen — vieles ist schon live).

**ERLEDIGT 11.08. (mit Biancas GO):** Vorlage = Basis `appVrzySbfvHEW8nc`, bisher eine Tabelle **„Posts" (`tblgcNe0E9oT5KdVi`) = Linnis Plan** (Felder: Text/multilineText [primär], Status/singleSelect [Draft/Ready/Posted/Error], Date/date [local], Creative/multipleAttachments „nur EIN Bild – das erste – wird gepostet"). Strukturgleich neu angelegt:
- **Tabelle „Vera" `tblkhi3QwSS9DdC2A`** (Status-Choices selDSH…/selwZs…/selSY1…/self8m…).
- **Tabelle „Insta" `tblFkLGT7rvc79MuZ`** (Instagram; Status-Choices selXHc…/sel0lb…/selvkS…/selRaX…).
Linni war schon vorhanden (als „Posts") → nicht neu gebaut, nicht umbenannt (die Linni-Posting-Kette liest sie per Tabellen-ID).
**Offen/zu klären:** (a) „Posts" evtl. in „Linni" umbenennen für Konsistenz (ID bleibt, Workflow-Referenzen unberührt) — nur nach GO. (b) Für Vera + Insta braucht es noch je eine **Posting-Kette** (analog zur bestehenden Linni-Kette) — separater Build, erst nach GO.

### 20.5 GEBAUT: `ORCH - Sam Lead-Search - v1` (`WZnBsihP0PqbKQpN`) — 10.08. abends, NOCH NICHT publiziert
Nach Bauplan 20.4, komplett automatisch (kein manueller Trigger):
- **Kette:** Schedule **täglich 06:30** (vor Entwuerfe 07:30) → Code „Suchauftraege" (je Produkt EIN Suchwort/Tag, rotiert deterministisch über Tagesindex; Listen à 5 Keywords je Produkt im Code-Node — das ist die Stellschraube) → Unipile-Suche **Seite 1 + Seite 2** (Cursor als Query-Param, max 20 Rohtreffer/Produkt, 4 API-Calls/Tag wegen Commercial-Limit) → „Kandidaten flatten" (nur DISTANCE_2/3, URL-Pflicht) → „Kandidaten sammeln" (Intra-Run-Dedup, Kappung 40) → Airtable „Bestand laden" (alle Kontakte) → „Dubletten raus" (Member ID **und** public_identifier aus Profil-URL) → **„Qualifizieren (Sam)"** (Claude Sonnet 4.6, temp 0, strenger Classifier: Zielprofile je Produkt, Retreat nur Frauen, Wettbewerber/Coaches/Konzern-Angestellte raus; zerlegt Headline in Rolle+Firma) → „Auswahl + Felder" (max **5/Produkt/Tag**, JSON-Parse mit Fallback) → Airtable „Kontakt anlegen" (Name, Profil-URL, Member ID, Rolle, Firma, Akquise-Produkt, **Akquise-Status „Anschreiben"**, Sales-Funnel „Neu", Notizen mit Suchwort+Headline+Classifier-Grund als Freigabe-Kontext).
- **Testlauf Execution 2192:** Suchkette Ende-zu-Ende BELEGT — 2 Produkte × 20 Kandidaten geholt, Flatten/Dedup sauber (40 neu, 0 Dubletten). **Abbruch am Classifier: Anthropic-API „credit balance too low"** — Guthaben leer. ⚠ Betrifft AUCH die laufende Entwuerfe-Pipeline `jtpl5UP0IvsESOCn` (gleiche einzige Anthropic-Credential `IvYauXZeJ06D4E0u`) — die schlägt um 07:30 genauso fehl, bis Guthaben da ist.
- **Offen:** (1) Bianca lädt Anthropic-Guthaben auf → (2) Testlauf wiederholen (legt dann echte Kontakte „Anschreiben" an, Versand bleibt durch Freigabe-Gate sicher) → (3) publizieren. `TMP - Unipile Search Test` (`DNZCStD1ecCltSCB`) archiviert.
- **Keywords v1** (Rotation Tag für Tag): Research-Team: Personalberatung Inhaberin / Executive Search Inhaber / Personalberatung Gründerin / Personalberatung geschäftsführende Gesellschafterin / Headhunter Inhaber. Retreat: Unternehmensnachfolge Unternehmerin / Nachfolgerin Familienunternehmen / Geschäftsführerin Unternehmensnachfolge / Unternehmerin Generationswechsel / Übergabe Familienunternehmen Geschäftsführerin. Befund aus 2192: Research-Team-Treffer gut (echte Inhaberinnen dabei), Retreat streut wie erwartet stark (viele Männer + Nachfolge-BERATER = Wettbewerber) — genau dafür ist der strenge Classifier da.

### 20.6 LIVE 10.08. spätabends: 5 Produkte + Rotation, E2E getestet, PUBLIZIERT
- **Blocker weg:** Bianca hat Anthropic-Guthaben aufgeladen — betrifft auch die Entwuerfe-Pipeline (`jtpl5UP0IvsESOCn`, gleiche Credential), die läuft morgen 07:30 wieder.
- **Drei neue Produkte eingebaut** (`WZnBsihP0PqbKQpN`, publiziert `97db4532`), je 5 Keywords + eigenes Classifier-Zielprofil:
  - **Speaking Coach App (CEO-Sprech)** — CEO-Sprech/Konfliktgespräche/manipulative Gespräche. Zielgruppen-**Hypothese v1**: Führungskräfte mit echter Verantwortung DACH (GF/C-Level/Vertriebs-/Bereichsleitung); Rhetorik-Coaches = Wettbewerber, raus.
  - **Future-Self (Begleit-App)** — angeleitetes Future-Self-Erarbeiten, danach persönlicher Begleit-Chatbot. Zielgruppen-**Hypothese v1**: Personalentwicklung/L&D/HR-Direktion als Multiplikatoren + Unternehmer:innen in Neuausrichtung; Persönlichkeits-Coaches raus.
  - **Leadership Circle (Jahresbegleitung)** — Kommunikation+KI+Identität, 1 Jahr, max 5 Frauen. Classifier: NUR Frauen, GF/Unternehmerin/Vorständin/Senior, nur hochwertige Profile (Exklusiv-Format).
- **Rotation statt 25/Tag:** pro Tag suchen **2 der 5 Produkte** (Paar wandert täglich über Tagesindex), max 5/Produkt → **Gesamtdeckel 10 Kontakte/Tag** = Invite-Budget Free-Account. Von Claude entschieden (Bianca hatte die Mengen-Frage offen gelassen), im Chat geflaggt.
- **Testlauf Exec 2230 = success, komplette Kette:** Rotation zog Research-Team + Retreat, 40 Kandidaten, 0 Dubletten, Classifier lief (Guthaben ok) → **2 Kontakte angelegt** (Michaela Boeke/PERSONALBERATUNG BOEKE Nürnberg `recKxfG8JgtXaGBg0`, Claudia Peuser/PERSONALBERATUNG RIEMER Dortmund `recazj5UX5ixlvOvO`), Status „Anschreiben", Notizen mit Suchwort+Grund. Retreat: 0 aufgenommen (streut stark, Classifier bewusst streng). ⚠ Peuser ist grenzwertig (Headline klingt nach Karrierecoaching/Outplacement) — Biancas Freigabe-Gate fängt das; ggf. Classifier nachschärfen.
- **Ab morgen automatisch:** 06:30 Search → 07:30 Entwürfe → Biancas Freigabe in Airtable (`Akquise-Status = "Freigegeben"`) → 10:00 Versand (5+5 A/B).
- **Korrektur Bianca (gleich danach, deployed `fee42603`):** Future-Self richtet sich an „wache" Menschen, die Verantwortung für sich übernehmen und Selbstwirksamkeit wollen — NICHT an HR/L&D. Keywords (Selbstwirksamkeit/Selbstführung/…) + Zielprofil umgestellt; bei diesen Keywords sind die meisten Treffer Coaches (Wettbewerber) → Classifier dort besonders streng, erwartbar wenig Kalt-Volumen — Future-Self ist eher ein Marketing-/Inbound-Produkt (Website-Strecke fängt Interessenten).
- **Offen:** Zielgruppen-Hypothese Produkt 3 (Speaking Coach App) von Bianca bestätigen/schärfen (Stellschrauben: „Suchauftraege" + „Qualifizieren (Sam)"); Spur 2 (Warm/E-Mail) wartet weiter auf Stimme-Skill (Bianca/Petra).

### 20.7 Produkte-Tabelle befüllt + Marketing-Übergabe geklärt (10.08. nachts)
- **Fund: Die Produkte-Tabelle `tblNRHkpgTfWHo82Y` war KOMPLETT LEER** — d. h. Sophias `sophia-produkt`-Webhook und Donnas Portfolio-Tool liefen bisher ins Leere. Jetzt befüllt (Biancas Go „übernimm du das"): **5 Produkte in Biancas eigenen Worten** (Chat-Briefing 10.08. + Website-Texte): Voca/Speaking Coach App (`recKc9MeUtzKEp5zD`, Link + Founder-Code FOUNDER30 für die ersten 30), Future-Self-Begleit-App (`rec6HeCrzGtGqr1OS`, Link offen), Leadership Circle Jahresbegleitung (`recPUr3bB4MCqUmFF`, 5 Plätze, Zeeg-Erstgespräch), Retreat Identitätsshift (`recieL6yENZ34Aggs`), Digitales Team/Research-Team (`rec4gMwWTVCezf5iF`). **Preise überall offen — Bianca ergänzt.** Damit haben Sophia (Telefon), Leandra (A-Angebote), Sam (Anschreiben) und Marketing EINE Quelle.
- **Wer übernimmt die Bewerbung (Personalübersicht `app9r4BK5FJTU219P`/Team geprüft):** **Max = CMO** (Senior Marketer, owns Marketing-Strategie + Funnel, kuratiert den freigegebenen Content-Pool); **CC Top** (ex-Constance) ist Content-Ownerin und **führt den Redaktionsplan**, brieft Linni/Ina/Podcast; Nora gibt Zielgruppen-Feedback (Mode 1). Biancas Ansage: „mit Max absprechen". → Übergabeweg: Produkt-Briefing an Max/CC Top (Slack-Router/#ideen), daraus Redaktionsplan-Einträge (`tbld1fEJeD29wy4PT`) je Produkt-Kampagne.
- **Briefing GESENDET (Biancas Go „schick es an den ideenkanal"):** Einen #ideen-Kanal gibt es NICHT (Kanal-Suche belegt); CC Tops Kanal #constanze (`C0BF4UV31MK`) war bis heute leer und Bianca ist dort nicht Mitglied (`not_in_channel`). Gesendet an **#max** (`C0BLV0B32JC`, von Bianca angelegt): 5 Produkte, Priorität Circle→Future-Self→Voca, „Texte aus der Produkte-Tabelle ziehen", „keine Preise in Posts". ⚠ **Unverifiziert, ob ein Router/Workflow #max überhaupt liest** — die Marketing-Strecke (Nachricht → Max/CC Top → Redaktionsplan) ist noch nie gelaufen; nächster Schritt wäre ein Ende-zu-Ende-Test dieser Strecke.
- **Produkte mit Portfolio angereichert:** Quelle = Drive-Doc `Produktportfolio_und_Referenzen` (`1BnNL2qP9LEwc3aoSnQw6nPRqdaVKfoz39i-_emVIhiY`, Stand Aug 2026) + Website. **Preis-Prinzip aus dem Portfolio: „Preise nenne ich gern im Gespräch" — Preisfelder bleiben bewusst leer** (kein Versäumnis). Retreat um Premium-Format „Wege zurück in die eigene Führung" (Validierungsphase) ergänzt, Digitales Team um Ablauf+Referenzen. ⚠ Future-Self + Leadership Circle fehlen noch IM Portfolio-Doc (vermerkt); Future-Self-Link/Buchungsweg weiter offen.
- **Abgrenzung geklärt (Bianca 10.08. nachts, in Produkte-Tabelle eingetragen):** Leadership Circle = JAHRESBEGLEITUNG (1 Jahr, 5 Plätze) · „Identität unter Druck" = DREITÄGIGES RETREAT (⚠ Portfolio-Doc führt es noch fälschlich als Masterclass — bei Überarbeitung korrigieren).
- ~~Offen: Bauplan „Marketing-Eingang v1"~~ → **GEBAUT + LIVE, siehe 20.8**.

### 20.8 LIVE 10.08. nachts: „ORCH - Marketing-Eingang (Max/CC Top) - v1" (`0mJg6hf46o29NdsD`, publiziert `251ebe6e`)
- **Biancas Go + Klarstellung:** Max existierte nur als Stellenbeschreibung + leerer Kanal. Entscheidung gemäß Architektur 28.07.: KEINE eigene Max-Slack-App — Sub-Rollen im Orchestrator, Stimme = vorhandene Donna-App („Slack account" `prP7iCIQ4gY38qJP`; NICHT „Slack rhineshore" = Kundenprojekt!).
- **Kette:** Schedule alle 15 Min → #max-History (App per Self-Join Mitglied, TMP-WF `JpzObFE7jwp7ncTA` archiviert) → Filter (staticData-lastTs + ✅-Reaktion + bot_id/subtype raus, 48h-Cutoff) → Produkte-Tabelle laden → Agent „Max und CC Top" (sonnet-5, beide Rollen in EINEM Prompt: Max=Funnel, CC Top=Redaktionsplan; Regeln: Biancas Wording aus Produkte-Tabelle, KEINE Preise, Kanäle LinkedIn/Instagram/Substack/Podcast, max 8 Einträge, kein Auftrag→keine Einträge) → Redaktionsplan-Create (Status „Idee", Ziel, CC Top Empfehlung) → Thread-Antwort in #max → ✅-Reaktion als Dedupe-Marker.
- **E2E BELEGT (Exec 2236):** Das Produkt-Briefing vom Abend wurde als erster echter Job verarbeitet → **8 Redaktionsplan-Einträge angelegt** (recNvIRLFWNNtZ25A u. a.; 2× Circle, 2× Future-Self [1× Substack], 2× Voca [1× Instagram], 1× Retreat, 1× Digitales Team — Prioritäten aus dem Briefing respektiert, Titel in Biancas Claims), Thread-Antwort von „Donna" in #max, ✅ gesetzt. Airtable-Gegenprüfung: alle 8 mit Status „Idee" vorhanden.
- **Biancas Übergabe-Mechanismus ab jetzt:** formlose Nachricht in #max → binnen 15 Min entstehen Redaktionsplan-Einträge + Thread-Antwort. Erster Fehlversuch 2233 (`not_in_channel`) durch Self-Join gelöst.
- **Offen:** Linnis 140-Node-Strecke (Redaktionsplan→LinkedIn Posts) bleibt UNGETESTET — nächster Schritt: Bianca gibt EINEN der 8 Einträge frei (Status „Freigegeben"), dann die Linni-Kette einmal E2E beobachten/testen. Podcast-Kanal fehlt im Redaktionsplan-Select (Agent nutzt ihn ggf. — typecast legt ihn an, unkritisch).

### 20.10 Executive-Ton für Sams Entwürfe (11.08. vormittags, publiziert `57d520ec`)
- **Biancas Kritik an den ersten 8 Entwürfen:** „Nicht executive — nur eine Frage, und dann? Ich möchte eine Lösung anbieten, unterstützen." Ursache: Der Sam-Prompt in `jtpl5UP0IvsESOCn` ERZWANG das Frage-Muster („EINE ehrliche Frage stellen", „kein ‚ich helfe Ihnen'") — als High-Ticket-Vorsicht gebaut, von Bianca verworfen.
- **Prompt umgebaut:** Struktur jetzt: echter Bezug → worum es geht + konkretes Lösungsangebot in Alltagssprache → Unterstützungs-/Gesprächsangebot; Frage NUR noch als Abschluss. Eisern bleibt: kein Marketing-Sprech, keine Buzzwords, keine Preise/Codes, nichts erfinden, ~300 Zeichen. Produkt-Briefings um die 3 neuen Produkte ergänzt (Speaking App / Future-Self / Leadership Circle — für künftige Suchtreffer).
- **Alle 8 Entwürfe neu generiert (Exec 2386):** Dafür auch die **5 von Bianca bereits freigegebenen** (Wanner/Boeke/Duscha/Krüger/Peuser) zurück auf „Anschreiben" gesetzt — ihre Klicks galten den verworfenen Texten, die sonst morgen 10:00 rausgegangen wären. Alle 8 stehen wieder auf „Entwurf – Wartet auf Freigabe" im Cockpit. ⚠ Entwurf „simone schlecht" ist schwach (Text thematisiert das unpassende Profil) — Kandidatin fürs Überspringen.
- **Warme Kontakte umgelenkt (Biancas Go 11.08.):** Die 5 alten „Freigegeben" vom 27.07. (Christiane, Doris Graf, Vanessa Schönmetz, Silke Niehaus, Anna Lagosch) sind jetzt **raus aus der Kalt-Pipeline**: Akquise-Status „Übersprungen", neues Tag **„Warm – E-Mail-Spur"**, Notiz-Vermerk (bestehende Notizen/Tags erhalten). Sie warten damit sauber markiert auf **Spur 2** — die startet erst, wenn das Stimme-Dokument (Bianca/Petra, §20.2) steht. Die Kalt-Freigegeben-Liste ist damit leer; was künftig auf „Freigegeben" steht, ist ausschließlich von Bianca im Cockpit freigegebene Kaltakquise.

### 20.11 A-Angebote aus der Produkte-Tabelle (11.08. nachmittags, publiziert `09cb15d9`)
- **Biancas Auftrag:** „Automatische Angebote — da sind bisher keine hinterlegt." Befund: Die Einstiegsangebote des A-Zweigs (`FmC7exobAoPLIdVK`) waren HARTKODIERT im Prompt (Identitätscheck 49 €, Voca, alte Coach-Liste) — nicht in der Produkte-Tabelle.
- **Umbau:** Neues Checkbox-Feld **„Einstiegsangebot (A-Zweig)"** (`fldNOvidbFHiMwVRX`) in Produkte; neuer Datensatz **„Der Identitätscheck (Einstieg, 49 €)"** (`rec6apQ9NckLKsAqe`, Preis 49, Zeeg-Link) — war das fehlende Kernangebot; Haken bei Identitätscheck + Voca. A-Zweig lädt jetzt live: Route(A) → „Angebote laden (A)" (Filter auf Checkbox, alwaysOutputData+executeOnce) → „Angebots-Kontext (A)" → KI-Prompt bekommt die Angebote als JSON. Regeln: nur gelistete Produkte, **Preis nur wenn Preisfeld gefüllt**, Aktionscodes aus Notizen erlaubt (FOUNDER30), immer Zeeg-Erstgespräch.\n- **E2E belegt (Exec 2431):** Angebots-Mail empfiehlt Identitätscheck MIT 49 € + Voca MIT Founder-Code OHNE Preis („besprechen wir persönlich"). Testdatensatz gelöscht. **Effekt: Neues Einstiegsangebot = Haken in der Tabelle setzen, fertig — kein Prompt-Umbau mehr.** Offen: Voca-Preis (nur Bianca), Future-Self-Link.\n- **Lexware Office VERIFIZIERT (11.08. nachmittags):** Credential **„Bearer Auth Lexware Office API" (`WDuvzC5hxOdLAnoj`)** existiert in n8n und funktioniert (Lese-Test via TMP-WF `jAh6CRucD9lN8Ers`, archiviert). Befund: Firma AIVa UG (INVOICING_PRO, taxType vatfree). **5 Artikel** gepflegt: AnalyseWorkshop (Preis 0 — Preis steht wohl nur im Angebot), KI-Assistent 379 €, KI Schulung 1:1 325 €/Std, KI-Schulung Teams 679 €, KI-Workshop VaiBe 379 €. **3 Angebote:** AG0003 heinekingmedia 2.170 € (= Biancas „fertiges Tagesworkshop-Inhouse-Angebot"/AnalyseWorkshop, Status ÜBERFÄLLIG seit 16.07. — Nachfass-Chance!), AG0002 Rhineshore 7.900 € angenommen, AG0001 Köhler Baumaschinen 3.500 € abgelehnt. ⚠ API-Rate-Limit 2 Requests/Sekunde (belegt) — beim Bauen Pausen einplanen.
- **Stufe 1 GEBAUT + LIVE (11.08. nachmittags, Biancas „okay, gut"):** **`ORCH - Lexware Artikel-Tool (Sophia/Donna) - v1` (`6KeZef13FRgtAUVh`, publiziert):** Webhook `POST /webhook/lexware-artikel` {thema} → liest Artikel live aus Lexware (Bearer-Cred) → vorlesbarer Text mit Titeln, Kurzbeschreibung und Listenpreisen („ohne Preis → auf Anfrage", Reisekosten-Hinweis). Curl-Test belegt. **In ElevenLabs als Workspace-Tool `lexware_artikel` (`tool_8301kzrmjh13f6bt7x73zkys5ch9`) angelegt und BEIDEN Agenten zugewiesen** (Sophia jetzt 5 Tools, Donna 7 — per PATCH auf tool_ids, verifiziert; TMP-WFs archiviert). Wichtig gelernt: Sophias Tools hängen als tool_ids (Workspace-Tools) am Agenten, nicht inline.
- ⚠ **Offener Konflikt für Bianca:** Sophias Prompt enthält weiter die eiserne Regel „NIEMALS einen Preis nennen" — das neue Tool liefert aber Listenpreise. Stand jetzt: Sophia schlägt Artikel nach, verweist bei Preisen weiter auf Bianca (Prompt-Regel dominiert). Bianca entscheidet, ob Listenpreise am Telefon genannt werden dürfen → dann Prompt-Regel anpassen.
- **Preis-Regel AKTUALISIERT (Biancas Ansage 11.08. nachmittags, Exec 2446 verifiziert):** Lexware-Listenpreise sind NICHT hochpreisig → **dürfen am Telefon genannt werden**. Sophias alte Regel „NIEMALS einen Preis nennen" per API ERSETZT; bei Sophia UND Donna neuer Block „PREIS-REGEL (Lexware, Stand 11.08.2026)": Listenpreise ok, **Tagessatz 2.790 € netto zzgl. Vor-/Nachbereitung + Reisekosten** (auf Nachfrage nennbar, auch im Artikel-Tool-Text hinterlegt), Individuelles klärt Bianca, **ABSOLUT TABU: Namen anderer Kunden/Details aus Angeboten**. Die Agenten sehen ohnehin NUR die Artikelliste, nie die Angebote (Biancas Präferenz, bestätigt). TMP-WF `EylyEnP6a6Cf5Zl2` archiviert. Bianca räumt Lexware-Artikelliste noch auf (wirkt live).
- **NEU offen: Website-Chatbot (Biancas Idee, Vorschlag im Chat):** Chat auf biancaenderlin.de, der Anliegen klärt, Angebote nennt/versendet und Termine bucht. Vorschlag: eigene WEB-Agentin in ElevenLabs (Schwester von Sophia, Text-Widget — Sophias Config kann text_only) mit den vorhandenen Tools (lexware_artikel, Zeeg-Link senden, Lead in Leads (Inbound) anlegen → bestehendes A/B/C-Routing übernimmt Angebots-Mails); Einbindung als Embed auf der Onepage-Site. Kleinpreisige Angebote automatisch (A-Logik), Lexware-Angebote bleiben Entwurf + Biancas Klick, Termine via Zeeg-Link (Zeeg bleibt Single Source). Wartet auf Go.
### 20.12 Website-Chatbot „Leandra" LIVE (11.08. abends, Biancas Go)
- **Kein Voiceflow** (wäre dritte Plattform mit Doppelpflege) — stattdessen ElevenLabs-Text-Agent + Widget, nutzt die vorhandenen Werkzeuge.
- **Agentin: „Leandra (Website-Chat)" `agent_2601kzrnj6w1fh4b4fr0srrfcg70`** (per API angelegt, TMP-WF archiviert): text_only, gpt-5.6-luna, Sie-Form/Executive-Ton, Zeeg-Link direkt im Chat, PREIS-REGELN wie Telefon (Listenpreise ok, Tagessatz 2.790 € nennbar, Kundennamen TABU, DSGVO-Einverständnis vor Lead-Speicherung). **Tools (Workspace-IDs):** lexware_artikel `tool_8301…`, zeeg_link_senden `tool_1201…ypf…` (donna-zeeg), lead_anlegen `tool_2001…` (donna-lead → Leads (Inbound) „Anruf offen" + Slack-DM → Sophia-Rückruf-Pipeline), ergebnis_speichern `tool_1201…yqf…` (Slack + Logbuch).
- **Einbindung: site-weiter Custom Code** (`update_site_settings` code_body: `<elevenlabs-convai agent-id=…>` + unpkg-Embed-Script) — Chat-Blase erscheint auf ALLEN Seiten. **Lehre:** Vibe-Section-Weg scheiterte (SSR liefert Markup, aber Sektionen hydratisieren lazy — eine unsichtbare 1px-Sektion mountet nie, useEffect läuft nie); Sektion wieder gelöscht (`798ad9c8…`, React-App mit entfernt). **Live verifiziert:** Element + Script + Custom-Element + shadowRoot vorhanden.
- **Bianca hat getestet: „cool – der funktioniert."**
- **Geführte Journey NACHGERÜSTET (Biancas Go, PATCH verifiziert `agtvrsn_6001kzrp…`):** Erstnachricht bietet 4 Wege (1️⃣ Workshop/Vortrag · 2️⃣ Retreat/persönliche Begleitung · 3️⃣ Digitales Team · 4️⃣ Umschauen), Prompt führt pro Weg strukturiert (max. eine Frage pro Antwort, jeder Weg endet mit Erstgespräch/Zeeg oder lead_anlegen). Hinweis: Echte klickbare Buttons kann das ElevenLabs-Widget nicht — nummerierte Wege sind der v1-Weg; echte Buttons gingen nur mit eigenem Chat-UI (vermerkt als mögliche v2).
- **Cartoon-Avatar GESETZT (11.08. abends):** Bianca lieferte `Leandra_chatbot.jpg` in Drive-Ordner **„signature bilder"** (`1J44wxBRf-c_MchojpXlnkTSSTQ4gInsJ`) — Comic-Frau, dunkle Bluse, Kette. Upload-Weg (API-Key liegt nur in n8n): TMP-Webhook-Brücke nahm Base64 an → multipart `POST /v1/convai/agents/{id}/avatar` → CDN-URL zurück; ⚠ Upload setzt das Widget NICHT automatisch um — zusätzlich PATCH `platform_settings.widget.avatar = {type:"image", url:…}` + `show_avatar_when_collapsed: true` nötig (verifiziert `agtvrsn_9601kzrq…`). Brücke unpublished + alle TMP-WFs archiviert. Leandras Gesicht erscheint jetzt auf der Chat-Blase und im Chat.
- **Offen außerdem:** Feinschliff Widget-Farben/Terms-Text (aktuell englischer Standard-Consent-Text — für DE-Site eindeutschen), Datenschutz-Hinweis für den Chat in der Datenschutzerklärung ergänzen (Harvey/Bianca).

- **Stufe 2 (Angebots-Entwurf-Automation) WARTET:** Bianca überarbeitet erst die Artikelliste in Lexware (Voca als Artikel mit Link, weitere Apps folgen, Tennis-App kommt als Angebot rein — Whoop-Anpassung individuell). Danach: n8n legt nach C-Gespräch Angebot als ENTWURF in Lexware an, Versand bleibt Biancas Klick. Voca-Link aktualisiert: **https://voca-mxp6.onrender.com/** (Produkte-Tabelle `recKc9MeUtzKEp5zD`).

### 20.13 Profilerin + Apps für die Ladies (12.08.)

**(a) Zwei Bugs hinter „die Gesprächsvorbereitung funktioniert nicht" — Kern-Fund des Tages.** Die Vorbereitung war seit Wochen gebaut, kam aber nie an. Zwei Ursachen, beide gefixt in `FmC7exobAoPLIdVK` (publiziert `4311d0c4`):
- **Bug A (Feldname):** Alle Anthropic-Ausgaben wurden per `$json.merged` gelesen — das Feld heißt **`merged_response`** und erscheint nur mit `options.includeMergedResponse: true`. Folge: Airtable-Felder blieben leer, Mails enthielten den Fallback-Text.
- **Bug B (eigentliche Ursache):** `options.maxTokens` stand auf dem Default **1024**. In Exec 2585 verbrauchte das Modell exakt diese 1024 Output-Tokens im Thinking-Block und lieferte **gar keinen Text** (`merged_response: ""`). Fix: `maxTokens: 4000` bei Profilerin, Gesprächsvorbereitung und Angebot. **Lehre für alle künftigen Anthropic-Nodes: Default-maxTokens reicht nicht, wenn Thinking an ist.**

**(b) Spezialistin für C-Leads gebaut (Biancas Auftrag „Big Five, Enneagramm und was es so alles gibt"):** neuer Node **„Profilerin (Persoenlichkeit)"** im C-Zweig, VOR der Gesprächsvorbereitung (`claude-sonnet-5`, maxTokens 4000). Schreibt in neues Airtable-Feld **„Persönlichkeitsprofil"** `fldsSyXDyYlBOtAVn` (Leads (Inbound)). Prompt-Kern: Big Five/OCEAN, Enneagramm inkl. Flügel/Stressrichtung, DISG, Reiss-Motive, Sprach-/Prozessanalyse; **jede Aussage ist ausdrücklich HYPOTHESE mit Belegstelle**; keine Diagnosen, keine Pathologisierung, keine Klischees nach Branche/Geschlecht; 7 feste Überschriften, max. 350 Wörter. **E2E belegt:** Testlead „PROFIL-TEST C" erzeugte vollständiges Profil (Zitat: „Der Nachsatz ‚Testlauf bitte ignorieren' verrät Ordnungssinn") **und** vollständige Gesprächsvorbereitung. Testdaten gelöscht (`recA6bfHfX6FrDNuF`, `recAlffjiWnMvvbc2`).

**(c) Apps für die Ladies verfügbar gemacht (Biancas Frage „Wollen wir diese den Ladies ebenfalls zur Verfügung stellen?"):**
- Zwei neue Produkte in der Produkte-Tabelle: **TennisShift** `recI9fwPRRXTlETV5` (Link `https://tennisshift.netlify.app/`) und **Reizarm** `recdlmD22rdhuBrfN` (⚠ **noch nicht deployed** — liegt nur im Repo `github.com/Bianca179/aiva/tree/main/reizarm`; sobald Live-URL existiert, in `Angebotsarchitektur-Link` eintragen, dann teilen die Agentinnen sie automatisch).
- **Befund:** `/webhook/sophia-produkt` lieferte Produkte **ohne Links** zurück — der Airtable-Node las das Link-Feld gar nicht. Gefixt in `A5qEeHOQ0BaorGMZ` (publiziert `ffb012f2`): Feld **`Angebotsarchitektur-Link`** wird mitgelesen, der Code hängt ihn an jeden Treffer; ohne Link → „Link folgt in Kürze". **Belegt per curl:** Voca und TennisShift kommen jetzt mit Link, Future-Self mit Hinweis.
- **Werkzeug bei allen drei Agentinnen registriert:** neues ElevenLabs-Workspace-Tool **`produkt_info` `tool_3401kztpr4dzecx9r87y527vsx4n`** (Beschreibung nennt ausdrücklich die Apps und erlaubt das Teilen der Links) → **Leandra** `agent_2601kzrnj6w1fh4b4fr0srrfcg70` (hatte vorher gar kein Produkt-Tool), **Sophia** `agent_4801kzkjqe1vf4jsam5ffagvhqpe` (altes dünnes Tool ersetzt) und **Donna** `agent_1801kznxw02af899y3exzwytmsxq`. Per GET verifiziert: Tool hängt dran, Prompts unverändert (Leandra 2943, Sophia 2583, Donna 2636 Zeichen).
- **Bauweg (für Wiederholungen):** ElevenLabs-Key liegt nur in n8n → `TMP - PVC Proxy` (`f1CHwgeTClyJB8vu`) um `/pvc-get` und `/pvc-patch` erweitert, Credential **`Elevenlabs` `W7YE9YwJcFJFmk1Q`** (nicht „Elevenlabs AIVa"). **PATCH auf Agenten ist ein Deep-Merge:** `{conversation_config:{agent:{prompt:{tool_ids:[…]}}}}` genügt, der Prompt bleibt stehen. **Brücke danach unpubliziert** (verifiziert: `/pvc-get` → HTTP 404) — sie wäre sonst ein offener, unauthentifizierter Zugang zu Biancas ElevenLabs-Konto.
- **Verwaist, kann Bianca in der ElevenLabs-UI löschen:** altes Tool `produkt_info` `tool_3301kzkrhb5qez0brm4qcveppe66` (hängt an keinem Agenten mehr).

**(d) Kosten-/Caching-Frage beantwortet (Biancas Frage nach Caching und Sub-Agenten):** Prompt-Caching bringt hier nichts — die System-Prompts liegen unter der Mindestgröße von 1.024 Tokens, und der Cache lebt nur 5 Minuten, während C-Leads einzeln und Stunden auseinander eintreffen; der n8n-Anthropic-Node bietet ohnehin keine Cache-Steuerung. Die gewünschte Sub-Agenten-Architektur ist bereits gebaut: die Profilerin hängt ausschließlich am C-Ausgang des Switch und läuft bei A- und B-Leads gar nicht. Verbleibende Hebel, falls die Kosten je stören: günstigeres Modell für die Profilerin oder Zusammenlegen von Profilerin und Gesprächsvorbereitung in einen Aufruf (spart Tokens, kostet Trennschärfe).

### 20.14 Lexware Stufe 2 LIVE: Angebots-Entwurf für C-Leads (12.08., Biancas „so")

**Biancas Vorgaben, die den Bau geformt haben:** Voca und TennisShift sind Links mit Paywall und gehören NICHT nach Lexware. Retreat und Leadership Circle sind High Tickets und gehen als individuelle Angebote raus. C-Lead-Angebote sind individuell. → **Konsequenz, die den ursprünglichen Plan änderte:** Der Entwurf wird NICHT aus der Artikelliste zusammengesetzt, sondern als echtes Individualangebot formuliert; die Artikelliste dient nur als Preisanker.

**Neuer Workflow `ORCH - Angebots-Entwurf C-Leads (Lexware) - v1` (`YqIRx1eIjEfr0tXG`, aktiv, publiziert `58721903`).** Kette: `GET /webhook/angebot-entwurf?lead=recXXX&key=…` → **Zugangs-Check VOR jedem Schreibvorgang** → Lead holen → Artikel laden (Preisanker) → Kontext bauen → KI „Angebot formulieren" (`claude-sonnet-5`, maxTokens 4000) → Angebot bauen (Code) → **POST `/v1/quotations?finalize=false`** → Lead aktualisieren → Mail an Bianca → Redirect zurück ins Cockpit. Fehler-Workflow: `Sa3c6JClOoPKNAp5`.

**Die drei Entscheidungen (Bianca bestätigt):** Auslöser ist ihr Klick, nicht Automatik nach jedem C-Gespräch. Die KI schlägt Positionen und Preise vor, festlegen tut Bianca. Der Entwurf entsteht **ohne Lexware-Kontakt** (nur `address.name`) — Zuordnung macht Bianca, um Dubletten in der Buchhaltung zu vermeiden. Versand bleibt in jedem Fall ihr Klick.

**Steuer-Fund (belegt aus AG0003):** Biancas Angebote laufen **umsatzsteuerfrei nach § 4 UStG** (`taxConditions.taxType: "vatfree"`), nicht mit 0 % MwSt. Der Workflow setzt das fest; der KI ist verboten, „netto" oder einen Steuersatz zu schreiben. ⚠ **Offen für Bianca:** Das Lexware-**Artikel-Tool** sagt Kundinnen am Telefon weiterhin „2.790 Euro **netto**" — bei USt-Freiheit irreführend. Formulierung ist noch nicht geändert, weil Biancas Antwort dazu aussteht.

**Drei Fehler im Testlauf gefunden und behoben — alle drei wären sonst beim Kunden gelandet:**
1. **HTTP 529 (Anthropic überlastet)** brach den ersten Lauf ab → beide Außenaufrufe haben jetzt 3 Versuche mit Abstand.
2. **Lexware wies den Entwurf mit 406 zurück: `title` darf höchstens 25 Zeichen haben.** Die KI schrieb länger. Fix an zwei Stellen (Prompt kennt die Grenze, Code kappt hart).
3. **Der schlimmste:** Weil der Lexware-Aufruf auf `neverError: true` stand, **lief die Kette nach dem 406 fröhlich weiter** — schrieb einen kaputten Link ins Airtable und mailte Bianca einen Entwurf, den es gar nicht gab. `neverError` entfernt; Fehler brechen jetzt ab und laufen in den zentralen Alarm. **Lehre: `neverError` gehört an Diagnose-Aufrufe, niemals an einen Schreibvorgang.**
4. Zusätzlich: Die KI schrieb „Dieses Angebot gilt 14 Tage", während das Ablaufdatum im Beleg auf 30 Tage stand — Widerspruch im Kundendokument. Fristen zu nennen ist der KI jetzt verboten.

**E2E belegt (AG0005, Status `draft`):** Titel „Analyse und Roadmap" (19 Zeichen), zwei Positionen (Status-quo-Analyse 2.790 € am Tagessatz-Anker, Vor-/Nachbereitung 890 €), Einleitung greift den Eröffnungssatz aus der Gesprächsvorbereitung auf, Deliverables benannt, `vatfree` gesetzt, kein Kontakt zugeordnet, keine erfundene Frist.

**Cockpit erweitert (`HPl4FtmXeISou9FN`, publiziert `c7d6adab`):** Die Empfangs-Karte listet C-Leads jetzt einzeln — Gesprächsvorbereitung und Persönlichkeitsprofil aufklappbar, vorhandener Entwurf aufklappbar, blauer Knopf „Angebots-Entwurf erstellen" (bzw. „Neuen Entwurf erzeugen"). Live verifiziert.

**Aufräumen:** Test-Lead in Airtable gelöscht. ⚠ **In Lexware liegen zwei Test-Entwürfe (AG0004 und AG0005, beide „TESTLAUF Musterwerk AG") — die API kann Belege nicht löschen, das macht Bianca in der Lexware-Oberfläche.** Ebenso liegt eine Test-Mail in ihrem Postfach.

**Nebenbefund gefixt:** Das Artikel-Tool (`6KeZef13FRgtAUVh`, publiziert `e54690ef`) las nur die ersten **5** Artikel vor. Nach Biancas Aufräumen sind es 6 — der neue **Umsetzungsshift (279 €)** fiel hinten runter und wurde von keiner Agentin je genannt. Deckel auf 8 angehoben, belegt per Aufruf.

**⚠ Zwei-Sessions-Kollision — real passiert, Ursache verstanden:** Eine parallele Session hat am selben Tag denselben Code-Node („HTML bauen") bearbeitet und danach publiziert. Ergebnis: **mein C-Leads-Abschnitt war stumm verschwunden** — kein Fehler, keine Warnung, die Seite lieferte einfach die andere Fassung. Aufgefallen ist es nur, weil `git push` wegen fremder Commits abgelehnt wurde und ich daraufhin live nachgesehen habe. **Behoben durch Merge:** aktuellen Stand gelesen, meinen Abschnitt daraufgesetzt, publiziert; live verifiziert, dass **beides** da ist (C-Leads-Abschnitt, 15 To-do-Erledigt-Knöpfe, 7 Sam-Freigabe-Knöpfe). **Lehre: `setNodeParameter` auf einen Code-Node ist ein Vollüberschreiben ohne Merge.** Vor jeder Änderung an einem geteilten Node erst den aktuellen Stand lesen, und nach dem Publizieren live prüfen, ob die eigene Änderung noch da ist. Ein abgelehnter Push ist ein Warnsignal für n8n, nicht nur für Git.

**Bauweg-Lehren für n8n (neu):** Der Workflow-SDK-Parser verbietet `.join()` und andere native Methoden im Bau-Code — mehrzeilige Strings als Template-Literale schreiben. Backticks im jsCode brechen Template-Literale; Code-Fences stattdessen über `String.fromCharCode(96)` erkennen. Und: Ein `ifElse` mit zwei vollständigen Zweigen ist der saubere Weg für den Key-Check, weil der `onFalse`-Zweig eine eigene Antwort liefern muss.

### 20.15 Telefonie LIVE auf deutscher Festnetznummer (12.08.)

**Der Blocker seit Wochen ist weg: Bianca hat die DE-Festnetznummer `+49 7156 4229016`** (das alte 07156-Twilio-Regulatory-Ticket). Twilio-Konto: Account-SID bewusst NICHT hier notiert (GitHub blockiert sie als Geheimnis) — sie steht in der n8n-Credential „Twilio account" `ADZsjSzLPxeRkJI2` und in der Twilio-Console.

**Ausgangslage, die niemand auf dem Schirm hatte:** Sophia rief deutsche Leads bis heute mit einer **US-Nummer** an (`+1 571 586 5442`, Label „Sophia + Donna (AIVA)"). Für die Annahmequote ist das Gift. Entwarnung zur alten Sorge: Es war Biancas eigene AIVA-Nummer, **nicht** die Kunden-Demo-Nummer.

**Geprüfte Eigenschaften der neuen Nummer (Twilio-API):** `voice: true`, **`sms: false`** — deutsche Festnetznummern können kein SMS. `address_requirements: local` erfüllt. Vor dem Import war `voice_url` leer, eingehende Anrufe liefen also ins Leere.

**Jetzt live:**
- ElevenLabs: Label „AIVas Team", **`phnum_4901kzvfk5vkf80swp390xmz0rq3`**, inbound + outbound, **Donna zugewiesen**.
- Sophias Anruf-Workflow **`i9JHfn8I4jmKkmPR`** (publiziert `edbaa3d5`): Nummern-ID getauscht, sie wählt jetzt mit der deutschen Nummer heraus.
- **Ausgehender Testanruf erfolgreich** (`conv_9501kzvn7tqff6wb1x8y076pgctc`, `CA418a7d93…`).
- **Eingehender Testanruf mit fremder Anrufer-ID erfolgreich:** über die (noch bestehende) US-Nummer wurde Biancas Handy angerufen und dann auf die Festnetznummer gebrückt, sodass Donna eine unbekannte Nummer sah und in den Empfangs-Modus ging. Bauweg: Twilio-Calls-API mit `Twiml` = `<Say>` + `<Dial callerId="+1571…">`.
- Bianca: „funktioniert" — Stimme passt sie bei Gelegenheit noch an.

**⚠ Zwei Donnas gefunden.** `agent_1801kznxw02af899y3exzwytmsxq` (10.08. 13:30, 2636 Zeichen Prompt, **8 Werkzeuge**) ist die echte. `agent_1101kznx2r44ercss3aysbmdw9ad` (13:16, **0 Werkzeuge**, kaputte Variable `{begruessung}}` statt `{{begruessung}}`) ist der Fehlversuch aus der API-Anlege-Session und tauchte als zweites „Donna" im Zuweisungs-Dropdown auf. **Umbenannt in „Donna (Fehlversuch 10.08. - NICHT verwenden)"**, damit die Verwechslung nicht wiederkommt. Löschen steht aus (Biancas Go nötig).

**⚠ Lehre — mein eigener Brücken-Bug hat zu einer Falschmeldung geführt:** Die PVC-Brücke antwortete mit `{{ $json }}`. n8n zerlegt JSON-**Arrays** in einzelne Items, `respondToWebhook` liest aber nur das erste — dadurch sah ich bei zwei Telefonnummern nur eine und meldete Bianca fälschlich, ihr Import sei fehlgeschlagen. Sie hat es per Screenshot widerlegt. **Fix: `{{ $input.all().map(i => i.json) }}`.** Gilt für jede Listen-Antwort über diese Brücke — der Fehler war unsichtbar, weil eine gekürzte Liste wie eine gültige Antwort aussieht.

**US-Nummer stillgelegt (Biancas Entscheidung: „ich zahle nichts, was ich nicht brauche").** Vor der Freigabe belegt: **11 ausgehende Anrufe, alle an Biancas Handy, kein einziger eingehender** — es hing nichts daran. Reihenfolge: erst aus ElevenLabs entfernt (HTTP 204), dann bei Twilio freigegeben (`PNb150edcb…`, HTTP 204). **Endstand verifiziert: in beiden Systemen existiert nur noch `+49 7156 4229016` → Donna.** Der Weg über die US-Nummer, um einen Anruf von einer *fremden* Nummer zu erzeugen, steht damit nicht mehr zur Verfügung; für künftige Eingangstests braucht es ein anderes Telefon.

**`TMP - PVC Proxy` (`f1CHwgeTClyJB8vu`) archiviert.** Die Brücke hatte am Ende acht Endpunkte (GET/PATCH/POST/DELETE gegen ElevenLabs, Lexware und Twilio) und war damit ein offener, unauthentifizierter Zugang zu drei Konten. Sie war nach jeder Nutzung unpubliziert; jetzt ist sie ganz weg (alle acht Pfade auf 404 geprüft). **Für den nächsten Einsatz neu bauen statt reaktivieren** — dann ist sie nie länger offen als nötig.

**KI-Hinweis gesetzt (Biancas Auftrag, 12.08.):** Alle drei Agentinnen sagen jetzt im ersten Satz, dass sie eine KI sind und dass das Gespräch verarbeitet und gespeichert wird, mit Verweis auf die Datenschutzerklärung.
- **Sophia** und **Leandra**: `first_message` per API getauscht (Prompts unverändert).
- **Donna**: Ihre Begrüßung kommt nicht aus ElevenLabs, sondern aus dem Code-Node „Modus bestimmen" in `eTQjKoyHfxuUV1vA` (publiziert `0bc3c726`) — drei Varianten. Hinweis nur bei **bekannten und unbekannten externen** Anrufenden; Biancas eigene Begrüßung bleibt ohne. Live geprüft über `/webhook/donna-anruf-init` mit beiden Anrufer-IDs.
- Nebenbei repariert: Die Begrüßungen enthielten ASCII-Ersatzschreibungen („fuer", „Schoen"), die die Sprachausgabe falsch vorlas — jetzt echte Umlaute.
- **Bauweg-Lehre:** Umlaute und Emoji über PowerShell-Kommandozeile an die API zu schicken zerstört sie (aus „Gespräch" wurde „Gespraech", aus 1️⃣ wurde „1..bd."). Verlässlich ist: Text als UTF-8-Datei schreiben, in PowerShell mit `-Encoding UTF8` lesen und als `UTF8.GetBytes()` senden.

**⚠ Damit fällig geworden:** Die Agentinnen verweisen jetzt auf die Datenschutzerklärung. Dort muss die Telefon- und Chat-Verarbeitung auch tatsächlich beschrieben sein — sonst zeigt der Hinweis ins Leere. Gehört ins schon vorbereitete Anwalts-Briefing.

**⚠ Offen vor Veröffentlichung der Nummer auf der Website:** Wenn eine KI Anrufe entgegennimmt, gehört das den Anrufenden gesagt — dieselbe Frage wie beim Website-Chat, für den das Anwalts-Briefing schon geschrieben ist. Der Punkt gehört mit ins Anwaltspaket, bevor die Nummer öffentlich beworben wird.

### 20.9 LIVE 11.08. früh: „ORCH - AIVA Cockpit (Dashboard) - v1" (`HPl4FtmXeISou9FN`, publiziert `8e785850`)
- **Biancas Wunsch:** eigenständiges Web-Dashboard „wie für Philipp" statt Airtable-Interface (Airtable findet sie kompliziert). Ein zuvor angelegtes Airtable-Interface „Cockpit" (`pbdBezyX2kVCfbCtA`) wurde wieder gelöscht (revert-actionId `actfxL4j9sxxZvt1g`).
- **Bauweise:** GET-Webhook `https://aiva179.app.n8n.cloud/webhook/aiva-cockpit?key=7f7ac47671ef94fa` → 6 Airtable-Reads (Kontakte, Leads Inbound, Redaktionsplan, To-dos, OKRs, Key Results; alle `alwaysOutputData` — Lehre bestätigt: leere OKR-Tabelle stoppte anfangs die Kette, Fix im HTML-Builder filtert Leer-Items) → Code baut HTML-Seite (Karten: Heute wichtig/KPIs, Salesteam Sam, Empfang Leandra/Sophia, Marketing Max/CC Top, Donna To-dos, OKRs Ophra; Airtable-Deep-Links zum Freigeben, Auto-Refresh 5 Min, Handy-tauglich).
- **Zugriff:** `?key=` wird im Code geprüft (ohne Key → „Zugriff verweigert"). Ehrlich: Key steht in der URL = Soft-Schutz gegen Zufallszugriffe, kein echter Login.
- **LIVE VERIFIZIERT 11.08. ~09:00:** Seite liefert echte Daten — **8 Sam-Entwürfe „Wartet auf Freigabe"** (die 06:30-Suche + 07:30-Entwürfe-Pipeline liefen nach Guthaben-Aufladung erstmals komplett automatisch durch: neue Kandidaten inkl. Wanner/Boeke/Duscha/Krüger mit personalisierten Openern!), 11 Marketing-Ideen, 0 Rückrufe, 17 To-dos.
- **NACHGERÜSTET 11.08. ~10:40 (Biancas Wunsch „Freigabe per Klick", publiziert `e5833bb6`):** Zweiter Webhook `/webhook/aiva-cockpit-aktion` (key-geprüft im Code, ungültiger Key → Abbruch VOR jedem Schreibvorgang, belegt Exec 2355/2357) → Switch kontakt/plan → Airtable-Status-Update → Redirect zurück ins Cockpit. Dashboard-Karten Sam + Marketing haben jetzt pro Eintrag **„Entwurf/Empfehlung lesen" (aufklappbar, Volltext)** + Buttons **✅ Freigeben / Überspringen** (Kontakte: Freigegeben/Übersprungen) bzw. **✅ Freigeben / Verwerfen** (Redaktionsplan: Freigegeben/Verworfen). E2E-Test ohne Nebenwirkung: No-op-Klick auf bereits freigegebenen Kontakt Doris Graf (`recIeaECpz3a242If`, Status unverändert „Freigegeben") — komplette Kette belegt. Bianca braucht Airtable fürs Tagesgeschäft damit nicht mehr.

---

## 8 · Referenzen
- n8n-Instanz: `aiva179.app.n8n.cloud`
- Frühere Docs: HANDOVER v3 (07.07.), DIRIGENT-v2-Plan (14.07.), SESSION 07.07. (Morgenpost-Spez).
- Master-Ordner (Langdock/Drive): CLAUDE.md, BIANCA.md, Angebotsarchitektur-v1.
