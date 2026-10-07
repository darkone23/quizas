# Quizas 🧭

Static grid quizzes: answer a Likert-scale questionnaire, land on an x/y grid
(think political-compass style), and meet the figure you're most like.

- **No build step.** Plain HTML + vanilla JS; charts come from the ECharts CDN.
- **Quizzes are data.** Questions, axis contributions, and results all live in
  one editable file — see [docs/FORMAT.md](docs/FORMAT.md).
- **Results are linkable.** Answers are encoded in the URL; no backend anywhere.

**Live:** https://darkone23.github.io/quizas/

## First quiz

"Which Famous Philosopher Are You Most Like?" — 25 thinkers across
Libertarian↔Authoritarian × Materialist↔Idealist, 24 light-tone questions.

## Run locally

```sh
just serve   # http://localhost:8000
just test    # node-based scoring + content checks
```

(Or any static file server — the site is plain files.)

## Layout

```
index.html              quiz picker
quiz.html?quiz=X        the runner (one question at a time)
results.html?quiz=X&a=… grid chart + match + share link
assets/                 quizas.js (core), pages.js (page glue), style.css
data/                   registry.js + one file per quiz
docs/FORMAT.md          authoring guide
test/                   scoring + content validation (node, no deps)
```