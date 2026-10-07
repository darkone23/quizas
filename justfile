# Quizas — house recipes

default:
	@just --list

# run all node-based checks (scoring core + quiz content validation)
test:
	node test/scoring.test.js
	node test/content-coverage.test.js
	node test/pages-syntax.test.js

# serve the site locally at http://localhost:8000
serve:
	python3 -m http.server 8000