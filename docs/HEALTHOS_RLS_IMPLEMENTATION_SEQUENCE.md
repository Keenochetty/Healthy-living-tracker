# HealthOS RLS Implementation Sequence

Date: 2026-06-17

## Order

1. Owner-only policies for profiles, settings, onboarding preferences, widgets, and modules.
2. Owner-only policies for care/person profiles.
3. Guardian policies for child data.
4. Membership policies for family circles.
5. Explicit permission policies for shared health data.
6. Caregiver limited-access policies.
7. Records metadata policies.
8. Storage object policies aligned with metadata ownership.
9. AI import owner-only policies.
10. Reminder and notification privacy policies.
11. Trusted content public/reference and saved-content private policies.

## Rules

- Use `TO authenticated` with ownership predicates.
- Do not use `TO authenticated` alone as authorization.
- UPDATE policies need both `USING` and `WITH CHECK`.
- Do not use user-editable metadata for authorization.
- Avoid `SECURITY DEFINER` unless isolated, justified, and reviewed.

