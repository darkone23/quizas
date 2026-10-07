'use strict';
// Structural validation for every quiz data file listed in data/registry.js.
// Catches schema drift early so quiz authors get fast, honest feedback.
const assert = require('assert');
const Q = require('../assets/quizas.js');
const registry = require('../data/registry.js');

assert(Array.isArray(registry) && registry.length >= 1, 'registry lists at least one quiz');

for (const entry of registry) {
  if (!/^[a-z0-9-]+\.js$/.test(entry.file)) throw new Error(`suspicious registry file name: ${entry.file}`);
  require('../data/' + entry.file);
  const quiz = Q.findQuiz(entry.id);
  assert(quiz, `registry entry "${entry.id}" registered a quiz (did data/${entry.file} load?)`);

  assert(quiz.title && quiz.emoji && quiz.blurb, `${entry.id}: has title/emoji/blurb`);
  assert(Array.isArray(quiz.likert) && quiz.likert.length >= 4, `${entry.id}: likert has >= 4 options`);
  assert(quiz.axes.length === 2, `${entry.id}: exactly two axes (grid is x/y)`);

  const axisIds = new Set(quiz.axes.map((a) => a.id));
  assert(quiz.axes[0].left && quiz.axes[0].right, `${entry.id}: x axis has left/right labels`);
  assert(quiz.axes[1].bottom && quiz.axes[1].top, `${entry.id}: y axis has bottom/top labels`);

  assert(quiz.questions.length >= 20, `${entry.id}: at least 20 questions`);
  const qIds = new Set();
  for (const q of quiz.questions) {
    assert(q.text && q.text.length > 5, `${entry.id}: question has text`);
    assert(!qIds.has(q.text), `${entry.id}: duplicate question text`);
    qIds.add(q.text);
    assert(q.weight === undefined || (typeof q.weight === 'number' && q.weight > 0), `${entry.id}: weight positive`);
    const keys = Object.keys(q.contributes);
    assert(keys.length >= 1, `${entry.id}: question contributes to at least one axis`);
    for (const k of keys) {
      assert(axisIds.has(k), `${entry.id}: contribution axis "${k}" exists`);
      const c = q.contributes[k];
      assert(typeof c === 'number' && c !== 0 && Math.abs(c) <= 1, `${entry.id}: contribution in [-1,1], nonzero`);
    }
  }

  assert(quiz.figures.length >= 20, `${entry.id}: at least 20 figures`);
  const fIds = new Set();
  const quadrantCounts = { pp: 0, pm: 0, mp: 0, mm: 0 };
  for (const f of quiz.figures) {
    assert(f.id && f.name && f.emoji && f.blurb, `${entry.id}: figure "${f.id}" has name/emoji/blurb`);
    assert(!fIds.has(f.id), `${entry.id}: duplicate figure id`);
    fIds.add(f.id);
    assert.deepStrictEqual(Object.keys(f.pos).sort(), [...axisIds].sort(), `${entry.id}: figure "${f.id}" positioned on both axes`);
    for (const k of axisIds) {
      assert(typeof f.pos[k] === 'number' && f.pos[k] >= -1 && f.pos[k] <= 1, `${entry.id}: figure "${f.id}" pos in [-1,1]`);
    }
    const [x, y] = axisIds;
    const qx = f.pos[x] >= 0 ? 'p' : 'm';
    const qy = f.pos[y] >= 0 ? 'p' : 'm';
    quadrantCounts[qx + qy]++;
  }

  for (const q of ['pp', 'pm', 'mp', 'mm']) {
    assert(quadrantCounts[q] >= 2, `${entry.id}: every quadrant has >= 2 figures (got ${JSON.stringify(quadrantCounts)})`);
  }

  // scoring the quiz itself must never produce null for valid answers
  const neutral = quiz.questions.map(() => Math.floor(quiz.likert.length / 2));
  const pt = Q.score(quiz, neutral);
  assert(pt !== null, `${entry.id}: neutral answers score cleanly`);
  for (const k of axisIds) assert(Math.abs(pt[k]) <= 1, `${entry.id}: normalized to [-1,1]`);
}

console.log('content-coverage.test.js: all quizzes structurally valid');