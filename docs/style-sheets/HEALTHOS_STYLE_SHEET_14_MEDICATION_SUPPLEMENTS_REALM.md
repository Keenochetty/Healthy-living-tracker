# HealthOS Style Sheet 14 - Medication + Supplements Realm

## Purpose

Defines the HealthOS native medication and supplements realm for the Expo React Native app. This screen is for organization, reminders, scan review, records, privacy, and source-backed education. It must not provide medication advice, dose-change guidance, diagnosis, or automatic sharing.

## Route Scope

- Active medication route: `src/app/medication/index.tsx`
- Active supplements route: `src/app/supplements/index.tsx`
- Add/detail routes remain unchanged.
- Medication and supplements are not added to the bottom navigation.

## UI Direction

- Soft rounded cards with HealthOS medication accent.
- Dark and light mode support through shared HealthOS tokens.
- Scroll-first layout for small Android devices and iPhones.
- Review-first scan/import flow.
- Explicit empty states instead of fake medication names, doses, refill dates, or cautions.

## Required Sections

- Medication + supplements header
- Today schedule hero
- Quick actions
- Medication timeline
- Supplement timeline
- Detail sheet
- Scan/import card
- Extraction review preview
- Adherence summary
- Refill reminder status
- Missed and side-effect notes
- Cautions
- Symptom support planning
- Records
- Calendar
- Sharing
- Trusted content
- AI question card

## Safety Rules

- Do not invent medication names, doses, schedules, refill dates, interactions, side effects, supplement benefits, or article links.
- Do not provide medical advice or dose-change advice.
- Do not auto-save AI or scan extraction.
- Do not auto-schedule reminders.
- Do not auto-share with caregivers, partners, or family.
- The user must explicitly confirm imports, reminders, and sharing.

