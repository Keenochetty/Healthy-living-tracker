# Data Inventory

Prepared for legal review. This inventory is a working map for privacy policy, POPIA preparation, and app-store privacy disclosures.

| Category | Source | Sensitivity | Purpose | Consent Required | Shared With | Retention | Export/Delete | Processors | App Store Category |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Account/profile | user preferences, health profiles | Personal | Personalization and profile switching | Profile/account | Explicit family permissions | Until deleted | Yes | Supabase if cloud enabled | Contact Info / Identifiers |
| Nutrition | nutrition entries, water, targets, reports | Health | Wellness tracking | Health data | Explicit share only | Until deleted | Yes | Food APIs if enabled | Health and Fitness |
| Workout | workout sessions, goals | Health | Fitness tracking | Health data | Explicit share only | Until deleted | Yes | None by default | Health and Fitness |
| Biometrics | biometric logs | Sensitive health | Personal tracking | Sensitive health | Explicit share only | Until deleted | Yes | Device sync if enabled | Health and Fitness / Sensitive Info |
| Women’s Health | cycle, symptoms, contraception | Sensitive health | Private tracking | Women’s Health / contraception | Category share only | Until deleted | Yes | None by default | Sensitive Info |
| Pregnancy | profile, symptoms, appointments, questions | Sensitive health | Organization and education | Pregnancy | Explicit share only | Until deleted | Yes | None by default | Sensitive Info |
| Baby/Child | feeding, sleep, diapers, growth, milestones | Child health | Parent/guardian care tracking | Baby/Child | Parents/allowed caregivers | Until deleted | Yes | None by default | Health and Fitness / Sensitive Info |
| Men’s Health | check-ins, symptoms, fertility/sexual notes | Sensitive health | Private tracking | Men’s Health | Category share only | Until deleted | Yes | None by default | Sensitive Info |
| Medication/Supplements | items, schedules, logs, safety notes | Sensitive health | Reminders and organization | Medication/Supplements | Explicit share only | Until deleted | Yes | Future adapters only | Health and Fitness / Sensitive Info |
| Records/Documents | documents, labs, prescriptions, visits | Sensitive health/user content | Document organization | Records/Documents | Explicit record/realm share | Until deleted | Yes | Storage provider if enabled | User Content / Sensitive Info |
| AI | settings, drafts, audit logs, optional summaries | Sensitive if enabled | Draft-first logging and summaries | AI Assistant | No cross-profile access without permission | Until deleted | Yes | Edge Function if enabled | User Content / Health |
| Device Sync | synced samples | Sensitive health | Optional import | Device Sync | Never auto-shared | Until deleted | Yes | HealthKit/Health Connect if enabled | Health and Fitness |
| Notifications | reminders, settings, scheduled records | Personal/health | Reminder delivery | Notifications | Caregiver task-only if allowed | Until deleted | Yes | Expo Notifications local | App Activity |
| Family/Caregiver | circles, permissions, invites, audit | Sensitive family | Sharing and care tasks | Family/Caregiver | Explicit participants | Until deleted | Yes | Supabase if cloud enabled | Personal Info |
| Analytics/Diagnostics | not enabled by default | Varies | Later-phase app quality | Explicit if added | Vendor-specific | Policy-defined | Required if added | Future vendor | Usage Data / Diagnostics |
