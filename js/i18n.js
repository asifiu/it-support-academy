/* Interface language. English is the source; German translations keyed by the English text.
   T("Next") returns "Weiter" when the app language is German. Course content is translated step by step
   (see docs/BACKLOG.md); untranslated text falls back to English. */
window.I18N = (function () {
  const KEY = "itsa-lang";
  let lang = localStorage.getItem(KEY) || ((navigator.language || "").toLowerCase().startsWith("de") ? "de" : "en");
  const DE = {
    "Today": "Heute", "Learn": "Lernen", "Practice": "Praxis", "Practise": "Üben", "Deutsch": "Deutsch", "Handbook": "Handbuch",
    "Tracks and courses": "Lernpfade und Kurse", "ITIL Foundation": "ITIL Foundation", "German for IT jobs": "Deutsch für IT-Jobs",
    "Labs and trainers": "Labs und Trainer", "Interview": "Vorstellungsgespräch", "Reference": "Nachschlagen", "Office handbook": "Büro-Handbuch",
    "Software guides": "Software-Leitfäden", "8-week quick start": "8-Wochen-Schnellstart", "App": "App", "Progress & sync": "Fortschritt & Sync",
    "Install app": "App installieren", "Install": "Installieren", "Search lessons, guides, fixes...": "Lektionen, Leitfäden, Lösungen suchen...",
    "Next": "Weiter", "Back": "Zurück", "Finish": "Abschließen", "Next module": "Nächstes Modul", "Back to course": "Zurück zum Kurs",
    "Next lesson": "Nächste Lektion", "Back to Deutsch": "Zurück zu Deutsch", "Next day": "Nächster Tag", "Week test": "Wochentest",
    "Back to guides": "Zurück zu den Leitfäden", "Back to handbook": "Zurück zum Handbuch", "Back to ITIL": "Zurück zu ITIL", "Ask KI": "KI fragen",
    "Step": "Schritt", "of": "von", "Check your understanding": "Verständnis prüfen", "Module complete": "Modul abgeschlossen", "Quiz": "Quiz",
    "Check answers": "Antworten prüfen", "Rank": "Rang", "day streak": "Tage Serie", "badges": "Abzeichen", "Top rank reached": "Höchster Rang erreicht",
    "XP to": "XP bis", "Badges": "Abzeichen", "Career track": "Lernpfad", "Your road": "Dein Weg", "of the way": "des Weges", "Destination": "Ziel",
    "Job-ready. Time to send those applications.": "Jobbereit. Zeit für Bewerbungen!", "Checkpoint": "Kontrollpunkt", "you are here": "du bist hier",
    "Courses by subject": "Kurse nach Thema", "Also here": "Außerdem", "Modules": "Module", "Start the course": "Kurs starten", "Review the course": "Kurs wiederholen",
    "Continue": "Weiter lernen", "Certifications to aim for": "Ziel-Zertifizierungen", "Pick up from here": "Hier weitermachen", "Your routine": "Deine Routine",
    "This week": "Diese Woche", "Open the plan": "Plan öffnen", "Good morning": "Guten Morgen", "Good afternoon": "Guten Tag", "Good evening": "Guten Abend",
    "Levels": "Niveaus", "Being written": "In Arbeit", "Deutsch Arcade": "Deutsch-Arcade", "Play again": "Nochmal spielen", "Other games": "Andere Spiele",
    "Score": "Punkte", "Best": "Rekord", "Combo": "Kombo", "Moves": "Züge", "Streak": "Serie", "Cisco command line": "Cisco-Kommandozeile",
    "Trainers": "Trainer", "Subnetting trainer": "Subnetting-Trainer", "Ticket trainer": "Ticket-Trainer", "Your home lab": "Dein Heimlabor",
    "Interview practice": "Interview-Training", "Language": "Sprache", "Completed": "Abgeschlossen", "modules": "Module", "hours": "Stunden",
    "Practice labs": "Übungslabs", "Start again": "Neu starten", "Lesson by lesson": "Lektion für Lektion", "Choose your career track": "Wähle deinen Lernpfad"
  };
  const T = (en) => (lang === "de" && DE[en]) || en;
  function apply(root) {
    (root || document).querySelectorAll("[data-i18n]").forEach((el) => {
      const en = el.dataset.i18n; const txt = T(en);
      const node = [...el.childNodes].reverse().find((n) => n.nodeType === 3 && n.textContent.trim());
      if (node) node.textContent = txt; else el.appendChild(document.createTextNode(txt));
    });
    (root || document).querySelectorAll("[data-i18n-ph]").forEach((el) => { el.placeholder = T(el.dataset.i18nPh); });
    document.documentElement.lang = lang;
  }
  function set(l) { lang = l === "de" ? "de" : "en"; localStorage.setItem(KEY, lang); apply(); }
  return { T, apply, set, get lang() { return lang; } };
})();
window.T = window.I18N.T;
