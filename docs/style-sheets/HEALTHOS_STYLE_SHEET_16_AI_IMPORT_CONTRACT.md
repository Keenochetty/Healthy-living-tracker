# HealthOS Style Sheet 16 - AI Import Contract + Structured Review Flow

## Purpose

Defines the shared HealthOS AI Import Contract. AI, Scan, Records, and realm outputs that could become app data must first normalize into a shared review-first import envelope.

## Core Rule

AI can suggest. The user confirms. The app saves only after review.

## Scope

- Shared AI import envelope types
- Import target registry
- Field review model
- Source/evidence model
- Confidence, missing-field, safety, and warning models
- Validators and normalizers
- Realm adapter foundation
- Reusable review screen and sheet
- Optional AI import review route

## Safety Rules

- `canAutoSave` is always false.
- No AI output is auto-saved.
- No calendar event, medication reminder, pregnancy state, child profile, or family sharing is auto-created.
- No API keys are placed in the Expo client.
- Existing Supabase Edge Functions remain the backend boundary.

## Verification

Run typecheck only:

```bash
npm run typecheck
```

