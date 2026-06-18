# HealthOS Route Matrix

Route registry source: `src/features/healthosRouting/routeRegistry.ts`

Dev inspection route: `src/app/dev/route-matrix.tsx`

## Main Tabs

| Key | Route | Bottom Nav | Sensitive |
| --- | --- | --- | --- |
| Home | `/(tabs)/today` | Yes | No |
| Calendar | `/(tabs)/calendar` | Yes | Yes |
| Scan | `/(tabs)/scan` | Yes | Yes |
| Health | `/(tabs)/health` | Yes | Yes |
| Family | `/(tabs)/circle` | Yes | Yes |

## Hidden Realm Entrypoints

| Key | Route | Notes |
| --- | --- | --- |
| Fitness | `/(tabs)/fitness` | Main route is hidden tab; detail routes stay `/fitness/...`. |
| Nutrition | `/(tabs)/food` | Main route is hidden tab; detail routes stay `/food/...`. |
| Medication | `/medication` | Sensitive. |
| Supplements | `/supplements` | Sensitive. |
| Records | `/records` | Sensitive documents area. |
| Biometrics | `/biometrics` | Sensitive health metrics. |
| Women's Health / Cycle | `/cycle` | Private. |
| Pregnancy | `/pregnancy` | Private. |
| Baby / Child | `/baby-child` | Private. |
| Child | `/child` | Private detail area. |
| Caregiver | `/caregiver` | Family/care permissions. |
| Elder | `/elder` | Family/care permissions. |
| Device Sync | `/device-sync` | Permission-controlled. |
| Trusted Content | `/trusted-content` | Source-linked education. |
| AI | `/ai` | Chat/import review surface. |
| Reminders | `/reminders` | Notification/reminder center. |
| Settings | `/settings` | Privacy and profile control panel. |

## Alias Notes

- `/nutrition` does not exist. Use `/(tabs)/food`.
- `/food` has detail routes but no `index.tsx`. Use `/(tabs)/food` for the main Food/Nutrition page.
- `/fitness` has detail routes but no `index.tsx`. Use `/(tabs)/fitness` for the main Fitness page.
- `/circle` has member detail routes but no `index.tsx`. Use `/(tabs)/circle` for Family.
- `/notifications` does not exist. Use `/reminders`.
- `/profile` does not exist as an index route. Self-profile controls route through `/settings`; specific profiles use `/profile/[profileId]`.
