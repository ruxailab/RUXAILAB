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
answers, names, email addresses, or user IDs. Update `docs/logging-schema.md`,
the vocabulary in `CONTEXT.md`, and the TDD contract with the new policy.

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

## Extend the explorer and lifecycle

If a new field is filterable, add only the composite indexes required by its
actual query shapes and test pagination against the Firestore emulator. All
logging data must remain under `tests/{studyId}` so the trusted study-deletion
cleanup removes it with the parent lifecycle.
