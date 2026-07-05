# Projekt-Protokoll: Dashboard für L. (Tennis College Irvine)

> Laufendes Gesprächsprotokoll. Wird bei jedem relevanten Gesprächsschritt fortgeschrieben.
> Start: 2026-07-05

---

## 1. Ausgangslage (Stand 2026-07-05)

**Wer:**
- Sohn, 21 Jahre, besucht das Tennis College in Irvine (Kalifornien).
- Mutter (Bianca) baut die Unterstützungs-Tools und möchte ihn **maximal unterstützen und vor allem empowern** — nicht kontrollieren.

**Was bisher existiert:**
- Drei Chatbots in **Langdock**, von der Mutter gebaut:
  1. **Whoop-Bot** („Unterkommer"-Bot) — mit seinem Whoop-Wearable verbunden. Kandidat für Ausbau zum **Fitness-Coach**.
  2. **Lerncoach** — Nutzen für ihn noch offen, wird gemeinsam geprüft.
  3. (Dritter Bot — Details noch zu klären.)

**Warum es bisher nicht funktioniert:**
- Er nutzt die Bots nicht, weil sie **auf dem Handy nicht rundlaufen** (Langdock mobil unpraktisch).
- Er **liest keine E-Mails**.
- Er ist vom **persönlichen Nutzen von KI noch nicht überzeugt** — für Wissensfragen nutzt er KI aber durchaus.

**Die Idee:**
Ein **Dashboard**, das es ihm leicht macht, „sich führen zu lassen" — d. h. minimale Reibung, maximaler sofort spürbarer Nutzen. Geplante Bausteine:

1. **Fitness-Coach** — Ausbau des bestehenden Whoop-Bots (Recovery, Schlaf, Belastung → konkrete Tagesempfehlungen).
2. **Persönliche Assistenz** — liest seine E-Mails, strukturiert To-dos und hilft ihm vor allem, **in die Umsetzung zu kommen**.
3. **Lerncoach** — optional; ob er gebraucht wird, ist noch zu entscheiden.

**Vorgehen (vereinbart):** Erst planen, dann bauen.

---

## 2. Offene Fragen (an Bianca gestellt am 2026-07-05)

1. Auf welchem Gerät / in welcher Form soll das Dashboard laufen? (Handy war bisher der Knackpunkt.)
2. Welche Datenquellen können wir technisch anbinden — Whoop, E-Mail-Konto (welcher Anbieter?), Kalender, College-Systeme?
3. Wie steht der Sohn selbst dazu — weiß er vom Projekt, macht er mit? Was wäre für IHN der größte sofortige Nutzen?
4. Soll Langdock das Backend bleiben oder bauen wir eigenständig (z. B. Web-App in diesem Repo)?

*Antworten: siehe Abschnitt 3 (folgt).*

---

## 3. Antworten & Entscheidungen

**Antworten von Bianca (2026-07-05):**

| Frage | Antwort |
|---|---|
| Gerät | **Handy** — mobil-first als Web-App/PWA (genau da, wo Langdock versagt hat) |
| Datenquellen | **Alle vier realistisch:** Whoop, Langdock-Bots, sein E-Mail-Konto, sein Kalender |
| Buy-in des Sohns | **Er weiß noch nichts vom Projekt** |
| Plattform | **Langdock bleibt Backend**, das Dashboard wird eine mobile Oberfläche davor |

**Einordnung / Empfehlung (Claude, 2026-07-05):**

- ⚠️ **Wichtigster Punkt:** Er weiß noch nichts. Deshalb Phasenplan so gestaltet, dass
  **Phase 1 ohne Zugriff auf seine privaten Konten** auskommt (Whoop-Daten fließen ja
  bereits in den bestehenden Bot). **E-Mail- und Kalender-Zugriff erst mit seinem
  ausdrücklichen Einverständnis** — sonst kippt Empowerment in Überwachung, und genau
  das würde seine KI-Skepsis zementieren. Strategie: ihm einen fertigen, sofort
  nützlichen Prototyp zeigen und **ihn entscheiden lassen**, welche Module er freischaltet.
- **Überzeugungslogik:** Er nutzt KI für Wissen, aber nicht persönlich → der erste
  Eindruck muss in <10 Sekunden Nutzen liefern, ohne dass er etwas tippen muss.
  Ein Morgen-Briefing aus seinen Whoop-Daten („Recovery 34 % — heute lockeres Training,
  früh ins Bett") ist dafür ideal: seine Daten, sein Sport, null Aufwand.

**Nachtrag Bianca (2026-07-05, 2. Runde):**

- ✅ **Einverständnis geklärt:** Lenard hat der Erstellung der Bots zugestimmt — er nutzt sie
  nur aktuell nicht. Das Opt-in-Thema ist damit entschärft; es geht um **Adoption**, nicht
  um Erlaubnis.
- ✅ **Netlify-Account vorhanden** → Hosting der PWA geklärt.
- ➕ **Neues Modul:** **Logbuch / Gedächtnis / Reflexion** — wird über **n8n** gesteuert.

**Befund aus Biancas bestehender Infrastruktur (von Claude erhoben, 2026-07-05):**

- **n8n-Cloud-Instanz:** `aiva179.app.n8n.cloud` — mit funktionierendem Muster:
  - `ORCH - Agent-Router v1.1`: Webhook → Airtable-Registry → **Langdock-Agent-API**
    (`api.langdock.com/agent/v1/chat/completions`, Header-Auth-Credential vorhanden ✅)
    → Antwort → Logbuch-Eintrag.
  - `ORCH - Abendreflexion v1`: täglich 17:00, 3 Reflexionsfragen → Claude strukturiert
    → Airtable-Logbuch. **Dieses Muster übernehmen wir für Lenards Reflexion.**
  - Credentials vorhanden: Langdock (Header Auth), Gmail, Google Calendar, Slack,
    Anthropic, Airtable, Telegram u. a.
- **Airtable-Basis `app9r4BK5FJTU219P`** („Team"): Registry mit 94 Agenten, Logbuch-,
  Präzedenzfälle- und Skills-Tabellen.
- **Lenards Agenten in der Registry (Team = „Lenard", Cluster „Privat/Familie"):**
  | Agent | Funktion | Langdock-Agent-ID |
  |---|---|---|
  | **Markus** | Sports & Performance (= Whoop-/Fitness-Bot) | ❌ fehlt noch |
  | **Peter** | Lenard's Executive Student Assistant | ❌ fehlt noch |
  | **Helmut** | Lenards Coach / Tutor (2 Einträge — Dublette klären) | ❌ fehlt noch |
  | **Matze** | Mathe Coach | ❌ fehlt noch |
  - Zum Vergleich: Nur **Donna** hat bisher eine Langdock-Agent-ID (Router-Muster funktioniert dort).

**Geplante Architektur (Entwurf):**

```
Lenards Handy (PWA, gehostet auf Netlify — dieses Repo)
        │  https
        ▼
n8n-Webhooks (aiva179.app.n8n.cloud)
  ├─ /dashboard-briefing   → Morgen-Briefing (Markus/Whoop + Kalender + Gedächtnis)
  ├─ /dashboard-chat       → Nachricht an den passenden Langdock-Agenten (Registry)
  └─ /dashboard-reflexion  → Abend-Check-in → Claude strukturiert → Logbuch
        │
        ├─ Langdock-Agent-API (Markus, Peter, ggf. Helmut)
        └─ Airtable: Logbuch (Quelle=Lenard) = GEDÄCHTNIS
             └─ fließt zurück ins nächste Briefing („Du hattest dir vorgenommen…")
```

Das Gedächtnis schließt den Kreislauf: Reflexion am Abend → Logbuch → das Morgen-Briefing
erinnert an Vorsätze → Umsetzung wird sichtbar. Genau das „Führen-Lassen".

**Geplanter Phasenplan (Entwurf, noch zu bestätigen):**

- **Phase 1 — „Der erste Wow-Moment" (Whoop-first + Reflexion):**
  Mobile PWA, ein Screen: Tages-Briefing von Markus (Recovery, Schlaf, Belastung →
  2–3 konkrete Empfehlungen für heute). Installierbar auf dem Homescreen, lädt schnell,
  kein Login-Gefrickel. Dazu der **Abend-Check-in** (3 Fragen, 60 Sekunden) → Logbuch →
  Gedächtnis, das ins nächste Briefing zurückfließt.
- **Phase 2 — Persönliche Assistenz (nur mit seinem Opt-in):**
  E-Mails werden gelesen und zu max. 3 Punkten destilliert („Das musst du heute wissen /
  tun"), To-dos mit einem Tap abhakbar, Fokus auf **Umsetzung** (kleinste nächste
  Schritte statt langer Listen), Kalender-Integration für den Tagesplan.
- **Phase 3 — Lerncoach (optional):**
  Erst entscheiden, wenn Phase 1+2 laufen und er sie tatsächlich nutzt.

**Noch zu klären (vor dem Bauen, Phase 1):**

- [x] ~~Langdock-API-Zugriff?~~ → ✅ Ja, Header-Auth-Credential in n8n vorhanden, Muster läuft (Donna/Agent-Router).
- [x] ~~Hosting?~~ → ✅ Netlify-Account vorhanden.
- [ ] **Bianca:** Markus & Peter (ggf. Helmut) in Langdock **mit dem API-Key teilen** und ihre
      **Agent-IDs** (aus der Langdock-URL) in die Airtable-Registry eintragen — wie bei Donna.
- [ ] **Test:** Sieht Markus bei API-Aufrufen die Whoop-Daten? (Hängt davon ab, wie die
      Whoop-Anbindung in Langdock realisiert ist.) → Testen wir, sobald die Agent-ID da ist.
- [ ] Helmut-Dublette in der Registry klären (2 Einträge).
- [ ] Für Phase 2 später: Welches E-Mail-Konto nutzt Lenard (Gmail / College-Mail)?
- [ ] Zeitzone fürs Briefing: Irvine = America/Los_Angeles (9 h hinter Deutschland).

---

## 3b. Design des Abend-Check-ins („Locker Room", Stand 2026-07-05)

**Wunsch Bianca:** Stimmung tracken, wahrgenommenes Fitnesslevel erfassen, Reflexionsfragen
(„Was hast du heute für deine Zukunft getan? Welche Extra-Meile bist du gelaufen? Was
brauchst du?") — und vor allem: ihm das Gefühl geben, **dass er in Führung ist**.
Ausdrücklich: Es darf **nicht nach Coaching anmuten**.

**Design-Prinzipien (Claude):**

1. **Match-Statistik statt Therapiestunde.** Stimmung und gefühlte Fitness sind für einen
   Athleten normale Selbst-Ratings (RPE kennt er aus dem Training). Ein Tap, keine Worte nötig.
2. **Taps vor Text.** 2 Taps Pflichtprogramm (~10 Sek.), Freitext immer optional, alles
   skippable — ohne schlechtes Gewissen, ohne Streak-Vorwürfe.
3. **Eine rotierende Frage pro Abend, nie alle auf einmal.** Kumpel-Ton, keine
   „Warum"-Fragen.
4. **Antworten haben sichtbare Konsequenzen.** Das Briefing am Morgen zitiert SEINE Worte
   („Du hast gesagt, dir fehlt Schlaf → heute 22:30"). Sonst ist Reflexion nur Hausaufgabe.
5. **Er führt strukturell:** Er setzt den Wochenfokus selbst; die Agenten richten sich danach.
   „Was brauchst du?" wird ein echter Request-Kanal — was er anfragt, passiert. Das System
   arbeitet für ihn, nicht er für das System.
6. **Muster entdecken statt belehren:** Wochen-Ansicht Stimmung × gefühlte Fitness ×
   Whoop-Recovery. Die Lücke zwischen „gefühlt" und „gemessen" ist Athleten-Gold — er zieht
   die Schlüsse selbst.

**Check-in-Ablauf (60–90 Sekunden, abends):**

| Schritt | Frage | Format |
|---|---|---|
| 1 | „Wie war der Tag?" | 1 Tap (5 Stufen, Emoji) — Stimmung |
| 2 | „Wie fit fühlst du dich?" | 1 Tap (Skala 1–10) — wahrgenommenes Fitnesslevel |
| 3 | Eine Frage aus dem rotierenden Pool | Freitext, 1 Zeile, skippable |
| 4 | „Brauchst du was?" | Freitext → Request-Kanal (landet sichtbar bei den Richtigen) |

**Sprachregel (Bianca, 2026-07-05):** Lenard wird immer **Lenard** genannt — keine
Spitznamen, keine Verniedlichungen, nirgends (App, Briefings, Agenten-Prompts).
Begründung Bianca: Spitznamen verändern die Identität. Gilt verbindlich für alle Texte.

**Fragen-Pool (Biancas Fragen, entschult formuliert — rotierend):**

- „Was war heute dein bester Move — auf oder neben dem Platz?" *(„für deine Zukunft getan")*
- „Wo bist du heute übers Pflichtprogramm hinaus?" *(„Extra-Meile" — auch ‚nirgends' ist ok)*
- „Was hat heute Energie gezogen?" *(„was fehlt dir")*
- „Was würde morgen leichter machen?" *(„was brauchst du" — lösungsorientiert statt bedürftig)*
- „Worauf freust du dich morgen?"

**✅ ENTSCHIEDEN (Bianca, 2026-07-05) — Privatsphäre des Logbuchs:**
**Alles gehört Lenard.** Bianca braucht und will keinen Zugriff auf seine Daten — auch
keine Eskalationsstufe (wäre technisch möglich, wird bewusst nicht gebaut). Lenards
Logbuch/Stimmung/Reflexionen sehen nur er und seine Agenten. Das wird ihm transparent
so gesagt — es ist sein System.

**✅ NEU (Bianca, 2026-07-05) — Selbstverbesserungs-Schleife mit Helga (HR):**
Die Agenten sollen sich **zusammen mit Helga („Mutter der Nation", HR-Agentin) selbst
verbessern** — analog zu den Feedbackgesprächen, die es im Team-System schon gibt
(Feld „Feedbackgespräche" in der Registry).

Design (Entwurf, privatsphäre-konform):
- Das Dashboard sammelt **Meta-Signale, keine Inhalte**: 👍/👎 auf Briefings, Nutzungs-
  und Skip-Raten, optional ein „War das hilfreich?"-Tap. Lenards Rohantworten (Stimmung,
  Reflexionstexte) bleiben außen vor.
- **Wöchentliches Feedbackgespräch (n8n, automatisch):** Helga bekommt die Meta-Signale
  + die eigene Einschätzung des Agenten (Markus/Peter reflektieren ihre Woche) → Helga
  schlägt konkrete Verbesserungen an der Stellenbeschreibung/dem Prompt vor → Update
  wird versioniert in der Registry dokumentiert (Feld „Feedbackgespräche" + Logbuch).
- Lenard kann jederzeit direkt Feedback geben („Sag Markus, er soll kürzer schreiben")
  — der direkteste Verbesserungskanal, und wieder: **er führt**.

---

## 4. Nächste Schritte

- [x] Grundfragen geklärt (Gerät, Datenquellen, Buy-in, Plattform) — 2026-07-05
- [ ] Phasenplan von Bianca bestätigen lassen
- [ ] Technische Restfragen klären (Langdock-API, Whoop-Anbindung, Hosting)
- [x] **Phase 1, Teil 1 gebaut (2026-07-05): PWA „Matchplan"** im Ordner `dashboard/`
      — läuft im Demo-Modus mit Beispieldaten. Drei Ansichten: **Heute** (Briefing mit
      Recovery/Schlaf/Strain, Wochenfokus, abhakbare To-dos), **Check-in** (4 Schritte:
      Stimmung per Emoji-Tap, gefühlte Fitness 1–10, rotierende Frage, „Brauchst du
      was?" — alles skippable), **Woche** (Tabelle Stimmung × Gefühlt × Recovery).
      Installierbar auf dem Homescreen (Manifest + Service Worker, offlinefähig).
      Deploy: Netlify-Site auf dieses Repo zeigen lassen (`netlify.toml` liegt bereit,
      Publish-Ordner `dashboard/`). Webhook-URLs kommen später in `dashboard/config.js`.
- [x] **Agent-IDs eingetragen (Bianca, 2026-07-05):** Markus `1f5336d8-7ccd-4a78-968f-80d1427ce588`,
      Peter `513b14d5-09af-400f-83a2-c034da98f76c` — beide mit API-Key geteilt. ✅
- [x] **Phase 1, Teil 2 gebaut: n8n-Workflow „ORCH - Matchplan - v1"** (Code validiert,
      liegt in `n8n/matchplan-workflow.js`, Import-Datei `n8n/matchplan-workflow.json`):
      - `GET /webhook/matchplan-briefing` → holt die letzten 7 Check-ins aus der Data Table
        `lenard_logbuch` (Gedächtnis) → fragt Markus via Langdock-API → liefert Briefing-JSON.
      - `POST /webhook/matchplan-checkin` → speichert den Abend-Check-in in `lenard_logbuch`
        (privat); ist eine „Brauchst du was?"-Anfrage dabei, geht NUR diese zusätzlich ins
        Airtable-Haupt-Logbuch (Quelle „Lenard (Matchplan)").
      - App (`dashboard/config.js`) zeigt bereits auf diese URLs, fällt automatisch auf
        Demo-Daten zurück, solange der Workflow nicht aktiv ist.
- [ ] ⚠️ **BLOCKIERT — Freigabe nötig:** Das Anlegen von Data Table + Workflow in n8n
      erfordert Biancas Zustimmung, die in dieser Session technisch nicht durchkam.
      Zwei Wege:
      1. **Bianca meldet sich im Chat** → Claude versucht die Anlage erneut (Freigabe-Dialog).
      2. **Manuell (5 Min):** In n8n (a) Data Tables → neue Tabelle `lenard_logbuch` mit
         Spalten `datum` (Text), `stimmung` (Zahl), `gefuehlt` (Zahl), `frage` (Text),
         `antwort` (Text), `anfrage` (Text); (b) Workflows → „Import from File" →
         `n8n/matchplan-workflow.json` → prüfen, ob die Credentials (Header Auth, Airtable)
         zugeordnet sind → aktivieren.
- [ ] Test nach Aktivierung: Liefert Markus über die API echte Whoop-Werte? (Claude ruft
      den Briefing-Webhook auf und prüft die Antwort.)
- [ ] Prototyp Lenard zeigen → er entscheidet, welche Module dazukommen (E-Mail/Kalender)
- [ ] Phase 2 bauen (persönliche Assistenz), danach über Lerncoach entscheiden
- [ ] Selbstverbesserungs-Schleife mit Helga (wöchentliches Feedbackgespräch, n8n)
