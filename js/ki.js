/* KI: AI tutor for IT and a German conversation partner, available on every page.
   Uses the learner's own Anthropic API key, stored only in this browser (localStorage key "itsa-ki",
   never in the progress export). The SDK is loaded on first use from js/vendor/ (same origin, pinned
   copy of @anthropic-ai/sdk 1.14.0, see js/vendor/README.md). */
window.KI = (function () {
  const STORE = "itsa-ki";
  const MODELS = [
    ["claude-opus-5-5", "Claude Opus 5.5 (best quality, about 2 cents per message)"],
    ["claude-haiku-5-5", "Claude Haiku 5.5 (fast, about 40x cheaper)"]
  ];
  const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const load = () => { try { return Object.assign({ key: "", model: MODELS[0][0], level: "B1", voice: false }, JSON.parse(localStorage.getItem(STORE) || "{}")); } catch (e) { return { key: "", model: MODELS[0][0], level: "B1", voice: false }; } };
  let cfg = load();
  const saveCfg = () => localStorage.setItem(STORE, JSON.stringify(cfg));
  let mode = "it";                 // "it" | "de"
  const hist = { it: [], de: [] }; // per-mode conversation (this session only)
  let busy = false, clientP = null, rec = null, pageCtx = () => "";

  function client() {
    if (!clientP) clientP = import(new URL("js/vendor/anthropic-sdk-1.14.0.js", document.baseURI).href)
      .then((m) => new m.default({ apiKey: cfg.key, dangerouslyAllowBrowser: true }))
      .catch((e) => { clientP = null; throw e; });
    return clientP;
  }

  const SYSTEM = {
    it: () => `You are a senior IT trainer inside the "IT Support Academy" learning app. The learner is changing career into IT support, system administration or network engineering in Germany. English is not their first language.
How to answer:
- Clear, simple English (about B2). Short paragraphs. Bullet points for steps.
- Put commands and config in fenced code blocks with the shell or device named (PowerShell, Cisco IOS, bash).
- Explain the big picture first, then the detail, then one practical step they can try.
- Be accurate. If something depends on version or vendor, say so. If you are not sure, say you are not sure; never invent exam facts, prices or dates.
- End with one short question that checks understanding, unless they only asked for a quick fact.
- Stay on IT, careers in IT, certifications and job applications in Germany. Politely steer back if asked about other topics.`,
    de: () => `Du bist ein freundlicher Deutsch-Gesprächspartner in der App "IT Support Academy". Der Lerner bereitet sich auf IT-Jobs in Deutschland vor.
Niveau des Lerners: ${cfg.level} (GER). Bleibe bei Wortschatz und Grammatik dieses Niveaus, höchstens ein wenig darüber.
Regeln:
- Antworte auf Deutsch, kurz: 2 bis 4 Sätze. Stelle in jeder Antwort genau eine Frage, damit der Lerner weiterspricht.
- Themen: IT-Support am Telefon, Tickets, Kollegen, Vorstellungsgespräch, Alltag in Deutschland. Der Lerner darf das Thema wählen.
- Wenn der Lerner nur ein Wort oder einen halben Satz schreibt, bitte freundlich um einen ganzen Satz.
- Korrigiere jeden Fehler. Schreibe nach deiner Antwort eine Zeile "Korrektur:" mit dem korrigierten Satz und darunter "Warum:" mit einer sehr kurzen Erklärung auf Englisch. Wenn alles richtig war, schreibe "Korrektur: Alles richtig!"
- Achte besonders auf: Verb an Position 2, Verb am Ende nach weil/dass/wenn, haben oder sein im Perfekt, Akkusativ -en (einen, meinen), Groß- und Kleinschreibung.
- Sei geduldig und motivierend. Keine langen Grammatik-Vorträge, außer der Lerner fragt danach.`
  };

  /* Very small, safe formatter: escape first, then code blocks, bold and line breaks. */
  function fmt(t) {
    let h = esc(t);
    h = h.replace(/```(\w*)\n?([\s\S]*?)```/g, (_, lang, code) => `<pre class="ki-code"><code>${code.replace(/\n$/, "")}</code></pre>`);
    h = h.replace(/`([^`\n]+)`/g, "<code>$1</code>").replace(/\*\*([^*\n]+)\*\*/g, "<b>$1</b>");
    h = h.replace(/^(Korrektur:|Warum:)/gm, '<span class="ki-tag">$1</span>');
    return h.split(/\n{2,}/).map((p) => p.startsWith("<pre") ? p : `<p>${p.replace(/\n/g, "<br>")}</p>`).join("");
  }

  function panelHTML() {
    if (!cfg.key) return `<div class="ki-setup">
      <p class="pl-label">Set up once</p><h3>Connect your AI key</h3>
      <p>The KI tutor uses Anthropic's Claude with your own API key. The key stays only in this browser on this device. It is not uploaded to GitHub and not included when you export progress.</p>
      <ol class="steps"><li>Create an account at console.anthropic.com and add a little credit (5 USD lasts a long time with Haiku).</li><li>Create an API key (Settings > API keys) and copy it.</li><li>Paste it here.</li></ol>
      <label class="field">API key<input type="password" id="kiKey" autocomplete="off" spellcheck="false" placeholder="sk-ant-..."></label>
      <label class="field">Model<select id="kiModel">${MODELS.map(([v, l]) => `<option value="${v}" ${cfg.model === v ? "selected" : ""}>${esc(l)}</option>`).join("")}</select></label>
      <button class="btn" id="kiSave">Save and start</button>
      <p class="muted small">Prices are set by Anthropic and can change. You pay Anthropic directly; this app takes nothing.</p></div>`;
    const h = hist[mode];
    const intro = mode === "it"
      ? `<div class="ki-msg bot"><p>Ask me anything about IT: a command, an error message, a lesson you did not understand, or how to answer an interview question. I can see the page you are on.</p></div>`
      : `<div class="ki-msg bot"><p>Hallo! Ich bin dein Gesprächspartner. Wir sprechen auf Niveau <b>${esc(cfg.level)}</b>. Worüber möchtest du sprechen? Zum Beispiel: deine Arbeit, ein Telefonat im IT-Support oder ein Vorstellungsgespräch.</p></div>`;
    return `<div class="ki-modes">
        <button class="${mode === "it" ? "on" : ""}" data-kimode="it">IT tutor</button><button class="${mode === "de" ? "on" : ""}" data-kimode="de">Deutsch-Partner</button>
      </div>
      ${mode === "de" ? `<div class="ki-row"><label>Niveau <select id="kiLevel">${["A1", "A2", "B1", "B2"].map((l) => `<option ${cfg.level === l ? "selected" : ""}>${l}</option>`).join("")}</select></label>
        <label class="ki-voice"><input type="checkbox" id="kiVoice" ${cfg.voice ? "checked" : ""}> Read answers aloud</label></div>` : ""}
      <div class="ki-log" id="kiLog" aria-live="polite">${intro}${h.map((m) => `<div class="ki-msg ${m.role === "user" ? "me" : "bot"}">${m.role === "user" ? `<p>${esc(m.content)}</p>` : fmt(m.content)}</div>`).join("")}</div>
      <form class="ki-form" id="kiForm">
        <textarea id="kiIn" rows="2" placeholder="${mode === "de" ? "Schreib einen ganzen Satz..." : "Ask a question..."}" aria-label="Message"></textarea>
        <div class="ki-actions">
          <button type="button" class="icon-btn ki-mic" id="kiMic" aria-label="Speak instead of typing">${ICON("mic")}</button>
          <button type="button" class="icon-btn" id="kiClear" aria-label="Start a new conversation">${ICON("sync")}</button>
          <button class="btn ki-send" type="submit">Send</button>
        </div>
      </form>
      <p class="muted small ki-foot"><button type="button" class="linkish" id="kiSettings">Key and model</button> • Answers can be wrong; check important facts.</p>`;
  }

  function render() {
    const body = document.getElementById("kiBody"); if (!body) return;
    body.innerHTML = panelHTML();
    wire(body);
    const log = document.getElementById("kiLog"); if (log) log.scrollTop = log.scrollHeight;
  }

  function wire(body) {
    const save = body.querySelector("#kiSave");
    if (save) save.onclick = () => { const k = body.querySelector("#kiKey").value.trim(); if (!/^sk-ant-/.test(k)) { body.querySelector("#kiKey").focus(); alert("That does not look like an Anthropic API key (it starts with sk-ant-)."); return; } cfg.key = k; cfg.model = body.querySelector("#kiModel").value; saveCfg(); clientP = null; render(); };
    body.querySelectorAll("[data-kimode]").forEach((b) => b.onclick = () => { mode = b.dataset.kimode; render(); });
    const lv = body.querySelector("#kiLevel"); if (lv) lv.onchange = () => { cfg.level = lv.value; saveCfg(); hist.de = []; render(); };
    const vc = body.querySelector("#kiVoice"); if (vc) vc.onchange = () => { cfg.voice = vc.checked; saveCfg(); };
    const st = body.querySelector("#kiSettings"); if (st) st.onclick = () => { if (confirm("Remove the saved key from this device? You can paste it again afterwards.")) { cfg.key = ""; saveCfg(); clientP = null; render(); } };
    const clr = body.querySelector("#kiClear"); if (clr) clr.onclick = () => { hist[mode] = []; render(); };
    const form = body.querySelector("#kiForm"), inp = body.querySelector("#kiIn");
    if (form) {
      form.onsubmit = (e) => { e.preventDefault(); const t = inp.value.trim(); if (t && !busy) { inp.value = ""; send(t); } };
      inp.addEventListener("keydown", (e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); form.requestSubmit(); } });
    }
    const mic = body.querySelector("#kiMic");
    if (mic) mic.onclick = () => listen(mic, inp);
  }

  function listen(btn, inp) {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) { alert("Speech input is not supported in this browser. Chrome on Android and desktop supports it."); return; }
    if (rec) { rec.stop(); return; }
    rec = new SR(); rec.lang = mode === "de" ? "de-DE" : "en-US"; rec.interimResults = true; rec.continuous = false;
    btn.classList.add("rec");
    rec.onresult = (e) => { inp.value = [...e.results].map((r) => r[0].transcript).join(" "); };
    rec.onend = () => { btn.classList.remove("rec"); rec = null; if (inp.value.trim()) inp.form.requestSubmit(); };
    rec.onerror = () => { btn.classList.remove("rec"); rec = null; };
    rec.start();
  }

  function speak(text) {
    if (!cfg.voice || mode !== "de" || !("speechSynthesis" in window)) return;
    const clean = text.split(/\n\s*Korrektur:/)[0].replace(/[*`#]/g, "");
    const u = new SpeechSynthesisUtterance(clean); u.lang = "de-DE"; u.rate = 0.95;
    const v = speechSynthesis.getVoices().find((x) => x.lang && x.lang.startsWith("de")); if (v) u.voice = v;
    speechSynthesis.cancel(); speechSynthesis.speak(u);
  }

  async function send(text, opts) {
    opts = opts || {};
    const m = opts.mode || mode;
    hist[m].push({ role: "user", content: text });
    if (!opts.silent) render();
    const log = document.getElementById("kiLog");
    const bubble = document.createElement("div"); bubble.className = "ki-msg bot"; bubble.innerHTML = '<p class="ki-typing"><i></i><i></i><i></i></p>';
    if (log && !opts.silent) { log.appendChild(bubble); log.scrollTop = log.scrollHeight; }
    busy = true;
    let out = "";
    try {
      const c = await client();
      const ctx = pageCtx();
      const system = SYSTEM[m]() + (ctx && m === "it" ? `\n\nThe learner is currently on this page of the app (use it as context when relevant):\n<page>\n${ctx.slice(0, 6000)}\n</page>` : "");
      const params = { model: cfg.model, max_tokens: 4000, system, messages: hist[m].slice(-20), output_config: { effort: "low" } };
      const useFallback = cfg.model === "claude-opus-5-5";
      const stream = useFallback
        ? c.beta.messages.stream(Object.assign({ betas: ["server-side-fallback-2026-07-01"], fallbacks: "default" }, params))
        : c.messages.stream(params);
      for await (const ev of stream) {
        if (ev.type === "content_block_delta" && ev.delta.type === "text_delta") {
          out += ev.delta.text;
          if (!opts.silent) { bubble.innerHTML = fmt(out); if (log) log.scrollTop = log.scrollHeight; }
        }
      }
      const final = await stream.finalMessage();
      if (final.stop_reason === "refusal") out = out || "I can't help with that one. Try asking about it in a different way.";
      if (final.stop_reason === "max_tokens") out += "\n\n(Answer cut off. Ask me to continue.)";
      hist[m].push({ role: "assistant", content: out });
      if (!opts.silent) { bubble.innerHTML = fmt(out); speak(out); }
      return out;
    } catch (err) {
      const status = err && err.status;
      const msg = status === 401 ? "The API key was rejected. Check it under Key and model." : status === 429 ? "Too many requests or no credit left. Wait a minute or add credit in the Anthropic console."
        : status === 400 ? "The request was not accepted (" + esc(err.message || "400") + ")." : "Could not reach the AI service. Check your internet connection.";
      hist[m].pop();
      if (!opts.silent) bubble.innerHTML = `<p class="ki-err">${msg}</p>`;
      throw err;
    } finally { busy = false; }
  }

  /* One-shot check used by German drills: returns the model's feedback text. */
  async function checkSentence(task, answer, level) {
    if (!cfg.key) return null;
    const c = await client();
    const params = { model: cfg.model, max_tokens: 1200, output_config: { effort: "low" },
      system: `You check German sentences written by a learner at level ${level || cfg.level}. Reply in this exact format:
Bewertung: richtig | fast richtig | falsch
Korrektur: <the corrected sentence, or the same sentence if correct>
Warum: <one or two short sentences in English explaining each mistake>
Noch besser: <optional, one more natural way to say it at the same level>`,
      messages: [{ role: "user", content: `Task: ${task}\nLearner's sentence: ${answer}` }] };
    const res = cfg.model === "claude-opus-5-5"
      ? await c.beta.messages.create(Object.assign({ betas: ["server-side-fallback-2026-07-01"], fallbacks: "default" }, params))
      : await c.messages.create(params);
    if (res.stop_reason === "refusal") return null;
    return res.content.filter((b) => b.type === "text").map((b) => b.text).join("");
  }

  return {
    render, fmt, checkSentence, hasKey: () => !!cfg.key,
    setMode: (m) => { mode = m; }, setContext: (fn) => { pageCtx = fn; }, level: () => cfg.level
  };
})();
