# A2: Application of Ishikawa Tools and GitHub Actions

**Universitat de Lleida — March 2026**

---

## 1. Team Identification

- **Repository:** [RUXAILAB](https://github.com/<OWNER>/RUXAILAB) *(update with actual URL)*
- **Team ID:** *(fill in)*
- **Members:** *P*

---

## 2. Chosen Ishikawa Tool: Check Sheet

### 2.1 What is a Check Sheet?

A **Check Sheet** (also called a **Tally Sheet**) is one of the seven basic quality tools proposed by Kaoru Ishikawa. It is a structured form used to collect, organize, and count data about defects or events in real time. Its purpose is to transform opinions into facts by systematically recording occurrences over a defined period.

### 2.2 Why we chose it

Our project (RUXAILAB) runs multiple CI/CD pipelines on every push and pull request — tests, security scans, linting, and code analysis. We needed a way to **track and visualize pipeline failure trends over the working week** to identify recurring quality problems early.

A Check Sheet is the ideal tool because:

- It provides a simple tally of events (pipeline failures) per day.
- It reveals patterns (e.g., failures concentrate on certain days or categories).
- It feeds data into other Ishikawa tools (Pareto chart, histogram) for deeper analysis.

---

## 3. How We Applied the Check Sheet

### 3.1 Problem Identified

> **"Which categories of CI pipeline failures occur most frequently during the week, and when?"**

We defined three defect categories tracked automatically from our pipelines, plus an open category:

| Category | Source Pipelines |
|---|---|
| **Test error** | Workflows with `test` in the name |
| **Security vulnerability** | GitGuardian, workflows with `security` in the name |
| **Code smells / Bugs** | SonarCloud, PR Checks, linting workflows |
| **Other / Miscellaneous** | Any uncategorized failures |

### 3.2 Data Structure

The check sheet data is stored in **`.github/quality_control_data.json`**:

```json
{
  "document_type": "Check Sheet",
  "purpose": "Quality Control - Defect/Event Tracking",
  "title": "Check Sheet or Checklist",
  "schema": {
    "columns": ["Defect/Event occurrence","Mon","Tue","Wed","Thu","Fri","TOTAL"]
  },
  "records": [
    {
      "occurrence": "Test error",
      "daily_counts": { "Mon": 0, "Tue": 0, "Wed": 0, "Thu": 2, "Fri": 0 },
      "total": 2
    },
    {
      "occurrence": "Security vulnerability",
      "daily_counts": { "Mon": 0, "Tue": 0, "Wed": 0, "Thu": 2, "Fri": 0 },
      "total": 2
    },
    {
      "occurrence": "Code smells/Bugs",
      "daily_counts": { "Mon": 0, "Tue": 0, "Wed": 0, "Thu": 0, "Fri": 0 },
      "total": 0
    },
    {
      "occurrence": "Other/Miscellaneous",
      "daily_counts": { "Mon": 0, "Tue": 0, "Wed": 0, "Thu": 0, "Fri": 0 },
      "total": 0
    }
  ],
  "summary": { "grand_total": 4, "days_tracked": 5 },
  "issues_tracking": { ... }
}
```

### 3.3 Check Sheet Visualization (Rendered Table)

| Defect/Event occurrence | Mon | Tue | Wed | Thu | Fri | **TOTAL** |
|---|:---:|:---:|:---:|:---:|:---:|:---:|
| Test error | 0 | 0 | 0 | 2 | 0 | **2** |
| Security vulnerability | 0 | 0 | 0 | 2 | 0 | **2** |
| Code smells/Bugs | 0 | 0 | 0 | 0 | 0 | **0** |
| Other/Miscellaneous | 0 | 0 | 0 | 0 | 0 | **0** |
| **GRAND TOTAL** | | | | | | **4** |

### 3.4 Conclusions from the Check Sheet

- Failures concentrated on **Thursday**, with 2 test errors and 2 security issues.
- **Code smells/bugs** and **miscellaneous** had zero failures, meaning linting and code analysis pipelines are stable.
- The data suggests investigating what changes were pushed on Thursday that caused both test and security failures simultaneously.
- Over the tracked week, the project accumulated **4 total defect events**, all on a single day — indicating a possible batch of problematic commits rather than a systemic issue.

### 3.5 Bonus: Open Issues Tracking

The pipeline also tracks open GitHub Issues by label category:

| Bug 🐛 | Feature ✨ | UX/UI 🎨 | Infra 🛠️ | Testing 🧪 | Docs 📝 | **Total Open** |
|:---:|:---:|:---:|:---:|:---:|:---:|:---:|
| 0 | 0 | 0 | 0 | 0 | 0 | **0** |

This provides additional context for the quality state of the project beyond pipeline failures.

---

## 4. GitHub Action Implementation

### 4.1 Architecture Overview

```
workflow_run event (pipeline finishes)
        │
        ▼
┌──────────────────────────────────┐
│  quality-control-aggregator.yml  │  (Workflow)
│                                  │
│  Step 1: Checkout repo           │
│  Step 2: Fetch pipeline results  │──► Scans ALL active workflows
│          (actions/github-script)  │   Classifies failures by keyword
│  Step 3: Run QC report script    │──► Updates JSON + generates summary
│  Step 4: Auto-commit JSON        │──► Commits updated check sheet
└──────────────────────────────────┘
        │
        ▼
  📊 Job Summary (Markdown artifact in Actions tab)
  📄 Updated quality_control_data.json (committed to repo)
```

### 4.2 Workflow File: `.github/workflows/quality-control-aggregator.yml`

**Triggers:**

| Trigger | Description |
|---|---|
| `workflow_run` | Fires when `test`, `GitGuardian scan`, `SonarCloud Issue Creator`, `PR Checks` complete |
| `schedule` | Runs at 23:00 UTC, Monday–Friday (`0 23 * * 1-5`) |
| `workflow_dispatch` | Manual trigger for testing |

**Permissions:**

```yaml
permissions:
  contents: write   # Commit updated JSON
  actions: read     # Read workflow run results
  issues: read      # Count open issues by label
```

**Key steps:**

1. **Checkout** — `actions/checkout@v4`
2. **Fetch Pipeline Results** — `actions/github-script@v7`: scans all active workflows, counts today's failures, classifies them by keyword into `TEST_ERRORS`, `SECURITY_ISSUES`, `CODE_SMELLS`.
3. **Execute QC Report** — runs `.github/scripts/generate_qc_report.js`: updates the JSON, recalculates totals, fetches open issues, generates a Markdown summary.
4. **Auto-commit** — `stefanzweifel/git-auto-commit-action@v5`: commits the updated `quality_control_data.json`.

### 4.3 Script: `.github/scripts/generate_qc_report.js`

This script:

1. Reads `quality_control_data.json`.
2. Determines the current UTC weekday (skips weekends).
3. Writes the failure counts from environment variables into the correct day column.
4. Recalculates row totals and the grand total.
5. Queries the GitHub API for open issues and classifies them by label.
6. Saves the updated JSON file.
7. Generates a **Markdown Job Summary** visible in the GitHub Actions tab — this is the **artifact**.

### 4.4 Generated Artifact

The workflow produces two artifacts:

| Artifact | Location | Format |
|---|---|---|
| **Quality Control Check Sheet** (data) | `.github/quality_control_data.json` | JSON |
| **Daily QC Report** (visual) | GitHub Actions → Job Summary tab | Markdown tables |

The **Job Summary** rendered in the Actions tab looks like:

> ### 📊 Weekly Cumulative Defects (Check Sheet)
>
> | Defect/Event occurrence | Mon | Tue | Wed | Thu | Fri | TOTAL |
> |---|:---:|:---:|:---:|:---:|:---:|:---:|
> | Test error | 0 | 0 | 0 | 2 | 0 | **2** |
> | Security vulnerability | 0 | 0 | 0 | 2 | 0 | **2** |
> | Code smells/Bugs | 0 | 0 | 0 | 0 | 0 | **0** |
> | Other/Miscellaneous | 0 | 0 | 0 | 0 | 0 | **0** |
>
> ### 🐛 Active Issues Analysis (by Labels)
>
> | Bug 🐛 | Feature ✨ | UX/UI 🎨 | Infra 🛠️ | Testing 🧪 | Docs 📝 | Total |
> |:---:|:---:|:---:|:---:|:---:|:---:|:---:|

### 4.5 Companion Workflow: PR/Commit Checks Summary

An additional workflow (`.github/workflows/pr-summary-comment.yml`) complements the check sheet by posting a **pipeline status table as a PR comment** every time a monitored workflow finishes. This uses `.github/scripts/generate_pr_summary.js`.

---

## 5. How to Run / Demo

### 5.1 Automatic Trigger

Push a commit or open a PR. When any monitored workflow (test, GitGuardian, SonarCloud, PR Checks) completes, the aggregator fires automatically.

### 5.2 Manual Trigger

1. Go to **Actions** tab in the GitHub repository.
2. Select **Quality Control Aggregator**.
3. Click **Run workflow** → **Run workflow**.
4. After completion, click on the run and open the **Summary** tab to see the rendered check sheet.

### 5.3 Scheduled

The workflow runs automatically every weekday at **23:00 UTC** to capture the end-of-day state.

---

## 6. Repository Structure (Relevant Files)

```
.github/
├── quality_control_data.json          ← Check Sheet data (JSON)
├── scripts/
│   ├── generate_qc_report.js          ← QC report generator script
│   ├── generate_pr_summary.js         ← PR summary comment script
│   └── README_CheckSheet              ← Reuse/migration guide
└── workflows/
    ├── quality-control-aggregator.yml ← Main QC workflow
    └── pr-summary-comment.yml         ← PR comment workflow
```

---

## 7. Integration of Another Ishikawa Tool

*(This section is for when you receive a tool from another group member and integrate it.)*

**Tool received:** *(fill in: e.g., Pareto Chart, Histogram, Control Chart)*
**From team member:** *(fill in)*
**Integration steps:**

1. *(Describe what was added)*
2. *(Describe the workflow/action added)*
3. *(Describe the artifact produced)*

---

## 8. Video Script Guide (3–5 min)

Use this outline to record the submission video:

| Time | Content |
|---|---|
| **0:00 – 0:30** | Show Team ID. Introduce the assignment and the chosen tool (Check Sheet). |
| **0:30 – 1:30** | Explain **why** the Check Sheet was chosen — tracking CI/CD pipeline failures across the week. Show the categories and the rendered table in this document or in the JSON. |
| **1:30 – 2:30** | Open the **GitHub repository**. Navigate to `.github/workflows/quality-control-aggregator.yml`. Briefly explain the trigger, the classification logic, and the auto-commit step. Show `generate_qc_report.js`. |
| **2:30 – 3:30** | **Demo the workflow**: either trigger it manually via `workflow_dispatch` or show an existing completed run. Open the **Job Summary** tab to show the rendered Markdown artifact (the check sheet table and issue analysis). |
| **3:30 – 4:00** | Show the committed `quality_control_data.json` and explain how it updates automatically. |
| **4:00 – 4:30** | *(If applicable)* Show the integrated tool received from another group member. |
| **4:30 – 5:00** | Summarize conclusions: what patterns the Check Sheet revealed about the project's quality. |

---

## 9. References

- Ishikawa, K. (1985). *What Is Total Quality Control? The Japanese Way*. Prentice Hall.
- GitHub Actions Documentation: https://docs.github.com/en/actions
- Seven Basic Quality Tools: https://en.wikipedia.org/wiki/Seven_basic_tools_of_quality
