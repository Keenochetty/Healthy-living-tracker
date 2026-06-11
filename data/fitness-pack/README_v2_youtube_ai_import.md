# Fitness Content Seed Pack v0.2 - YouTube + AI Import Add-on

Version: v0.2-youtube-ai-import-2026-06-11

This add-on extends the original 2,450-row seed pack with:

- YouTube metadata fields for exercise demo embeds
- YouTube video candidate seed table
- Exercise type taxonomy including yoga, pilates, mobility, stretching, running, strength, pregnancy mobility, postpartum core, baby/child/teen movement and advanced training
- Diet type taxonomy including omnivore, vegan, vegetarian, pescatarian, keto, low-carb, Mediterranean, paleo, carnivore, halal, kosher, gluten-free, dairy-free and medical-gated diet styles
- AI plan import workflow
- Calendar activation rules
- History event taxonomy
- Supabase migration for imported user plans and history
- Codex implementation prompt

Important rule: YouTube support is embed-only. Do not download, cache, rehost, or package YouTube video files. Store video IDs and metadata, then play with the official YouTube player.

Import order:

1. sql/supabase_fitness_schema.sql
2. sql/002_youtube_ai_import_schema.sql
3. data/exercise_library_seed.csv
4. data/workout_plans_seed.csv
5. data/workout_plan_days_seed.csv
6. data/nutrition_templates_seed.csv
7. data/exercise_type_taxonomy.csv
8. data/diet_type_taxonomy.csv
9. data/exercise_video_sources_seed.csv
10. data/calendar_activation_rules.csv
11. data/history_event_taxonomy.csv

Recommended production gates:

- Coach review for exercise form and programming
- Medical review for pregnancy, baby, child, teen, postpartum, chronic conditions and restrictive diets
- Manual review for every YouTube video before showing it publicly
- License/attribution storage for every external source
- User preview before importing or activating AI-generated plans