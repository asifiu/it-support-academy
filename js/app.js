/* IT Support Academy: one-page app, no framework, all progress stays in this browser (localStorage).
   Use "Progress & sync" to move progress between PC and phone. */
(function () {
  "use strict";

  /* ---------- state ---------- */
  const KEY = "itsa-v1";
  const blank = { start: null, done: {}, quiz: {}, itil: {}, cards: {}, tickets: {}, notes: {}, pos: {}, days: {}, xp: 0 };
  /* Keep only well-formed values, so an edited or foreign progress file cannot inject HTML. */
  function clean(d) {
    const out = { start: null, done: {}, quiz: {}, itil: {}, cards: {}, tickets: {}, notes: {}, pos: {}, days: {}, xp: 0 };
    if (!d || typeof d !== "object") return out;
    const obj = (o) => (o && typeof o === "object" && !Array.isArray(o) ? o : {});
    const safeKey = (k) => /^[A-Za-z0-9-]{1,40}$/.test(k);
    const num = (v) => typeof v === "number" && isFinite(v);
    if (typeof d.start === "string" && /^\d{4}-\d{2}-\d{2}$/.test(d.start)) out.start = d.start;
    for (const [k, v] of Object.entries(obj(d.done))) if (safeKey(k) && v === true) out.done[k] = true;
    for (const f of ["quiz", "itil", "tickets"]) for (const [k, v] of Object.entries(obj(d[f]))) if (safeKey(k) && num(v)) out[f][k] = v;
    for (const [k, v] of Object.entries(obj(d.cards))) if (safeKey(k) && v && num(v.box) && num(v.due)) out.cards[k] = { box: v.box, due: v.due };
    for (const [k, v] of Object.entries(obj(d.days))) if (/^\d{4}-\d{2}-\d{2}$/.test(k) && v === 1) out.days[k] = 1;
    if (Number.isInteger(d.xp) && d.xp >= 0 && d.xp < 1e7) out.xp = d.xp;
    for (const [k, v] of Object.entries(obj(d.pos))) if (/^[A-Za-z0-9:-]{1,40}$/.test(k) && Number.isInteger(v) && v >= 0 && v < 500) out.pos[k] = v;
    for (const [k, v] of Object.entries(obj(d.notes))) if (safeKey(k) && typeof v === "string") out.notes[k] = v.slice(0, 20000);
    return out;
  }
  let S;
  try { S = clean(JSON.parse(localStorage.getItem(KEY) || "{}")); }
  catch (e) { S = clean(null); }
  let lastXp = null;
  const save = () => {
    const d = new Date(); S.days[d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0")] = 1;
    localStorage.setItem(KEY, JSON.stringify(S));
    if (window.GAME) { const x = GAME.xp(); if (lastXp != null && x > lastXp) GAME.toast(x - lastXp); lastXp = x; }
  };

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
      if (t.checked) { S.done[t.dataset.key] = true; MOTION.pop(t.closest(".check")); } else delete S.done[t.dataset.key];
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
        if (picked && +picked.value === q[2]) { score++; MOTION.pop(fs.querySelectorAll(".opt")[q[2]]); }
        else if (picked) MOTION.shake(fs.querySelectorAll(".opt")[+picked.value]);
      });
      $(".result", f).textContent = `${score} / ${qs.length} correct` + (score === qs.length ? ". Perfect!" : ". The tick marks the right answer.");
      onScore(score);
    });
  }

  /* ---------- lesson renderer ---------- */
  /* Diagrams: scroll sideways on small screens, and open full screen with pinch-zoom. */
  function figHTML(id, caption) {
    return `<figure class="fig"><div class="fig-scroll">${DIAGRAMS[id]}</div>
      <figcaption>${caption ? `<span>${esc(caption)}</span>` : "<span></span>"}<button class="fig-zoom" data-zoom="${esc(id)}" aria-label="Open diagram full screen">${ICON("expand")}<span>Full screen</span></button></figcaption></figure>`;
  }
  document.addEventListener("click", (e) => {
    const z = e.target.closest("[data-zoom]");
    if (z && window.DIAGRAMS && DIAGRAMS[z.dataset.zoom]) {
      const ov = document.createElement("div");
      ov.className = "zoom"; ov.setAttribute("role", "dialog"); ov.setAttribute("aria-modal", "true"); ov.setAttribute("aria-label", "Diagram");
      ov.innerHTML = `<button class="icon-btn zoom-x" aria-label="Close diagram">${ICON("close")}</button><div class="zoom-body">${DIAGRAMS[z.dataset.zoom]}</div><p class="zoom-hint">Pinch or turn your phone sideways to see more</p>`;
      document.body.appendChild(ov); document.body.classList.add("zoom-open");
      const close = () => { ov.remove(); document.body.classList.remove("zoom-open"); z.focus({ preventScroll: true }); };
      ov.querySelector(".zoom-x").onclick = close; ov.querySelector(".zoom-x").focus();
      ov.addEventListener("keydown", (k) => { if (k.key === "Escape") close(); });
      return;
    }
  });
  /* Notes read like an edited manual: icon in the margin, a short lead-in, no box. */
  const callout = (kind, icon, title, body) => `<aside class="note ${kind}"><span class="note-ic">${ICON(icon)}</span><div class="note-tx">${body}</div></aside>`;
  const lead = (word, text) => `<p><span class="lead">${word}</span>${esc(text)}</p>`;
  function lessonHTML(blocks, keyPrefix, offset) {
    const partsTotal = blocks.filter((b) => b[0] === "part").length;
    return blocks.map((b, bi) => {
      switch (b[0]) {
        case "part": return `<header class="part"><div class="seg" aria-hidden="true">${Array.from({ length: partsTotal }, (_, i) => `<i class="${i < +b[1] ? "on" : ""}"></i>`).join("")}</div><p class="part-n">Part ${esc(b[1])} of ${partsTotal}</p><h2>${esc(b[2])}</h2></header>`;
        case "one": return `<p class="one">${esc(b[1])}</p>`;
        case "parts": return `<div class="table"><table class="parts"><tbody>${b[1].map(([n, d]) => `<tr><th>${esc(n)}</th><td>${esc(d)}</td></tr>`).join("")}</tbody></table></div>`;
        case "svg": return window.DIAGRAMS && DIAGRAMS[b[1]] ? figHTML(b[1], b[2]) : "";
        case "done": return callout("sum", "check", "", `<p class="note-h">You are done when</p>` + b[1].map((t, i) => check((keyPrefix || "x") + "-done-" + ((offset || 0) + bi) + "-" + i, t)).join(""));
        case "h": return `<h3>${esc(b[1])}</h3>`;
        case "p": return `<p>${esc(b[1])}</p>`;
        case "eg": return callout("eg", "book", "", lead("In practice:", b[1]));
        case "tip": return callout("tip", "bulb", "", lead("Tip:", b[1]));
        case "warn": return callout("warn", "alert", "", lead("Watch out:", b[1]));
        case "steps": return `<ol class="steps">${b[1].map((s) => `<li>${esc(s)}</li>`).join("")}</ol>`;
        case "cmd": return `<div class="cmd"><code>${esc(b[1])}</code><button class="copy" data-copy="${esc(b[1])}">Copy</button><p>${esc(b[2])}</p></div>`;
        case "sum": return callout("sum", "list", "", `<p class="note-h">Key takeaways</p><ul>${b[1].map((s) => `<li>${esc(s)}</li>`).join("")}</ul>`);
        default: return "";
      }
    }).join("");
  }
  document.addEventListener("click", (e) => {
    const c = e.target.closest("[data-copy]");
    if (c && navigator.clipboard) { navigator.clipboard.writeText(c.dataset.copy); c.textContent = "Copied"; setTimeout(() => (c.textContent = "Copy"), 1200); }
  });


  /* ---------- Lesson player: short steps, Next until the end ---------- */
  function lessonSteps(blocks, keyPrefix, firstTitle) {
    const total = blocks.filter((b) => b[0] === "part").length;
    const out = []; let part = "", partNo = 0, cur = null;
    blocks.forEach((b, gi) => {
      if (b[0] === "part") { part = b[2]; partNo = +b[1]; cur = null; return; }
      if (b[0] === "h" || !cur) {
        cur = { title: b[0] === "h" ? b[1] : part || firstTitle || "Introduction", label: part ? `Part ${partNo} of ${total} – ${part}` : "", start: b[0] === "h" ? gi + 1 : gi, blocks: [] };
        out.push(cur);
        if (b[0] === "h") return;
      }
      cur.blocks.push(b);
    });
    return out.map((st) => ({ title: st.title, label: st.label.replace(" – ", ": "), html: lessonHTML(st.blocks, keyPrefix, st.start) }));
  }

  function mountPlayer(host, cfg) {
    const steps = cfg.steps, n = steps.length;
    let i = Math.min(S.pos[cfg.key] || 0, n - 1);
    host.innerHTML = `<div class="player">
      <div class="pl-head">
        <div class="pl-bar" role="progressbar" aria-label="Lesson progress" aria-valuemin="1" aria-valuemax="${n}"><i></i></div>
        <button class="pl-ki" data-open-ki="${cfg.kiMode || "it"}" aria-label="Ask the KI tutor about this step">${ICON("spark")}<span>${T("Ask KI")}</span></button>
        <button class="pl-count" aria-expanded="false" aria-controls="plToc"></button>
        <ol class="pl-toc" id="plToc" hidden>${steps.map((st, j) => `<li><button data-go="${j}"><span class="pl-dot"></span><span>${esc(st.title)}</span></button></li>`).join("")}</ol>
      </div>
      <article class="pl-step" tabindex="-1"></article>
      <div class="pl-nav"><button class="btn ghost pl-back">${ICON("chevron", "flip")}<span>${T("Back")}</span></button><button class="go pl-next"><span class="lbl"></span><span class="dot">${ICON("arrowRight")}</span></button></div>
    </div>`;
    const art = host.querySelector(".pl-step"), bar = host.querySelector(".pl-bar"), barI = bar.querySelector("i");
    const count = host.querySelector(".pl-count"), toc = host.querySelector(".pl-toc");
    const back = host.querySelector(".pl-back"), next = host.querySelector(".pl-next");
    function show(dir) {
      const st = steps[i];
      S.pos[cfg.key] = i; save();
      art.innerHTML = `${st.label ? `<p class="pl-label">${esc(st.label)}</p>` : ""}<h2 class="pl-title">${esc(st.title)}</h2><div class="lesson pl-body">${st.html}</div>`;
      barI.style.width = ((i + 1) / n * 100) + "%"; bar.setAttribute("aria-valuenow", i + 1);
      count.innerHTML = `${T("Step")} <b>${i + 1}</b> ${T("of")} ${n}${ICON("chevron", "down")}`;
      toc.querySelectorAll("li").forEach((li, j) => { li.classList.toggle("now", j === i); li.classList.toggle("seen", j < i); });
      back.disabled = i === 0;
      next.querySelector(".lbl").textContent = i === n - 1 ? T(cfg.finishLabel || "Finish") : T("Next");
      next.classList.toggle("finish", i === n - 1);
      if (st.after) st.after(art);
      art.querySelectorAll("svg.diagram").forEach((g) => MOTION.draw(g));
      if (dir) {
        MOTION.step(art, dir);
        const top = host.getBoundingClientRect().top + scrollY - 80;
        if (scrollY > top) window.scrollTo({ top, behavior: MOTION.reduce() ? "auto" : "smooth" });
        art.focus({ preventScroll: true });
      }
      if (cfg.onStep) cfg.onStep(i);
    }
    function go(to) {
      if (to < 0 || to === i) return;
      if (to >= n) { if (cfg.onFinish) cfg.onFinish(); return; }
      const dir = to > i ? 1 : -1; i = to; show(dir);
    }
    next.onclick = () => go(i + 1);
    back.onclick = () => go(i - 1);
    count.onclick = () => { const o = toc.hidden; toc.hidden = !o; count.setAttribute("aria-expanded", o); if (o) MOTION.animate(toc, [{ opacity: 0, transform: "translateY(-6px)" }, { opacity: 1, transform: "none" }], { duration: 200 }); };
    toc.onclick = (e) => { const b = e.target.closest("[data-go]"); if (b) { toc.hidden = true; count.setAttribute("aria-expanded", "false"); go(+b.dataset.go); } };
    let x0 = null, y0 = null;
    art.addEventListener("touchstart", (e) => { if (e.target.closest(".fig-scroll, input, textarea, select, .cmd")) { x0 = null; return; } x0 = e.touches[0].clientX; y0 = e.touches[0].clientY; }, { passive: true });
    art.addEventListener("touchend", (e) => {
      if (x0 == null) return;
      const dx = e.changedTouches[0].clientX - x0, dy = e.changedTouches[0].clientY - y0;
      if (Math.abs(dx) > 70 && Math.abs(dx) > Math.abs(dy) * 1.6) go(i + (dx < 0 ? 1 : -1));
      x0 = null;
    });
    if (window._plKey) document.removeEventListener("keydown", window._plKey);
    window._plKey = (e) => {
      if (!host.isConnected) { document.removeEventListener("keydown", window._plKey); return; }
      if (/input|textarea|select/i.test(document.activeElement.tagName)) return;
      if (e.key === "ArrowRight") { e.preventDefault(); go(i + 1); } else if (e.key === "ArrowLeft") { e.preventDefault(); go(i - 1); }
    };
    document.addEventListener("keydown", window._plKey);
    show(0);
    return { go };
  }

  /* ---------- views ---------- */
  const views = {};

  function continueCard() {
    let last = null; try { last = JSON.parse(localStorage.getItem("itsa-last") || "null"); } catch (e) { last = null; }
    if (last && typeof last.h === "string" && /^#\/module\/[a-z0-9-]+\/[a-z0-9-]+$/.test(last.h))
      return `<a class="card task wide cont" href="${last.h}"><span class="tic">${ICON("play")}</span><span class="corner">${ICON("arrowRight")}</span><p class="pl-label">Continue where you stopped</p><h3>${esc(last.t)}</h3><p class="muted small" style="margin:0">${esc(last.c)}</p></a>`;
    return `<a class="card task wide cont" href="#/learn"><span class="tic">${ICON("target")}</span><span class="corner">${ICON("arrowRight")}</span><p class="pl-label">Start learning</p><h3>Choose your career track</h3><p class="muted small" style="margin:0">IT Support, System Administrator or Network Engineer</p></a>`;
  }
  views.today = function () {
    const p = position();
    const go = (href, icon, text) => `<a class="go" href="${href}"><span class="dot">${ICON(icon)}</span>${text}<span class="chev">${ICON("chevrons")}</span></a>`;
    if (!p) {
      const tp = TRACKS.map((t) => [t, trackPct(t)]).sort((a, b) => b[1] - a[1])[0];
      return `<section class="card hello"><div><div class="who"><span class="av">${ICON("server")}</span><span><small>IT Support Academy</small><b>Your career in IT, step by step</b></span></div>
          <h1>Learn it, practise it, get the job</h1><p class="sub">Three career tracks, ${COURSES.length} courses from foundation to senior level, Cisco and Microsoft exam topics, hands-on labs and German for the workplace.</p>
          <a class="go" href="#/learn"><span class="dot">${ICON("target")}</span>Open the career tracks<span class="chev">${ICON("chevrons")}</span></a></div>
          <div class="gauge"><small>${esc(tp[0].title)} track</small><b><span class="num" data-to="${tp[1]}">${tp[1]}</span>%</b>${bar(tp[1])}<div class="scale"><span>0</span><span>${esc(tp[0].certs[0])}</span></div></div></section>
        ${GAME.card()}
        <div class="sec-h"><h2>${T("Pick up from here")}</h2></div>
        <div class="bento">${continueCard()}
          <a class="card task wide" href="#/practice"><span class="tic">${ICON("server")}</span><span class="corner">${ICON("arrowRight")}</span><p class="pl-label">Practice</p><h3>Cisco CLI labs and subnetting</h3><p class="muted small" style="margin:0">Type real commands; every task is checked live</p></a>
          <button class="card task wide" data-open-de style="text-align:left;font:inherit;cursor:pointer;width:100%"><span class="tic">${ICON("language")}</span><span class="corner">${ICON("expand")}</span><p class="pl-label">Deutsch</p><h3>${germanDue().length} German cards due</h3><p class="muted small" style="margin:0">Workplace phrases with spaced repetition</p></button>
          <a class="card task wide" href="#/handbook"><span class="tic">${ICON("library")}</span><span class="corner">${ICON("arrowRight")}</span><p class="pl-label">At work</p><h3>Office handbook</h3><p class="muted small" style="margin:0">Fixes for real tickets, with commands and German phrases</p></a>
        </div>`;
    }
    if (p.before) return `<section class="card hello"><div><div class="who"><span class="av">${ICON("clock")}</span><span><small>Starts soon</small><b>${p.days} day${p.days === 1 ? "" : "s"} to go</b></span></div>
      <h1>Get the lab ready before Monday</h1><p class="sub">Switch on Hyper-V and download the evaluation ISOs (Week 1, Day 2).</p>${go("#/day/1/1", "book", "Read the first lesson early")}</div></section>`;
    const wk = PLAN[p.week - 1];
    const itil = ITIL.lessons[p.week - 1];
    const due = germanDue().length;
    const pct = totalProgress();
    const h = new Date().getHours();
    const greet = T(h < 12 ? "Good morning" : h < 18 ? "Good afternoon" : "Good evening");
    const daysDone = PLAN.reduce((n, w) => n + w.days.filter((_, i) => dayDone(w.id, i + 1)).length, 0);
    let headline, sub, cta;
    if (p.finished) { headline = "You finished all 8 weeks"; sub = "Keep one lab, one ticket set and 15 German minutes a day."; cta = go("#/plan", "calendar", "Review the plan"); }
    else if (p.dow <= 4) { const d = wk.days[p.dow]; headline = d.title; sub = `Day ${p.dow + 1} of week ${wk.id}: ${wk.title}`; cta = go(`#/day/${wk.id}/${p.dow + 1}`, "play", "Start today's lesson"); }
    else if (p.dow === 5) { headline = `Week ${wk.id} test`; sub = "Take the quiz, then write up this week's lab in your GitHub repo."; cta = go(`#/quiz/${wk.id}`, "target", "Start the test"); }
    else { headline = "Rest day"; sub = "Optional: 10 German cards and one ticket."; cta = `<button class="go" data-open-de><span class="dot">${ICON("language")}</span>Practise 10 German cards<span class="chev">${ICON("chevrons")}</span></button>`; }
    const names = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
    const strip = names.map((n, i) => {
      const now = !p.finished && i === p.dow;
      const done = i < 5 ? dayDone(wk.id, i + 1) : i === 5 ? S.quiz[wk.id] != null : false;
      const href = i < 5 ? `#/day/${wk.id}/${i + 1}` : i === 5 ? `#/quiz/${wk.id}` : "";
      const label = i < 5 ? "Day " + (i + 1) : i === 5 ? "Test" : "Rest";
      const cls = [done ? "done" : "", now ? "now" : ""].join(" ").trim();
      const inner = `${n}<b>${done ? "✓" : label}</b>`;
      return href ? `<a href="${href}" class="${cls}" aria-label="${n}: ${label}${done ? ", done" : ""}${now ? ", today" : ""}">${inner}</a>` : `<span class="${cls}">${inner}</span>`;
    }).join("");
    const tile = (href, ic, val, lbl) => `<a class="card tile" href="${href}"><span class="tic">${ICON(ic)}</span><span class="corner">${ICON("expand")}</span><b>${val}</b><span class="lbl">${lbl}</span></a>`;
    return `<section class="card hello">
        <div>
          <div class="who"><span class="av">${ICON("server")}</span><span><small>${greet}</small><b>Week ${p.week} of 8</b></span></div>
          <h1>${esc(headline)}</h1><p class="sub">${esc(sub)}</p>${cta}
        </div>
        <div class="gauge" role="img" aria-label="${pct}% of the course done">
          <small>Course progress</small><b><span class="num" data-to="${pct}">${pct}</span>%</b>${bar(pct)}<div class="scale"><span>0</span><span>${daysDone} of 40 days</span></div>
        </div>
      </section>
      <div class="sec-h"><h2>${T("This week")}</h2><a href="#/plan">${T("Open the plan")}</a></div>
      <div class="weekstrip">${strip}</div>
      ${GAME.card()}
      <div class="sec-h"><h2>${T("Your routine")}</h2></div>
      <div class="bento">
        ${continueCard()}
        <a class="card task wide" href="#/itil/${esc(itil.id)}"><span class="tic">${ICON("badge")}</span><span class="corner">${ICON("expand")}</span>
          <h3>ITIL ${esc(itil.id)}: ${esc(itil.title)}</h3><p class="muted small" style="margin:0">30 minutes${S.itil[itil.id] != null ? `, best quiz score ${S.itil[itil.id]}` : ", notes then quiz"}</p></a>
        <button class="card task wide" data-open-de style="text-align:left;font:inherit;cursor:pointer;width:100%"><span class="tic">${ICON("language")}</span><span class="corner">${ICON("expand")}</span>
          <h3>${due} German cards due</h3><p class="muted small" style="margin:0">30 minutes of phone phrases, instructions and IT words</p></button>
        ${tile("#/plan", "check", `<span class="num" data-to="${daysDone}">${daysDone}</span><small class="of">/40</small>`, "Lesson days done")}
        ${tile("#/plan", "target", `<span class="num" data-to="${Object.keys(S.quiz).length}">${Object.keys(S.quiz).length}</span><small class="of">/8</small>`, "Week tests taken")}
        ${tile("#/itil/mock", "badge", S.itil.I8 != null ? `<span class="num" data-to="${S.itil.I8}">${S.itil.I8}</span><small class="of">/40</small>` : "None", "Best ITIL mock")}
        ${tile("#/tickets", "ticket", `<span class="num" data-to="${Object.keys(S.tickets).length}">${Object.keys(S.tickets).length}</span><small class="of">/${TICKETS.length}</small>`, "Tickets worked")}
      </div>
      ${p.dow === 6 ? `<section class="card night" style="margin-top:14px"><div class="moon">${ICON("moon")}</div><h2>Rest is part of learning</h2><p class="muted" style="margin:0">Your brain stores this week's labs while you sleep. See you Monday.</p></section>` : ""}
      ${isStandalone() ? "" : `<a class="card row" href="#/install" style="margin-top:14px"><span class="wnum">${ICON("download")}</span><span><strong>Install on your phone</strong><small>Works offline and opens like a normal app.</small></span></a>`}`;
  };
  views.today.after = function () {
    view.querySelectorAll(".num[data-to]").forEach((n) => MOTION.countUp(n, +n.dataset.to));
    const g = view.querySelector(".gauge .bar span"); if (g) MOTION.grow(g, parseFloat(g.style.width) || 0, 250);
    MOTION.stagger(view.querySelectorAll(".weekstrip > *, .bento > .card"), 45);
    const b = $("#startBtn");
    if (b) b.onclick = () => { S.start = $("#startDate").value || isoDate(new Date()); save(); render(); };
  };

  views.plan = function () {
    const p = position();
    const startForm = S.start ? "" : `<section class="card"><h2>Use the 8-week quick start?</h2><p class="muted">Optional. It gives you a fixed daily schedule with a home lab. Your career tracks work without it.</p>
      <label class="field">Week 1 begins on this Monday<input type="date" id="startDate" value="${isoDate(new Date().getDay() === 1 ? new Date() : mondayOf(new Date(Date.now() + 7 * 86400000)))}"></label>
      <button class="go" id="startBtn"><span class="dot">${ICON("play")}</span>Start the quick start<span class="chev">${ICON("chevrons")}</span></button></section>`;
    return `${startForm}<h1>8-week plan</h1><p class="muted">Each weekday is one guided flow: lesson, key points, lab and self-check. Saturday is the weekly test.</p>
      ${PLAN.map((wk) => {
        const done = wk.days.filter((_, i) => dayDone(wk.id, i + 1)).length;
        return `<details class="card week" ${p && p.week === wk.id ? "open" : ""}>
          <summary><span class="wnum">${wk.id}</span><span><strong>${esc(wk.title)}</strong><small>${done}/5 days done${S.quiz[wk.id] != null ? " · test " + S.quiz[wk.id] + "/" + wk.quiz.length : ""}</small></span></summary>
          <p class="muted">${esc(wk.why)}</p>
          <ol class="days">${wk.days.map((d, i) => `<li class="${dayDone(wk.id, i + 1) ? "done" : ""}"><a href="#/day/${wk.id}/${i + 1}">${esc(d.title)}</a>${LESSONS[wk.id + "-" + (i + 1)] ? '<span class="pill">Lesson</span>' : ""}</li>`).join("")}</ol>
          <a class="btn ghost" href="#/quiz/${wk.id}">Week ${wk.id} test</a></details>`;
      }).join("")}`;
  };

  views.plan.after = function () {
    const b = $("#startBtn");
    if (b) b.onclick = () => { S.start = $("#startDate").value || isoDate(new Date()); save(); location.hash = "#/today"; };
  };
  views.day = function (w, d) {
    w = +w; d = +d;
    const wk = PLAN[w - 1]; if (!wk) return notFound();
    const day = wk.days[d - 1]; if (!day) return notFound();
    return `<p class="kicker"><a href="#/plan">8-week plan</a> / Week ${w}, day ${d}</p><h1 class="page-title">${esc(day.title)}</h1><div id="player"></div>`;
  };
  views.day.after = function (w, d) {
    w = +w; d = +d;
    const wk = PLAN[w - 1]; if (!wk) return;
    const day = wk.days[d - 1]; if (!day) return;
    const k = `${w}-${d}`, lesson = LESSONS[k];
    const nextHref = d < 5 ? `#/day/${w}/${d + 1}` : `#/quiz/${w}`;
    const steps = [];
    const gc = guideCard(k);
    if (gc) steps.push({ title: "Before you start", label: "Software guide", html: `<p>This day uses a tool you may not know yet. Read its big picture first, then come back here.</p>${gc}` });
    const lessonSt = lesson ? lessonSteps(lesson) : [];
    if (lessonSt.length) steps.push(...lessonSt);
    else steps.push({ title: "Lesson coming soon", label: "Lesson", html: `<p>The detailed lesson for this day is added when we reach it in our sessions. Until then, work through the key points, the lab and the self-check.</p>` });
    const lessonEnd = steps.length - 1;
    steps.push({ title: "Key points", label: "Summary", html: `<ul>${day.learn.map((x) => `<li>${esc(x)}</li>`).join("")}</ul>${links(day.res)}${check(k + "-learn", "I understand the key points")}` });
    steps.push({ title: "Hands-on lab", label: "Practice", html: `<ol class="steps">${day.lab.map((x) => `<li>${esc(x)}</li>`).join("")}</ol>${check(k + "-lab", "Lab done and written up")}
      <label class="field">My notes, saved on this device<textarea data-note="${k}" rows="4">${esc(S.notes[k] || "")}</textarea></label>` });
    steps.push({ title: "Check yourself", label: "Self-check", html: `<p>Answer out loud or in your notes before you move on.</p><ul>${day.check.map((x) => `<li>${esc(x)}</li>`).join("")}</ul>${check(k + "-check", "I can answer these without looking")}` });
    steps.push({ title: "Day complete", label: "Finish", html: "", after: (art) => {
      const items = [["Lesson", k + "-teach"], ["Key points", k + "-learn"], ["Hands-on lab", k + "-lab"], ["Self-check", k + "-check"]];
      art.querySelector(".pl-body").innerHTML = `<div class="done-hero"><span class="done-mark">${ICON("check")}</span><p>${dayDone(w, d) ? "Everything for today is done. Well done." : "Almost there. Switch on whatever is still open."}</p></div>
        <ul class="done-list">${items.map(([t, key]) => `<li class="${S.done[key] ? "ok" : ""}">${ICON(S.done[key] ? "check" : "clock")}<span>${t}</span></li>`).join("")}</ul>`;
      if (dayDone(w, d)) MOTION.pop(art.querySelector(".done-mark"));
    } });
    mountPlayer($("#player"), {
      key: "day-" + k, steps, finishLabel: d < 5 ? "Next day" : "Week test",
      onStep: (i) => { if (lesson && i > lessonEnd && !S.done[k + "-teach"]) { S.done[k + "-teach"] = true; save(); } },
      onFinish: () => { location.hash = nextHref; }
    });
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
    return `<h1>Your home lab</h1><section class="card">${window.DIAGRAMS ? figHTML("lab", "What you will build in 8 weeks, all inside your own PC") : ""}</section><section class="card"><p>${esc(LAB.host)}</p><p><strong>Network:</strong> ${esc(LAB.network)}</p></section>
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
      return `<p class="kicker"><a href="#/itil">ITIL Foundation</a> / Lesson ${esc(L.id)}</p><h1 class="page-title">${esc(L.title)}</h1><div id="player"></div>`;
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
    if (!L) return;
    const steps = L.notes.map(([t, d], j) => ({ title: t, label: `Key idea ${j + 1} of ${L.notes.length}`, html: `<p class="term-def">${esc(d)}</p>` }));
    steps.push({ title: "On the job", label: "In practice", html: callout("eg", "book", "", lead("At the service desk:", L.job)) });
    if (L.quiz.length) steps.push({ title: "Lesson quiz", label: "Check", html: quizHTML(L.id, (curQs = shuffleQs(L.quiz))), after: () => wireQuiz(curQs, (sc) => { S.itil[L.id] = Math.max(sc, S.itil[L.id] || 0); save(); }) });
    else steps.push({ title: "Mock exam", label: "Exam practice", html: `<p>40 questions, 60 minutes, pass mark 26. Take it when the eight lessons feel easy.</p><a class="btn" href="#/itil/mock">Start the mock exam</a>` });
    mountPlayer($("#player"), { key: "itil-" + L.id, steps, finishLabel: "Back to ITIL", onFinish: () => { location.hash = "#/itil"; } });
  };

  views.interview = function () {
    const block = (title, list) => `<section class="card"><h2>${title}</h2>${list.map(([q, a]) => `<details class="qa"><summary>${esc(q)}</summary><p>${esc(a)}</p></details>`).join("")}</section>`;
    return `<h1>Interview practice</h1><p class="muted">Say your answer out loud first, then open the hint.</p>
      ${block("Technical", INTERVIEW.technical)}${block("Behaviour (use STAR)", INTERVIEW.behaviour)}
      <section class="card"><h2>German interview phrases</h2><p>Open the German panel: deck 'Vorstellungsgespräch'.</p><button class="btn ghost" data-open-de="interview">Practise in German</button></section>`;
  };


  /* ---------- Deutsch Arcade: quick games that give XP ---------- */
  const GAMES = [
    { id: "artikel", t: "Der-Die-Das Blitz", d: "60 seconds. Tap the right article. Streaks multiply your points.", ic: "target" },
    { id: "memory", t: "Memory", d: "Flip cards and match German with English.", ic: "cards" },
    { id: "diktat", t: "Hör-Diktat", d: "Listen to a sentence and type what you hear.", ic: "speaker" },
    { id: "verben", t: "Verb-Rennen", d: "Präsens, Präteritum, Perfekt with haben or sein. Go fast.", ic: "play" },
    { id: "satz", t: "Satz-Baumeister", d: "Build sentences in the right order against the clock.", ic: "grid" }
  ];
  const arcBest = (id) => +(localStorage.getItem("itsa-arc-" + id) || 0);
  function nounPool() {
    const out = [], seen = new Set();
    const add = (raw, en) => { const m = String(raw).match(/^(der|die|das)\s+([A-ZÄÖÜ][\wäöüß-]*)/); if (m && !seen.has(m[2])) { seen.add(m[2]); out.push({ art: m[1], w: m[2], en }); } };
    (window.DEUTSCH ? DEUTSCH.levels : []).forEach((l) => l.units.forEach((u) => u.vocab.forEach((v) => add(v[0], v[1]))));
    GERMAN.decks.forEach((d) => d.cards.forEach((c) => add(c[0], c[1])));
    return out;
  }
  function sentencePool() {
    const out = [];
    (window.DEUTSCH ? DEUTSCH.levels : []).forEach((l) => l.units.forEach((u) => { u.vocab.forEach((v) => { if (v[2] && v[2].split(" ").length >= 4 && v[2].split(" ").length <= 9) out.push(v[2]); }); u.drills.forEach((d) => d.order && out.push(d.a)); }));
    return out;
  }
  views.arcade = function () {
    return `<p class="kicker"><a href="#/german">Deutsch</a></p><h1 class="page-title">${T("Deutsch Arcade")}</h1><p class="muted lead-p">Short, fast games. Every point is XP. Play two a day and the words stay forever.</p>
      <div class="cgrid">${GAMES.map((g) => `<a class="card ccard game" href="#/game/${g.id}"><span class="tic">${ICON(g.ic)}</span><h3>${esc(g.t)}</h3><p class="muted small">${esc(g.d)}</p><div class="cmeta"><span>${ICON("trophy")}Best: ${arcBest(g.id)}</span></div></a>`).join("")}</div>`;
  };
  views.arcade.after = function () { MOTION.stagger(view.querySelectorAll(".game"), 50); };
  views.game = function (id) {
    const g = GAMES.find((x) => x.id === id); if (!g) return notFound();
    return `<p class="kicker"><a href="#/arcade">Deutsch Arcade</a></p><h1 class="page-title">${esc(g.t)}</h1><div id="game" class="gamebox"></div>`;
  };
  views.game.after = function (id) {
    const box = $("#game"), g = GAMES.find((x) => x.id === id); if (!g) return;
    const hud = (extra) => `<div class="hud"><span>Score <b class="hs">0</b></span>${extra || ""}<span>Best <b>${arcBest(id)}</b></span></div>`;
    const finish = (score, note) => {
      const best = arcBest(id), rec = score > best; if (rec) localStorage.setItem("itsa-arc-" + id, score);
      if (score > 0) { S.xp = (S.xp || 0) + score; save(); }
      box.innerHTML = `<div class="done-hero"><span class="done-mark">${ICON("trophy")}</span><p><b>${score} points</b>${rec ? " • new record!" : ""}</p><p class="muted">${esc(note || "")}</p></div>
        <p style="text-align:center"><button class="btn" id="again">${T("Play again")}</button> <a class="btn ghost" href="#/arcade">${T("Other games")}</a></p>`;
      MOTION.pop(box.querySelector(".done-mark")); box.querySelector("#again").onclick = () => views.game.after(id);
    };
    const timer = (sec, onEnd) => {
      const bar = box.querySelector(".tbar i"); let left = sec * 1000; const t0 = performance.now();
      const tick = (now) => { if (!box.isConnected) return; left = sec * 1000 - (now - t0); if (bar) bar.style.width = Math.max(0, left / (sec * 10)) + "%"; if (left <= 0) onEnd(); else box._raf = requestAnimationFrame(tick); };
      cancelAnimationFrame(box._raf); box._raf = requestAnimationFrame(tick);
    };
    if (id === "artikel") {
      const pool = shuffled(nounPool()); let i = 0, score = 0, combo = 0, over = false;
      box.innerHTML = hud(`<span>Combo <b class="hc">x1</b></span>`) + `<div class="tbar"><i></i></div><div class="gq"></div><div class="arts">${["der", "die", "das"].map((a) => `<button class="artbtn a-${a}" data-a="${a}">${a}</button>`).join("")}</div><p class="gfb2 muted"></p>`;
      const q = box.querySelector(".gq"), fb = box.querySelector(".gfb2");
      const show = () => { const n = pool[i % pool.length]; q.innerHTML = `<span class="gw">${esc(n.w)}</span><small>${esc(n.en)}</small>`; MOTION.animate(q, [{ transform: "scale(.92)", opacity: 0 }, { transform: "none", opacity: 1 }], { duration: 200, easing: MOTION.E.spring }); };
      box.querySelectorAll(".artbtn").forEach((b) => b.onclick = () => {
        if (over) return; const n = pool[i % pool.length], ok = b.dataset.a === n.art;
        if (ok) { combo++; score += 10 * Math.min(1 + Math.floor(combo / 3), 4); MOTION.pop(b); fb.textContent = ""; } else { combo = 0; MOTION.shake(b); fb.innerHTML = `<b>${n.art}</b> ${esc(n.w)}`; }
        box.querySelector(".hs").textContent = score; box.querySelector(".hc").textContent = "x" + Math.min(1 + Math.floor(combo / 3), 4); i++; show();
      });
      show(); timer(60, () => { over = true; finish(score, "Tip: learn nouns always with their article, like one word: der Rechner."); });
    } else if (id === "memory") {
      const pick = shuffled(nounPool()).slice(0, 6);
      const tiles = shuffled(pick.flatMap((n, k) => [{ k, txt: n.art + " " + n.w }, { k, txt: n.en.split(",")[0] }]));
      let open = [], found = 0, moves = 0, lock = false; const t0 = Date.now();
      box.innerHTML = hud(`<span>Moves <b class="hm">0</b></span>`) + `<div class="mgrid">${tiles.map((t, j) => `<button class="mtile" data-j="${j}"><span class="mfront">?</span><span class="mback">${esc(t.txt)}</span></button>`).join("")}</div>`;
      box.querySelectorAll(".mtile").forEach((b) => b.onclick = () => {
        if (lock || b.classList.contains("open")) return; b.classList.add("open"); open.push(b);
        if (open.length === 2) { moves++; box.querySelector(".hm").textContent = moves; const [a, c] = open; lock = true;
          if (tiles[a.dataset.j].k === tiles[c.dataset.j].k) { setTimeout(() => { a.classList.add("matched"); c.classList.add("matched"); MOTION.pop(a); MOTION.pop(c); open = []; lock = false; found++;
            if (found === 6) { const sec = Math.round((Date.now() - t0) / 1000); finish(Math.max(20, 200 - moves * 6 - sec), `${moves} moves in ${sec} seconds.`); } }, 250); }
          else setTimeout(() => { a.classList.remove("open"); c.classList.remove("open"); open = []; lock = false; }, 800);
        }
      });
    } else if (id === "diktat") {
      const pool = shuffled(sentencePool()).slice(0, 5); let i = 0, score = 0;
      const round = () => {
        if (i >= pool.length) return finish(score, "Listening every day is the fastest way to understand colleagues on the phone.");
        const sent = pool[i];
        box.innerHTML = hud(`<span>Satz <b>${i + 1}/5</b></span>`) + `<div class="dk"><button class="btn big-play" id="play">${ICON("speaker")}Play</button><button class="btn ghost" id="slow">Slower</button>
          <textarea id="dkin" rows="2" placeholder="Type what you hear..." autocapitalize="sentences"></textarea><button class="btn" id="dkok">Check</button><div class="dkres"></div></div>`;
        box.querySelector(".hs").textContent = score;
        const say = (rate) => { if (!("speechSynthesis" in window)) return; speechSynthesis.cancel(); const u = new SpeechSynthesisUtterance(sent); u.lang = "de-DE"; u.rate = rate; const v = speechSynthesis.getVoices().find((x) => x.lang && x.lang.startsWith("de")); if (v) u.voice = v; speechSynthesis.speak(u); };
        box.querySelector("#play").onclick = () => say(.95); box.querySelector("#slow").onclick = () => say(.7); say(.95);
        box.querySelector("#dkok").onclick = () => {
          const clean = (x) => x.toLowerCase().replace(/[.,!?;:]/g, "").split(/\s+/).filter(Boolean);
          const want = clean(sent), got = clean(box.querySelector("#dkin").value); let right = 0;
          const marked = sent.split(/\s+/).map((w, k) => { const ok = got[k] === clean(w)[0]; if (ok) right++; return `<span class="${ok ? "wok" : "wno"}">${esc(w)}</span>`; }).join(" ");
          const pts = Math.round(right / want.length * 30); score += pts;
          box.querySelector(".dkres").innerHTML = `<p class="dkline">${marked}</p><p class="muted small">+${pts} points</p><button class="btn" id="dknext">Next</button>`;
          box.querySelector("#dknext").onclick = () => { i++; round(); };
        };
      };
      round();
    } else if (id === "verben") {
      const P = ["ich", "du", "er/sie/es", "wir", "ihr", "sie/Sie"]; let score = 0, n = 0, over = false;
      box.innerHTML = hud(`<span>Streak <b class="hc">0</b></span>`) + `<div class="tbar"><i></i></div><div class="gq"></div><input id="vin" class="vin" autocomplete="off" autocapitalize="off" spellcheck="false" placeholder="Type the form..."><p class="gfb2 muted"></p>`;
      const q = box.querySelector(".gq"), inp = box.querySelector("#vin"), fb = box.querySelector(".gfb2"); let cur, streakN = 0;
      const next = () => { const v = VERBS[Math.floor(Math.random() * VERBS.length)], kind = ["pr", "pr", "pt", "pf"][Math.floor(Math.random() * 4)], p = Math.floor(Math.random() * 6);
        cur = kind === "pr" ? { a: v[2][p], q: `${P[p]} ___`, h: "Präsens" } : kind === "pt" ? { a: v[3], q: `er ___`, h: "Präteritum" } : { a: v[4] + " " + v[5], q: `er ___ ___`, h: "Perfekt (haben or sein + Partizip)" };
        q.innerHTML = `<span class="gw">${esc(v[0])}</span><small>${esc(v[1])} • ${cur.h}</small><span class="vq2">${esc(cur.q)}</span>`; inp.value = ""; inp.focus({ preventScroll: true });
        MOTION.animate(q, [{ transform: "translateX(20px)", opacity: 0 }, { transform: "none", opacity: 1 }], { duration: 180 }); };
      inp.addEventListener("keydown", (e) => { if (e.key !== "Enter" || over) return; e.preventDefault(); n++;
        const ok = inp.value.trim().toLowerCase().replace(/\s+/g, " ") === cur.a.toLowerCase();
        if (ok) { streakN++; score += 10 + Math.min(streakN, 10) * 2; fb.textContent = "Richtig!"; MOTION.pop(q); } else { streakN = 0; fb.innerHTML = `Richtig wäre: <b>${esc(cur.a)}</b>`; MOTION.shake(inp); }
        box.querySelector(".hs").textContent = score; box.querySelector(".hc").textContent = streakN; next(); });
      next(); timer(75, () => { over = true; finish(score, `${n} verbs answered. Watch out for sein in the Perfekt: gehen, fahren, kommen, bleiben, passieren.`); });
    } else if (id === "satz") {
      const pool = shuffled(sentencePool()).slice(0, 6); let i = 0, score = 0; const t0 = Date.now();
      const round = () => {
        if (i >= pool.length) { const sec = Math.round((Date.now() - t0) / 1000); return finish(score + Math.max(0, 120 - sec), `Finished in ${sec} seconds.`); }
        const words = pool[i].split(" ");
        box.innerHTML = hud(`<span>Satz <b>${i + 1}/${pool.length}</b></span>`) + `<div class="ord"><div class="ord-line"></div><div class="ord-bank">${shuffled(words).map((w) => `<button class="chip" data-w="${esc(w)}">${esc(w)}</button>`).join("")}</div><div class="ord-act"><button class="btn ghost" id="skip">Skip</button><span class="ord-fb"></span></div></div>`;
        box.querySelector(".hs").textContent = score;
        const line = box.querySelector(".ord-line");
        box.querySelector(".ord-bank").onclick = (e) => { const b = e.target.closest(".chip"); if (!b || b.disabled) return; const c = b.cloneNode(true); c.onclick = () => { c.remove(); b.disabled = false; }; b.disabled = true; line.appendChild(c);
          if (line.children.length === words.length) { const ok = [...line.children].map((x) => x.dataset.w).join(" ") === pool[i];
            box.querySelector(".ord-fb").textContent = ok ? "Richtig!" : pool[i]; (ok ? MOTION.pop : MOTION.shake)(line); if (ok) score += 25; setTimeout(() => { i++; round(); }, ok ? 600 : 1800); } };
        box.querySelector("#skip").onclick = () => { i++; round(); };
      };
      round();
    }
  };

  /* ---------- German course ---------- */
  const DL = (window.DEUTSCH && DEUTSCH.levels) || [];
  const PLANNED = [["A1.1", "A1", "Greetings, family, shopping, flat, daily routine, free time"], ["A1.2", "A1", "Health, directions, travel, weather, clothes, celebrations"],
    ["A2.2", "A2", "Media, travel, money, services, relationships"], ["B1.2", "B1", "Work life, society, politics, environment, culture"], ["B2", "B2", "Job interviews, presentations, formal writing"]];
  const allUnits = () => DL.flatMap((l) => l.units.map((u) => Object.assign({ level: l.id }, u)));
  const unitById = (id) => allUnits().find((u) => u.id === id);
  const unitDone = (u) => !!S.done["de-" + u.id];
  const levelPct = (l) => Math.round(l.units.filter(unitDone).length / l.units.length * 100);
  views.german = function () {
    const order = ["A1.1", "A1.2", "A2.1", "A2.2", "B1.1", "B1.2", "B2"];
    const rows = order.map((id) => { const l = DL.find((x) => x.id === id); const p = PLANNED.find((x) => x[0] === id); return l ? { l } : { p }; });
    const next = allUnits().find((u) => !unitDone(u) && S.pos["du-" + u.id] != null) || DL.flatMap((l) => l.units).find((u) => !unitDone(u));
    return `<h1 class="page-title">Deutsch für den Beruf</h1><p class="muted lead-p">Lesson by lesson: words, grammar, exercises and your own sentences. Each level is harder than the one before. Speak with the KI partner at your level whenever you like.</p>
      <div class="bento">
        ${next ? `<a class="card task wide cont" href="#/dunit/${esc(next.id)}"><span class="tic">${ICON("play")}</span><span class="corner">${ICON("arrowRight")}</span><p class="pl-label">Continue</p><h3>${esc(unitById(next.id).level)} Lektion ${next.n}: ${esc(next.title)}</h3><p class="muted small" style="margin:0">${esc(next.goal)}</p></a>` : ""}
        <a class="card task wide" href="#/arcade"><span class="tic">${ICON("target")}</span><span class="corner">${ICON("arrowRight")}</span><p class="pl-label">Deutsch Arcade</p><h3>Play: der/die/das, Memory, Diktat, Verben</h3><p class="muted small" style="margin:0">Fast games, every point is XP</p></a>
        <button class="card task wide" data-open-ki="de" style="text-align:left;font:inherit;cursor:pointer;width:100%"><span class="tic">${ICON("mic")}</span><span class="corner">${ICON("spark")}</span><p class="pl-label">KI-Gesprächspartner</p><h3>Speak and write with corrections</h3><p class="muted small" style="margin:0">Stays at your level, asks you questions, corrects every mistake</p></button>
        <button class="card task wide" data-open-de style="text-align:left;font:inherit;cursor:pointer;width:100%"><span class="tic">${ICON("cards")}</span><span class="corner">${ICON("expand")}</span><p class="pl-label">Flashcards</p><h3>${germanDue().length} cards due today</h3><p class="muted small" style="margin:0">Words from your lessons plus workplace phrases</p></button>
        <a class="card task wide" href="#/handbook"><span class="tic">${ICON("chat")}</span><span class="corner">${ICON("arrowRight")}</span><p class="pl-label">At work</p><h3>German phrases for real tickets</h3><p class="muted small" style="margin:0">Every handbook fix has a sentence for the user</p></a>
      </div>
      <div class="sec-h"><h2>${T("Levels")}</h2><span class="muted small">A1 to B2</span></div>
      <div class="levels">${rows.map((r) => r.l ? `<section class="card lvlcard"><div class="lvlhead"><span class="lvlbadge">${esc(r.l.id)}</span><div><h3>${esc(r.l.title)}</h3><p class="muted small">${esc(r.l.note)}</p></div><span class="cpct2">${levelPct(r.l)}%</span></div>
          <div class="cprog"><i style="width:${levelPct(r.l)}%"></i></div>
          <ol class="units">${r.l.units.map((u) => `<li><a href="#/dunit/${esc(u.id)}" class="${unitDone(u) ? "done" : ""}"><span class="pn">${unitDone(u) ? ICON("check") : u.n}</span><span><strong>${esc(u.title)}</strong><small>${esc(u.grammar.map((g) => g.t).join(" • "))}</small></span></a></li>`).join("")}</ol></section>`
        : `<section class="card lvlcard soon"><div class="lvlhead"><span class="lvlbadge">${esc(r.p[0])}</span><div><h3>${esc(r.p[0])}</h3><p class="muted small">${esc(r.p[2])}</p></div><span class="lvl">${T("Being written")}</span></div></section>`).join("")}</div>`;
  };
  views.german.after = function () { MOTION.stagger(view.querySelectorAll(".bento > .card, .lvlcard"), 40); };

  function vocabHTML(list) {
    return `<ul class="vlist">${list.map(([de, en, ex]) => `<li><div class="vw"><strong>${esc(de)}</strong>${sayBtn(de.split(",")[0].replace(/\s*\(.*\)/, ""))}</div><span class="muted">${esc(en)}</span>${ex ? `<p class="vex">${esc(ex)} ${sayBtn(ex)}</p>` : ""}</li>`).join("")}</ul>`;
  }
  function grammarHTML(g) {
    return `<p>${esc(g.rule)}</p>${g.table ? `<div class="table"><table><thead><tr>${g.table[0].map((c) => `<th>${esc(c)}</th>`).join("")}</tr></thead><tbody>${g.table.slice(1).map((r) => `<tr>${r.map((c, i) => i ? `<td>${esc(c)}</td>` : `<th>${esc(c)}</th>`).join("")}</tr>`).join("")}</tbody></table></div>` : ""}
      <h3>Beispiele</h3><ul class="dex">${g.ex.map(([d, e]) => `<li><span class="de-line">${esc(d)}</span> ${/[äöüßa-z]/i.test(d) && !/^(Spoken|Compare|Mixed|No zu|Same)/.test(d) ? sayBtn(d) : ""}<br><span class="muted small">${esc(e)}</span></li>`).join("")}</ul>`;
  }
  const norm = (x) => String(x).trim().replace(/\s+/g, " ").replace(/[.!?]$/, "");
  function gapsHTML(drills) {
    return `<p class="muted">Type the missing word. Press Check.</p><ol class="gaps">${drills.map((d, i) => `<li data-i="${i}"><p>${esc(d.gap).replace("___", `<input class="gapin" aria-label="Answer ${i + 1}" autocomplete="off" autocapitalize="off" spellcheck="false">`)}</p><p class="gfb muted small"></p></li>`).join("")}</ol>
      <button class="btn gapcheck">Check</button><p class="result gres"></p>`;
  }
  function orderHTML(d, i) {
    const shuffledWords = shuffled(d.order);
    return `<div class="ord" data-i="${i}"><div class="ord-line" aria-label="Your sentence"></div><div class="ord-bank">${shuffledWords.map((w, k) => `<button class="chip" data-w="${esc(w)}" data-k="${k}">${esc(w)}</button>`).join("")}</div>
      <div class="ord-act"><button class="btn ghost ord-reset">Start again</button><span class="ord-fb"></span></div>${d.h ? `<p class="muted small">${esc(d.h)}</p>` : ""}</div>`;
  }
  function writeHTML(d, i, key) {
    const saved = S.notes[key + "-w" + i] || "";
    return `<div class="wr" data-i="${i}"><p class="wr-task"><strong>${esc(d.write)}</strong></p>
      <textarea class="wr-in" rows="3" placeholder="Schreib hier deine Sätze..." aria-label="Your sentences">${esc(saved)}</textarea>
      <div class="ord-act"><button class="btn wr-send">${KI.hasKey() ? "Check with KI" : "Submit"}</button><span class="wr-state muted small">${saved ? "Saved" : ""}</span></div><div class="wr-fb"></div></div>`;
  }

  views.dunit = function (id) {
    const u = unitById(id); if (!u) return notFound();
    return `<p class="kicker"><a href="#/german">Deutsch</a> / ${esc(u.level)}</p><h1 class="page-title">Lektion ${u.n}: ${esc(u.title)}</h1><div id="player"></div>`;
  };
  views.dunit.after = function (id) {
    const u = unitById(id); if (!u) return;
    const key = "du-" + u.id;
    const half = Math.ceil(u.vocab.length / 2);
    const gaps = u.drills.filter((d) => d.gap), orders = u.drills.filter((d) => d.order), writes = u.drills.filter((d) => d.write);
    const steps = [];
    steps.push({ title: "Was du lernst", label: `${u.level} • Lektion ${u.n}`, html: `<p>${esc(u.goal)}</p><h3>Grammatik</h3><ul>${u.grammar.map((g) => `<li>${esc(g.t)}</li>`).join("")}</ul>
      <h3>So geht's</h3><ol class="steps"><li>Learn the words and listen to them.</li><li>Read the grammar with the examples.</li><li>Do the exercises.</li><li>Write your own sentences: the lesson is finished only when you have written them.</li></ol>` });
    steps.push({ title: "Wortschatz 1", label: `${half} Wörter`, html: `<p class="muted">Tap the speaker and repeat out loud. These words go into your flashcards.</p>${vocabHTML(u.vocab.slice(0, half))}` });
    steps.push({ title: "Wortschatz 2", label: `${u.vocab.length - half} Wörter`, html: vocabHTML(u.vocab.slice(half)) });
    steps.push({ title: "Wörter-Quiz", label: "Fun check", html: "", after: (art) => vocabQuiz(art.querySelector(".pl-body"), u) });
    u.grammar.forEach((g, gi) => steps.push({ title: g.t, label: `Grammatik ${gi + 1} von ${u.grammar.length}`, html: grammarHTML(g) }));
    if (gaps.length) steps.push({ title: "Übung: Lücken füllen", label: "Exercises", html: gapsHTML(gaps), after: (art) => wireGaps(art, gaps, key) });
    if (orders.length) steps.push({ title: "Übung: Satzbau", label: "Word order", html: `<p class="muted">Tap the words in the right order.</p>${orders.map((d, i) => orderHTML(d, i)).join("")}`, after: (art) => wireOrders(art, orders) });
    if (writes.length) steps.push({ title: "Sätze bauen", label: "Write your own", html: `<p>Now it is your turn. Write real sentences about YOUR life.${KI.hasKey() ? " The KI checks each one and explains mistakes." : " After submitting, compare with the model answer and correct yourself. (Add your KI key to get personal corrections.)"}</p>${writes.map((d, i) => writeHTML(d, i, key)).join("")}`, after: (art) => wireWrites(art, writes, key, u) });
    steps.push({ title: "Lektion abschließen", label: "Finish", html: "", after: (art) => {
      const missing = writes.filter((_, i) => !S.notes[key + "-w" + i]).length;
      const body = art.querySelector(".pl-body");
      if (missing) { body.innerHTML = `<div class="done-hero"><span class="done-mark warn">${ICON("alert")}</span><p>Write your own sentences first: ${missing} task${missing > 1 ? "s" : ""} still empty.</p></div><p style="text-align:center"><button class="btn ghost" data-go-back>Back to Sätze bauen</button></p>`;
        body.querySelector("[data-go-back]").onclick = () => document.querySelector(".pl-back").click(); return; }
      S.done["de-" + u.id] = true; save();
      body.innerHTML = `<div class="done-hero"><span class="done-mark">${ICON("check")}</span><p>Lektion ${u.n} geschafft! Super gemacht.</p></div><p class="muted" style="text-align:center">Your new words are now in your flashcards. Practise speaking this topic with the KI partner.</p>
        <p style="text-align:center"><button class="btn" data-open-ki="de">Talk about "${esc(u.title)}" with KI</button></p>`;
      MOTION.pop(body.querySelector(".done-mark"));
    } });
    const lvl = DL.find((l) => l.id === u.level), idx = lvl.units.indexOf(lvl.units.find((x) => x.id === u.id)), nxt = lvl.units[idx + 1];
    mountPlayer($("#player"), { key, steps, kiMode: "de", finishLabel: nxt ? "Next lesson" : "Back to Deutsch",
      onFinish: () => { if (!unitDone(u)) return; location.hash = nxt ? `#/dunit/${nxt.id}` : "#/german"; } });
  };

  function vocabQuiz(body, u) {
    const pool = shuffled(u.vocab).slice(0, 6); let i = 0, score = 0;
    const draw = () => {
      if (i >= pool.length) { body.innerHTML = `<div class="done-hero"><span class="done-mark">${ICON("trophy")}</span><p>${score} of ${pool.length} right.${score === pool.length ? " Perfekt!" : " Review the words you missed in your flashcards."}</p></div>`; MOTION.pop(body.querySelector(".done-mark")); return; }
      const q = pool[i], wrong = shuffled(u.vocab.filter((v) => v !== q)).slice(0, 3), opts = shuffled([q].concat(wrong));
      body.innerHTML = `<p class="pl-label">Wort ${i + 1} von ${pool.length}</p><p class="vq">${esc(q[1])}</p><div class="vqopts">${opts.map((o) => `<button class="chip big" data-ok="${o === q ? 1 : 0}">${esc(o[0].split(",")[0])}</button>`).join("")}</div>`;
      MOTION.step(body, 1);
      body.querySelectorAll("[data-ok]").forEach((b) => b.onclick = () => {
        const ok = b.dataset.ok === "1"; if (ok) score++;
        b.classList.add(ok ? "good" : "bad"); (ok ? MOTION.pop : MOTION.shake)(b);
        body.querySelectorAll("[data-ok]").forEach((x) => { x.disabled = true; if (x.dataset.ok === "1") x.classList.add("good"); });
        setTimeout(() => { i++; draw(); }, ok ? 650 : 1300);
      });
    };
    draw();
  }
  function wireGaps(art, gaps, key) {
    art.querySelector(".gapcheck").onclick = () => {
      let right = 0;
      art.querySelectorAll(".gaps li").forEach((li, i) => {
        const inp = li.querySelector("input"), d = gaps[i], ans = [].concat(d.a), ok = ans.some((x) => norm(x) === norm(inp.value));
        inp.classList.toggle("good", ok); inp.classList.toggle("bad", !ok);
        li.querySelector(".gfb").innerHTML = ok ? "" : `Answer: <b>${esc(ans[0])}</b>${d.h ? " • " + esc(d.h) : ""}`;
        if (ok) right++; else MOTION.shake(inp);
      });
      art.querySelector(".gres").textContent = `${right} / ${gaps.length} correct`;
      S.quiz[key.replace("du-", "de-")] = Math.max(right, S.quiz[key.replace("du-", "de-")] || 0); save();
    };
    art.querySelectorAll(".gapin").forEach((inp) => inp.addEventListener("keydown", (e) => { if (e.key === "Enter") { e.preventDefault(); art.querySelector(".gapcheck").click(); } }));
  }
  function wireOrders(art, orders) {
    art.querySelectorAll(".ord").forEach((box) => {
      const d = orders[+box.dataset.i], line = box.querySelector(".ord-line"), fb = box.querySelector(".ord-fb");
      const check = () => {
        const built = [...line.children].map((c) => c.dataset.w).join(" ");
        if (line.children.length === d.order.length) {
          const ok = norm(built) === norm(d.a);
          fb.textContent = ok ? "Richtig!" : "Not yet: " + d.a; fb.className = "ord-fb " + (ok ? "ok" : "no");
          (ok ? MOTION.pop : MOTION.shake)(line);
        } else { fb.textContent = ""; fb.className = "ord-fb"; }
      };
      box.querySelector(".ord-bank").onclick = (e) => { const b = e.target.closest(".chip"); if (!b || b.disabled) return; const c = b.cloneNode(true); c.onclick = () => { c.remove(); b.disabled = false; check(); }; b.disabled = true; line.appendChild(c); MOTION.animate(c, [{ transform: "scale(.8)", opacity: 0 }, { transform: "none", opacity: 1 }], { duration: 180 }); check(); };
      box.querySelector(".ord-reset").onclick = () => { line.innerHTML = ""; box.querySelectorAll(".ord-bank .chip").forEach((b) => (b.disabled = false)); check(); };
    });
  }
  function wireWrites(art, writes, key, u) {
    art.querySelectorAll(".wr").forEach((box) => {
      const i = +box.dataset.i, d = writes[i], inp = box.querySelector(".wr-in"), state = box.querySelector(".wr-state"), fb = box.querySelector(".wr-fb");
      box.querySelector(".wr-send").onclick = async () => {
        const txt = inp.value.trim();
        if (txt.split(/\s+/).length < 4) { state.textContent = "Please write at least one full sentence."; MOTION.shake(inp); return; }
        S.notes[key + "-w" + i] = txt.slice(0, 2000); save(); state.textContent = "Saved";
        if (KI.hasKey()) {
          fb.innerHTML = '<p class="ki-typing"><i></i><i></i><i></i></p>';
          try { const r = await KI.checkSentence(d.write, txt, u.level.slice(0, 2)); fb.innerHTML = r ? `<div class="wr-ki">${KI.fmt(r)}</div><p class="muted small">Model answer: ${esc(d.m)}</p>` : `<p class="muted small">Model answer: ${esc(d.m)}</p>`; }
          catch (e) { fb.innerHTML = `<p class="ki-err">KI check failed. Compare with the model answer:</p><p class="de-line">${esc(d.m)}</p>`; }
        } else fb.innerHTML = `<p class="muted small">Compare and correct yourself. Model answer:</p><p class="de-line">${esc(d.m)} ${sayBtn(d.m)}</p>`;
        MOTION.animate(fb, [{ opacity: 0, transform: "translateY(6px)" }, { opacity: 1, transform: "none" }], { duration: 240 });
      };
    });
  }

  views.settings = function () {
    return `<h1>Progress &amp; sync</h1>
      <section class="card"><h2>${T("Language")}</h2><p class="muted">Menus and buttons. Course content is translated step by step.</p><div class="langsw big"><button data-lang="en" class="${I18N.lang === "en" ? "on" : ""}">English</button><button data-lang="de" class="${I18N.lang === "de" ? "on" : ""}">Deutsch</button></div></section>
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



  /* ---------- Game layer: XP, ranks, streak, badges ---------- */
  window.GAME = (function () {
    const RANKS = [[0, "Ping"], [300, "Packet Pusher"], [800, "Help Desk Hero"], [1600, "Ticket Tamer"], [2800, "Root Cause Ranger"], [4500, "Sysadmin Sage"], [6500, "Network Ninja"], [9000, "Cloud Captain"], [12000, "Infrastructure Legend"]];
    function xp() {
      let x = S.xp || 0;
      (window.COURSES || []).forEach((c) => c.modules.forEach((m) => { const k = `c-${c.id}-${m.id}`; if (S.done[k]) x += 100; x += (S.quiz[k] || 0) * 10; }));
      (window.DEUTSCH ? DEUTSCH.levels : []).forEach((l) => l.units.forEach((u) => { if (S.done["de-" + u.id]) x += 120; x += (S.quiz["de-" + u.id] || 0) * 10; }));
      Object.keys(S.done).forEach((k) => { if (k.startsWith("lab-")) x += 150; else if (/^\d+-\d+-(teach|learn|lab|check)$/.test(k)) x += 25; });
      Object.values(S.itil).forEach((v) => { x += v * 10; });
      Object.values(S.tickets).forEach((v) => { x += v * 10; });
      return x;
    }
    function rank(x) {
      let i = 0; while (i + 1 < RANKS.length && x >= RANKS[i + 1][0]) i++;
      const next = RANKS[i + 1];
      return { level: i + 1, name: RANKS[i][1], from: RANKS[i][0], to: next ? next[0] : null, next: next ? next[1] : null };
    }
    const iso = (d) => d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0");
    function streak() {
      const d = new Date(); let n = 0;
      if (!S.days[iso(d)]) d.setDate(d.getDate() - 1);
      while (S.days[iso(d)]) { n++; d.setDate(d.getDate() - 1); }
      return n;
    }
    function badges() {
      const done = Object.keys(S.done), mods = done.filter((k) => k.startsWith("c-")).length, des = done.filter((k) => k.startsWith("de-")).length, labs = done.filter((k) => k.startsWith("lab-")).length;
      const best = +(localStorage.getItem("itsa-subnet-best") || 0), st = streak();
      return [
        ["First steps", "Finish your first module", mods >= 1], ["Bookworm", "Finish 10 modules", mods >= 10], ["Half-way hero", "Finish 25 modules", mods >= 25],
        ["Hello, CLI", "Complete a Cisco lab", labs >= 1], ["Config wizard", "Complete all four Cisco labs", labs >= 4],
        ["Subnet sniper", "10 subnets right in a row", best >= 10], ["Deutsch-Starter", "Finish a German lesson", des >= 1], ["Sprachtalent", "Finish 7 German lessons", des >= 7],
        ["On fire", "3-day streak", st >= 3], ["Unstoppable", "7-day streak", st >= 7], ["Habit formed", "30-day streak", st >= 30]
      ].map(([t, d, ok]) => ({ t, d, ok }));
    }
    function card() {
      const x = xp(), r = rank(x), st = streak(), b = badges(), got = b.filter((z) => z.ok).length;
      const pct = r.to ? Math.round((x - r.from) / (r.to - r.from) * 100) : 100;
      return `<section class="card pcard">
        <div class="prank"><span class="plvl">${r.level}</span><div><p class="pl-label">${T("Rank")}</p><h3>${esc(r.name)}</h3></div></div>
        <div class="pxp"><div class="pxp-top"><b><span class="num" data-to="${x}">${x}</span> XP</b><span class="muted small">${r.next ? `${r.to - x} ${T("XP to")} ${esc(r.next)}` : T("Top rank reached")}</span></div><div class="cprog"><i style="width:${pct}%"></i></div></div>
        <div class="pstats"><span class="pflame ${st ? "on" : ""}" title="Daily streak">${ICON("spark")}<b>${st}</b><small>${T("day streak")}</small></span><a href="#/badges" class="pbadge">${ICON("trophy")}<b>${got}/${b.length}</b><small>${T("badges")}</small></a></div>
      </section>`;
    }
    function toast(n) {
      const t = document.createElement("div"); t.className = "xptoast"; t.innerHTML = `<b>+${n} XP</b>`;
      document.body.appendChild(t);
      MOTION.animate(t, [{ opacity: 0, transform: "translate(-50%, 20px) scale(.8)" }, { opacity: 1, transform: "translate(-50%, 0) scale(1.06)", offset: .25 }, { opacity: 1, transform: "translate(-50%, 0) scale(1)", offset: .8 }, { opacity: 0, transform: "translate(-50%, -16px) scale(.96)" }], { duration: 1500, easing: "cubic-bezier(.34,1.56,.64,1)", fill: "forwards" });
      setTimeout(() => t.remove(), 1600);
    }
    return { xp, rank, streak, badges, card, toast };
  })();

  views.badges = function () {
    const b = GAME.badges();
    return `<p class="kicker"><a href="#/learn">Learn</a></p><h1 class="page-title">${T("Badges")}</h1>${GAME.card()}
      <div class="bgrid">${b.map((z) => `<div class="card bdg ${z.ok ? "ok" : ""}"><span class="bico">${ICON(z.ok ? "trophy" : "target")}</span><h3>${esc(z.t)}</h3><p class="muted small">${esc(z.d)}</p></div>`).join("")}</div>`;
  };
  views.badges.after = function () { view.querySelectorAll(".num[data-to]").forEach((n) => MOTION.countUp(n, +n.dataset.to)); MOTION.stagger(view.querySelectorAll(".bdg"), 40); };

  /* Journey map: a road through stages to the destination job. */
  function journeyHTML(t) {
    const J = (window.JOURNEYS || {})[t.id]; if (!J) return "";
    const C = (id) => (window.COURSES || []).find((c) => c.id === id);
    let current = null;
    J.stages.forEach((sg) => sg.courses.forEach((id) => { const c = C(id); if (c && !current && coursePct(c) < 100) current = id; }));
    const stage = (sg, si) => {
      const n = sg.courses.length, H = n * 132;
      const pts = sg.courses.map((_, i) => [i % 2 ? 72 : 28, 66 + i * 132]);
      const d = pts.map((p, i) => i ? `C ${pts[i - 1][0]} ${p[1] - 70}, ${p[0]} ${pts[i - 1][1] + 70}, ${p[0]} ${p[1]}` : `M 50 0 C 50 30, ${p[0]} ${p[1] - 40}, ${p[0]} ${p[1]}`).join(" ") + ` C ${pts[n - 1][0]} ${pts[n - 1][1] + 40}, 50 ${H - 30}, 50 ${H}`;
      const done = sg.courses.every((id) => { const c = C(id); return c && coursePct(c) === 100; });
      return `<section class="jstage ${done ? "done" : ""}">
        <header class="jhead"><span class="jnum">${si + 1}</span><div><h3>${esc(sg.title)}</h3><p class="muted small">${esc(sg.tag)}</p></div></header>
        <div class="jroad" style="height:${H}px">
          <svg class="jsvg" viewBox="0 0 100 ${H}" preserveAspectRatio="none" aria-hidden="true"><path d="${d}" class="jpath-bg"/><path d="${d}" class="jpath"/></svg>
          ${sg.courses.map((id, i) => { const c = C(id); if (!c) return ""; const p = coursePct(c); const st = p === 100 ? "done" : id === current ? "now" : p ? "started" : "";
            return `<a class="jnode ${st} ${i % 2 ? "r" : "l"}" href="#/course/${esc(c.id)}" style="top:${pts[i][1]}px;left:${pts[i][0]}%">
              <span class="jdot" style="--p:${p}">${ICON(p === 100 ? "check" : c.icon || "book")}</span>
              <span class="jlbl"><strong>${esc(c.title)}</strong><small>${p}% • ${c.modules.length} modules${id === current ? " • " + T("you are here") : ""}</small></span></a>`; }).join("")}
        </div>
        ${sg.check ? `<div class="jcheck">${ICON("badge")}<span>${T("Checkpoint")}: <b>${esc(sg.check)}</b></span></div>` : ""}
      </section>`;
    };
    return `<div class="journey">${J.stages.map(stage).join("")}<div class="jdest"><span class="jtrophy">${ICON("trophy")}</span><p class="pl-label">${T("Destination")}</p><h2>${esc(J.dest)}</h2><p class="muted">${T("Job-ready. Time to send those applications.")}</p></div></div>`;
  }
  function animateJourney() {
    if (MOTION.reduce()) return;
    view.querySelectorAll(".jpath").forEach((p, i) => { const len = p.getTotalLength(); p.style.strokeDasharray = len; MOTION.animate(p, [{ strokeDashoffset: len }, { strokeDashoffset: 0 }], { duration: 900, delay: 150 + i * 180, easing: "cubic-bezier(.65,0,.35,1)" }); });
    MOTION.stagger(view.querySelectorAll(".jnode, .jcheck, .jdest"), 70);
  }

  /* ---------- Learn: career tracks, courses, modules ---------- */
  const COURSES = window.COURSES || [], TRACKS = window.TRACKS || [];
  const course = (id) => COURSES.find((c) => c.id === id);
  const modKey = (cid, mid) => `c-${cid}-${mid}`;
  const modLevel = (c, m) => m.level || (c.level === "Beginner" ? "Foundation" : "Professional");
  const coursePct = (c) => Math.round(c.modules.filter((m) => S.done[modKey(c.id, m.id)]).length / c.modules.length * 100);
  const trackPct = (t) => { const cs = t.courses.map(course).filter(Boolean); const all = cs.reduce((n, c) => n + c.modules.length, 0); const d = cs.reduce((n, c) => n + c.modules.filter((m) => S.done[modKey(c.id, m.id)]).length, 0); return all ? Math.round(d / all * 100) : 0; };
  const levelPill = (l) => `<span class="lvl lvl-${l.toLowerCase()}">${l}</span>`;
  function nextModule(c) { return c.modules.find((m) => !S.done[modKey(c.id, m.id)]) || c.modules[0]; }
  function courseCard(c) {
    const pct = coursePct(c);
    return `<a class="card ccard" href="#/course/${esc(c.id)}"><span class="tic">${ICON(c.icon || "book")}</span>
      <h3>${esc(c.title)}</h3><p class="muted small">${esc(c.short)}</p>
      <div class="cmeta"><span>${c.modules.length} modules</span><span>${c.hours} h</span>${c.modules.some((m) => m.level === "Senior") ? levelPill("Senior") : ""}</div>
      <div class="cprog"><i style="width:${pct}%"></i></div><span class="cpct">${pct}%</span></a>`;
  }
  views.learn = function () {
    return `<h1 class="page-title">${T("Learn")}</h1><p class="muted lead-p">Pick a career track and follow the road. Every module ends with a quiz, every stage with a checkpoint, and senior modules go deep.</p>${GAME.card()}
      <div class="tracks">${TRACKS.map((t) => `<a class="card track" href="#/track/${esc(t.id)}"><p class="pl-label">${T("Career track")}</p><h2>${esc(t.title)}</h2><p class="muted">${esc(t.role)}</p>
        <div class="tprog"><span class="num" data-to="${trackPct(t)}">${trackPct(t)}</span><small>% done</small></div><div class="cprog"><i style="width:${trackPct(t)}%"></i></div>
        <p class="small muted">${t.courses.length} courses • ${esc(t.certs[0])}${t.certs.length > 1 ? " and more" : ""}</p></a>`).join("")}</div>
      <div class="sec-h"><h2>${T("Courses by subject")}</h2><span class="muted small">${COURSES.length} courses, ${COURSES.reduce((n, c) => n + c.modules.length, 0)} modules, ${COURSES.reduce((n, c) => n + c.modules.reduce((k, m) => k + m.quiz.length, 0), 0)} quiz questions</span></div>
      <nav class="areanav">${(window.AREAS || []).map((a) => `<a href="#area-${a.id}" class="chip">${esc(a.title)}</a>`).join("")}<a href="#area-more" class="chip">Languages and ITIL</a></nav>
      ${(window.AREAS || []).map((a) => `<section class="area" id="area-${a.id}"><h3 class="area-h">${esc(a.title)}</h3><div class="cgrid">${a.courses.map(course).filter(Boolean).map(courseCard).join("")}</div></section>`).join("")}
      <section class="area" id="area-more"><h3 class="area-h">Languages and service management</h3></section>
      <div class="cgrid">
        <a class="card ccard" href="#/itil"><span class="tic">${ICON("badge")}</span><h3>ITIL Foundation</h3><p class="muted small">IT service management: 8 lessons and a 40-question mock exam.</p></a>
        <a class="card ccard" href="#/german"><span class="tic">${ICON("language")}</span><h3>German for IT jobs</h3><p class="muted small">Phone support, tickets, interviews; flashcards with spaced repetition.</p></a>
        <a class="card ccard" href="#/plan"><span class="tic">${ICON("calendar")}</span><h3>8-week quick start</h3><p class="muted small">Optional guided plan with a home lab, if you want a fixed schedule.</p></a>
      </div>`;
  };
  views.learn.after = function () { view.querySelectorAll(".num[data-to]").forEach((n) => MOTION.countUp(n, +n.dataset.to)); MOTION.stagger(view.querySelectorAll(".track, .ccard"), 35); };

  views.track = function (id) {
    const t = TRACKS.find((x) => x.id === id); if (!t) return notFound();
    return `<p class="kicker"><a href="#/learn">Learn</a> / Career track</p><h1 class="page-title">${esc(t.title)}</h1>
      <p class="lead-p">${esc(t.goal)}</p>
      <section class="card"><p class="pl-label">${T("Certifications to aim for")}</p><ul class="certs">${t.certs.map((c) => `<li>${ICON("badge")}<span>${esc(c)}</span></li>`).join("")}</ul>
        <p class="muted small" style="margin:10px 0 0">Exam details change: confirm the current version on the vendor's website before you book.</p></section>
      <div class="sec-h"><h2>${T("Your road")}</h2><span class="muted small">${trackPct(t)}% ${T("of the way")}</span></div>
      ${journeyHTML(t)}`;
  };
  views.track.after = function () { animateJourney(); };

  views.course = function (id) {
    const c = course(id); if (!c) return notFound();
    const nm = nextModule(c), pct = coursePct(c);
    return `<p class="kicker"><a href="#/learn">Learn</a> / Course</p><h1 class="page-title">${esc(c.title)}</h1>
      <p class="lead-p">${esc(c.short)}</p>
      <div class="cmeta big"><span>${ICON("book")}${c.modules.length} modules</span><span>${ICON("clock")}about ${c.hours} hours</span><span>${ICON("badge")}${esc(c.cert)}</span></div>
      <div class="cprog lg"><i style="width:${pct}%"></i></div>
      <a class="go" href="#/module/${esc(c.id)}/${esc(nm.id)}" style="max-width:420px"><span class="dot">${ICON("play")}</span>${pct ? (pct === 100 ? T("Review the course") : T("Continue") + ": " + esc(nm.title)) : T("Start the course")}<span class="chev">${ICON("chevrons")}</span></a>
      <div class="sec-h"><h2>${T("Modules")}</h2></div>
      <ol class="mods">${c.modules.map((m, i) => { const d = S.done[modKey(c.id, m.id)], q = S.quiz[modKey(c.id, m.id)];
        return `<li><a class="card mod ${d ? "done" : ""}" href="#/module/${esc(c.id)}/${esc(m.id)}"><span class="pn">${d ? ICON("check") : i + 1}</span>
          <span class="mt"><strong>${esc(m.title)}</strong><small>${levelPill(modLevel(c, m))}${q != null ? `<span class="qs">Quiz ${q}/${m.quiz.length}</span>` : ""}</small></span></a></li>`; }).join("")}</ol>`;
  };
  views.course.after = function () { MOTION.stagger(view.querySelectorAll(".mods li"), 40); };

  views.module = function (cid, mid) {
    const c = course(cid); const m = c && c.modules.find((x) => x.id === mid); if (!m) return notFound();
    return `<p class="kicker"><a href="#/learn">Learn</a> / <a href="#/course/${esc(c.id)}">${esc(c.title)}</a></p><h1 class="page-title">${esc(m.title)}</h1>
      <div class="mhead">${levelPill(modLevel(c, m))}<span class="muted small">Module ${c.modules.indexOf(m) + 1} of ${c.modules.length}</span></div><div id="player"></div>`;
  };
  views.module.after = function (cid, mid) {
    const c = course(cid); const m = c && c.modules.find((x) => x.id === mid); if (!m) return;
    const key = modKey(c.id, m.id), idx = c.modules.indexOf(m), nxt = c.modules[idx + 1];
    try { localStorage.setItem("itsa-last", JSON.stringify({ h: `#/module/${c.id}/${m.id}`, t: m.title, c: c.title })); } catch (e) { /* storage full */ }
    const steps = lessonSteps(m.blocks, key);
    let qs = null;
    if (m.quiz && m.quiz.length) steps.push({ title: "Check your understanding", label: "Quiz", html: "", after: (art) => {
      qs = shuffleQs(m.quiz); art.querySelector(".pl-body").innerHTML = quizHTML(key, qs);
      wireQuiz(qs, (sc) => { S.quiz[key] = Math.max(sc, S.quiz[key] || 0); save(); });
    } });
    steps.push({ title: "Module complete", label: "Finish", html: "", after: (art) => {
      S.done[key] = true; save();
      art.querySelector(".pl-body").innerHTML = `<div class="done-hero"><span class="done-mark">${ICON("check")}</span><p>${esc(m.title)} is done.${S.quiz[key] != null ? ` Quiz: ${S.quiz[key]} of ${m.quiz.length}.` : ""}</p></div>
        ${nxt ? `<a class="card row" href="#/module/${esc(c.id)}/${esc(nxt.id)}"><span><strong>Next: ${esc(nxt.title)}</strong><small>${modLevel(c, nxt)} module</small></span></a>` : `<p class="muted" style="text-align:center">You finished every module of ${esc(c.title)}.</p>`}`;
      MOTION.pop(art.querySelector(".done-mark"));
    } });
    mountPlayer($("#player"), { key: key, steps, finishLabel: nxt ? "Next module" : "Back to course",
      onFinish: () => { location.hash = nxt ? `#/module/${c.id}/${nxt.id}` : `#/course/${c.id}`; } });
  };

  /* ---------- Practice hub, CLI labs, subnetting ---------- */
  views.practice = function () {
    const labs = TRAINERS.LABS;
    return `<h1 class="page-title">${T("Practice")}</h1><p class="muted lead-p">Hands-on work is what employers ask about. Do a little every day.</p>
      <div class="sec-h"><h2>${T("Cisco command line")}</h2><span class="muted small">Switch and router simulator</span></div>
      <div class="cgrid">${labs.map((l) => `<a class="card ccard" href="#/cli/${l.id}"><span class="tic">${ICON("server")}</span><h3>${esc(l.title)}</h3><p class="muted small">${esc(l.intro)}</p>${S.done["lab-" + l.id] ? `<div class="cmeta"><span>${ICON("check")}Completed</span></div>` : ""}</a>`).join("")}</div>
      <div class="sec-h"><h2>${T("Trainers")}</h2></div>
      <div class="cgrid">
        <a class="card ccard" href="#/subnet"><span class="tic">${ICON("grid")}</span><h3>Subnetting trainer</h3><p class="muted small">Random IPv4 questions with instant explanations. Aim for 20 in a row.</p></a>
        <a class="card ccard" href="#/tickets"><span class="tic">${ICON("ticket")}</span><h3>Ticket trainer</h3><p class="muted small">Realistic service desk tickets, some in German.</p></a>
        <a class="card ccard" href="#/labs"><span class="tic">${ICON("lab")}</span><h3>Your home lab</h3><p class="muted small">Build real servers on your own PC with Hyper-V.</p></a>
        <a class="card ccard" href="#/interview"><span class="tic">${ICON("chat")}</span><h3>Interview practice</h3><p class="muted small">Technical and behaviour questions with answer hints.</p></a>
      </div>`;
  };
  views.practice.after = function () { MOTION.stagger(view.querySelectorAll(".ccard"), 35); };
  views.cli = function (lab) {
    const l = TRAINERS.LABS.find((x) => x.id === lab) || TRAINERS.LABS[0];
    const i = TRAINERS.LABS.indexOf(l), nx = TRAINERS.LABS[i + 1];
    return `<p class="kicker"><a href="#/practice">Practice</a> / Cisco command line</p><h1 class="page-title">${esc(l.title)}</h1><div id="cli"></div>
      <nav class="pager">${i > 0 ? `<a class="btn ghost" href="#/cli/${TRAINERS.LABS[i - 1].id}">Previous lab</a>` : "<span></span>"}${nx ? `<a class="btn" href="#/cli/${nx.id}">Next lab</a>` : ""}</nav>`;
  };
  views.cli.after = function (lab) {
    const l = TRAINERS.LABS.find((x) => x.id === lab) || TRAINERS.LABS[0];
    TRAINERS.mountCli($("#cli"), l.id, (id) => { if (!S.done["lab-" + id]) { S.done["lab-" + id] = true; save(); } });
  };
  views.subnet = function () { return `<p class="kicker"><a href="#/practice">Practice</a></p><h1 class="page-title">Subnetting trainer</h1><p class="muted lead-p">Type the answers, press Check. For the mask you can type 255.255.255.0 or 24.</p><div id="sn"></div>`; };
  views.subnet.after = function () { TRAINERS.mountSubnet($("#sn")); };

  /* ---------- Software guides ---------- */
  function guideCard(dayKey) {
    const id = (window.GUIDE_FOR || {})[dayKey];
    const g = id && GUIDES.find((x) => x.id === id);
    return g ? `<a class="card row guide-link" href="#/guides/${esc(g.id)}"><span class="wnum">1</span><span><strong>First, the big picture: ${esc(g.title)}</strong><small>${esc(g.short)}</small></span></a>` : "";
  }
  views.guides = function (id) {
    if (id) {
      const g = GUIDES.find((x) => x.id === id); if (!g) return notFound();
      return `<p class="kicker"><a href="#/guides">Software guides</a></p><h1 class="page-title">${esc(g.title)}</h1><div id="player"></div>`;
    }
    return `<h1>Software guides</h1><p class="muted">Every guide: 1. Big picture, 2. Go deeper, 3. Practice. Read the big picture before the day that uses the tool.</p>
      ${GUIDES.map((g) => `<a class="card row" href="#/guides/${esc(g.id)}"><span><strong>${esc(g.title)}</strong><small>${esc(g.short)}</small></span></a>`).join("")}`;
  };

  views.guides.after = function (id) {
    const g = id && GUIDES.find((x) => x.id === id); if (!g) return;
    const steps = lessonSteps(g.blocks, "g-" + g.id);
    const i = GUIDES.indexOf(g), nxt = GUIDES[i + 1];
    steps.push({ title: "Guide complete", label: "Finish", html: `<div class="done-hero"><span class="done-mark">${ICON("check")}</span><p>You now have the big picture of ${esc(g.title)}.</p></div>${nxt ? `<a class="card row" href="#/guides/${esc(nxt.id)}"><span><strong>Next guide: ${esc(nxt.title)}</strong><small>${esc(nxt.short)}</small></span></a>` : ""}`,
      after: (art) => MOTION.pop(art.querySelector(".done-mark")) });
    mountPlayer($("#player"), { key: "g-" + g.id, steps, finishLabel: "Back to guides", onFinish: () => { location.hash = "#/guides"; } });
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
      return `<p class="kicker"><a href="#/handbook">Office handbook</a> / How it really works</p><h1 class="page-title">${esc(d.title)}</h1><div id="player"></div>`;
    }
    const cats = [...new Set(RUNBOOKS.map((r) => r.cat))];
    return `<h1>Office handbook</h1>
      <p class="muted">Use it at your desk: search the problem, follow the steps, copy the commands and the ticket note. ${RUNBOOKS.length} runbooks, ${DEEPDIVES.length} deep dives.</p>
      <input type="search" id="hbSearch" class="search" placeholder="Search: locked, printer, vpn, outlook..." value="${esc(hbQuery)}" aria-label="Search the handbook">
      <div class="chips"><button class="${hbCat ? "" : "on"}" data-cat="">All</button>${cats.map((c) => `<button class="${hbCat === c ? "on" : ""}" data-cat="${esc(c)}">${esc(c)}</button>`).join("")}</div>
      <div id="hbList">${hbListHTML()}</div>`;
  };
  views.handbook.after = function (kind, id) {
    if (kind === "dd") {
      const d = DEEPDIVES.find((x) => x.id === id); if (!d) return;
      const related = RUNBOOKS.filter((r) => r.deep === d.id);
      const steps = lessonSteps(d.blocks, "dd-" + d.id, "Why it matters");
      steps.push({ title: "Use it at work", label: "Finish", html: `${check("dd-" + d.id, "I can explain this to a colleague")}${related.length ? `<h3>Tickets this explains</h3>${related.map((r) => `<a class="card row" href="#/handbook/rb/${esc(r.id)}"><span><strong>${esc(r.title)}</strong><small>${esc(r.symptom)}</small></span></a>`).join("")}` : ""}` });
      mountPlayer($("#player"), { key: "dd-" + d.id, steps, finishLabel: "Back to handbook", onFinish: () => { location.hash = "#/handbook"; } });
      return;
    }
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
  (window.DEUTSCH ? DEUTSCH.levels : []).forEach((l) => l.units.forEach((u) => GERMAN.decks.push({ id: "u" + u.id, unit: u.id, title: `${l.id} L${u.n}: ${u.title}`, cards: u.vocab })));
  function allCards() {
    const out = [];
    GERMAN.decks.forEach((d) => { if (d.unit && S.pos["du-" + d.unit] == null && !S.done["de-" + d.unit]) return; d.cards.forEach((c, i) => out.push({ key: d.id + "-" + i, deck: d.id, c })); });
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
      else if (t.id === "deReveal") { deShow = true; refreshGerman(); root.querySelectorAll(".flash").forEach((f) => MOTION.flip(f)); }
      else if (t.dataset.grade != null) {
        const cur = deQueue.shift();
        S.cards[cur.key] = SRS.next(S.cards[cur.key], t.dataset.grade === "1"); save();
        if (t.dataset.grade === "0") deQueue.push(cur); // see it again this round
        deShow = false; refreshGerman();
        root.querySelectorAll(".flash").forEach((f) => MOTION.animate(f, [{ opacity: 0, transform: "translateX(30px) rotate(1.5deg)" }, { opacity: 1, transform: "none" }], { duration: 300 }));
      }
    };
    root.onchange = (e) => { if (e.target.id === "deDeck") { deDeck = e.target.value; deQueue = []; deShow = false; refreshGerman(); } };
  }
  function refreshGerman() {
    ["#deBody", "#deFull"].forEach((s) => { const el = $(s); if (el) el.innerHTML = germanHTML(); });
  }
  const panel = $("#dePanel"), scrim = $("#scrim");
  function openDE(deck) {
    if (window.closeKIpanel) window.closeKIpanel();
    if (deck) { deDeck = deck; deTab = "list"; deQueue = []; }
    $("#deBody").innerHTML = germanHTML(); wireGerman($("#deBody"));
    panel.classList.add("open"); scrim.classList.add("on"); document.body.classList.add("de-open");
  }
  function closeDE() { panel.classList.remove("open"); scrim.classList.remove("on"); document.body.classList.remove("de-open"); }
  $("#deBtn").onclick = () => (panel.classList.contains("open") ? closeDE() : openDE());
  /* ---------- KI tutor panel ---------- */
  const kiPanel = $("#kiPanel");
  KI.setContext(() => {
    const t = (view.querySelector(".page-title") || view.querySelector("h1") || {}).innerText || "";
    const step = view.querySelector(".pl-step");
    return (t + "\n" + (step ? step.innerText : view.innerText)).slice(0, 6000);
  });
  function openKI(m) {
    closeDE(); if (m) KI.setMode(m); KI.render();
    kiPanel.classList.add("open"); scrim.classList.add("on"); document.body.classList.add("ki-open");
    setTimeout(() => { const i = $("#kiIn") || $("#kiKey"); if (i) i.focus({ preventScroll: true }); }, 250);
  }
  function closeKI() { kiPanel.classList.remove("open"); document.body.classList.remove("ki-open"); if (!panel.classList.contains("open")) scrim.classList.remove("on"); }
  window.openKI = openKI; window.closeKIpanel = closeKI;
  $("#kiBtn").onclick = () => (kiPanel.classList.contains("open") ? closeKI() : openKI());
  $("#kiClose").onclick = closeKI;
  document.addEventListener("click", (e) => { const b = e.target.closest("[data-open-ki]"); if (b) openKI(b.dataset.openKi); });
  $("#deClose").onclick = closeDE;
  scrim.onclick = () => { closeDE(); closeKI(); document.body.classList.remove("nav-open"); };
  document.addEventListener("click", (e) => { const b = e.target.closest("[data-open-de]"); if (b) openDE(b.dataset.openDe); });
  $("#menuBtn").onclick = () => { const o = document.body.classList.toggle("nav-open"); scrim.classList.toggle("on", o); $("#menuBtn").setAttribute("aria-expanded", o); };
  document.addEventListener("keydown", (e) => { if (e.key === "Escape") { closeDE(); closeKI(); document.body.classList.remove("nav-open"); } });

  /* ---------- icons in the static layout ---------- */
  document.querySelectorAll("[data-icon]").forEach((el) => el.insertAdjacentHTML("afterbegin", ICON(el.dataset.icon)));

  /* ---------- global search ---------- */
  const INDEX = [];
  PLAN.forEach((w) => w.days.forEach((d, i) => INDEX.push({ t: d.title, s: `Week ${w.id}, day ${i + 1}`, h: `#/day/${w.id}/${i + 1}`, ic: "calendar", k: d.title + " " + d.learn.join(" ") })));
  (window.COURSES || []).forEach((c) => { INDEX.push({ t: c.title, s: "Course", h: `#/course/${c.id}`, ic: "book", k: c.title + " " + c.short + " " + c.cert });
    c.modules.forEach((m) => INDEX.push({ t: m.title, s: c.title, h: `#/module/${c.id}/${m.id}`, ic: "book", k: m.title + " " + m.blocks.filter((b) => b[0] === "h" || b[0] === "one").map((b) => b[1]).join(" ") })); });
  (window.TRAINERS ? TRAINERS.LABS : []).forEach((l) => INDEX.push({ t: l.title, s: "Cisco CLI practice", h: `#/cli/${l.id}`, ic: "server", k: l.title + " " + l.intro + " cisco ios cli" }));
  allUnits().forEach((u) => INDEX.push({ t: `${u.level} Lektion ${u.n}: ${u.title}`, s: "Deutsch", h: `#/dunit/${u.id}`, ic: "language", k: u.title + " " + u.grammar.map((g) => g.t).join(" ") + " " + u.vocab.map((v) => v[0] + " " + v[1]).join(" ") }));
  INDEX.push({ t: "Subnetting trainer", s: "Practice", h: "#/subnet", ic: "grid", k: "subnet subnetting ipv4 mask cidr" });
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

  /* ---------- language switch ---------- */
  function syncLang() { document.querySelectorAll("[data-lang]").forEach((b) => b.classList.toggle("on", b.dataset.lang === I18N.lang)); I18N.apply(); }
  document.addEventListener("click", (e) => { const b = e.target.closest("[data-lang]"); if (b) { I18N.set(b.dataset.lang); syncLang(); render(); } });
  syncLang();

  /* ---------- router ---------- */
  let prevDepth = null;
  function render() {
    const parts = (location.hash.replace(/^#\/?/, "") || "today").split("/");
    const name = parts[0], args = parts.slice(1);
    const v = views[name] || notFound;
    view.innerHTML = v.apply(null, args);
    if (v.after) v.after.apply(null, args);
    const depth = parts.filter(Boolean).length + (["track", "course", "module", "dunit", "game", "cli", "day", "quiz"].includes(name) ? 1 : 0);
    MOTION.push(view, prevDepth == null ? 0 : depth > prevDepth ? 1 : depth < prevDepth ? -1 : 0); prevDepth = depth;
    view.querySelectorAll("svg.diagram").forEach((g) => MOTION.draw(g));
    document.querySelectorAll("[data-route]").forEach((a) => a.classList.toggle("on", a.dataset.route === name || (name === "day" && a.dataset.route === "plan") || (name === "quiz" && a.dataset.route === "plan") || (["track", "course", "module"].includes(name) && a.dataset.route === "learn") || (["cli", "subnet", "tickets", "labs", "interview"].includes(name) && a.dataset.route === "practice") || (["dunit", "arcade", "game"].includes(name) && a.dataset.route === "german")));
    if (window.innerWidth <= 760) closeDE();
    document.body.classList.remove("nav-open"); if (!panel.classList.contains("open")) scrim.classList.remove("on");
    window.scrollTo(0, 0);
  }
  window.addEventListener("hashchange", render);
  render();

  if ("serviceWorker" in navigator && location.protocol.startsWith("http")) {
    const hadController = !!navigator.serviceWorker.controller;
    navigator.serviceWorker.register("sw.js");
    // A new version took over in the background: show it right away (once).
    let reloaded = false;
    navigator.serviceWorker.addEventListener("controllerchange", () => { if (hadController && !reloaded) { reloaded = true; location.reload(); } });
  }
})();
