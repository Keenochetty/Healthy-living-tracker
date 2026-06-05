# Google Play Data Safety Checklist

Prepared for legal review. Google Play requires developers to describe app data collection, sharing, and security practices in the Data safety section.

Source checked: Google Play Console Help, Provide information for Google Play’s Data safety section, https://support.google.com/googleplay/android-developer/answer/10787469

## Data Collected
- Personal info: account/profile fields when entered.
- Health and fitness: all health module logs, reminders, records, device sync imports, and family care data.
- Photos/files: records, labels, scans, and document placeholders if enabled.
- Audio: only if voice logging is implemented and explicitly enabled.
- App activity: only if analytics are added later.
- Device IDs: only if platform services require them and are disclosed.
- Crash logs/diagnostics: only if diagnostics are added later.

## Data Shared
- Family/caregiver sharing only after explicit permission.
- Supabase/backend processing only for app functionality when configured.
- No advertising or sale of health data.

## Security Practices
- Local-first storage for current phase.
- Authenticated cloud storage must use RLS and ownership checks.
- Data in transit should use HTTPS/TLS.
- Sensitive notification content defaults to private/category-only.
- Export/delete request flows are prepared.

## Required Review
- Confirm every enabled SDK/provider.
- Confirm whether data is optional or required.
- Confirm encryption, deletion, and sharing representations match production behavior.
