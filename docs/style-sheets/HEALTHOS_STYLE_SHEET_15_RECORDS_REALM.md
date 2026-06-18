# HealthOS Style Sheet 15 - Records Realm

## Purpose

Defines the HealthOS Records realm as a private-first document vault for scripts, prescriptions, medication labels, doctor notes, lab reports, vaccine cards, pregnancy documents, child documents, insurance / medical aid records, scans, uploads, and linked records from other realms.

## Scope

- Redesign the active Records route only.
- Do not redesign Medication, Baby/Child, Pregnancy, Nutrition, Fitness, Calendar, Health Hub, Home, Scan, or Family.
- Do not add Records to the visible bottom nav.
- Preserve storage, auth, Supabase, AI extraction, seed data, migrations, and business flows.

## Required UI

- Records header and privacy chip
- Search and filter row
- Secure vault hero
- Quick actions
- Category grid/list
- Recent records list
- Record detail sheet
- Upload sheet foundation
- Scan/upload/import foundation
- AI extraction review queue
- Extraction review foundation
- Linked records card
- Emergency packet foundation
- Sharing/permissions foundation
- Record history/audit foundation
- Source metadata support
- Source-linked content preview

## Safety Rules

- Records are private by default.
- Do not share records automatically.
- Do not expose raw storage paths.
- Do not invent record names, dates, metadata, extraction results, sharing, emergency packet contents, or source links.
- AI extraction must be review-first.
- No extracted facts are saved to other realms without explicit confirmation.
- Upload/storage writes require existing safe handlers.

## Verification

Run typecheck only:

```bash
npm run typecheck
```

