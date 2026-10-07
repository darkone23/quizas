/* Shared page logic for Quizas: URL params, quiz loading, error rendering. */
(function () {
  'use strict';

  function getParam(name) {
    const params = new URLSearchParams(location.search);
    return params.get(name);
  }

  function renderError(message, showHome) {
    const main = document.querySelector('main .card') || document.querySelector('main');
    if (!main) return;
    main.innerHTML =
      '<h2>🧭 ' + (message || 'Something went sideways.') + '</h2>' +
      (showHome === false ? '' : '<p><a href="index.html">← Back to the quiz shelf</a></p>');
  }

  // Reads ?quiz=, loads registry + matching data file, calls cb(quiz) or cb(null).
  function loadQuiz(cb) {
    const id = getParam('quiz');
    const entry = (window.QUIZAS_REGISTRY || []).find(function (e) { return e.id === id; });
    if (!id || !entry) {
      cb(null);
      return;
    }
    const script = document.createElement('script');
    script.src = 'data/' + entry.file;
    script.onload = function () { cb(window.QUIZAS.findQuiz(id)); };
    script.onerror = function () { cb(null); };
    document.head.appendChild(script);
  }

  window.QuizPages = { getParam: getParam, renderError: renderError, loadQuiz: loadQuiz };
})();