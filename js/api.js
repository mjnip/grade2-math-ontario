/* =========================================================
   api.js — thin client for the Azure Functions backend
   Exposes: window.Api
   All methods return Promises and FAIL SOFTLY: when the backend
   is unavailable (offline, not deployed, or misconfigured) they
   reject, and callers fall back to local behaviour.
   ========================================================= */
(function () {
  "use strict";

  function base() {
    return (window.APP_CONFIG && window.APP_CONFIG.apiBase) || "/api";
  }

  // Abort slow requests so the UI never hangs waiting on a missing backend.
  function fetchJson(path, options, timeoutMs) {
    const controller = new AbortController();
    const t = setTimeout(() => controller.abort(), timeoutMs || 12000);
    const opts = Object.assign({ signal: controller.signal }, options || {});
    opts.headers = Object.assign({ "Content-Type": "application/json" }, opts.headers || {});
    return fetch(base() + path, opts)
      .then(function (res) {
        if (!res.ok) {
          const err = new Error("API request failed: " + res.status);
          err.status = res.status;
          throw err;
        }
        return res.status === 204 ? null : res.json();
      })
      .finally(function () { clearTimeout(t); });
  }

  function studentQuery(student) {
    const params = new URLSearchParams({
      classCode: student.classCode || "",
      name: student.name || ""
    });
    return params.toString();
  }

  // GET /api/scores?classCode=&name=  -> { attempts: [...] }
  function getScores(student) {
    return fetchJson("/scores?" + studentQuery(student), { method: "GET" });
  }

  // POST /api/scores  { student, attempt }  -> saved attempt
  function postScore(student, attempt) {
    return fetchJson("/scores", {
      method: "POST",
      body: JSON.stringify({ student: student, attempt: attempt })
    });
  }

  // POST /api/questions  { unitId, count }  -> { questions: [...] }
  function getQuestions(unitId, count) {
    return fetchJson("/questions", {
      method: "POST",
      body: JSON.stringify({ unitId: unitId, count: count })
    }, 30000); // generation can take longer
  }

  window.Api = { getScores, postScore, getQuestions };
})();
