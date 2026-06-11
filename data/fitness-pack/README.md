# HealthSync Fitness Content Seed Pack

Generated: 2026-06-11  
Version: v0.1-safe-seed-2026-06-11

This is a **database-ready starter pack** for your family health app. It contains original seed content, not copied website text, and it is designed around your Workout/Food/Health realms, pregnancy/postpartum/baby/child safety requirements, and the need for a muscle-map heatmap system.

## Counts

- Exercises / activities: 2450
- Premade plans: 63
- Plan day rows: 1988
- Nutrition templates: 312
- Goal progression rules: 10
- Safety rules: 10
- Original simple muscle-map PNG assets: 20

## Important safety note

This pack is a seed library for product design and database setup. It is **not medical advice** and is **not production-certified**. Pregnancy, postpartum, baby, children, teen, nutrition, allergies, medication interactions and advanced/intense training content must be reviewed by qualified professionals before launch.

## Recommended app approach

Do not store 2,000 separate muscle images. Store one dynamic muscle-map layer system and link each exercise to one or more `muscle_map_primary_layer_ids`. Then your UI can render front/back highlights, heatmaps and recovery load dynamically.

## Files

- `data/exercise_library_seed.csv` and `.json` - main exercise/activity library
- `data/workout_plans_seed.csv` and `.json` - premade plan metadata
- `data/workout_plan_days_seed.csv` and `.json` - day-by-day plan schedule rows
- `data/nutrition_templates_seed.csv` and `.json` - meal schedule and diet-style templates
- `data/goal_progressions_seed.csv` - goal-based progressions like 5K and bench 20kg to 50kg
- `data/safety_rules_seed.csv` - safety and restriction rules
- `data/muscle_map_layers.json` - dynamic muscle-map layer reference
- `data/source_references.csv` - source/licensing references
- `assets/muscle_maps/*.png` - simple original placeholder muscle-map drawings
- `sql/supabase_fitness_schema.sql` - Supabase schema for import
- `docs/fitness_content_seed_pack_summary.pdf` - PDF explanation and implementation guide

## Media policy

YouTube fields are intentionally provided as search/query placeholders, not scraped/downloaded videos. Use YouTube embeds only through the official player and store license/attribution metadata. Use CC BY / public domain / licensed content only when you have verified rights.
