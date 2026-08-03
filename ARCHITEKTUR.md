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

## 5. WICHTIGE Entscheidung fürs B2B-Modell: Was sieht die Akademie?

Es gibt eine echte Spannung:
- Unser **Grundprinzip:** Der Athlet besitzt seine Daten (Lenards Logbuch ist Lenards).
- Das **B2B-Interesse:** Die Akademie zahlt und will vielleicht Fortschritt/Adhärenz sehen.

Optionen (zu entscheiden):
- **A — Athlet-privat, Akademie sieht nur Aggregat/„nutzt aktiv ja/nein".** Schützt Vertrauen,
  leichter verkaufbar an die Athleten, DSGVO-freundlich. (Meine Empfehlung.)
- **B — Athlet gibt einzelne Dinge frei (Opt-in).** Z. B. „Coach darf meine Wochenstimmung sehen."
- **C — Akademie sieht alles.** Stärkstes B2B-Verkaufsargument, aber untergräbt das Vertrauen
  der Athleten und unser Prinzip. Würde ich vermeiden.

→ **Vorschlag:** Modell A als Standard, B als Opt-in. So bleibt „der Athlet ist in Führung"
auch im Bezahlprodukt wahr — und genau das ist Teil des Markenversprechens.

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

## 7. Offene Punkte / Entscheidungen für Bianca

- [ ] B2B-Datenmodell: A / B / C aus §5 wählen (Empfehlung: A + Opt-in B).
- [ ] Whoop-Developer-Stufe fürs Nutzer-Limit prüfen (Formular), sobald >Handvoll Nutzer.
- [ ] Wer baut das Fundament: gemeinsam mit Claude Code (machbar) oder zusätzlich ein Entwickler.
- [ ] Preislogik grob festlegen (pro Athlet / Akademie-Paket) — kommt aus dem Mouratoglou-Gespräch.
