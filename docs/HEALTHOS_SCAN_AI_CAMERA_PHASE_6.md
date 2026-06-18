# HealthOS Scan / AI Camera Phase 6

Date: 2026-06-16

## Active Scan Route Found

- Active tab route: `src/app/(tabs)/scan.tsx`
- Existing scan route was a normal dashboard-style page.
- Existing AI/image selection reference: `src/components/ai/AiInputPickerCard.tsx`
- Existing AI backend adapter: `src/lib/aiBackend.ts`

## Files Created

- `src/components/healthos/scan/HealthOSScanCameraScreen.tsx`
- `src/components/healthos/scan/HealthOSCameraPermissionState.tsx`
- `src/components/healthos/scan/HealthOSScanTopOverlay.tsx`
- `src/components/healthos/scan/HealthOSScanModePills.tsx`
- `src/components/healthos/scan/HealthOSCameraGuidanceFrame.tsx`
- `src/components/healthos/scan/HealthOSCaptureControls.tsx`
- `src/components/healthos/scan/HealthOSCapturedPreview.tsx`
- `src/components/healthos/scan/HealthOSScanResultSheet.tsx`
- `src/components/healthos/scan/HealthOSScanHistorySheet.tsx`
- `src/components/healthos/scan/HealthOSExtractionPreview.tsx`
- `src/components/healthos/scan/HealthOSScanTypes.ts`
- `src/components/healthos/scan/useHealthOSScanCamera.ts`
- `src/components/healthos/scan/useHealthOSScanModes.ts`
- `src/components/healthos/scan/index.ts`
- `docs/style-sheets/HEALTHOS_STYLE_SHEET_06_SCAN_AI_CAMERA.md`

## Files Updated

- `src/app/(tabs)/scan.tsx`
- `src/app/(tabs)/_layout.tsx`
- `src/components/healthos/HealthOSGlassMenu.tsx`
- `src/components/healthos/index.ts`

## Camera Permission Behavior

`useHealthOSScanCamera` wraps Expo Camera permission state:

- loading
- granted
- undetermined
- denied

The permission screen provides Allow camera, Upload from gallery, and Open settings where appropriate.

## Camera-First Behavior

The Scan tab now renders a full-screen camera-first HealthOS screen. The tab layout keeps the bottom nav, but the global AI search overlay is hidden only when the active tab is `scan`.

## Top-Left Menu Behavior

The top-left glass menu supports:

- Scan history
- Upload from gallery
- Manual entry
- Scan tips
- Camera permissions/settings

Scan tips use `HealthOSGlassMenu` info mode.

## Scan Modes Implemented

- Ask AI / general
- Food label
- Medication
- Script
- Doctor note
- Supplement
- Gym machine
- Meal plan
- Record
- Pregnancy
- Baby/Child
- Women's Health

These are user-selected modes, not automatic camera detection.

## Capture / Preview / Result Sheet

- Camera capture stores a temporary local asset.
- Gallery upload uses `expo-image-picker`.
- Captured preview supports Retake, Use photo, and Close.
- Result sheet shows mode, thumbnail, actions, import targets, extraction preview, and safety copy.

## AI Extraction Backend Status

Existing AI backend helpers exist, but this phase does not send images to AI. The result sheet shows a placeholder extraction preview after the user taps Extract data. Backend wiring is deferred until a dedicated review/import pass.

## Import / Review Foundation

Import target chips route to existing app areas where safe. No records, reminders, or health entries are written directly from Scan.

## Safety Notes

The UI states:

- Review before saving.
- This does not replace medical advice.
- Confirm medication instructions with your healthcare professional.

## Not Implemented

- Vision detection
- Automatic extraction
- Scan history persistence
- Direct import/save
- Native media-library saving
- Article/source lookup
- Gym machine recognition

## Risks

- Full camera behavior depends on native camera availability and permission configuration.
- Scan result extraction is intentionally placeholder-only until backend review/import wiring is added.

## Next Recommended Phase

Add a reviewed extraction adapter that calls the existing AI backend only after explicit user action, then presents editable import previews for Records, Medication, Nutrition, Fitness, and Calendar.
