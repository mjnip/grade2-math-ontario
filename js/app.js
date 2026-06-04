/* =========================================================
   app.js — router, views, progress dashboard, student identity
   Depends on: window.CURRICULUM, window.Quiz, window.Store, window.Api
   ========================================================= */
(function () {
  "use strict";

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

  /* ---------- Progress store (delegates to window.Store) ---------- */
  function getUnitProgress(id) { return window.Store.getUnitProgress(id); }
  function markLearned(id) { window.Store.markLearned(id); }
  function saveQuizResult(id, score, total) {
    window.Store.recordAttempt(id, score, total);
    // Refresh any open progress view after a new attempt is recorded.
    if (location.hash.replace(/^#/, "") === "/progress") router();
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

  /* ---------- Progress dashboard (scores over time) ---------- */
  function unitTitle(id) {
    const u = getUnit(id);
    return u ? (u.emoji + " " + u.title) : id;
  }

  // Tiny inline SVG sparkline of attempt percentages over time.
  function sparkline(attempts) {
    const w = 220, h = 44, pad = 4;
    const pts = attempts.map(function (a) {
      return a.total > 0 ? a.score / a.total : 0;
    });
    const svgNs = "http://www.w3.org/2000/svg";
    const svg = document.createElementNS(svgNs, "svg");
    svg.setAttribute("viewBox", "0 0 " + w + " " + h);
    svg.setAttribute("class", "sparkline");
    svg.setAttribute("role", "img");
    svg.setAttribute("aria-label", "Score trend across " + attempts.length + " attempts");
    if (pts.length === 1) {
      // Single attempt: draw a dot so there's something to see.
      const cy = h - pad - pts[0] * (h - 2 * pad);
      const dot = document.createElementNS(svgNs, "circle");
      dot.setAttribute("cx", w / 2); dot.setAttribute("cy", cy);
      dot.setAttribute("r", 4); dot.setAttribute("fill", "#2563eb");
      svg.appendChild(dot);
      return svg;
    }
    const step = (w - 2 * pad) / (pts.length - 1);
    const coords = pts.map(function (p, i) {
      const x = pad + i * step;
      const y = h - pad - p * (h - 2 * pad);
      return x.toFixed(1) + "," + y.toFixed(1);
    });
    const poly = document.createElementNS(svgNs, "polyline");
    poly.setAttribute("points", coords.join(" "));
    poly.setAttribute("fill", "none");
    poly.setAttribute("stroke", "#2563eb");
    poly.setAttribute("stroke-width", "3");
    poly.setAttribute("stroke-linecap", "round");
    poly.setAttribute("stroke-linejoin", "round");
    svg.appendChild(poly);
    return svg;
  }

  function formatDate(iso) {
    try {
      const d = new Date(iso);
      return d.toLocaleDateString(undefined, { month: "short", day: "numeric" }) +
        " " + d.toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" });
    } catch (e) { return ""; }
  }

  function renderProgress() {
    document.title = "My Progress — Math Adventures";
    mount.innerHTML = "";

    const crumbs = el("p", { class: "crumbs" });
    crumbs.appendChild(el("a", { href: "#/", text: "🏠 Home" }));
    crumbs.appendChild(document.createTextNode("  ›  My Progress"));
    mount.appendChild(crumbs);

    const student = window.Store.getStudent();
    mount.appendChild(el("div", { class: "unit-head" }, [
      el("span", { class: "uh-emoji", text: "📈" }),
      el("h2", { text: student ? (student.name + "’s Progress") : "My Progress" })
    ]));

    if (student && student.classCode) {
      mount.appendChild(el("p", { class: "overall", text: "Class: " + student.classCode }));
    } else if (!student) {
      const tip = el("p", { class: "overall" });
      tip.appendChild(document.createTextNode("Tip: "));
      const link = el("a", { href: "#", text: "sign in" });
      link.addEventListener("click", function (e) { e.preventDefault(); promptStudent(); });
      tip.appendChild(link);
      tip.appendChild(document.createTextNode(" with your name to save and sync your scores across devices."));
      mount.appendChild(tip);
    }

    const all = window.Store.getAllProgress();
    const ids = units.map(function (u) { return u.id; }).filter(function (id) {
      return all[id] && all[id].attempts && all[id].attempts.length;
    });

    if (!ids.length) {
      mount.appendChild(el("div", { class: "card" }, [
        el("h3", { text: "No scores yet! 🌱" }),
        el("p", { text: "Finish a Practice quiz and your scores will show up here, tracked over time." }),
        el("a", { class: "btn", href: "#/", text: "Pick a unit" })
      ]));
      return;
    }

    ids.forEach(function (id) {
      const prog = all[id];
      const attempts = prog.attempts.slice().sort(function (a, b) {
        return new Date(a.at) - new Date(b.at);
      });
      const latest = attempts[attempts.length - 1];

      const card = el("div", { class: "card progress-card" });
      const head = el("div", { class: "pc-head" }, [
        el("h3", { text: unitTitle(id) }),
        el("span", { class: "stars", text: window.Quiz.starString(prog.stars) })
      ]);
      card.appendChild(head);

      const stats = el("div", { class: "pc-stats" }, [
        el("span", { text: "Best: " + prog.bestScore + "/" + prog.total }),
        el("span", { text: "Latest: " + latest.score + "/" + latest.total }),
        el("span", { text: "Attempts: " + attempts.length })
      ]);
      card.appendChild(stats);
      card.appendChild(sparkline(attempts));

      // Recent attempts list (newest first, capped).
      const recent = attempts.slice(-5).reverse();
      const list = el("ul", { class: "attempt-list" });
      recent.forEach(function (a) {
        list.appendChild(el("li", {}, [
          el("span", { class: "al-score", text: a.score + "/" + a.total }),
          el("span", { class: "al-stars", text: window.Quiz.starString(a.stars) }),
          el("span", { class: "al-date", text: formatDate(a.at) + (a.imported ? " (imported)" : "") })
        ]));
      });
      card.appendChild(list);

      card.appendChild(el("div", { class: "quiz-actions" }, [
        el("a", { class: "btn btn-secondary", href: "#/unit/" + id + "/practice", text: "Practise again 📝" })
      ]));
      mount.appendChild(card);
    });
  }

  /* ---------- Not found ---------- */
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
    if (parts[0] === "progress") return done(renderProgress);

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

  /* ---------- Student identity ---------- */
  function refreshStudentButton() {
    const btn = document.getElementById("student-btn");
    if (!btn) return;
    const s = window.Store.getStudent();
    btn.textContent = s ? ("👤 " + s.name) : "👤 Sign in";
    btn.title = s ? "Change who is using the app" : "Set who is using the app";
  }

  function promptStudent() {
    const current = window.Store.getStudent() || { name: "", classCode: "" };
    const name = prompt("What's your name? (used to save and sync your scores)", current.name || "");
    if (name === null) return; // cancelled
    const trimmed = name.trim();
    if (!trimmed) {
      // Empty name clears the identity (back to local-only, on this device).
      window.Store.clearStudent();
      refreshStudentButton();
      return;
    }
    const classCode = prompt("Class code? (optional — ask your teacher, or leave blank)", current.classCode || "");
    window.Store.setStudent({ name: trimmed, classCode: classCode === null ? "" : classCode });
    refreshStudentButton();
    // Pull any existing scores for this student from the cloud, then refresh.
    window.Store.syncFromServer().then(function () { router(); });
  }

  const studentBtn = document.getElementById("student-btn");
  if (studentBtn) studentBtn.addEventListener("click", promptStudent);

  /* ---------- Reset progress ---------- */
  const resetBtn = document.getElementById("reset-btn");
  if (resetBtn) {
    resetBtn.addEventListener("click", function () {
      if (confirm("Clear all saved progress and scores on this device? This cannot be undone.")) {
        window.Store.reset();
        router();
      }
    });
  }

  window.App = { saveQuizResult, markLearned, getUnitProgress };

  // Boot: show current student, pull cloud scores if signed in, then render.
  refreshStudentButton();
  window.addEventListener("hashchange", router);
  if (window.Store.getStudent()) {
    window.Store.syncFromServer().then(function () { router(); });
  }
  router();
})();
