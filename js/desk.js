/* Service desk simulator: a live shift with a ticket queue, SLA clocks, triage, decisions, work notes and a shift report.
   app.js calls DESK_APP(api) and merges the returned views. Scenarios live in data/desk.js. */
window.DESK_APP = function (api) {
  "use strict";
  const { esc, ICON, MOTION, shuffled, save } = api;
  const st = api.state;
  const D = window.DESK || { tickets: [], categories: [], groups: [] };
  const RESP = { 1: 10, 2: 20, 3: 60, 4: 120 }, RESO = { 1: 120, 2: 240, 3: 480, 4: 960 };
  const pr = (imp, urg) => { const s = +imp + +urg; return s >= 6 ? 1 : s === 5 ? 2 : s === 4 ? 3 : 4; };
  const IMP = ["", "One user", "Team, floor or sensitive", "Many users / whole company"];
  const URG = ["", "Can wait", "Work affected", "Cannot work / deadline"];
  const CH = { phone: "Phone", email: "Email", chat: "Chat", portal: "Portal" };
  const clock = (t) => { const m = 8 * 60 + Math.floor(t); return String(Math.floor(m / 60)).padStart(2, "0") + ":" + String(m % 60).padStart(2, "0"); };
  const fold = (s) => String(s).toLowerCase();
  const hits = (text, kw) => kw.filter((k) => fold(text).includes(k)).length;

  let G = null, timer = null;

  /* ---------- a new shift ---------- */
  function newShift(mode) {
    const pool = D.tickets.filter((x) => !x.child);
    const n = mode === "practice" ? 6 : 9;
    let pick = shuffled(pool).slice(0, n);
    const out = [];
    pick.forEach((sc) => { out.push(sc); if (sc.parent && mode !== "practice") D.tickets.filter((c) => c.child === sc.id).forEach((c) => out.push(c)); });
    let t = 0, inc = 12000 + Math.floor(Math.random() * 800), req = 5000 + Math.floor(Math.random() * 300);
    const list = out.map((sc, i) => {
      if (i) t += sc.child ? 4 + Math.floor(Math.random() * 6) : 6 + Math.floor(Math.random() * 16);
      return { sc, no: sc.type === "request" ? "REQ0" + (req++) : "INC0" + (inc++), arr: mode === "practice" ? 0 : t, state: "new", step: "triage", round: 0,
        pts: 0, fb: [], hist: [], respAt: null, closeAt: null, paused: 0, pendFrom: null, pendUntil: null, prio: null, triage: null, opts: {} };
    });
    G = { mode, t: 0, speed: 1, running: mode === "shift", list, sel: null, over: false, score: 0 };
  }
  const visible = () => G.list.filter((x) => x.arr <= G.t);
  const openT = (x) => ["new", "progress", "pending"].includes(x.state);
  const prioOf = (x) => x.prio || pr(x.sc.imp, x.sc.urg);
  function resoUsed(x) { const end = x.closeAt != null ? x.closeAt : G.t; return end - x.arr - x.paused - (x.state === "pending" ? G.t - x.pendFrom : 0); }
  function slaInfo(x) {
    if (G.mode !== "shift") return null;
    if (x.respAt == null && openT(x)) { const lim = RESP[pr(x.sc.imp, x.sc.urg)], used = G.t - x.arr; return { kind: "Response", left: lim - used, pct: Math.min(100, used / lim * 100) }; }
    const lim = RESO[prioOf(x)], used = resoUsed(x); return { kind: "Resolution", left: lim - used, pct: Math.min(100, used / lim * 100), paused: x.state === "pending" };
  }

  /* ---------- the clock ---------- */
  function startClock() { stopClock(); if (G && G.running && !G.over) timer = setInterval(tick, 1000); }
  function stopClock() { if (timer) clearInterval(timer); timer = null; }
  function tick() {
    if (!document.getElementById("desk")) { stopClock(); if (G) G.running = false; return; }
    const before = visible().length;
    G.t += G.speed;
    let redrawDetail = false;
    G.list.forEach((x) => {
      if (x.state === "pending" && G.t >= x.pendUntil) returnFromPending(x) && G.list.indexOf(x) === G.sel && (redrawDetail = true);
    });
    const arrived = visible().length > before;
    drawTop(); drawQueue(arrived);
    if (redrawDetail) drawDetail();
    if (G.list.every((x) => x.arr <= G.t && !openT(x)) || G.t >= 9 * 60) finish();
  }
  function returnFromPending(x) {
    x.paused += G.t - x.pendFrom; x.pendFrom = null; x.state = "progress";
    const r = x.sc.rounds[x.round - 1];
    x.hist.push({ k: "reply", t: G.t, text: (r && r.reply) || "Reply received." });
    return true;
  }

  /* ---------- drawing ---------- */
  const prBadge = (p) => `<span class="dp dp${p}">P${p}</span>`;
  const STATE = { new: "New", progress: "In progress", pending: "Pending", resolved: "Resolved", escalated: "Escalated", linked: "Linked" };
  function drawTop() {
    const el = document.getElementById("dtop"); if (!el) return;
    const v = visible(), open = v.filter(openT).length, pend = v.filter((x) => x.state === "pending").length, closed = G.list.filter((x) => !openT(x) && x.arr <= G.t).length;
    el.innerHTML = `<div class="dclock">${G.mode === "shift" ? `<b>${clock(G.t)}</b><span class="muted small">${G.running ? "shift running" : "paused"}</span>` : `<b>Practice</b><span class="muted small">no clock</span>`}</div>
      ${G.mode === "shift" ? `<div class="dspeed" role="group" aria-label="Speed">${[["0", "Pause"], ["1", "1x"], ["2", "2x"], ["4", "4x"]].map(([s, l]) => `<button data-speed="${s}" class="${(s === "0" && !G.running) || (G.running && +s === G.speed) ? "on" : ""}">${l}</button>`).join("")}</div>` : ""}
      <div class="dstats"><span><b>${open}</b> open</span><span><b>${pend}</b> pending</span><span><b>${closed}</b> closed</span><span><b>${G.score}</b> points</span></div>
      <button class="btn ghost sm" data-end>End shift</button>`;
  }
  function drawQueue(pulse) {
    const el = document.getElementById("dqueue"); if (!el) return;
    const v = visible().slice().sort((a, b) => (openT(b) - openT(a)) || (prioOf(a) - prioOf(b)) || (a.arr - b.arr));
    const waiting = G.list.length - visible().length;
    el.innerHTML = `<div class="dq-h"><b>Queue: Service Desk</b><span class="muted small">${waiting ? waiting + " more today" : "all tickets in"}</span></div>` +
      (v.length ? v.map((x) => { const i = G.list.indexOf(x), s = slaInfo(x), sd = x.triage ? x.triage.sd : x.sc.subj;
        return `<button class="dq-item ${i === G.sel ? "on" : ""} ${openT(x) ? "" : "closed"} ${s && s.left < 0 && openT(x) ? "breach" : ""}" data-sel="${i}">
          <span class="dq-l1">${x.triage || !openT(x) ? prBadge(prioOf(x)) : `<span class="dp dpn">new</span>`}<b>${x.no}</b><span class="dq-st st-${x.state}">${STATE[x.state]}</span></span>
          <span class="dq-sd">${esc(sd)}</span><span class="muted small">${esc(x.sc.from)} · ${CH[x.sc.ch]} · ${clock(x.arr)}</span>
          ${s && openT(x) ? `<span class="dq-sla"><i style="width:${s.pct}%"></i></span><span class="dq-left small">${s.kind} ${s.paused ? "paused" : s.left < 0 ? "breached " + (-s.left) + " min" : s.left + " min left"}</span>` : ""}</button>`; }).join("")
      : `<p class="muted dq-empty">Waiting for the first call...</p>`);
    if (pulse) { const items = el.querySelectorAll(".dq-item"); const n = [...items].find((b) => G.list[+b.dataset.sel].state === "new"); if (n) MOTION.pop(n); }
  }
  function histHTML(x) {
    return x.hist.map((h) => h.k === "reply" ? `<div class="dh reply"><b>${clock(h.t)} · Update received</b><p>${esc(h.text)}</p></div>`
      : h.k === "fb" ? `<div class="dh ${h.ok ? "ok" : "bad"}"><b>${h.ok ? "Good" : "Not quite"} (${h.p > 0 ? "+" : ""}${h.p})</b><p><i>${esc(h.choice)}</i></p><p>${esc(h.text)}</p></div>`
      : `<div class="dh note"><b>${clock(h.t)} · ${esc(h.title)}</b><p>${esc(h.text)}</p></div>`).join("");
  }
  function drawDetail() {
    const el = document.getElementById("ddetail"); if (!el) return;
    document.getElementById("desk").classList.toggle("has-sel", G.sel != null);
    if (G.sel == null) { el.innerHTML = `<div class="dd-empty"><span class="tic">${ICON("ticket")}</span><h3>Pick a ticket from the queue</h3><p class="muted">Highest priority and closest SLA first. New tickets need triage before the response SLA runs out.</p></div>`; return; }
    const x = G.list[G.sel], sc = x.sc, s = slaInfo(x);
    let body = "";
    if (x.step === "triage") {
      const cats = D.categories.map((c) => `<option>${esc(c)}</option>`).join("");
      body = `<form class="dform" id="dtri"><h3>Triage</h3>
        <div class="dgrid"><label class="field">Type<select name="type"><option value="">Choose...</option><option value="incident">Incident (something is broken)</option><option value="request">Service request (a wish)</option></select></label>
        <label class="field">Category<select name="cat"><option value="">Choose...</option>${cats}</select></label>
        <label class="field">Impact<select name="imp"><option value="">Choose...</option>${[1, 2, 3].map((i) => `<option value="${i}">${IMP[i]}</option>`).join("")}</select></label>
        <label class="field">Urgency<select name="urg"><option value="">Choose...</option>${[1, 2, 3].map((i) => `<option value="${i}">${URG[i]}</option>`).join("")}</select></label></div>
        <p class="dprio" id="dprio">Priority: choose impact and urgency</p>
        <label class="field">Short description (what + symptom + scope)<input name="sd" maxlength="120" autocomplete="off" placeholder="e.g. Outlook closes on start, one user, since this morning"></label>
        <button class="btn" type="submit">Save and start work</button><p class="dmsg muted small" id="dtmsg"></p></form>`;
    } else if (x.step === "round") {
      if (x.state === "pending") body = `<div class="dwait"><span class="tic">${ICON("clock")}</span><h3>Pending</h3><p class="muted">${G.mode === "shift" ? `Waiting for an answer, expected around ${clock(x.pendUntil)}. The SLA clock is paused. Work on other tickets.` : "Waiting for an answer."}</p>${G.mode !== "shift" ? `<button class="btn" data-skipwait>Answer arrives</button>` : ""}</div>`;
      else { const r = sc.rounds[x.round]; if (!x.opts[x.round]) x.opts[x.round] = shuffled(r.o.map((_, i) => i));
        body = `<div class="dround"><h3>${esc(r.q)}</h3><div class="dopts">${x.opts[x.round].map((i) => `<button class="dopt" data-opt="${i}">${esc(r.o[i][0])}</button>`).join("")}</div></div>`; }
    } else if (x.step === "note") {
      body = `<form class="dform" id="dnote"><h3>Escalation work note to ${esc(x.esc)}</h3><p class="muted small">Internal work note, not visible to the user. Write it so the next team needs no phone call: symptom, scope, since when, what you checked, your theory, what you need.</p>
        <textarea name="note" rows="6" placeholder="Symptom: ...&#10;Scope: ...&#10;Since: ...&#10;Checked: ...&#10;Theory / evidence: ...&#10;Needed: ..."></textarea>
        <button class="btn" type="submit">Assign to ${esc(x.esc)}</button><p class="dmsg muted small" id="dnmsg"></p></form>`;
    } else if (x.step === "resolve") {
      body = `<form class="dform" id="dres"><h3>Resolve</h3><p class="muted small">Resolution notes feed the knowledge base: cause, what you did, how you confirmed it.</p>
        <textarea name="res" rows="4" placeholder="Cause: ... Fix: ... Confirmed: ..."></textarea>
        <button class="btn" type="submit">Resolve ticket</button><p class="dmsg muted small" id="drmsg"></p></form>`;
    } else {
      body = `<div class="ddone"><h3>${STATE[x.state]}${x.esc ? " to " + esc(x.esc) : ""}</h3><p><b>${x.pts} points</b> for this ticket.</p>
        <p class="muted"><b>Priority:</b> ${esc(sc.why)}</p>${sc.res ? `<p class="muted"><b>Model resolution note:</b> ${esc(sc.res)}</p>` : ""}</div>`;
    }
    el.innerHTML = `<button class="btn ghost sm dback" data-back>${ICON("chevron")} Queue</button>
      <div class="dd-head">${x.triage || !openT(x) ? prBadge(prioOf(x)) : ""}<b>${x.no}</b><span class="dq-st st-${x.state}">${STATE[x.state]}</span>${s && openT(x) ? `<span class="small ${s.left < 0 ? "breachtxt" : "muted"}">${s.kind} SLA: ${s.paused ? "paused" : s.left < 0 ? "breached" : s.left + " min left"}</span>` : ""}</div>
      <div class="dmsgbox"><p class="small muted">${CH[sc.ch]} from <b>${esc(sc.from)}</b>, ${esc(sc.dept)} · ${clock(x.arr)}</p><p class="dsubj">${esc(sc.subj)}</p><p>${esc(sc.body)}</p></div>
      ${x.triage ? `<p class="small muted dtri">${x.triage.type === "incident" ? "Incident" : "Service request"} · ${esc(x.triage.cat)} · ${esc(IMP[x.triage.imp])} · ${esc(URG[x.triage.urg])}</p>` : ""}
      <div class="dhist">${histHTML(x)}</div>${body}`;
    wireDetail(x);
  }
  function drawAll() { drawTop(); drawQueue(); drawDetail(); }

  /* ---------- actions ---------- */
  function addPts(x, p) { x.pts += p; G.score += p; }
  function close(x, state) {
    x.state = state; x.closeAt = G.t; x.step = "done";
    if (G.mode === "shift") {
      const rOk = x.respAt != null && x.respAt - x.arr <= RESP[pr(x.sc.imp, x.sc.urg)];
      const sOk = resoUsed(x) <= RESO[prioOf(x)];
      x.sla = { resp: rOk, reso: sOk };
      addPts(x, (rOk ? 5 : -5) + (sOk ? 5 : -10));
      x.hist.push({ k: "note", t: G.t, title: "SLA", text: `Response ${rOk ? "met" : "breached"}, resolution ${sOk ? "met" : "breached"}.` });
    }
  }
  function wireDetail(x) {
    const f = document.getElementById("dtri");
    if (f) {
      const upd = () => { const imp = f.imp.value, urg = f.urg.value; document.getElementById("dprio").innerHTML = imp && urg ? `Priority: ${prBadge(pr(imp, urg))} <span class="muted small">impact ${imp} + urgency ${urg}</span>` : "Priority: choose impact and urgency"; };
      f.imp.onchange = upd; f.urg.onchange = upd;
      f.onsubmit = (e) => {
        e.preventDefault();
        const v = { type: f.type.value, cat: f.cat.value, imp: +f.imp.value, urg: +f.urg.value, sd: f.sd.value.trim() };
        if (!v.type || !v.cat || !v.imp || !v.urg || v.sd.length < 15) { document.getElementById("dtmsg").textContent = "Fill in every field; the short description needs at least 15 characters."; MOTION.shake(f); return; }
        const sc = x.sc, my = pr(v.imp, v.urg), right = pr(sc.imp, sc.urg);
        let p = 0; const notes = [];
        if (v.type === sc.type) p += 5; else notes.push(`Type: this is ${sc.type === "incident" ? "an incident" : "a service request"}.`);
        if (v.cat === sc.cat) p += 5; else notes.push(`Category: ${sc.cat}.`);
        if (my === right) p += 10; else { p += Math.abs(my - right) === 1 ? 4 : 0; notes.push(`Priority should be P${right}. ${sc.why}`); }
        const sdOk = hits(v.sd, sc.kw) >= 1 && !/!!|\?\?/.test(v.sd) && v.sd !== v.sd.toUpperCase();
        if (sdOk) p += 5; else notes.push("Short description: say what is broken or wanted, in plain words, no shouting. The ticket subject from the user is rarely good enough.");
        x.triage = v; x.prio = my; x.respAt = G.t; x.state = "progress"; x.step = "round"; addPts(x, p);
        x.hist.push({ k: "note", t: G.t, title: `Triage saved (+${p})`, text: notes.length ? notes.join(" ") : "Type, category, priority and short description all correct." });
        drawAll();
      };
    }
    document.querySelectorAll("#ddetail [data-opt]").forEach((b) => b.onclick = () => {
      const r = x.sc.rounds[x.round], o = r.o[+b.dataset.opt], [text, p, fbText, eff] = o;
      addPts(x, p); x.hist.push({ k: "fb", ok: p > 0, p, choice: text, text: fbText });
      if (eff === "stay") { drawAll(); MOTION.shake(document.querySelector("#ddetail .dh.bad:last-of-type") || b); return; }
      if (eff === "next") x.round++;
      else if (eff === "resolve") x.step = "resolve";
      else if (eff.startsWith("esc:")) { x.esc = eff.slice(4); x.step = "note"; }
      else if (eff === "link") { const parent = G.list.find((y) => y.sc.id === x.sc.child); x.hist.push({ k: "note", t: G.t, title: "Linked", text: `Linked as child of ${parent ? parent.no : "the parent incident"}. The user is informed when the parent is resolved.` }); close(x, "linked"); }
      else if (eff.startsWith("pend:")) { x.round++; x.state = "pending"; x.pendFrom = G.t; x.pendUntil = G.t + +eff.slice(5); }
      drawAll();
    });
    const sk = document.querySelector("#ddetail [data-skipwait]"); if (sk) sk.onclick = () => { returnFromPending(x); drawAll(); };
    const n = document.getElementById("dnote");
    if (n) n.onsubmit = (e) => {
      e.preventDefault(); const t = n.note.value.trim();
      if (t.length < 40) { document.getElementById("dnmsg").textContent = "Too short for a useful escalation: at least 40 characters."; MOTION.shake(n); return; }
      let p = 0; if (t.length >= 80) p += 4; if (hits(t, x.sc.kw) >= 2) p += 4; if (/(check|test|tried|verified|confirmed|geprüft|getestet)/i.test(t)) p += 2;
      addPts(x, p); x.hist.push({ k: "note", t: G.t, title: `Work note to ${x.esc} (+${p} of 10)`, text: t });
      close(x, "escalated"); drawAll();
    };
    const rf = document.getElementById("dres");
    if (rf) rf.onsubmit = (e) => {
      e.preventDefault(); const t = rf.res.value.trim();
      if (t.length < 25) { document.getElementById("drmsg").textContent = "Write the cause and the fix (at least 25 characters)."; MOTION.shake(rf); return; }
      let p = 0; if (t.length >= 50) p += 3; if (hits(t, x.sc.kw) >= 1) p += 2;
      addPts(x, p); x.hist.push({ k: "note", t: G.t, title: `Resolution note (+${p} of 5)`, text: t });
      close(x, "resolved"); drawAll();
    };
  }

  /* ---------- end of shift ---------- */
  function finish() {
    if (G.over) return; G.over = true; G.running = false; stopClock();
    const handled = G.list.filter((x) => !openT(x));
    const timed = G.mode === "shift";
    const slaOk = handled.filter((x) => x.sla && x.sla.resp && x.sla.reso).length;
    const prOk = G.list.filter((x) => x.triage && x.prio === pr(x.sc.imp, x.sc.urg)).length;
    const fcr = handled.filter((x) => x.state === "resolved").length;
    const left = G.list.filter(openT).length;
    G.score -= left * 15;
    const xp = Math.max(0, Math.round(G.score / 3));
    const S = st(); S.xp = (S.xp || 0) + xp; save();
    let rec = {}; try { rec = JSON.parse(localStorage.getItem("itsa-desk") || "{}"); } catch (e) { rec = {}; }
    const best = Math.max(rec.best || 0, G.score); localStorage.setItem("itsa-desk", JSON.stringify({ best, runs: (rec.runs || 0) + 1 }));
    G.report = { handled: handled.length, total: G.list.length, slaPct: timed && handled.length ? Math.round(slaOk / handled.length * 100) : null, prPct: Math.round(prOk / G.list.length * 100), fcr, left, xp, best };
    const root = document.getElementById("desk"); if (root) render();
  }
  function reportHTML() {
    const r = G.report;
    return `<section class="card dreport"><span class="tic">${ICON("trophy")}</span><h2>Shift report</h2>
      <div class="drep-k"><div><b>${G.score}</b><span>points</span></div><div><b>${r.handled}/${r.total}</b><span>tickets handled</span></div>
      ${r.slaPct != null ? `<div><b>${r.slaPct}%</b><span>SLA met</span></div>` : ""}<div><b>${r.prPct}%</b><span>priority right</span></div><div><b>${r.fcr}</b><span>solved at 1st level</span></div><div><b>+${r.xp}</b><span>XP</span></div></div>
      ${r.left ? `<p class="breachtxt">${r.left} ticket${r.left === 1 ? " was" : "s were"} still open at the end (-15 each).</p>` : ""}
      <p class="muted">Best shift so far: ${r.best} points.</p>
      <div class="table"><table><thead><tr><th>Ticket</th><th>Priority (yours / right)</th><th>Outcome</th><th>SLA</th><th>Points</th></tr></thead><tbody>
      ${G.list.map((x) => `<tr><td><b>${x.no}</b><br><span class="muted small">${esc(x.triage ? x.triage.sd : x.sc.subj)}</span></td><td>${x.prio ? "P" + x.prio : "-"} / P${pr(x.sc.imp, x.sc.urg)}</td><td>${STATE[x.state]}${x.esc ? " to " + esc(x.esc) : ""}</td><td>${x.sla ? (x.sla.resp && x.sla.reso ? "met" : "breached") : "-"}</td><td>${x.pts}</td></tr>`).join("")}</tbody></table></div>
      <p><button class="btn" data-new="shift">Start a new shift</button> <button class="btn ghost" data-new="practice">Practice without clock</button> <a class="btn ghost" href="#/course/itsm">Ticketing course</a></p></section>`;
  }

  /* ---------- the view ---------- */
  function startHTML() {
    let rec = {}; try { rec = JSON.parse(localStorage.getItem("itsa-desk") || "{}"); } catch (e) { rec = {}; }
    return `<p class="kicker"><a href="#/practice">Practice</a></p><h1 class="page-title">Service desk simulator</h1>
      <p class="muted lead-p">You are on the 1st-level service desk from 08:00. Tickets arrive by phone, email, chat and the portal. Triage each one (type, category, impact, urgency, a good short description), work it, escalate with a proper work note or resolve it, and keep an eye on the SLA clocks. Some tickets are in German, some are traps.</p>
      <div class="bento">
        <button class="card task wide dstart" data-new="shift"><span class="tic">${ICON("clock")}</span><span class="corner">${ICON("play")}</span><p class="pl-label">Live shift</p><h3>9+ tickets, SLA clocks running</h3><p class="muted small" style="margin:0">1 second = 1 minute. Pause or speed up any time</p></button>
        <button class="card task wide dstart" data-new="practice"><span class="tic">${ICON("ticket")}</span><span class="corner">${ICON("play")}</span><p class="pl-label">Practice</p><h3>6 tickets, no clock</h3><p class="muted small" style="margin:0">Take your time, learn the decisions</p></button>
      </div>
      ${rec.runs ? `<p class="muted">Shifts played: ${rec.runs} · best: ${rec.best} points</p>` : ""}
      <section class="card"><h3>How points work</h3><ul class="muted"><li>Triage: type 5, category 5, priority 10, short description 5</li><li>Each decision: good choices +10, mistakes cost points</li><li>Escalation note up to 10, resolution note up to 5</li><li>SLA: response met +5 (else -5), resolution met +5 (else -10); open at the end -15</li></ul></section>`;
  }
  function render() {
    const v = document.getElementById("view"); if (!v) return;
    v.innerHTML = views.desk(); views.desk.after();
  }
  const views = {};
  views.desk = function () {
    if (!G) return startHTML();
    if (G.over) return `<p class="kicker"><a href="#/practice">Practice</a></p><h1 class="page-title">Service desk simulator</h1>${reportHTML()}`;
    return `<p class="kicker"><a href="#/practice">Practice</a></p><div id="desk" class="desk"><div class="dtop card" id="dtop"></div><div class="dcols"><div class="dqueue card" id="dqueue"></div><div class="ddetail card" id="ddetail"></div></div></div>`;
  };
  views.desk.after = function () {
    const v = document.getElementById("view");
    v.querySelectorAll("[data-new]").forEach((b) => b.onclick = () => { newShift(b.dataset.new); render(); });
    if (!G || G.over) { stopClock(); return; }
    drawAll(); startClock();
    const root = document.getElementById("desk");
    root.addEventListener("click", (e) => {
      const q = e.target.closest("[data-sel]"); if (q) { G.sel = +q.dataset.sel; drawQueue(); drawDetail(); if (window.innerWidth < 900) window.scrollTo(0, 0); return; }
      if (e.target.closest("[data-back]")) { G.sel = null; drawQueue(); drawDetail(); return; }
      const sp = e.target.closest("[data-speed]");
      if (sp) { const s = +sp.dataset.speed; if (s) { G.speed = s; G.running = true; } else G.running = false; startClock(); drawTop(); return; }
      if (e.target.closest("[data-end]")) { if (confirm("End the shift now? Open tickets cost 15 points each.")) finish(); }
    });
  };
  window.addEventListener("hashchange", () => { if (!location.hash.startsWith("#/desk") && G && !G.over) { G.running = false; stopClock(); } });

  return { views, count: D.tickets.length };
};
