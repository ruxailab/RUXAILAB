# Notes for Maintainers

Use this file to retain important PR context that could be missed during review.
Move relevant entries into the PR description before merging.

## Log Explorer Access

The branch follows the current upstream policy from commit `ed0e9a48e3`:
only Study Admins can view logs.

We previously considered granting Log Explorer access to other roles that can
view answers, including Managers, Observators, and heuristic
Evaluators/Researchers. That broader access is intentionally deferred because
it changes the security policy and should be confirmed by maintainers.

If broader access is approved, update the policy consistently in:

- `firestore.rules`
- `src/shared/utils/studyAccessPolicy.js`
- the related unit and Firestore rules tests

## Firebase Functions Deployment Configuration

Firebase CLI 15.1 reports the current `firebase.json` Functions configuration
as invalid because it contains `"runtimes": "python312"`. The Functions package
is Node-based and declares Node 22 in `functions/package.json`.

Before deploying Functions, confirm with maintainers whether the invalid entry
should be removed or replaced with `"runtime": "nodejs22"`.

## Moderated Session Collection-Group Indexes

The `/admin` route queries every `sessions` subcollection with
`array-contains` filters on `participantEmails` and `staffIds`. Firestore does
not create collection-group-scoped single-field indexes automatically, so this
branch adds both required indexes to `firestore.indexes.json`. Without them,
loading `/admin` fails with a `COLLECTION_GROUP_CONTAINS` index error.

Despite the route and component names, `/admin` is the normal authenticated
researcher dashboard (`authorize: [1]`), not the Super Admin console at
`/superadmin` (`authorize: [0]`). A missing or building index can therefore
affect every researcher entering the main dashboard during the rollout window.

The overrides retain Firestore's normal collection-scoped ascending,
descending, and array indexes for both fields.

Deploy these indexes and wait for their Firestore operations to become
`SUCCESSFUL` before releasing frontend code that issues the queries. The
current `AdminView` loads studies and moderated sessions in one `Promise.all`,
so a missing or building session index rejects the mounted hook and replaces
the entire dashboard with the global error fallback. A future UX improvement
should contain that failure within the sessions section and offer a retry while
preserving access to the rest of the dashboard.
