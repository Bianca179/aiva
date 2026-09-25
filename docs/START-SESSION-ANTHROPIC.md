# Startprompt: Anthropic-Zugang CENTCOM (rhineshore) nachhaltig lösen

Zum Kopieren in eine neue Session (Repo Bianca179/aiva):

---

Wir lösen heute den Anthropic-Zugang im Rhineshore-System (CENTCOM, Philipp Dicke) nachhaltig. Lies zuerst `CLAUDE.md` und `docs/PROTOKOLL-2026-09-25-SEARCH.md` (Punkt 15) im Repo sowie in Google Drive das neueste `CENTCOM-OFFENE-PUNKTE-<Datum>`. Arbeite nach meinen Regeln dort: erst planen, dann roasten, dann bauen. Nichts löschen, Sicherung vor jedem Ersetzen, jeder Umbau, Testlauf und Publish ist eine eigene Frage an mich. Zugangsdaten (Credentials) fasst du nicht an, das mache ich.

**Zugang:** rhineshore.app.n8n.cloud nur per REST-API. Den API-Key gebe ich dir, du legst ihn ausschließlich in `n8n-header.txt` im Scratchpad ab, nie in eine Befehlszeile. Das n8n-MCP zeigt auf meine Werkstatt aiva179, dort nichts ändern.

**Feste Fakten, nicht erneut fragen:**
- „Anthropic account" `nrZkUZIQhvT2REnB` ist **mein eigenes Anthropic-Konto**. Es hat kein Guthaben mehr („credit balance too low", Testlauf 25.09. 12:37). **Ich trage die Kosten für Rhineshore nicht.**
- „Anthropic Rhineshore" `SAq68yfgETKLhMev` ist der Rhineshore-Zugang. Er läuft über den Proxy `https://pd-anthropic-cache.bianca-317.workers.dev`, der bei großen Anfragen hängen bleibt („Request timed out", Cloudflare 524; P1.1). Der Code liegt in Drive als `worker-anthropic-cache.js`.
- Aktive Workflows auf meinem Konto `nrZk…`: Centcom, PD - CENTCOM still (Verteiler), PD - Findus (Rolle), PD - Bravo 6 (Rolle), PD - McGonnagal (Rolle), Fletcher. Dazu 20 inaktive.
- Aktive Workflows auf `SAq68…`: Inbox-Pass, Postausgangs-Pass, Router, Entwurf schreiben, CV-Intake, Dossier, Monk, Monk Dokumente, Delta 3, Bravo 7, Dokumenttyp, Klick-Abgleich, LinkedIn-Pass, Termin vorbereiten, Voicespiegel. Teils nutzen sie HTTP direkt statt LangChain; „PD - Entwurf schreiben" ruft api.anthropic.com zusätzlich ohne Credential auf.

**Ziel:**
1. **Kosten eindeutig bei Philipp:** Alle Rhineshore-Workflows laufen über **ein** Anthropic-Konto, und zwar Philipps. Mein Konto kommt in keinem aktiven Rhineshore-Workflow mehr vor, auch nicht in inaktiven, die jemand aktivieren könnte. Kläre mit mir, welches Anthropic-Konto und welcher Key Philipp gehören und wer dort Guthaben und Auto-Reload verantwortet.
2. **Stabil:** Entscheidungsvorlage „Proxy behalten oder direkt api.anthropic.com". Dazu: messen, ob das Caching überhaupt spart; bei „behalten" die Timeout-Ursache belegen und beheben. Nur nach meinem Go umstellen.
3. **Umstellung:** Vollständige Inventur (alle 114 Workflows: LangChain-Credential, HTTP-Knoten, Modell, maxTokens). Dann ein Umstellplan je Workflow mit Sicherung und Rückweg. Umstellen in kleinen Paketen, nach jedem Paket ein Testlauf mit meinem Go.
4. **Nie wieder still ausfallen:** ein Wächter nach #maschinenraum bei „credit balance", „timed out", „Invalid URL", 401/429/5xx sowie bei Läufen ohne Ergebnis. Das ist P4.1 Stille-Fehler-Wächter. Außerdem eine Guthaben- bzw. Kostenwarnung auf Philipps Konto, falls möglich.
5. **Dokumentation:** Protokoll in Drive als `CENTCOM-OFFENE-PUNKTE-<Datum> (Stand hh:mm)`, zusätzlich `docs/PROTOKOLL-<datum>-anthropic.md` im Repo. `CLAUDE.md` aktualisieren.

**Ergebnis der Sitzung:** Kein aktiver Rhineshore-Workflow nutzt mehr mein Konto. Findus, Bravo 6 und Centcom antworten wieder. Der Bravo-6-Wochenlauf (`gIrwBH3fA49Po9It`, dienstags 07:00) läuft durch. Der Wächter ist aktiv.

Starte mit: Stand lesen, Inventur (nur lesend), dann Fragen an mich und ein Plan. Noch nichts ändern.

---
