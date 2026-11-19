# Heuristic final review meetings

This feature records the collective review of a heuristic study's submitted human-expert evaluations. It is deliberately separate from `answers/{answersDocId}.heuristicAnswers`: a final review must never rewrite an evaluator's original submission.

## Firestore layout

```text
tests/{studyId}/finalReviewMeetings/{meetingId}
tests/{studyId}/finalReviewMeetings/{meetingId}/decisions/{decisionId}
tests/{studyId}/finalReviewMeetings/{meetingId}/sourceEvaluations/{evaluatorId}
tests/{studyId}/finalReviewMeetings/{meetingId}/decisionHistory/{historyId}
```

- The meeting document stores scheduling, participants, agenda, minutes, lifecycle metadata and the source snapshot manifest.
- `sourceEvaluations` stores the immutable submitted human-evaluation snapshot used during the review. It is separate from the original answer document so later study maintenance cannot silently alter what the experts reviewed. Large evidence files remain referenced by their existing storage URLs; the snapshot stores the evaluation structure and evidence references, not duplicate file bytes.
- `decisions` stores one collective outcome for a heuristic/question, including expert positions derived on the server from the immutable snapshots, the agreed assessment, rationale, unresolved concerns and action items. Clients cannot submit or override expert positions. A deterministic decision ID ensures one current decision per heuristic/question.
- `decisionHistory` preserves the previous version whenever a decision is revised before finalization.

All writes go through authenticated callable functions. The interface wires a `FirestoreFinalReviewMeetingRepository` into the service; the service coordinates domain operations without accessing Firestore references directly. Client-side Firestore writes are not part of this design. Reads are limited to study administrators/managers and the meeting's recorded participants. The server re-checks study membership and role on every operation; a client-supplied participant list is never authoritative. Source snapshots are limited per evaluator and in aggregate so a single Firestore transaction cannot exceed the practical request-size budget.

## Roles and participant eligibility

- Study Admin/owner or Manager: create, schedule, facilitate and finalize a meeting. Manager access requires the Manager role to be present in `studyRoleMap`, matching the Firestore read policy; legacy cooperator-only Manager records must be backfilled before using this feature.
- Evaluator: at least two and at most 30 evaluators may participate; each must be selected for the meeting and have a visible, submitted human evaluation in the source snapshot.
- AI-agent evaluations (`userDocId` prefixed with `ai-agent:`) are excluded from meeting participants and server-derived human expert positions. Displaying them as separately labelled supporting material is a future capability, not part of this feature.
- Guest and Observator roles are not eligible expert participants.

## Lifecycle

`DRAFT -> SCHEDULED -> IN_PROGRESS -> FINALIZED`

A draft may start immediately (`DRAFT -> IN_PROGRESS`). Draft, scheduled and in-progress meetings may be cancelled. `FINALIZED` and `CANCELLED` are terminal states. Corrections after finalization require a new review record; the finalized record is not edited in place.

## Decision outcomes

- `CONSENSUS`: participating experts reached a shared assessment; a written `finalAssessment.summary` is required.
- `DISAGREEMENT`: material differences remain and are documented.
- `DEFERRED`: the group could not make a final assessment and records what is needed next.
- A meeting can be finalized once at least one decision has been recorded; a decision is not required for every heuristic or question in the study.

A decision keeps each expert's position distinct from the collective assessment. The outcome is not calculated by averaging expert scores, and no original evaluator answer is changed.

## Timestamp convention

`scheduledAt` is supplied as Unix milliseconds. Lifecycle timestamps
(`createdAt`, `updatedAt`, `startedAt`, `finalizedAt` and `cancelledAt`)
are generated using Firestore server timestamps. When read from Firestore,
these lifecycle fields are Firestore Timestamp values.

## Report export boundary

The web application sends PDF generation requests to an external Laravel service configured by `VUE_APP_LARAVEL_PDF`. That renderer is not part of this repository, so this feature does not claim that final-review records appear in the generated PDF. The meeting records are available to the application through the secured Firestore paths; adding a PDF appendix requires the external renderer's source/template and a coordinated change there.
