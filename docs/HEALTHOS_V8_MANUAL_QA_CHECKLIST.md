# HealthOS V8 Manual QA Checklist

Use this checklist for real-device and simulator testing of the Expo React Native app.

## QA Run Details

- Date:
- Tester:
- Branch / commit:
- Expo SDK:
- App build:
- Device / simulator:
- OS version:
- Screen size:
- Theme:
- Accessibility font size:
- Result: Pass / Fail / Blocked

## Evidence And Issue Tracking

For each failure, record:

- Screen and route:
- Reproduction steps:
- Expected result:
- Actual result:
- Severity: Blocker / High / Medium / Low
- Screenshot or recording:
- Issue link:

### Screenshot Naming Convention

Use:

`platform-theme-screen-issue.png`

Example:

`ios-dark-calendar-hardcoded-card.png`

Use lowercase words separated by hyphens. Include the platform, theme, screen, and short issue description.

## Device And Theme Matrix

Complete the core navigation and screen checks for every configuration.

| Configuration | Device / OS | Tester | Result | Evidence / Notes |
| --- | --- | --- | --- | --- |
| iOS dark mode |  |  |  |  |
| iOS light mode |  |  |  |  |
| Android dark mode |  |  |  |  |
| Android light mode |  |  |  |  |
| Small screen |  |  |  |  |
| Large screen |  |  |  |  |

## App Shell And Navigation

- [ ] Bottom navigation order is Home, Calendar, Scan, Health, Family.
- [ ] Scan remains centered without overpowering the other tabs.
- [ ] Family remains on the right side.
- [ ] Active and inactive tab states have readable contrast.
- [ ] Every tab opens the correct route.
- [ ] Back navigation works from detail screens and sheets.
- [ ] Deep links and existing route actions still work.
- [ ] AI search bar sits above the bottom navigation.
- [ ] AI search bar does not block scrolling or bottom content.
- [ ] Screen content has consistent horizontal padding and section gaps.
- [ ] Last scrollable content remains visible above floating controls.

## Theme And Visual Consistency

- [ ] Cards, borders, text, icons, chips, charts, and empty states support dark mode.
- [ ] Cards, borders, text, icons, chips, charts, and empty states support light mode.
- [ ] No visible light-only cards appear in dark mode.
- [ ] No dark-only text or surfaces become unreadable in light mode.
- [ ] Primary buttons and selected chips have readable foreground contrast.
- [ ] Realm accent colors remain distinct and consistent.
- [ ] Heading, label, helper, metric, and kicker typography is consistent.
- [ ] Cards remain compact and do not feel unnecessarily bulky.
- [ ] Charts fit within cards without clipping or overflow.

## Screen Size And Font Scaling

- [ ] Small-screen layouts do not clip, overlap, or force inaccessible actions off-screen.
- [ ] Large-screen layouts do not stretch cards or leave excessive empty space.
- [ ] Portrait layouts remain usable after rotating away and back.
- [ ] Accessibility font scaling keeps headings readable.
- [ ] Accessibility font scaling does not hide actions or truncate critical safety text.
- [ ] Long labels wrap without overlapping icons, chips, or values.
- [ ] Touch targets remain usable with large text enabled.

## Keyboard And Forms

- [ ] Keyboard does not cover focused inputs.
- [ ] Forms scroll enough to reveal the focused field.
- [ ] Submit, continue, and save actions remain reachable with the keyboard open.
- [ ] Tapping controls while the keyboard is open works as expected.
- [ ] Keyboard dismissal does not lose entered values.
- [ ] Validation and error messages remain visible.

## Loading, Empty, And Error States

- [ ] Loading states clearly indicate progress without blocking navigation indefinitely.
- [ ] Empty states are compact, readable, and provide useful next actions where supported.
- [ ] Error states explain the problem without exposing technical details.
- [ ] Retry actions work where already supported.
- [ ] Offline or unavailable-device states preserve existing data.
- [ ] Empty charts and metrics render without crashing or malformed SVG paths.

## AI Search Sheet

- [ ] Tapping the AI search bar opens the assistant sheet.
- [ ] Tapping outside or using the back action closes the sheet.
- [ ] Sheet content respects the bottom safe area.
- [ ] Keyboard does not cover the AI input.
- [ ] Search preview and visual-only actions behave as expected.
- [ ] Existing routed actions open the correct destinations.
- [ ] Placeholder actions do not create data or claim completion.

## Camera And Scan

