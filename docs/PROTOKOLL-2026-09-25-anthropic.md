# Protokoll 25.09.2026 — Anthropic-Zugang Rhineshore/CENTCOM nachhaltig

> Laufendes Protokoll dieser Session. Neueste Einträge unten. Startprompt: `docs/START-SESSION-ANTHROPIC.md`.

## Feste Fakten (nicht erneut fragen)
- „Anthropic account" `nrZkUZIQhvT2REnB` = Biancas eigenes Konto, ohne Guthaben. Bianca trägt keine Rhineshore-Kosten.
- **Ziel-Credential: „Anthropic Rhineshore" `SAq68yfgETKLhMev` = Philipps Konto.** Guthaben und Auto-Reload verantwortet **Philipp**.
  Der Key in `SAq68…` wurde am 25.09. zwischen 06:20 und 10:20 getauscht (06:20 „credit balance too low", 10:20 wieder ok).
- Sicherung vor jedem Ersetzen: **nur n8n-Versionierung** (Bianca 25.09.); alte `versionId` je Umbau hier notieren.

## Verlauf
1. **Stand gelesen:** `CLAUDE.md`, `docs/PROTOKOLL-2026-09-25-SEARCH.md` (Punkt 15), Drive `CENTCOM-OFFENE-PUNKTE-2026-09-25 (Stand 09:45)`,
   Proxy-Code `worker-anthropic-cache.js` (Drive `1HBCi_g0zHzWYOWh7Cj5B7y1vpWHcCZlD`).
2. **Inventur (nur lesend), 116 Workflows, 55 aktiv:**
   - `nrZk…` aktiv (6): Centcom `uhJLPwsa8wTFTDAa`, CENTCOM still `75lT7ogXUNBDwDwW`, Findus `oTeQ7TTbTxP0Dfxu`,
     Bravo 6 `SvC6VfroWvcuhAy1`, McGonnagal `L5OJCDruVuwGf5Mh`, Fletcher `VufJGSTnRHFRPUDg` (alle LangChain).
   - `nrZk…` inaktiv (21), darunter **`PD - Komponist` `OM7PyMRW0YsNUwJ0`: inaktiv, läuft aber täglich als Sub-Workflow
     von `PD - Puls` `bUb7kRN6JoJenkN9`** (Exec 5661, 25.09. 06:15: credit balance).
   - `SAq68…` über **LangChain = über den Proxy** (9, aktiv): Postausgangs-Pass v2, CV-Intake (nur ALT-Knoten), Dossier,
     Bravo 7, Delta 3, Dokumenttyp, Monk, Monk Dokumente, Voicespiegel.
   - `SAq68…` über **HTTP direkt an api.anthropic.com** (kein Proxy): Inbox-Pass v2.1b, Router, Entwurf schreiben,
     Klick-Abgleich, LinkedIn-Pass, Termin vorbereiten, CV-Intake.
   - Korrektur: „Entwurf schreiben ruft ohne Credential auf" stimmt nicht — Code-Knoten „Prompt bauen" setzt nur die URL,
     Aufruf im HTTP-Knoten „Modell (Anthropic)" mit `SAq68…`.
3. **Stille Fehler:** Centcom, CENTCOM still, Komponist, LinkedIn-Pass stehen trotz „credit balance"/„timed out" auf
   `success`. `PD - Fehleralarm` `SdR76scsRwpxkSU0` sieht nur Status `error` → Wächter muss Laufinhalte prüfen.
4. **Caching-Rechnung (Findus Exec 4847, 22.09., 7 Runden, n8n-Schätzwerte, Sonnet 4.6):** ohne Cache 0,344 $/Lauf,
   mit Proxy 0,163 $ (−53 %). Einzelaufruf (Postausgangs-Pass, Haiku, 6.615 Tok.): mit Proxy +25 % (Cache-Write ohne Read).
   HTTP-Knoten cachen bereits selbst (LinkedIn-Pass 10:20: 5.093 Tok. aus Cache).
5. **Entscheidungen Bianca:** PR #11 gemergt (CLAUDE.md jetzt auf `main`). **Proxy behalten, nur für Agenten, Timeout bis
   Dienstag (Bravo-6-Wochenlauf 29.09. 07:00) lösen.** Inaktive Workflows nicht umstellen; stattdessen entfernt Bianca
   den Key aus `nrZk…` (Ausnahme Komponist → wird umgestellt). ZZ-ARCHIV unberührt.
6. **Beleg Timeout:** Findus Exec 4790 (21.09., Credential `nrZk…`): Knoten „Claude (Findus-Gehirn)" nach 125 s:
   „The origin web server did not return a complete response within the 120-second Proxy Read Timeout window" (Cloudflare).
   Runde 7 in Exec 4847 brauchte 75 s für 2.759 Ausgabe-Tokens; maxTokens der Agenten 16.000–20.000.
   Offen/unbelegt: Voicespiegel „Request timed out" nach 10,6 s (Exec 5665) — braucht Cloudflare-Logs.
