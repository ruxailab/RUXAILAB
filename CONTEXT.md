# RUXAILAB Domain Language

This glossary defines the canonical language used across RUXAILAB's study, access-control, and study-activity features.

## Study Access Control

**Study Participant**:
A signed-in user who starts an authorized attempt to perform a study, whether that attempt is in progress, completed, or abandoned. Participation is not a study role and may be granted by a public study's access policy.
_Avoid_: Guest, cooperator

**Study Membership**:
An active association between a user and a study created when an invitation is accepted and carrying one study role.
_Avoid_: Global access level

**Study Invitation**:
A pending offer of study membership and a proposed role. An invitation grants no study capabilities until it is accepted.
_Avoid_: Pending membership

**Study Owner**:
The user who created the study. The owner has all Admin capabilities but is not an invited study member and cannot be managed through the cooperator list.
_Avoid_: Admin cooperator, Study Admin

**Study Role**:
A named set of study-specific capabilities attached to a study membership. Its stored identifier does not imply that roles are ordered by power.
_Avoid_: Access level

**User Role**:
The user-study role assigned to an invited member whose purpose is to answer a private study. A user with this role is one kind of Study Participant, but public-study participants do not require this role.
_Avoid_: Participant Role

**Observator Role**:
The user-study role assigned to an invited member who observes study activity without answering the study. The project intentionally uses “Observator” as the role's visible name.
_Avoid_: Observer, Guest

**Public Study**:
A study discoverable through Community Studies that automatically permits signed-in users to submit a response, regardless of study membership or role.

**Private Study**:
A study for which every form of access requires a study membership created through an invitation.

## Study Activity

**Study Session**:
A participant's single resumable attempt to perform a study. The same Study Session continues across page reloads and later visits until the response is submitted or can no longer be continued; it is distinct from a scheduled Moderated Session.
_Avoid_: Bare session, login session, Moderated Session, answer

**Moderated Session**:
A scheduled, supervised meeting or call for a moderated study. It may host participant activity but is not the participant's resumable Study Session.
_Avoid_: Bare session, Study Session, room

**Study Consent Gate**:
The logging boundary for a study method whose workflow requires consent. Until committed acceptance is verified, the logging subsystem creates no session, pseudonymous identity, event, or durable queue entry; methods without a consent workflow do not have this gate.
_Avoid_: Answer eligibility, non-empty consent text, retroactive consent

**Client Observation Budget**:
The maximum of 1,000 client-observed Log Events accepted for one Study Session. It is a safety boundary against defective or abusive browser producers, not an expected usage target; exhausting it affects observational telemetry only and cannot crowd out deterministic trusted events or the participant's study workflow.
_Avoid_: Trusted-event limit, per-request batch limit, participant quota

**Session ID**:
The sole pseudonymous identity of a Study Session, stable for one authenticated participant within one study and distinct across studies. It is a non-displayed relationship key derived by the logging service rather than a participant-supplied value, researcher-facing label, secret, or authentication credential.
_Avoid_: Actor Hash, User ID, client-generated session ID

**Participant Label**:
A short, study-scoped researcher-facing identifier such as `P-001`, allocated transactionally when a participant's Study Session is first created and reused by that session. Numbers are unique and never recycled, but gaps are valid and numeric order must not be interpreted as completion order.
_Avoid_: Session ID, participant count, authorization identity

**Log Event**:
A sanitized record of an actor or system occurrence observed during a study's operation or subsequent analysis.
_Avoid_: Log entry, activity record

**Operational Log**:
A platform-administration diagnostic about service execution, rejection, or failure. It is not participant research evidence and never appears in the researcher-facing Log Explorer.
_Avoid_: Log Event, participant activity, researcher log

**Event ID**:
The cryptographically random, stable identity assigned to one client-observed Log Event before delivery. The server combines it with server-derived Study Session identity to obtain an immutable storage identity; reuse in another Batch ID within that session is a permanent conflict.
_Avoid_: Firestore document ID generated on retry, mutable event key

**Log Batch**:
An idempotent delivery envelope containing at most 25 claimed Log Events and accepted by the server all-or-nothing. Its stable Batch ID survives retries and stale-claim recovery; only after an atomically rejected attempt may its unaccepted valid events form a new Log Batch.
_Avoid_: Study Session, transaction trace

