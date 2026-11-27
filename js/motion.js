/* Motion system. One place for timing, easing and every animation the app uses.
   Built on the Web Animations API so any running animation can be cancelled
   and replaced (fast taps never leave the UI half-way). Honours "reduce motion". */
window.MOTION = (function () {
  const reduce = () => matchMedia("(prefers-reduced-motion: reduce)").matches;
  const T = { quick: 140, base: 260, step: 340, slow: 620, count: 900 };
  const E = {
    out: "cubic-bezier(.2,.8,.2,1)",        // standard deceleration
    in: "cubic-bezier(.4,0,1,1)",           // leaving the screen
    spring: "cubic-bezier(.34,1.56,.64,1)", // small overshoot for confirmations
    draw: "cubic-bezier(.65,0,.35,1)"
  };

  /* animate(el, frames, opts): cancels the element's previous animation first. */
  function animate(el, frames, opts) {
    if (!el || !el.animate) return null;
    if (el._anim) el._anim.cancel();
    if (reduce()) return null;
    const a = el.animate(frames, Object.assign({ duration: T.base, easing: E.out, fill: "both" }, opts));
    el._anim = a;
    a.onfinish = () => { if (el._anim === a) { a.cancel(); el._anim = null; } };
    return a;
  }

  /* Page entrance: content rises in softly. */
  function page(el) {
    return animate(el, [{ opacity: 0, transform: "translateY(10px)" }, { opacity: 1, transform: "none" }], { duration: T.base });
  }

  /* Step change in the lesson player. dir = 1 (next) or -1 (back). */
  function step(el, dir) {
    const x = 28 * dir;
    return animate(el, [
      { opacity: 0, transform: `translateX(${x}px)`, filter: "blur(2px)" },
      { opacity: 1, transform: "none", filter: "none" }
    ], { duration: T.step });
  }

  /* Staggered reveal for a group (used once per screen, on Today). */
  function stagger(nodes, gap) {
    if (reduce()) return;
    [...nodes].forEach((n, i) => animate(n, [{ opacity: 0, transform: "translateY(14px) scale(.985)" }, { opacity: 1, transform: "none" }],
      { duration: T.slow - 120, delay: 80 + i * (gap || 55) }));
  }

  /* Number counts up to its final value (keeps any suffix markup). */
  function countUp(el, to, dur) {
    if (!el) return;
    const fin = String(to);
    if (reduce() || !isFinite(to)) { el.textContent = fin; return; }
    const t0 = performance.now(), d = dur || T.count;
    cancelAnimationFrame(el._raf);
    const tick = (now) => {
      const p = Math.min(1, (now - t0) / d), e = 1 - Math.pow(1 - p, 3);
      el.textContent = Math.round(to * e);
      if (p < 1) el._raf = requestAnimationFrame(tick);
    };
    el._raf = requestAnimationFrame(tick);
  }

  /* Width grows from 0 (progress bars, gauges). */
  function grow(el, toPct, delay) {
    if (!el) return;
    if (reduce()) { el.style.width = toPct + "%"; return; }
    el.style.width = toPct + "%";
    animate(el, [{ width: "0%" }, { width: toPct + "%" }], { duration: T.slow + 300, delay: delay || 150, easing: E.out });
  }

  /* Small confirmation pop (switch turned on, correct answer). */
  function pop(el) {
    return animate(el, [{ transform: "scale(1)" }, { transform: "scale(1.06)" }, { transform: "scale(1)" }], { duration: 320, easing: E.spring, fill: "none" });
  }
  /* Gentle shake for a wrong answer. */
  function shake(el) {
    return animate(el, [{ transform: "translateX(0)" }, { transform: "translateX(-6px)" }, { transform: "translateX(5px)" }, { transform: "translateX(-3px)" }, { transform: "translateX(0)" }], { duration: 360, fill: "none" });
  }

  /* Diagram draws itself when it scrolls into view: lines trace, boxes fade up. */
  const seen = new WeakSet();
  const io = "IntersectionObserver" in window ? new IntersectionObserver((entries) => {
    entries.forEach((en) => { if (en.isIntersecting) { io.unobserve(en.target); drawNow(en.target); } });
  }, { threshold: .25 }) : null;
  function draw(svg) {
    if (!svg || seen.has(svg)) return;
    seen.add(svg);
    if (reduce() || !io) return;
    svg.classList.add("pre-draw");
    io.observe(svg);
  }
  function drawNow(svg) {
    svg.classList.remove("pre-draw");
    const lines = svg.querySelectorAll("line, path.d-a");
    lines.forEach((l, i) => {
      let len = 200;
      try { len = l.getTotalLength ? l.getTotalLength() : 200; } catch (e) { /* not rendered */ }
      const dash = l.getAttribute("stroke-dasharray");
      animate(l, [{ strokeDasharray: `${len} ${len}`, strokeDashoffset: len }, { strokeDasharray: `${len} ${len}`, strokeDashoffset: 0 }],
        { duration: 700, delay: 200 + i * 45, easing: E.draw, fill: "backwards" }).onfinish = () => { if (dash) l.setAttribute("stroke-dasharray", dash); };
    });
    svg.querySelectorAll("rect.d-box").forEach((r, i) => {
      animate(r, [{ opacity: 0 }, { opacity: 1 }], { duration: 420, delay: 60 + i * 50, fill: "backwards" });
    });
    svg.querySelectorAll("text").forEach((t, i) => {
      animate(t, [{ opacity: 0 }, { opacity: 1 }], { duration: 380, delay: 160 + i * 18, fill: "backwards" });
    });
  }

  /* 3D card flip (German flashcards). */
  function flip(el) {
    return animate(el, [{ transform: "perspective(900px) rotateY(-88deg)", opacity: .2 }, { transform: "perspective(900px) rotateY(0)", opacity: 1 }], { duration: 420, easing: E.out });
  }

  return { T, E, reduce, animate, page, step, stagger, countUp, grow, pop, shake, draw, flip };
})();
