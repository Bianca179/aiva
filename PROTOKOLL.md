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

**Geplanter Phasenplan (Entwurf, noch zu bestätigen):**

- **Phase 1 — „Der erste Wow-Moment" (Whoop-first):**
  Mobile PWA, ein Screen: Tages-Briefing vom Whoop-/Fitness-Coach-Bot (Recovery, Schlaf,
  Belastung → 2–3 konkrete Empfehlungen für heute). Installierbar auf dem Homescreen,
  lädt schnell, kein Login-Gefrickel.
- **Phase 2 — Persönliche Assistenz (nur mit seinem Opt-in):**
  E-Mails werden gelesen und zu max. 3 Punkten destilliert („Das musst du heute wissen /
  tun"), To-dos mit einem Tap abhakbar, Fokus auf **Umsetzung** (kleinste nächste
  Schritte statt langer Listen), Kalender-Integration für den Tagesplan.
- **Phase 3 — Lerncoach (optional):**
  Erst entscheiden, wenn Phase 1+2 laufen und er sie tatsächlich nutzt.

**Noch zu klären (vor dem Bauen, Phase 1):**

- [ ] Hat euer Langdock-Plan API-Zugriff (API-Key)? → Voraussetzung, damit das Dashboard
      die Bots ansprechen kann. Falls nein: Whoop-API direkt anbinden als Alternative.
- [ ] Wie kommt der Whoop-Bot aktuell an die Whoop-Daten (Integration in Langdock, oder
      manuell)?
- [ ] Für Phase 2 später: Welcher E-Mail-Anbieter (Gmail / College-Outlook)?
- [ ] Wo soll die PWA laufen (Hosting)? Vorschlag: einfacher Deploy z. B. via Vercel/Netlify.

---

## 4. Nächste Schritte

- [x] Grundfragen geklärt (Gerät, Datenquellen, Buy-in, Plattform) — 2026-07-05
- [ ] Phasenplan von Bianca bestätigen lassen
- [ ] Technische Restfragen klären (Langdock-API, Whoop-Anbindung, Hosting)
- [ ] Phase 1 bauen: Mobile PWA mit Whoop-Tages-Briefing
- [ ] Prototyp dem Sohn zeigen → sein Opt-in für Phase 2 (E-Mail/Kalender) einholen
- [ ] Phase 2 bauen (persönliche Assistenz), danach über Lerncoach entscheiden
