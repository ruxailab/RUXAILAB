# Add a study method

Keep a new method's study definition, participant answer model, authorization,
manager routes, and deletion behavior aligned with the existing method
registry and access policy.

If the method produces participant activity, follow the
[study activity logging extension guide](./logging-extension-guide.md). The
logging integration requires an explicit eligibility and consent decision,
allowlisted events, public-boundary tests, researcher access, and lifecycle
cleanup; it is not enabled automatically for a new method.
