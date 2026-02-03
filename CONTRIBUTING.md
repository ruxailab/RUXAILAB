# Contributing to UX Remote LAB

Thank you for your interest in contributing to UX Remote LAB! 🎉 This guide will help you get started.

## Table of Contents

- [Development Setup](#development-setup)
- [Code Style & Conventions](#code-style--conventions)
- [Pull Request Process](#pull-request-process)
- [Issue Labels](#issue-labels)

---

## Development Setup

### Prerequisites

| Tool    | Version   |
| ------- | --------- |
| Node.js | ≤ 24.12.0 |
| Python  | 3.11.8    |
| Vue CLI | 5.0.8     |

### Installation

1. **Fork and clone the repository**

   ```bash
   git clone https://github.com/<your-username>/remote-usability-lab.git
   cd remote-usability-lab
   ```

2. **Install dependencies**

   ```bash
   npm install
   pip install -r requirements.txt  # if applicable
   ```

3. **Set up Firebase**
   - Create a Firebase project at [console.firebase.google.com](https://console.firebase.google.com)
   - Enable Realtime Database in your project
   - Copy your Firebase config from Project Settings

4. **Configure environment variables**

   Create a `.env` file in the project root (use `.env.example` as reference):

   ```ini
   VUE_APP_FIREBASE_API_KEY="your-api-key"
   VUE_APP_FIREBASE_AUTH_DOMAIN="your-project.firebaseapp.com"
   VUE_APP_FIREBASE_DB_URL="https://your-project.firebaseio.com"
   VUE_APP_FIREBASE_PROJECT_ID="your-project-id"
   VUE_APP_FIREBASE_STORAGE_BUCKET="your-project.appspot.com"
   VUE_APP_FIREBASE_MESSAGING_SENDER_ID="your-sender-id"
   VUE_APP_FIREBASE_APP_ID="your-app-id"

   VUE_APP_I18N_LOCALE="en"
   VUE_APP_I18N_FALLBACK_LOCALE="en"
   ```

5. **Run the development server**

   ```bash
   npm run serve
   ```

### Using Firebase Emulators (Optional)

For local development without connecting to a live Firebase project:

```bash
firebase use <your-project>
firebase emulators:start
```

See the [README](./README.md#running-with-firebase-emulators) for full emulator setup instructions.

---

## Code Style & Conventions

We use automated tools to maintain consistent code style. **Your code will be automatically formatted on commit.**

### Tools

| Tool                    | Purpose                                                    |
| ----------------------- | ---------------------------------------------------------- |
| **ESLint 9**            | JavaScript/Vue linting with Vue, Vuetify, and i18n plugins |
| **Prettier**            | Code formatting                                            |
| **EditorConfig**        | Editor settings consistency                                |
| **Husky + lint-staged** | Pre-commit hooks                                           |

### Prettier Configuration

```json
{
  "singleQuote": true,
  "trailingComma": "all",
  "semi": false,
  "arrowParens": "always"
}
```

### Editor Settings

- **Indent**: 2 spaces
- **Charset**: UTF-8
- **Line endings**: LF
- **Recommended extension**: Prettier - Code formatter

### Available Commands

```bash
npm run lint        # Check for linting issues
npm run lint:fix    # Auto-fix linting issues
npm test            # Run unit tests
```

### Pre-commit Hook

When you commit, the following runs automatically on staged files:

1. `eslint --fix` - Fixes linting issues
2. `prettier --write` - Formats code

---

## Pull Request Process

### 1. Create a Branch

```bash
git checkout -b feat/your-feature-name
# or
git checkout -b fix/issue-description
```

### 2. Make Your Changes

- Write clean, well-documented code
- Add tests if applicable
- Ensure all tests pass: `npm test`
- Ensure linting passes: `npm run lint`

### 3. Commit with Conventional Commits

Use conventional commit prefixes in your PR title:

| Prefix      | Description                     |
| ----------- | ------------------------------- |
| `feat:`     | New feature                     |
| `fix:`      | Bug fix                         |
| `docs:`     | Documentation changes           |
| `style:`    | Code style changes (formatting) |
| `refactor:` | Code refactoring                |
| `test:`     | Adding/updating tests           |
| `chore:`    | Maintenance tasks               |
| `ci:`       | CI/CD changes                   |
| `perf:`     | Performance improvements        |

**Example**: `feat: add user profile settings page`

### 4. Submit a Pull Request

- **Target branch**: `develop` (for features) or `main` (for hotfixes)
- **Description requirements**:
  - Minimum 20 characters
  - Must reference an issue (e.g., `Fixes #123`)
- **CI checks must pass**:
  - ESLint linting
  - Unit tests

### 5. Code Review

A maintainer will review your PR. You may be asked to make changes before merging.

---

## Issue Labels

Labels are automatically applied to issues and PRs. Here's what they mean:

### Issue Type Labels

| Label         | Description       |
| ------------- | ----------------- |
| `Bug`         | Bug report        |
| `Enhancement` | Feature request   |
| `help`        | Help is requested |

### Source Labels

| Label              | Description                     |
| ------------------ | ------------------------------- |
| `maintainer-issue` | Created by a project maintainer |
| `community-issue`  | Created by a community member   |

### PR Size Labels

| Label     | Lines Changed |
| --------- | ------------- |
| `size/XS` | < 10          |
| `size/S`  | 10-99         |
| `size/M`  | 100-499       |
| `size/L`  | 500-999       |
| `size/XL` | 1000+         |

### PR Complexity Labels

| Label               | Files Changed |
| ------------------- | ------------- |
| `low-complexity`    | < 5 files     |
| `medium-complexity` | 5-10 files    |
| `high-complexity`   | > 10 files    |

### Component Labels

| Label           | Description                        |
| --------------- | ---------------------------------- |
| `ui/ux`         | Vue components or frontend changes |
| `backend`       | Cloud functions changes            |
| `testing`       | Test file changes                  |
| `documentation` | Documentation changes              |
| `ci/cd`         | GitHub workflow changes            |
| `assets`        | Image/asset changes                |

### Feature Labels

| Label           | Description                  |
| --------------- | ---------------------------- |
| `accessibility` | Accessibility module changes |
| `card-sorting`  | Card sorting feature changes |
| `heuristic`     | Heuristic evaluation changes |
| `user-test`     | User testing feature changes |

---

## Need Help?

- 🐛 [Report a Bug](https://github.com/uramakilab/remote-usability-lab/issues/new)
- 🚀 [Request a Feature](https://github.com/uramakilab/remote-usability-lab/issues/new)
- 🤗 [Ask a Question](https://github.com/uramakilab/remote-usability-lab/discussions)

Thank you for contributing! 🙌
