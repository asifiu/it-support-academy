/* IT Support Academy: one-page app, no framework, all progress stays in this browser (localStorage).
   Use "Progress & sync" to move progress between PC and phone. */
(function () {
  "use strict";

  /* ---------- state ---------- */
  const KEY = "itsa-v1";
  const blank = { start: null, done: {}, quiz: {}, itil: {}, cards: {}, tickets: {}, notes: {} };
  /* Keep only well-formed values, so an edited or foreign progress file cannot inject HTML. */
  function clean(d) {
    const out = { start: null, done: {}, quiz: {}, itil: {}, cards: {}, tickets: {}, notes: {} };
    if (!d || typeof d !== "object") return out;
    const obj = (o) => (o && typeof o === "object" && !Array.isArray(o) ? o : {});
    const safeKey = (k) => /^[A-Za-z0-9-]{1,40}$/.test(k);
    const num = (v) => typeof v === "number" && isFinite(v);
    if (typeof d.start === "string" && /^\d{4}-\d{2}-\d{2}$/.test(d.start)) out.start = d.start;
    for (const [k, v] of Object.entries(obj(d.done))) if (safeKey(k) && v === true) out.done[k] = true;
    for (const f of ["quiz", "itil", "tickets"]) for (const [k, v] of Object.entries(obj(d[f]))) if (safeKey(k) && num(v)) out[f][k] = v;
    for (const [k, v] of Object.entries(obj(d.cards))) if (safeKey(k) && v && num(v.box) && num(v.due)) out.cards[k] = { box: v.box, due: v.due };
    for (const [k, v] of Object.entries(obj(d.notes))) if (safeKey(k) && typeof v === "string") out.notes[k] = v.slice(0, 20000);
    return out;
  }
  let S;
  try { S = clean(JSON.parse(localStorage.getItem(KEY) || "{}")); }
  catch (e) { S = clean(null); }
  const save = () => localStorage.setItem(KEY, JSON.stringify(S));

  /* ---------- helpers ---------- */
  const $ = (sel, el = document) => el.querySelector(sel);
  const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const view = $("#view");
  const LESSONS = window.LESSONS || {};

  function mondayOf(d) {
    const x = new Date(d); x.setHours(0, 0, 0, 0);
    x.setDate(x.getDate() - ((x.getDay() + 6) % 7));
    return x;
  }
  function isoDate(d) { const x = new Date(d); return x.getFullYear() + "-" + String(x.getMonth() + 1).padStart(2, "0") + "-" + String(x.getDate()).padStart(2, "0"); }

  /* Where am I in the 8 weeks? week 1-8, dow 0=Mon .. 6=Sun */
  function position() {
    if (!S.start) return null;
    const start = mondayOf(S.start).getTime();
    const now = new Date(); now.setHours(0, 0, 0, 0);
    const n = Math.floor((now.getTime() - start) / 86400000);
    if (n < 0) return { before: true, days: -n };
    const week = Math.floor(n / 7) + 1;
    return { week: Math.min(week, 8), dow: n % 7, finished: week > 8 };
  }

  function dayKeys(w, d) {
    const day = PLAN[w - 1].days[d - 1];
    const keys = [];
    if (LESSONS[w + "-" + d]) keys.push(`${w}-${d}-teach`);
    keys.push(`${w}-${d}-learn`, `${w}-${d}-lab`, `${w}-${d}-check`);
    return keys;
  }
  function dayDone(w, d) { return dayKeys(w, d).every((k) => S.done[k]); }
  function totalProgress() {
    let all = 0, done = 0;
    PLAN.forEach((wk) => wk.days.forEach((_, i) => { dayKeys(wk.id, i + 1).forEach((k) => { all++; if (S.done[k]) done++; }); }));
    return Math.round((done / all) * 100);
  }

  /* Shuffle answer options so the right one is not always in the same place. */
  function shuffled(arr) { const a = arr.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; }
  function shuffleQs(qs) {
    return qs.map(([q, opts, ans]) => { const order = shuffled(opts.map((_, i) => i)); return [q, order.map((i) => opts[i]), order.indexOf(ans)]; });
  }
  let curQs = null;

  function bar(pct) { return `<div class="bar"><span style="width:${pct}%"></span></div>`; }
  function check(key, label) {
    return `<label class="check"><input type="checkbox" data-key="${esc(key)}" ${S.done[key] ? "checked" : ""}><span>${esc(label)}</span></label>`;
  }
  function links(res) {
    if (!res || !res.length) return "";
    return `<ul class="links">${res.map(([n, u]) => `<li><a href="${esc(u)}" target="_blank" rel="noopener">${esc(n)}</a></li>`).join("")}</ul>`;
  }

  /* ---------- German speech ---------- */
  function speak(text) {
    if (!("speechSynthesis" in window)) return;
    speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.lang = "de-DE"; u.rate = 0.9;
    const v = speechSynthesis.getVoices().find((x) => x.lang && x.lang.startsWith("de"));
    if (v) u.voice = v;
    speechSynthesis.speak(u);
  }
  document.addEventListener("click", (e) => {
    const s = e.target.closest("[data-say]");
    if (s) { e.preventDefault(); speak(s.dataset.say); }
  });
  const sayBtn = (t) => `<button class="say" data-say="${esc(t)}" aria-label="Listen">&#128264;</button>`;

  /* ---------- checkbox saving (delegated) ---------- */
  document.addEventListener("change", (e) => {
    const t = e.target;
    if (t.matches("input[type=checkbox][data-key]")) {
      if (t.checked) S.done[t.dataset.key] = true; else delete S.done[t.dataset.key];
      save();
    }
    if (t.matches("textarea[data-note]")) { S.notes[t.dataset.note] = t.value; save(); }
  });

  /* ---------- quiz component ---------- */
  function quizHTML(id, qs) {
    return `<form class="quiz" data-quiz="${esc(id)}">
      ${qs.map((q, i) => `<fieldset><legend>${i + 1}. ${esc(q[0])}</legend>
        ${q[1].map((o, j) => `<label class="opt"><input type="radio" name="q${i}" value="${j}"><span>${esc(o)}</span></label>`).join("")}
      </fieldset>`).join("")}
      <button class="btn" type="submit">Check answers</button>
      <p class="result" aria-live="polite"></p>
    </form>`;
  }
  function wireQuiz(qs, onScore) {
    const f = $("form.quiz", view);
    if (!f) return;
    f.addEventListener("submit", (e) => {
      e.preventDefault();
      let score = 0;
      qs.forEach((q, i) => {
        const fs = f.querySelectorAll("fieldset")[i];
        const picked = f.querySelector(`input[name=q${i}]:checked`);
        fs.querySelectorAll(".opt").forEach((l, j) => {
          l.classList.toggle("right", j === q[2]);
          l.classList.toggle("wrong", picked && +picked.value === j && j !== q[2]);
        });
        if (picked && +picked.value === q[2]) score++;
      });
      $(".result", f).textContent = `${score} / ${qs.length} correct` + (score === qs.length ? ". Perfect!" : ". Green shows the right answer.");
      onScore(score);
    });
  }

  /* ---------- lesson renderer ---------- */
  function lessonHTML(blocks) {
    return blocks.map((b) => {
      switch (b[0]) {
        case "h": return `<h3>${esc(b[1])}</h3>`;
        case "p": return `<p>${esc(b[1])}</p>`;
        case "eg": return `<div class="note eg"><strong>Example</strong> ${esc(b[1])}</div>`;
        case "tip": return `<div class="note tip"><strong>Tip</strong> ${esc(b[1])}</div>`;
        case "warn": return `<div class="note warn"><strong>Watch out</strong> ${esc(b[1])}</div>`;
        case "steps": return `<ol class="steps">${b[1].map((s) => `<li>${esc(s)}</li>`).join("")}</ol>`;
        case "cmd": return `<div class="cmd"><code>${esc(b[1])}</code><button class="copy" data-copy="${esc(b[1])}">Copy</button><p>${esc(b[2])}</p></div>`;
        case "sum": return `<div class="note sum"><strong>Remember</strong><ul>${b[1].map((s) => `<li>${esc(s)}</li>`).join("")}</ul></div>`;
        default: return "";
      }
    }).join("");
  }
  document.addEventListener("click", (e) => {
    const c = e.target.closest("[data-copy]");
    if (c && navigator.clipboard) { navigator.clipboard.writeText(c.dataset.copy); c.textContent = "Copied"; setTimeout(() => (c.textContent = "Copy"), 1200); }
  });

  /* ---------- views ---------- */
  const views = {};

  views.today = function () {
    const p = position();
    if (!p) {
      const next = mondayOf(new Date(Date.now() + 7 * 86400000));
      return `<section class="card hero"><h1>Get fit for IT support in 8 weeks</h1>
        <p>Built from 55 real job ads in Germany. Every day: about 1 hour learning, 2 hours hands-on lab, 30 minutes ITIL, 30 minutes German.</p>
        <label class="field">When do you start? (weeks begin on Monday)<input type="date" id="startDate" value="${isoDate(new Date().getDay() === 1 ? new Date() : next)}"></label>
        <p class="muted">The date is set to the next Monday. You can pick any Monday you like.</p>
        <button class="btn" id="startBtn">Start my plan</button></section>`;
    }
    if (p.before) return `<section class="card"><h1>Your plan starts in ${p.days} day(s)</h1><p>Meanwhile: switch on Hyper-V and download the evaluation ISOs (Week 1, Day 2).</p><a class="btn" href="#/day/1/1">Read the first lesson early</a></section>`;
    const wk = PLAN[p.week - 1];
    const itil = ITIL.lessons[p.week - 1];
    const due = germanDue().length;
    let main;
    if (p.finished) main = `<section class="card"><h2>You finished the 8 weeks</h2><p>Keep going: 1 lab, 1 ticket set and 15 German minutes a day. Repeat weak quizzes.</p></section>`;
    else if (p.dow <= 4) {
      const d = wk.days[p.dow];
      main = `<section class="card"><p class="kicker">Week ${wk.id}, day ${p.dow + 1}: ${esc(wk.title)}</p>
        <h2>${esc(d.title)}</h2>${bar(dayKeys(wk.id, p.dow + 1).filter((k) => S.done[k]).length / dayKeys(wk.id, p.dow + 1).length * 100)}
        <a class="btn" href="#/day/${wk.id}/${p.dow + 1}">Open today's lesson and lab</a></section>`;
    } else if (p.dow === 5) main = `<section class="card"><p class="kicker">Saturday</p><h2>Week ${wk.id} test + write up your lab</h2>
        <p>Do the quiz, then put this week's notes and screenshots in your GitHub homelab repo.</p><a class="btn" href="#/quiz/${wk.id}">Start the week ${wk.id} test</a></section>`;
    else main = `<section class="card"><p class="kicker">Sunday</p><h2>Rest day</h2><p>Optional: 10 German cards and one ticket. Rest is part of learning.</p></section>`;
    return `${main}
      <div class="grid2">
        <section class="card"><p class="kicker">ITIL this week</p><h3>${esc(itil.id)}: ${esc(itil.title)}</h3>
          <p>${S.itil[itil.id] != null ? "Best score: " + S.itil[itil.id] : "30 minutes: read the notes, then the quiz."}</p>
          <a class="btn ghost" href="#/itil/${esc(itil.id)}">Open ITIL lesson</a></section>
        <section class="card"><p class="kicker">Deutsch</p><h3>${due} cards due today</h3>
          <p>Phone phrases, instructions and IT words. Listen and repeat out loud.</p>
          <button class="btn ghost" data-open-de>Practise now</button></section>
      </div>
      <section class="card"><p class="kicker">Overall progress</p>${bar(totalProgress())}<p class="muted">${totalProgress()}% of all lessons and labs ticked. You are in week ${p.week} of 8.</p></section>`;
  };
  views.today.after = function () {
    const b = $("#startBtn");
    if (b) b.onclick = () => { S.start = $("#startDate").value || isoDate(new Date()); save(); render(); };
  };

  views.plan = function () {
    const p = position();
    return `<h1>8-week plan</h1><p class="muted">Each weekday: learn, lab, check. Saturday: test. The 'Teach me' lessons explain everything step by step.</p>
      ${PLAN.map((wk) => {
        const done = wk.days.filter((_, i) => dayDone(wk.id, i + 1)).length;
        return `<details class="card week" ${p && p.week === wk.id ? "open" : ""}>
          <summary><span class="wnum">${wk.id}</span><span><strong>${esc(wk.title)}</strong><small>${done}/5 days done${S.quiz[wk.id] != null ? " · test " + S.quiz[wk.id] + "/" + wk.quiz.length : ""}</small></span></summary>
          <p class="muted">${esc(wk.why)}</p>
          <ol class="days">${wk.days.map((d, i) => `<li class="${dayDone(wk.id, i + 1) ? "done" : ""}"><a href="#/day/${wk.id}/${i + 1}">${esc(d.title)}</a>${LESSONS[wk.id + "-" + (i + 1)] ? '<span class="pill">Teach me</span>' : ""}</li>`).join("")}</ol>
          <a class="btn ghost" href="#/quiz/${wk.id}">Week ${wk.id} test</a></details>`;
      }).join("")}`;
  };

  views.day = function (w, d) {
    w = +w; d = +d;
    const wk = PLAN[w - 1]; if (!wk) return notFound();
    const day = wk.days[d - 1]; if (!day) return notFound();
    const k = `${w}-${d}`;
    const lesson = LESSONS[k];
    const prev = d > 1 ? `#/day/${w}/${d - 1}` : w > 1 ? `#/day/${w - 1}/5` : null;
    const next = d < 5 ? `#/day/${w}/${d + 1}` : `#/quiz/${w}`;
    return `<p class="kicker"><a href="#/plan">Plan</a> · Week ${w}, day ${d}</p><h1>${esc(day.title)}</h1>
      ${lesson ? `<section class="card lesson"><h2>Teach me (step by step)</h2>${lessonHTML(lesson)}${check(k + "-teach", "I read the lesson and tried every command")}</section>`
        : `<section class="card note tip"><strong>Detailed lesson coming</strong> This day's 'Teach me' lesson is added when we reach it in our sessions. Until then, use the summary and links below.</section>`}
      <section class="card"><h2>Key points</h2><ul>${day.learn.map((x) => `<li>${esc(x)}</li>`).join("")}</ul>${links(day.res)}${check(k + "-learn", "I understand the key points")}</section>
      <section class="card"><h2>Hands-on lab</h2><ol class="steps">${day.lab.map((x) => `<li>${esc(x)}</li>`).join("")}</ol>${check(k + "-lab", "Lab done and written up")}
        <label class="field">My notes (saved on this device)<textarea data-note="${k}" rows="4">${esc(S.notes[k] || "")}</textarea></label></section>
      <section class="card"><h2>Check yourself</h2><p class="muted">Answer out loud or in your notes before moving on.</p><ul>${day.check.map((x) => `<li>${esc(x)}</li>`).join("")}</ul>${check(k + "-check", "I can answer these without looking")}</section>
      <nav class="pager">${prev ? `<a class="btn ghost" href="${prev}">Previous</a>` : "<span></span>"}<a class="btn" href="${next}">${d < 5 ? "Next day" : "Week test"}</a></nav>`;
  };

  views.quiz = function (w) {
    const wk = PLAN[+w - 1]; if (!wk) return notFound();
    return `<p class="kicker"><a href="#/plan">Plan</a> · Week ${wk.id} test</p><h1>${esc(wk.title)}</h1>
      ${S.quiz[wk.id] != null ? `<p class="muted">Best so far: ${S.quiz[wk.id]} / ${wk.quiz.length}</p>` : ""}${quizHTML("w" + wk.id, (curQs = shuffleQs(wk.quiz)))}`;
  };
  views.quiz.after = function (w) {
    const wk = PLAN[+w - 1];
    wireQuiz(curQs, (s) => { S.quiz[wk.id] = Math.max(s, S.quiz[wk.id] || 0); save(); });
  };

  views.labs = function () {
    return `<h1>Your home lab</h1><section class="card"><p>${esc(LAB.host)}</p><p><strong>Network:</strong> ${esc(LAB.network)}</p></section>
      <section class="card"><h2>Machines you will build</h2><div class="table"><table><thead><tr><th>Name</th><th>System</th><th>IP</th><th>Used for</th><th>From</th></tr></thead>
      <tbody>${LAB.vms.map((r) => `<tr>${r.map((c) => `<td>${esc(c)}</td>`).join("")}</tr>`).join("")}</tbody></table></div></section>
      <section class="card"><h2>Lab rules</h2><ul>${LAB.rules.map((r) => `<li>${esc(r)}</li>`).join("")}</ul></section>`;
  };

  /* Ticket trainer */
  let tIdx = 0, tOrder = [];
  views.tickets = function () {
    const t = TICKETS[tIdx];
    tOrder = shuffled(t.actions.map((_, i) => i));
    const doneN = Object.keys(S.tickets).length;
    const sel = (name, opts) => `<select name="${name}">${opts.map(([v, l]) => `<option value="${v}">${esc(l)}</option>`).join("")}</select>`;
    const lv = [["1", "High"], ["2", "Medium"], ["3", "Low"]];
    return `<h1>Ticket trainer</h1><p class="muted">Work each ticket like a real service desk agent. ${doneN}/${TICKETS.length} worked.</p>
      <section class="card ticket"><p class="kicker">Ticket #${1000 + t.id} · from ${esc(t.from)}</p>
        <blockquote>${esc(t.text)} ${t.lang === "de" ? sayBtn(t.text) : ""}</blockquote>
        <form id="tform">
          <div class="row3"><label class="field">Type${sel("type", [["incident", "Incident"], ["request", "Service request"]])}</label>
          <label class="field">Impact${sel("impact", lv)}</label><label class="field">Urgency${sel("urgency", lv)}</label></div>
          <fieldset><legend>Best first action</legend>${tOrder.map((j, k) => `<label class="opt"><input type="radio" name="act" value="${j}" ${k === 0 ? "required" : ""}><span>${esc(t.actions[j])}</span></label>`).join("")}</fieldset>
          <button class="btn" type="submit">Submit</button></form>
        <div id="tres" aria-live="polite"></div></section>
      <nav class="pager"><button class="btn ghost" id="tprev">Previous</button><button class="btn ghost" id="tnext">Next ticket</button></nav>`;
  };
  views.tickets.after = function () {
    const t = TICKETS[tIdx];
    $("#tprev").onclick = () => { tIdx = (tIdx - 1 + TICKETS.length) % TICKETS.length; render(); };
    $("#tnext").onclick = () => { tIdx = (tIdx + 1) % TICKETS.length; render(); };
    $("#tform").onsubmit = (e) => {
      e.preventDefault();
      const f = e.target;
      const type = f.type.value, imp = +f.impact.value, urg = +f.urgency.value;
      const act = f.act.value === "" ? -1 : +f.act.value;
      let pts = 0; const lines = [];
      const ok = (c, msg) => { if (c) pts++; lines.push(`<li class="${c ? "ok" : "no"}">${msg}</li>`); };
      ok(type === t.type, `Type: ${t.type === "incident" ? "incident" : "service request"}`);
      ok(imp === t.impact, `Impact: ${["", "high", "medium", "low"][t.impact]}`);
      ok(urg === t.urgency, `Urgency: ${["", "high", "medium", "low"][t.urgency]}`);
      ok(act === t.best, `Best action: ${esc(t.actions[t.best])}`);
      let pr = null;
      try { pr = typeof calcPriority === "function" ? calcPriority(t.impact, t.urgency) : null; } catch (err) { pr = null; }
      const prLine = pr ? `<p><strong>Priority by your matrix: P${pr}</strong> (your choice would give P${calcPriority(imp, urg) || "?"})</p>`
        : `<p class="muted">Priority rule not written yet: open <code>js/priority.js</code> and write calcPriority().</p>`;
      S.tickets[t.id] = pts; save();
      $("#tres").innerHTML = `<h3>${pts} / 4</h3><ul class="fb">${lines.join("")}</ul>${prLine}<div class="note tip"><strong>Why</strong> ${esc(t.why)}</div>`;
    };
  };

  /* ITIL */
  views.itil = function (id) {
    if (id === "mock") return mockView();
    if (id) {
      const L = ITIL.lessons.find((x) => x.id === id); if (!L) return notFound();
      return `<p class="kicker"><a href="#/itil">ITIL</a> · ${esc(L.id)}</p><h1>${esc(L.title)}</h1>
        <section class="card"><dl class="terms">${L.notes.map(([t, d]) => `<dt>${esc(t)}</dt><dd>${esc(d)}</dd>`).join("")}</dl></section>
        <section class="card note eg"><strong>On the job</strong> ${esc(L.job)}</section>
        ${L.quiz.length ? `<section class="card"><h2>Lesson quiz</h2>${quizHTML(L.id, (curQs = shuffleQs(L.quiz)))}</section>` : `<a class="btn" href="#/itil/mock">Start the 40-question mock (60 min)</a>`}`;
    }
    return `<h1>ITIL Foundation</h1>
      <section class="card"><p>Exam: ${ITIL.exam.questions} questions, ${ITIL.exam.minutes} minutes, pass with ${ITIL.exam.pass}. One lesson per week, 30 minutes a day. Book the exam only after 32+ in the mock twice.</p>
      <p class="muted">Facts were checked from secondary sources in Nov 2026. Read the official PeopleCert syllabus before booking.</p></section>
      ${ITIL.lessons.map((L, i) => `<a class="card row" href="#/itil/${esc(L.id)}"><span class="wnum">${esc(L.id)}</span><span><strong>${esc(L.title)}</strong><small>Week ${i + 1}${S.itil[L.id] != null ? " · best " + S.itil[L.id] + "/" + (L.quiz.length || 40) : ""}</small></span></a>`).join("")}`;
  };
  let mockQs = null, mockTimer = null;
  function mockView() {
    const pool = ITIL.lessons.flatMap((L) => L.quiz);
    mockQs = pool.map((q) => [Math.random(), q]).sort((a, b) => a[0] - b[0]).slice(0, ITIL.exam.questions).map((x) => x[1]);
    mockQs = shuffleQs(mockQs);
    return `<p class="kicker"><a href="#/itil">ITIL</a> · Mock exam</p><h1>Mock exam</h1>
      <p class="timer" id="timer">60:00</p>${quizHTML("mock", mockQs)}`;
  }
  views.itil.after = function (id) {
    if (mockTimer) { clearInterval(mockTimer); mockTimer = null; }
    if (id === "mock") {
      const end = Date.now() + ITIL.exam.minutes * 60000;
      mockTimer = setInterval(() => {
        const el = $("#timer"); if (!el) { clearInterval(mockTimer); return; }
        const left = Math.max(0, end - Date.now());
        el.textContent = String(Math.floor(left / 60000)).padStart(2, "0") + ":" + String(Math.floor(left / 1000) % 60).padStart(2, "0");
        if (!left) { clearInterval(mockTimer); $("form.quiz").requestSubmit(); }
      }, 1000);
      wireQuiz(mockQs, (s) => {
        clearInterval(mockTimer);
        S.itil.I8 = Math.max(s, S.itil.I8 || 0); save();
        $(".result").textContent += s >= ITIL.exam.pass ? " PASS." : ` Not yet: pass is ${ITIL.exam.pass}.`;
      });
      return;
    }
    const L = id && ITIL.lessons.find((x) => x.id === id);
    if (L && L.quiz.length) wireQuiz(curQs, (s) => { S.itil[L.id] = Math.max(s, S.itil[L.id] || 0); save(); });
  };

  views.interview = function () {
    const block = (title, list) => `<section class="card"><h2>${title}</h2>${list.map(([q, a]) => `<details class="qa"><summary>${esc(q)}</summary><p>${esc(a)}</p></details>`).join("")}</section>`;
    return `<h1>Interview practice</h1><p class="muted">Say your answer out loud first, then open the hint.</p>
      ${block("Technical", INTERVIEW.technical)}${block("Behaviour (use STAR)", INTERVIEW.behaviour)}
      <section class="card"><h2>German interview phrases</h2><p>Open the German panel: deck 'Vorstellungsgespräch'.</p><button class="btn ghost" data-open-de="interview">Practise in German</button></section>`;
  };

  views.german = function () {
    return `<h1>Deutsch für den IT-Support</h1><p class="muted">Also available from the DE button on every page.</p><div id="deFull">${germanHTML()}</div>`;
  };
  views.german.after = function () { wireGerman($("#deFull")); };

  views.settings = function () {
    return `<h1>Progress &amp; sync</h1>
      <section class="card"><h2>Start date</h2><label class="field">Week 1 Monday<input type="date" id="sStart" value="${esc(S.start || "")}"></label><button class="btn ghost" id="sSave">Save date</button></section>
      <section class="card"><h2>Move progress between PC and phone</h2>
        <p>Progress lives on each device. To move it: Export here, send the file to yourself, Import on the other device.</p>
        <button class="btn" id="exp">Export progress</button>
        <label class="btn ghost file">Import progress<input type="file" id="imp" accept="application/json" hidden></label>
        <p class="result" id="sMsg" aria-live="polite"></p></section>
      <section class="card"><h2>Install as an app</h2><p>PC (Edge/Chrome): the install icon in the address bar. Android (Chrome): menu > Add to home screen / Install app. iPhone (Safari): Share > Add to Home Screen. It then works offline.</p></section>
      <section class="card"><h2>Reset</h2><button class="btn danger" id="reset">Delete all progress on this device</button></section>`;
  };
  views.settings.after = function () {
    $("#sSave").onclick = () => { S.start = $("#sStart").value || null; save(); $("#sMsg").textContent = "Saved."; };
    $("#exp").onclick = () => {
      const a = document.createElement("a");
      a.href = URL.createObjectURL(new Blob([JSON.stringify(S, null, 1)], { type: "application/json" }));
      a.download = "it-academy-progress-" + isoDate(new Date()) + ".json"; a.click();
    };
    $("#imp").onchange = (e) => {
      const f = e.target.files[0]; if (!f) return;
      f.text().then((txt) => {
        try { const d = JSON.parse(txt); if (typeof d !== "object" || !d.done) throw 0; S = clean(d); save(); $("#sMsg").textContent = "Imported."; }
        catch (err) { $("#sMsg").textContent = "That file is not an IT Academy progress file."; }
      });
    };
    $("#reset").onclick = () => { if (confirm("Delete all progress on this device? Export first if you want a copy.")) { S = Object.assign({}, blank); save(); render(); } };
  };

  function notFound() { return `<h1>Not found</h1><a href="#/today">Back to today</a>`; }

  /* ---------- German panel ---------- */
  function allCards() {
    const out = [];
    GERMAN.decks.forEach((d) => d.cards.forEach((c, i) => out.push({ key: d.id + "-" + i, deck: d.id, c })));
    return out;
  }
  function germanDue(deck) { return allCards().filter((x) => (!deck || x.deck === deck) && SRS.isDue(S.cards[x.key])); }

  let deTab = "cards", deDeck = "", deQueue = [], deShow = false;
  function germanHTML() {
    const tabs = [["cards", "Flashcards"], ["list", "Phrases"], ["dialogs", "Dialogs"]];
    let body = "";
    if (deTab === "cards") {
      if (!deQueue.length) deQueue = germanDue(deDeck).slice(0, 15);
      const cur = deQueue[0];
      body = `<label class="field">Deck<select id="deDeck"><option value="">All decks (${germanDue().length} due)</option>
        ${GERMAN.decks.map((d) => `<option value="${d.id}" ${deDeck === d.id ? "selected" : ""}>${esc(d.title)} (${germanDue(d.id).length})</option>`).join("")}</select></label>`;
      body += cur ? `<div class="flash"><p class="en">${esc(cur.c[1])}</p>
          ${deShow ? `<p class="de">${esc(cur.c[0])} ${sayBtn(cur.c[0])}</p><p class="ex">${esc(cur.c[2])} ${sayBtn(cur.c[2])}</p>
          <div class="row2"><button class="btn danger" data-grade="0">Again</button><button class="btn" data-grade="1">I knew it</button></div>`
          : `<p class="muted">Say it in German out loud, then check.</p><button class="btn" id="deReveal">Show German</button>`}
          <p class="muted small">${deQueue.length} left in this round</p></div>`
        : `<div class="flash"><p class="de">Fertig für heute!</p><p class="muted">No cards due here. Come back tomorrow, or pick another deck.</p></div>`;
    } else if (deTab === "list") {
      body = GERMAN.decks.map((d) => `<details class="qa" ${deDeck === d.id ? "open" : ""}><summary>${esc(d.title)}</summary>
        <ul class="phrases">${d.cards.map((c) => `<li><span class="de">${esc(c[0])}</span> ${sayBtn(c[0])}<br><span class="muted">${esc(c[1])}</span></li>`).join("")}</ul></details>`).join("");
    } else {
      body = GERMAN.dialogs.map((dl) => `<details class="qa"><summary>${esc(dl.title)}</summary>
        <ul class="dialog">${dl.lines.map(([who, line]) => `<li class="${who === "Du" ? "me" : ""}"><b>${esc(who)}:</b> ${esc(line)} ${sayBtn(line)}</li>`).join("")}</ul>
        <p class="muted small">Read 'Du' lines out loud. Then cover them and answer from memory.</p></details>`).join("");
    }
    return `<div class="tabs">${tabs.map(([k, l]) => `<button class="${deTab === k ? "on" : ""}" data-detab="${k}">${l}</button>`).join("")}</div>${body}`;
  }
  function wireGerman(root) {
    if (!root) return;
    root.onclick = (e) => {
      const t = e.target;
      if (t.dataset.detab) { deTab = t.dataset.detab; refreshGerman(); }
      else if (t.id === "deReveal") { deShow = true; refreshGerman(); }
      else if (t.dataset.grade != null) {
        const cur = deQueue.shift();
        S.cards[cur.key] = SRS.next(S.cards[cur.key], t.dataset.grade === "1"); save();
        if (t.dataset.grade === "0") deQueue.push(cur); // see it again this round
        deShow = false; refreshGerman();
      }
    };
    root.onchange = (e) => { if (e.target.id === "deDeck") { deDeck = e.target.value; deQueue = []; deShow = false; refreshGerman(); } };
  }
  function refreshGerman() {
    ["#deBody", "#deFull"].forEach((s) => { const el = $(s); if (el) el.innerHTML = germanHTML(); });
  }
  const panel = $("#dePanel"), scrim = $("#scrim");
  function openDE(deck) {
    if (deck) { deDeck = deck; deTab = "list"; deQueue = []; }
    $("#deBody").innerHTML = germanHTML(); wireGerman($("#deBody"));
    panel.classList.add("open"); scrim.classList.add("on"); document.body.classList.add("de-open");
  }
  function closeDE() { panel.classList.remove("open"); scrim.classList.remove("on"); document.body.classList.remove("de-open"); }
  $("#deBtn").onclick = () => (panel.classList.contains("open") ? closeDE() : openDE());
  $("#deClose").onclick = closeDE;
  scrim.onclick = () => { closeDE(); document.body.classList.remove("nav-open"); };
  document.addEventListener("click", (e) => { const b = e.target.closest("[data-open-de]"); if (b) openDE(b.dataset.openDe); });
  $("#menuBtn").onclick = () => { document.body.classList.toggle("nav-open"); scrim.classList.toggle("on"); };
  document.addEventListener("keydown", (e) => { if (e.key === "Escape") { closeDE(); document.body.classList.remove("nav-open"); } });

  /* ---------- router ---------- */
  function render() {
    const parts = (location.hash.replace(/^#\/?/, "") || "today").split("/");
    const name = parts[0], args = parts.slice(1);
    const v = views[name] || notFound;
    view.innerHTML = v.apply(null, args);
    if (v.after) v.after.apply(null, args);
    document.querySelectorAll("[data-route]").forEach((a) => a.classList.toggle("on", a.dataset.route === name || (name === "day" && a.dataset.route === "plan") || (name === "quiz" && a.dataset.route === "plan")));
    if (window.innerWidth <= 760) closeDE();
    document.body.classList.remove("nav-open"); if (!panel.classList.contains("open")) scrim.classList.remove("on");
    window.scrollTo(0, 0);
  }
  window.addEventListener("hashchange", render);
  render();

  if ("serviceWorker" in navigator && location.protocol.startsWith("http")) navigator.serviceWorker.register("sw.js");
})();
