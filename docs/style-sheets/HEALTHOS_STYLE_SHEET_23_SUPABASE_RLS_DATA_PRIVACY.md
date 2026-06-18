# HealthOS Style Sheet 23 - Supabase RLS + Data Privacy

This phase audits and hardens Supabase RLS, storage access, sharing permissions, AI data boundaries, export/delete readiness, and sensitive health-data safeguards.

Core rule: health data is private by default. The database must enforce privacy; UI checks are only supporting controls.

This phase does not redesign UI, drop or rename tables, delete data, install packages, run remote Supabase commands, deploy functions, or run full builds.

Verification target: `npm run typecheck`.
