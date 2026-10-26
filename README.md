# RUXAILAB

<div align="center">

![Tests](https://github.com/ruxailab/RUXAILAB/actions/workflows/test.yml/badge.svg?branch=develop)
![Node.js](https://img.shields.io/badge/Node.js-%E2%89%A522.22.1-339933?logo=nodedotjs&logoColor=white)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
[![GitHub stars](https://img.shields.io/github/stars/ruxailab/RUXAILAB)](https://github.com/ruxailab/RUXAILAB/stargazers)
[![GitHub forks](https://img.shields.io/github/forks/ruxailab/RUXAILAB)](https://github.com/ruxailab/RUXAILAB/forks)

**An open-source platform for user research, usability testing, and accessibility evaluation.**

Plan studies, collect participant feedback, and turn research data into actionable insights.

[Features](#features) · [Getting Started](#getting-started) · [Integrations](#optional-integrations) · [Contributing](#contributing)
</div>

## Overview

RUXAILAB is an open-source platform designed to support user experience (UX) research, usability testing, and accessibility evaluation. It provides tools for creating studies, collecting participant responses, and analyzing research results.

The platform integrates with Firebase and optional external services to support its core functionality and additional research capabilities.

## Features

- **Study management:** Create and manage user research studies.
- **Usability testing:** Collect participant responses and evaluate user interactions.
- **Accessibility evaluation:** Support accessibility assessment and heuristic evaluation.
- **Data collection:** Store and manage research data using Firebase services.
- **Data visualization:** Explore research results through dashboards and charts.
- **External integrations:** Connect to services for eye tracking, sentiment analysis, PDF generation, and video calls.
- **Internationalization:** Support multiple languages through the application's localization configuration.

## Tech Stack

| Technology                 | Purpose                                 |
| -------------------------- | --------------------------------------- |
| Vue.js                     | Frontend framework                      |
| Vuetify                    | UI components and application interface |
| Firebase Authentication    | User authentication                     |
| Cloud Firestore            | Document database                       |
| Firebase Realtime Database | Real-time data storage                  |
| Firebase Storage           | File storage                            |
| Firebase Cloud Functions   | Server-side functionality               |
| Firebase Emulator Suite    | Local development and testing           |

Additional services may use their own technology stacks. Refer to their respective repositories for implementation details and setup instructions.

## Getting Started

### Prerequisites

Before setting up RUXAILAB, ensure that you have installed:

- [Node.js](https://nodejs.org/) — version `22.22.1` as specified for this project.
- npm, included with Node.js.
- [Git](https://git-scm.com/).
- A Firebase project, or the Firebase Emulator Suite for local development.

Some optional integrations require additional runtimes, dependencies, or services. Consult their repositories if you plan to use them.

### Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/ruxailab/ruxailab.git
   cd ruxailab
   ```

2. Install the project dependencies:

   ```bash
   npm install
   ```

3. Create a local environment configuration file:

   ```bash
   cp .env.example .env
   ```

4. Configure the required environment variables in `.env`. For Firebase development, provide the appropriate project configuration or enable the local emulators.

5. Start the development server:

   ```bash
   npm run serve
   ```

The application should now be available at the local URL displayed in your terminal.

> **Note:** Do not commit your `.env` file or any private credentials to version control.

## Environment Configuration

RUXAILAB uses environment variables to configure Firebase, localization, Cloud Functions, external services, and local emulators.

The root `.env.example` file documents the supported configuration variables. Copy it to `.env` and set the values required by your development environment.

**Environment-specific configuration**

RUXAILAB supports environment-specific configuration files. You can use different environment variables for development, testing, and production environments.

For example:

```text
.env                  # Default environment variables
.env.development      # Development-specific variables
.env.production       # Production-specific variables
.env.test             # Test-specific variables
```

Create the files you need and configure the appropriate values for each environment. Environment-specific files should contain only the variables that need to differ from the default configuration.

Do not commit files containing private credentials or environment-specific secrets to version control.

### Firebase Configuration

Configure the Firebase project used by the application:

```env
VUE_APP_FIREBASE_API_KEY=
VUE_APP_FIREBASE_AUTH_DOMAIN=
VUE_APP_FIREBASE_STORAGE_BUCKET=
VUE_APP_FIREBASE_DB_URL=
VUE_APP_FIREBASE_PROJECT_ID=
VUE_APP_FIREBASE_MESSAGING_SENDER_ID=
VUE_APP_FIREBASE_APP_ID=
```

These variables identify the Firebase project and its associated services. Use the values provided by your Firebase project configuration.

### Internationalization (i18n)

Set the default language and fallback language:

```env
VUE_APP_I18N_LOCALE="en"
VUE_APP_I18N_FALLBACK_LOCALE="en"
```

Both variables default to English.

### Firebase Cloud Functions URL

Configure the URL used to access Firebase Cloud Functions:

```env
VUE_APP_CLOUD_FUNCTIONS_URL=
```

For local development with the Firebase Functions Emulator, the example configuration is:

```env
VUE_APP_CLOUD_FUNCTIONS_URL="http://127.0.0.1:5002/{PROJECT_ID}/{REGION}"
```

Adjust the project identifier and URL to match your environment.

## Firebase Emulator Suite

RUXAILAB supports local Firebase emulators for development and testing. The available emulator settings allow you to enable services independently.

### Emulator Configuration

```env
VUE_APP_USE_EMULATORS="false"
VUE_APP_USE_AUTH_EMULATOR="false"
VUE_APP_USE_FIRESTORE_EMULATOR="false"
VUE_APP_USE_FUNCTIONS_EMULATOR="false"
VUE_APP_USE_STORAGE_EMULATOR="false"
VUE_APP_USE_DATABASE_EMULATOR="false"
```

Enable the appropriate settings when using the local emulators. The general emulator flag and individual service flags should be configured consistently with the application's emulator initialization logic.

### Emulator Host and Ports

```env
VUE_APP_FIREBASE_EMULATOR_HOST="localhost"
VUE_APP_FIRESTORE_EMULATOR_PORT="8081"
VUE_APP_AUTH_EMULATOR_PORT="9099"
VUE_APP_FUNCTIONS_EMULATOR_PORT="5002"
VUE_APP_STORAGE_EMULATOR_PORT="9199"
VUE_APP_DATABASE_EMULATOR_PORT="9000"
```

These values define the host and ports used by the application to connect to local Firebase services. If your emulator configuration uses different ports, update the environment variables accordingly.

For installation and configuration instructions, refer to the [Firebase Emulator Suite documentation](https://firebase.google.com/docs/emulator-suite).

## Optional Integrations

RUXAILAB can connect to external services for eye tracking, sentiment analysis, PDF generation, and video-call functionality. These integrations may require separate repositories and services to be configured and running.

### External Services and Repositories

| Integration                       | Repository                                                                                 | Environment Variable                           |
| --------------------------------- | ------------------------------------------------------------------------------------------ | ---------------------------------------------- |
| Eye tracking frontend             | [web-eye-tracker-front](https://github.com/ruxailab/web-eye-tracker-front)                 | `VUE_APP_EYE_LAB_FRONTEND_URL`                 |
| Eye tracking backend              | [eye-tracker-api](https://github.com/ruxailab/eye-tracker-api)                             | `VUE_APP_EYE_LAB_BACKEND_URL`                  |
| Speech-to-text sentiment analysis | [sentiment-analysis-api](https://github.com/ruxailab/sentiment-analysis-api)               | `VUE_APP_TRANSCRIPTION_SENTIMENT_API_BASE_URL` |
| Speech-to-text Transcriptions     | [transcription-api](https://github.com/ruxailab/transcription-api)                         | `VUE_APP_TRANSCRIPTION_API_BASE_URL`           |
| Facial sentiment analysis         | [facial-sentiment-analysis-api](https://github.com/ruxailab/facial-sentiment-analysis-api) | `VUE_APP_FACIAL_SENTIMENT_API_BASE_URL`        |
| PDF generation                    | [laravel-pdf-generator](https://github.com/ruxailab/laravel-pdf-generator)                 | `VUE_APP_LARAVEL_PDF`                          |
| Video-call token server           | [video-call-server](https://github.com/ruxailab/video-call-server)                         | `VUE_APP_LIVEKIT_TOKEN_SERVER_URL`             |

### Eye Tracking

The eye tracking integration uses a frontend application that serves as calibration tool and a backend API to process data.

Configure their URLs in `.env`:

```env
VUE_APP_EYE_LAB_BACKEND_URL=
VUE_APP_EYE_LAB_FRONTEND_URL=
```

For local development, the example values are:

```env
VUE_APP_EYE_LAB_BACKEND_URL="http://127.0.0.1:3000"
VUE_APP_EYE_LAB_FRONTEND_URL="http://localhost:8080"
```

Repositories:

- [Eye tracking frontend](https://github.com/ruxailab/web-eye-tracker-front)
- [Eye tracking backend](https://github.com/ruxailab/eye-tracker-api)

Follow the setup instructions in each repository to run the services.

### Transcription API

The transcription API provides the integration endpoint for speech-to-text functionality.

Configure the base URL:

```env
VUE_APP_TRANSCRIPTION_API_BASE_URL=
```

Repository: [transcription-api](https://github.com/ruxailab/transcription-api).

### Transcription and Sentiment Analysis

The transcription and sentiment analysis API provides the integration endpoint for audio transcription and related sentiment analysis functionality.

Configure the base URL:

```env
VUE_APP_TRANSCRIPTION_SENTIMENT_API_BASE_URL=
```

Repository: [sentiment-analysis-api](https://github.com/ruxailab/sentiment-analysis-api).

### Facial Sentiment Analysis

The facial sentiment analysis integration uses a separate API from the transcription and sentiment analysis service.

Configure the base URL:

```env
VUE_APP_FACIAL_SENTIMENT_API_BASE_URL=
```

Set this variable to the URL of the facial sentiment analysis API in your environment.

Repository: [facial-sentiment-analysis-api](https://github.com/ruxailab/facial-sentiment-analysis-api).

### PDF Generation

RUXAILAB supports an external Laravel-based PDF generation service.

Configure the relevant URL:

```env
VUE_APP_LARAVEL_PDF=
```

The example configuration in `.env.example` uses:

```env
VUE_APP_LARAVEL_PDF=http://localhost:8000/api
```

Repository: [laravel-pdf-generator](https://github.com/ruxailab/laravel-pdf-generator).

### LiveKit Video Calls

RUXAILAB can use LiveKit for video-call functionality. The configuration includes the LiveKit server endpoint and a separate token server.

```env
VUE_APP_LIVEKIT_ENABLED=true
VUE_APP_LIVEKIT_URL=ws://localhost:7880
VUE_APP_LIVEKIT_TOKEN_SERVER_URL=http://localhost:3001
```

The variables serve different purposes:

- `VUE_APP_LIVEKIT_ENABLED`: enables or disables the integration.
- `VUE_APP_LIVEKIT_URL`: specifies the LiveKit server endpoint.
- `VUE_APP_LIVEKIT_TOKEN_SERVER_URL`: specifies the URL of the service responsible for providing LiveKit tokens.

The LiveKit server and the token server are separate services. The `video-call-server` repository contains the token server implementation.

Repository: [video-call-server](https://github.com/ruxailab/video-call-server).

### Integration Notes

- External integrations are optional unless a feature you intend to use depends on them.
- Configure only the services required for your development environment.
- Start each external service according to its repository instructions.
- Ensure the configured URLs are reachable from the application.
- Use the correct endpoints and ports for your environment.
- Do not commit secrets, private tokens, or production credentials to version control.

## Firebase Cloud Functions

RUXAILAB uses Firebase Cloud Functions for server-side functionality.

If you need to work on the Cloud Functions, navigate to the directory containing the Functions project and follow its dependency and deployment instructions.

Common Firebase CLI commands include:

```bash
firebase emulators:start
firebase deploy --only functions
```

The first command starts the configured local emulators. The second deploys Cloud Functions to the selected Firebase project.

> **Warning:** Deploying functions can affect a shared or production environment. Verify the active Firebase project before deploying.

### Environment Configuration

Cloud Functions have their own environment variables, configured separately from the frontend variables. The example configuration file is located at functions/.env.example.

Before running the functions locally, copy the example file to create your local environment configuration:

```
cp functions/.env.example functions/.env
```

Update functions/.env with the values required for your local development environment.

**Important:** Do not commit .env files containing private credentials, API keys, or other sensitive values to version control.

For additional information, see the [Firebase Cloud Functions documentation](https://firebase.google.com/docs/functions).

## Useful Commands

The following commands are commonly used during development. Refer to the project's `package.json` for the definitive list of available scripts.

| Command              | Description                                       |
| -------------------- | ------------------------------------------------- |
| `npm install`        | Installs project dependencies.                    |
| `npm run serve`      | Starts the local development server.              |
| `npm run build-dev`  | Builds the application using development mode.    |
| `npm run build-prod` | Builds the application using production mode.     |
| `npm run lint`       | Runs the configured linting checks, if available. |

## Contributing

Contributions to RUXAILAB are welcome.

Before submitting a pull request:

1. Fork the repository and create a feature branch.
2. Install the dependencies and configure your development environment.
3. Make your changes following the existing project conventions.
4. Run the relevant tests and checks available for the project.
5. Submit a pull request describing the changes and their purpose.

For larger changes, consider opening an issue first to discuss the proposed implementation.

## License

See the repository's `LICENSE` file for the applicable license and terms of use.