**Event Type**:
The stable category that identifies what happened in a Log Event independently of its human-readable wording.
Whole-study Event Types use the canonical `STUDY_*` vocabulary rather than legacy `TEST_*` implementation names; narrower concepts retain prefixes such as `TASK_*` and `ANSWER_*`.
_Avoid_: Message, display label, legacy storage vocabulary

**Event Policy**:
The authoritative contract for one recognized Event Type, defining which producer may report it and which contextual data it may contain. Events without a policy, from the wrong producer, or carrying unapproved data are not valid Log Events.
_Avoid_: Open event vocabulary, client-defined schema

**Verified Event Request**:
A participant client's request for the logging service to produce an authoritative state-transition event. The request is evidence only after the service verifies the participant's committed study state and derives the event data itself.
_Avoid_: Trusted client event, Firestore update trigger

**View Opened Event**:
The repeatable, client-observed `STUDY_VIEW_OPENED` occurrence produced when a participant enters or reloads a study view within an existing or newly created Study Session. It has no event-specific navigation details; its Session ID and Occurrence Time support correlation without claiming whether the opening was another tab, reload, history navigation, or semantically defined resume.
_Avoid_: Session initialized, resumed session, navigation type, page-view analytics payload

**Task Attempt Finished Event**:
The verified `TASK_ATTEMPT_FINISHED` occurrence for one controlled task in a Study Session. It stores controlled `taskRef`, a server-derived outcome of `completed` or `not_completed`, and optional client-observed `taskDurationMs` copied from committed answer state. It does not imply that the whole study was submitted or duplicate task content.
_Avoid_: Task completed, Study Submitted Event, client-supplied outcome

**Study Submitted Event**:
The verified, deterministic `STUDY_SUBMITTED` occurrence created once when the participant's complete response is committed as submitted. It is available to study methods with or without individual tasks and stores no event-specific answer summary.
_Avoid_: Task Attempt Finished Event, client submission claim

**Last Observed Event**:
The most recent accepted occurrence visible for a Study Session. It is not evidence that the participant closed, abandoned, or completed the session; only a Study Submitted Event establishes definitive completion.
_Avoid_: Session ended, abandonment time, last activity proof

**Submission Cutoff**:
The server `submittedAt` boundary that closes a Study Session to newly occurring client observations while allowing bounded delivery of observations queued before or around submission. It is a containment rule, not proof that a client-provided Occurrence Time is truthful.
_Avoid_: Receipt Time, signed client timestamp, AI processing cutoff

**Consent Accepted Event**:
The verified `CONSENT_ACCEPTED` occurrence created only when a consent-gated method's committed answer records acceptance. It may initialize the Study Session and is never produced for declined consent or methods without a consent workflow.
_Avoid_: Consent completed, consent displayed, client consent claim

**Log Layer**:
The server-derived perspective from which a Log Event is interpreted: technical operation, methodological behavior, or AI-derived observation. All initial Milestones 2–4 events are methodological; a producer's deployment location does not determine its layer. The field is stored from the initial schema, while its explorer filter remains hidden until the controlled vocabulary contains at least two researcher-relevant layers.
_Avoid_: Severity, source

**Log Level**:
The server-derived significance assigned to a Log Event: informational, warning, or error. Initial behavioral events are informational except an unsuccessful Task Attempt Finished Event, which is a warning; error is reserved for actual technical or AI-processing failure events.
_Avoid_: Client-selected severity, layer, raw outcome

**Event Source**:
The server-derived, controlled identity of the component or service that produced a Log Event. The initial sources are `study-client` for accepted browser observations and `logging-service` for server-produced or verified events.
_Avoid_: Actor role, study type, storage destination

**Log Message**:
The canonical human-readable explanation generated from an Event Policy after a Log Event is accepted. It may summarize approved context, but it is not supplied as arbitrary client text and does not define the event's identity.
_Avoid_: Event type, client message, answer text

**Occurrence Time**:
The time a Log Event is understood to have happened. For browser observations it is client-observed and therefore non-authoritative; for verified or server-produced state transitions it is assigned by trusted server processing.
_Avoid_: Delivery time, proof of exact wall-clock time

