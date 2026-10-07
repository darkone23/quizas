'use strict';
// Compiles the inline <script> blocks of every page so syntax errors in
// page glue fail the suite instead of surfacing as a blank page in a browser.
const assert = require('assert');
const fs = require('fs');
const path = require('path');

const pages = ['index.html', 'quiz.html', 'results.html'];
const root = path.join(__dirname, '..');

for (const page of pages) {
  const html = fs.readFileSync(path.join(root, page), 'utf8');
  const blocks = [...html.matchAll(/<script(?![^>]*\bsrc=)[^>]*>([\s\S]*?)<\/script>/g)].map((m) => m[1]);
  assert(blocks.length >= 1, `${page}: has at least one inline script`);
  blocks.forEach((code, i) => {
    try {
      // compile-only; DOM globals are not touched at this stage
      new Function(code);
    } catch (err) {
      throw new Error(`${page}: inline script #${i + 1} does not compile: ${err.message}`);
    }
  });

  // every page wires the shared loader or renders from the registry
  if (page !== 'index.html') {
    assert(/assets\/quizas\.js/.test(html), `${page}: loads the core`);
    assert(/assets\/pages\.js/.test(html), `${page}: loads the page glue`);
  }
}

// CDN pin check: results page must pin an exact echarts version
const results = fs.readFileSync(path.join(root, 'results.html'), 'utf8');
assert(/echarts@\d+\.\d+\.\d+\//.test(results), 'results.html pins an exact echarts version');

console.log('pages-syntax.test.js: all pages compile');