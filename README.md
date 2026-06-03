# 🧮 Math Adventures — Grade 2 (Ontario)

A friendly web app that teaches the **Ontario Grade 2 Mathematics (2020) curriculum**. Each unit
follows the five Ontario strands and includes **Learn**, **Practice** (a graded quiz), and
**Homework** (with self-check and print).

> Built with [Spec-Driven Development](https://github.com/github/spec-kit). See [`specs/`](./specs)
> for the spec, plan, and tasks.

## Units (Ontario strands)

1. **🔢 Number** — numbers to 200, place value, skip counting, comparing, +/− to 100, fractions
2. **🔁 Algebra** — patterns, equality, simple equations
3. **📊 Data** — tally charts, pictographs & bar graphs, probability
4. **📐 Spatial Sense** — 2D/3D shapes, location & movement, measurement
5. **💰 Financial Literacy** — Canadian money, counting amounts, spending choices

## Features

- **Learn → Practice → Homework** loop for every unit
- Instant per-question feedback, scores, and ⭐ ratings
- Homework with **Check answers** and a **printable** worksheet
- Progress & best scores saved on the device (localStorage)
- 100% static — no accounts, no server, works offline
- Responsive and accessible (keyboard friendly, high contrast, big buttons)

## Run it

It's just static files. Either:

```bash
# Option A: open directly
start index.html         # Windows
open index.html          # macOS

# Option B: serve locally (recommended)
python -m http.server 8000
# then visit http://localhost:8000
```

## Project structure

```
index.html          App shell
styles.css          Styling + print styles
js/curriculum.js    All unit content, quizzes, homework
js/quiz.js          Quiz + homework engine
js/app.js           Router, state, progress
specs/              spec.md, plan.md, tasks.md (spec-kit artifacts)
```

## Note

This is an independent educational tool aligned to publicly available Ontario curriculum
expectations. It is **not** an official Government of Ontario / Ministry of Education product.

## License

MIT
