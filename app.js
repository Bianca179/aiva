/* Matchplan — Phase 2 (Briefing + Check-in + Chat mit Markus + Fuel) */
(function () {
  'use strict';

  const CFG = window.MATCHPLAN_CONFIG || {};
  const app = document.getElementById('app');

  // ---------- Beispieldaten (Fallback, wenn n8n nicht erreichbar ist) ----------

  const MOCK_BRIEFING = {
    recovery: 61,          // %
    sleepHours: 7.4,
    sleepGoal: 8.5,
    strainYesterday: 14.2,
    focus: 'Aufschlag stabilisieren',
    memory: 'Mehr Schlaf vor Matchtagen',
    fuel: {
      why: 'Mitteltag mit Training am Nachmittag — solide Carbs, viel Protein zur Regeneration.',
      meals: [
        'Frühstück: Porridge mit Banane, Walnüssen und Joghurt',
        'Lunch: Reis-Bowl mit Hähnchen, Avocado und Brokkoli',
        'Dinner: Pasta mit Lachs und Spinat — früh essen, Match morgen',
      ],
    },
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

  const CHAT_STARTERS = [
    'Was koch ich heute Abend?',
    'Mach mir eine Einkaufsliste für die Woche',
    'Was esse ich vor dem Match morgen?',
  ];

  // ---------- Status-Logik (Whoop-Konvention; Farbe nie ohne Icon+Label) ----------

  function recoveryStatus(pct) {
    if (pct >= 67) return { cls: 'good', icon: '✔', label: 'Grün — kann Vollgas' };
    if (pct >= 34) return { cls: 'warning', icon: '◐', label: 'Gelb — dosiert' };
    return { cls: 'critical', icon: '⚠', label: 'Rot — Regeneration' };
  }

  // ---------- Persistenz (localStorage; Check-ins zusätzlich POST an n8n) ----------

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
    const cached = store.get('briefing2-' + todayKey(), null);
    if (cached && (cached.recovery != null || cached.fuel)) return cached;
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
        focus: b.focus || store.get('focus', MOCK_BRIEFING.focus),
        fuel: (b.fuel && Array.isArray(b.fuel.meals) && b.fuel.meals.length) ? b.fuel : null,
        text: b.text.length ? b.text : ['Kein Briefing-Text erhalten.'],
        todos: Array.isArray(b.todos)
          ? b.todos.map((t, i) => (typeof t === 'string' ? { id: 't' + i, text: t } : t))
          : [],
        from: b.from || 'Markus',
        demo: false,
      };
      if (b.focus) store.set('focus', b.focus);
      // Nur cachen, wenn wirklich Daten drin sind — sonst beim nächsten Öffnen neu versuchen
      if (briefing.recovery != null || briefing.fuel) {
        store.set('briefing2-' + todayKey(), briefing);
      }
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

  // ---------- Einkaufsliste ----------

  async function einkaufApi(payload) {
    if (!CFG.einkaufUrl) return null;
    try {
      if (payload) {
        const res = await fetch(CFG.einkaufUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        if (!res.ok) throw new Error('HTTP ' + res.status);
        return true;
      }
      const res = await fetch(CFG.einkaufUrl);
      if (!res.ok) throw new Error('HTTP ' + res.status);
      const data = await res.json();
      return Array.isArray(data.items) ? data.items : [];
    } catch (e) {
      console.warn('Einkaufsliste nicht erreichbar', e);
      return null;
    }
  }

  function renderEinkauf(items) {
    const ul = document.getElementById('einkauf-list');
    if (!ul) return;
    ul.replaceChildren();
    if (!items.length) {
      ul.appendChild(el('<li style="color:var(--ink-muted)">Liste ist leer — unten ergänzen oder Markus im Chat bitten.</li>'));
      return;
    }
    items.forEach(it => {
      const li = el(`
        <li>
          <button class="todo-check" aria-label="${esc(it.artikel)} abhaken"></button>
          <span class="todo-text">${esc(it.artikel)}${it.quelle && it.quelle.indexOf('Markus') === 0 ? ' <small style="color:var(--ink-muted)">· von Markus</small>' : ''}</span>
        </li>`);
      li.querySelector('button').addEventListener('click', async () => {
        li.remove();
        await einkaufApi({ action: 'done', id: it.id });
      });
      ul.appendChild(li);
    });
  }

  async function initEinkauf() {
    const card = document.getElementById('einkauf-card');
    if (!card) return;
    const items = await einkaufApi(null);
    if (items === null) return;
    card.style.display = '';
    renderEinkauf(items);
    const input = document.getElementById('einkauf-input');
    const addBtn = document.getElementById('einkauf-add');
    async function add() {
      const artikel = input.value.trim();
      if (!artikel) return;
      input.value = '';
      await einkaufApi({ action: 'add', artikel: artikel });
      const fresh = await einkaufApi(null);
      if (fresh) renderEinkauf(fresh);
    }
    addBtn.addEventListener('click', add);
    input.addEventListener('keydown', e => { if (e.key === 'Enter') { e.preventDefault(); add(); } });
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

        ${b.fuel ? `
        <section class="card">
          <h2>Fuel heute</h2>
          ${b.fuel.why ? `<p class="fuel-why">${esc(b.fuel.why)}</p>` : ''}
          <ul class="fuel-list">${b.fuel.meals.map(m => `<li>${esc(m)}</li>`).join('')}</ul>
        </section>` : ''}

        ${b.todos.length ? `
        <section class="card">
          <h2>Heute erledigen</h2>
          <ul class="todo-list" id="todos"></ul>
        </section>` : ''}

        <section class="card" id="einkauf-card" style="display:none">
          <h2>Einkaufsliste</h2>
          <ul class="todo-list" id="einkauf-list"></ul>
          <div style="display:flex;gap:8px;margin-top:10px">
            <input class="text-input" id="einkauf-input" placeholder="Artikel hinzufügen …" style="padding:10px 12px">
            <button class="btn primary" id="einkauf-add" style="padding:10px 16px" aria-label="Hinzufügen">+</button>
          </div>
        </section>
      </div>
    `));

    initEinkauf();

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

    const isSunday = new Date().toLocaleDateString('en-US', { weekday: 'short', timeZone: CFG.timezone || undefined }) === 'Sun';
    if (isSunday) {
      steps.push({
        title: 'Sonntag: Was ist dein Fokus für nächste Woche?',
        render(box, next) {
          const input = el('<textarea class="text-input" rows="2" placeholder="z.B. Aufschlag stabilisieren"></textarea>');
          const row = el(`<div class="btn-row">
            <button class="btn ghost">Fokus behalten</button>
            <button class="btn primary">Setzen</button>
          </div>`);
          row.children[0].addEventListener('click', next);
          row.children[1].addEventListener('click', () => {
            answers.focus = input.value.trim();
            if (answers.focus) store.set('focus', answers.focus);
            next();
          });
          box.append(input, row);
        },
      });
    }

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

  // ---------- View: Markus (Chat) ----------

  function viewMarkus() {
    const wrap = el(`
      <div>
        <header class="greeting">
          <h1>Markus 💬</h1>
          <p class="date">Rezepte, Einkaufsliste, Fuel-Fragen — er kennt deine Whoop-Daten.</p>
        </header>
        <div class="chat-log" id="chat-log"></div>
        <div id="chat-starters"></div>
        <div class="chat-input-row">
          <textarea class="text-input" id="chat-input" rows="1" placeholder="Schreib Markus …"></textarea>
          <button class="btn primary" id="chat-send" aria-label="Senden">➤</button>
        </div>
      </div>`);
    app.replaceChildren(wrap);

    const log = wrap.querySelector('#chat-log');
    const startersBox = wrap.querySelector('#chat-starters');
    const input = wrap.querySelector('#chat-input');
    const sendBtn = wrap.querySelector('#chat-send');

    const history = store.get('chat', []);

    function renderLog() {
      log.replaceChildren();
      if (!history.length) {
        log.appendChild(el('<div class="msg bot">Servus! Was brauchst du — Rezept, Einkaufsliste oder kurz durchsprechen, wie du heute isst?</div>'));
      }
      history.forEach(m => {
        log.appendChild(el(`<div class="msg ${m.role === 'user' ? 'user' : 'bot'}">${esc(m.content).replace(/\n/g, '<br>')}</div>`));
      });
      window.scrollTo(0, document.body.scrollHeight);
    }

    function renderStarters() {
      startersBox.replaceChildren();
      if (history.length) return;
      const row = el('<div class="btn-row" style="flex-wrap:wrap;margin-top:10px"></div>');
      CHAT_STARTERS.forEach(s => {
        const btn = el(`<button class="btn ghost" style="border:1px solid var(--border);font-size:0.85rem;padding:9px 14px">${esc(s)}</button>`);
        btn.addEventListener('click', () => { input.value = s; send(); });
        row.appendChild(btn);
      });
      startersBox.appendChild(row);
    }

    async function send() {
      const text = input.value.trim();
      if (!text || sendBtn.disabled) return;
      input.value = '';
      history.push({ role: 'user', content: text });
      store.set('chat', history.slice(-40));
      renderLog();
      renderStarters();

      const typing = el('<div class="msg bot typing">Markus tippt …</div>');
      log.appendChild(typing);
      window.scrollTo(0, document.body.scrollHeight);
      sendBtn.disabled = true;

      try {
        if (!CFG.chatUrl) throw new Error('Kein Chat-Webhook konfiguriert');
        const res = await fetch(CFG.chatUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            messages: history.filter(m => !m.error).slice(-12)
              .map(m => ({ role: m.role, content: m.content })),
          }),
        });
        if (!res.ok) throw new Error('HTTP ' + res.status);
        const data = await res.json();
        if (!data.reply) throw new Error('Leere Antwort');
        history.push({ role: 'assistant', content: data.reply });
      } catch (e) {
        console.warn('Chat-Fehler', e);
        history.push({
          role: 'assistant',
          content: 'Gerade keine Verbindung zu Markus — probier es gleich nochmal.',
          error: true,
        });
      }
      store.set('chat', history.slice(-40));
      sendBtn.disabled = false;
      if (currentView === 'markus') { renderLog(); }
    }

    sendBtn.addEventListener('click', send);
    input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); }
    });

    renderLog();
    renderStarters();
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

  const views = { heute: viewHeute, checkin: viewCheckin, markus: viewMarkus, woche: viewWoche };
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
