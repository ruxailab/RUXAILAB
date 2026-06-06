# PRD — Unified Quality & Security Pipeline

**Status:** Draft (v3)  
**Date:** 2026-05-05  
**Owner:** RUXAILAB Engineering  

---

## 1. Overview

This document defines the requirements for consolidating **six** existing GitHub Actions workflows into a **single unified pipeline** (`quality-pipeline.yml`).

### 1.1 Workflows to be Unified

| # | Workflow File | Purpose | Current Trigger |
|---|---|---|---|
| 1 | `ComplexiCheckGP.yml` | Cyclomatic complexity — Python files changed in PR | PR only |
| 2 | `conditional-nestingGP.yml` | Depth of conditional nesting — changed `.py` files | Push + PR, all branches |
| 3 | `identifier_lengthGP.yml` | Identifier length metric — changed `.py` files | Push + PR, all branches |
| 4 | `metrics-Gp.yml` | Comment readability (Fog Index) — full source scan | Push to specific branches |
| 5 | `integrity-GP.yml` | Security audit: access control, route auth, OWASP scan, report | Push, PR, schedule |
| 6 | `Metrics-html-reportGP.yml` | Renders the Integrity JSON artifact into an HTML report | `workflow_run` (after Integrity) |

### 1.2 Scripts (Modified to Add Cross-Language Support)

| Script | Metric | Languages Supported (v3) |
|---|---|---|
| `CyclomaticMetricGP.py` | Cyclomatic complexity | **Python, JS, TS, JSX, TSX, MJS, CJS** |
| `depth_conditional_nesting_GP.py` | Conditional nesting depth | **Python, JS, TS, JSX, TSX, MJS, CJS** |
| `len_identifiersGP.py` | Identifier average length | **Python, JS, TS, JSX, TSX, MJS, CJS** |
| `fog_comments_indexGP.py` | Comment readability (Fog/Gunning) | Python, JS, TS, Java, C++, HTML *(unchanged)* |
| `route-auth-audit.js` | Vue Router authorization guard | **JavaScript + Python Flask/Django/FastAPI** |
| `generate-integrity-report.js` | Aggregates security findings → JSON | JavaScript *(unchanged)* |
| `render-integrity-html.js` | Renders JSON report → HTML | JavaScript *(unchanged)* |
| `generate_qc_report.js` | Quality control aggregation | JavaScript *(unchanged)* |

> **What changed in each script:**
> - `CyclomaticMetricGP.py` — Added `calcular_js()` regex-based cyclomatic complexity for JS/TS. Dispatches by file extension. `es_archivo_valido()` now accepts `.js .ts .mjs .tsx .jsx .cjs`.
> - `depth_conditional_nesting_GP.py` — Added `get_metrics_js()` using brace-tracking to estimate conditional nesting depth. `main()` now accepts JS/TS extensions.
> - `len_identifiersGP.py` — Expanded `KEYWORDS` to include Python + JavaScript/TypeScript reserved words. `main()` now accepts JS/TS extensions.
> - `route-auth-audit.js` — Added a second audit section that scans Python `.py` source files for Flask/Django/FastAPI route decorators and reports routes missing auth decorators.

### 1.3 Target Languages

The unified pipeline must detect and analyze files across:

| Language | Extensions |
|---|---|
| Python | `.py` |
| JavaScript | `.js`, `.mjs`, `.cjs` |
| TypeScript | `.ts`, `.tsx` |
| Java | `.java` |
| C# | `.cs` |

**Goal:** Replace all six workflow files with `quality-pipeline.yml`, executing every metric and security check in a structured, dependency-aware job graph, and producing one consolidated report artifact per run.

---

## 2. Problem Statement

### 2.1 Current Pain Points

