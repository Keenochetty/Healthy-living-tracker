# HealthOS Final Real-Device Test Checklist

Date: 2026-06-18

Run this only after native identifiers, assets, Supabase environment, and development build setup are complete.

## Install / Launch

- Install Android development build.
- Install iOS development build.
- Confirm app name and icon.
- Confirm splash screen appearance.
- Confirm cold launch.
- Confirm background/foreground resume.
- Confirm dark/light mode.

## Auth / Onboarding

- Sign up with email/password.
- Sign in with email/password.
- Sign out.
- Reset password flow.
- Email verification behavior.
- Complete onboarding.
- Skip optional permissions.
- Reopen app and verify session/preferences persist.

## Navigation

- Home/Today tab.
- Calendar tab.
- Scan tab.
- Health tab.
- Family tab.
- Settings route outside bottom nav.
- Deep feature routes from Health/Home/Family.
- Back behavior from detail screens.

## Camera / Scan

- First-run camera prompt.
- Deny camera permission.
- Open device settings from denied state if offered.
- Grant camera permission.
- Capture photo.
- Import from gallery.
- Barcode scan.
- Invite QR scan.
- Manual entry.
- Review/import target navigation.

## Notifications

- First-run notification prompt.
- Deny notification permission.
- Grant notification permission.
- Schedule reminder.
- Receive reminder.
- Tap reminder and verify route.
- Cancel reminder.
- Check sensitive lock-screen copy.
- Check Android notification channels.
- Check quiet-hours behavior.

## Records / Storage

- Upload image.
- Upload document.
- View record metadata.
- Signed URL/download flow.
- Delete record.
- Confirm no other user can access private files in staging tests.

## Supabase / Privacy

- User A cannot read User B private rows.
- Family member sees only explicitly shared data.
- Caregiver sees only assigned/shared data.
- Child/guardian access matches permissions.
- Women's health data remains private unless explicitly shared.
- AI import jobs/envelopes are user-private.

## AI

- AI chat without provider secret shows safe deferred behavior.
- AI chat with provider secret returns review-first structured output.
- AI import creates draft/review state only.
- No AI output is saved without user confirmation.

## Device / Layout

- Small Android phone.
- Large Android phone.
- iPhone small.
- iPhone large.
- Tablet/web if supported.
- Keyboard overlap on auth/forms.
- Screen reader basics on key buttons.

