# HealthOS Style Sheet 25 - MVP Backend Implementation Plan + Migration Sequencing

## Purpose

Turn the Phase 23 and Phase 24 backend audits into a safe MVP implementation sequence. This phase plans migrations, RLS, storage, generated types, services, UI connection order, release blockers, and after-MVP backend scope.

## Rules

- Plan before implementing.
- Do not redesign UI.
- Do not apply migrations.
- Do not run remote Supabase commands.
- Do not deploy Supabase functions.
- Do not add fake seed data.
- Do not install packages.
- Do not run a full build/export/EAS build.
- Run typecheck only.

## Required Order

1. Canonical data model decisions.
2. Non-destructive migration sequence.
3. RLS and storage policy sequence.
4. Generated type update plan.
5. Supabase service/hook sequence.
6. UI connection sequence.
7. QA sequence.
8. Release blocker list.