**Receipt Time**:
The authoritative server time at which logging ingestion accepted a Log Event. It describes delivery and may be later than Occurrence Time when events were queued or retried.
_Avoid_: Event time, participant action time

**Time Quality**:
The confidence attached to a client-observed Occurrence Time: client-calibrated, client-unverified, or suspected clock skew. It reports the available timing evidence without declaring a participant device clock correct or incorrect.
_Avoid_: Clock correctness, delivery delay

**Answer Revision Metadata**:
One non-content summary of a participant's changed free-text field interaction. It records the controlled field identity, the span from first to last input, input-operation count, paste-operation count, initial length, and resulting length. It does not record dwell time, an ordered operation history, character-level additions or deletions, text fragments, or enough information to reconstruct an answer version.
_Avoid_: Answer history, revision content

**Question Response Updated Event**:
The heuristic-only, client-observed `QUESTION_RESPONSE_UPDATED` occurrence that groups frequency, severity, configured-option, and comment-input changes made during one question interaction. It records the controlled question reference, changed field names, first-to-last interaction span, and per-field change counts. Revisiting and changing the question later creates another event. It never stores selected ratings, configured-option values, comment text, or answer snapshots.
_Avoid_: One event per rating click, heuristic answer value, Raw Answer Revision

**Log Delivery Queue**:
A client-side, metadata-only queue that batches completed Log Events for idempotent delivery. Input activity updates local counters without making a network request; queued events are flushed periodically, when the batch limit is reached, at meaningful lifecycle boundaries, and best-effort when the page becomes hidden. Failed batches remain queued for retry.
_Avoid_: Answer cache, real-time log stream

**Fail-open Logging**:
The invariant that Log Event creation and delivery are secondary to the study workflow. Logging failures are contained and retried but never prevent task completion, answer saving, study submission, or navigation; a successful answer operation remains successful even when its corresponding telemetry is delayed or missing.
_Avoid_: Transactional logging, mandatory telemetry

**Log Coverage**:
A researcher-facing disclosure that Log Events are delivered asynchronously on a best-effort basis and may be delayed or incomplete. In the initial design it is one static Log Explorer notice, not a computed per-session status or a claim that any timeline is complete.
_Avoid_: Study progress, answer status

**Log Page**:
A cursor-defined slice of the complete Log Explorer query result. When filters are active, it contains matching events selected by Firestore across the study's full history rather than a browser-filtered subset of an already loaded page.
_Avoid_: Client-filtered page, preloaded history

**Exact Filtered Count**:
The server-aggregated number of Log Events matching the active study and filter set. It is a refresh-bound snapshot shared by all pages of that query and is not produced by downloading or counting documents in the browser.
_Avoid_: Live count, page length, client-side count

**Explorer Date Range**:
An optional pair of calendar dates restricting Log Events by Occurrence Time. Its boundaries use the timezone displayed by Log Explorer, include the start date, and exclude the start of the day following the selected end date after conversion to UTC.
_Avoid_: Receipt-time range, time-of-day filter, UTC calendar labels

**Event Detail Drawer**:
The researcher-facing, read-only detail surface opened from a Log Event row. It presents the already-loaded canonical event as structured research context without rendering internal identifiers or raw payloads.
_Avoid_: Raw payload viewer, event editor, additional event query

**Study Data Cleanup**:
The idempotent server-side process initiated when a study is deleted. It removes the study's dependent data, including Study Sessions, Log Events, log-batch markers, and logging metadata, in bounded pages and records enough state for failed cleanup work to be retried; deleting only the parent study document is not complete cleanup.
_Avoid_: Client-side delete loop, automatic Firestore cascade

**Study Data Retention**:
The shared lifecycle governing a study's research dataset. In the initial logging design, Study Sessions, Log Events, log-batch markers, and logging metadata remain available while their study remains available and are removed by Study Data Cleanup; logs do not have an independent automatic expiry that could separate them from answers or other research evidence.
_Avoid_: Log-only TTL, indefinite orphan retention

**Raw Answer Revision**:
Any intermediate, replaced, or deleted free-text answer content, including snapshots and textual diffs. RUXAILAB does not collect or retain Raw Answer Revisions, even when a study author or participant would opt in; only the current answer state follows the ordinary answer-saving lifecycle.
_Avoid_: Behavioral metadata, audit payload
