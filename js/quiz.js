/* =========================================================
   quiz.js — Practice (graded quiz) + Homework (self-check)
   Exposes: window.Quiz.renderPractice, window.Quiz.renderHomework
   ========================================================= */
(function () {
  "use strict";

  // Tiny DOM helpers
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

  function starsFor(score, total) {
    if (total === 0) return 0;
    const pct = score / total;
    if (pct >= 0.9) return 3;
    if (pct >= 0.7) return 2;
    if (pct >= 0.5) return 1;
    return 0;
  }

  function starString(n) {
    return "⭐".repeat(n) + "☆".repeat(3 - n);
  }

  function numEqual(input, answer) {
    const a = String(input).trim().replace(/[^0-9-]/g, "");
    if (a === "") return false;
    return Number(a) === Number(answer);
  }

  /* ---------------- DYNAMIC QUESTIONS ---------------- */
  // Validate a question object (from the backend or generator) so a malformed
  // item can never break the quiz engine.
  function isValidQuestion(q) {
    if (!q || typeof q.prompt !== "string" || !q.prompt.trim()) return false;
    if (q.type === "mc") {
      return Array.isArray(q.choices) && q.choices.length >= 2 &&
        Number.isInteger(q.answer) && q.answer >= 0 && q.answer < q.choices.length;
    }
    if (q.type === "num") {
      return q.answer !== undefined && q.answer !== null && String(q.answer).trim() !== "";
    }
    return false;
  }

  // Fetch a fresh batch of questions for a unit. Tries the Azure OpenAI backend
  // first and falls back to the offline procedural generator so the feature
  // works even with no backend or while offline.
  function fetchMoreQuestions(unit, count) {
    const n = count || 5;
    function local() {
      return window.QuestionGen ? window.QuestionGen.generate(unit.id, n) : [];
    }
    if (window.Api && window.Api.getQuestions) {
      return window.Api.getQuestions(unit.id, n)
        .then(function (data) {
          const valid = ((data && data.questions) || []).filter(isValidQuestion);
          return valid.length ? valid : local();
        })
        .catch(local);
    }
    return Promise.resolve(local());
  }

  /* ---------------- PRACTICE (graded quiz) ---------------- */
  function renderPractice(mount, unit, questionSet) {
    const questions = (Array.isArray(questionSet) && questionSet.length) ? questionSet : unit.quiz;
    let index = 0;
    let score = 0;

    const progressText = el("p", { class: "quiz-progress" });
    const bar = el("span");
    const progressBar = el("div", { class: "progressbar" }, [bar]);
    const card = el("div", { class: "card" });

    mount.appendChild(progressText);
    mount.appendChild(progressBar);
    mount.appendChild(card);

    function setProgress() {
      progressText.textContent = "Question " + (index + 1) + " of " + questions.length +
        "   •   Score: " + score;
      bar.style.width = (index / questions.length) * 100 + "%";
    }

    function renderQuestion() {
      setProgress();
      card.innerHTML = "";
      const q = questions[index];
      card.appendChild(el("p", { class: "question", text: q.prompt }));

      const feedback = el("div", { class: "feedback" });
      const actions = el("div", { class: "quiz-actions" });

      let locked = false;

      function lockAndScore(isCorrect) {
        if (locked) return;
        locked = true;
        if (isCorrect) score++;
        feedback.classList.add("show", isCorrect ? "ok" : "no");
        feedback.textContent = (isCorrect ? "✅ Correct! " : "❌ Not quite. ") + (q.explain || "");
        const isLast = index === questions.length - 1;
        const nextBtn = el("button", {
          class: "btn btn-big",
          text: isLast ? "See my results 🎉" : "Next question →",
          onClick: function () {
            index++;
            if (index >= questions.length) finish();
            else renderQuestion();
          }
        });
        actions.appendChild(nextBtn);
        nextBtn.focus();
      }

      if (q.type === "mc") {
        const choices = el("div", { class: "choices" });
        q.choices.forEach((choice, i) => {
          const btn = el("button", { class: "choice", type: "button", text: choice });
          btn.addEventListener("click", function () {
            if (locked) return;
            const correct = i === q.answer;
            btn.classList.add(correct ? "correct" : "wrong");
            if (!correct) {
              // reveal the right one
              choices.children[q.answer].classList.add("correct");
            }
            Array.from(choices.children).forEach((c) => (c.disabled = true));
            lockAndScore(correct);
          });
          choices.appendChild(btn);
        });
        card.appendChild(choices);
      } else {
        // numeric entry
        const input = el("input", { class: "", type: "text", inputmode: "numeric",
          autocomplete: "off", "aria-label": "Your answer" });
        const checkBtn = el("button", { class: "btn", text: "Check" });
        const wrap = el("div", { class: "num-answer" }, [input, checkBtn]);
        function doCheck() {
          if (locked) return;
          const correct = numEqual(input.value, q.answer);
          input.disabled = true; checkBtn.disabled = true;
          if (!correct) {
            feedback.dataset.answer = q.answer;
          }
          lockAndScore(correct);
          if (!correct) feedback.textContent += "  The answer is " + q.answer + ".";
        }
        checkBtn.addEventListener("click", doCheck);
        input.addEventListener("keydown", (e) => { if (e.key === "Enter") doCheck(); });
        card.appendChild(wrap);
        setTimeout(() => input.focus(), 0);
      }

      card.appendChild(feedback);
      card.appendChild(actions);
    }

    function finish() {
      bar.style.width = "100%";
      progressText.textContent = "All done!";
      const stars = starsFor(score, questions.length);
      const messages = [
        "Keep practising — you're learning! 🌱",
        "Nice work! A little more practice and you'll master it. 👍",
        "Great job! You really know this. 🌟",
        "WOW! Perfect superstar work! 🏆"
      ];
      card.innerHTML = "";
      const result = el("div", { class: "result" });
      result.appendChild(el("div", { class: "big-stars", text: starString(stars) }));
      result.appendChild(el("div", { class: "score", text: score + " / " + questions.length }));
      result.appendChild(el("p", { class: "msg", text: messages[stars] }));

      const actions = el("div", { class: "quiz-actions", style: "justify-content:center" });
      actions.appendChild(el("button", { class: "btn btn-big", text: "Try again 🔁",
        onClick: function () { mount.innerHTML = ""; renderPractice(mount, unit, questions); } }));

      const moreBtn = el("button", { class: "btn btn-big btn-success", text: "➕ More questions" });
      moreBtn.addEventListener("click", function () {
        if (moreBtn.disabled) return;
        moreBtn.disabled = true;
        moreBtn.textContent = "✨ Making new questions…";
        fetchMoreQuestions(unit, questions.length || 5).then(function (qs) {
          if (!qs || !qs.length) {
            moreBtn.disabled = false;
            moreBtn.textContent = "➕ More questions";
            return;
          }
          mount.innerHTML = "";
          renderPractice(mount, unit, qs);
        });
      });
      actions.appendChild(moreBtn);

      actions.appendChild(el("a", { class: "btn btn-secondary", href: "#/unit/" + unit.id + "/homework", text: "Do homework ✏️" }));
      actions.appendChild(el("a", { class: "btn btn-secondary", href: "#/", text: "🏠 Home" }));
      result.appendChild(actions);
      card.appendChild(result);

      if (window.App && window.App.saveQuizResult) {
        window.App.saveQuizResult(unit.id, score, questions.length);
      }
    }

    renderQuestion();
  }

  /* ---------------- HOMEWORK (self-check) ---------------- */
  // questionSet (optional): a freshly generated batch. When omitted, the unit's
  // built-in homework is used. This lets "✨ New questions" swap in dynamic items.
  function renderHomework(mount, unit, questionSet) {
    const items = (Array.isArray(questionSet) && questionSet.length) ? questionSet : unit.homework;
    const state = items.map(() => ({ selected: null, value: "" }));

    mount.appendChild(el("h3", { class: "print-title", text: "Homework — " + unit.title + " (Grade 2 Math)" }));
    const intro = el("p", { class: "no-print", text: "Answer each question, then press “Check answers”. You can also print this page to do it on paper." });
    mount.appendChild(intro);

    const card = el("div", { class: "card" });
    mount.appendChild(card);

    items.forEach((q, i) => {
      const item = el("div", { class: "hw-item" });
      item.appendChild(el("div", { class: "hw-num", text: (i + 1) + "." }));
      const body = el("div", { class: "hw-body" });
      body.appendChild(el("div", { class: "hw-prompt", text: q.prompt }));

      if (q.type === "mc") {
        const choices = el("div", { class: "hw-choices" });
        q.choices.forEach((choice, ci) => {
          const chip = el("button", { class: "hw-choice", type: "button", text: choice });
          chip.addEventListener("click", function () {
            state[i].selected = ci;
            Array.from(choices.children).forEach((c) => c.classList.remove("selected"));
            chip.classList.add("selected");
          });
          choices.appendChild(chip);
        });
        body.appendChild(choices);
      } else {
        const input = el("input", { class: "hw-text", type: "text", inputmode: "numeric",
          autocomplete: "off", "aria-label": "Answer for question " + (i + 1) });
        input.addEventListener("input", function () { state[i].value = input.value; });
        body.appendChild(input);
      }

      const mark = el("span", { class: "hw-mark" });
      const ans = el("div", { class: "hw-answer" });
      body.appendChild(mark);
      body.appendChild(ans);
      item.appendChild(body);
      item._mark = mark; item._ans = ans;
      card.appendChild(item);
    });

    const summary = el("p", { class: "quiz-progress no-print", "aria-live": "polite" });
    const actions = el("div", { class: "quiz-actions no-print" });
    const checkBtn = el("button", { class: "btn btn-big btn-success", text: "✅ Check answers" });
    const newBtn = el("button", { class: "btn btn-big", text: "✨ New questions" });
    const printBtn = el("button", { class: "btn btn-secondary", text: "🖨️ Print" });
    const homeLink = el("a", { class: "btn btn-secondary", href: "#/", text: "🏠 Home" });
    actions.appendChild(checkBtn);
    actions.appendChild(newBtn);
    actions.appendChild(printBtn);
    actions.appendChild(homeLink);
    mount.appendChild(summary);
    mount.appendChild(actions);

    printBtn.addEventListener("click", () => window.print());

    // Generate a fresh set of homework questions (Azure OpenAI -> offline fallback)
    // and re-render the page with them.
    newBtn.addEventListener("click", function () {
      if (newBtn.disabled) return;
      newBtn.disabled = true;
      newBtn.textContent = "✨ Making new questions…";
      fetchMoreQuestions(unit, items.length || 8).then(function (qs) {
        if (!qs || !qs.length) {
          newBtn.disabled = false;
          newBtn.textContent = "✨ New questions";
          return;
        }
        mount.innerHTML = "";
        renderHomework(mount, unit, qs);
      });
    });

    checkBtn.addEventListener("click", function () {
      let correct = 0;
      const itemNodes = card.querySelectorAll(".hw-item");
      items.forEach((q, i) => {
        const node = itemNodes[i];
        let isRight;
        if (q.type === "mc") isRight = state[i].selected === q.answer;
        else isRight = numEqual(state[i].value, q.answer);
        if (isRight) correct++;
        node._mark.textContent = isRight ? "  ✔ Correct" : "  ✘ Try again";
        node._mark.className = "hw-mark " + (isRight ? "ok" : "no");
        if (!isRight) {
          const shown = q.type === "mc" ? q.choices[q.answer] : q.answer;
          node._ans.textContent = "Answer: " + shown;
        } else {
          node._ans.textContent = "";
        }
      });
      summary.textContent = "You got " + correct + " out of " + items.length + " correct! " +
        (correct === items.length ? "🏆 Amazing!" : "Keep going — you can fix the others! 💪");
    });
  }

  window.Quiz = { renderPractice, renderHomework, starsFor, starString };
})();
