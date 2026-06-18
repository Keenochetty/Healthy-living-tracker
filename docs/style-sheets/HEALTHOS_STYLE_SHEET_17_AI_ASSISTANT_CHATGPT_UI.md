# HealthOS Style Sheet 17 - AI Assistant / ChatGPT UI Rework

## Purpose

This style sheet defines the HealthOS native AI assistant interface. The UI is ChatGPT-inspired in interaction shape, but it remains HealthOS-branded and uses the app's native shell, tokens, and review-first import contract.

## Scope

- Full AI assistant page at `src/app/ai/index.tsx`.
- Global AI command sheet opened from the HealthOS shell command bar.
- Chat message list, prompt composer, suggestion chips, history summaries, result cards, and safety notice.
- Importable AI results bridge into the Phase 16 AI Import Review Sheet.

## Rules

- Do not add AI to the bottom nav.
- Do not call OpenAI directly from mobile.
- Do not add mobile API keys.
- Do not scrape ChatGPT or request ChatGPT credentials.
- Do not save AI results directly into app realms.
- Import actions must open review flow first.

## Visual Direction

- Compact top header with AI identity, history, and settings affordances.
- Rounded assistant cards and readable message bubbles.
- Sticky composer at the bottom of the AI page.
- Sheet version for quick access from other HealthOS pages.
- Light and dark mode via HealthOS tokens.

## Safety Direction

- No private data is attached by default.
- Context chips must clearly state the current screen context and data attachment status.
- Sensitive or importable results must become review-only envelopes before any app action.
