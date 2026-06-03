# Implementation Plan: Grade 2 Ontario Mathematics App

## Architecture

A **static single-page application** — no backend, no build tooling.

```
index.html        # App shell: header, nav, content mount point
styles.css        # Kid-friendly, responsive, accessible styling
js/curriculum.js  # CURRICULUM data: units -> lessons, quiz, homework
js/quiz.js        # Quiz engine + homework checker (pure functions + render)
js/app.js         # Router (hash-based), state, progress (localStorage), rendering
```

### Data model (`js/curriculum.js`)

```js
CURRICULUM = [
  {
    id: 'number', title: 'Number', emoji: '🔢', colour: '#...',
    overall: 'Ontario overall expectation text',
    lessons: [ { title, html } ],
    quiz:    [ { type:'mc'|'num', prompt, choices?, answer, explain } ],
    homework:[ { type:'mc'|'num', prompt, choices?, answer } ]
  }, ...
]
```

### State / progress (`js/app.js`)

- `localStorage` key `g2math.progress.v1`:
  `{ [unitId]: { learned: bool, bestScore: n, total: n, stars: 0..3 } }`
- Home dashboard reads progress to render unit cards.
- "Reset progress" clears the key (with confirm).

### Routing

- Hash routes: `#/` (home), `#/unit/:id/learn`, `#/unit/:id/practice`, `#/unit/:id/homework`.
- `app.js` listens to `hashchange` and renders the matching view into `#app`.

### Quiz engine (`js/quiz.js`)

- Renders one question at a time (Practice) with instant check + explanation, tracks score, shows summary + stars, saves best score.
- Homework: renders all problems, "Check answers" marks each and reveals answers; "Print" uses a print stylesheet.

## Build order (see tasks.md)

1. Curriculum data (content first — drives everything).
2. App shell + styles + router + home dashboard.
3. Quiz engine (practice) + homework checker.
4. Wire progress persistence.
5. Local test pass; fix issues.
6. README + publish.

## Testing strategy

- Manual smoke test in a browser via a local static server.
- Verify each acceptance scenario in spec.md for at least 2 units, then spot-check the rest.
- Validate: navigation, per-question feedback, score saving, homework check, print view, progress reset, responsive layout.
