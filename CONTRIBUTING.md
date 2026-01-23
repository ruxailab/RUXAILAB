# CONTRIBUTING.md — RUXAILAB

[![Contributor Guide](https://img.shields.io/badge/docs-contributor%20guide-blue?style=for-the-badge)](CONTRIBUTING.md)
[![Vue.js](https://img.shields.io/badge/vue-3.5.26-4FC08D?style=for-the-badge&logo=vue.js&logoColor=white)](https://vuejs.org/)
[![Python](https://img.shields.io/badge/python-3.11.8-3776AB?style=for-the-badge&logo=python&logoColor=white)](https://www.python.org/)
[![Firebase](https://img.shields.io/badge/firebase-production-FFCA28?style=for-the-badge&logo=firebase&logoColor=white)](https://firebase.google.com/)

**Production-grade contributor guide** — the canonical contributor reference: environment constraints, exact local setup, emulator & Docker workflows, architecture rules, security/observability requirements, PR & testing standards, templates, and the project roadmap.

This file **preserves every technical detail** while being structured for quick navigation.

> [!CAUTION]
> **Security note:** Never commit real secrets. Use `YOUR_*` placeholders in examples and keep real secrets in CI / secret stores.

---

## Contents

1. [Quick start (30s)](#1--quick-start-30s)
2. [Core environment & technical stack (full details)](#2--core-environment--technical-stack-points-130)
3. [Local setup & configuration (complete steps)](#3--local-setup--configuration-logic-points-3160)
4. [Firebase emulators, ports & Docker (tables and exact commands)](#4--firebase-emulator-suite--docker-points-1420-2630-5460)
5. [Python AHP weight function — local & production flows](#5--python-weight-function-ahp--local--production-points-2125-4448)
6. [System architecture & rules contributors must obey](#6--system-architecture--backend-logic-points-6190)
7. [Security, observability & performance standards (detailed)](#7--deep-technical-standards--roadmap-points-91120)
8. [CI/CD, automation, and quality gates (detailed)](#8--cicd-automation--quality-gates-points-6974)
9. [Testing: unit, property, fuzzing, E2E, benchmarks](#9--testing-unit-property-fuzzing-e2e-benchmarks-points-7580-127129)
10. [Contributor workflow, commits, PRs & required templates](#10--contributor-framework--workflow-points-121150)
11. [Issue templates & where to discuss ideas (copy-ready)](#11--templates--copy-ready-artifacts)
12. [Appendix: .env.example, commands, troubleshooting, checklists](#13--appendix-commands-troubleshooting--checklists)

---

## 1 — Quick start (30s)

Minimal flow to get a dev environment running:

```bash
git clone [https://github.com/](https://github.com/)<org>/ruxailab.git
cd ruxailab

# copy and edit .env (do not commit real secrets)
cp .env.example .env      # edit with YOUR_* values (do not commit)

# frontend deps
npm install

# python deps for AHP engine
cd weight_function
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
cd ..

# start emulators and dev server
firebase emulators:start
npm run serve

# App: http://localhost:5000
# Emulator UI: http://localhost:8080
```
## 2 — Core environment & technical stack 
- Hard constraints. Do not change these without an RFC, CI updates, and maintainer sign-off.
- Node.js: Project requires ≤ 24.12.0. Use nvm to match CI.
- Vue: Frontend uses Vue.js 3.5.26 (Composition API).
- Vuetify: UI library is Vuetify 3.11.6. Stick to Vuetify components and theming.
- Vue CLI: Build & dev via Vue CLI 5.0.8.
- Python: 3.11.8 required for weight_function (AHP engine).
- Repo composition: ~76.8% Vue, ~21.7% JS, ~0.9% Python; small TypeScript/HTML/Dockerfile fractions.
- Commit history: ~6,882 commits; ~254 forks — preserve history, no force-push on protected branches.
- Prettier: enforced via .prettierrc. Run formatting pre-commit and in CI.
- Babel / browsers: babel.config.js / .browserslistrc determine transpilation targets.
- EditorConfig: .editorconfig standardizes editor behavior.
- Husky: pre-commit hooks live in .husky/ (lint & basic checks). Do not bypass.
- i18n guard: i18n-diff-guard.js ensures translation key consistency.
- SonarCloud: quality gate integration via sonarcloud_to_github.py.
- Testing stacks: jest.config.js (unit), Playwright in e2e/ (E2E) with playwright.config.ts.
- ESLint: config in eslint.config.mjs. CI enforces linting.
- Firebase infra files: firebase.json, firestore.rules, storage.rules, firestore.indexes.json. Any infra change must update these.
- package-lock.json: committed for deterministic installs.
- Functions: functions/ contains Node Cloud Functions (keep stateless).
- Python backend: weight_function/ holds the AHP codebase (separate packaging & deployment).
- Public & source: public/ and src/ are the main frontend paths.
- Project aliases: .firebaserc contains aliases used by CI and deploy scripts.
  
## 3 — Local setup & configuration logic 
Follow this exactly for reproducible local environments.

Prerequisites

Node (≤ 24.12.0) — use nvm use <version>

npm (bundled with Node)

Python 3.11.8

Firebase CLI (latest recommended)

Docker & docker-compose (optional but recommended)

make (optional helpers)

Step-by-step bootstrap

1. Clone repo

Bash
git clone [https://github.com/](https://github.com/)<org>/ruxailab.git
cd ruxailab
2. Install frontend deps

Bash
npm install
3. Install Python deps (AHP engine)

Bash
cd weight_function
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
cd ..
4. Create .env

Bash
cp .env.example .env
# edit .env with YOUR_* placeholders
Note: Do not commit .env. Use CI secrets for real values.

5. Activate Realtime Database (manual in Firebase Console)

Console → Build → Realtime Database → Create database (choose region & rules).

Note: Realtime DB must be enabled manually; some live features depend on it.

6. Uncomment emulator lines in src/index.js The repository includes deliberate emulator toggles — explicitly uncomment to route SDKs to local emulators. This prevents accidental production writes.

7. Start emulators

Bash
firebase emulators:start
Or for functions only:

Bash
firebase emulators:start --only functions
8. Run frontend

Bash
npm run serve
App (hosting emulator): http://localhost:5000

Emulator UI: http://localhost:8080 (see firebase.json)

.env variables (essentials)

Use YOUR_* placeholders — never commit real values.

Properties
VUE_APP_I18N_LOCALE=en
VUE_APP_I18N_FALLBACK_LOCALE=en

VUE_APP_FIREBASE_API_KEY=YOUR_FIREBASE_API_KEY
VUE_APP_FIREBASE_AUTH_DOMAIN=YOUR_FIREBASE_AUTH_DOMAIN
VUE_APP_FIREBASE_PROJECT_ID=YOUR_FIREBASE_PROJECT_ID
VUE_APP_FIREBASE_STORAGE_BUCKET=YOUR_FIREBASE_STORAGE_BUCKET
VUE_APP_FIREBASE_MESSAGING_SENDER_ID=YOUR_FIREBASE_MESSAGING_SENDER_ID
VUE_APP_FIREBASE_APP_ID=YOUR_FIREBASE_APP_ID

# Python AHP function (emulator or production)
VUE_APP_FIREBASE_PYTHON_FUNCTION=http://localhost:5001/YOUR_FIREBASE_PROJECT_ID/us-central1/weightFunction
4 — Firebase Emulator Suite & Docker (points 14–20, 26–30, 54–60)
Emulator port map (local)

Service	Default port
Hosting (emulated)	5000
Firestore emulator	8081
Auth emulator	9099
Storage emulator	9199
Functions emulator (Node & Python)	5001
Emulator UI	8080
Important emulator settings

singleProjectMode: true — prevents cross-project leakage.

ui.enabled: true — enables the emulator UI dashboard.

Docker quick reproducible workflow

Build

Bash
docker build -t uxremotelab .
Run

Bash
docker run -d --env-file .env -p 5000:5000 uxremotelab
# access: http://localhost:5000
Playwright (CI-like) Use Dockerfile-playwright to build a container with deterministic browsers. CI should run Playwright in that container to avoid host inconsistencies.

5 — Python weight function (AHP) — local & production (points 21–25, 44–48)
This is the mathematical heart of RUXAILAB. Respect its isolation and rules.

Purpose

Implements the Analytic Hierarchy Process (AHP) to convert expert pairwise comparisons into a consistent weight vector for usability heuristics.

Local testing & invocation

Ensure weight_function/ dependencies are installed (see Section 3). Start the functions emulator:

Bash
firebase emulators:start --only functions
The functions emulator will print the local URL for the Python function, e.g.: http://localhost:5001/<project>/us-central1/weightFunction

Add that URL into .env:

Properties
VUE_APP_FIREBASE_PYTHON_FUNCTION=http://localhost:5001/YOUR_FIREBASE_PROJECT_ID/us-central1/weightFunction
Call the endpoint from frontend code or test via curl / Postman with a valid payload.

Packaging & deployment

The Python function lives in weight_function/ and is deployed separately.

Production requirement: Python Cloud Functions require Firebase Blaze billing plan. Do not attempt to deploy Python functions on Spark (free) tier.

Size hygiene: .gitignore must exclude venv/ and dev-only artifacts. Keep function package size minimal.

Best practices for AHP function code

Validate inputs strictly; reject malformed matrices with descriptive errors.

Return metadata: weights plus consistency metrics (CR, eigenvalues), so consumers can reason about the results.

Avoid blocking I/O: functions should return quickly; use async/background workers for heavy compute.

Structured logs (JSON) and stable response schemas.

6 — System architecture & backend logic (points 61–90)
Design, boundaries, and rules to prevent accidental coupling and enable scale.

Runtime topology

UI (Vue): interactive client — consumes Firestore and calls Cloud Functions for orchestration. No heavy math in the UI.

Cloud Functions (Node): API layer, security boundary, and orchestration. Keep stateless.

Python AHP (weight_function): math engine accessible via HTTP from Node functions.

Storage: Firestore (primary), Realtime Database (live sync), Cloud Storage (files/assets).

Firestore & Realtime DB usage

Realtime DB: used for low-latency live updates (e.g., active test sessions). Enable & test locally.

Firestore: canonical app data — projects, tests, evaluations, reports.

Security & rules

All reads/writes must be governed by firestore.rules and storage.rules. Adding a new collection (e.g., /heatmaps) requires:

Updating firestore.rules and storage.rules.

Unit tests for access paths.

Documentation in the PR.

Indexes

Add complex query indexes to firestore.indexes.json. Missing an index causes “index not found” in production/emulator.

Observability & function stats

Use Firebase Console and structured logs to monitor function performance and errors. Include request_id for traceability.

Feature priorities & GSOC-worthy areas

Analytics Tab (Asynchronous User Tests)

Heat Maps & Card Sorting (major GSOC targets)

Heuristic Evaluation Workspace

Sentiment analysis pipeline (research/experimental)

7 — Deep technical standards & roadmap (points 91–120)
Production-grade requirements, goals, and implementation notes.

Observability & tracing

Adopt structured (JSON) logging everywhere. Include: request_id, user_id (if authorized), function, node_id.

Plan OpenTelemetry spans exported to Jaeger / Honeycomb for deep traces.

Request correlation

Each inbound request should include a request_id (generate at the edge if necessary) and propagate it across Node ↔ Python calls.

Security & secrets

CI secrets must be scoped to the least privilege.

Avoid exposing VUE_APP_* keys to jobs that don’t require them. Use masked secrets in GitHub Actions.

Data protection

Data at rest: encrypt snapshots and WALs (AES-GCM recommended).

Sensitive local artifacts: chmod 0600 for service account JSON and backups.

Performance targets (roadmap)

p99 latency: target 4.0ms via batching & fsync tuning.

Throughput: target 120k ops/sec through asynchronous I/O & batching.

Explore io_uring / tokio-uring for future storage paths.

Reliability & correctness

Use Joint Consensus for configuration changes to prevent split-brain.

Plan Two-Phase Commit (2PC) for cross-range transactions (future).

Use property-based testing and model checking (TLA+/Kani) for critical invariants (e.g., election safety).

Supply chain & vulnerability scanning

Enforce npm audit and similar checks in CI. Run nightly dependency checks and block high-severity upgrades.

8 — CI/CD, automation & quality gates (points 69–74)
Exact expectations and example pipeline.

Recommended GitHub Actions pipeline

On PR:

Checkout

Setup Node & Python (matching versions)

npm ci

Lint: npm run lint

Format check: npm run format:check

Unit tests: npm run test:unit

SonarCloud scan (if token present)

Build artifacts

Playwright tests in container (optional/conditional)

On merge to develop/main:

Run the above + deploy steps, gated by approvals & SonarCloud results.

Pre-deploy hooks

firebase.json includes predeploy hooks such as:

Bash
npm --prefix "$RESOURCE_DIR" run lint
Do not disable predeploy hooks.

SonarCloud

sonarcloud_to_github.py posts Sonar results to PRs. If results are missing, check script permissions & tokens.

9 — Testing (unit, property, fuzzing, E2E, benchmarks) (points 75–80, 127–129)
Testing is mandatory and varies by subsystem.

Frontend unit tests

Framework: Jest

Focus: reactive state, helper utilities, components with logic (avoid heavy DOM testing here).

Commands:

Bash
npm run test:unit
npm run test:unit:coverage
Playwright E2E

Cover critical flows: sign-in, create test, run test, submit evaluation, report generation, analytics.

CI: run Playwright inside Dockerfile-playwright.

Local:

Bash
npm run test:e2e
Python (AHP) tests

Run inside weight_function venv:

Bash
cd weight_function
source venv/bin/activate
pytest -q
Property-based testing & fuzzing

Use hypothesis (Python) or proptest for thorough math invariants.

Plan fuzzing for JSON serialization boundaries (e.g., cargo-fuzz or Python fuzzers).

Benchmarks

Provide reproducible bench/ scripts. CI should run nightly benchmarks to detect regressions (e.g., cargo bench, Node.js benchmarks).

10 — Contributor framework & workflow (points 121–150)
How to contribute responsibly and what reviewers expect.

Branching strategy

Work from develop. Branch naming:

feature/<short-desc>

fix/<short-desc>

docs/<short-desc>

test/<short-desc>

Commit messages

Use Conventional Commits:

Plaintext
feat(scope): description
fix(scope): description
docs(scope): description
chore(scope): description
Keep commits small and focused.

PR requirements

Every PR must include:

Summary (1–2 lines)

Technical approach (design, tradeoffs, alternatives)

Impact analysis (performance, storage, billing, security)

Testing (what tests were added/updated)

Rollback plan (for infra changes)

Pre-PR checklist (developer)

[ ] Branched from develop

[ ] Rebased & resolved conflicts

[ ] Lint & format run locally

[ ] Unit tests pass locally

[ ] E2E tests updated where necessary

[ ] Firestore indexes updated if needed (firestore.indexes.json)

[ ] Firestore & Storage rules updated for new collections (firestore.rules / storage.rules)

[ ] No secrets in code/diffs

[ ] PR template filled out

Review & merge policy

At least 1 maintainer review required (2 for infra changes).

Merge only after CI passes and SonarCloud score acceptable.

Prefer rebase & merge for linear history (or squash if project policy requires).

11 — Templates & copy-ready artifacts
.env.example (place in repo root)

Properties
# Localization
VUE_APP_I18N_LOCALE=en
VUE_APP_I18N_FALLBACK_LOCALE=en

# Firebase placeholders — replace with YOUR_* values
VUE_APP_FIREBASE_API_KEY=YOUR_FIREBASE_API_KEY
VUE_APP_FIREBASE_AUTH_DOMAIN=YOUR_FIREBASE_AUTH_DOMAIN
VUE_APP_FIREBASE_PROJECT_ID=YOUR_FIREBASE_PROJECT_ID
VUE_APP_FIREBASE_STORAGE_BUCKET=YOUR_FIREBASE_STORAGE_BUCKET
VUE_APP_FIREBASE_MESSAGING_SENDER_ID=YOUR_FIREBASE_MESSAGING_SENDER_ID
VUE_APP_FIREBASE_APP_ID=YOUR_FIREBASE_APP_ID

# Python AHP function endpoint (emulator or prod)
VUE_APP_FIREBASE_PYTHON_FUNCTION=http://localhost:5001/YOUR_FIREBASE_PROJECT_ID/us-central1/weightFunction
PR template (.github/PULL_REQUEST_TEMPLATE.md)

Markdown
## Summary
Concise description.

## Technical Approach
Design, decisions, trade-offs.

## Impact Analysis
Performance, storage, security, billing.

## Testing
- Unit tests: (list)
- E2E tests: (list)
- Manual steps

## Checklist
- [ ] Branch from develop
- [ ] Linted & formatted
- [ ] Tests pass
- [ ] Docs updated (if needed)
- [ ] No secrets included
Issue templates (.github/ISSUE_TEMPLATE/)

bug_report.md

Markdown
**Title**

**Describe the bug**

**To Reproduce**
1.
2.
3.

**Expected behavior**

**Environment**
- OS:
- Browser:
- Node:
- Firebase emulator: yes/no

**Logs / screenshots**
feature_request.md

Markdown
**Title**

**Summary**

**Use case / user story**

**Proposed solution**


## 12 — Appendix: commands, troubleshooting & checklists
Useful commands

```Bash
# dev: frontend deps
npm install

# python deps (AHP engine)
cd weight_function && python -m venv venv && source venv/bin/activate && pip install -r requirements.txt

# start everything
firebase emulators:start
npm run serve

# functions only
firebase emulators:start --only functions

# lint / format / tests
npm run lint
npm run format
npm run format:check
npm run test:unit
npm run test:e2e

# docker
docker build -t uxremotelab .
docker run -d --env-file .env -p 5000:5000 uxremotelab
```
# Troubleshooting

- Auth errors Ensure emulator toggles in src/index.js are enabled and VUE_APP_FIREBASE_AUTH_DOMAIN matches the emulator config.

- Firestore missing index Add the index to firestore.indexes.json and restart emulators.

- Function not reachable Ensure firebase emulators:start --only functions is running and update VUE_APP_FIREBASE_PYTHON_FUNCTION with the printed URL.

- Slow CI Playwright runs Use Dockerfile-playwright to run tests in container. Increase timeouts only if necessary; prefer mocking external resources.
