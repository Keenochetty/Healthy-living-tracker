# HealthOS Reminder Review + Scheduling Model

Date: 2026-06-17

## Core Distinction

A reminder record stores intent. A local notification is a device delivery artifact. Batch 5 keeps those separate.

## Lifecycle

Supported reminder states:

- `draft`
- `needsReview`
- `scheduled`
- `localScheduled`
- `pushPending`
- `due`
- `completed`
- `missed`
- `snoozed`
- `skipped`
- `dismissed`
- `cancelled`
- `failed`
- `deferred`
- `unknown`

## Review-First Rules

The following categories require user review before scheduling:

- medication
- supplements
- pregnancy
- baby/child
- women health
- records
- AI import
- caregiver/family
- security and unknown health categories

AI/Scan-created reminder candidates must be `needsReview` and `reviewRequired = true`.

## Local Scheduling Rule

Local OS notification scheduling is allowed only after:

- the user takes an explicit action,
- notification permission is available,
- the reminder has a valid scheduled time,
- sensitive reminders have been reviewed,
- lock-screen copy is privacy-safe.

## Push Scheduling

Push notification backend, push jobs, push token registration, and push send functions are deferred.
