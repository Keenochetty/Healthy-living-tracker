# Codex Prompt - Fitness Realm v0.2: YouTube Embeds, AI Import, Calendar Activation and History

You are working in the existing health app codebase. Implement the fitness/nutrition content system using the seed pack files.

Goals:

1. Add database support for YouTube video metadata, exercise/diet taxonomies, imported user plans, calendar activation and history.
2. Never download, cache, rehost or strip YouTube videos. Store only video metadata and IDs. Play videos using the official YouTube embedded player.
3. Add AI plan import flow: search -> normalize -> safety/license gate -> preview -> user edit -> import -> activate to calendar -> history.
4. Support workout types such as strength, running, yoga, pilates, mobility, stretching, pregnancy mobility, postpartum core, child fundamentals, teen conditioning and advanced/extreme training.
5. Support diet types such as omnivore, vegetarian, vegan, pescatarian, keto, low-carb, Mediterranean, paleo, carnivore, halal, kosher, gluten-free, dairy-free, DASH, diabetes-aware, pregnancy balanced, postpartum recovery and child/teen templates.

Implementation steps:

- Run sql/supabase_fitness_schema.sql if not already applied.
- Run sql/002_youtube_ai_import_schema.sql.
- Import data/_.csv or data/_.json into the matching tables.
- Build server-side YouTube search service from code/supabase_edge_function_youtube_search_pseudocode.ts.
- Build admin review screen for video candidates: approve/reject, check audience safety, pregnancy/kid flags and attribution.
- Build exercise detail UI: app-owned instructions + muscle-map + safety notes + optional YouTube embed.
- Build AI import UI:
  1. User enters query and filters.
  2. Backend searches approved web sources.
  3. AI normalizes into app schema without copying protected content wholesale.
  4. App shows source URLs, safety flags, license status and calendar preview.
  5. User clicks Import Plan.
  6. User chooses start date, training days, time slots and reminders.
  7. App creates user_imported_plans, user_imported_plan_days, user_plan_calendar_events and user_fitness_history records.
- Add controls for pause, edit, duplicate, share, archive and delete.
- Add history screen with completed sessions, skipped sessions, imports, edits, warnings shown, nutrition logs and AI searches.

Acceptance criteria:

- A user can browse DB exercises and filter by audience, level, equipment, type, muscle and safety.
- An exercise can show its own instructions, muscle map, warnings and optional YouTube video.
- A YouTube video is always embedded, never downloaded or rehosted.
- Imported AI plans stay as drafts until the user previews and confirms.
- Pregnancy, child, baby, teen, medical and extreme plans show hard warnings and require review flags.
- Activating a plan creates calendar events and history rows.
- Pausing/deleting a plan does not erase historical completion data unless the user explicitly deletes their account/data.
