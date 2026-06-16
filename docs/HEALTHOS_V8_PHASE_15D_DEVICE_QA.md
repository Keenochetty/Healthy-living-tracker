# HealthOS V8 Phase 15D Device QA

## Scope

Use this document to manually smoke-test the active Expo Router app under `src/app` after the HealthOS V8 conversion and repository cleanup.

Do not redesign screens or make speculative visual fixes during this phase. Record real-device evidence first.

## QA Run Record

- Date:
- Tester:
- Branch / commit:
- Expo SDK / build:
- Platform / OS:
- Device / simulator:
- Screen size:
- Theme:
- Accessibility font size:
- Expo Go or development build:
- Overall result: Pass / Fail / Blocked

## Screenshot And Failure Evidence

For every failure, record:

- Route and screen:
- Platform, OS, theme, and device:
- Reproduction steps:
- Expected result:
- Actual result:
- Severity: Blocker / High / Medium / Low
- Screenshot or recording:
- Issue link:

Use lowercase filenames in this format:

`platform-theme-screen-issue.png`

Examples:

- `ios-dark-calendar-hardcoded-card.png`
- `android-light-scan-permission-denied.png`
- `ios-dark-keyboard-ai-overlap.png`
- `android-light-medication-missed-dose-card.png`
- `ios-large-font-settings-overflow.png`

## Required Device Matrix

Complete the high-value route matrix for every required configuration.

| Configuration | Device / OS | Build type | Result | Evidence / Notes |
| --- | --- | --- | --- | --- |
| iOS dark mode |  |  |  |  |
| iOS light mode |  |  |  |  |
| Android dark mode |  |  |  |  |
| Android light mode |  |  |  |  |
| Small screen |  |  |  |  |
| Large screen |  |  |  |  |
| Accessibility font scaling |  |  |  |  |

## Cross-App Checks

### Navigation And App State

- [ ] App launches into the expected auth, onboarding, or Today flow.
- [ ] Bottom nav order is Home, Calendar, Scan, Health, Family.
- [ ] Every visible tab opens the correct screen.
- [ ] Back navigation works from sheets and detail routes.
- [ ] Deep links open the expected active route.
- [ ] Supabase session restores after force-closing and reopening the app.
- [ ] Signed-out users cannot access protected content.
- [ ] Loading, empty, and error states do not crash or expose private details.

### Layout And Accessibility

- [ ] Dark mode has readable surfaces, text, icons, chips, and charts.
- [ ] Light mode has readable surfaces, text, icons, chips, and charts.
- [ ] Small screens do not clip content or hide actions.
- [ ] Large screens do not create unusable spacing or stretched controls.
- [ ] Accessibility font scaling does not hide actions or safety wording.
- [ ] Keyboard does not cover focused inputs, save actions, or AI controls.
- [ ] Long text wraps without overlapping icons or cards.

### Permissions And Native Flows

- [ ] Camera permission request, denied state, and unavailable state work.
- [ ] Document and image picker permission flows work.
- [ ] Notification permission request and denied state work.
- [ ] Scan fallback actions remain usable without camera access.
- [ ] Native permission failures show safe, actionable states.
- [ ] Expo Go limitations are distinguished from real app failures.

### Privacy And Shared Care

- [ ] Profile switching updates visible data and actions.
- [ ] Family/Circle permissions hide unauthorized content.
- [ ] Caregiver visibility matches assigned permissions.
- [ ] Women's Health data remains private for unauthorized profiles.
- [ ] Baby/Child data and caregiver actions respect access rules.
- [ ] Records privacy and sharing labels remain accurate.
- [ ] Medication safety wording remains visible and non-diagnostic.

## High-Value Route Smoke-Test Matrix

Mark dark and light checks separately. Capture a screenshot when any expected behavior fails.

