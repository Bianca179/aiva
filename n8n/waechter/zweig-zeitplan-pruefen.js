// PD - Verbrauch zählen · Wächter-Zweig „Wächter: Zeitplan prüfen" (P4.1)
// Hängt hinter „Läufe lesen" (Liste ohne Inhalt) und meldet geplante Läufe, die nicht stattfanden.
// Geprüft wird je Stunde das Fenster (jetzt-90 min, jetzt-30 min] → jeder Termin genau einmal.
// Zeiten Europe/Berlin. Zeitpläne Stand 25.09. 21:30 — bei Änderung eines Zeitplans hier nachziehen.

const ZEITPLAN = [
  { id: 'TmwShtK9D4kt5KEa', name: 'CENTCOM – Inbox-Pass v2.1b', cron: ['0 0 8 * * 1-5', '0 0 12 * * 1-5', '0 0 15 * * 1-5', '0 0 9 * * 6'] },
  { id: '8LJ0D5YUa1rrAd9n', name: 'CENTCOM - Postausgangs-Pass v2', cron: ['0 50 6,12 * * 1-5'] },
  { id: '8LzkOa0iFOKfThsR', name: 'PD - Termin vorbereiten', cron: ['0 0 17 * * 1-5', '0 10 7 * * 1-5'] },
  { id: 'GAUWB6soXqqezKrJ', name: 'PD - Aufgaben-Verteiler v3 (Router)', cron: ['0 45 8,14 * * 1-5'] },
  { id: 'Hw3kgSmYG8zSm8QM', name: 'PD - Voicespiegel', cron: ['0 0 19 * * 5'] }, // seit 25.09. 20:57 nur freitags (Memory-Pilot)
  { id: 'Rii70C8nlIsbSgHC', name: 'PD - LinkedIn-Pass', cron: ['0 20 8,12,16 * * 1-5'] },
  { id: 'o8dp531ELw35wRQN', name: 'PD - Klick-Abgleich', cron: ['0 15 7,13 * * 1-5'] },
  { id: 'gIrwBH3fA49Po9It', name: 'PD - Bravo 6 Wochenlauf', cron: ['0 0 7 * * 2'] },
];

function berlin(d) {
  const p = Object.fromEntries(new Intl.DateTimeFormat('en-GB', { timeZone: 'Europe/Berlin', hour12: false, weekday: 'short',
    year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' }).formatToParts(d).map(x => [x.type, x.value]));
  const wt = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 }[p.weekday];
  return { min: +p.minute, std: +p.hour % 24, tag: +p.day, mon: +p.month, wt, text: `${p.day}.${p.month}. ${p.hour}:${p.minute}` };
}
function feld(ausdruck, wert) {
  if (ausdruck === '*') return true;
  return ausdruck.split(',').some(teil => {
    if (teil.includes('-')) { const [a, b] = teil.split('-').map(Number); return wert >= a && wert <= b; }
    return Number(teil) === wert;
  });
}
function passt(cron, b) {
  const [, m, h, dom, mon, dow] = cron.trim().split(/\s+/);
  return feld(m, b.min) && feld(h, b.std) && feld(dom, b.tag) && feld(mon, b.mon) && feld(dow, b.wt);
}

const jetzt = Date.now();
const liste = $input.all().map(i => i.json);
const funde = [];
for (const z of ZEITPLAN) {
  for (let t = jetzt - 89 * 60000; t <= jetzt - 30 * 60000; t += 60000) {
    const minute = Math.floor(t / 60000) * 60000;
    const b = berlin(new Date(minute));
    if (!z.cron.some(c => passt(c, b))) continue;
    const gelaufen = liste.some(e => e.workflowId === z.id && e.startedAt &&
      Date.parse(e.startedAt) >= minute - 2 * 60000 && Date.parse(e.startedAt) <= minute + 30 * 60000);
    if (!gelaufen) funde.push(`• *${z.name}* · Zeitplan · *Nicht gelaufen* – geplant ${b.text} Uhr, kein Lauf gefunden`);
  }
}
if (!funde.length) return [];
return [{ json: { text: `:mag: *Stille-Fehler-Wächter* – ${funde.length} geplante${funde.length === 1 ? 'r Lauf' : ' Läufe'} nicht gestartet\n` + funde.join('\n') } }];
