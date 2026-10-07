'use strict';
const assert = require('assert');
const Q = require('../assets/quizas.js');

const quiz = {
  id: 't',
  title: 'Test',
  likert: ['sd', 'd', 'n', 'a', 'sa'],
  axes: [
    { id: 'x', left: 'L', right: 'R' },
    { id: 'y', bottom: 'M', top: 'I' },
  ],
  questions: [
    { text: 'q1', weight: 1, contributes: { x: 1 } },
    { text: 'q2', weight: 1, contributes: { y: -1 } },
    { text: 'q3', weight: 2, contributes: { x: 0.5, y: 0.5 } },
  ],
  figures: [
    { id: 'a', name: 'A', pos: { x: -1, y: 1 } },
    { id: 'b', name: 'B', pos: { x: 1, y: -1 } },
    { id: 'c', name: 'C', pos: { x: 0.6, y: 0.6 } },
  ],
};

// score(): weighted Likert contributions normalize to -1..1 per axis
// agree on q1 (x+1), disagree on q2 (y-1), neutral on q3 -> (0.5, 0.5)
assert.deepStrictEqual(
  Q.score(quiz, [4, 0, 2]),
  { x: 0.5, y: 0.5 }
);
// disagree on q3 (weight 2) exactly cancels agreeing with q1 -> 0,0
assert.deepStrictEqual(
  Q.score(quiz, [4, 0, 0]),
  { x: 0, y: 0 }
);
assert.deepStrictEqual(
  Q.score(quiz, [0, 4, 4]),
  { x: 0, y: 0 }
);
assert.deepStrictEqual(
  Q.score(quiz, [2, 2, 2]),
  { x: 0, y: 0 }
);
// fully aligned answers land exactly on the -1..1 normalization cap
assert.deepStrictEqual(Q.score(quiz, [4, 0, 4]), { x: 1, y: 1 });
assert.deepStrictEqual(Q.score(quiz, [0, 4, 0]), { x: -1, y: -1 });

// score(): rejects wrong-length or out-of-range answers
assert.strictEqual(Q.score(quiz, [4, 0]), null, 'wrong length');
assert.strictEqual(Q.score(quiz, [4, 0, 9]), null, 'out of range');

// nearest(): Euclidean ordering, c first from (0.5, 0.5)
const ranked = Q.nearest(quiz, { x: 0.5, y: 0.5 });
assert.strictEqual(ranked[0].figure.id, 'c');
assert(Math.abs(ranked[0].distance - Math.SQRT2 / 10) < 1e-9);
assert.strictEqual(ranked.length, 3);
assert.strictEqual(ranked[1].figure.id !== 'c', true);

// nearest(): n limits results
assert.strictEqual(Q.nearest(quiz, { x: 0, y: 0 }, 1).length, 1);

// nearest(): axis ids come from quiz.axes, not from hardcoded x/y
// (regression: a quiz whose axes are not named x/y produced NaN distances)
const compassQuiz = {
  id: 't2',
  likert: ['sd', 'd', 'n', 'a', 'sa'],
  axes: [
    { id: 'authority', left: 'L', right: 'R' },
    { id: 'spirit', bottom: 'M', top: 'I' },
  ],
  questions: [{ text: 'q1', weight: 1, contributes: { authority: 1 } }],
  figures: [
    { id: 'near', name: 'N', pos: { authority: 0.1, spirit: 0.1 } },
    { id: 'far', name: 'F', pos: { authority: -1, spirit: -1 } },
  ],
};
const compassPoint = Q.score(compassQuiz, [4]);
assert.deepStrictEqual(compassPoint, { authority: 1, spirit: 0 });
const compassRanked = Q.nearest(compassQuiz, compassPoint, 2);
assert(Number.isFinite(compassRanked[0].distance), 'distances are real numbers');
assert.strictEqual(compassRanked[0].figure.id, 'near');
assert.strictEqual(compassRanked[1].figure.id, 'far');

// registration via QUIZAS_QUIZ + findQuiz
Q.QUIZAS_QUIZ(quiz);
assert.strictEqual(Q.findQuiz('t').id, 't');
assert.strictEqual(Q.findQuiz('nope'), null);

// encode/decode: round trip, URL-safe base36 digits
assert.strictEqual(Q.encodeAnswers(quiz, [0, 4, 2]), '042');
assert.deepStrictEqual(Q.decodeAnswers(quiz, '042'), [0, 4, 2]);
assert.strictEqual(Q.decodeAnswers(quiz, '049'), null, 'digit beyond likert');
assert.strictEqual(Q.decodeAnswers(quiz, '04'), null, 'wrong length');
assert.strictEqual(Q.decodeAnswers(quiz, 'xyz'), null, 'non-digits');

console.log('scoring.test.js: all assertions passed');