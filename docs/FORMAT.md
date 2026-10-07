# Quizas authoring guide (FORMAT.md)

A quiz is one JavaScript data file in `data/`. Edit it, add an entry to
`data/registry.js`, run `just test`, push. No build step — GitHub Pages
publishes the file as-is.

## Minimal example

```js
/* data/my-quiz.js */
QUIZAS_QUIZ({
  id: "my-quiz",                       // unique, url-safe (a-z, 0-9, -)
  title: "Which Kind of Bread Are You?",
  emoji: "🍞",
  blurb: "24 carb-based questions about your soul.",
  likert: ["Strongly disagree", "Disagree", "Neutral", "Agree", "Strongly agree"],
  axes: [
    { id: "crust", left: "Soft", right: "Crusty" },       // x axis
    { id: "yeast", bottom: "Quick", top: "Slow-risen" },  // y axis
  ],
  questions: [
    // contributes: +1 pushes the answerer toward right/top on that axis,
    // -1 toward left/bottom. Fractions (0.5) are fine; weight scales it.
    { text: "A sandwich is a delivery vehicle for crust.", weight: 1, contributes: { crust: 1 } },
    { text: "Patience is the secret ingredient.", weight: 1, contributes: { yeast: 1, crust: -0.5 } },
  ],
  figures: [
    // pos: where each result lives on the grid, -1..1 per axis.
    { id: "baguette", name: "Baguette", emoji: "🥖",
      blurb: "Crusty outside, airy inside, impossible to store.",
      pos: { crust: 0.9, yeast: 0.6 } },
  ],
});
```

Then register it in `data/registry.js`:

```js
const QUIZAS_REGISTRY = [
  { id: "philosophers", title: "Which Famous Philosopher Are You Most Like?", emoji: "🏛️", blurb: "...", file: "philosophers.js" },
  { id: "my-quiz", title: "Which Kind of Bread Are You?", emoji: "🍞", blurb: "...", file: "my-quiz.js" },
];
```

## Schema reference

| Field | Notes |
| --- | --- |
| `id` | url-safe slug, used in `?quiz=` links |
| `title`, `emoji`, `blurb` | shown on the index card and results page |
| `likert` | answer labels, index 0..N-1 (5 is standard) |
| `axes` | exactly two: axis 0 is x (`left`/`right`), axis 1 is y (`bottom`/`top`) |
| `questions[].text` | the statement people agree/disagree with |
| `questions[].weight` | optional, default 1; scales the contribution |
| `questions[].contributes` | map of axis id → -1..1 (direction * strength) |
| `figures[].id`, `name`, `emoji`, `blurb` | a possible result |
| `figures[].pos` | position on the grid, -1..1 per axis, both axes required |

## How scoring works

- Answer `i` maps to a score: `i - (likert.length - 1) / 2`, so with 5 options
  the range is -2…+2.
- Per axis: `score = Σ(weight × contribution × answer) / (2 × Σ|weight × contribution|)`
  → a value in -1…+1.
- The result figure is the one with the smallest straight-line (Euclidean)
  distance to your point on the grid. Second and third place are shown too.
- The results URL encodes your answers as one digit per question
  (`results.html?quiz=X&a=0123…`), so results are shareable with no backend.

## Rules the test suite enforces

`just test` runs `test/content-coverage.test.js`, which requires every quiz in
the registry and checks: unique ids, ≥ 20 questions, ≥ 20 figures, all four
grid quadrants populated with ≥ 2 figures each, contributions and positions in
range, and that a neutral run scores cleanly. Keep these invariants and the
quiz engine will treat your data kindly.

## Local development

```sh
just serve   # http://localhost:8000
just test    # scoring + content checks (node)
```