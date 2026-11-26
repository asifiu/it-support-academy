/* Spaced repetition for German cards (Leitner boxes).
   A card you know moves up a box and comes back later; a card you miss goes back to box 1. */
window.SRS = (function () {
  const DAYS = [0, 1, 2, 4, 8, 16, 32]; // box -> days until next review
  const DAY_MS = 86400000;

  function today() { const d = new Date(); d.setHours(0, 0, 0, 0); return d.getTime(); }

  function next(state, knewIt) {
    const box = knewIt ? Math.min((state ? state.box : 0) + 1, DAYS.length - 1) : 1;
    return { box, due: today() + DAYS[box] * DAY_MS };
  }

  function isDue(state) { return !state || state.due <= today(); }

  return { next, isDue, today };
})();
