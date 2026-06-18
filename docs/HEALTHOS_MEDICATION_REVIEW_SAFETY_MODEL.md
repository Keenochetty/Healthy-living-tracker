# HealthOS Medication Review + Safety Model

Date: 2026-06-17

## Review-First Rules

Medication and supplement entries from AI, scan, prescription records, medication labels, supplement labels, doctor notes, pharmacy notes, or record extraction must start as:

- `status = draft`
- `review_status = needs_review`

They cannot be active schedules or linked reminders until reviewed.

## No Medical Advice Rule

HealthOS must not:

- prescribe,
- recommend or adjust dosage,
- tell users to start/stop medication,
- diagnose side effects,
- confirm interactions as final clinical facts,
- replace a healthcare professional.

## Missed-Dose Copy

Safe copy: "For missed doses, check your medication instructions or ask a pharmacist, doctor, or healthcare professional."

## Side-Effect Notes

Side-effect notes are recorded as possible symptom notes, not diagnoses or causation claims. Severe or urgent symptom copy directs the user to urgent care.

## Review Flags

Review flags are prompts only, using language such as "review needed" or "professional review recommended."
