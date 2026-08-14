# Architektur: Vom Prototyp zum verkaufbaren Produkt

> Erstellt 2026-07-22. Antwort auf: „Welche Plattform — Render, Netlify, etwas anderes?
> n8n sagst du auch nicht belastbar." Ziel: nachhaltiger, mehrmandantenfähiger Aufbau.

---

## 1. Was das Produkt technisch WIRKLICH braucht (das Anforderungsprofil)

Der schwierigste Teil ist nicht Rechenleistung — den bekommt man überall. Der schwierige Teil:

1. **Nutzerkonten & Login** — viele Kunden statt einem „Lenard".
2. **Datentrennung pro Nutzer** — Lenards Check-ins dürfen nie in fremde Hände. (Genau unser
   Privatsphäre-Prinzip, jetzt technisch erzwungen.)
3. **Whoop-OAuth pro Nutzer** — jeder verbindet sein eigenes Band; Tokens sicher gespeichert,
   automatisch erneuert (pro Kunde, nicht ein globaler Schlüssel).
4. **Abrechnung** — Stripe, plus „wer hat bezahlt / wer nicht" → Zugriff steuern.
5. **LLM-Aufrufe** — die Coach-Prompts direkt gegen Anthropic/OpenAI, mit Messung pro Kunde.
6. **B2B-Ebene** — eine Akademie legt Sitze an, lädt Athleten ein (siehe §5, wichtige Entscheidung).

**Die Erkenntnis:** Punkte 1–3 sind das Herz. Wer die löst, hat das Fundament. Genau die
löst n8n **nicht** — n8n ist ein Automatisierer, kein App-Backend mit Auth + Datenisolation.

---

## 2. Warum nicht einfach „Render" oder „Netlify allein"

- **Netlify (allein):** hostet perfekt das Frontend (statische PWA) und kann kleine
  Serverless-Funktionen. Aber es ist **kein Zuhause für Auth + Datenbank + Nutzerdaten**.
  Man müsste Login, DB, Token-Speicher separat dazubauen.
- **Render (allein):** kann einen echten Backend-Server + Postgres + Cronjobs hosten — gut.
  Aber **Login/Auth und Datentrennung baust du selbst** von Hand. Mehr Arbeit, mehr Fehlerquellen.
- **n8n:** super als Prototyp-Klebstoff (hat uns hierher gebracht). Als Anfrage-Backend für
  ein zahlendes Mehrmandanten-Produkt ungeeignet: keine native Nutzer-Auth, keine
  Datenisolation, keine Abrechnung, und wächst schnell zum „Kuddelmuddel" (hast du selbst gespürt).

---

## 3. Empfohlener Stack (nachhaltig, aber nicht überkonstruiert)

**Frontend (bleibt fast unverändert):** die PWA, weiter auf **Netlify**. Es sind statische
Dateien — kein Grund zu wechseln. Neu: ein Login-Screen davor.