- **Fragmentation (6 files):** Six independent workflow files with overlapping triggers, duplicated `actions/checkout` and runtime-setup steps, and no shared artifact strategy.
- **Inconsistent language coverage:** Cyclomatic complexity, nesting depth, and identifier length only run on Python files. The pipeline should surface equivalent quality signals across all five target languages.
- **Inconsistent triggers:** `ComplexiCheckGP.yml` only fires on PRs; `metrics-Gp.yml` only on push to specific branches; `conditional-nestingGP.yml` and `identifier_lengthGP.yml` run on all branches but independently. A PR can pass without all checks running.
- **`workflow_run` coupling:** `Metrics-html-reportGP.yml` waits for `Integrity` to complete via `workflow_run`, adding latency and a cross-workflow dependency that breaks if the workflow is renamed.
- **Redundant setup:** Each workflow installs Python 3.x and/or Node.js LTS independently, wasting runner-minutes.
- **No unified report:** Six workflows produce unrelated artifacts (or no artifact at all). There is no single view of quality and security health per PR or push.
- **No gate enforcement:** Complexity, nesting depth, and identifier length produce reports but never fail the pipeline.

### 2.2 Impact

- A PR introducing deeply nested C# or Java code passes all checks because the nesting script only runs on `.py`.
- Security issues found by `integrity-GP.yml` can coexist with high-complexity or unreadable code without cross-visibility in a single status check.
- Reviewers must navigate six separate workflow runs to get a complete quality picture.

---

## 3. Goals

1. **Single workflow file** (`quality-pipeline.yml`) that replaces all six YMLs.
2. **Consistent triggers** — run the full pipeline on every PR and on push to `main`, `develop`, and `features/**`.
3. **Multi-language file detection** — each quality job filters changed files by language-specific extensions at runtime.
4. **Dependency-ordered jobs** — quality metric jobs run in parallel first; security audit jobs run in parallel after; report generation runs last.
5. **Unified artifact** — one JSON + one HTML report per run, aggregating all findings.
6. **Enforce gates** — configurable fail thresholds for cyclomatic complexity, nesting depth, identifier length, and fog index.
7. **Eliminate `workflow_run` dependency** — HTML rendering is the final job in the same workflow, not a separate triggered workflow.

---

## 4. Non-Goals

- Replacing or modifying `ci.yml` or `cd.yml`.
- Adding new security rules beyond those already in `integrity-GP.yml`.
- Running E2E tests or deployment steps.
- Adding support for C# in the Python metric scripts (C# AST requires Roslyn; out of scope for v1 — tracked in OQ-2).
- Adding a Java AST parser to the Python metric scripts (Java requires a separate parser; Semgrep covers Java for security scans).

---

## 5. Language & File Detection Strategy

The metric scripts have been updated to support multiple languages. Coverage matrix:

| Job / Script | Python | JavaScript | TypeScript | Java | C# |
|---|---|---|---|---|---|
| Cyclomatic complexity (`CyclomaticMetricGP.py`) | AST | Regex | Regex | — (OQ-1) | — (OQ-2) |
| Nesting depth (`depth_conditional_nesting_GP.py`) | AST | Brace-tracking | Brace-tracking | — (OQ-1) | — (OQ-2) |
| Identifier length (`len_identifiersGP.py`) | Regex | Regex | Regex | — (OQ-1) | — (OQ-2) |
| Fog Index (`fog_comments_indexGP.py`) | Regex | Regex | Regex | Regex | — (OQ-2) |
| Route auth (`route-auth-audit.js`) | Flask/Django/FastAPI | Vue Router | Vue Router | — | — |
| OWASP scan (Semgrep) | Semgrep | Semgrep | Semgrep | Semgrep | Semgrep (`p/csharp`) |
| Access control audit (bash) | bash grep | bash grep | bash grep | bash grep | bash grep |

> **AST** = language-native abstract syntax tree (most accurate)  
> **Regex** = pattern-based estimation (good enough for CI gates)  
> **Brace-tracking** = structural depth via `{` / `}` counting  
> `— (OQ-n)` = not supported in v1; tracked as open question

The pipeline skips a step when no files of a given language are changed, rather than failing.

---

## 6. Proposed Architecture

### 6.1 Trigger Strategy

