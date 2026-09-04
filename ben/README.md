# Ben

Eine Web-App für ein einziges Gespräch: Ein KI-Agent namens Ben führt einen
Klienten allein zu Hause durch sieben Themenblöcke zu seiner Beziehung — eine
Frage nach der anderen, ohne ihm Antworten vorzugeben. Am Ende kann er das
Gespräch als PDF sichern und in die Sitzung mitbringen.

Der Server speichert nichts. Was das genau heißt, steht weiter unten unter
**Wo die Daten wirklich liegen**. Diesen Abschnitt bitte lesen, bevor die App
an jemanden weitergegeben wird.

---

## Schnellweg (geht am Handy)

**Auf diesen Knopf tippen:**

[![Deploy to Render](https://render.com/images/deploy-to-render-button.svg)](https://render.com/deploy?repo=https://github.com/Bianca179/aiva)

Render fragt nach GitHub-Anmeldung und dann nach genau einem Wert:
`ANTHROPIC_API_KEY`. Liegt der Schlüssel bei Render schon in einer
**Environment Group**, kannst du die stattdessen nach dem Anlegen unter
**Environment** anhängen, statt ihn erneut einzufügen.

Alles andere — Region Frankfurt, Unterordner, Build-Befehl — steht in
`render.yaml` und wird automatisch übernommen. Nach ein bis zwei Minuten nennt
Render eine Adresse wie `https://ben-xyz.onrender.com`. Die bekommt der
Klient. Mehr braucht er nicht.

Fertig. Der Rest dieser Datei ist Nachschlagewerk.

### Wer noch keinen Schlüssel hat

Auf [console.anthropic.com](https://console.anthropic.com) anmelden →
**API Keys** → **Create Key** → kopieren. Er wird nur einmal angezeigt. Unter
**Billing** etwas Guthaben aufladen; zwanzig Euro reichen für viele
Durchgänge.

### Wer eine Schwelle vor der App möchte

Ohne Zugangscode kommt jeder rein, der die Adresse kennt. Das ist eine
bewusste Möglichkeit — verlass dich dabei aber nicht darauf, dass die Adresse
geheim bleibt: **jeder Render-Hostname landet beim Ausstellen des
TLS-Zertifikats in den öffentlichen Certificate-Transparency-Logs** und ist
darüber innerhalb von Minuten auffindbar. Scanner klappern die ab. Marcs
Antworten liegen in seinem Browser und sind so nicht erreichbar; offen liegt
der Endpunkt, der auf dein Anthropic-Guthaben geht.

Wenn du eine Schwelle willst, ohne dem Klienten etwas diktieren zu müssen:
setze in Render unter **Environment** die Variable `ZUGANGSCODE` und häng den
Code hinten an den Link:

```
https://ben-xyz.onrender.com/#drei-woerter-mit-bindestrichen
```

Er tippt weiterhin nur einen Link an. Die App löst den Code ein, merkt ihn
sich und nimmt ihn aus der Adresszeile, damit er nicht bei jedem Screenshot
mit im Bild ist.

> Der Knopf zieht den Stand aus dem `main`-Branch. Solange die Änderung noch
> in einem Pull Request liegt, nimm stattdessen
> [diesen Link](https://render.com/deploy?repo=https://github.com/Bianca179/aiva/tree/claude/new-session-6zfzbc)
> — oder merge den Pull Request zuerst.

---

## Der ausführliche Weg

Wenn beim Schnellweg etwas hakt oder du lieber jedes Feld selbst setzt.

### Was du brauchst

1. Ein Konto bei **Anthropic** (console.anthropic.com) mit einem API-Schlüssel
   und etwas Guthaben.
2. Ein Konto bei **Render** (render.com). Kostenlos anzulegen.
3. Dieses Repository auf GitHub.

Programmierkenntnisse brauchst du nicht. Rechne mit einer halben Stunde.

---

### Schritt 1: API-Schlüssel holen

1. Auf console.anthropic.com anmelden.
2. Links auf **API Keys**, dann **Create Key**.
3. Den Schlüssel kopieren. Er beginnt mit `sk-ant-` und wird nur einmal
   angezeigt — leg ihn solange in einen Passwortmanager.
4. Unter **Billing** etwas Guthaben aufladen. Zwanzig Euro reichen für viele
   Durchgänge (siehe **Was es kostet**).

### Schritt 2: Zugangscode ausdenken (optional)

Nur, wenn du eine Schwelle möchtest — siehe oben. Nimm etwas, das man am
Telefon durchgeben kann, aber nicht zu kurz, zum Beispiel drei Wörter mit
Bindestrichen. Ohne Code ist die App über ihre Adresse offen erreichbar.

### Schritt 3: Von Hand auf Render veröffentlichen

1. Auf render.com anmelden und GitHub verbinden.
2. **New** → **Web Service** → dieses Repository auswählen.
3. Diese Felder setzen:

   | Feld | Wert |
   |---|---|
   | Name | `ben` (oder was du magst) |
   | Region | **Frankfurt (EU Central)** |
   | Root Directory | `ben` |
   | Runtime | `Node` |
   | Build Command | `npm ci` |
   | Start Command | `npm start` |
   | Instance Type | `Starter` |

   > **Region und Root Directory sind wichtig.** Frankfurt sorgt dafür, dass
   > die App in der EU läuft. Ohne `ben` als Root Directory findet Render die
   > App nicht, weil sie in einem Unterordner liegt.

4. Weiter unten bei **Environment Variables** zwei Einträge anlegen:

   | Key | Value |
   |---|---|
   | `ANTHROPIC_API_KEY` | dein Schlüssel aus Schritt 1 |
   | `ZUGANGSCODE` | dein Code aus Schritt 2, oder ganz weglassen |

5. **Create Web Service**. Der erste Start dauert ein bis zwei Minuten.
6. Render zeigt dir eine Adresse wie `https://ben-xyz.onrender.com`. Die
   bekommt der Klient zusammen mit dem Zugangscode.

Zum **Instance Type**: `Starter` kostet rund sieben Dollar im Monat und die
App ist sofort da. Der kostenlose Plan schläft nach Leerlauf ein und braucht
dann fast eine Minute zum Aufwachen — beim ersten Öffnen sieht das aus, als
wäre die Seite kaputt. Für jemanden, der sich abends überwindet, ist das der
falsche Moment. Wenn die Arbeit abgeschlossen ist, lässt sich der Dienst in
Render löschen oder pausieren.

### Schritt 4: Ausprobieren

Adresse im Browser öffnen, Zugangscode eingeben. Ben sollte sich innerhalb
weniger Sekunden melden. Tut er das nicht, steht der Grund in Render unter
**Logs** — meistens ein falsch kopierter API-Schlüssel oder fehlendes
Guthaben.

---

## Umgebungsvariablen

| Variable | Pflicht | Voreinstellung | Wofür |
|---|---|---|---|
| `ANTHROPIC_API_KEY` | ja | — | Schlüssel aus der Anthropic Console. Bleibt auf dem Server. |
| `ZUGANGSCODE` | nein | — | Schwelle vor der App. Nicht gesetzt heißt: wer die Adresse kennt, kommt rein. Gesetzt darf er im Link stehen (`.../#code`). |
| `ANTHROPIC_MODEL` | nein | `claude-opus-5` | `claude-sonnet-5` ist rund halb so teuer und für dieses Gespräch gut geeignet. |
| `EFFORT` | nein | `low` | Wie ausführlich das Modell nachdenkt: `low` bis `max`. Höher heißt langsamer und teurer. |
| `MAX_TOKENS` | nein | `16000` | Obergrenze für eine einzelne Antwort. |
| `MAX_VERLAUF_ZEICHEN` | nein | `400000` | Ab hier bricht der Server ab, statt still zu kürzen. Siehe **Wenn das Gespräch sehr lang wird**. |
| `AGENT_NAME` | nein | — | Ersetzt „Ben“ im Prompt. Leer lassen heißt: Prompt bleibt, wie er ist. |
| `KLIENT_NAME` | nein | — | Ersetzt „Marc“ (auch „Marcs“). |
| `PARTNERIN_NAME` | nein | — | Ersetzt „Sophie“. |
| `PORT` | nein | `8080` | Setzt Render selbst. Nicht anfassen. |

Ohne `ANTHROPIC_API_KEY` startet der Server nicht — ohne Schlüssel könnte Ben
ohnehin nicht antworten. Läuft er ohne `ZUGANGSCODE`, schreibt er beim Start
eine Zeile ins Log, die daran erinnert, dass die App offen erreichbar ist.

---

## Den Prompt ändern

Der Systemprompt steht in **`ben/prompt.md`**. Er wurde wörtlich aus
`agent-prompt-ben.docx` übernommen, ohne Kürzungen und ohne Ergänzungen.

Die Coachin kann die Datei direkt auf GitHub bearbeiten (Datei öffnen, auf
den Stift klicken, **Commit changes**). Render baut die App danach von selbst
neu, nach ein bis zwei Minuten ist die Änderung live. Am Code muss dafür
nichts angefasst werden.

**Für ein anderes Paar:** Die Namen stehen im Prompttext. Statt die Datei zu
bearbeiten, kannst du in Render die Variablen `KLIENT_NAME` und
`PARTNERIN_NAME` setzen — dann tauscht der Server die Namen beim Start aus
und `prompt.md` bleibt unverändert. Sind die Variablen nicht gesetzt, passiert
nichts.

---

## Wo die Daten wirklich liegen

Das ist der Abschnitt, den die Coachin erklären können muss. Er ist ehrlich
gemeint, auch wo er unbequem ist.

**Im Browser des Klienten.** Der vollständige Gesprächsverlauf liegt im
`localStorage` seines Browsers — im Klartext, auf seinem Gerät. Deshalb kann
er den Tab schließen und Tage später weitermachen. Es gibt keine Kopie
irgendwo sonst. Zwei Folgen daraus:

- Wer sein entsperrtes Handy in der Hand hat, kann mitlesen. Auch ein
  Zugangscode schützt nur gegen Fremde im Netz, nicht gegen Menschen im
  selben Haushalt. Wenn das ein Thema ist: privates Fenster benutzen, PDF
  sichern, danach löschen.
- Löscht er die Browserdaten oder wechselt er das Gerät, ist das Gespräch
  weg. Es lässt sich nicht wiederherstellen. Der **Löschen**-Knopf in der App
  weist vor dem Löschen darauf hin.

**Auf dem Server.** Nichts. Keine Datenbank, keine Datei, keine Sitzung. Der
Server nimmt den Verlauf entgegen, den der Browser mitschickt, reicht ihn an
Anthropic weiter, streamt die Antwort zurück und vergisst alles, sobald die
Antwort durch ist. In die Logs geht nur, dass ein Aufruf fehlgeschlagen ist
und mit welchem Statuscode — nie ein Inhalt. Es gibt keine Analytics und
keinen Fehler-Tracker.

**Bei Anthropic.** Hier ist die Grenze dessen, was sich bauen lässt: Ben
antwortet, weil das Gespräch an Anthropic geht. Bei jeder Nachricht geht der
gesamte bisherige Verlauf mit — anders könnte Ben die übersprungenen Themen
nicht wiederfinden. Was Anthropic damit tut, steht in den Nutzungsbedingungen
für die API und nicht in diesem Code. Der Stand, den die Coachin kennen
sollte: API-Daten werden standardmäßig **nicht** zum Training verwendet,
Ein- und Ausgaben werden aber für eine begrenzte Zeit zur Missbrauchsprüfung
vorgehalten. Wer das ausschließen muss, kann bei Anthropic **Zero Data
Retention** für den Account beantragen — das ist eine Einstellung im Konto,
kein Schalter in dieser App. Prüf den aktuellen Stand vor dem Gespräch unter
`anthropic.com/legal/commercial-terms` und in der Privacy Policy.

**Bei Render.** Die App läuft in Frankfurt, die Daten werden also in der EU
verarbeitet. Render selbst ist ein US-Unternehmen — EU ist hier der
Ausführungsort, nicht die Firmensitz-Jurisdiktion. Render sieht die
Zugriffe seines Routers (Zeitpunkt, Pfad, Statuscode), nicht die Inhalte.

Läuft die App **ohne** `ZUGANGSCODE`, kommt jeder rein, der die Adresse kennt
— und Render-Adressen sind über die Certificate-Transparency-Logs öffentlich
auffindbar. Ein Fremder liest damit nicht Marcs Antworten, die liegen in
seinem Browser. Er kann aber Gespräche auf deine Rechnung führen. Wenn dir am
Ende der Arbeit die Kosten auffallen: Dienst in Render pausieren oder löschen.

**Kurz für ein Gespräch mit dem Klienten:** „Was du schreibst, bleibt auf
deinem Gerät. Es geht nur an das KI-Modell, damit es antworten kann, und wird
sonst nirgends gespeichert. Das PDF erzeugt dein Browser selbst. Wenn du
fertig bist, kannst du alles löschen.“

**Noch offen für die Coachin:** Für den Einsatz mit echten Klientendaten
gehört zu Anthropic und zu Render je ein Auftragsverarbeitungsvertrag. Beide
Anbieter stellen einen bereit. Das ist eine Aufgabe für sie, nicht für den
Code.

---

## Wenn das Gespräch sehr lang wird

Bei jedem Aufruf geht der gesamte Verlauf mit. Das ist kein Versehen, sondern
Bedingung dafür, dass Ben die übersprungenen Blöcke am Ende wiederfindet.

Ein vollständiger Durchgang durch alle sieben Blöcke landet erfahrungsgemäß
bei 20.000 bis 30.000 Tokens. Das Kontextfenster des Modells ist um ein
Vielfaches größer — es ist also nicht die Grenze. Die Kosten wachsen dabei
quadratisch, weil jede Nachricht die gesamte Vorgeschichte erneut mitschickt.
Dagegen läuft **Prompt-Caching**: der Systemprompt und der bereits gesendete
Verlauf werden zwischengespeichert, was den wiederholten Anteil um rund 90 %
verbilligt. Der Cache ist auf eine Stunde gesetzt statt auf die üblichen fünf
Minuten — wer über einer Frage lange nachdenkt, soll dafür nicht bezahlen.
Nach einer längeren Pause ist die erste Antwort trotzdem etwas teurer.

Ab etwa 120.000 Tokens (`MAX_VERLAUF_ZEICHEN`) bricht der Server ab und sagt
es dem Klienten. Er kürzt **nicht** still. Das ist bewusst so: würde die App
den Anfang des Gesprächs abschneiden, verlöre Ben genau die übersprungenen
Fragen, auf die er am Ende zurückkommen soll — und niemand würde es merken.
Praktisch wird dieser Punkt in einem normalen Durchgang nicht erreicht.

## Was es kostet

Grob **ein bis drei Euro für einen vollständigen Durchgang** mit
`claude-opus-5`, dank Caching. Mit `ANTHROPIC_MODEL=claude-sonnet-5` etwa die
Hälfte. Dazu die sieben Dollar im Monat für Render, solange der Dienst läuft.

Verlässliche Zahlen stehen in der Anthropic Console unter **Usage**.

---

## Lokal ausprobieren

Node 20 oder neuer vorausgesetzt:

```bash
cd ben
npm ci
ANTHROPIC_API_KEY=sk-ant-... ZUGANGSCODE=test npm start
```

Dann `http://localhost:8080` öffnen.

## Was drin steckt

```
render.yaml          Beschreibt Render den Dienst (liegt im Wurzelverzeichnis)
ben/
  server.js          Statische Dateien + Durchreiche-Endpunkt zur Anthropic-API
  prompt.md          Der Systemprompt, wörtlich. Von der Coachin editierbar.
  .env.example       Vorlage für die Umgebungsvariablen
  public/
    index.html       Zugangsschwelle und Gesprächsfenster
    style.css        Papier-Optik, mobil zuerst, hell und dunkel
    app.js           Verlauf, localStorage, Streaming, Wiederholen nach Fehlern
    export.js        PDF und Textdatei — beides im Browser
    vendor/          jsPDF, mitgeliefert statt aus einem fremden CDN geladen
```

Eine einzige Laufzeit-Abhängigkeit: das offizielle Anthropic-SDK. Kein
Framework, kein Build-Schritt, keine Datenbank, kein Tracking. Das ist
Absicht — jede weitere Abhängigkeit wäre eine weitere Stelle, an der Daten
abfließen könnten.

## Was die App nicht tut

Keine Nutzerverwaltung, keine Rollen, keinen Admin-Bereich. Keine Auswertung
und keine Analyse der Antworten. Keine Zusammenführung mit den Antworten der
Partnerin. Keine Mails und keine Benachrichtigungen. Die Auswertung macht die
Coachin persönlich.
