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

## 8 · Referenzen
- n8n-Instanz: `aiva179.app.n8n.cloud`
- Frühere Docs: HANDOVER v3 (07.07.), DIRIGENT-v2-Plan (14.07.), SESSION 07.07. (Morgenpost-Spez).
- Master-Ordner (Langdock/Drive): CLAUDE.md, BIANCA.md, Angebotsarchitektur-v1.
