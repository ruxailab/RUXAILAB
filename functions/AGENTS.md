# AGENTS.md — Cloud Functions (`functions/`)

Instructions for coding agents working in this package. Follow these rules to preserve the architecture.

## Overview

This directory contains the RUXAILAB Firebase Cloud Functions. New code must follow a **feature**-based architecture with clear layers. The canonical reference is:

`src/features/transcription/`

Legacy code still exists under `src/https/`, `src/triggers/`, `src/helpers/`, and `src/repositories/`. When touching those areas, prefer migrating or aligning to the feature pattern instead of deepening the legacy style.

## Folder map

| Folder | Responsibility |
|---|---|
| `index.js` | Bootstrap: initializes the Admin SDK and re-exports entrypoints |
| `src/core/` | Shared generic infrastructure (Firebase wrappers, middlewares, errors, repository base). No RUXAILAB business rules — only reusable pieces that could exist in any project |
| `src/shared/` | Domain shared across features (study auth, common repositories) — reusable RUXAILAB business rules belong here |
| `src/features/<feature>/` | New features with internal layers |

## Required feature structure

Every new feature under `src/features/<name>/` must use these layers:

```text
features/<feature>/
  index.js              # public feature exports
  interface/            # entrypoints (onCall, onRequest, workers)
  service/              # business rules
  repositories/         # Firestore/Storage/external persistence access (optional)
  models/               # domain types/entities
  validators/           # input validation
  tests/                # feature tests
```

### Layer responsibilities

- **`interface/`** — authentication, middlewares, request validation, dependency wiring, and delegation to the service. No business rules.
- **`service/`** — orchestrates the use case. Must not know HTTP/callable details. Receives dependencies via constructor (DI).
- **`repositories/`** — the only layer that talks to Firestore/Storage for that feature. Prefer extending `FirestoreCollectionRepository` when it fits.
- **`models/`** — domain entities and enums (e.g. `Transcription`, `TranscriptSide`).
- **`validators/`** — schemas/functions that validate the input payload.
- **`tests/`** — cover feature behavior; mock repositories/externals.

## Boundaries (do not break)

1. **Do not** put business logic in `interface/`.
2. **Do not** access Firestore/Admin SDK directly inside `service/` — use repositories.
3. **Do not** put RUXAILAB business rules in `core/` — `core/` is generic infrastructure only; shared domain across features goes in `shared/`.
4. **Do not** mix feature A with deep internal imports from feature B; share via `shared/` (domain) or `core/` (infra).
5. **Do not** create “god files” (huge handlers with validation + auth + Firestore + business rules).
6. **Do not** invent a parallel structure (`controllers/`, `usecases/`, etc.) — use the pattern above.
7. **Do not** expand legacy `src/helpers/` or `src/repositories/` with new feature code; create/extend under `features/` or `shared/`.
8. Entrypoints in `src/https/index.js` (or `functions/index.js`) must only **re-export** the feature; implementation lives in `features/<feature>/interface/`.

## Callable entrypoint pattern

Follow the `workerTranscriptTask` style:

1. Middlewares: `mapHttpsError`, `requireAuth`, `validateRequest(...)`.
2. In the handler: build `db`, instantiate repositories + service, call `service.execute(...)`.
3. Return the service result; domain errors via `fail` / `mapHttpsError`.

## Dependencies and imports

- Code in **English** (file names, classes, functions, comments).
- Use ESM (`import`/`export`); the package is `"type": "module"`.
- Prefer barrel exports (`index.js`) at public boundaries (`core/firebase`, `shared/repositories`, `features/<feature>`).
- Study auth: use `shared/auth` (`assertStudyAccess`, `ROLE`); do not reimplement ad hoc checks.

## Tests and commands

```bash
cd functions
npm test
npm run lint
```

- New features: prefer tests under `src/features/<feature>/tests/`.
- When changing behavior, update or add tests in the same change.

## When in doubt

1. Mirror `src/features/transcription/`.
2. Make the smallest change that preserves the layers.
3. If legacy code is in the way, extract logic into `service/` + `repositories/` instead of growing the handler.
