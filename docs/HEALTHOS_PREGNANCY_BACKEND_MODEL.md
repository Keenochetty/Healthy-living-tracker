# HealthOS Pregnancy Backend Model

Date: 2026-06-17

## Model

`pregnancy_profiles` stores private pregnancy profile metadata linked to an optional `care_profiles` subject. It supports user/provider-entered due date fields, baby nickname/sex metadata, record source links, review status, and ended state.

`pregnancy_logs` stores user-entered notes, mood, symptoms, and severity as tracking data only.

`pregnancy_appointments` stores appointment metadata with optional record, calendar event, and reminder links.

`pregnancy_checklists` stores planning checklist rows.

`pregnancy_care_team` stores contact-only care team rows. It does not grant professional portal access.

## Safety

No diagnosis, complication prediction, miscarriage/fetal outcome scoring, medication recommendation, or risk scoring is implemented.
