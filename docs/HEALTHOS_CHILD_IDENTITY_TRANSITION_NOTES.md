# HealthOS Child Identity Transition Notes

## Current Child Identity

Child identity currently exists in local `childStorage` and backend `children`.

## Future Transition

Use `care_profiles` as the app-wide identity row and keep `children` for child-specific details and logs. A later migration can add a nullable `care_profile_id` bridge to `children` after generated types and UI flows are ready.

## Guardrails

- Do not delete or overwrite existing child rows.
- Do not infer medical or growth data from identity rows.
- Keep teen/adult handover rules in the family permissions layer until a dedicated permissions batch replaces them.