- [ ] Camera permission loading state displays correctly.
- [ ] Initial camera permission request works in a development build.
- [ ] Permission-denied state explains how to continue safely.
- [ ] Camera-unavailable state does not crash.
- [ ] Food and barcode scanning preserve existing behavior.
- [ ] Medication check flow preserves existing behavior.
- [ ] Document or record scanning preserves existing behavior.
- [ ] Scan result routes still work.
- [ ] Scan mode selector remains usable on small screens.
- [ ] Framed target and guidance overlay remain readable.

### Scan Fallback States

- [ ] Manual barcode entry fallback works where supported.
- [ ] Upload or import document fallback works where supported.
- [ ] Add medication manually action opens the correct route.
- [ ] Log meal manually action opens the correct route.
- [ ] Add health note action opens the correct route.
- [ ] Open records action opens the correct route.
- [ ] Unsupported fallback actions remain safe placeholders.

## Privacy And Family Visibility

- [ ] Active profile switching changes visible data correctly.
- [ ] Family and shared-care content only appears for permitted profiles.
- [ ] Private content does not expose hidden titles, notes, or values.
- [ ] Shared items clearly indicate their shared state.
- [ ] Family role and caregiver indicators remain accurate.
- [ ] Profile, privacy, and family-management routes still work.
- [ ] Locked or unavailable content has a clear, non-disclosing state.

### Women's Health Privacy

- [ ] Women's Health remains hidden when visibility rules require it.
- [ ] Private cycle, fertility, contraception, and pregnancy content is not exposed to unauthorized profiles.
- [ ] Sharing and privacy indicators are visible and accurate.
- [ ] Privacy wording remains clear in dark and light modes.

### Baby/Child Caregiver Visibility

- [ ] Selected-child context is clear.
- [ ] Caregivers only see permitted child information and actions.
- [ ] Private child data is not exposed through cards, timelines, or empty states.
- [ ] Shared-care and caregiver markers remain accurate.

## Medication Safety

- [ ] Medication and supplement safety wording remains present.
- [ ] Safety wording is readable with accessibility font scaling.
- [ ] Reminder text does not imply diagnosis or replace professional advice.
- [ ] Sensitive lock-screen wording remains private.
- [ ] Medication actions preserve confirmation and existing routes.
- [ ] Empty and error states do not suggest unsafe actions.

## Calendar Month View

- [ ] Month view renders seven columns.
- [ ] Previous and next month filler days display correctly where supported.
- [ ] Today and selected-day states are visually distinct.
- [ ] Event dots and realm-colored indicators remain visible.
- [ ] Private events do not expose hidden details.
- [ ] Shared or family events retain their visibility markers.
- [ ] Changing the selected date updates the agenda.
- [ ] Existing event press, create, edit, delete, and reminder actions still work.
- [ ] Upcoming items use real calendar data.
- [ ] Month grid remains usable on small screens and with font scaling.

## Converted Screen Coverage

Record a result for each converted area in every required platform/theme configuration.

| Screen / Area | Dark | Light | Small Screen | Large Text | Notes / Evidence |
| --- | --- | --- | --- | --- | --- |
| App shell and bottom navigation |  |  |  |  |  |
| Home / Today |  |  |  |  |  |
| Health hub |  |  |  |  |  |
| Calendar |  |  |  |  |  |
| Scan |  |  |  |  |  |
| Family / Circle |  |  |  |  |  |
| Fitness |  |  |  |  |  |
| Food / Nutrition |  |  |  |  |  |
| Medication / Supplements |  |  |  |  |  |
| Records |  |  |  |  |  |
| Women's Health |  |  |  |  |  |
| Baby / Child |  |  |  |  |  |
| Onboarding |  |  |  |  |  |
| Profile |  |  |  |  |  |
| Settings / control panel |  |  |  |  |  |

## Deferred Targeted Cleanup

Large behavior-heavy Calendar, Circle, Fitness, Cycle, and Medication files still contain some legacy hardcoded colors. These should only be corrected after real device screenshots confirm which styles remain visible.

Record confirmed visible issues below before changing those files:

| File / Screen | Device / Theme | Screenshot | Confirmed Visible Issue | Priority |
| --- | --- | --- | --- | --- |
|  |  |  |  |  |

## Release Readiness Sign-Off

- [ ] All four platform/theme combinations completed.
- [ ] Small-screen and large-screen checks completed.
- [ ] Accessibility font scaling completed.
- [ ] Camera and scan permission states completed in a development build.
- [ ] Privacy and family visibility checks completed with multiple profile roles.
- [ ] No blocker or high-severity issues remain open.
- [ ] Medium and low issues are documented and prioritized.
- [ ] Final screenshots and recordings are linked.
- [ ] Release owner approved the QA run.

