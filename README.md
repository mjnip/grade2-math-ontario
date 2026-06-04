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
- **📈 Score tracker** — every Practice attempt is saved, so students can see their
  scores **over time** (best, latest, attempt count, and a trend sparkline)
- **➕ More questions** — request a fresh batch of practice questions on demand to
  keep testing a student (Azure OpenAI when hosted, with an offline fallback generator)
- **Optional cloud state** — sign in with a name (+ class code) to save and sync
  score history across devices via Azure
- Homework with **Check answers** and a **printable** worksheet
- Progress & best scores saved on the device (localStorage) and works offline
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

The app works fully offline. The score tracker uses `localStorage`, and **More
questions** falls back to a built-in generator when no backend is configured.

## Project structure

```
index.html              App shell
styles.css              Styling + print styles
staticwebapp.config.json  Azure Static Web Apps routing
js/curriculum.js        All unit content, quizzes, homework
js/quiz.js              Quiz + homework engine (+ dynamic questions)
js/store.js             Student identity + score history (with cloud sync)
js/generator.js         Offline procedural question generator (fallback)
js/api.js               Client for the Azure Functions backend
js/config.js            Runtime config (API base URL)
js/app.js               Router, views, progress dashboard
api/                    Azure Functions API (scores + question generation)
infra/                  Bicep infrastructure (Static Web App, Storage, OpenAI)
specs/                  spec.md, plan.md, tasks.md (spec-kit artifacts)
```

## Hosting on Azure

The app can be hosted on **Azure Static Web Apps**, which also runs the bundled
**Azure Functions** API for cloud score history (Table Storage) and dynamic
question generation (**Azure OpenAI**). See
[`docs/azure-deployment.md`](./docs/azure-deployment.md) for full setup steps.

## Note

This is an independent educational tool aligned to publicly available Ontario curriculum
expectations. It is **not** an official Government of Ontario / Ministry of Education product.

## License

MIT
