# Contributing to RUXAILAB

Thank you for your interest in contributing to RUXAILAB! This document provides guidelines and instructions for contributing to this open-source usability testing platform.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Setup](#development-setup)
- [Contribution Workflow](#contribution-workflow)
- [Code Standards](#code-standards)
- [Testing](#testing)
- [Reporting Issues](#reporting-issues)
- [Issue Labeling Guide](#issue-labeling-guide)
- [Pre-commit Hooks](#pre-commit-hooks)

## Code of Conduct

We are committed to providing a welcoming and inclusive environment for all contributors. Please be respectful and constructive in all interactions.

For Code of Conduct discussions and support, please use our Discord channel: https://discord.com/channels/1209902463239593984/1209902463713288293

## Getting Started

RUXAILAB is a Vue.js-based platform for usability testing and heuristic evaluation. Before contributing, familiarize yourself with:

- [Vue.js 3.x](https://vuejs.org/)
- [Vuetify 3.x](https://vuetifyjs.com/)
- [Firebase](https://firebase.google.com/)

## Development Setup

### Prerequisites

- **Node.js** ≤ 24.12.0
- **Python** 3.11.8
- **npm** (comes with Node.js)
- **Docker** (optional, for Firebase Emulators)

### Option 1: Docker with Firebase Emulators (Recommended for Local Development)

This approach runs the entire application with Firebase emulators in Docker containers.

1. **Clone the repository**

   ```bash
   git clone https://github.com/uramakilab/remote-usability-lab.git
   cd remote-usability-lab
   ```

2. **Set up environment variables**

   ```bash
   cp .env.example .env
   ```

   Update `.env` with the following for local emulator development:

   ```ini
   DEBUG=true
   PORT=8000

   VUE_APP_FIREBASE_API_KEY=YOUR_API_KEY
   VUE_APP_FIREBASE_AUTH_DOMAIN=YOUR_PROJECT_ID.firebaseapp.com
   VUE_APP_FIREBASE_STORAGE_BUCKET=YOUR_PROJECT_ID.appspot.com
   VUE_APP_FIREBASE_DB_URL=http://localhost:9000
   VUE_APP_FIREBASE_PROJECT_ID=YOUR_PROJECT_ID
   VUE_APP_FIREBASE_MESSAGING_SENDER_ID=YOUR_SENDER_ID
   VUE_APP_FIREBASE_APP_ID=YOUR_APP_ID
   VUE_APP_I18N_LOCALE=en
   VUE_APP_I18N_FALLBACK_LOCALE=en
   ```

3. **Build and run with Docker**

   ```bash
   docker compose build
   docker compose up
   ```

4. **Access the application**
   - Application: http://localhost:8080
   - Firebase Emulator UI: http://localhost:4000

### Option 2: Production Firebase Setup

For development with a real Firebase project:

1. **Clone and install dependencies**

   ```bash
   git clone https://github.com/uramakilab/remote-usability-lab.git
   cd remote-usability-lab
   npm install
   ```

2. **Create Firebase project**
   - Go to [Firebase Console](https://console.firebase.google.com/)
   - Create a new project
   - Enable Realtime Database, Firestore, Authentication, and Storage

3. **Configure environment**
   - Get your Firebase config from Project Settings
   - Copy `.env.example` to `.env`
   - Fill in your Firebase credentials

4. **Run development server**
   ```bash
   npm run serve
   ```

## Contribution Workflow

### 1. Fork and Clone

Fork the repository and clone your fork:

```bash
git clone https://github.com/YOUR_USERNAME/remote-usability-lab.git
cd remote-usability-lab
```

### 2. Create a Feature Branch

Branch from `develop`:

```bash
git checkout develop
git pull origin develop
git checkout -b feature/your-feature-name
```

**Branch naming conventions:**

- `feature/` - New features
- `fix/` - Bug fixes
- `docs/` - Documentation updates
- `refactor/` - Code refactoring
- `test/` - Adding or updating tests

### 3. Make Your Changes

- Write clean, readable code
- Follow the existing code style
- Add tests for new functionality
- Update documentation as needed

### 4. Commit Your Changes

Use clear, descriptive commit messages:

```bash
git add .
git commit -m "feat: add user profile customization"
```

**Commit message format:**

- `feat:` - New feature
- `fix:` - Bug fix
- `docs:` - Documentation changes
- `style:` - Formatting, missing semicolons, etc.
- `refactor:` - Code restructuring
- `test:` - Adding tests
- `chore:` - Maintenance tasks

### 5. Push and Create Pull Request

```bash
git push origin feature/your-feature-name
```

Then create a Pull Request on GitHub:

- Target the `develop` branch
- Provide a clear description of your changes
- Reference any related issues
- Keep at most **2 open Pull Requests** per contributor at any time (additional PRs are automatically closed by workflow)
- Wait for review and address any feedback

## Code Standards

### Formatting

We use **Prettier** for code formatting. Prettier is automatically applied through pre-commit hooks, so you don't need to manually format most of the time.

```bash
# If needed, manually format files
npx prettier --write src/your-file.vue
```

See [Code Formatting Rules](#code-formatting-rules) section below for detailed information about formatting standards.

### Linting

We use **ESLint** for code quality. Configuration is in `eslint.config.mjs`.

```bash
# Run linter
npm run lint

# Auto-fix issues
npm run lint:fix
```

See [Code Formatting Rules](#code-formatting-rules) section below for detailed ESLint configuration information.

### Vue.js Best Practices

- Use Composition API for new components
- Follow Vue 3 style guide
- Use Vuetify components consistently
- Keep components small and focused
- Use proper prop validation

### File Organization

```
src/
├── app/
│   ├── components/    # Reusable components
│   ├── plugins/       # Vue plugins (Firebase, etc.)
│   ├── router/        # Vue Router configuration
│   └── views/         # Page components
├── features/          # Feature-specific modules
├── shared/            # Shared utilities and constants
└── store/             # State management
```

## Testing

### Unit Tests (Jest)

```bash
# Run all tests
npm run test:unit

# Run tests in watch mode
npm run test:unit:watch

# Run with coverage
npm run test:unit:coverage
```

### End-to-End Tests (Playwright)

```bash
# Run E2E tests
npm run test:e2e

# Run in headed mode (see browser)
npm run test:e2e:headed
```

### Writing Tests

- Write unit tests for utility functions and components
- Write E2E tests for critical user flows
- Aim for good coverage without over-testing
- Keep tests maintainable and readable

## Reporting Issues

Each contributor may have a maximum of **5 open issues** at a time.

### Bug Reports

When reporting bugs, please include:

- **Clear title** describing the issue
- **Steps to reproduce** the bug
- **Expected behavior** vs actual behavior
- **Environment details** (OS, browser, Node version)
- **Screenshots** if applicable
- **Error messages** or console logs

Use the [Bug Report template](https://github.com/uramakilab/remote-usability-lab/issues/new)

### Feature Requests

For feature requests, include:

- **Use case** - Why is this feature needed?
- **Proposed solution** - How should it work?
- **Alternatives considered** - Other approaches you've thought about

Use the [Feature Request template](https://github.com/uramakilab/remote-usability-lab/issues/new)

### Questions and Discussions

For questions or general discussion, use [GitHub Discussions](https://github.com/uramakilab/remote-usability-lab/discussions).

## Issue Labeling Guide

Issues in RUXAILAB are automatically labeled based on the issue title format and content. Understanding how labels work helps with issue organization and discoverability.

### Auto-Applied Labels

Issues are automatically labeled when opened or edited. Here's how to use labels effectively:

#### 1. **Issue Type Labels** (Auto-applied based on title format)

Use conventional commit prefixes in your issue title to get proper type labels:

| Prefix      | Label           | Usage                          |
| ----------- | --------------- | ------------------------------ |
| `feat:`     | `feature`       | New features or enhancements   |
| `fix:`      | `bug`           | Bug reports and fixes          |
| `docs:`     | `documentation` | Documentation improvements     |
| `refactor:` | `refactor`      | Code refactoring               |
| `test:`     | `tests`         | Test additions or improvements |
| `perf:`     | `performance`   | Performance improvements       |
| `ci:`       | `ci`            | CI/CD workflow changes         |
| `chore:`    | `chore`         | Maintenance tasks              |
| `build:`    | `build`         | Build system changes           |
| `style:`    | `style`         | Formatting and style changes   |

**Examples:**

- ✅ `feat: add dark mode support` → gets `feature` label
- ✅ `fix: correct navbar alignment` → gets `bug` label
- ✅ `docs: update installation guide` → gets `documentation` label
- ❌ `Add dark mode support` → no type label (ambiguous)

#### 2. **User Type Labels** (Auto-applied based on user role)

- **`maintainer-issue`** - Issues opened by maintainers and team members
- **`community-issue`** - Issues opened by community contributors

These labels help maintainers identify which issues come from the core team vs. the community.

#### 3. **Other Auto-Applied Labels**

- **`bug`** - Auto-applied for bug reports (if title contains `[bug]`, `🐞`, or matches bug template)
- **`help`** - Auto-applied if issue title or body mentions "help wanted" or "need help"

#### 4. **Manual Labels** (Applied by maintainers)

Some labels are applied manually by maintainers:

- **`good first issue`** - Good starting points for new contributors
- **`blocked`** - Issues blocked by other work
- **`wontfix`** - Issues that won't be worked on
- **`duplicate`** - Duplicate of another issue
- **`priority-high`** / **`priority-medium`** / **`priority-low`** - Issue priority levels
- **`security`** - Security-related issues
- **`dependencies`** - Dependency update issues

### Writing Issues with Proper Labels

To ensure your issue gets the correct labels:

1. **Use conventional commit format** for the title:

   ```
   <type>(<scope>): <description>
   ```

   - `type`: One of feat, fix, docs, refactor, test, perf, ci, chore, build, style
   - `scope` (optional): Component or area affected, e.g., `auth`, `dashboard`
   - `description`: Brief description

   Examples:
   - `feat(auth): add social login providers`
   - `fix(ux-creation): resolve template duplication bug`
   - `docs(api): update Firebase setup instructions`

2. **Use issue templates**: GitHub provides templates for bug reports and feature requests that auto-apply some labels

3. **Be clear and descriptive**: This helps maintainers understand the issue scope and apply additional labels correctly

## Pre-commit Hooks

This project uses **Husky** and **lint-staged** to automatically format and lint code before each commit. This ensures code quality standards are maintained.

### How It Works

When you commit changes, the following automatically runs:

1. **Husky** intercepts the commit
2. **lint-staged** runs linting and formatting on staged files:
   - **ESLint** checks for code quality issues
   - **Prettier** formats code for consistency

### Pre-commit Hook Rules

```bash
# Files matching src/**/*.{js,vue} will have:
- eslint --fix         # Auto-fix ESLint issues
- prettier --write     # Auto-format with Prettier
```

### Setup

Pre-commit hooks are set up automatically when you run:

```bash
npm install
```

This installs Husky and sets up the `.husky/pre-commit` hook.

### If Hooks Don't Run

If pre-commit hooks aren't running, initialize Husky:

```bash
npx husky install
```

### Skipping Pre-commit Hooks (Not Recommended)

If you absolutely need to skip the pre-commit hook, use:

```bash
git commit --no-verify
```

⚠️ **Warning**: This bypasses code quality checks. Avoid this in production code.

### Manual Code Quality Checks

You can also manually run these commands:

```bash
# Check for ESLint issues
npm run lint

# Auto-fix ESLint issues
npm run lint:fix

# Format code with Prettier (if needed manually)
npm run format

# Or use Prettier directly to format specific files
npx prettier --write src/your-file.vue
```

### Code Formatting Rules

#### Prettier Configuration

RUXAILAB uses Prettier for consistent code formatting. While there's no `.prettierrc` file, Prettier uses sensible defaults:

- **Print Width**: 80 characters
- **Tabs**: 2 spaces (no tabs)
- **Quotes**: Double quotes for strings
- **Semicolons**: Enabled
- **Trailing Commas**: ES5 style (where valid in older JS)
- **Arrow Functions**: Always add parentheses around parameters

#### ESLint Configuration

ESLint configuration is in `eslint.config.mjs`:

- **Parser**: Uses Vue 3 template parser with Babel support
- **Plugins**: Vue, Vuetify, Vue I18n
- **Extends**: Vue recommended rules, Vuetify recommendations, Prettier integration
- **Browsers Globals**: Browser APIs are available

Key rules enforced:

- Vue 3-specific syntax requirements
- Proper component structure
- No unused variables
- Proper i18n usage

### Vue.js Code Style Examples

#### ✅ Good Component Structure

```vue
<template>
  <div class="card">
    <h2>{{ title }}</h2>
    <p>{{ description }}</p>
    <v-btn @click="handleClick">{{ buttonText }}</v-btn>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'

const props = defineProps({
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    default: '',
  },
})

const emit = defineEmits(['click'])

const count = ref(0)

const buttonText = computed(() => {
  return count.value > 0 ? `Clicked ${count.value} times` : 'Click me'
})

function handleClick() {
  count.value++
  emit('click', count.value)
}
</script>

<style scoped>
.card {
  padding: 1rem;
  border: 1px solid var(--divider);
  border-radius: 4px;
}
</style>
```

#### ✅ Good JavaScript Style

```javascript
// Use const by default, let if you need to reassign
const API_ENDPOINT = 'https://api.example.com'
let selectedUser = null

// Arrow functions for callbacks
const items = data.map((item) => ({
  ...item,
  formatted: item.value.toUpperCase(),
}))

// Destructuring in function parameters
function processData({ name, age, email }) {
  return {
    name: name.trim(),
    age: parseInt(age),
    email: email.toLowerCase(),
  }
}

// Use template literals
const message = `Hello, ${userName}! You have ${messageCount} new messages.`

// Async/await for promises
async function fetchUserData(userId) {
  try {
    const response = await fetch(`/api/users/${userId}`)
    if (!response.ok) {
      throw new Error(`API error: ${response.status}`)
    }
    return await response.json()
  } catch (error) {
    console.error('Failed to fetch user:', error)
    throw error
  }
}
```

- [README.md](README.md) - Project overview and setup
- [Vue.js Documentation](https://vuejs.org/)
- [Vuetify Documentation](https://vuetifyjs.com/)
- [Firebase Documentation](https://firebase.google.com/docs)
- [Video Tutorial](https://youtu.be/dAf4LRxITCc) - Running RUXAILAB with Firebase Emulators

## Getting Help

- **General Questions**: [GitHub Discussions](https://github.com/uramakilab/remote-usability-lab/discussions)
- **Bug Reports**: [GitHub Issues](https://github.com/uramakilab/remote-usability-lab/issues)
- **Security Issues**: Contact the maintainers privately

Thank you for contributing to RUXAILAB! 🎉
