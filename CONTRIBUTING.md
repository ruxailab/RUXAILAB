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

## Code of Conduct

We are committed to providing a welcoming and inclusive environment for all contributors. Please be respectful and constructive in all interactions.

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
- Wait for review and address any feedback

## Code Standards

### Formatting

We use **Prettier** for code formatting. Configuration is in `.prettierrc`.

```bash
# Format all files
npm run format

# Check formatting
npm run format:check
```

### Linting

We use **ESLint** for code quality. Configuration is in `eslint.config.mjs`.

```bash
# Run linter
npm run lint

# Auto-fix issues
npm run lint:fix
```

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

## Additional Resources

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
