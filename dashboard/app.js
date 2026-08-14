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
    focus: 'Stabilize the serve',
    memory: 'More sleep before match days',
    fuel: {
      why: 'Mid-load day with afternoon practice — solid carbs, plenty of protein for recovery.',
      meals: [
        'Breakfast: porridge with banana, walnuts and yogurt',
        'Lunch: rice bowl with chicken, avocado and broccoli',
        'Dinner: pasta with salmon and spinach — eat early, match tomorrow',
      ],
    },
    text: [
      'Recovery at 61% — solid, but not a day to redline. Go all in on technique work, ease off a notch during conditioning.',
      'You said yesterday: "More sleep before match days." Match is tomorrow — lights out at 10:30pm gets you ~8.5 h.',
    ],
    todos: [
      { id: 't1', text: 'Serve video analysis (10 min, link from coach)' },
      { id: 't2', text: 'Send essay outline to professor' },
      { id: 't3', text: 'Reorder strings' },
    ],
    from: 'Markus & Peter',
  };

  const MOCK_WEEK = [
    { day: 'Mon', mood: '🙂', felt: 7, recovery: 78 },
    { day: 'Tue', mood: '😐', felt: 5, recovery: 44 },
    { day: 'Wed', mood: '🙂', felt: 8, recovery: 52 },
    { day: 'Thu', mood: '😄', felt: 8, recovery: 81 },
    { day: 'Fri', mood: '😐', felt: 6, recovery: 63 },
    { day: 'Sat', mood: '🙂', felt: 7, recovery: 70 },
    { day: 'Sun', mood: null, felt: null, recovery: 61 },
  ];

  // Rotierender Fragen-Pool (siehe PROTOKOLL.md §3b)
  const QUESTIONS = [
    'What was your best move today — on or off the court?',
    'Where did you go beyond the required program today?',
    'What drained your energy today?',
    'What would make tomorrow easier?',
    'What are you looking forward to tomorrow?',
  ];

  const MOODS = [
    { emoji: '😖', label: 'Rough' },
    { emoji: '😐', label: 'Meh' },
    { emoji: '🙂', label: 'Okay' },
    { emoji: '😄', label: 'Good' },
    { emoji: '🔥', label: 'On fire' },
  ];

  const CHAT_STARTERS = [
    'What should I cook tonight?',
    'Make me a grocery list for the week',
    'What should I eat before the match tomorrow?',
  ];

  const COACH_STARTERS = [
    'Big match coming up — help me get my head right',
    'I keep losing focus mid-match',
    'Quick reset after a rough day',
  ];

  // Alex refuses to write any programme once pain or a complaint is mentioned — that is
  // his central guardrail. So none of his starters may name a body part that hurts
  // ("my back feels tight" would trigger the medical referral on the very first tap).
  // They describe a SITUATION instead.
  const ALEX_STARTERS = [
    'Warm-up before a match',
    '10 minutes — what do I do?',
    "I'm travelling today",
  ];

  const CHAT_AGENTS = {
    markus: {
      name: 'Markus',
      icon: '💬',
      tagline: 'Recipes, grocery list, fuel questions — he knows your Whoop data.',
      greeting: 'Hey! What do you need — a recipe, the grocery list, or a quick word on how to eat today?',
      starters: CHAT_STARTERS,
    },
    coach: {
      name: 'Sam',
      icon: '🧠',
      tagline: 'Sam Menton — your mental game: matches, pressure, focus. Stays between the two of you.',
      greeting: "Hey Lenard, Sam here. What's on your mind — the next match, the last one, or something else entirely?",
      starters: COACH_STARTERS,
    },
    // The key 'alex' has to match the one in the n8n node "Chat vorbereiten" — that is
    // what picks his Langdock agent. The toggle above builds itself from this object,
    // so this entry is all a new coach needs; no button has to be added by hand.
    alex: {
      name: 'Alex',
      icon: '🤸',
      tagline: 'Stretching, mobility, warm-ups and cool-downs — for a day, a week or a month.',
      greeting: "Hey — I'm Alex. What's on today: a match, tennis training, travel or a rest day, and how much time have you got?",
      starters: ALEX_STARTERS,
    },
  };

  // ---------- Status-Logik (Whoop-Konvention; Farbe nie ohne Icon+Label) ----------

  function recoveryStatus(pct) {
    if (pct >= 67) return { cls: 'good', icon: '✔', label: 'Green — full gas' };
    if (pct >= 34) return { cls: 'warning', icon: '◐', label: 'Yellow — pace yourself' };
    return { cls: 'critical', icon: '⚠', label: 'Red — recover' };
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
    const cached = store.get('briefing3-' + todayKey(), null);
    if (cached && cached.recovery != null) return cached;
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
      if (b.eveningQuestion) store.set('eq-' + todayKey(), b.eveningQuestion);
      // Nur cachen, wenn wirklich Daten drin sind — sonst beim nächsten Öffnen neu versuchen
      if (briefing.recovery != null) {
        store.set('briefing3-' + todayKey(), briefing);
      }
      return briefing;
    } catch (e) {
      console.warn('Briefing nicht erreichbar, Demo-Daten', e);
      return { ...MOCK_BRIEFING, demo: true };
    }
  }

  function fmtNum(v, suffix) {
    if (v == null) return '–';
    return String(v) + (suffix || '');
  }

  // Sendet den Check-in; gibt true zurück, wenn der Server ihn als "heute schon erledigt" ablehnt.
  async function submitCheckin(data) {
    const all = store.get('checkins', {});
    all[todayKey()] = data;
    store.set('checkins', all);
    if (CFG.checkinUrl) {
      try {
        const res = await fetch(CFG.checkinUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ date: todayKey(), ...data }),
        });
        if (res.ok) {
          const out = await res.json().catch(() => ({}));
          if (out && out.already) return true;
        }
      } catch (e) {
        // Offline oder Webhook down: Eintrag bleibt lokal erhalten.
        console.warn('Check-in konnte nicht gesendet werden', e);
      }
    }
    return false;
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
      ul.appendChild(el('<li style="color:var(--ink-muted)">List is empty — add something below or ask Markus in the chat.</li>'));
      return;
    }
    items.forEach(it => {
      const li = el(`
        <li>
          <button class="todo-check" aria-label="Mark ${esc(it.artikel)} done"></button>
          <span class="todo-text">${esc(it.artikel)}${it.quelle && it.quelle.indexOf('Markus') === 0 ? ' <small style="color:var(--ink-muted)">· from Markus</small>' : ''}</span>
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
          <h1>Hey ${esc(CFG.name || '')} 👋</h1>
          <p class="date">Loading your briefing …</p>
        </header>
      </div>
    `));

    const b = await loadBriefing();
    if (currentView !== 'heute') return;
    const rs = b.recovery != null ? recoveryStatus(b.recovery) : null;
    const dateStr = new Date().toLocaleDateString('en-US', {
      weekday: 'long', day: 'numeric', month: 'long',
      timeZone: CFG.timezone || undefined,
    });

    app.replaceChildren(el(`
      <div>
        ${b.demo ? '<div class="demo-banner">Demo mode — sample data, connection to Markus not active yet</div>' : ''}
        <header class="greeting">
          <h1>Hey ${esc(CFG.name || '')} 👋</h1>
          <p class="date">${esc(dateStr)} · Irvine</p>
          <span class="focus-chip">🎯 Weekly focus: <strong>${esc(b.focus)}</strong></span>
        </header>

        <section class="card">
          <h2>Your body today</h2>
          <div class="stats">
            <div class="stat">
              <div class="value">${b.recovery != null ? b.recovery + '<small> %</small>' : '–'}</div>
              <div class="label">Recovery</div>
              ${rs ? `<div class="status ${rs.cls}"><span class="dot"></span>${rs.icon} ${esc(rs.label)}</div>` : ''}
            </div>
            <div class="stat">
              <div class="value">${fmtNum(b.sleepHours)}<small>${b.sleepHours != null ? ' h' : ''}</small></div>
              <div class="label">Sleep (goal ${fmtNum(b.sleepGoal)} h)</div>
            </div>
            <div class="stat">
              <div class="value">${fmtNum(b.strainYesterday)}</div>
              <div class="label">Strain yesterday</div>
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
          <h2>Today's fuel</h2>
          ${b.fuel.why ? `<p class="fuel-why">${esc(b.fuel.why)}</p>` : ''}
          <ul class="fuel-list">${b.fuel.meals.map(m => `<li>${esc(m)}</li>`).join('')}</ul>
        </section>` : ''}

        ${b.todos.length ? `
        <section class="card">
          <h2>To do today</h2>
          <ul class="todo-list" id="todos"></ul>
        </section>` : ''}

        <section class="card" id="einkauf-card" style="display:none">
          <h2>Grocery list</h2>
          <ul class="todo-list" id="einkauf-list"></ul>
          <div style="display:flex;gap:8px;margin-top:10px">
            <input class="text-input" id="einkauf-input" placeholder="Add item …" style="padding:10px 12px">
            <button class="btn primary" id="einkauf-add" style="padding:10px 16px" aria-label="Add">+</button>
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
                  aria-label="Mark ${esc(todo.text)} done">${doneMap[todo.id] ? '✓' : ''}</button>
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
    const question = store.get('eq-' + todayKey(), null) || QUESTIONS[dayOfYear % QUESTIONS.length];

    const steps = [
      {
        title: 'How was your day?',
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
        title: 'How fit do you feel?',
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
          const input = el('<textarea class="text-input" rows="2" placeholder="One line is enough …"></textarea>');
          const row = el(`<div class="btn-row">
            <button class="btn ghost">Skip</button>
            <button class="btn primary">Next</button>
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
        title: 'Need anything?',
        render(box, next) {
          const hint = el('<p style="color:var(--ink-muted);font-size:0.85rem;margin:-10px 0 14px">Goes straight to the right people — it gets done.</p>');
          const input = el('<textarea class="text-input" rows="2" placeholder="Strings, an appointment, some quiet … whatever it is"></textarea>');
          const row = el(`<div class="btn-row">
            <button class="btn ghost">Nah, all good</button>
            <button class="btn primary">Send</button>
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
        title: "Sunday: what's your focus for next week?",
        render(box, next) {
          const input = el('<textarea class="text-input" rows="2" placeholder="e.g. stabilize the serve"></textarea>');
          const row = el(`<div class="btn-row">
            <button class="btn ghost">Keep current focus</button>
            <button class="btn primary">Set it</button>
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
        renderCheckinDone(answers, false);
        submitCheckin(answers).then(already => {
          if (already) renderCheckinDone(answers, true);
        });
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
        <h2>${already ? "Today's check-in is already in." : 'Done. Under 60 seconds.'}</h2>
        <p>${data.request
          ? "Your request is out — you'll hear back."
          : 'Your briefing will know by tomorrow morning.'}</p>
      </div>
    `));
  }

  // ---------- View: Chat (Markus & Coach) ----------

  function viewMarkus() {
    const agentKey = CHAT_AGENTS[store.get('chatAgent', 'markus')] ? store.get('chatAgent', 'markus') : 'markus';
    const A = CHAT_AGENTS[agentKey];

    const wrap = el(`
      <div>
        <header class="greeting">
          <h1>${A.name} ${A.icon}</h1>
          <p class="date">${esc(A.tagline)}</p>
          <div class="agent-toggle" role="tablist" aria-label="Chat partner">
            ${Object.entries(CHAT_AGENTS).map(([k, a]) => `
              <button class="btn" data-agent="${k}" aria-pressed="${k === agentKey}">${a.icon} ${esc(a.name)}</button>`).join('')}
          </div>
        </header>
        <div class="chat-log" id="chat-log"></div>
        <div id="chat-starters"></div>
        <div class="chat-input-row">
          <textarea class="text-input" id="chat-input" rows="1" placeholder="Message ${esc(A.name)} …"></textarea>
          <button class="btn primary" id="chat-send" aria-label="Send">➤</button>
        </div>
      </div>`);
    app.replaceChildren(wrap);

    wrap.querySelectorAll('.agent-toggle button').forEach(btn => {
      btn.addEventListener('click', () => {
        store.set('chatAgent', btn.dataset.agent);
        viewMarkus();
      });
    });

    const log = wrap.querySelector('#chat-log');
    const startersBox = wrap.querySelector('#chat-starters');
    const input = wrap.querySelector('#chat-input');
    const sendBtn = wrap.querySelector('#chat-send');

    // Verlauf pro Agent; alter Markus-Verlauf ('chat') wird übernommen
    const histKey = 'chat-' + agentKey;
    const history = store.get(histKey, null) ?? (agentKey === 'markus' ? store.get('chat', []) : []);

    function renderLog() {
      log.replaceChildren();
      if (!history.length) {
        log.appendChild(el(`<div class="msg bot">${esc(A.greeting)}</div>`));
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
      A.starters.forEach(s => {
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
      store.set(histKey, history.slice(-40));
      renderLog();
      renderStarters();

      const typing = el(`<div class="msg bot typing">${esc(A.name)} is typing …</div>`);
      log.appendChild(typing);
      window.scrollTo(0, document.body.scrollHeight);
      sendBtn.disabled = true;

      try {
        if (!CFG.chatUrl) throw new Error('No chat webhook configured');
        const res = await fetch(CFG.chatUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            agent: agentKey,
            messages: history.filter(m => !m.error).slice(-12)
              .map(m => ({ role: m.role, content: m.content })),
          }),
        });
        if (!res.ok) throw new Error('HTTP ' + res.status);
        const data = await res.json();
        if (!data.reply) throw new Error('Empty reply');
        history.push({ role: 'assistant', content: data.reply });
      } catch (e) {
        console.warn('Chat error', e);
        history.push({
          role: 'assistant',
          content: `Can't reach ${A.name} right now — try again in a bit.`,
          error: true,
        });
      }
      store.set(histKey, history.slice(-40));
      sendBtn.disabled = false;
      if (currentView === 'markus' && store.get('chatAgent', 'markus') === agentKey) { renderLog(); }
    }

    sendBtn.addEventListener('click', send);
    input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); }
    });

    renderLog();
    renderStarters();
  }

  // ---------- View: Woche (Tabellen-Ansicht) ----------

  async function viewWoche() {
    app.replaceChildren(el(`
      <div>
        <header class="greeting"><h1>Your week</h1>
          <p class="date">Loading …</p>
        </header>
      </div>
    `));

    let days = null;
    if (CFG.wocheUrl) {
      try {
        const res = await fetch(CFG.wocheUrl);
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data.days) && data.days.length) days = data.days;
        }
      } catch (e) { console.warn('Woche nicht erreichbar', e); }
    }
    if (currentView !== 'woche') return;

    const real = days != null;
    const list = real
      ? days.map(d => ({
          day: new Date(d.datum + 'T12:00:00').toLocaleDateString('en-US', { weekday: 'short' }),
          mood: d.stimmung != null ? (MOODS[d.stimmung - 1] || {}).emoji : null,
          felt: d.gefuehlt,
          recovery: d.recovery,
        }))
      : MOCK_WEEK;

    const rows = list.map(d => `
      <tr>
        <td>${esc(d.day)}</td>
        <td>${d.mood ?? '–'}</td>
        <td class="num">${d.felt ?? '–'}</td>
        <td class="num">${d.recovery != null ? d.recovery + ' %' : '–'}</td>
      </tr>`).join('');

    app.replaceChildren(el(`
      <div>
        ${real ? '' : '<div class="demo-banner">Sample data — the real week view fills up with your check-ins</div>'}
        <header class="greeting"><h1>Your week</h1>
          <p class="date">Feel vs. measurement — where do they split?</p>
        </header>
        <section class="card">
          <h2>Mood · Felt fitness (1–10) · Whoop recovery</h2>
          <table class="week-table">
            <thead><tr><th>Day</th><th>Mood</th><th class="num">Felt</th><th class="num">Recovery</th></tr></thead>
            <tbody>${rows}</tbody>
          </table>
          <p class="week-hint">${real
            ? 'Where "felt" and recovery are far apart, take a second look — that is exactly what this view is for.'
            : 'Wednesday: felt 8, measured 52% — on days like that, discipline decides, not feel.'}</p>
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