```yaml
on:
  pull_request:
    types: [opened, synchronize, reopened]
  push:
    branches: [main, develop, "features/**"]
  schedule:
    - cron: '0 3 * * 1'   # weekly integrity sweep (Monday 03:00 UTC)
  workflow_dispatch:

permissions:
  contents: read
```

### 6.2 Job Graph

```
┌──────────────────┐ ┌──────────────────┐ ┌──────────────────┐ ┌──────────────────┐
│  cyclomatic-     │ │  nesting-depth   │ │  identifier-     │ │  fog-index-      │
│  complexity      │ │  (all languages) │ │  length          │ │  metrics         │
│  (Python)        │ │                  │ │  (Python)        │ │  (JS/TS/Java/Py) │
└────────┬─────────┘ └────────┬─────────┘ └────────┬─────────┘ └────────┬─────────┘
         └───────────────────┬┴──────────────────────┘                   │
                             │        (all 4 quality jobs complete)       │
                             └────────────────────┬──────────────────────┘
                          ┌─────────────────────┬─┴──────────────────────┐
                          ▼                     ▼                        ▼
                ┌──────────────────┐  ┌──────────────────┐  ┌──────────────────────┐
                │  access-control  │  │  route-auth      │  │  static-security     │
                │  audit           │  │  audit           │  │  scan (OWASP/Semgrep)│
                └────────┬─────────┘  └────────┬─────────┘  └──────────┬───────────┘
                         └───────────────────┬─┴─────────────────────┘
                                             ▼
                                   ┌──────────────────────┐
                                   │   generate-report    │
                                   │   (JSON + HTML)      │
                                   │   if: always()       │
                                   └──────────────────────┘
```

### 6.3 Job Descriptions

#### Job 1 — `cyclomatic-complexity`
- **Source:** `ComplexiCheckGP.yml`
- **Runtime:** Ubuntu Latest, Python 3.12
- **File detection:** Changed `.py` files on PR (via `git diff`); all `.py` files on push
- **Steps:**
  1. Checkout (`fetch-depth: 0`)
  2. Setup Python 3.12
  3. Detect target files by extension
  4. Run `CyclomaticMetricGP.py <files>` → `complexity-results.json`
  5. **Gate:** Exit non-zero if `summary.failed_files > 0` (threshold: 15 per script default)
- **Artifact:** `quality-job1/complexity-results.json`

#### Job 2 — `nesting-depth`
- **Source:** `conditional-nestingGP.yml`
- **Runtime:** Ubuntu Latest, Python 3.x
- **File detection:** Changed `.py` files (via `tj-actions/changed-files`)
- **Steps:**
  1. Checkout (`fetch-depth: 0`)
  2. Setup Python
  3. Detect changed `.py` files
  4. Run `depth_conditional_nesting_GP.py <files>` → `nesting_metrics.json`
  5. **Gate:** Script exits 1 if any file exceeds `CRITICAL_THRESHOLD` (5)
- **Artifact:** `quality-job2/nesting_metrics.json`

#### Job 3 — `identifier-length`
- **Source:** `identifier_lengthGP.yml`
- **Runtime:** Ubuntu Latest, Python 3.x
- **File detection:** Changed `*.py` files (via `tj-actions/changed-files`)
- **Steps:**
  1. Checkout (`fetch-depth: 0`)
  2. Setup Python
  3. Detect changed `*.py` files
  4. Run `len_identifiersGP.py <files>` → `identifier_report.json`
  5. **Gate:** Fail if `summary.failed_files > 0` (avg identifier length < 10)
- **Artifact:** `quality-job3/identifier_report.json`

#### Job 4 — `fog-index-metrics`
- **Source:** `metrics-Gp.yml`
- **Runtime:** Ubuntu Latest, Python 3.12
- **File detection:** Scans entire source tree; `fog_comments_indexGP.py` already handles `.py`, `.js`, `.ts`, `.java`, `.html` natively
- **Steps:**
  1. Checkout
  2. Setup Python 3.12 + install `textstat`
  3. Run `fog_comments_indexGP.py .` → `fog-results.json`
  4. **Gate:** Fail if `summary.failed_files > 0` (fog score > 17 per script default)
