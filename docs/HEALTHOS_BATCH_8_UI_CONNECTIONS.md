# HealthOS Batch 8 UI Connections

Connected:

- `/ai/import-review` no longer creates a sample AI result as its default state.
- The route can show real persisted queue status through `useAIImportQueue`.
- The route can read a persisted envelope id through `useAIImportEnvelope`.

Deferred:

- AI Page queue cards.
- Scan-to-envelope button wiring.
- Records-to-envelope button wiring.
- Realm candidate count badges.
- Full persisted field editing in the existing `HealthOSAIImportReviewScreen`.

Reason: those screens still use a UI-oriented envelope shape from earlier style sheets. Batch 8 adds persistence contracts without redesigning or rewriting realm UI.

