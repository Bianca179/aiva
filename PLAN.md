# AIVA – Projektplan & Anforderungsliste

Stand: 06.07.2026 · Prototyp fertig (Demo-Modus), vor Live-Gang.
Teilzahlungen/Skonto: bewusst außer Scope (kommt laut Mandat praktisch nicht vor).

---

## 1. Was wir konkret brauchen (Anforderungsliste)

### A. Von der Mandantin (Zugänge & Unterlagen)

| # | Was | Wofür | Hinweise |
|---|-----|-------|----------|
| A1 | **Lexware Office API-Key** | Rechnungen lesen, Belege hochladen | Einstellungen → Erweiterungen → Public API. Vorher prüfen, ob die API im gebuchten Tarif freigeschaltet ist. |
| A2 | **Dediziertes Beleg-Postfach** (z. B. `belege@firma.de`) mit IMAP-Zugang | Beleg-Import + Avis-Empfang | App-Passwort erstellen (kein Hauptpasswort). Bewusst NICHT ihr persönliches Postfach (DSGVO, Übersicht). |
| A3 | **Weiterleitungsregel** persönliches Postfach → Beleg-Postfach für Rechnungs-Mails | Belege laufen zentral auf | Alternativ: Lieferanten nach und nach direkt auf die neue Adresse umstellen. |
| A4 | **Bank-CSV-Beispielexport** (1 Monat, darf geschwärzt sein) | CSV-Parser aufs echte Format testen | Welche Bank? Export aus dem Online-Banking als CSV. |
| A5 | **2–3 Zahlungsavise des Avis-Kunden** (PDF/E-Mail, anonymisiert ok) + zugehörige Kontoumsatz-Zeilen | Avis-Parser gegen das echte Format bauen | Wichtig: Kommt das Avis per E-Mail? An welche Adresse? Immer gleiches Layout? |
| A6 | **Liste der regelmäßigen Abbuchungen ohne Beleg-Pflicht** (Gehälter, Finanzamt, Kredit, Privatentnahmen, Versicherungen …) | Ignorier-Liste im Matcher schärfen | Sonst zeigt „Fehlende Belege" falsche Treffer. |
| A7 | **Lexware Scan App** auf ihrem Handy installiert + mit ihrem Lexware-Konto verbunden | Der „easy"-Weg zum Beleg-Nachreichen | 10 Minuten gemeinsam einrichten, einmal vormachen. |

### B. Entscheidungen (von dir, Bianca)

| # | Entscheidung | Optionen | Empfehlung |
|---|--------------|----------|------------|
| B1 | **Bank-Anbindung Phase 2** | (a) CSV-Upload manuell (wöchentlich, 2 Min.) · (b) FinTS-Automatik · (c) Open-Banking-Anbieter (finAPI/GoCardless, Kosten+Vertrag) | **(a) starten.** FinTS scheitert oft an TAN-Pflicht beim unbeaufsichtigten Abruf; (b)/(c) erst, wenn der wöchentliche Ablauf sitzt. |
| B2 | **Chatbot in Phase 1 oder später?** | sofort / nach Live-Gang | **Nach Live-Gang.** Dashboard + Belegfluss bringen den Hauptnutzen; Chatbot braucht vorher die DSGVO-Klärung (B4). |
| B3 | **Hosting & Betrieb** | kleiner VPS (z. B. Hetzner ~5 €/Monat) mit HTTPS + Login; wer administriert – du oder ein Dienstleister? | VPS mit Caddy/Traefik (automatisches HTTPS) + Basic-Auth reicht für 1 Nutzerin. |
| B4 | **DSGVO/AVV** | Anthropic Commercial Terms + AVV prüfen; Mandantin schriftlich informieren; keine unnötigen personenbezogenen Daten in Prompts | Vor Chatbot-Freischaltung erledigen. Beleg-Import & Dashboard sind davon unabhängig. |
| B5 | **Rumänische Texte** | aktuelle Übersetzungen von Muttersprachlerin gegenlesen lassen (idealerweise die Mandantin selbst beim Demo-Termin) | Beim Demo-Termin abfragen, direkt korrigieren. |
| B6 | **Avis-Pflege bis Parser fertig** | `data/avis.json` manuell pflegen (du) vs. auf Phase 3 warten | Manuell starten – das sind pro Monat wenige Einträge und validiert nebenbei das Matching. |

### C. Technisch (baue ich)