- **Artifact:** `quality-job4/fog-results.json`

#### Job 5 — `access-control-audit`
- **Source:** `integrity-GP.yml` Job 1
- **Needs:** `cyclomatic-complexity`, `nesting-depth`, `identifier-length`, `fog-index-metrics`
- **Runtime:** Ubuntu Latest (bash only)
- **Languages covered:** Express/Fastify (JS/TS), Django/Flask (Python), Spring Boot (Java), SQL, Docker/K8s, generic REST
- **Artifact:** `quality-job5/access-control.log`

#### Job 6 — `route-auth-audit`
- **Source:** `integrity-GP.yml` Job 2
- **Needs:** all 4 quality jobs
- **Runtime:** Ubuntu Latest, Node.js LTS
- **Steps:** Vue Router guard integrity check + `route-auth-audit.js`
- **Artifact:** `quality-job6/route-auth.log`

#### Job 7 — `static-security-scan`
- **Source:** `integrity-GP.yml` Job 3
- **Needs:** all 4 quality jobs
- **Runtime:** Ubuntu Latest, Python (Semgrep)
- **Languages scanned:** JavaScript, TypeScript, Python, Java (Semgrep multi-language support)
- **Note for C#:** Semgrep supports C# via `--config=p/csharp`; add `--include="*.cs"` to the scan command
- **Steps:** OWASP Top 10 Semgrep scan + auth bypass pattern checks
- **Artifact:** `quality-job7/static-scan.log`

#### Job 8 — `generate-report`
- **Source:** `integrity-GP.yml` Job 4 + `Metrics-html-reportGP.yml` (merged)
- **Needs:** all 7 jobs above
- **Condition:** `if: always()`
- **Runtime:** Ubuntu Latest, Node.js LTS
- **Steps:**
  1. Download all 7 artifacts
  2. Run `generate-integrity-report.js` (to be extended to consume quality metric JSONs)
  3. Run `render-integrity-html.js` to produce the HTML report
  4. Upload consolidated `quality-security-report` (JSON + HTML)
- **Artifact:** `quality-security-report/report.json` + `quality-security-report/report.html`
- **Retention:** 30 days

---

## 7. Acceptance Criteria

| # | Criterion |
|---|---|
| AC-1 | A single file `quality-pipeline.yml` exists and replaces all 6 source workflow files |
| AC-2 | All 8 jobs execute when a PR is opened or updated |
| AC-3 | All 8 jobs execute on push to `main`, `develop`, or `features/**` |
| AC-4 | Jobs 5, 6, 7 only start after all 4 quality jobs complete (regardless of pass/fail) |
| AC-5 | Job 8 (`generate-report`) always runs and downloads all 7 preceding artifacts |
| AC-6 | The artifact `quality-security-report` (JSON + HTML) is uploaded and visible in Actions UI |
| AC-7 | A `.py` file with cyclomatic complexity above the script threshold causes Job 1 to fail |
| AC-8 | A `.py` file with nesting depth > 5 causes Job 2 to fail |
| AC-9 | A file with average identifier length < 10 causes Job 3 to fail |
| AC-10 | A file with fog index > 17 causes Job 4 to fail |
| AC-11 | Semgrep scans `.js`, `.ts`, `.java`, `.py`, and `.cs` files in `src/` and `functions/src/` |
| AC-12 | The pipeline runs without error when no files of a given language are changed (graceful skip) |
| AC-13 | All existing integrity checks from `integrity-GP.yml` remain functionally unchanged |
| AC-14 | The six source workflow files are deleted after `quality-pipeline.yml` is verified green on a real PR |

---

## 8. Metric Thresholds & Gates

