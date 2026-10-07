/* Quizas registry: list the published quizzes here so the index page can show them.
   file: the data filename inside data/ */
const QUIZAS_REGISTRY = [
  { id: "philosophers", title: "Which Famous Philosopher Are You Most Like?", emoji: "🏛️", blurb: "24 questions about power, reality, and the good life.", file: "philosophers.js" },
];
(typeof window !== "undefined" ? window : globalThis).QUIZAS_REGISTRY = QUIZAS_REGISTRY;
if (typeof module !== "undefined" && module.exports) module.exports = QUIZAS_REGISTRY;