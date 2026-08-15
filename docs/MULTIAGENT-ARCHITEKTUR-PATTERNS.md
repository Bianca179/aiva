# Architektur-Patterns für hochwertige Multiagentensysteme

**Stand:** 22.07.2026 · Abgeleitet aus einer vollständigen Analyse von `Linni` (n8n-Workflow `11UxePeldz86cqxp`, 140 Nodes) — ein gekauftes/generisches Vorlagen-Template, NICHT selbst gebaut.
**Zweck:** Wiederverwendbare Bauprinzipien für alle künftigen Agenten (Marketingteam, weitere Kernteam-Agentinnen, Kunden-Whitelabel). Bei jedem neuen Agenten-Workflow gegen diese Liste prüfen.

> Bianca-Auftrag: „Ich möchte meine Multiagentensysteme mit Fallback-Lösungen bauen und qualitativ sehr hochwertig." Dieses Dokument ist die daraus abgeleitete Checkliste.

---

## Die 7 Patterns (die guten Ideen aus Linni — übernehmen)

### 1 · LLM-Fallback (native n8n-Funktion, nicht selbst bauen)
Der AI-Agent-Node hat ein Flag `needsFallback: true`. Damit bekommt der Node **zwei** `ai_languageModel`-Eingänge (Primär + Fallback). Fällt das Primärmodell aus (Rate-Limit, Fehler, Timeout), springt n8n automatisch aufs Fallback-Modell — ohne eigenen Code.
- **Bei Linni:** Primär `gpt-5.1`, Fallback `gpt-4.1-mini` — dreifach eingebaut (Hauptagent + 2 Nebenagenten).
- **Für uns:** Bei Donna & Co. läuft das Modell aktuell in Langdock (dort managed Langdock das evtl. selbst). Bei allen **n8n-nativen** Agent-Nodes (z.B. „Synthetic Persona"-artige Kritiker-Subagenten, falls wir sowas bauen) IMMER `needsFallback` aktivieren. Kein Grund, das nicht zu tun — kostet nur einen zweiten LLM-Node.

### 2 · Persistentes Gedächtnis statt In-Memory-Buffer
Linni hatte einen `memoryBufferWindow` („Simple Memory") **bewusst deaktiviert** und stattdessen `memoryPostgresChat` aktiv — Gedächtnis überlebt Neustarts/Redeploys, ein Buffer im RAM nicht.
- **Für uns:** Exakt das Prinzip, das wir beim Dirigenten mit der Airtable-Tabelle „Gedächtnis" umgesetzt haben — bestätigt sich als Industriestandard-Pattern, nicht als Bianca-Sonderweg. Bei künftigen Agenten: **niemals** reinen In-Memory-Buffer für Produktionsagenten nehmen.

### 3 · Explizite Fallback-Verzweigung bei unbekanntem Input
Der „File Type"-Switch hat 5 definierte Zweige (PDF/Excel/Bild/Audio/…) **plus** einen expliziten `Unsupported File Type`-Zweig, der eine saubere Meldung erzeugt statt zu crashen.
- **Prinzip:** Jeder Switch/Router braucht einen **Default-/Sonst-Zweig**, der nie stumm ins Nichts läuft. Genau das haben wir beim Dirigenten mit der „leere Langdock-Antwort → Rückmeldung statt Stille"-Fix (22.07.) bereits umgesetzt — Muster bestätigt.

### 4 · Retry bei externen API-Calls
Alle Aufrufe an den externen Bilddienst (fal.ai) haben `retryOnFail: true`. Externe APIs sind unzuverlässiger als interne Nodes — verdienen automatische Wiederholung.
- **Prinzip:** Jeder HTTP-Request-Node zu einer fremden API (Lexware, Langdock, Google) bekommt Retry. Aktuell bei uns nicht überall gesetzt (z.B. Lexware-Sync) — **Nachrüsten als offener Punkt.**

### 5 · Kritiker-Agent als Tool (Qualitätssicherung vor Veröffentlichung)
„Synthetic Persona" ist ein **eigener kleiner Agent**, der ausschließlich als Werkzeug für den Hauptagenten existiert: Aufgabe = Social-Media-Post bewerten und Feedback geben, bevor er weiterverwendet wird.
- **Prinzip für „qualitativ hochwertig":** Ein zweiter, unabhängiger Agent, der als reiner Qualitäts-Check fungiert (andere Perspektive, kritischer Blick), ist ein starkes, leicht nachbaubares Muster. **Für Linni v2 (Marketingteam) übernehmen:** LinkedIn-Entwürfe von Max/Linni laufen automatisch durch einen Kritiker-Agent, bevor sie überhaupt Bianca zur Freigabe vorgelegt werden.

### 6 · Kanal-Umschaltung über Disabled-Flag + dokumentierte Anleitung
Slack- und Telegram-Konnektivität liegen beide im selben Workflow, gesteuert per `disabled: true/false` auf den jeweiligen Trigger-/Node-Gruppen, mit Sticky Notes „HOW TO SLACK" / „HOW TO TELEGRAM" als Klartext-Anleitung direkt im Canvas.
- **Prinzip:** Dokumentation GEHÖRT in den Workflow selbst (Sticky Notes), nicht nur in externe Docs — wer den Workflow elf Monate später öffnet, muss ihn ohne Kontext verstehen können. Machen wir bereits (Dirigent, Morgenpost haben Sticky-Docs) — beibehalten.

### 7 · Stop-and-Error als expliziter Circuit Breaker
Zwei `stopAndError`-Nodes brechen den Lauf bei nicht behebbaren Zuständen bewusst ab, statt mit falschen Daten weiterzulaufen.
- **Prinzip:** Lieber ein sauberer, sichtbarer Abbruch (mit Alert) als ein Workflow, der mit Müll-Daten weiterrechnet und am Ende eine falsche Slack-Nachricht postet.

---

## Die 1 kritische Fehlerlehre (die schlechte Idee aus Linni — NIE wiederholen)

### ⚠️ Ein Qualitäts-Tool zu HABEN ersetzt nicht, es als GATE zu VERDRAHTEN

Das ist die wichtigste Erkenntnis, und sie ist subtil: Linni hat den Kritiker-Agenten „Synthetic Persona" (Pattern 5) — ein gutes Werkzeug. Aber die tatsächliche Veröffentlichungskette ist:

```
Schedule 08:34 → Airtable-Suche (Status="Ready") → Post to LinkedIn → Status="Posted"
```

**Kein Freigabe-Schritt. Kein Mensch. Kein Kritiker-Check in dieser Kette.** Der Kritiker-Agent existiert nur als Tool, das der Hauptagent *optional beim Schreiben* zu Rate ziehen könnte — er ist nicht als **Blocker vor der Veröffentlichung** verdrahtet. Aus Airtable-Sicht heißt „Ready" bereits „darf live gehen", ohne dass irgendwer das nochmal bestätigt hat.

**Regel für alle künftigen Agenten mit Außenwirkung (Posts, Versand, Zusagen, Geld):**
> Stufe 2 (BIANCA.md) ist NIEMALS ein Attribut auf einem Datensatz allein — sie MUSS eine eigene Kette im Workflow sein: Entwurf → Status „Wartet auf Freigabe" → Slack-Nachricht an Bianca mit Freigabe-Frage → **erst nach expliziter Bestätigung** ein zweiter, separater Trigger, der tatsächlich postet/versendet.

Das ist exakt das Muster, das wir bei Donnas Rechnungs-Weiterleitung (Stufe 1, ohne Rückfrage — bewusst) versus Angeboten (Stufe 2, Entwurf + Freigabe) schon unterscheiden. Bei Linni v2 (Marketingteam) muss die Freigabe-Kette **strukturell erzwungen**, nicht nur inhaltlich versprochen sein.

---

## Weitere Fundstellen (Hygiene, nicht Architektur — aber wichtig beim Wiederverwenden von Templates)

- **Fremde IDs im Template:** falsche Airtable-Base (`appa91lXKC8dJn6Xp` „LinkedIn Posts Manni" statt Biancas eigener Base), fremde LinkedIn-Person-ID, Platzhalter-Bilder von Drive-Accounts, die nicht Bianca gehören.
- **Lehre:** Bevor ein gekauftes/generisches Template scharf geschaltet wird — IMMER alle Base-IDs, Account-IDs, Bild-Referenzen und Feldnamen gegen die eigene Umgebung durchsuchen (`grep` durch den Workflow-JSON-Export). Ein Template, das „so aussieht als würde es laufen", kann heimlich gegen den Account des Template-Erstellers arbeiten.
- **Feldname-Bruch:** Filter auf `{Date}`, echtes Schema-Feld heißt `{Datum}` → Filter findet nie etwas (stiller Fehler, kein Crash — am gefährlichsten, weil es so aussieht als würde alles laufen).

---

## Checkliste für jeden neuen Agenten-Workflow (Kurzform)

- [ ] LLM-Aufruf hat Fallback-Modell (n8n `needsFallback` oder Langdock-Äquivalent prüfen)
- [ ] Gedächtnis ist persistent (Airtable/Postgres), nicht In-Memory
- [ ] Jeder Switch/Router hat einen expliziten Default-/Unsupported-Zweig
- [ ] Jeder externe API-Call hat Retry
- [ ] Bei Außenwirkung: Kritiker-Check UND separate Freigabe-Kette (nicht nur ein Status-Feld)
- [ ] Stop-and-Error statt Weiterlaufen mit unsicheren Daten
- [ ] Sticky-Note-Dokumentation direkt im Workflow
- [ ] Keine fremden Base-/Account-/Bild-IDs aus einer Vorlage übernommen (grep-Check)
- [ ] Feldnamen gegen echtes Airtable-Schema verifiziert, nicht angenommen

---

## Referenz
Analysiert: `docs/HANDOVER-orchestrierung-v4.md` Abschnitt 7 (Linni, bestehender Befund) + vollständige Node-/Connection-Analyse 22.07.2026 (140 Nodes, `11UxePeldz86cqxp`, inaktiv).
