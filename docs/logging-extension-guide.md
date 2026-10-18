# Study activity logging

Study activity logging records what happened during a study (opened,
consented, task finished, submitted) without recording what anyone wrote or
chose. Answers stay in Results. Logs are read in the Logs view
(`src/shared/views/LogsView.vue`) by study Admins only (`canViewLogs` in
`firestore.rules`).

Clients never write logging data directly. Everything goes through two
callable functions in `functions/src/https/logEvents.js`:

| Callable | Used for | Who decides the content |
| --- | --- | --- |
| `logEvents` | Browser observations, sent in batches from a queue | Client sends allowlisted details; the server validates every field |
| `requestLogEvent` | Lifecycle events (consent, task finished, submitted, focus group session start/end) | The server verifies the event against committed data and writes it |

The server derives the message, layer, level, source, actor role, Study
Session ID (a salted hash, `LOG_ACTOR_HASH_SALT`) and the participant label.
All logging data lives under `tests/{studyId}` (`logs`, `studySessions`,
`logBatches`, `loggingMeta`), so deleting a study removes it.

## Study types

Participant study types are configured in one table, `STUDY_LOGGING` in
`logEvents.js`. A type without a row cannot log.

| Type | Answer field | Consent gate | Roles that may log* |
| --- | --- | --- | --- |
| `USER` (unmoderated) | `taskAnswers` | yes | User (5) |
| `USER` (moderated) | `taskAnswers` | yes | User (5), Observer (3) |
| `HEURISTIC` | `heuristicAnswers` | no | Evaluator (1) |
| `CARD_SORTING` | `cardSortingAnswers` | yes | Evaluator (1) |

\* Plus the owner, Admins (0), Managers (4), super admins and anyone taking a
public study.

- **Answer field**: where `requestLogEvent` reads the caller's own committed
  answer (`answers/{answersDocId}.<field>.<uid>`) to verify consent,
  task and submission events.
- **Consent gate**: with a gate, `logEvents` rejects batches until
  `consentCompleted` is true in the participant's answer, and
  `requestLogEvent` accepts other lifecycle events only after
  `CONSENT_ACCEPTED` has been recorded.

