# HealthOS Navigation Contract

Visible bottom nav:

1. Home - `/(tabs)/today`
2. Calendar - `/(tabs)/calendar`
3. Scan - `/(tabs)/scan`
4. Health - `/(tabs)/health`
5. Family - `/(tabs)/circle`

Hidden tab routes:

- Fitness - `/(tabs)/fitness`
- Nutrition / Food - `/(tabs)/food`
- Profile tab placeholder - `/(tabs)/profile`

Settings remains outside bottom navigation at `/settings`.

Notifications route through `/reminders`.

Family route uses `/(tabs)/circle`; `/circle/member/[memberId]` remains a detail route, not a main family landing route.

Food and Fitness detail routes stay under `/food/...` and `/fitness/...`, but their main landing routes are hidden tabs.
