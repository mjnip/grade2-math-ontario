/* =========================================================
   store.js — student identity + score history (with sync)
   Exposes: window.Store

   Storage keys:
     g2math.student      -> { name, classCode }
     g2math.progress.v2  -> { [unitId]: UnitProgress }   (migrated from v1)

   UnitProgress:
     { learned, bestScore, total, stars, attempts: [Attempt] }
   Attempt:
     { id, score, total, stars, at }   // at = ISO timestamp

   Local storage is always the source of truth for offline use; when a
   student identity is set and the backend is reachable, attempts are
   mirrored to/from Azure so progress follows the student across devices.
   ========================================================= */
(function () {
  "use strict";

  const V1_KEY = "g2math.progress.v1";
  const V2_KEY = "g2math.progress.v2";
  const STUDENT_KEY = "g2math.student";

  function stars(score, total) {
    return window.Quiz ? window.Quiz.starsFor(score, total) : 0;
  }

  function emptyUnit() {
    return { learned: false, bestScore: 0, total: 0, stars: 0, attempts: [] };
  }

  /* ---------- low-level persistence ---------- */
  function readJson(key) {
    try { return JSON.parse(localStorage.getItem(key)); }
    catch (e) { return null; }
  }
  function writeJson(key, value) {
    try { localStorage.setItem(key, JSON.stringify(value)); } catch (e) {}
  }

  /* ---------- migration v1 -> v2 ---------- */
  function migrate() {
    if (readJson(V2_KEY)) return; // already migrated
    const v1 = readJson(V1_KEY);
    const v2 = {};
    if (v1 && typeof v1 === "object") {
      Object.keys(v1).forEach(function (id) {
        const u = v1[id] || {};
        const unit = Object.assign(emptyUnit(), {
          learned: !!u.learned,
          bestScore: u.bestScore || 0,
          total: u.total || 0,
          stars: u.stars || 0
        });
        // Seed a single historical attempt so the timeline isn't empty.
        if (unit.total > 0) {
          unit.attempts.push({
            id: "import-" + id,
            score: unit.bestScore,
            total: unit.total,
            stars: unit.stars,
            at: new Date().toISOString(),
            imported: true
          });
        }
        v2[id] = unit;
      });
    }
    writeJson(V2_KEY, v2);
  }

  function load() {
    migrate();
    return readJson(V2_KEY) || {};
  }
  function save(p) { writeJson(V2_KEY, p); }

  /* ---------- student identity ---------- */
  function getStudent() {
    const s = readJson(STUDENT_KEY);
    if (s && s.name) return s;
    return null;
  }
  function setStudent(student) {
    const clean = {
      name: String((student && student.name) || "").trim().slice(0, 40),
      classCode: String((student && student.classCode) || "").trim().slice(0, 40)
    };
    writeJson(STUDENT_KEY, clean);
    return clean;
  }
  function clearStudent() {
    try { localStorage.removeItem(STUDENT_KEY); } catch (e) {}
  }

  /* ---------- reads ---------- */
  function getUnitProgress(id) {
    return Object.assign(emptyUnit(), load()[id]);
  }
  function getAllProgress() { return load(); }

  /* ---------- writes ---------- */
  function markLearned(id) {
    const p = load();
    p[id] = Object.assign(emptyUnit(), p[id], { learned: true });
    save(p);
  }

  // Record a completed practice attempt. Always keeps full history and the
  // best score. Returns the new attempt. Mirrors to the backend when possible.
  function recordAttempt(id, score, total) {
    const p = load();
    const unit = Object.assign(emptyUnit(), p[id]);
    const attempt = {
      id: "a-" + Date.now() + "-" + Math.random().toString(36).slice(2, 7),
      score: score,
      total: total,
      stars: stars(score, total),
      at: new Date().toISOString()
    };
    unit.attempts.push(attempt);
    unit.learned = true;
    if (score >= (unit.bestScore || 0)) {
      unit.bestScore = score;
      unit.total = total;
      unit.stars = attempt.stars;
    }
    p[id] = unit;
    save(p);

    // Best-effort cloud mirror — never block or break the UI on failure.
    const student = getStudent();
    if (student && window.Api) {
      window.Api.postScore(student, Object.assign({ unitId: id }, attempt))
        .catch(function () { /* offline / no backend: local copy is kept */ });
    }
    return attempt;
  }

  /* ---------- sync from server ---------- */
  // Pull server-side attempts and merge them into local history (dedupe by id).
  function syncFromServer() {
    const student = getStudent();
    if (!student || !window.Api) return Promise.resolve(false);
    return window.Api.getScores(student).then(function (data) {
      const attempts = (data && data.attempts) || [];
      if (!attempts.length) return false;
      const p = load();
      attempts.forEach(function (a) {
        if (!a || !a.unitId) return;
        const unit = Object.assign(emptyUnit(), p[a.unitId]);
        const exists = unit.attempts.some(function (x) { return x.id === a.id; });
        if (!exists) {
          unit.attempts.push({
            id: a.id, score: a.score, total: a.total,
            stars: a.stars != null ? a.stars : stars(a.score, a.total),
            at: a.at
          });
        }
        unit.learned = true;
        if (a.score >= (unit.bestScore || 0)) {
          unit.bestScore = a.score; unit.total = a.total;
          unit.stars = a.stars != null ? a.stars : stars(a.score, a.total);
        }
        p[a.unitId] = unit;
      });
      // Keep each unit's attempts sorted oldest -> newest.
      Object.keys(p).forEach(function (id) {
        if (p[id] && p[id].attempts) {
          p[id].attempts.sort(function (x, y) {
            return new Date(x.at) - new Date(y.at);
          });
        }
      });
      save(p);
      return true;
    }).catch(function () { return false; });
  }

  /* ---------- reset ---------- */
  function reset() {
    try {
      localStorage.removeItem(V2_KEY);
      localStorage.removeItem(V1_KEY);
    } catch (e) {}
  }

  window.Store = {
    getStudent, setStudent, clearStudent,
    getUnitProgress, getAllProgress,
    markLearned, recordAttempt, syncFromServer, reset
  };
})();
