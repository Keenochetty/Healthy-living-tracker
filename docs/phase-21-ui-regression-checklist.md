# Phase 21 UI Regression Checklist

Use this checklist after UI changes to keep the app visually consistent and permission-safe.

## Navigation

- Floating bottom nav uses Home, Health, Calendar, Family, Settings.
- Health remains active inside Health realms such as Nutrition, Workout, Medication, Records, Baby / Child, Women’s Health, Pregnancy, and Men’s Health.
- Baby droplet appears only for visible Baby / Child profiles or permission.
- Baby droplet tap opens `/baby-child`; long press opens child profile selection when multiple profiles exist.
- Assistant button does not overlap bottom navigation or form submit buttons.

## Health Overview

- Profile header, active profile, and privacy status are visible.
- Health main bar shows user-selected, per-profile, permission-aware widgets only.
- Widget cards are tappable, horizontally scrollable, and readable.
- Realm cards share icon, title, status, metric, privacy badge, and soft tint treatment.
- Setup completion card appears only when onboarding/setup is incomplete.

## Calendar

- Today, Week, Month, Timeline, and Reminders views are visually consistent.
- Month cells use dots, icons, and halos without relying on color alone.
- Women’s Health halos respect permissions and overlap with double/stacked indicators.
- Date bottom sheet lists only permitted actions and shared profile indicators.

## Realm Screens

- Each realm follows the RealmHeader, compact summary, primary action, tabs, cards, reports/learn/settings, and disclaimer pattern.
- Sensitive realms show privacy badges and footer copy.
- Empty states include icon, short explanation, primary action, and skip/later option when relevant.
- Forms use labels, placeholders, validation text, private-by-default status, and sticky save behavior for long flows.

## Privacy And Sharing

- Private, shared partner, shared family, shared caregiver, emergency only, and locked badges use consistent labels.
- Locked cards show `You do not have access to this information.` without exposing data.
- Caregiver views show assigned tasks, care notes, allowed reminders, and contact actions only.
- Device Sync data is never shared automatically.

## Reports And Learn

- Reports use minimal cards and simple rounded charts.
- Insights use gentle wording and avoid clinical conclusions.
- Learn cards show source organization, source URL action, last checked date, and disclaimer.
- Unsourced education is not shown.

## Accessibility And Motion

- Touch targets are at least 44px.
- Buttons and icon-only actions have accessibility labels.
- Calendar indicators include icon/pattern plus color.
- Text remains readable with dynamic type where practical.
- Motion is subtle and not used for sensitive alerts.
