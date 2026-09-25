// PD - Stille-Fehler-Wächter · Knoten „Auswählen"
// Nimmt die Laufliste (ohne Inhalt) und wählt die noch nicht geprüften, fertigen Läufe
// der Workflows mit Anthropic-Anbindung aus. Nur diese werden danach mit Inhalt gelesen.
// Erster Lauf: merkt sich nur den Stand (keine Flut alter Meldungen).

const RELEVANT = {
  '3mTqQ3zOAnqoMERh': 'Dossier bauen (Kandidatenprofil)',
  '75lT7ogXUNBDwDwW': 'PD - CENTCOM still (Verteiler)',
  '8LJ0D5YUa1rrAd9n': 'CENTCOM - Postausgangs-Pass v2',
  '8LzkOa0iFOKfThsR': 'PD - Termin vorbereiten',
  'BNAdFC6cJK6IjHSK': 'PD - Dokumenttyp erkennen',
  'GAUWB6soXqqezKrJ': 'PD - Aufgaben-Verteiler v3 (Router)',
  'Hw3kgSmYG8zSm8QM': 'PD - Voicespiegel',
  'JPQsqqp7dOCueLT7': 'PD - Monk (Rolle)',
  'L5OJCDruVuwGf5Mh': 'PD - McGonnagal (Rolle)',
  'OM7PyMRW0YsNUwJ0': 'PD - Komponist',
  'Rii70C8nlIsbSgHC': 'PD - LinkedIn-Pass',
  'SvC6VfroWvcuhAy1': 'PD - Bravo 6 (Rolle)',
  'TWrqGjacJgpfkk1A': 'PD - Monk Dokumente (R94)',
  'TmwShtK9D4kt5KEa': 'CENTCOM – Inbox-Pass v2.1b',
  'VufJGSTnRHFRPUDg': 'Fletcher — Kandidatenvorstellung',
  'atRKji9CDwe3QyzF': 'PD - Entwurf schreiben',
  'gIrwBH3fA49Po9It': 'PD - Bravo 6 Wochenlauf',
  'o8dp531ELw35wRQN': 'PD - Klick-Abgleich',
  'oMD8i8PSkgeENa8H': 'PD - Delta 3 (Rolle)',
  'oTeQ7TTbTxP0Dfxu': 'PD - Findus (Rolle)',
  'sC0Oha2cKFcTCjgw': 'CV-Intake (Person aus CV)',
  'uhJLPwsa8wTFTDAa': 'Centcom',
  'z2P1EB99wznVJfjZ': 'PD - Bravo 7 (Rolle)',
};

const state = $getWorkflowStaticData('global');
const liste = ($('Läufe auflisten').first().json.data) || [];
const fertig = liste.filter(e => e.stoppedAt && !['running', 'waiting', 'new'].includes(e.status));

const erster = !Array.isArray(state.geprueft);
if (erster) state.geprueft = fertig.map(e => String(e.id));
const geprueft = new Set(state.geprueft);

const neu = erster ? [] : fertig.filter(e => RELEVANT[e.workflowId] && !geprueft.has(String(e.id)));

const out = neu.map(e => ({ json: {
  id: String(e.id), workflowId: e.workflowId, workflow: RELEVANT[e.workflowId], status: e.status, startedAt: e.startedAt,
} }));
// Immer mindestens ein Element, damit Auswerten (auch „nicht gelaufen") jede Stunde läuft
return out.length ? out : [{ json: { id: null } }];
