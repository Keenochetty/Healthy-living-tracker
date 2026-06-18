# HealthOS Trusted Content Realm Feeds

## Realms

Supported realm keys:

- Home
- Health
- Medication
- Supplements
- Nutrition
- Fitness
- Pregnancy
- Baby/Child
- Women’s Health
- Records
- Family
- Calendar
- AI
- Scan
- Settings
- General

## Rules

- Realm feeds should query published/active content only.
- Content targeting can add additional realm/context matches without duplicating content.
- Source quality and disclaimer copy must be visible.
- External links and image URLs must be preserved.
- Do not personalize content from private logs in this batch.
- Do not show fake articles when the backend is empty.

## UI Status

Backend hooks exist. Active screens were not rewired in this batch to avoid replacing the current local seeded educational content unexpectedly.
