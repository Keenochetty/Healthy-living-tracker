# HealthOS Final MVP Screen Test Matrix

Date: 2026-06-18

## Primary Shell

| Area | Route | Status To Test |
| --- | --- | --- |
| Home / Today | `/(tabs)/today` | Empty, loading, signed-in, signed-out |
| Calendar | `/(tabs)/calendar` | Events, reminders, empty state, notification actions |
| Scan | `/(tabs)/scan` | Camera, gallery, denied permission, import targets |
| Health | `/(tabs)/health` | Realm entry points and deferred states |
| Family | `/(tabs)/circle` | Circle empty state, member cards, permission surfaces |

## Auth / Setup

| Area | Route | Status To Test |
| --- | --- | --- |
| Auth index | `/auth` | Redirect behavior |
| Sign in | `/auth/sign-in` | Email/password, errors, success |
| Sign up | `/auth/sign-up` | Email/password, errors, success |
| Forgot password | `/auth/forgot-password` | Email submission and messaging |
| Onboarding | `/onboarding` | Complete, skip, permission choices |

## Realms

| Area | Route | Status To Test |
| --- | --- | --- |
| Records | `/records` | Empty state, upload, private metadata |
| Medication | `/medication` | Empty state, schedules, reminders |
| Supplements | `/supplements` | Empty state, schedules, reminders |
| Fitness | `/fitness` and hidden tab | Empty state, plans, no fake fallback |
| Nutrition | `/food` and hidden tab | Empty state, barcode/gallery flows |
| Women's Health | `/cycle` | Private state and reminders |
| Pregnancy | `/pregnancy` | Private state and reminders |
| Baby / Child | `/baby-child` | Parent-managed state and reminders |
| Men's Health | `/mens-health` | Private state |
| Trusted Content | `/trusted-content` | Feed, saved/read states |
| Settings | `/settings` | Profile, security, permissions, notifications |

## Pass Criteria

- No fake user health values appear.
- No broken primary actions.
- Every deferred backend state says why it is unavailable.
- No private health detail leaks into shared/family/caregiver contexts.
- All AI/import paths remain review-first.

