/* Matchplan — Phase 1 (Demo-Modus mit Beispieldaten, bis n8n-Webhooks konfiguriert sind) */
(function () {
  'use strict';

  const CFG = window.MATCHPLAN_CONFIG || {};
  const app = document.getElementById('app');

  // ---------- Beispieldaten (werden später vom n8n-Briefing-Webhook geliefert) ----------

  const MOCK_BRIEFING = {
    recovery: 61,          // %
    sleepHours: 7.4,
    sleepGoal: 8.5,
    strainYesterday: 14.2,
    focus: 'Aufschlag stabilisieren',
    memory: 'Mehr Schlaf vor Matchtagen',
    text: [
      'Recovery bei 61 % — solide, aber kein Tag für Limit. Techniktraining voll mitnehmen, beim Konditionsteil einen Gang rausnehmen.',
      'Du hast gestern gesagt: „Mehr Schlaf vor Matchtagen." Morgen ist Match — heute 22:30 Schluss, dann bist du bei ~8,5 h.',
    ],
    todos: [
      { id: 't1', text: 'Videoanalyse Aufschlag (10 Min, Link von Coach)' },
      { id: 't2', text: 'Essay-Gliederung an Professor schicken' },
      { id: 't3', text: 'Saiten nachbestellen' },
    ],
    from: 'Markus & Peter',
  };

  const MOCK_WEEK = [
    { day: 'Mo', mood: '🙂', felt: 7, recovery: 78 },
    { day: 'Di', mood: '😐', felt: 5, recovery: 44 },
    { day: 'Mi', mood: '🙂', felt: 8, recovery: 52 },
    { day: 'Do', mood: '😄', felt: 8, recovery: 81 },
    { day: 'Fr', mood: '😐', felt: 6, recovery: 63 },
    { day: 'Sa', mood: '🙂', felt: 7, recovery: 70 },
    { day: 'So', mood: null, felt: null, recovery: 61 },
  ];

  // Rotierender Fragen-Pool (siehe PROTOKOLL.md §3b)
  const QUESTIONS = [
    'Was war heute dein bester Move — auf oder neben dem Platz?',
    'Wo bist du heute übers Pflichtprogramm hinaus?',
    'Was hat heute Energie gezogen?',
    'Was würde morgen leichter machen?',
    'Worauf freust du dich morgen?',
  ];

  const MOODS = [
    { emoji: '😖', label: 'Mies' },
    { emoji: '😐', label: 'Geht so' },
    { emoji: '🙂', label: 'Okay' },
    { emoji: '😄', label: 'Gut' },
    { emoji: '🔥', label: 'On fire' },
  ];

  // ---------- Status-Logik (Whoop-Konvention; Farbe nie ohne Icon+Label) ----------

  function recoveryStatus(pct) {
    if (pct >= 67) return { cls: 'good', icon: '✔', label: 'Grün — kann Vollgas' };
    if (pct >= 34) return { cls: 'warning', icon: '◐', label: 'Gelb — dosiert' };
    return { cls: 'critical', icon: '⚠', label: 'Rot — Regeneration' };
  }

  // ---------- Persistenz (Demo: localStorage; später zusätzlich POST an n8n) ----------

  const store = {
    get(key, fallback) {
      try { return JSON.parse(localStorage.getItem(key)) ?? fallback; }
      catch { return fallback; }
    },
    set(key, value) { localStorage.setItem(key, JSON.stringify(value)); },
  };

  function todayKey() {
    return new Date().toLocaleDateString('sv-SE', { timeZone: CFG.timezone || undefined });
  }

  // Briefing laden: n8n-Webhook → Tages-Cache → Demo-Fallback
  async function loadBriefing() {
    const cached = store.get('briefing-' + todayKey(), null);
    if (cached) return cached;
    if (!CFG.briefingUrl) return { ...MOCK_BRIEFING, demo: true };
    try {
      const res = await fetch(CFG.briefingUrl);
      if (!res.ok) throw new Error('HTTP ' + res.status);
      const b = await res.json();
      if (b.error || !Array.isArray(b.text)) throw new Error('Ungültige Antwort');
      const briefing = {
        recovery: b.recovery ?? null,
        sleepHours: b.sleepHours ?? null,
        sleepGoal: b.sleepGoal ?? 8.5,
        strainYesterday: b.strainYesterday ?? null,
        focus: store.get('focus', MOCK_BRIEFING.focus),
        text: b.text.length ? b.text : ['Kein Briefing-Text erhalten.'],
        todos: Array.isArray(b.todos)
          ? b.todos.map((t, i) => (typeof t === 'string' ? { id: 't' + i, text: t } : t))
          : [],
        from: b.from || 'Markus',
        demo: false,
      };
      store.set('briefing-' + todayKey(), briefing);
      return briefing;
    } catch (e) {
      console.warn('Briefing nicht erreichbar, Demo-Daten', e);
      return { ...MOCK_BRIEFING, demo: true };
    }
  }

  function fmtNum(v, suffix) {
    if (v == null) return '–';
    return String(v).replace('.', ',') + (suffix || '');
  }

  async function submitCheckin(data) {
    const all = store.get('checkins', {});
    all[todayKey()] = data;
    store.set('checkins', all);
    if (CFG.checkinUrl) {
      try {
        await fetch(CFG.checkinUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ date: todayKey(), ...data }),
        });
      } catch (e) {
        // Offline oder Webhook down: Eintrag bleibt lokal erhalten.
        console.warn('Check-in konnte nicht gesendet werden', e);
      }
    }
  }

  // ---------- Render-Helfer ----------

  function el(html) {
    const t = document.createElement('template');
    t.innerHTML = html.trim();
    return t.content.firstElementChild;
  }

  function esc(s) {
    return String(s).replace(/[&<>"']/g, c => ({
      '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
    }[c]));
  }

  // ---------- View: Heute ----------

  async function viewHeute() {
    app.replaceChildren(el(`
      <div>
        <header class="greeting">
          <h1>Servus ${esc(CFG.name || '')} 👋</h1>
          <p class="date">Briefing wird geladen …</p>
        </header>
      </div>
    `));

    const b = await loadBriefing();
    if (currentView !== 'heute') return;
    const rs = b.recovery != null ? recoveryStatus(b.recovery) : null;
    const dateStr = new Date().toLocaleDateString('de-DE', {
      weekday: 'long', day: 'numeric', month: 'long',
      timeZone: CFG.timezone || undefined,
    });

    app.replaceChildren(el(`
      <div>
        ${b.demo ? '<div class="demo-banner">Demo-Modus — Beispieldaten, Verbindung zu Markus noch nicht aktiv</div>' : ''}
        <header class="greeting">
          <h1>Servus ${esc(CFG.name || '')} 👋</h1>
          <p class="date">${esc(dateStr)} · Irvine</p>
          <span class="focus-chip">🎯 Dein Wochenfokus: <strong>${esc(b.focus)}</strong></span>
        </header>

        <section class="card">
          <h2>Dein Körper heute</h2>
          <div class="stats">
            <div class="stat">
              <div class="value">${b.recovery != null ? b.recovery + '<small> %</small>' : '–'}</div>
              <div class="label">Recovery</div>
              ${rs ? `<div class="status ${rs.cls}"><span class="dot"></span>${rs.icon} ${esc(rs.label)}</div>` : ''}
            </div>
            <div class="stat">
              <div class="value">${fmtNum(b.sleepHours)}<small>${b.sleepHours != null ? ' h' : ''}</small></div>
              <div class="label">Schlaf (Ziel ${fmtNum(b.sleepGoal)} h)</div>
            </div>
            <div class="stat">
              <div class="value">${fmtNum(b.strainYesterday)}</div>
              <div class="label">Strain gestern</div>
            </div>
          </div>
        </section>

        <section class="card briefing">
          <h2>Briefing</h2>
          ${b.text.map((p, i) => i === 1
            ? `<p class="quote">${esc(p)}</p>`
            : `<p>${esc(p)}</p>`).join('')}
          <p class="von">— ${esc(b.from)}</p>
        </section>

        ${b.todos.length ? `
        <section class="card">
          <h2>Heute erledigen</h2>
          <ul class="todo-list" id="todos"></ul>
        </section>` : ''}
      </div>
    `));

    const doneMap = store.get('todos-' + todayKey(), {});
    const ul = document.getElementById('todos');
    if (ul) b.todos.forEach(todo => {
      const li = el(`
        <li class="${doneMap[todo.id] ? 'done' : ''}">
          <button class="todo-check ${doneMap[todo.id] ? 'done' : ''}"
                  aria-label="${esc(todo.text)} abhaken">${doneMap[todo.id] ? '✓' : ''}</button>
          <span class="todo-text">${esc(todo.text)}</span>
        </li>`);
      li.querySelector('button').addEventListener('click', () => {
        doneMap[todo.id] = !doneMap[todo.id];
        store.set('todos-' + todayKey(), doneMap);
        li.classList.toggle('done', doneMap[todo.id]);
        const btn = li.querySelector('button');
        btn.classList.toggle('done', doneMap[todo.id]);
        btn.textContent = doneMap[todo.id] ? '✓' : '';
      });
      ul.appendChild(li);
    });
  }

  // ---------- View: Check-in (4 Schritte, alles skippable) ----------

  function viewCheckin() {
    const existing = store.get('checkins', {})[todayKey()];
    if (existing) { renderCheckinDone(existing, true); return; }

    const answers = {};
    // Frage rotiert nach Tag im Jahr, damit sie pro Abend fix ist
    const dayOfYear = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0)) / 864e5);
    const question = QUESTIONS[dayOfYear % QUESTIONS.length];

    const steps = [
      {
        title: 'Wie war der Tag?',
        render(box, next) {
          const row = el('<div class="emoji-row"></div>');
          MOODS.forEach((m, i) => {
            const btn = el(`<button class="emoji-btn" aria-pressed="false"
              aria-label="${esc(m.label)}">${m.emoji}</button>`);
            btn.addEventListener('click', () => {
              answers.mood = i + 1;
              answers.moodEmoji = m.emoji;
              next();
            });
            row.appendChild(btn);
          });
          box.appendChild(row);
        },
      },
      {
        title: 'Wie fit fühlst du dich?',
        render(box, next) {
          const row = el('<div class="scale-row"></div>');
          for (let i = 1; i <= 10; i++) {
            const btn = el(`<button class="scale-btn" aria-pressed="false">${i}</button>`);
            btn.addEventListener('click', () => { answers.felt = i; next(); });
            row.appendChild(btn);
          }
          box.appendChild(row);
        },
      },
      {
        title: question,
        render(box, next) {
          const input = el('<textarea class="text-input" rows="2" placeholder="Eine Zeile reicht …"></textarea>');
          const row = el(`<div class="btn-row">
            <button class="btn ghost">Überspringen</button>
            <button class="btn primary">Weiter</button>
          </div>`);
          row.children[0].addEventListener('click', next);
          row.children[1].addEventListener('click', () => {
            answers.reflection = input.value.trim();
            answers.question = question;
            next();
          });
          box.append(input, row);
        },
      },
      {
        title: 'Brauchst du was?',
        render(box, next) {
          const hint = el('<p style="color:var(--ink-muted);font-size:0.85rem;margin:-10px 0 14px">Landet direkt bei den Richtigen — wird erledigt.</p>');
          const input = el('<textarea class="text-input" rows="2" placeholder="Saiten, Termin, Ruhe … was auch immer"></textarea>');
          const row = el(`<div class="btn-row">
            <button class="btn ghost">Nö, passt</button>
            <button class="btn primary">Abschicken</button>
          </div>`);
          row.children[0].addEventListener('click', next);
          row.children[1].addEventListener('click', () => {
            answers.request = input.value.trim();
            next();
          });
          box.append(hint, input, row);
        },
      },
    ];

    let i = 0;
    function renderStep() {
      if (i >= steps.length) {
        submitCheckin(answers);
        renderCheckinDone(answers, false);
        return;
      }
      const step = steps[i];
      const wrap = el(`
        <div class="checkin-step">
          <p class="checkin-progress">${i + 1} / ${steps.length}</p>
          <h2>${esc(step.title)}</h2>
          <div class="step-box"></div>
        </div>`);
      step.render(wrap.querySelector('.step-box'), () => { i++; renderStep(); });
      app.replaceChildren(wrap);
    }
    renderStep();
  }

  function renderCheckinDone(data, already) {
    app.replaceChildren(el(`
      <div class="done-screen">
        <div class="big">${data.moodEmoji || '🎾'}</div>
        <h2>${already ? 'Check-in für heute ist drin.' : 'Fertig. Keine 60 Sekunden.'}</h2>
        <p>${data.request
          ? 'Deine Anfrage ist raus — du hörst dazu.'
          : 'Morgen früh weiß dein Briefing Bescheid.'}</p>
      </div>
    `));
  }

  // ---------- View: Woche (Tabellen-Ansicht) ----------

  function viewWoche() {
    const rows = MOCK_WEEK.map(d => `
      <tr>
        <td>${esc(d.day)}</td>
        <td>${d.mood ?? '–'}</td>
        <td class="num">${d.felt ?? '–'}</td>
        <td class="num">${d.recovery != null ? d.recovery + ' %' : '–'}</td>
      </tr>`).join('');

    app.replaceChildren(el(`
      <div>
        <div class="demo-banner">Beispieldaten — echte Wochen-Ansicht folgt mit deinen Check-ins</div>
        <header class="greeting"><h1>Deine Woche</h1>
          <p class="date">Gefühl vs. Messung — wo liegen sie auseinander?</p>
        </header>
        <section class="card">
          <h2>Stimmung · Gefühlt fit (1–10) · Whoop-Recovery</h2>
          <table class="week-table">
            <thead><tr><th>Tag</th><th>Stimmung</th><th class="num">Gefühlt</th><th class="num">Recovery</th></tr></thead>
            <tbody>${rows}</tbody>
          </table>
          <p class="week-hint">Mittwoch: gefühlt 8, gemessen 52 % — an solchen Tagen entscheidet
          Disziplin, nicht Gefühl. Genau dafür ist diese Ansicht da.</p>
        </section>
      </div>
    `));
  }

  // ---------- Navigation ----------

  const views = { heute: viewHeute, checkin: viewCheckin, woche: viewWoche };
  let currentView = 'heute';

  document.querySelectorAll('.tab').forEach(tab => {
    tab.addEventListener('click', () => {
      document.querySelectorAll('.tab').forEach(t =>
        t.setAttribute('aria-selected', String(t === tab)));
      currentView = tab.dataset.view;
      views[currentView]();
      window.scrollTo(0, 0);
    });
  });

  viewHeute();
})();