Focus groups are not in this table; see [Focus group](#focus-group).

Elsewhere, a study type also needs:

- a producer in its participant view (see [Producers](#producers));
- a `/<type>/logs/:id` route with `studyCapability: LOGS_VIEW`;
- its event types in `EVENT_TYPES_BY_STUDY` and a label in `studyTypeLabel`
  in `LogsView.vue`;
- a step for each new event type in `stepKeyFor`
  (`src/shared/utils/participantTimeline.js`) and a title in
  `ParticipantTimeline.vue`. Events with no step land in "Other activity".

## Events

| Event | Callable | Types | Verified from |
| --- | --- | --- | --- |
| `STUDY_VIEW_OPENED` | `logEvents` | USER, HEURISTIC, CARD_SORTING | — (observation) |
| `CONSENT_ACCEPTED` | `requestLogEvent` | USER, CARD_SORTING | `consentCompleted` in the answer |
| `TASK_STARTED` | `logEvents` | USER | task index exists in the study |
| `TASK_ATTEMPT_FINISHED` | `requestLogEvent` | USER | `tasks[i].attempted` in the answer |
| `ANSWER_EDITED` | `logEvents` | USER | field exists in the study |
| `STRUCTURED_RESPONSE_ACTIVITY` | `logEvents` | USER | questionnaire items exist in the study |
| `MEDIA_RECORDING_OUTCOME` | `logEvents` | USER | task and media flag exist in the study |
| `QUESTION_RESPONSE_UPDATED` | `logEvents` | HEURISTIC | question exists in the study |
| `STUDY_SUBMITTED` | `requestLogEvent` | USER, HEURISTIC, CARD_SORTING | `submitted` in the answer |
| `SESSION_STARTED` | `requestLogEvent` | FOCUS_GROUP | live room status (see below) |
| `SESSION_ENDED` | `requestLogEvent` | FOCUS_GROUP | scheduled session `lifecycleStatus` |

Lifecycle events have a fixed event ID per Study Session, so a retry returns
`duplicate` instead of writing twice.

To add an event type:

- `logEvents`: add a policy to `CLIENT_EVENT_POLICIES` with an exact details
  allowlist, validate every reference against the study on the server, and
  mirror the sanitizer in `studyLoggingClient.js`.
- `requestLogEvent`: verify it in `verifiedEventFor` from committed answer
  data, with a deterministic event ID.

Never accept free text, answer values, names, emails or user IDs. Card sorting
is a good example: card and category names are participant text, so card
sorting events carry empty `details`.

## Producers

Participant views create one runtime per page with
`createStudyLoggingRuntime` (`src/shared/services/studyLoggingRuntime.js`),
passing the user ID, study ID, study type and `consentRequired`. Logging
always follows a successful save and never blocks or alters the study flow:

- `open()` when the view opens (ungated types);
- `consentAccepted(occurredAt)` after the consent save succeeds;
- `resumeAfterConsent()` on mount when consent was already saved;
- `taskStarted(i)` / `taskFinished(i)` around a saved task;
- `submitted()` after the final save succeeds;
- `destroy()` on unmount.

With a consent gate, nothing is queued before consent. Observations made
between the consent save and the server's acknowledgement are held in memory
only (at most 200) and dropped if consent is rejected.

Text fields opt in to edit counts with `data-study-field-ref`. Heuristic
studies use `responseChanged(questionRef, field)`. User-test questionnaires
use the structured-response methods through
`src/ux/UserTest/utils/structuredActivity.js`.

Current producers: `UserTestView.vue`, `ModeratedTestView.vue`,
`HeuristicTestView.vue`, `CardSortingTest.vue`, and
`FocusGroupSessionView.vue` (through `src/ux/FocusGroup/utils/sessionLogging.js`).

## Participant labels

Each Study Session gets a label from one counter per study
(`loggingMeta/state.nextParticipantNumber`). The prefix says whose session it
is:

- `P-003`: the third participant.
- `F-004`: the facilitator of the fourth focus group session.

Other roles should follow the same pattern: prefix by role, number from the
shared counter.

## Focus group

A focus group is run by a facilitator for many attendees at once, so it does
not use `STUDY_LOGGING` or the runtime. Only scheduled sessions are logged
(the legacy open room without `?session=` is not), and nothing that attendees
or observers do is logged.

- **Who may log**: study Admins (owner, role 0, super admin) and staff with
  role `FACILITATOR` on that scheduled session
  (`tests/{studyId}/sessions/{sessionId}`). Everyone else is denied.
- **`SESSION_STARTED`**: the live room `focusGroupSessions/{studyId}-{sessionId}`
  in Realtime Database must be `live` or `ended`, with `facilitatorId` equal
  to the caller.
- **`SESSION_ENDED`**: the scheduled session must have
  `lifecycleStatus: 'ended'`, which only `markFocusGroupSessionEnded` sets.
- **Study Session**: one per scheduled session, not per user, so a session
  started by one Admin and ended by another stays one timeline.

The live room's fields can be written by any signed-in user
(`database.rules.json`), so the room is only used as evidence of the start;
who may log always comes from Firestore.

## Recording outcomes

Moderated and unmoderated user tests produce `MEDIA_RECORDING_OUTCOME` through
`recordingOutcome(details)`. Recorders emit `recording-result` to TaskStep and
have no logging dependency. A result is acknowledged to logging only after the
answer holding its media reference is saved.

| Field | Controlled values |
| --- | --- |
| `taskRef` | `task:<index>` in the study configuration |
| `mediaType` | `audio`, `webcam`, `screen` |
| `outcome` | `completed`, `failed`, `permission_denied`, `cancelled` |
| `stage` | `permission`, `capture`, `upload` |
| `reason` | Optional; the combinations below are validated |

| Outcome / stage | Allowed reason when supplied |
| --- | --- |
| completed / upload | No reason |
| permission_denied / permission | `permissionDenied` |
| cancelled / permission | `cancelled` |
| failed / permission | `deviceUnavailable`, `captureError`; screen also permits `unsupported`, `wrongSurface`, `error` |
| failed / capture | `captureError`, `emptyRecording` |
| failed / upload | `uploadError` |

Completed is `info`, denial or cancellation is `warning`, failure is `error`.
This is client-observed, not proof that the media was stored.

The server adds `taskType` from `testStructure.userTasks[i]` to task events
(`no-answer`, `post-test`, `text-area`, `post-form`, `nasa-tlx`, `sus`,
`tam-1`, `tam-2`, `tam-3`, `sart`), and `recordingTypes` from the task's media
flags to `TASK_ATTEMPT_FINISHED`.

## Tests

Functions tests run against the emulators:

```bash
cd functions
FIRESTORE_EMULATOR_HOST=127.0.0.1:8081 FIREBASE_DATABASE_EMULATOR_HOST=127.0.0.1:9000 npm test -- logEvents focusGroupLogging
```

Frontend: `npx vue-cli-service test:unit` (runtime, client, LogsView,
participant timeline and the producer views). When you add a type or event,
test allowed and denied roles, the consent gate, verification, unknown types
staying denied, and that no stored document contains entered text.
