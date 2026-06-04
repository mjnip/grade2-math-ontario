/* =========================================================
   generator.js — offline procedural question generator
   Exposes: window.QuestionGen.generate(unitId, count)

   Used as a FALLBACK for the "More questions" feature when the
   Azure OpenAI backend is unavailable (offline or not deployed),
   so the app keeps working everywhere. Produces questions in the
   same shape the quiz engine expects:
     { type:'mc',  prompt, choices:[...], answer:<index>, explain }
     { type:'num', prompt, answer:<number>, explain }
   ========================================================= */
(function () {
  "use strict";

  function randInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }
  function pick(arr) { return arr[randInt(0, arr.length - 1)]; }

  // Build a multiple-choice question from a correct numeric answer and a set
  // of plausible distractors, shuffling so the answer index varies.
  function mcFromNumber(prompt, answer, distractors, explain) {
    const options = [answer];
    distractors.forEach(function (d) {
      if (d !== answer && options.indexOf(d) === -1) options.push(d);
    });
    // shuffle
    for (let i = options.length - 1; i > 0; i--) {
      const j = randInt(0, i);
      const tmp = options[i]; options[i] = options[j]; options[j] = tmp;
    }
    return {
      type: "mc",
      prompt: prompt,
      choices: options.map(String),
      answer: options.indexOf(answer),
      explain: explain
    };
  }

  const generators = {
    number: function () {
      const kind = randInt(0, 3);
      if (kind === 0) {
        const a = randInt(11, 80), b = randInt(5, 19);
        return { type: "num", prompt: "What is " + a + " + " + b + "?", answer: a + b,
          explain: a + " + " + b + " = " + (a + b) + "." };
      }
      if (kind === 1) {
        const a = randInt(30, 99), b = randInt(2, a - 1 < 25 ? a - 1 : 25);
        return { type: "num", prompt: "What is " + a + " − " + b + "?", answer: a - b,
          explain: a + " − " + b + " = " + (a - b) + "." };
      }
      if (kind === 2) {
        const step = pick([2, 5, 10, 25]);
        const start = step * randInt(1, 4);
        const seq = [start, start + step, start + 2 * step];
        return { type: "num", prompt: "Skip count by " + step + "s: " + seq.join(", ") + ", ___",
          answer: start + 3 * step, explain: "Add " + step + " each time." };
      }
      const n = randInt(101, 199);
      const tens = Math.floor((n % 100) / 10);
      return mcFromNumber("How many tens are in the number " + n + "?", tens,
        [tens + 1, Math.max(0, tens - 1), Math.floor(n / 100)],
        "The tens digit of " + n + " is " + tens + ".");
    },

    algebra: function () {
      const kind = randInt(0, 2);
      if (kind === 0) {
        const step = pick([2, 3, 5, 10]);
        const start = randInt(1, 8) * step;
        const seq = [start, start + step, start + 2 * step];
        return { type: "num", prompt: "Growing pattern: " + seq.join(", ") + ", ___",
          answer: start + 3 * step, explain: "We add " + step + " each time." };
      }
      if (kind === 1) {
        const step = pick([2, 3, 5]);
        const start = step * randInt(4, 9);
        const seq = [start, start - step, start - 2 * step];
        return { type: "num", prompt: "Shrinking pattern: " + seq.join(", ") + ", ___",
          answer: start - 3 * step, explain: "We take away " + step + " each time." };
      }
      const total = randInt(6, 18), known = randInt(1, total - 1);
      return { type: "num", prompt: "Find the missing number: " + known + " + ☐ = " + total,
        answer: total - known, explain: known + " + " + (total - known) + " = " + total + "." };
    },

    data: function () {
      const counts = [randInt(2, 9), randInt(2, 9), randInt(2, 9)];
      const kind = randInt(0, 1);
      if (kind === 0) {
        const total = counts[0] + counts[1] + counts[2];
        return { type: "num",
          prompt: "A tally chart shows " + counts[0] + " cats, " + counts[1] +
            " dogs, and " + counts[2] + " birds. How many pets in all?",
          answer: total, explain: counts.join(" + ") + " = " + total + "." };
      }
      const most = Math.max.apply(null, counts);
      const labels = ["cats", "dogs", "birds"];
      const idx = counts.indexOf(most);
      return mcFromNumber("Which group has the most? " +
        labels.map(function (l, i) { return counts[i] + " " + l; }).join(", ") +
        ". How many are in the biggest group?", most,
        [most + 1, Math.max(1, most - 1), counts[(idx + 1) % 3]],
        "The biggest group has " + most + ".");
    },

    spatial: function () {
      const kind = randInt(0, 1);
      if (kind === 0) {
        const shapes = [
          ["triangle", 3], ["square", 4], ["rectangle", 4],
          ["pentagon", 5], ["hexagon", 6]
        ];
        const s = pick(shapes);
        return mcFromNumber("How many sides does a " + s[0] + " have?", s[1],
          [s[1] + 1, s[1] - 1, s[1] + 2],
          "A " + s[0] + " has " + s[1] + " sides.");
      }
      const len = randInt(2, 9), add = randInt(2, 6);
      return { type: "num",
        prompt: "A pencil is " + len + " cm long. A crayon is " + add +
          " cm longer. How long is the crayon?",
        answer: len + add, explain: len + " + " + add + " = " + (len + add) + " cm." };
    },

    money: function () {
      const kind = randInt(0, 1);
      if (kind === 0) {
        const coins = [
          ["nickels", 5], ["dimes", 10], ["quarters", 25]
        ];
        const c = pick(coins);
        const n = randInt(2, 4);
        const total = c[1] * n;
        return { type: "num", prompt: "What is the value of " + n + " " + c[0] + "?",
          answer: total, explain: n + " × " + c[1] + "¢ = " + total + "¢." };
      }
      const a = randInt(1, 9) * 5, b = randInt(1, 9) * 5;
      return { type: "num", prompt: "You have " + a + "¢ and find " + b +
        "¢ more. How much money do you have now?",
        answer: a + b, explain: a + "¢ + " + b + "¢ = " + (a + b) + "¢." };
    }
  };

  function generate(unitId, count) {
    const gen = generators[unitId] || generators.number;
    const n = Math.max(1, Math.min(20, count || 5));
    const out = [];
    for (let i = 0; i < n; i++) out.push(gen());
    return out;
  }

  window.QuestionGen = { generate };
})();