**Backend + Auth + Datenbank: → Supabase.** Das ist der Kern der Empfehlung. Supabase liefert
genau die drei schwierigen Dinge fertig:
- **Auth** (Login, auch „mit Google/Apple", OAuth) — Punkt 1.
- **Postgres mit Row-Level-Security** — jeder Nutzer sieht per Datenbankregel NUR seine Zeilen.
  Datenisolation ist eingebaut, nicht selbstgebaut — Punkt 2.
- **Edge Functions** — hier läuft die Briefing- und Chat-Logik + der Whoop-Abruf + der
  LLM-Aufruf. Ersetzt die n8n-Workflows durch echten, versionierten Code.
- Sicherer Speicher für **Whoop-Tokens pro Nutzer** — Punkt 3.

**LLM: direkt gegen die Anthropic-API (Claude).** Langdock fällt raus. Die Coach-„Persönlichkeiten"
(Markus, Sam, Fitness) sind nur **Prompts** — die ziehen aus Langdock in euren eigenen Code um
(gehören ohnehin dir). Vorteile: beste Marge (kein Zwischenhändler-Aufschlag), volle Kontrolle,
Nutzung pro Kunde messbar.

**Abrechnung: Stripe.** Mit Supabase ein gut ausgetretener Pfad (Abo, Testphase, Zugriff sperren).

**Whoop:** pro Nutzer OAuth (wie heute für Lenard, aber vervielfacht), Tokens in Supabase.
Erneuerung automatisch — genau das Muster, das schon funktioniert.

### Das Zielbild in einem Bild

```
Kunde (Handy)
   │  Login
   ▼
PWA (Netlify)  ── ruft ──►  Supabase Edge Functions
   │                          │  (Briefing / Chat / Whoop-Sync)
   │                          ├─► Whoop-API   (Token pro Kunde)
   │                          ├─► Anthropic-API (Claude, Coach-Prompts)
   │                          └─► Postgres (RLS: jeder nur seine Daten)
   │                                    ▲
Stripe (Abo/Zugriff)  ──────────────────┘
```

**Warum dieser Stack:** Er löst die drei harten Probleme (Auth, Isolation, Pro-Kunde-Tokens)
von Haus aus, hält die Ops klein (kein eigener Server-Betrieb), und ist der Standardweg für
genau diese Art Produkt. Alternativen wie Cloudflare (Workers + D1) oder ein eigener
Node-Server auf Render gehen auch — sind aber mehr Handarbeit für dasselbe Ergebnis.

---

## 4. Was vom Heutigen überlebt (viel!)

- **Die ganze PWA** (Briefing-, Check-in-, Chat-, Wochen-Ansicht) — bleibt, bekommt nur Login
  und zeigt auf neue Endpunkte statt auf n8n-Webhooks.
- **Alle Coach-Prompts** — wandern 1:1 in den Code.
- **Die Whoop-Logik** (v2-Endpunkte, Feld-Auslesung) — direkt übernehmbar.
- **Die gesamte Produktlogik** (Gedächtnis-Kreislauf, Fuel, Tagessperre) — als Code neu, aber
  konzeptionell fertig durchdacht und erprobt.

Es ist also **kein Neuanfang**, sondern ein Umzug des Backends auf ein tragfähiges Fundament.
Der Prototyp war die Blaupause.

---

## 5. B2B-Modell: ENTSCHIEDEN (Bianca, 2026-07-22)

**Die Akademie ist der Vertriebskanal, NICHT der Datenempfänger.** Bianca verschenkt ~10
Lizenzen an Athleten (über den Mouratoglou-Kanal) **gegen Feedback** — ein klassischer
Design-Partner-Pilot. Die Akademie „steht nicht dahinter" und braucht kein Dashboard.

→ Damit fällt die ganze Spannung weg: **Athlet-privat, Punkt.** Kein Akademie-Einblick,
kein Aggregat-View, nichts zu bauen. Unser Grundprinzip „der Athlet besitzt seine Daten"
bleibt zu 100 % erhalten — technisch die einfachste und vertrauenswürdigste Variante.
(Ein optionaler Athlet-gibt-frei-Modus kann später kommen, ist für den Piloten aber unnötig.)

**Folge für den Pilot-Aufbau:** Es braucht nur eine schlanke **Einladungs-/Lizenz-Mechanik**
(Bianca erzeugt 10 Zugangs-Codes/Einladungen, Athlet meldet sich an, verbindet sein Whoop).
Keine komplexe Organisations-/Rollen-Ebene. Das hält das erste Fundament klein.

---

## 5b. Der Whoop-Engpass = warum der Pilot NICHT auf dem Prototyp läuft (Bianca, 2026-07-22)

Klar erkannt von Bianca: Der aktuelle Stack hat **genau EINE Whoop-Verbindung** — eine
OAuth2-Zugangsdaten im n8n-Workflow, gebunden an **Lenards** Konto. (Nicht Markus hält sie,
sondern der Workflow; Markus bekommt die Zahlen serviert. Für das Skalierungsproblem egal.)

**Konsequenz:** Jeder weitere Athlet mit eigenen Live-Daten = eine weitere Whoop-Zugangsdaten
= Workflow duplizieren. 10 Athleten → 10 Kopien. **Nicht machbar/wartbar.**

Bewertete Wege:
- **A — Klonen pro Athlet.** 10× alles. Funktioniert theoretisch, operativ ein Albtraum,
  fehleranfällig. ❌
- **B — Pro-Nutzer-Tokens von Hand in n8n verwalten** (eigener OAuth-Callback + Token-Refresh
  in Code-Nodes, Tokens in einer Tabelle). Technisch möglich, aber man baut damit ein halbes
  Backend IN n8n hinein — fragile Wegwerf-Plumbing. ❌
- **C — Das echte Fundament bauen (Supabase, Whoop-OAuth pro Nutzer).** Jeder Athlet meldet
  sich an, klickt „Connect Whoop", autorisiert SEIN Konto, Token wird pro Nutzer gespeichert.
  Ein Code, N Nutzer. ✅ **Das ist der Weg.**

**Wichtig — der Pilot ist FREI, also trimmt sich das Fundament:** Kein Stripe nötig. Der
Pilot-Bau ist eng gefasst: **Login + Whoop-OAuth pro Nutzer + die Briefing/Chat-Logik
(aus n8n portiert) + 10 Einladungs-Codes.** Ein gut umrissenes erstes Projekt — kein Monster.

**Trennung, die alles auflöst:**
- **DEMO bei Mouratoglou** → läuft auf dem **Prototyp / Lenards Konto**. Zeigt die Magie live.
  Holt die Zusage. Kein Umbau nötig.
- **PILOT (10 Athleten, eigenes Whoop)** → braucht das **Fundament (C)**. Wird nach der Zusage
  gebaut.

→ Der Prototyp **demonstriert**, das Fundament **pilotiert**. Beides nicht vermischen.

**KORREKTUR (Bianca, 2026-07-22) — keine Whoop-App-Freigabe nötig:** Wir verbinden KEINE
fremden Nutzer über eine App. **Jeder Athlet verbindet sein EIGENES Whoop-Konto selbst**
(eigene Developer-App/API-Zugangsdaten, autorisiert mit seinem eigenen Account) — so wie
Lenard es gemacht hat, nur pro Athlet. Damit gibt es keine „Fremdnutzer" und keinen
Produktions-Freigabe-Gate. Meine frühere Freigabe-Warnung war falsch und ist gestrichen.

**Was dadurch NICHT wegfällt:** Jeder Athlet hat trotzdem seinen eigenen Token. Das System
muss pro Athlet den richtigen Token speichern und beim App-Öffnen den passenden wählen.
Der jetzige n8n-Aufbau hat nur EIN festes Zugangsdaten-Feld → kann das nicht ohne Klonen.
Die einzige echte Anforderung ist also ein **schlanker Pro-Athlet-Token-Speicher + Auswahl**
— genau das liefert das kleine Fundament (Supabase). Es geht NICHT um Whoop-Freigabe,
sondern um „welcher Token gehört zu wem".

---

## 6. Wann bauen? (Reihenfolge, nicht Technik)

**Jetzt NICHT umbauen.** Der aktuelle Langdock/n8n-Stack reicht, um bei Mouratoglou zu
demonstrieren und die erste Zusage zu holen. Ein Prototyp, der live echte Whoop-Daten zeigt,
verkauft besser als jede Architektur-Folie.

**Reihenfolge:**
1. **Mit Lenard + Teamkollegen täglich nutzen** — beweisen, dass es klebt. (Aktueller Stack.)
2. **Mouratoglou-Pitch** mit dem lebenden Prototyp. Ziel: ein „Ja, lass uns das mit X Athleten testen."
3. **Erst bei einem echten Signal:** das Supabase-Fundament bauen (Auth, Whoop-OAuth pro Kunde,
   Postgres, Stripe, Anthropic direkt). Realistisch ein fokussiertes Projekt — gut gemeinsam
   Schritt für Schritt machbar, so wie wir Matchplan gebaut haben.
4. Whoop-Developer-Stufe für mehr verbundene Nutzer beantragen (Formular, siehe §Whoop).

**Kurz:** Der Prototyp holt die Zusage. Die Zusage rechtfertigt das Fundament. Nicht umgekehrt.

---

## 6b. Fitness-Coach braucht eine Knowledge Base (Merker für später)

Hinweis Bianca (2026-07-22): Der neue **Fitness-/Stretching-Coach braucht eine Wissensbasis**
(Übungsbibliothek, Dehnprotokolle o. ä.). In **Langdock ist das jetzt kein Problem** — dort
hängt man Dokumente direkt an den Agenten. Für die spätere eigene Architektur muss das
nachgebaut werden:

- **Im Zielstack (Supabase):** Wissensbasis als **RAG** — Dokumente in Chunks, Embeddings in
  **pgvector** (Supabase-Postgres kann das nativ). Bei jeder Coach-Frage die passenden
  Wissens-Schnipsel dazuladen, dann an Claude.
- **Wichtig fürs Konzept:** Markus/Sam brauchen (bisher) keine KB — ihr Wissen steckt im Prompt
  + Whoop-Daten. Der Fitness-Coach ist der **erste Agent mit eigener Wissensbasis** → das RAG-
  Modul ist ein neuer Baustein, den wir beim Fundament-Bau einplanen. Kein Blocker jetzt.

---

## 7. Offene Punkte / Entscheidungen

- [x] **B2B-Datenmodell entschieden (2026-07-22):** Athlet-privat, Akademie = Kanal, kein
      Dashboard. 10 Freilizenzen an Athleten gegen Feedback (Pilot).
- [x] **Fundament wird gemeinsam mit Claude Code gebaut** (Bianca bestätigt).
- [ ] Knowledge Base / RAG für den Fitness-Coach im Fundament-Bau einplanen (§6b).
- [ ] Einladungs-/Lizenz-Mechanik für die 10 Pilot-Plätze (schlank halten).
- [ ] Whoop-Developer-Stufe fürs Nutzer-Limit prüfen (Formular), sobald >Handvoll Nutzer.
- [ ] Preislogik grob festlegen — kommt aus dem Mouratoglou-/Athleten-Feedback.
