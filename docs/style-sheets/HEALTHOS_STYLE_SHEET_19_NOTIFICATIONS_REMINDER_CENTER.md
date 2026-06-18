# HealthOS Style Sheet 19 — Notifications + Reminder Center

## Purpose

This style sheet defines the mobile Reminder Center foundation for HealthOS. It centralizes reminder inbox, permission status, quiet hours, category preferences, local notification status, review-first AI reminder imports, and reminder history without adding Notifications or Reminders to the visible bottom nav.

## Route

- Primary route: `/reminders`
- Existing detail route remains: `/reminders/[reminderId]`
- Legacy notification settings route remains available: `/settings/notifications`
- Bottom nav remains unchanged: Home, Calendar, Scan, Health, Family

## Data Rules

- Use existing reminder engine data.
- Use existing local notification settings, category settings, scheduled notification records, and reminder action logs.
- Do not invent reminder counts, push tokens, permission state, or notification history.
- Push registration remains deferred until a real backend/device-token flow is added.
- Local notification scheduling remains connected only through existing confirmed reminder flows.

## Safety Rules

- Medical, baby, contraception, pregnancy, records, lab, vaccine, refill, medication, and supplement reminders require review before scheduling.
- AI-created reminder drafts must not save or schedule silently.
- Lock-screen copy defaults to privacy-safe text.
- Sensitive details such as medication names, doses, test results, pregnancy details, and child details must not be shown unless the user explicitly changes detail settings.

## Visual Direction

- Clean, calm HealthOS cards.
- A clear today hero.
- Compact filter chips.
- Soft rounded list rows.
- Accessible dark/light support.
- Settings-focused controls separated from the main reminder feed.

## Sections

- Reminder Center header
- Notification permission card
- Today reminder hero
- Quick actions
- Reminder filter row
- Reminder inbox
- Upcoming schedule
- Needs review queue
- Reminder review sheet
- Quiet hours card
- Notification category preferences
- Device and push status
- Reminder history

## Deferred Items

- Remote push registration
- Full reviewed reminder creation form
- Deep AI import queue persistence
- Automatic scheduling from AI output