| Screen / Active Route | Expected entry point | What to tap or perform | What should still work | Dark | Light | Screenshot if broken |
| --- | --- | --- | --- | --- | --- | --- |
| Auth / login / register: `/auth`, `/auth/login`, `/auth/sign-in`, `/auth/sign-up`, `/auth/signup` | Signed-out launch or auth action | Login, register, forgot password, validation | Auth actions, safe errors, keyboard avoidance, protected-route redirect | [ ] | [ ] | [ ] |
| Onboarding: `/onboarding`, `/onboarding/profile`, `/onboarding/modules`, `/onboarding/theme`, `/onboarding/units` | New-user flow | Continue through every step | Values persist, back/continue actions work, completion enters app | [ ] | [ ] | [ ] |
| Home / Today: `/(tabs)/today` | Home bottom tab | Profile control, cards, quick actions, realm links | Real data, privacy, profile switching, routes, scrolling | [ ] | [ ] | [ ] |
| Calendar: `/(tabs)/calendar`, `/health-calendar` | Calendar bottom tab | Change month/day, press event, quick add | Full month grid, agenda, reminders, privacy, event routes | [ ] | [ ] | [ ] |
| Scan: `/(tabs)/scan` | Scan bottom tab | Change mode, request camera, use fallbacks | Permissions, barcode/food/document flows, result handling | [ ] | [ ] | [ ] |
| Health hub: `/(tabs)/health`, `/health/[realm]` | Health bottom tab | Press realm cards and metrics | Unified hub, real realm routes, charts, privacy | [ ] | [ ] | [ ] |
| Family / Circle: `/(tabs)/circle`, `/circle/member/[memberId]`, `/join/[token]` | Family bottom tab | Switch/select member, invite/join, open permissions | Roles, privacy, caregiver visibility, shared-care actions | [ ] | [ ] | [ ] |
| Fitness: `/(tabs)/fitness`, `/fitness/*` | Health/Home fitness action | Open library, history, plans, goals, exercise | Existing content, plans, imports, activation, history | [ ] | [ ] | [ ] |
| Food / Nutrition: `/(tabs)/food`, `/food/*` | Health/Home food action | Smart log, barcode, meal, recipe, food detail | Existing logs, barcode flow, saved meals, nutrition data | [ ] | [ ] | [ ] |
| Medication / Supplements: `/medication/*`, `/supplements/*` | Health/Home medication action | Open item, add, mark/log action | Existing medication data, reminders, safety wording | [ ] | [ ] | [ ] |
| Records: `/records` | Health hub records action | Open records, sharing/privacy controls | Existing records, private states, navigation | [ ] | [ ] | [ ] |
| Women's Health: `/cycle`, `/pregnancy`, `/health/[realm]` | Health hub Women's Health action | Open cycle/pregnancy content and privacy controls | Privacy, predictions/logs, safe shared visibility | [ ] | [ ] | [ ] |
| Baby / Child: `/baby-child`, `/child`, `/child/[childId]` | Health hub or family child action | Select child, open logs/records, caregiver access | Child context, privacy, caregiver permissions, existing actions | [ ] | [ ] | [ ] |
| Profile: `/(tabs)/profile`, `/profile/[profileId]` | Today profile control or profile route | Switch/open/edit profile | Active profile context, privacy, navigation | [ ] | [ ] | [ ] |
| Settings / control panel: `/settings`, `/settings/*` | Profile/settings action | Open privacy, permissions, security, notifications | Existing settings, controls, keyboard layout, permission routes | [ ] | [ ] | [ ] |
| AI assistant sheet and `/ai` | Persistent AI search bar | Open/close sheet, focus input, press safe actions | Sheet safe area, keyboard behavior, routes, placeholders | [ ] | [ ] | [ ] |

## Focused Behavior Checks

### AI Search Sheet And Bottom Navigation

- [ ] Persistent AI search bar opens the assistant sheet.
- [ ] Sheet closes by supported close/back interactions.
- [ ] Keyboard does not overlap AI input or actions.
- [ ] Sheet and search bar do not block bottom navigation or scroll content.
- [ ] AI actions only route or behave where already supported.
- [ ] Bottom nav active states, labels, and safe-area spacing remain correct.

### Calendar Full Month View

- [ ] Month grid renders seven columns.
- [ ] Today and selected day are distinct.
- [ ] Realm-colored event markers remain visible.
- [ ] Selected-day agenda updates correctly.
- [ ] Private events do not expose hidden details.
- [ ] Existing create, edit, reminder, and event-press behavior works.

### Scan Fallback States

- [ ] Permission loading state renders.
- [ ] Permission denied state explains the safe next step.
- [ ] Camera unavailable state does not crash.
- [ ] Upload/import fallback works where supported.
- [ ] Manual barcode, medication, meal, note, and records actions route safely.
- [ ] Expo Go limitations do not bypass permission checks.

### Privacy And Safety

- [ ] Family/Circle shared items expose only authorized details.
- [ ] Caregiver views contain only permitted actions and data.
- [ ] Women's Health cards, logs, and predictions remain private.
- [ ] Baby/Child records and logs respect caregiver permissions.
- [ ] Medication missed-dose and safety wording remains clear and non-diagnostic.
- [ ] Records sharing states and privacy labels remain accurate.

## Testing Commands

Run before and after any future targeted fix:

```powershell
npm run typecheck
npm run lint
npm test
git diff --check
npx expo export
npx expo start --clear
```

Use Expo Go for routes and features supported by Expo Go. Use a development build when native permissions, native modules, remote notifications, or device-only behavior require it. Android remote push notifications are not supported in Expo Go and must be tested in a development build.

## Targeted Fix Rule

Future fixes must address one confirmed screen and issue at a time, based on a real-device screenshot or recording. Do not combine speculative visual cleanup with the confirmed fix.

Examples:

- "Fix iOS dark Calendar hardcoded white event card only."
- "Fix Android light Medication text contrast only."
- "Fix Scan permission denied empty state only."

For each targeted fix:

1. Link the screenshot and reproduction steps.
2. Identify the smallest responsible component or style.
3. Preserve routes, data flow, permissions, and privacy behavior.
4. Verify the affected screen in both themes.
5. Run the full testing commands above.

## Known Deferred Cleanup

Large behavior-heavy Calendar, Circle, Fitness, Cycle, and Medication files still contain legacy local hardcoded colors. They should be corrected only after device screenshots confirm which styles remain visible.

| Screen / File | Platform / Theme | Screenshot | Confirmed visible issue | Priority |
| --- | --- | --- | --- | --- |
|  |  |  |  |  |

## Phase 15D Sign-Off

- [ ] iOS dark and light runs completed.
- [ ] Android dark and light runs completed.
- [ ] Small-screen and large-screen runs completed.
- [ ] Accessibility font scaling and keyboard overlap checked.
- [ ] Permissions and native flows checked in an appropriate build.
- [ ] High-value route matrix completed.
- [ ] Privacy, family, caregiver, Women's Health, Baby/Child, medication, and records checks completed.
- [ ] Every failure has screenshot evidence and reproduction steps.
- [ ] No speculative fixes were made.

## Recommended Phase 15E Process

Select one failed matrix item with screenshot evidence. Create a narrowly scoped task naming the platform, theme, route, exact visible defect, reproduction steps, expected result, and screenshot filename. Fix only that issue, verify both themes on the affected platform, run the full testing commands, and record the result before selecting the next issue.
