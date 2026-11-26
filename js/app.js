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
  const sayBtn = (t) => `<button class="say" data-say="${esc(t)}" aria-label="Listen to the German">${ICON("speaker")}</button>`;

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
  function lessonHTML(blocks, keyPrefix) {
    return blocks.map((b, bi) => {
      switch (b[0]) {
        case "part": return `<div class="part"><span>${esc(b[1])}</span>${esc(b[2])}</div>`;
        case "one": return `<p class="one">${esc(b[1])}</p>`;
        case "parts": return `<div class="table"><table class="parts"><tbody>${b[1].map(([n, d]) => `<tr><th>${esc(n)}</th><td>${esc(d)}</td></tr>`).join("")}</tbody></table></div>`;
        case "svg": return window.DIAGRAMS && DIAGRAMS[b[1]] ? `<figure class="fig">${DIAGRAMS[b[1]]}${b[2] ? `<figcaption>${esc(b[2])}</figcaption>` : ""}</figure>` : "";
        case "done": return `<div class="note sum"><strong>Done when</strong>${b[1].map((t, i) => check((keyPrefix || "x") + "-done-" + bi + "-" + i, t)).join("")}</div>`;
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
      return `<section class="card hello"><div><h1>Get fit for IT support in 8 weeks</h1>
          <p>Built from 55 real job ads in Germany. Each day: about 1 hour learning, 2 hours hands-on lab, 30 minutes ITIL, 30 minutes German.</p></div></section>
        <section class="card"><h2>Choose your start date</h2>
          <label class="field">Week 1 begins on this Monday<input type="date" id="startDate" value="${isoDate(new Date().getDay() === 1 ? new Date() : next)}"></label>
          <p class="muted small">Preset to the next Monday. Any Monday works.</p>
          <button class="btn" id="startBtn">${ICON("play")}Start my plan</button></section>`;
    }
    if (p.before) return `<section class="card hello"><div><h1>Your plan starts in ${p.days} day${p.days === 1 ? "" : "s"}</h1>
      <p>Use the time to switch on Hyper-V and download the evaluation ISOs (Week 1, Day 2).</p>
      <a class="btn" href="#/day/1/1">${ICON("book")}Read the first lesson early</a></div></section>`;
    const wk = PLAN[p.week - 1];
    const itil = ITIL.lessons[p.week - 1];
    const due = germanDue().length;
    const pct = totalProgress();
    const h = new Date().getHours();
    const greet = h < 12 ? "Good morning" : h < 18 ? "Good afternoon" : "Good evening";
    let cta, task;
    if (p.finished) { cta = `<a class="btn" href="#/plan">${ICON("calendar")}Review the plan</a>`; task = `<section class="card task"><span class="tic">${ICON("trophy")}</span><div><h2>You finished the 8 weeks</h2><p class="muted">Keep going: 1 lab, 1 ticket set and 15 German minutes a day. Repeat weak quizzes.</p></div></section>`; }
    else if (p.dow <= 4) {
      const d = wk.days[p.dow], keys = dayKeys(wk.id, p.dow + 1), doneN = keys.filter((k) => S.done[k]).length;
      cta = `<a class="btn" href="#/day/${wk.id}/${p.dow + 1}">${ICON("play")}Continue today's lesson</a>`;
      task = `<a class="card task" href="#/day/${wk.id}/${p.dow + 1}"><span class="tic">${ICON("book")}</span><div><p class="kicker">Today · Week ${wk.id}, day ${p.dow + 1}</p><h2>${esc(d.title)}</h2>${bar(doneN / keys.length * 100)}<p class="muted small" style="margin:0">${doneN} of ${keys.length} steps done · Lesson, lab, self-check</p></div></a>`;
    } else if (p.dow === 5) {
      cta = `<a class="btn" href="#/quiz/${wk.id}">${ICON("target")}Start the week ${wk.id} test</a>`;
      task = `<a class="card task" href="#/quiz/${wk.id}"><span class="tic">${ICON("target")}</span><div><p class="kicker">Saturday</p><h2>Week ${wk.id} test and lab write-up</h2><p class="muted" style="margin:0">Do the quiz, then put this week's notes and screenshots in your GitHub homelab repo.</p></div></a>`;
    } else {
      cta = `<button class="btn ghost" data-open-de>${ICON("language")}10 German cards</button>`;
      task = `<section class="card task"><span class="tic">${ICON("clock")}</span><div><p class="kicker">Sunday</p><h2>Rest day</h2><p class="muted" style="margin:0">Optional: 10 German cards and one ticket. Rest is part of learning.</p></div></section>`;
    }
    const names = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
    const strip = names.map((n, i) => {
      const now = !p.finished && i === p.dow;
      const done = i < 5 ? dayDone(wk.id, i + 1) : i === 5 ? S.quiz[wk.id] != null : false;
      const href = i < 5 ? `#/day/${wk.id}/${i + 1}` : i === 5 ? `#/quiz/${wk.id}` : "";
      const label = i < 5 ? "Day " + (i + 1) : i === 5 ? "Test" : "Rest";
      const cls = [done ? "done" : "", now ? "now" : ""].join(" ").trim();
      return href ? `<a href="${href}" class="${cls}" aria-label="${n}: ${label}${done ? ", done" : ""}">${n}<b>${done ? "✓" : label}</b></a>` : `<span class="${cls}">${n}<b>${label}</b></span>`;
    }).join("");
    const daysDone = PLAN.reduce((n, w) => n + w.days.filter((_, i) => dayDone(w.id, i + 1)).length, 0);
    const tests = Object.keys(S.quiz).length;
    const tile = (ic, val, lbl) => `<div class="card tile"><span class="tic">${ICON(ic)}</span><div><b>${val}</b><span class="lbl">${lbl}</span></div></div>`;
    return `<section class="card hello">
        <div><p class="kicker" style="color:rgba(255,255,255,.8)">Week ${p.week} of 8</p><h1>${greet}</h1><p>${esc(wk.title)}</p>${cta}<a class="btn ghost" href="#/plan">${ICON("calendar")}Full plan</a></div>
        <div class="ring" style="--p:${pct}" role="img" aria-label="${pct}% of the course done"><div><span><b>${pct}%</b><br><small>complete</small></span></div></div>
      </section>
      <div class="sec-h"><h2>This week</h2><a href="#/plan" class="small">Week ${wk.id} details</a></div>
      <div class="weekstrip">${strip}</div>
      <div class="sec-h"><h2>Up next</h2></div>
      ${task}
      <div class="tiles">
        ${tile("check", daysDone + "/40", "lesson days done")}
        ${tile("target", tests + "/8", "week tests taken")}
        ${tile("badge", S.itil.I8 != null ? S.itil.I8 + "/40" : "Not yet", "best ITIL mock")}
        ${tile("cards", due, "German cards due")}
      </div>
      <div class="grid2">
        <a class="card task" href="#/itil/${esc(itil.id)}"><span class="tic">${ICON("badge")}</span><div><p class="kicker">ITIL this week · 30 min</p><h3 style="margin:0">${esc(itil.id)}: ${esc(itil.title)}</h3>${S.itil[itil.id] != null ? `<p class="muted small" style="margin:4px 0 0">Best score: ${S.itil[itil.id]}</p>` : ""}</div></a>
        <button class="card task" data-open-de style="text-align:left;font:inherit;color:inherit;cursor:pointer;width:100%"><span class="tic">${ICON("language")}</span><div><p class="kicker">Deutsch · 30 min</p><h3 style="margin:0">${due} cards due today</h3><p class="muted small" style="margin:4px 0 0">Phone phrases, instructions, IT words</p></div></button>
      </div>
      ${isStandalone() ? "" : `<a class="card row" href="#/install" style="margin-top:16px"><span class="wnum">${ICON("download")}</span><span><strong>Install on your phone</strong><small>Works offline and opens like a normal app.</small></span></a>`}`;
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
      ${guideCard(k)}
      <section class="card"><h2>Key points</h2><ul>${day.learn.map((x) => `<li>${esc(x)}</li>`).join("")}</ul>${links(day.res)}${check(k + "-learn", "I understand the key points")}</section>
      <section class="card"><h2>${lesson ? "Part 3: Practice (hands-on lab)" : "Hands-on lab"}</h2><ol class="steps">${day.lab.map((x) => `<li>${esc(x)}</li>`).join("")}</ol>${check(k + "-lab", "Lab done and written up")}
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
    return `<h1>Your home lab</h1><figure class="fig card">${(window.DIAGRAMS || {}).lab || ""}<figcaption>What you will build in 8 weeks, all inside your own PC.</figcaption></figure><section class="card"><p>${esc(LAB.host)}</p><p><strong>Network:</strong> ${esc(LAB.network)}</p></section>
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
      <section class="card"><h2>Install as an app</h2>${installHelpHTML()}</section>
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

  /* ---------- Software guides ---------- */
  function guideCard(dayKey) {
    const id = (window.GUIDE_FOR || {})[dayKey];
    const g = id && GUIDES.find((x) => x.id === id);
    return g ? `<a class="card row guide-link" href="#/guides/${esc(g.id)}"><span class="wnum">1</span><span><strong>First, the big picture: ${esc(g.title)}</strong><small>${esc(g.short)}</small></span></a>` : "";
  }
  views.guides = function (id) {
    if (id) {
      const g = GUIDES.find((x) => x.id === id); if (!g) return notFound();
      return `<p class="kicker"><a href="#/guides">Software guides</a></p><h1>${esc(g.title)}</h1>
        <section class="card lesson">${lessonHTML(g.blocks, "g-" + g.id)}</section>`;
    }
    return `<h1>Software guides</h1><p class="muted">Every guide: 1. Big picture, 2. Go deeper, 3. Practice. Read the big picture before the day that uses the tool.</p>
      ${GUIDES.map((g) => `<a class="card row" href="#/guides/${esc(g.id)}"><span><strong>${esc(g.title)}</strong><small>${esc(g.short)}</small></span></a>`).join("")}`;
  };

  /* ---------- Install as an app ---------- */
  let installEvt = null;
  const isIOS = /iphone|ipad|ipod/i.test(navigator.userAgent) || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
  const isStandalone = () => matchMedia("(display-mode: standalone)").matches || navigator.standalone === true;
  window.addEventListener("beforeinstallprompt", (e) => { e.preventDefault(); installEvt = e; document.body.classList.add("can-install"); });
  window.addEventListener("appinstalled", () => { installEvt = null; document.body.classList.remove("can-install"); });
  function installHelpHTML() {
    if (isStandalone()) return `<p><strong>Installed.</strong> You are using the app version.</p>`;
    const ios = `<ol class="steps"><li>Open this page in <strong>Safari</strong> (not Chrome: on iPhone only Safari can install)</li><li>Tap the <strong>Share</strong> button <span class="kbd">&#x2B06;&#xFE0E; in a square</span> at the bottom</li><li>Scroll down, tap <strong>Add to Home Screen</strong>, then <strong>Add</strong></li></ol>`;
    const android = `<ol class="steps"><li>Open this page in <strong>Chrome</strong></li><li>Tap the <strong>&#8942;</strong> menu (top right)</li><li>Tap <strong>Install app</strong> or <strong>Add to Home screen</strong>, then <strong>Install</strong></li><li>Samsung Internet: menu <strong>&#8801;</strong> > <strong>Add page to</strong> > <strong>Home screen</strong></li></ol>`;
    const pc = `<ol class="steps"><li>Edge or Chrome: click the install icon at the right end of the address bar, or menu > Apps > Install this site as an app</li></ol>`;
    return `${installEvt ? `<button class="btn" data-install>Install now</button>` : ""}
      <h3>${isIOS ? "iPhone / iPad" : "Android phone"}</h3>${isIOS ? ios : android}<h3>${isIOS ? "Android phone" : "iPhone / iPad"}</h3>${isIOS ? android : ios}<h3>Computer</h3>${pc}
      <p class="muted small">The install option only appears on the online address (asifiu.github.io), not in private/incognito tabs, and not inside apps like WhatsApp or Gmail: open the link in the real browser first.</p>`;
  }
  views.install = function () { return `<h1>Install the app</h1><section class="card">${installHelpHTML()}</section>`; };
  document.addEventListener("click", async (e) => {
    if (!e.target.closest("[data-install]")) return;
    if (installEvt) { installEvt.prompt(); await installEvt.userChoice; installEvt = null; document.body.classList.remove("can-install"); render(); }
    else location.hash = "#/install";
  });

  /* ---------- Office handbook ---------- */
  let hbQuery = "", hbCat = "";
  function hbMatches(r) {
    const q = hbQuery.trim().toLowerCase();
    if (hbCat && r.cat !== hbCat) return false;
    if (!q) return true;
    const hay = [r.title, r.tags, r.symptom || "", r.cat || ""].join(" ").toLowerCase();
    return q.split(/\s+/).every((w) => hay.includes(w));
  }
  function hbListHTML() {
    const rbs = RUNBOOKS.filter(hbMatches);
    const dds = DEEPDIVES.filter((d) => !hbCat && hbMatches({ title: d.title, tags: d.tags }));
    const cats = [...new Set(rbs.map((r) => r.cat))];
    return (rbs.length || dds.length ? "" : `<p class="muted">Nothing found. Try one word, e.g. "printer", "vpn", "locked".</p>`) +
      cats.map((c) => `<h2 class="hb-cat">${esc(c)}</h2>${rbs.filter((r) => r.cat === c).map((r) =>
        `<a class="card row" href="#/handbook/rb/${esc(r.id)}"><span><strong>${esc(r.title)}</strong><small>${esc(r.symptom)}</small></span></a>`).join("")}`).join("") +
      (dds.length ? `<h2 class="hb-cat">How it really works</h2>${dds.map((d) =>
        `<a class="card row" href="#/handbook/dd/${esc(d.id)}"><span class="wnum">${ICON("server")}</span><span><strong>${esc(d.title)}</strong></span></a>`).join("")}` : "");
  }
  views.handbook = function (kind, id) {
    if (kind === "rb") {
      const r = RUNBOOKS.find((x) => x.id === id); if (!r) return notFound();
      const dd = r.deep && DEEPDIVES.find((d) => d.id === r.deep);
      const list = (a) => `<ol class="steps">${a.map((x) => `<li>${esc(x)}</li>`).join("")}</ol>`;
      return `<p class="kicker"><a href="#/handbook">Office handbook</a> · ${esc(r.cat)}</p><h1>${esc(r.title)}</h1>
        <section class="card"><h2>What the user sees</h2><p>${esc(r.symptom)}</p><h2>Why it happens</h2><p>${esc(r.cause)}</p></section>
        <section class="card"><h2>1st level: do this</h2>${list(r.l1)}</section>
        <section class="card"><h2>2nd level: go deeper</h2>${list(r.l2)}</section>
        ${r.cmds.length ? `<section class="card"><h2>Commands</h2>${r.cmds.map(([c, m]) => `<div class="cmd"><code>${esc(c)}</code><button class="copy" data-copy="${esc(c)}">Copy</button><p>${esc(m)}</p></div>`).join("")}</section>` : ""}
        <section class="card"><h2>Ticket note template</h2><div class="cmd"><code>${esc(r.note)}</code><button class="copy" data-copy="${esc(r.note)}">Copy</button></div></section>
        <section class="card"><h2>Say it in German</h2><p class="de-line">${esc(r.de)} ${sayBtn(r.de)}</p></section>
        <section class="card note tip"><strong>Prevent it next time</strong> ${esc(r.prevent)}</section>
        ${dd ? `<a class="card row" href="#/handbook/dd/${esc(dd.id)}"><span class="wnum">${ICON("server")}</span><span><strong>Understand it deeply</strong><small>${esc(dd.title)}</small></span></a>` : ""}`;
    }
    if (kind === "dd") {
      const d = DEEPDIVES.find((x) => x.id === id); if (!d) return notFound();
      const related = RUNBOOKS.filter((r) => r.deep === d.id);
      return `<p class="kicker"><a href="#/handbook">Office handbook</a> · How it really works</p><h1>${esc(d.title)}</h1>
        <section class="card lesson">${lessonHTML(d.blocks, "dd-" + d.id)}${check("dd-" + d.id, "I read this and can explain it to a colleague")}</section>
        ${related.length ? `<section class="card"><h2>Tickets this explains</h2><ul>${related.map((r) => `<li><a href="#/handbook/rb/${esc(r.id)}">${esc(r.title)}</a></li>`).join("")}</ul></section>` : ""}`;
    }
    const cats = [...new Set(RUNBOOKS.map((r) => r.cat))];
    return `<h1>Office handbook</h1>
      <p class="muted">Use it at your desk: search the problem, follow the steps, copy the commands and the ticket note. ${RUNBOOKS.length} runbooks, ${DEEPDIVES.length} deep dives.</p>
      <input type="search" id="hbSearch" class="search" placeholder="Search: locked, printer, vpn, outlook..." value="${esc(hbQuery)}" aria-label="Search the handbook">
      <div class="chips"><button class="${hbCat ? "" : "on"}" data-cat="">All</button>${cats.map((c) => `<button class="${hbCat === c ? "on" : ""}" data-cat="${esc(c)}">${esc(c)}</button>`).join("")}</div>
      <div id="hbList">${hbListHTML()}</div>`;
  };
  views.handbook.after = function (kind) {
    if (kind) return;
    $("#hbSearch").oninput = (e) => { hbQuery = e.target.value; $("#hbList").innerHTML = hbListHTML(); };
    view.querySelector(".chips").onclick = (e) => {
      const b = e.target.closest("[data-cat]"); if (!b) return;
      hbCat = b.dataset.cat;
      view.querySelectorAll(".chips button").forEach((x) => x.classList.toggle("on", x === b));
      $("#hbList").innerHTML = hbListHTML();
    };
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
  $("#menuBtn").onclick = () => { const o = document.body.classList.toggle("nav-open"); scrim.classList.toggle("on", o); $("#menuBtn").setAttribute("aria-expanded", o); };
  document.addEventListener("keydown", (e) => { if (e.key === "Escape") { closeDE(); document.body.classList.remove("nav-open"); } });

  /* ---------- icons in the static layout ---------- */
  document.querySelectorAll("[data-icon]").forEach((el) => el.insertAdjacentHTML("afterbegin", ICON(el.dataset.icon)));

  /* ---------- global search ---------- */
  const INDEX = [];
  PLAN.forEach((w) => w.days.forEach((d, i) => INDEX.push({ t: d.title, s: `Week ${w.id}, day ${i + 1}`, h: `#/day/${w.id}/${i + 1}`, ic: "calendar", k: d.title + " " + d.learn.join(" ") })));
  (window.GUIDES || []).forEach((g) => INDEX.push({ t: g.title, s: "Software guide", h: `#/guides/${g.id}`, ic: "book", k: g.title + " " + g.short }));
  (window.RUNBOOKS || []).forEach((r) => INDEX.push({ t: r.title, s: "Office handbook · " + r.cat, h: `#/handbook/rb/${r.id}`, ic: "library", k: r.title + " " + r.tags + " " + r.symptom }));
  (window.DEEPDIVES || []).forEach((d) => INDEX.push({ t: d.title, s: "How it really works", h: `#/handbook/dd/${d.id}`, ic: "server", k: d.title + " " + d.tags }));
  ITIL.lessons.forEach((l) => INDEX.push({ t: l.id + ": " + l.title, s: "ITIL Foundation", h: `#/itil/${l.id}`, ic: "badge", k: l.title + " " + l.notes.map((n) => n[0]).join(" ") }));
  const gIn = $("#gSearch"), gOut = $("#gResults");
  let gSel = -1;
  function gRender() {
    const q = gIn.value.trim().toLowerCase();
    if (!q) { gOut.hidden = true; return; }
    const words = q.split(/\s+/);
    const hits = INDEX.map((x) => {
      const hay = (x.t + " " + x.k).toLowerCase();
      if (!words.every((w) => hay.includes(w))) return null;
      return [x, words.reduce((n, w) => n + (x.t.toLowerCase().includes(w) ? 3 : 1), 0)];
    }).filter(Boolean).sort((a, b) => b[1] - a[1]).slice(0, 9).map((x) => x[0]);
    gSel = -1;
    gOut.innerHTML = hits.length ? hits.map((x) => `<a href="${esc(x.h)}" role="option">${ICON(x.ic)}<span>${esc(x.t)}<small>${esc(x.s)}</small></span></a>`).join("")
      : `<p class="empty">No results for "${esc(gIn.value)}". Try one word, like "vpn" or "outlook".</p>`;
    gOut.hidden = false;
  }
  gIn.addEventListener("input", gRender);
  gIn.addEventListener("focus", gRender);
  gIn.addEventListener("keydown", (e) => {
    const items = [...gOut.querySelectorAll("a")];
    if (e.key === "ArrowDown" || e.key === "ArrowUp") {
      e.preventDefault(); if (!items.length) return;
      gSel = (gSel + (e.key === "ArrowDown" ? 1 : -1) + items.length) % items.length;
      items.forEach((a, i) => a.classList.toggle("on", i === gSel));
    } else if (e.key === "Enter" && items.length) { location.hash = (items[gSel] || items[0]).getAttribute("href"); closeSearch(); }
    else if (e.key === "Escape") closeSearch();
  });
  gOut.addEventListener("click", (e) => { if (e.target.closest("a")) closeSearch(); });
  document.addEventListener("click", (e) => { if (!e.target.closest(".gsearch") && !e.target.closest("#searchBtn")) gOut.hidden = true; });
  function closeSearch() { gOut.hidden = true; gIn.value = ""; document.body.classList.remove("search-open"); gIn.blur(); }
  $("#searchBtn").onclick = () => { document.body.classList.toggle("search-open"); if (document.body.classList.contains("search-open")) gIn.focus(); };
  document.addEventListener("keydown", (e) => {
    if (e.key === "/" && !/input|textarea|select/i.test(document.activeElement.tagName)) { e.preventDefault(); gIn.focus(); }
  });

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
