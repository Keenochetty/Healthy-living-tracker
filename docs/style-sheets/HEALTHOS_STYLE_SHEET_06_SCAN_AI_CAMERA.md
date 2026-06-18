# HealthOS Style Sheet 06 - Scan / AI Camera

This file is the local source of truth for the HealthOS Scan / AI Camera phase.

## Scope

- Refine only the active Scan tab.
- Do not redesign Home, Calendar, Health, Family, Fitness, Nutrition, Women's Health, Pregnancy, Medication, Records, or deep realm pages.
- Do not change Supabase, auth, storage, AI extraction, database migrations, seed data, or business flows.
- Use `src/theme/healthos`, `src/components/healthos`, and existing Expo camera/gallery APIs.

## Scan Behavior

Scan is camera-first. When the Scan tab is opened:

- The normal app header is hidden.
- The global AI search overlay is hidden.
- The camera preview opens immediately when permission is granted.
- Permission states are handled safely when camera access is missing or denied.
- Bottom navigation remains available through the existing tab layout.

## Required UI

- Full-screen camera preview
- Top-left glass menu
- Top-right flash and flip controls
- Guidance frame
- User-selectable scan mode pills
- Gallery button
- Large capture button
- AI/search action
- Captured image preview
- Result sheet
- Extraction preview placeholder
- Scan history placeholder

## Safety

- No auto-save.
- No auto-import.
- No automatic AI call.
- Extraction requires explicit user action.
- Health information must be reviewed before saving.
- Medication/script content must not be treated as medical advice.

## Verification

Run typecheck only:

```bash
npm run typecheck
```
