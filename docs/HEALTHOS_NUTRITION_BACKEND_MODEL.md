# HealthOS Nutrition Backend Model

## Supported In Batch 9

- Save private nutrition goals.
- Log meals and meal items.
- Save food item drafts from manual, scan, barcode, record, or AI sources.
- Save meal plan drafts.
- Save grocery lists and list items.
- Save hydration logs.
- Track nutrition review flags.

## Safety Rules

- No medical diet planning.
- No child or pregnancy nutrition prescription.
- No allergy-safe or diabetes-safe claims.
- No fake calories or macros.
- Food scan and AI outputs remain `needs_review`.

## Deferred

Trusted food databases, calorie/macro calculation, allergen verification, drug/food interaction logic, and clinical nutrition workflows remain deferred.
