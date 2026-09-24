# Extend study activity logging

Study activity logging is intentionally allowlisted. A new methodology or
event must use the existing trusted ingestion boundary; participant clients
must never write the four logging subcollections directly.

## Add a methodology

1. Add its answering eligibility to `canAnswerStudy` in
   `functions/src/https/logEvents.js` and the matching `logs.view` rule in
   `firestore.rules`. Unknown or incomplete study types must stay denied.
2. Decide whether the methodology has a consent gate. Gated clients create no
   logging queue or Study Session until committed consent is acknowledged;
   ungated clients may open immediately.
3. Instantiate `createStudyLoggingRuntime` from the participant view with the
   authenticated user ID, study ID, and existing Firebase callable seam.
4. Add public-boundary emulator tests for allowed and denied participants and
   researchers before wiring UI producers.

Card Sorting and Accessibility are intentionally not connected by Milestones
2–4. Adding either requires this authorization and consent review first.

## Add an event type

Start with a concrete research question and choose one producer boundary:

- A browser observation goes through `createStudyLogger` and `logEvents`. Add
  an exact details allowlist and validate controlled references server-side.
- An authoritative lifecycle event goes through `requestLogEvent`. Verify it
  from the participant's committed answer and use a deterministic event ID.

Derive the message, layer, level, source, actor role, Session ID, Participant
Label, and receipt time on the server. Do not accept arbitrary fields, raw
answers, names, email addresses, or user IDs. Update this guide and the focused
client/runtime, ingestion, and Explorer tests with the new policy. The executable
allowlists live in `studyLoggingClient.js`, `logEvents.js`, and
`functions/src/shared/logging/taskContext.js`.

## Wire a producer

Logging follows a successful primary save and remains fire-and-forget:

- call `consentAccepted()` after committed consent;
- call `resumeAfterConsent()` only when entering a route where consent was
  already committed, so the new route opening is observed without recreating
  a pre-consent entry;
- call `taskFinished(index)` after a committed attempted task;
- call `submitted()` after committed final submission;
- mark text controls with `data-study-field-ref` to opt into metadata-only edit
  aggregation.

Heuristic studies use one `QUESTION_RESPONSE_UPDATED` event per question
interaction. Call `responseChanged(questionRef, field)` only after a real
frequency, severity, or configured-option change; delegated comment inputs are
counted by the runtime. Leaving the question, hiding the page, or submitting
finishes the group. Never pass selected values or comment text to logging.

Do not add telemetry to participant loading state, notifications, or error
handling. On unmount call `destroy()` to release browser listeners. Verify that
logging failures do not alter the primary workflow and that no test assertion
or stored document contains entered text.

## Unmoderated task and recording metadata

Only USER_UNMODERATED produces `MEDIA_RECORDING_OUTCOME`. Shared recorders emit
`recording-result` to TaskStep; they have no logging dependency. Each capture
keeps the task index from permission acquisition through upload and emits at most
one terminal result. A real new capture is a new attempt. Browser delivery retries
reuse the existing Event ID and Batch ID.

The runtime's `recordingOutcome(details)` requires an authenticated participant
and acknowledged, persisted consent. Anonymous invited participation remains
available without these logs. Client sanitization projects the following fields
before IndexedDB; ingestion rejects extra fields and validates the configured
task and its media flag:

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

Ingestion derives source `study-client`, layer `technical`, the message, and
severity: completed is `info`, denial/cancellation is `warning`, failure is
`error`. Cancellation means “permission denied or capture cancelled” because the
screen API does not distinguish intent. This is client-observed telemetry, not
server verification of media integrity.

**An upload result is not a persisted recording.** The unmoderated parent holds
successful results in memory, containing only task/media metadata. Before saving,
it attaches media references to the answer and snapshots the pending results
whose references are present. Only a successful `saveTestAnswer` acknowledges
that snapshot to logging. A failed write leaves results pending for the next
successful save; results arriving during a save wait for a later save. Repeated
saves do not emit the same result twice. Multiple unsaved replacements of the same
task/media field retain only the latest result, matching the single persisted
reference. Leaving the route loses pending telemetry; do not invent an abandonment
or failure event. Neither `updateTaskMediaUrl` nor `stopShowLoading` proves an
answer write. Preserve the store's rejected promise on save failure and catch it
at the primary workflow boundary.

Failures/denials/cancellations may be queued immediately after consent. Logging
remains fail-open: queue/network failures must not block task completion or add
participant-facing loading states or notifications. Never send media URLs, blobs,
transcripts, answers, instrument scores, names, emails, or raw exceptions.

The server derives `taskType` from trusted `testStructure.userTasks[index]` for
unmoderated task-finished events, task-field edits, and recording outcomes. Allowed
values are `no-answer`, `post-test`, `text-area`, `post-form`, `nasa-tlx`, `sus`,
`tam-1`, `tam-2`, `tam-3`, and `sart`. Missing/unknown types are omitted without
dropping the base event. Task-finished events also include `recordingTypes` from
the enabled media flags; this describes requested media, not saved artifacts.
Pre/post-study fields and whole-study events have no invented task context.
Existing log documents remain immutable when study configuration changes.

The Logs explorer offers the new USER event type and readable details using the
existing Event Type/Level filters. Source and layer remain available in the
collapsed delivery diagnostics. This extension adds no new methodology
producers, Overview Dashboard, export, filters, or indexes.

## Extend the explorer and lifecycle

If a new field is filterable, add only the composite indexes required by its
actual query shapes and test pagination against the Firestore emulator. All
logging data must remain under `tests/{studyId}` so the trusted study-deletion
cleanup removes it with the parent lifecycle.
