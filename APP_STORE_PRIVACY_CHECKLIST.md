# App Store Privacy Checklist

Prepared for legal review. Apple requires developers to disclose data collected by the app and third-party partners, including collection and use details for the App Store privacy section.

Source checked: Apple Developer App Privacy Details, https://developer.apple.com/app-store/app-privacy-details/

## Likely Data Categories
- Contact Info: account email/name if account sync is enabled.
- Health and Fitness: nutrition, workouts, biometrics, medication/supplements, records, cycle, contraception, pregnancy, baby/child, men’s health, device sync samples.
- Sensitive Info: health, family, pregnancy, child, contraception, medication, and biometric data.
- User Content: notes, documents, photos, labels, prescriptions, lab records, voice/text prompts if enabled.
- Identifiers: local profile IDs, Supabase user ID when authenticated.
- Usage Data: only if analytics are added later.
- Diagnostics: only if crash reporting is added later.

## Disclosure Questions
- Is this data collected?
- Is this data linked to the user?
- Is this data used for tracking?
- Is this data shared with third parties?
- Is this data encrypted in transit?
- Can the user export it?
- Can the user delete it?
- Is the data optional or required for app functionality?

## Current Phase 23 Position
- Do not sell health data.
- Do not use health data for ads.
- Do not share health data without explicit permission.
- Sensitive modules are private by default.
- Final disclosures require legal and app-store review before public release.