| Job | Metric | Script Default | Gate Behavior |
|---|---|---|---|
| cyclomatic-complexity | Max complexity per file | 15 (`DANGER` > 15) | Fail if `failed_files > 0` |
| nesting-depth | Max nesting depth per file | 5 (`CRITICAL`) | Fail if `failed_files > 0` |
| identifier-length | Avg identifier length per file | < 10 = `IMPROVE` | Fail if `failed_files > 0` |
| fog-index-metrics | Avg fog score per file | > 17 = `COMPLEX` | Fail if `failed_files > 0` |

All thresholds are owned by the individual scripts. The pipeline does not re-define them; it reads `summary.failed_files` from each script's JSON output to decide pass/fail.

---

## 9. Consolidated Report Schema (JSON)

```json
{
  "run_id": "<github.run_id>",
  "ref": "<github.ref>",
  "sha": "<github.sha>",
  "timestamp": "<ISO 8601>",
  "languages_targeted": ["python", "javascript", "typescript", "java", "csharp"],
  "summary": {
    "overall": "pass | warn | fail",
    "jobs": {
      "cyclomatic-complexity":  "pass | fail | skipped",
      "nesting-depth":          "pass | fail | skipped",
      "identifier-length":      "pass | fail | skipped",
      "fog-index-metrics":      "pass | fail | skipped",
      "access-control-audit":   "pass | fail",
      "route-auth-audit":       "pass | fail",
      "static-security-scan":   "pass | fail"
    }
  },
  "quality": {
    "complexity":         { /* CyclomaticMetricGP.py output */ },
    "nesting":            { /* depth_conditional_nesting_GP.py output */ },
    "identifier_length":  { /* len_identifiersGP.py output */ },
    "fog_index":          { /* fog_comments_indexGP.py output */ }
  },
  "security": {
    "access_control": { /* parsed access-control.log */ },
    "route_auth":     { /* parsed route-auth.log */ },
    "static_scan":    { /* parsed static-scan.log */ }
  }
}
```

---

## 10. Migration Plan

| Step | Action | Owner |
|---|---|---|
| 1 | Create `quality-pipeline.yml` implementing all 8 jobs | Engineer |
| 2 | Extend `generate-integrity-report.js` to consume quality metric JSONs (Jobs 1-4) | Engineer |
| 3 | Validate pipeline on a test branch with files in each target language | Engineer |
| 4 | Run old and new pipelines in parallel on 2 real PRs to confirm result parity | Reviewer |
| 5 | Delete `ComplexiCheckGP.yml`, `conditional-nestingGP.yml`, `identifier_lengthGP.yml`, `metrics-Gp.yml`, `integrity-GP.yml`, `Metrics-html-reportGP.yml` | Engineer |
| 6 | Update `.github/README_CheckSheet` and any CI documentation | Engineer |

---

## 11. Open Questions

| # | Question | Decision |
|---|---|
---|
| OQ-1 | Should cyclomatic complexity, nesting depth, and identifier length be extended to Java? (Requires a Java parser — e.g. `javalang` Python lib) | TBD — v1 is Python/JS/TS only for these metrics |
| OQ-2 | Should C# be added to the metric scripts and Fog Index? (Requires Roslyn or regex for `.cs`) | TBD |
| OQ-3 | Should thresholds be extracted to a shared `.quality-config.yml` file instead of relying on script defaults? | TBD |
| OQ-4 | Should the schedule trigger (Monday 03:00 UTC) be kept in the unified pipeline? | TBD |
| OQ-5 | Should `generate-integrity-report.js` be renamed to `generate-quality-report.js` to reflect broader scope? | TBD |
| OQ-6 | Should Job 8 post a PR comment summarizing the report (using `generate_pr_summary.js`)? | TBD — out of scope for v1 |

---

## 12. Out of Scope for v1

- Trend tracking (storing historical metric data across runs)
- PR comment bot posting a quality summary
- Per-author attribution of complexity or nesting violations
- Blocking merges via branch protection rules (configured separately in GitHub Settings)
- Java AST-based metric scripts (complexity, nesting, identifier length for `.java`)
- C# support in metric scripts and Fog Index
