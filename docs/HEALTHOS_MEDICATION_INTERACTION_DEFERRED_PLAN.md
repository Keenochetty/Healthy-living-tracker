# HealthOS Medication Interaction Deferred Plan

Date: 2026-06-17

## Deferred

Batch 6 does not implement:

- drug interaction engine,
- supplement interaction engine,
- dosage advice,
- medication start/stop recommendations,
- pharmacy lookup,
- medical aid coverage lookup,
- professional review workflows.

## Future Requirements

An interaction feature needs validated clinical data sources, source citations, clear confidence boundaries, professional-review copy, audit logging, and strict separation from AI-generated guesses.

## Current Model

`medication_review_flags` are review prompts only. They must not say "interaction detected" unless a future validated engine supports that claim.
