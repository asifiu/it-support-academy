/* Wortschatz: 2000+ German words with English and Bengali meanings.
   Shuffle cards, a searchable list with "Play all", and a daily duty (20 new words, a short test, 3 own sentences).
   app.js calls WORTSCHATZ_APP(api) and merges the returned views into its router. Word progress lives in S.cards
   under keys "w-<topic>-<index>", so it is exported and imported with the rest of the progress file. */
window.WORTSCHATZ_APP = function (api) {
  "use strict";
  const { esc, ICON, sayBtn, MOTION, shuffled, save } = api;
  const st = api.state; // S is replaced on import or reset, so always read it through this getter
  const $ = (sel, el = document) => el.querySelector(sel);

  /* ---------- word index (first entry wins when a word appears in two topics) ---------- */
  const TOPICS = window.WORTSCHATZ || [];
  const TYPE_BY_TOPIC = { verben1: "Verb", verben2: "Verb", verben3: "Verb", adjektive: "Adjektiv", adjektive2: "Adjektiv", redemittel: "Satz" };
  const WORDS = [], seen = new Set();
  TOPICS.forEach((t) => t.words.forEach((w, i) => {
    const id = w[0].toLowerCase();
    if (seen.has(id)) return;
    seen.add(id);
    const type = TYPE_BY_TOPIC[t.id] || (/^(der|die|das) /.test(w[0]) ? "Nomen" : /^sich /.test(w[0]) ? "Verb" : "Wort");
    WORDS.push({ key: "w-" + t.id + "-" + i, de: w[0], en: w[1], bn: w[2], ex: w[3], topic: t.id, level: t.level, type });
  }));
  const BYKEY = Object.fromEntries(WORDS.map((w) => [w.key, w]));
  const topicName = (id) => (TOPICS.find((t) => t.id === id) || {}).topic || id;
  /* What the speaker reads: "der Tisch, -e" -> "der Tisch", "malen (Bild)" -> "malen". */
  const spoken = (w) => w.de.split(" / ")[0].split(",")[0].replace(/\s*\(.*?\)/g, "").trim();

  /* ---------- status from the spaced-repetition box ---------- */
  const KNOWN_BOX = 4;
  function status(w) { const c = st().cards[w.key]; return !c ? "new" : c.box >= KNOWN_BOX ? "known" : "learning"; }
  const STATUS_LABEL = { new: "New", learning: "Learning", known: "Known" };
  function counts(list) { const n = { new: 0, learning: 0, known: 0 }; list.forEach((w) => n[status(w)]++); return n; }
  function grade(w, knew) {
    const S = st();
    S.cards[w.key] = SRS.next(S.cards[w.key], knew);
    save();
  }

  /* ---------- filters (remembered on this device) ---------- */
  const FKEY = "itsa-wf";
  let F = { q: "", topic: "", level: "", status: "", type: "", sort: "topic", mode: "de", ex: false };
  try { Object.assign(F, JSON.parse(localStorage.getItem(FKEY) || "{}")); } catch (e) { /* keep defaults */ }
  const keepF = () => localStorage.setItem(FKEY, JSON.stringify(F));
  const fold = (s) => String(s).toLowerCase().replace(/ä/g, "a").replace(/ö/g, "o").replace(/ü/g, "u").replace(/ß/g, "ss");
  function filtered() {
    const q = fold(F.q.trim());
    let list = WORDS.filter((w) => (!F.topic || w.topic === F.topic) && (!F.level || w.level === F.level) && (!F.type || w.type === F.type) && (!F.status || status(w) === F.status)
      && (!q || fold(w.de).includes(q) || w.en.toLowerCase().includes(q) || w.bn.includes(F.q.trim())));
    const bare = (w) => fold(spoken(w).replace(/^(der|die|das|sich) /, ""));
    if (F.sort === "az") list = list.slice().sort((a, b) => bare(a).localeCompare(bare(b), "de"));
    else if (F.sort === "za") list = list.slice().sort((a, b) => bare(b).localeCompare(bare(a), "de"));
    else if (F.sort === "status") { const o = { new: 0, learning: 1, known: 2 }; list = list.slice().sort((a, b) => o[status(a)] - o[status(b)]); }
    return list;
  }
  const opt = (v, label, cur) => `<option value="${esc(v)}" ${cur === v ? "selected" : ""}>${esc(label)}</option>`;
  function filterBar(withSort) {
    const levels = ["A1", "A2", "B1"], types = ["Nomen", "Verb", "Adjektiv", "Wort", "Satz"];
    return `<div class="wfilters">
      <label class="field wf-q">Search<input id="wfq" type="search" value="${esc(F.q)}" placeholder="German, English or বাংলা" autocomplete="off"></label>
      <label class="field">Topic<select id="wft">${opt("", "All topics", F.topic)}${TOPICS.map((t) => opt(t.id, `${t.topic} (${t.level})`, F.topic)).join("")}</select></label>
      <label class="field">Level<select id="wfl">${opt("", "All levels", F.level)}${levels.map((l) => opt(l, l, F.level)).join("")}</select></label>
      <label class="field">Type<select id="wfy">${opt("", "All types", F.type)}${types.map((l) => opt(l, l, F.type)).join("")}</select></label>
      <label class="field">Status<select id="wfs">${opt("", "Any status", F.status)}${Object.keys(STATUS_LABEL).map((s) => opt(s, STATUS_LABEL[s], F.status)).join("")}</select></label>
      ${withSort ? `<label class="field">Sort<select id="wfo">${opt("topic", "By topic", F.sort)}${opt("az", "A to Z", F.sort)}${opt("za", "Z to A", F.sort)}${opt("status", "New first", F.sort)}</select></label>` : ""}
    </div>`;
  }
  function wireFilters(onChange) {
    const map = { wfq: "q", wft: "topic", wfl: "level", wfy: "type", wfs: "status", wfo: "sort" };
    let t = null;
    Object.entries(map).forEach(([id, k]) => {
      const el = document.getElementById(id); if (!el) return;
      el.addEventListener(id === "wfq" ? "input" : "change", () => {
        F[k] = el.value; keepF();
        clearTimeout(t); t = setTimeout(onChange, id === "wfq" ? 160 : 0);
      });
    });
  }
  function statusStrip(list) {
    const n = counts(list), total = list.length || 1;
    return `<div class="wstat">${["new", "learning", "known"].map((s) => `<div class="ws-${s}"><b class="num" data-to="${n[s]}">${n[s]}</b><span>${STATUS_LABEL[s]}</span></div>`).join("")}
      <div class="wbar" aria-hidden="true"><i class="ws-learning" style="width:${n.learning / total * 100}%"></i><i class="ws-known" style="width:${n.known / total * 100}%"></i></div></div>`;
  }
  const bn = (s) => `<span class="bn" lang="bn">${esc(s)}</span>`;
  const tag = (w) => `<span class="wtag">${esc(w.level)} · ${esc(w.type)}</span>`;

  /* ---------- daily duty ---------- */
  const DAILY = 20, TEST_N = 10, PASS = 8, SENTS = 3;
  const todayStr = () => { const d = new Date(); return d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0"); };
  const LEVEL_ORDER = { A1: 0, A2: 1, B1: 2 };
  function duty() {
    const S = st(), d = todayStr();
    if (!S.wd || S.wd.d !== d) {
      // Walk through the vocabulary in order: easiest level first, topic by topic, words not met yet.
      const fresh = WORDS.filter((w) => !S.cards[w.key]).sort((a, b) => LEVEL_ORDER[a.level] - LEVEL_ORDER[b.level]);
      const pick = (fresh.length >= DAILY ? fresh : fresh.concat(shuffled(WORDS.filter((w) => status(w) === "learning")))).slice(0, DAILY);
      S.wd = { d, k: pick.map((w) => w.key), step: 0, p: 0, t: 0, s: [] };
      localStorage.setItem("itsa-v1", JSON.stringify(S)); // store the pick without counting it as a learning day
    }
    return S.wd;
  }
  const dutyDone = () => !!st().wdd[todayStr()];
  const dutyWords = () => duty().k.map((k) => BYKEY[k]).filter(Boolean);
  function dutyStreak() {
    let n = 0; const d = new Date(); if (!dutyDone()) d.setDate(d.getDate() - 1);
    for (;;) { const k = d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0"); if (!st().wdd[k]) break; n++; d.setDate(d.getDate() - 1); }
    return n;
  }
  const STEP_NAMES = ["Learn 20 words", "Quick test", "Write 3 sentences"];
  function dutyBanner() {
    if (!WORDS.length) return "";
    if (dutyDone()) return "";
    const w = duty(), pct = Math.round((w.step === 0 ? w.p / DAILY : w.step === 1 ? 1 : 2) / 3 * 100);
    return `<a class="card duty" href="#/wday"><span class="tic">${ICON("cards")}</span><div><p class="pl-label">Tagesziel · not done yet</p>
      <h3>${w.step === 0 && w.p === 0 ? "Today: 20 new German words, a test and 3 sentences" : "Continue: " + STEP_NAMES[w.step]}</h3>
      <div class="duty-steps">${STEP_NAMES.map((n, i) => `<span class="${i < w.step ? "done" : i === w.step ? "now" : ""}">${i < w.step ? ICON("check") : i + 1} ${n}</span>`).join("")}</div>
      <div class="cprog"><i style="width:${pct}%"></i></div></div><span class="corner">${ICON("arrowRight")}</span></a>`;
  }

  /* Does the sentence use the word? Lenient on purpose: any form counts.
     Nouns match with or without umlaut plural (Baum, Bäume), verbs by their stem (arbeiten -> arbeit),
     separable verbs also by the part after the prefix (anrufen -> ruf, as in "Ich rufe dich an"). */
  function stems(w) {
    const base = spoken(w).replace(/^(der|die|das|sich) /i, "");
    const parts = base.split(/[\s/.,!?]+/).filter((p) => p.length >= 3 && !/^(der|die|das|sich|ein|eine|den|dem)$/i.test(p));
    const main = fold(parts.sort((a, b) => b.length - a.length)[0] || base);
    const out = [main];
    if (w.type === "Verb" || /e?n$/.test(main)) {
      const v = main.replace(/e?n$/, ""); if (v.length >= 3) out.push(v);
      const m = v.match(/^(zuruck|weiter|heraus|herunter|wieder|hinzu|an|auf|aus|ein|mit|vor|zu|ab|nach|um|fest|hoch|los|weg)(.{3,})$/);
      if (m) out.push(m[2]);
    }
    return out;
  }
  const usesWord = (sentence, w) => { const f = fold(sentence); return stems(w).some((s) => s.length >= 3 && f.includes(s)); };
  function checkSentence(text, words, taken) {
    const t = text.trim();
    if (!t) return { ok: false, msg: "" };
    if (t.split(/\s+/).length < 4) return { ok: false, msg: "Write at least 4 words." };
    if (!/^[A-ZÄÖÜ]/.test(t)) return { ok: false, msg: "Start with a capital letter." };
    if (!/[.!?]$/.test(t)) return { ok: false, msg: "End with . ! or ?" };
    const w = words.find((x) => !taken.includes(x.key) && usesWord(t, x));
    if (!w) return { ok: false, msg: "Use one of today's words (one you have not used in another sentence)." };
    return { ok: true, w, msg: "Uses: " + spoken(w) };
  }

  /* ---------- speech ---------- */
  const voiceFor = (lang) => speechSynthesis.getVoices().find((x) => x.lang && x.lang.toLowerCase().startsWith(lang));
  function sayP(text, lang, rate) {
    return new Promise((res) => {
      if (!("speechSynthesis" in window)) return res();
      const u = new SpeechSynthesisUtterance(text);
      u.lang = lang === "de" ? "de-DE" : "en-GB"; u.rate = rate;
      const v = voiceFor(lang); if (v) u.voice = v;
      u.onend = u.onerror = () => res();
      speechSynthesis.speak(u);
    });
  }
  const wait = (ms) => new Promise((r) => setTimeout(r, ms));
  const P = { run: 0, i: 0, list: [], on: false };
  function stopPlay() { P.run++; P.on = false; if ("speechSynthesis" in window) speechSynthesis.cancel(); playUI(); }
  async function playFrom(i) {
    if (!P.list.length) return;
    if ("speechSynthesis" in window) speechSynthesis.cancel();
    const run = ++P.run; P.on = true;
    const rate = +(localStorage.getItem("itsa-wrate") || 0.9);
    for (P.i = Math.max(0, Math.min(i, P.list.length - 1)); P.i < P.list.length; P.i++) {
      if (run !== P.run) return;
      playUI();
      const w = P.list[P.i];
      await sayP(spoken(w), "de", rate); if (run !== P.run) return;
      await wait(450); await sayP(w.en, "en", rate); if (run !== P.run) return;
      if (F.ex) { await wait(400); await sayP(w.ex, "de", rate); if (run !== P.run) return; }
      await wait(900);
    }
    P.on = false; playUI();
  }
  function playUI() {
    const bar = document.getElementById("wplay"); if (!bar) return;
    bar.querySelector("[data-p=toggle]").innerHTML = P.on ? "Pause" : "Play all";
    const w = P.list[P.i];
    bar.querySelector(".wp-now").innerHTML = w && (P.on || P.i) ? `<b>${esc(spoken(w))}</b> <span class="muted">${esc(w.en)}</span> <span class="muted small">${P.i + 1} / ${P.list.length}</span>` : `<span class="muted small">${P.list.length} word${P.list.length === 1 ? "" : "s"} in this list</span>`;
    document.querySelectorAll(".wrow.playing").forEach((r) => r.classList.remove("playing"));
    if (P.on && w) { const r = document.querySelector(`.wrow[data-k="${w.key}"]`); if (r) { r.classList.add("playing"); r.scrollIntoView({ block: "nearest", behavior: "smooth" }); } }
  }
  window.addEventListener("hashchange", () => { if (P.on) stopPlay(); });

  /* ---------- card face (shared by the shuffle cards and the daily duty) ---------- */
  function faceHTML(w, mode, flipped, showEx) {
    const meaning = `<p class="fc-en">${esc(w.en)}</p><p class="fc-bn">${bn(w.bn)}</p>`;
    const german = `<p class="fc-de">${esc(w.de)}</p>${sayBtn(spoken(w))}`;
    const front = mode === "meaning" ? meaning : german;
    const back = mode === "meaning" ? german : meaning;
    return `<div class="fc ${flipped ? "flipped" : ""}" tabindex="0" role="button" aria-label="Flip the card">
      <div class="fc-top">${tag(w)}<span class="wtag">${esc(topicName(w.topic))}</span></div>
      <div class="fc-main">${front}${flipped ? `<div class="fc-back">${back}</div>` : `<p class="muted small fc-hint">Tap to see the ${mode === "meaning" ? "German word" : "meaning"}</p>`}</div>
      ${showEx ? `<div class="fc-ex"><p>${esc(w.ex)} ${sayBtn(w.ex)}</p></div>` : ""}
    </div>`;
  }
  function choiceHTML(w, picked) {
    if (!w._opts) {
      const pool = WORDS.filter((x) => x.type === w.type && x.key !== w.key && x.en !== w.en);
      w._opts = shuffled([w].concat(shuffled(pool).slice(0, 3)));
    }
    return `<div class="fc choice"><div class="fc-top">${tag(w)}</div><div class="fc-main"><p class="fc-de">${esc(w.de)}</p>${sayBtn(spoken(w))}</div>
      <div class="wopts">${w._opts.map((o) => `<button class="wopt ${picked ? (o.key === w.key ? "right" : o.key === picked ? "wrong" : "") : ""}" data-o="${o.key}" ${picked ? "disabled" : ""}><span>${esc(o.en)}</span>${bn(o.bn)}</button>`).join("")}</div>
      ${picked ? `<div class="fc-ex"><p>${esc(w.ex)} ${sayBtn(w.ex)}</p></div>` : ""}</div>`;
  }

  const views = {};

  /* ---------- hub ---------- */
  views.wort = function () {
    const done = dutyDone(), streak = dutyStreak();
    return `<h1 class="page-title">Wortschatz</h1><p class="muted lead-p">${WORDS.length} German words from everyday life, the office and IT, each with English, বাংলা and an example sentence. Learn them with shuffle cards, look them up in the list, and do your Tagesziel every day.</p>
      ${statusStrip(WORDS)}
      ${done ? `<section class="card duty done"><span class="tic">${ICON("check")}</span><div><p class="pl-label">Tagesziel done</p><h3>Well done. Come back tomorrow for 20 new words.</h3><p class="muted small" style="margin:0">${streak} day${streak === 1 ? "" : "s"} in a row</p></div></section>` : dutyBanner()}
      <div class="bento">
        <a class="card task wide" href="#/wcards"><span class="tic">${ICON("cards")}</span><span class="corner">${ICON("arrowRight")}</span><p class="pl-label">Shuffle cards</p><h3>Flip, check the meaning, see an example</h3><p class="muted small" style="margin:0">Three modes: German to meaning, meaning to German, choose the right one</p></a>
        <a class="card task wide" href="#/wlist"><span class="tic">${ICON("list")}</span><span class="corner">${ICON("arrowRight")}</span><p class="pl-label">Word list</p><h3>Search and filter all ${WORDS.length} words</h3><p class="muted small" style="margin:0">With audio and Play all for listening on the way</p></a>
      </div>
      <div class="sec-h"><h2>Topics</h2><span class="muted small">${TOPICS.length} topics</span></div>
      <div class="wtopics">${TOPICS.map((t) => { const l = WORDS.filter((w) => w.topic === t.id), n = counts(l), p = Math.round(n.known / (l.length || 1) * 100);
        return `<button class="card wtopic" data-topic="${esc(t.id)}"><span class="lvlbadge">${esc(t.level)}</span><span><strong>${esc(t.topic)}</strong><small>${l.length} words · ${n.known} known · ${n.learning} learning</small></span><span class="cpct2">${p}%</span></button>`; }).join("")}</div>`;
  };
  views.wort.after = function () {
    document.querySelectorAll(".wstat .num[data-to]").forEach((n) => MOTION.countUp(n, +n.dataset.to));
    MOTION.stagger(document.querySelectorAll(".bento > .card, .wtopic"), 25);
    document.querySelectorAll("[data-topic]").forEach((b) => b.onclick = () => { F.topic = b.dataset.topic; F.status = ""; F.q = ""; keepF(); location.hash = "#/wcards"; });
  };

  /* ---------- shuffle cards ---------- */
  let deck = [], di = 0, flipped = false, showEx = false, picked = null, right = 0;
  function newDeck() { deck = shuffled(filtered()).slice(0, 25); deck.forEach((w) => delete w._opts); di = 0; flipped = false; showEx = false; picked = null; right = 0; }
  views.wcards = function () {
    if (!deck.length) newDeck();
    return `<p class="kicker"><a href="#/wort">Wortschatz</a></p><h1 class="page-title">Shuffle cards</h1>
      <details class="card wfold"><summary>Filters and mode <span class="muted small" id="wfsum"></span></summary>${filterBar(false)}
        <div class="chips wmode">${[["de", "German → meaning"], ["meaning", "Meaning → German"], ["choice", "Choose the right one"]].map(([m, l]) => `<button data-mode="${m}" class="${F.mode === m ? "on" : ""}">${l}</button>`).join("")}</div></details>
      <div id="wdeck"></div>`;
  };
  function drawCard() {
    const host = document.getElementById("wdeck"); if (!host) return;
    const sum = document.getElementById("wfsum"); if (sum) sum.textContent = `${filtered().length} words match`;
    if (!deck.length) { host.innerHTML = `<section class="card"><h3>No words match these filters</h3><p class="muted">Change the topic, level or status above.</p></section>`; return; }
    if (di >= deck.length) {
      host.innerHTML = `<section class="card wend"><span class="tic">${ICON("trophy")}</span><h3>Round complete</h3><p class="muted">${right} of ${deck.length} known. Cards you did not know come back tomorrow.</p><button class="btn" id="wagain">Shuffle a new round</button> <a class="btn ghost" href="#/wlist">Open the list</a></section>`;
      $("#wagain").onclick = () => { newDeck(); drawCard(); };
      return;
    }
    const w = deck[di];
    host.innerHTML = `<div class="wprog"><span>${di + 1} / ${deck.length}</span><div class="cprog"><i style="width:${di / deck.length * 100}%"></i></div><button class="btn ghost sm" id="wshuf">Shuffle</button></div>
      ${F.mode === "choice" ? choiceHTML(w, picked) : faceHTML(w, F.mode, flipped, showEx)}
      <div class="wact">${F.mode === "choice"
        ? (picked ? `<button class="btn" id="wnext">Next card</button>` : `<button class="btn ghost" id="wskip">Skip</button>`)
        : `<button class="btn ghost" id="wex">${showEx ? "Hide example" : "Beispiel"}</button>${flipped ? `<button class="btn ghost" id="wno">Not yet</button><button class="btn" id="wyes">I knew it</button>` : `<button class="btn" id="wflip">Flip</button>`}`}</div>
      <p class="muted small wkeys">Keys: Space flips, B shows the example, 1 = not yet, 2 = I knew it</p>`;
    const card = host.querySelector(".fc");
    const doFlip = () => { if (F.mode === "choice") return; flipped = !flipped; drawCard(); MOTION.flip(document.querySelector("#wdeck .fc")); };
    if (F.mode !== "choice") card.addEventListener("click", (e) => { if (!e.target.closest(".say")) doFlip(); });
    const on = (id, fn) => { const b = document.getElementById(id); if (b) b.onclick = fn; };
    on("wflip", doFlip);
    on("wex", () => { showEx = !showEx; drawCard(); });
    const go = (knew) => { grade(w, knew); if (knew) right++; di++; flipped = false; showEx = false; picked = null; drawCard(); };
    on("wyes", () => go(true)); on("wno", () => go(false));
    on("wnext", () => { di++; picked = null; drawCard(); });
    on("wskip", () => { di++; drawCard(); });
    on("wshuf", () => { newDeck(); drawCard(); });
    host.querySelectorAll(".wopt").forEach((b) => b.onclick = () => {
      picked = b.dataset.o; const ok = picked === w.key; grade(w, ok); if (ok) right++;
      drawCard(); const el = document.querySelector("#wdeck .fc"); (ok ? MOTION.pop : MOTION.shake)(el);
      if (ok && "speechSynthesis" in window) sayP(spoken(w), "de", 0.9);
    });
    deckKeys.w = w; deckKeys.go = go; deckKeys.flip = doFlip;
  }
  const deckKeys = {};
  document.addEventListener("keydown", (e) => {
    if (!document.getElementById("wdeck") || /input|textarea|select/i.test(document.activeElement.tagName) || F.mode === "choice") return;
    if (e.key === " ") { e.preventDefault(); deckKeys.flip && deckKeys.flip(); }
    else if (e.key === "b" || e.key === "B") { showEx = !showEx; drawCard(); }
    else if (flipped && e.key === "1") deckKeys.go(false);
    else if (flipped && e.key === "2") deckKeys.go(true);
  });
  views.wcards.after = function () {
    drawCard();
    wireFilters(() => { newDeck(); drawCard(); });
    document.querySelectorAll("[data-mode]").forEach((b) => b.onclick = () => { F.mode = b.dataset.mode; keepF(); document.querySelectorAll("[data-mode]").forEach((x) => x.classList.toggle("on", x === b)); flipped = false; showEx = false; picked = null; drawCard(); });
  };

  /* ---------- word list ---------- */
  const PAGE = 120;
  let shown = PAGE;
  views.wlist = function () {
    shown = PAGE;
    const rate = localStorage.getItem("itsa-wrate") || "0.9";
    return `<p class="kicker"><a href="#/wort">Wortschatz</a></p><h1 class="page-title">Word list</h1>
      <section class="card wfold-open">${filterBar(true)}</section>
      <div id="wplay" class="card wplay"><div class="wp-btns"><button class="btn ghost sm" data-p="back" aria-label="Previous word">Back</button><button class="btn sm" data-p="toggle">Play all</button><button class="btn ghost sm" data-p="next" aria-label="Next word">Next</button></div>
        <div class="wp-now"></div>
        <div class="wp-opts"><label>Speed <select id="wrate">${["0.7", "0.9", "1.1"].map((r) => `<option ${r === rate ? "selected" : ""}>${r}</option>`).join("")}</select></label><label class="wp-ex"><input type="checkbox" id="wpex" ${F.ex ? "checked" : ""}> Read the example too</label></div></div>
      <div id="wsum" class="muted small"></div><ul class="wlist" id="wl"></ul><div id="wmore"></div>`;
  };
  function rowHTML(w) {
    const s = status(w);
    return `<li class="wrow" data-k="${w.key}"><button class="wr-head" aria-expanded="false"><span class="wr-de">${esc(w.de)}</span><span class="wr-m"><span>${esc(w.en)}</span>${bn(w.bn)}</span><span class="wdot ws-${s}" title="${STATUS_LABEL[s]}"></span></button>${sayBtn(spoken(w))}
      <div class="wr-more" hidden><p>${esc(w.ex)} ${sayBtn(w.ex)}</p><p class="muted small">${tag(w)} ${esc(topicName(w.topic))} · <span class="wst">${STATUS_LABEL[s]}</span></p>
      <div class="wr-act"><button class="btn ghost sm" data-g="0">Still learning</button><button class="btn sm" data-g="1">I know it</button></div></div></li>`;
  }
  function drawList() {
    const ul = document.getElementById("wl"); if (!ul) return;
    const list = filtered();
    P.list = list; if (P.on) stopPlay(); P.i = 0; playUI();
    document.getElementById("wsum").innerHTML = `${list.length} word${list.length === 1 ? "" : "s"} · ${(() => { const n = counts(list); return `${n.new} new, ${n.learning} learning, ${n.known} known`; })()}`;
    ul.innerHTML = list.slice(0, shown).map(rowHTML).join("") || `<li class="muted">No words match. Try another spelling or clear a filter.</li>`;
    document.getElementById("wmore").innerHTML = list.length > shown ? `<button class="btn ghost" id="wmorebtn">Show ${Math.min(PAGE, list.length - shown)} more</button>` : "";
    const mb = document.getElementById("wmorebtn"); if (mb) mb.onclick = () => { shown += PAGE; const keep = P.list; drawList(); P.list = keep; };
  }
  views.wlist.after = function () {
    drawList();
    wireFilters(() => { shown = PAGE; drawList(); });
    $("#wl").addEventListener("click", (e) => {
      const row = e.target.closest(".wrow"); if (!row) return;
      const w = BYKEY[row.dataset.k];
      const g = e.target.closest("[data-g]");
      if (g) { const S = st(); if (g.dataset.g === "1") S.cards[w.key] = { box: KNOWN_BOX, due: SRS.today() + 8 * 86400000 }; else S.cards[w.key] = SRS.next(S.cards[w.key], false); save();
        const s = status(w); row.querySelector(".wdot").className = "wdot ws-" + s; row.querySelector(".wst").textContent = STATUS_LABEL[s]; MOTION.pop(g); return; }
      const head = e.target.closest(".wr-head");
      if (head) { const more = row.querySelector(".wr-more"); more.hidden = !more.hidden; head.setAttribute("aria-expanded", String(!more.hidden)); if (!more.hidden) MOTION.page(more); }
    });
    const bar = $("#wplay");
    bar.querySelector("[data-p=toggle]").onclick = () => (P.on ? stopPlay() : playFrom(P.i));
    bar.querySelector("[data-p=back]").onclick = () => playFrom(P.i - 1);
    bar.querySelector("[data-p=next]").onclick = () => playFrom(P.i + 1);
    $("#wrate").onchange = (e) => { localStorage.setItem("itsa-wrate", e.target.value); if (P.on) playFrom(P.i); };
    $("#wpex").onchange = (e) => { F.ex = e.target.checked; keepF(); };
    if (!("speechSynthesis" in window)) bar.querySelector(".wp-now").innerHTML = `<span class="muted small">This browser cannot read aloud.</span>`;
  };

  /* ---------- daily duty: learn, test, write ---------- */
  let dFlip = false, dEx = false, tq = [], ti = 0, tScore = 0, tPicked = null;
  views.wday = function () {
    duty();
    return `<p class="kicker"><a href="#/wort">Wortschatz</a></p><h1 class="page-title">Tagesziel</h1>
      <p class="muted lead-p">Every day: learn 20 new words, pass a short test (${PASS} of ${TEST_N}), then write ${SENTS} sentences of your own with today's words. It stays on your Today page until it is done.</p>
      <div class="duty-steps big" id="dsteps"></div><div id="dbody"></div>`;
  };
  function drawDuty() {
    const S = st(), d = duty(), words = dutyWords(), body = document.getElementById("dbody"); if (!body) return;
    document.getElementById("dsteps").innerHTML = STEP_NAMES.map((n, i) => `<span class="${dutyDone() || i < d.step ? "done" : i === d.step ? "now" : ""}">${dutyDone() || i < d.step ? ICON("check") : i + 1} ${n}</span>`).join("");
    if (dutyDone()) {
      body.innerHTML = `<section class="card wend"><span class="tic">${ICON("trophy")}</span><h3>Tagesziel done</h3><p class="muted">20 words learned, test passed, 3 sentences written. ${dutyStreak()} day${dutyStreak() === 1 ? "" : "s"} in a row.</p>
        <ol class="dsents">${d.s.map((s) => `<li>${esc(s)} ${sayBtn(s)}</li>`).join("")}</ol><a class="btn" href="#/wcards">Keep practising with cards</a> <a class="btn ghost" href="#/today">Back to Today</a></section>`;
      return;
    }
    if (d.step === 0) {
      const w = words[d.p];
      body.innerHTML = `<div class="wprog"><span>Word ${d.p + 1} / ${words.length}</span><div class="cprog"><i style="width:${d.p / words.length * 100}%"></i></div></div>
        ${faceHTML(w, "de", dFlip, dEx)}
        <div class="wact"><button class="btn ghost" id="dback" ${d.p === 0 ? "disabled" : ""}>Back</button><button class="btn ghost" id="dex">${dEx ? "Hide example" : "Beispiel"}</button>
        ${dFlip ? `<button class="btn" id="dnext">${d.p + 1 === words.length ? "Start the test" : "Next word"}</button>` : `<button class="btn" id="dflip">Flip</button>`}</div>
        <p class="muted small wkeys">Flip every card and read the example. Say each word out loud once.</p>`;
      const flip = () => { dFlip = !dFlip; drawDuty(); MOTION.flip(document.querySelector("#dbody .fc")); };
      body.querySelector(".fc").addEventListener("click", (e) => { if (!e.target.closest(".say")) flip(); });
      const on = (id, fn) => { const b = document.getElementById(id); if (b) b.onclick = fn; };
      on("dflip", flip); on("dex", () => { dEx = !dEx; drawDuty(); });
      on("dback", () => { d.p--; dFlip = false; dEx = false; save(); drawDuty(); });
      on("dnext", () => {
        if (!S.cards[w.key]) S.cards[w.key] = SRS.next(undefined, false); // the word is now "learning" and comes back in the cards tomorrow
        dFlip = false; dEx = false;
        if (d.p + 1 >= words.length) { d.step = 1; tq = []; } else d.p++;
        save(); drawDuty();
      });
      return;
    }
    if (d.step === 1) {
      if (!tq.length) { tq = shuffled(words).slice(0, TEST_N); tq.forEach((w) => delete w._opts); ti = 0; tScore = 0; tPicked = null; }
      if (ti >= tq.length) {
        const pass = tScore >= PASS; d.t = Math.max(d.t, tScore);
        if (pass) { d.step = 2; save(); }
        body.innerHTML = `<section class="card wend"><span class="tic">${ICON(pass ? "trophy" : "alert")}</span><h3>${tScore} of ${tq.length} right</h3><p class="muted">${pass ? "Test passed. Now use the words in your own sentences." : `You need ${PASS}. Look at the words once more, then try again.`}</p>
          ${pass ? `<button class="btn" id="dgo">Write my sentences</button>` : `<button class="btn" id="dretry">Try the test again</button> <button class="btn ghost" id="drelearn">Look at the words again</button>`}</section>`;
        const on = (id, fn) => { const b = document.getElementById(id); if (b) b.onclick = fn; };
        on("dgo", drawDuty); on("dretry", () => { tq = []; drawDuty(); });
        on("drelearn", () => { d.step = 0; d.p = 0; tq = []; save(); drawDuty(); });
        return;
      }
      const w = tq[ti];
      body.innerHTML = `<div class="wprog"><span>Question ${ti + 1} / ${tq.length} · ${tScore} right</span><div class="cprog"><i style="width:${ti / tq.length * 100}%"></i></div></div>
        ${choiceHTML(w, tPicked)}<div class="wact">${tPicked ? `<button class="btn" id="tnext">${ti + 1 === tq.length ? "See the result" : "Next question"}</button>` : ""}</div>`;
      body.querySelectorAll(".wopt").forEach((b) => b.onclick = () => {
        tPicked = b.dataset.o; const ok = tPicked === w.key; if (ok) tScore++; grade(w, ok);
        drawDuty(); (ok ? MOTION.pop : MOTION.shake)(document.querySelector("#dbody .fc"));
      });
      const n = document.getElementById("tnext"); if (n) n.onclick = () => { ti++; tPicked = null; drawDuty(); };
      return;
    }
    // step 2: three sentences, each with a different word from today
    body.innerHTML = `<section class="card"><h3>Write ${SENTS} sentences</h3><p class="muted">Each sentence uses a different word from today's list, in any form. At least 4 words, a capital letter at the start, a full stop at the end.</p>
      ${[0, 1, 2].map((i) => `<label class="field">Sentence ${i + 1}<textarea class="dsent" rows="2" data-i="${i}" placeholder="z. B. Ich ${esc(spoken(words[i]).replace(/^(der|die|das) /, ""))} ...">${esc(d.s[i] || "")}</textarea><span class="dfb muted small" data-f="${i}"></span></label>`).join("")}
      <button class="btn" id="dsave" disabled>Finish Tagesziel</button></section>
      <section class="card"><h3>Today's words</h3><ul class="dwords">${words.map((w) => `<li data-k="${w.key}"><strong>${esc(spoken(w))}</strong> <span class="muted">${esc(w.en)}</span> ${bn(w.bn)}</li>`).join("")}</ul></section>`;
    const check = () => {
      const taken = [], res = [];
      body.querySelectorAll(".dsent").forEach((t, i) => { const r = checkSentence(t.value, words, taken); if (r.ok) taken.push(r.w.key); res[i] = r;
        const f = body.querySelector(`[data-f="${i}"]`); f.textContent = r.msg; f.classList.toggle("ok", r.ok); });
      body.querySelectorAll(".dwords li").forEach((li) => li.classList.toggle("used", taken.includes(li.dataset.k)));
      d.s = [...body.querySelectorAll(".dsent")].map((t) => t.value.slice(0, 400));
      localStorage.setItem("itsa-v1", JSON.stringify(st()));
      document.getElementById("dsave").disabled = !res.every((r) => r.ok);
    };
    body.querySelectorAll(".dsent").forEach((t) => t.addEventListener("input", check));
    check();
    document.getElementById("dsave").onclick = () => { d.s = d.s.map((x) => x.trim()); st().wdd[todayStr()] = 1; d.step = 3; save(); drawDuty(); MOTION.pop(document.querySelector("#dbody .wend")); };
  }
  views.wday.after = function () { dFlip = false; dEx = false; tq = []; drawDuty(); };

  return { views, dutyBanner, dutyDone, total: WORDS.length, words: WORDS, usesWord, checkSentence };
};
