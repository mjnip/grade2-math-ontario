/* =========================================================
   app.js — router, progress (localStorage), home + learn views
   Depends on: window.CURRICULUM (curriculum.js), window.Quiz (quiz.js)
   ========================================================= */
(function () {
  "use strict";

  const STORE_KEY = "g2math.progress.v1";
  const units = window.CURRICULUM;
  const mount = document.getElementById("app");

  /* ---------- DOM helper ---------- */
  function el(tag, attrs, children) {
    const node = document.createElement(tag);
    if (attrs) {
      for (const k in attrs) {
        if (k === "class") node.className = attrs[k];
        else if (k === "text") node.textContent = attrs[k];
        else if (k === "html") node.innerHTML = attrs[k];
        else if (k.startsWith("on") && typeof attrs[k] === "function")
          node.addEventListener(k.slice(2).toLowerCase(), attrs[k]);
        else if (attrs[k] !== null && attrs[k] !== undefined) node.setAttribute(k, attrs[k]);
      }
    }
    (children || []).forEach((c) => node.appendChild(typeof c === "string" ? document.createTextNode(c) : c));
    return node;
  }

  /* ---------- Progress store ---------- */
  function loadProgress() {
    try { return JSON.parse(localStorage.getItem(STORE_KEY)) || {}; }
    catch (e) { return {}; }
  }
  function saveProgress(p) {
    try { localStorage.setItem(STORE_KEY, JSON.stringify(p)); } catch (e) {}
  }
  function getUnitProgress(id) {
    return loadProgress()[id] || { learned: false, bestScore: 0, total: 0, stars: 0 };
  }
  function markLearned(id) {
    const p = loadProgress();
    p[id] = Object.assign({ learned: false, bestScore: 0, total: 0, stars: 0 }, p[id], { learned: true });
    saveProgress(p);
  }
  function saveQuizResult(id, score, total) {
    const p = loadProgress();
    const prev = p[id] || { learned: false, bestScore: 0, total: 0, stars: 0 };
    if (score >= (prev.bestScore || 0)) {
      prev.bestScore = score;
      prev.total = total;
      prev.stars = window.Quiz.starsFor(score, total);
    }
    prev.learned = true;
    p[id] = prev;
    saveProgress(p);
  }

  function getUnit(id) { return units.find((u) => u.id === id); }

  /* ---------- Shared bits ---------- */
  function unitTabs(unit, active) {
    const tabs = el("nav", { class: "tabs", "aria-label": "Unit sections" });
    [["learn", "📖 Learn"], ["practice", "📝 Practice"], ["homework", "✏️ Homework"]].forEach(([key, label]) => {
      const a = el("a", { class: "tab", href: "#/unit/" + unit.id + "/" + key, text: label });
      if (key === active) a.setAttribute("aria-current", "page");
      tabs.appendChild(a);
    });
    return tabs;
  }

  function unitHeader(unit, active) {
    const frag = document.createDocumentFragment();
    const crumbs = el("p", { class: "crumbs" });
    crumbs.appendChild(el("a", { href: "#/", text: "🏠 Home" }));
    crumbs.appendChild(document.createTextNode("  ›  " + unit.title));
    frag.appendChild(crumbs);

    const head = el("div", { class: "unit-head" }, [
      el("span", { class: "uh-emoji", text: unit.emoji }),
      el("h2", { text: unit.title })
    ]);
    frag.appendChild(head);
    frag.appendChild(el("p", { class: "overall", text: unit.overall }));
    frag.appendChild(unitTabs(unit, active));
    return frag;
  }

  /* ---------- Views ---------- */
  function renderHome() {
    document.title = "Math Adventures — Grade 2 (Ontario)";
    mount.innerHTML = "";
    const hero = el("section", { class: "hero" }, [
      el("h1", { text: "🧮 Math Adventures" }),
      el("p", { text: "Pick a unit to learn, practise, and do homework. Let's have fun with Grade 2 math!" })
    ]);
    mount.appendChild(hero);

    const grid = el("div", { class: "unit-grid" });
    const blurbs = {
      number: "Counting, place value, adding, subtracting, and fractions.",
      algebra: "Patterns, the equal sign, and finding missing numbers.",
      data: "Tally charts, graphs, and how likely things are.",
      spatial: "Shapes, solids, position, and measuring.",
      money: "Canadian coins, counting money, and smart spending."
    };
    units.forEach((u) => {
      const prog = getUnitProgress(u.id);
      const card = el("a", { class: "unit-card", href: "#/unit/" + u.id + "/learn",
        style: "--card:" + u.colour });
      card.appendChild(el("div", { class: "uc-emoji", text: u.emoji }));
      card.appendChild(el("h3", { text: u.title }));
      card.appendChild(el("p", { class: "uc-desc", text: blurbs[u.id] || "" }));
      const progRow = el("div", { class: "uc-progress" });
      if (prog.total > 0) {
        progRow.appendChild(el("span", { class: "stars", text: window.Quiz.starString(prog.stars) }));
        progRow.appendChild(el("span", { text: "Best: " + prog.bestScore + "/" + prog.total }));
      } else {
        progRow.appendChild(el("span", { text: prog.learned ? "📖 Started" : "✨ Start here" }));
      }
      card.appendChild(progRow);
      grid.appendChild(card);
    });
    mount.appendChild(grid);
  }

  function renderLearn(unit) {
    document.title = unit.title + " • Learn — Math Adventures";
    mount.innerHTML = "";
    mount.appendChild(unitHeader(unit, "learn"));
    unit.lessons.forEach((lesson) => {
      const card = el("div", { class: "card" });
      card.appendChild(el("h3", { text: lesson.title }));
      card.appendChild(el("div", { html: lesson.html }));
      mount.appendChild(card);
    });
    const done = el("div", { class: "quiz-actions" }, [
      el("a", { class: "btn btn-big", href: "#/unit/" + unit.id + "/practice",
        text: "I'm ready — Practice! 📝" })
    ]);
    mount.appendChild(done);
    markLearned(unit.id);
  }

  function renderPractice(unit) {
    document.title = unit.title + " • Practice — Math Adventures";
    mount.innerHTML = "";
    mount.appendChild(unitHeader(unit, "practice"));
    const holder = el("div");
    mount.appendChild(holder);
    window.Quiz.renderPractice(holder, unit);
  }

  function renderHomework(unit) {
    document.title = unit.title + " • Homework — Math Adventures";
    mount.innerHTML = "";
    mount.appendChild(unitHeader(unit, "homework"));
    const holder = el("div");
    mount.appendChild(holder);
    window.Quiz.renderHomework(holder, unit);
  }

  function renderNotFound() {
    mount.innerHTML = "";
    mount.appendChild(el("div", { class: "card" }, [
      el("h3", { text: "Hmm, that page wandered off! 🧭" }),
      el("p", { text: "Let's go back home and pick a unit." }),
      el("a", { class: "btn", href: "#/", text: "🏠 Back home" })
    ]));
  }

  /* ---------- Router ---------- */
  function router() {
    const hash = location.hash.replace(/^#/, "") || "/";
    const parts = hash.split("/").filter(Boolean); // e.g. ["unit","number","learn"]

    if (parts.length === 0) return done(renderHome);

    if (parts[0] === "unit" && parts[1]) {
      const unit = getUnit(parts[1]);
      if (!unit) return done(renderNotFound);
      const section = parts[2] || "learn";
      if (section === "practice") return done(() => renderPractice(unit));
      if (section === "homework") return done(() => renderHomework(unit));
      return done(() => renderLearn(unit));
    }
    return done(renderNotFound);

    function done(fn) {
      fn();
      mount.focus();
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }

  /* ---------- Reset progress ---------- */
  const resetBtn = document.getElementById("reset-btn");
  if (resetBtn) {
    resetBtn.addEventListener("click", function () {
      if (confirm("Clear all saved progress and scores? This cannot be undone.")) {
        localStorage.removeItem(STORE_KEY);
        router();
      }
    });
  }

  window.App = { saveQuizResult, markLearned, getUnitProgress };

  window.addEventListener("hashchange", router);
  router();
})();