- Deployment-Setup: Dockerfile + Compose (App, Mail-Importer), HTTPS, Login.
- CSV-Parser-Anpassung auf das echte Bankformat (A4).
- Avis-Parser (A5): PDF/Mail → `Avisnr → [Rechnungsnummern]` automatisch.
- Ignorier-Liste konfigurierbar machen (A6) statt hart codiert.
- Backup der `data/`-Ablage (Transaktionen, Avis-Zuordnungen).

---

## 2. Bauplan in Phasen

> Aufwände sind Netto-Bauzeit; jede Phase endet mit einem prüfbaren Ergebnis.
> Reihenfolge so gewählt, dass jede Phase allein schon Nutzen stiftet.

### Phase 0 – Quick-Wins ohne Code (½ Tag, sofort möglich)
- Lexware „Belege per E-Mail": freigeschaltete Absender prüfen, Weiterleitung
  als echte Weiterleitung (nicht Redirect) testen → evtl. ist das Mail-Problem
  damit schon weg.
- Scan-App bei der Mandantin einrichten (A7).
- Demo-Modus des Dashboards zeigen, Feedback zu Kacheln + rumänischen Texten (B5).
- **Fertig, wenn:** Mandantin kann einen Testbeleg per Scan-App und per E-Mail
  nach Lexware bringen; Feedback dokumentiert.

### Phase 1 – Live-Gang Dashboard + Beleg-Postfach (1 Tag)
- Braucht: A1, A2, A3, B3.
- API-Key anbinden → echte Rechnungen/Umsätze im Dashboard.
- Deployment auf VPS mit HTTPS + Login.
- Mail-Importer produktiv aufs Beleg-Postfach.
- **Fertig, wenn:** Mandantin sieht ihre echten offenen Rechnungen online;
  eine an `belege@` geschickte Rechnung erscheint automatisch in Lexware.

### Phase 2 – Bank-Abgleich produktiv (1 Tag)
- Braucht: A4, A6, B1, Phase 1.
- CSV-Parser aufs echte Bankformat, Ignorier-Liste konfigurieren.
- Wöchentlicher Ablauf mit dir festlegen: CSV ziehen → hochladen →
  Auszifferungsliste in Lexware abhaken → Fehlende-Belege-Liste an Mandantin.
- Avis-Zuordnung zunächst manuell (`data/avis.json`, B6).
- **Fertig, wenn:** ein echter Monat abgeglichen ist: Avis-Sammelzahlung korrekt
  aufgelöst, Fehlende-Belege-Liste enthält keine falschen Treffer mehr.

### Phase 3 – Avis-Parser automatisch (1–2 Tage)
- Braucht: A5, Phase 2.
- Avis-PDF/E-Mail wird aus dem Beleg-Postfach gelesen und `avis.json`
  automatisch gepflegt; unklare Avise landen in einer Prüf-Liste.
- **Fertig, wenn:** zwei aufeinanderfolgende echte Avise ohne manuellen
  Eingriff korrekt zugeordnet wurden.

### Phase 4 – Chatbot + Komfort (1–2 Tage)
- Braucht: B2, B4, Anthropic-Key.
- Chatbot live (rumänisch, mit Zugriff auf Zahlen, Bank-Abgleich, Postfach).
- Monatsreport auf Rumänisch per E-Mail (Umsatz, offene Posten, fehlende Belege).
- **Fertig, wenn:** Mandantin stellt drei typische Fragen und bekommt korrekte,
  verständliche Antworten; Report kommt automatisch.

### Später (bewusst nicht jetzt)
- FinTS/Open Banking statt CSV (B1b/c).
- Teilzahlungen/Skonto im Matcher (aktuell nicht nötig).
- Mahnwesen-Unterstützung (Mahnstufen aus Lexware ziehen).

---

## 3. Risiken & offene Punkte

| Risiko | Auswirkung | Absicherung |
|---|---|---|
| Public API nicht im Lexware-Tarif | Phase 1 blockiert | A1 als allererstes prüfen (5 Minuten) |
| Bank-CSV-Format exotisch | Parser-Anpassung nötig | A4 vor Phase 2 einholen |
| Avis-Layout uneinheitlich | Parser unsicher | A5 mit mehreren Beispielen; Prüf-Liste als Fallback |
| Falsche Treffer in „Fehlende Belege" | Mandantin verliert Vertrauen | A6 + erste Wochen gemeinsam durchsehen |
| DSGVO Chatbot | Verzögert nur Phase 4 | B4 parallel klären, Phasen 1–3 unabhängig |
