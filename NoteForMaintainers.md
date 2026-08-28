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
