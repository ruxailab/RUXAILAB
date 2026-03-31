# A3: CI/CD Pipeline with GitHub Actions

**Universitat de Lleida — Academic Year 2025–2026**

---

## Table of Contents

- [A3: CI/CD Pipeline with GitHub Actions](#a3-cicd-pipeline-with-github-actions)
  - [Table of Contents](#table-of-contents)
  - [Overview](#overview)
  - [Repository Structure](#repository-structure)
  - [CI Pipeline — `ci.yml`](#ci-pipeline--ciyml)
    - [CI Trigger Events](#ci-trigger-events)
    - [CI Jobs](#ci-jobs)
      - [1. Lint](#1-lint)
      - [2. Test](#2-test)
      - [3. Build](#3-build)
    - [CI Workflow Diagram](#ci-workflow-diagram)
  - [CD Pipeline — `cd.yml`](#cd-pipeline--cdyml)
    - [CD Trigger Events](#cd-trigger-events)
    - [Concurrency Control](#concurrency-control)
    - [CD Jobs](#cd-jobs)
      - [1. Build](#1-build)
      - [2. Deploy Hosting](#2-deploy-hosting)
      - [3. Deploy Functions](#3-deploy-functions)
      - [4. Deploy Firestore Rules](#4-deploy-firestore-rules)
      - [5. Deploy Storage Rules](#5-deploy-storage-rules)
    - [Environment Mapping](#environment-mapping)
    - [CD Workflow Diagram](#cd-workflow-diagram)
  - [GitHub Secrets Required](#github-secrets-required)
  - [Technologies \& Actions Used](#technologies--actions-used)
    - [GitHub Actions Used](#github-actions-used)
    - [Project Stack](#project-stack)
  - [How to Trigger Manually](#how-to-trigger-manually)

---

## Overview

This project implements two separate GitHub Actions workflows for **Continuous Integration (CI)** and **Continuous Deployment (CD)**:

| Workflow | File | Purpose |
|----------|------|---------|
| **CI** | `.github/workflows/ci.yml` | Validates code quality on every push and pull request (lint, test, build) |
| **CD** | `.github/workflows/cd.yml` | Builds and deploys the application to Firebase (hosting, functions, rules) |

The application is a  web application deployed to **Firebase** (Hosting, Cloud Functions, Firestore, and Storage).

---

## Repository Structure

```
.github/
└── workflows/
    ├── ci.yml          # Continuous Integration pipeline
    └── cd.yml          # Continuous Deployment pipeline
```

---

## CI Pipeline — `ci.yml`

The CI pipeline is responsible for **validating code quality** on every code change. It ensures that no broken or non-compliant code gets merged into the main branches.

### CI Trigger Events

The pipeline runs on:

- **`push`** to branches `main` or `develop`
- **`pull_request`** targeting branches `main` or `develop`

```yaml
on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main, develop]
```

### CI Jobs

The CI workflow contains **3 jobs**:

#### 1. Lint

Validates code style and quality using **ESLint**.

| Property | Value |
|----------|-------|
| Runner | `ubuntu-latest` |
| Node.js | LTS (latest) |
| Command | `npm run lint` |
| Dependencies on | — (runs immediately) |

**Steps:**
1. Checkout the repository code (`actions/checkout@v4`)
2. Setup Node.js with npm caching (`actions/setup-node@v4`)
3. Install dependencies using `npm ci` (clean, reproducible install)
4. Execute ESLint on the `src/` directory

#### 2. Test

Runs the project's **unit test suite**.

| Property | Value |
|----------|-------|
| Runner | `ubuntu-latest` |
| Node.js | LTS (latest) |
| Command | `npm test` |
| Dependencies on | — (runs in parallel with Lint) |

**Steps:**
1. Checkout the repository code
2. Setup Node.js with npm caching
3. Install dependencies using `npm ci`
4. Run unit tests via `vue-cli-service test:unit`

#### 3. Build

Compiles the Vue.js application to verify it builds successfully.

| Property | Value |
|----------|-------|
| Runner | `ubuntu-latest` |
| Node.js | LTS (latest) |
| Command | `npm run build-dev` |
| Dependencies on | **Lint** and **Test** (both must pass) |

**Steps:**
1. Checkout the repository code
2. Setup Node.js with npm caching
3. Install dependencies using `npm ci`
4. Build the application in development mode

> **Note:** The Build job uses `needs: [lint, test]`, meaning it only runs after both Lint and Test complete successfully. Lint and Test run **in parallel** to save time.

### CI Workflow Diagram

```
push / pull_request
        │
        ├──────────────┐
        ▼              ▼
    ┌───────┐    ┌──────────┐
    │ Lint  │    │  Test    │
    └───┬───┘    └────┬─────┘
        │             │
        └──────┬──────┘
               ▼
         ┌───────────┐
         │   Build   │
         └───────────┘
```

---

## CD Pipeline — `cd.yml`

The CD pipeline is responsible for **building and deploying** the application to the appropriate Firebase environment.

### CD Trigger Events

The pipeline runs on:

- **`push`** to branches `main` or `develop` (automatic deployment)
- **`workflow_dispatch`** — manual trigger from the GitHub Actions UI, allowing the user to select the target environment

```yaml
on:
  push:
    branches: [main, develop]
  workflow_dispatch:
    inputs:
      environment:
        description: 'Environment to deploy'
        required: true
        type: choice
        options: [dev, develop, prod]
```

### Concurrency Control

The CD pipeline includes a **concurrency group** to prevent overlapping deployments to the same branch:

```yaml
concurrency:
  group: cd-${{ github.ref }}
  cancel-in-progress: false
```

- Deployments to the **same branch** are queued (not cancelled)
- Deployments to **different branches** can run in parallel

### CD Jobs

The CD workflow contains **5 jobs**:

#### 1. Build

Runs tests, determines the target environment, creates the `.env` configuration file, builds the application, and uploads the build artifact.

| Property | Value |
|----------|-------|
| Runner | `ubuntu-latest` |
| Node.js | LTS (latest) |
| Dependencies on | — (runs first) |
| Output | `env_name` (the resolved environment) |

**Steps:**
1. Checkout code
2. Setup Node.js with npm caching
3. Install dependencies (`npm ci`)
4. Run tests (`npm test`) — ensures only passing code gets deployed
5. **Determine environment** — resolves the target environment based on trigger:
   - `workflow_dispatch` → uses the selected input
   - `main` branch → `prod`
   - `develop` branch → `develop`
6. **Create `.env` file** — injects environment-specific secrets
7. **Build application** — uses `build-prod` for production, `build-dev` otherwise
8. **Upload artifact** — stores the `dist/` folder for downstream deploy jobs (retention: 3 days)

#### 2. Deploy Hosting

Downloads the build artifact and deploys it to **Firebase Hosting**.

| Property | Value |
|----------|-------|
| Runner | `ubuntu-latest` |
| Dependencies on | **Build** |
| Condition | Always runs after build |
| Action | `FirebaseExtended/action-hosting-deploy@v0` |

**Environment URL:** `https://ruxailab-{env_name}.web.app`

#### 3. Deploy Functions

Deploys **Firebase Cloud Functions**.

| Property | Value |
|----------|-------|
| Runner | `ubuntu-latest` |
| Dependencies on | **Build** |
| Condition | Only runs for `prod` or `develop` environments |
| Action | `w9jds/firebase-action@master` |

**Steps:**
1. Checkout code
2. Setup Node.js
3. Install function dependencies (`npm ci --prefix functions`)
4. Deploy functions using Firebase CLI

#### 4. Deploy Firestore Rules

Deploys **Firestore security rules and indexes**.

| Property | Value |
|----------|-------|
| Runner | `ubuntu-latest` |
| Dependencies on | **Build** |
| Condition | Only runs for `prod` or `develop` environments |
| Action | `w9jds/firebase-action@master` |

#### 5. Deploy Storage Rules

Deploys **Firebase Storage security rules**.

| Property | Value |
|----------|-------|
| Runner | `ubuntu-latest` |
| Dependencies on | **Build** |
| Condition | Only runs for `prod` or `develop` environments |
| Action | `w9jds/firebase-action@master` |

### Environment Mapping

| Trigger | Branch / Input | Environment | Hosting Deploy | Functions / Rules Deploy |
|---------|---------------|-------------|----------------|------------------------|
| `push` | `main` | `prod` | Yes | Yes |
| `push` | `develop` | `develop` | Yes | Yes |
| `workflow_dispatch` | `prod` | `prod` | Yes | Yes |
| `workflow_dispatch` | `develop` | `develop` | Yes | Yes |
| `workflow_dispatch` | `dev` | `dev` | Yes | **No** |

> **Note:** The `dev` environment only deploys hosting. Functions, Firestore rules, and Storage rules are only deployed for `prod` and `develop`.

### CD Workflow Diagram

```
push (main/develop) / workflow_dispatch
                │
                ▼
          ┌───────────┐
          │   Build   │
          │ (test +   │
          │  artifact)│
          └─────┬─────┘
                │
    ┌───────┬───┴────┬──────────────┐
    ▼       ▼        ▼              ▼
┌───────┐┌────────┐┌──────────┐┌──────────┐
│Hosting││Functions││ Firestore││ Storage  │
│Deploy ││ Deploy ││  Rules   ││  Rules   │
└───────┘└────────┘└──────────┘└──────────┘
             │           │           │
             └─── only prod/develop ─┘
```

---

## GitHub Secrets Required

The following secrets must be configured in **Repository Settings → Secrets and variables → Actions**:

| Secret | Description |
|--------|-------------|
| `ENV_PROD` | Environment variables for production (`.env` file content) |
| `ENV_DEVELOP` | Environment variables for develop (`.env` file content) |
| `ENV_DEV` | Environment variables for dev (`.env` file content) |
| `FIREBASE_SERVICE_ACCOUNT` | Firebase service account JSON key for authentication |
| `FIREBASE_PROJECT_ID` | Firebase project ID |

> `GITHUB_TOKEN` is automatically provided by GitHub Actions and does not need to be manually configured.

---

## Technologies & Actions Used

### GitHub Actions Used

| Action | Version | Purpose |
|--------|---------|---------|
| `actions/checkout` | `v4` | Checks out the repository code |
| `actions/setup-node` | `v4` | Sets up Node.js with npm caching |
| `actions/upload-artifact` | `v4` | Uploads build artifacts between jobs |
| `actions/download-artifact` | `v4` | Downloads build artifacts in deploy jobs |
| `FirebaseExtended/action-hosting-deploy` | `v0` | Deploys to Firebase Hosting |
| `w9jds/firebase-action` | `master` | Deploys Functions, Firestore rules, Storage rules |

### Project Stack

| Technology | Version | Role |
|------------|---------|------|
| **Node.js** | LTS | Runtime environment |
| **Vue.js** | 3.5.26 | Frontend framework |
| **Vue CLI** | 5.0.8 | Build tooling |
| **ESLint** | — | Code linting |
| **Firebase** | — | Hosting, Functions, Firestore, Storage |

---

## How to Trigger Manually

1. Go to the repository on GitHub
2. Navigate to **Actions** tab
3. Select the **CD** workflow from the left sidebar
4. Click **Run workflow**
5. Choose the target environment (`dev`, `develop`, or `prod`)
6. Click **Run workflow** to start the deployment

---

*Patrick Augusto — Universitat de Lleida, 2026*
