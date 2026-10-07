/* Quizas core: quiz registry, Likert scoring, nearest-figure matching,
   answer encode/decode for shareable result links. No dependencies. */
(function (root, factory) {
  'use strict';
  const api = factory();
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  root.QUIZAS = api;
  root.QUIZAS_QUIZ = function (quiz) { return api.registerQuiz(quiz); };
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  'use strict';

  const quizzes = {};

  function registerQuiz(quiz) {
    if (!quiz || !quiz.id || !quiz.questions || !quiz.figures || !quiz.axes) return null;
    quizzes[quiz.id] = quiz;
    return quiz;
  }

  function findQuiz(id) {
    return Object.prototype.hasOwnProperty.call(quizzes, id) ? quizzes[id] : null;
  }

  // answers: one Likert index per question, 0..likert.length-1
  // Returns { axisId: -1..1 } or null on invalid input.
  function score(quiz, answers) {
    if (!quiz || !Array.isArray(answers) || answers.length !== quiz.questions.length) return null;
    const max = quiz.likert.length - 1;
    const mid = max / 2;
    const num = {}, den = {};
    for (const a of quiz.axes) { num[a.id] = 0; den[a.id] = 0; }
    for (let i = 0; i < answers.length; i++) {
      const q = quiz.questions[i];
      const idx = answers[i];
      if (!Number.isInteger(idx) || idx < 0 || idx > max) return null;
      const s = idx - mid;
      for (const axisId in q.contributes) {
        const wc = (q.weight || 1) * q.contributes[axisId];
        num[axisId] += wc * s;
        den[axisId] += Math.abs(wc) * mid;
      }
    }
    const out = {};
    for (const a of quiz.axes) out[a.id] = den[a.id] > 0 ? num[a.id] / den[a.id] : 0;
    return out;
  }

  function dist(ax, ay, bx, by) {
    const dx = ax - bx, dy = ay - by;
    return Math.sqrt(dx * dx + dy * dy);
  }

  // Returns [{ figure, distance }] sorted by distance, on the quiz's own axes.
  function nearest(quiz, point, n) {
    const [xId, yId] = quiz.axes.map(function (a) { return a.id; });
    const ranked = quiz.figures.map(function (f) {
      return { figure: f, distance: dist(point[xId], point[yId], f.pos[xId], f.pos[yId]) };
    });
    ranked.sort(function (a, b) { return a.distance - b.distance; });
    return typeof n === 'number' ? ranked.slice(0, n) : ranked;
  }

  // One base36-ish digit per question: likert index (works for <=10 options).
  function encodeAnswers(quiz, answers) {
    const max = quiz.likert.length - 1;
    let out = '';
    for (let i = 0; i < answers.length; i++) {
      const idx = answers[i];
      if (!Number.isInteger(idx) || idx < 0 || idx > max) return null;
      out += String(idx);
    }
    return out;
  }

  function decodeAnswers(quiz, str) {
    if (typeof str !== 'string' || str.length !== quiz.questions.length) return null;
    const max = quiz.likert.length - 1;
    const out = [];
    for (let i = 0; i < str.length; i++) {
      const d = str.charCodeAt(i) - 48;
      if (d < 0 || d > max || !Number.isInteger(d)) return null;
      out.push(d);
    }
    return out;
  }

  return { registerQuiz: registerQuiz, findQuiz: findQuiz, score: score, nearest: nearest, encodeAnswers: encodeAnswers, decodeAnswers: decodeAnswers, QUIZAS_QUIZ: registerQuiz };
});