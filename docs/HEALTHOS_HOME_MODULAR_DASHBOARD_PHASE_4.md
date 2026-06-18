# HealthOS Home Modular Dashboard Phase 4

Date: 2026-06-16

## Active Home Route Found

- Active tab layout: `src/app/(tabs)/_layout.tsx`
- Active Home tab route: `src/app/(tabs)/today.tsx`
- Existing tab shell still renders the floating bottom nav and global AI search overlay.

## Files Created

- `src/components/healthos/home/HealthOSHomeScreen.tsx`
- `src/components/healthos/home/HealthOSHomeHero.tsx`
- `src/components/healthos/home/HealthOSPrimaryAttentionCard.tsx`
- `src/components/healthos/home/HealthOSQuickActionRow.tsx`
- `src/components/healthos/home/HealthOSHomeWidgetGrid.tsx`
- `src/components/healthos/home/HealthOSTodayTimelineWidget.tsx`
- `src/components/healthos/home/HealthOSHealthSnapshotWidget.tsx`
- `src/components/healthos/home/HealthOSMedicationDueWidget.tsx`
- `src/components/healthos/home/HealthOSFitnessNutritionWidget.tsx`
- `src/components/healthos/home/HealthOSFamilyPulseWidget.tsx`
- `src/components/healthos/home/HealthOSAISuggestionWidget.tsx`
- `src/components/healthos/home/HealthOSUpcomingEventsWidget.tsx`
- `src/components/healthos/home/HealthOSRecordsShortcutWidget.tsx`
- `src/components/healthos/home/useHealthOSHomeWidgets.ts`
- `src/components/healthos/home/index.ts`
- `docs/style-sheets/HEALTHOS_STYLE_SHEET_04_HOME_MODULAR_DASHBOARD.md`

## Files Updated

- `src/app/(tabs)/today.tsx`
- `src/components/healthos/HealthOSWidget.tsx`
- `src/components/healthos/index.ts`

## Widget List

- `todayTimeline`
- `healthSnapshot`
- `medicationDue`
- `fitnessNutrition`
- `familyPulse`
- `aiSuggestion`
- `upcomingEvents`
- `recordsShortcut`

## Long-Press Menu Behavior

Each widget supports long press. The menu uses `HealthOSGlassMenu` with:

- Information
- Manage widget
- Remove from Home

Information mode shows the widget title, description, and tips. Remove from Home hides removable widgets for the current session.

## Data Sources And Placeholders

This pass uses existing read-only Home data where it was already available:

- `getRemindersForDate(new Date())`
- `getFitnessCalendarReminders()`
- `getTodayFitnessSummary()`
- `getTodayNutritionSummary()`

The dashboard does not invent medication names, family names, events, metrics, or records.

Placeholders are used for:

- Calendar/reminder timeline when no real reminders or fitness events exist
- Health metrics that are not currently logged
- Medication schedule when no medication reminder is available in the existing reminder feed
- Fitness/nutrition progress when no local summary exists
- Family pulse
- Upcoming events when no timeline items exist
- Records shortcut

## Widget Persistence

Widget visibility is session-only. Existing preference storage was not reused in this pass because it currently supports broader app/module preferences, and silently writing Home widget preferences could affect unrelated flows. Durable Home widget persistence should be added in a focused widget-management phase.

## Not Implemented

- Full widget manager screen
- Drag-and-drop reorder
- Persistent widget visibility
- Rich calendar/reminder aggregation
- Device metric sync
- AI backend calls from the AI suggestion widget

## Risks

- The Home route now renders the new HealthOS dashboard while preserving the existing route path. The old route-local UI was replaced, but the read-only reminder, fitness, and nutrition summary reads were reconnected to the new widgets.
- The tab layout still owns the old global AI search overlay. Home disables the shell AI command bar to avoid duplicate controls.

## Next Recommended Phase

Connect real read-only data to the new Home widgets one source at a time: reminders/calendar first, then medication, health metrics, family shared updates, and records.
