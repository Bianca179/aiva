# AIVA – Asistenta ta pentru firma / Dein Firmen-Cockpit

Prototyp für das Controlling-Mandat **Gebäudereinigung** (Lexware Office seit 01/2026,
~250.000 € Umsatz im 1. Halbjahr): ein Dashboard auf **Rumänisch** (Deutsch umschaltbar),
ein automatischer **Beleg-Import aus dem E-Mail-Postfach** nach Lexware und ein
**Chatbot auf Rumänisch** mit Zugriff auf Zahlen und Postfach.

---

## 1. Kurze Einschätzung

**Ja, das geht – und die Kombination ist sinnvoll.** Drei Bausteine:

| Baustein | Machbarkeit | Weg |
|---|---|---|
| Dashboard (RO) | ✅ gut | Lexware Office Public API (`/voucherlist`, `/profile`) |
| Rechnungen aus Postfach → Lexware | ✅ gut | Eigener IMAP-Import + Upload über `/files` (robuster als Weiterleitung) |
| Chatbot (RO) mit Mail-Zugriff | ✅ gut | Claude API mit Tools auf Lexware-Daten + IMAP-Suche |

Der Einwand „Lexware hat doch ein Dashboard" stimmt – aber es ist auf Deutsch, in
Buchhaltungslogik und beantwortet nicht ihre drei Alltagsfragen: *Wer schuldet mir
Geld? Was fehlt noch? Wie läuft es?* Genau das zeigt AIVA in ihrer Sprache, plus
einen Bot, den sie einfach fragen kann.

## 2. Zuerst: Warum die automatische Weiterleitung Fehler wirft

Der häufigste Grund: Lexware akzeptiert an der Beleg-Upload-Adresse nur
**freigeschaltete Absenderadressen**. Bei einer automatischen Weiterleitung
(Redirect) bleibt oft der **Original-Absender** (z. B. der Lieferant) in der
From-Zeile stehen → Lexware lehnt ab. Weitere typische Ursachen: kein Anhang
(Rechnung nur als Link im Mailtext), falsches Format (nur PDF/JPG/PNG) oder
Größenlimit.

**Quick-Fix ohne Code:** In Lexware unter *Belege → per E-Mail hochladen* prüfen,
welche Absender freigeschaltet sind, und die Weiterleitung so einstellen, dass
sie als **echte Weiterleitung** (neuer Absender = ihr Postfach) verschickt wird –
nicht als Redirect.

**Robuste Lösung (in diesem Repo):** `app/mail_importer.py` holt die Mails selbst
per IMAP ab und lädt Anhänge über die API in die Lexware-Belegablage hoch.
Damit ist der Absender egal, und jeder Import wird protokolliert.

## 3. Architektur

```
E-Mail-Postfach (belege@firma.de)
        │  IMAP-Polling
        ▼
app/mail_importer.py ──► Lexware Office API (POST /v1/files, type=voucher)
                                   │
                                   ▼
app/service.py  ◄── GET /v1/voucherlist (Rechnungen offen/überfällig/bezahlt)
   │
   ├─► FastAPI (app/main.py) ─► Dashboard app/static/index.html (RO/DE)
   └─► Chatbot app/chatbot.py (Claude, System-Prompt auf Rumänisch,
        Tools: Zahlen aus Lexware + IMAP-Postfach-Suche)
```

## 4. Setup

```bash
python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env        # Keys eintragen (siehe unten)

uvicorn app.main:app --reload           # Dashboard: http://localhost:8000
python -m app.mail_importer             # Beleg-Import (eigener Prozess)
```

Ohne Keys startet die App im **Demo-Modus** mit realistischen Beispieldaten –
gut, um es der Mandantin zu zeigen, bevor irgendetwas verbunden wird.

| Variable | Wofür | Woher |
|---|---|---|
| `LEXWARE_API_KEY` | Zahlen + Beleg-Upload | Lexware Office → Einstellungen → Erweiterungen → Public API |
| `ANTHROPIC_API_KEY` | Chatbot | console.anthropic.com |
| `IMAP_*` | Beleg-Postfach | Beim E-Mail-Provider (App-Passwort verwenden) |

## 5. Bank-Abgleich: Avis-Zahlungen & fehlende Belege

Lexware liest die Bank zwar ein, exportiert aber weder die noch zuzuordnenden
Kontoumsätze noch die Zuordnung selbst – und die Public API stellt Bankdaten
gar nicht bereit. AIVA zieht deshalb **dieselben Kontoumsätze parallel**
(CSV-Export aus dem Online-Banking, Button im Dashboard; später FinTS/Open
Banking) und gleicht selbst ab:

1. **Rechnungsnummer** in der Referenz → direkte Zuordnung.
2. **Avisnummer** → Zuordnung über das Zahlungsavis (`data/avis.json`,
   perspektivisch automatisch aus dem Avis-PDF im Postfach geparst).
   Damit sind die Sammelzahlungen des Avis-Kunden exakt auflösbar.
3. **Betragsheuristik** → Eingang entspricht genau einer offenen Rechnung.

Ergebnis im Dashboard:

- **Auszifferungsliste**: „Eingang X deckt RE-…, RE-…" – Abhakliste, mit der
  die Zahlungen in Lexware schnell ausgebucht werden können (die Public API
  erlaubt kein automatisches Buchen von Zahlungen).
- **Rechnungsstatus „bezahlt (Bank)"**: laut Konto bezahlt, in Lexware noch
  offen → die Kachel „Offene Forderungen" zeigt die *wirklich* offenen Beträge.
- **Fehlende Belege**: Abbuchungen ohne passenden Einkaufsbeleg in Lexware
  (Betrag ± 10 Tage), abzüglich Ignorier-Liste (Gehalt, Steuern, Bankentgelte …,
  siehe `IGNORE_KEYWORDS` in `app/matcher.py`). Diese Liste ist genau die
  Arbeitsliste für die Mandantin: **Bon fotografieren mit der Lexware-Scan-App**
  – Lexware ordnet den gescannten Beleg dem offenen Kontoumsatz dann selbst zu.

Weitere Grenzen: Rate-Limit der API 2 Requests/Sekunde (der Client drosselt
automatisch); Teilzahlungen und Skonto behandelt der Matcher noch nicht.

## 6. Datenschutz / DSGVO (wichtig fürs Mandat)

- **Kein Vollzugriff auf ihr persönliches Postfach.** Empfehlung: eigenes
  Postfach `belege@firma.de` anlegen; nur dieses bekommt AIVA. Rechnungen
  landen dort per Weiterleitungsregel oder direkt (Lieferanten anschreiben).
- Chatbot-Anfragen gehen an die Claude API (Anthropic). Für das Mandat:
  AV-Vertrag/Commercial Terms prüfen, keine unnötigen personenbezogenen Daten
  in Prompts, Mandantin informieren.
- API-Keys nur in `.env` (ist in `.gitignore` aufzunehmen), nie im Repo.

## 7. Nächste Schritte

1. Quick-Fix Weiterleitung testen (Abschnitt 2) – kostet nichts.
2. Demo-Modus der Mandantin zeigen, Feedback zu Kacheln/Sprache einholen.
3. Lexware-API-Key anlegen, echtes Postfach verbinden, auf einem kleinen
   Server (z. B. Hetzner) mit HTTPS + Login deployen.
4. Ausbaustufe 2: Bank-Feed für echte „fehlende Belege", monatlicher
   Automatik-Report per WhatsApp/E-Mail auf Rumänisch.
