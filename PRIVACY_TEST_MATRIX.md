# Privacy Test Matrix

Default rule: sensitive data is private, profile-scoped, and hidden unless the viewer owns the profile or has explicit permission.

| Data Area      | Self                      | Partner                     | Parent/Guardian                            | Teen               | Adult Child 18+    | Elder Shared        | Caregiver                                | Emergency Contact                    |
| -------------- | ------------------------- | --------------------------- | ------------------------------------------ | ------------------ | ------------------ | ------------------- | ---------------------------------------- | ------------------------------------ |
| Nutrition      | Own data                  | Explicit share only         | Child permission only                      | Transition setting | Explicit new grant | Explicit share      | Task-only if allowed                     | Hidden                               |
| Workout        | Own data                  | Explicit share only         | Child permission only                      | Transition setting | Explicit new grant | Explicit share      | Task-only if allowed                     | Hidden                               |
| Biometrics     | Own data                  | Explicit share only         | Child permission only                      | Transition setting | Explicit new grant | Explicit share      | Task-only if allowed                     | Emergency-visible only if configured |
| Medication     | Own data                  | Explicit share only         | Child permission only                      | Transition setting | Explicit new grant | Explicit share      | Due/task only if allowed                 | Emergency-visible only if configured |
| Supplements    | Own data                  | Explicit share only         | Child permission only                      | Transition setting | Explicit new grant | Explicit share      | Due/task only if allowed                 | Emergency-visible only if configured |
| Records        | Own data                  | Explicit record/realm share | Child permission only                      | Transition setting | Explicit new grant | Explicit share      | Allowed records only                     | Emergency-visible only if configured |
| Women’s Health | Own data                  | Explicit category share     | Hidden unless child permission and enabled | Transition setting | Explicit new grant | Explicit share      | Denied unless explicit category          | Hidden                               |
| Pregnancy      | Own data                  | Explicit share only         | Hidden unless child permission and enabled | Transition setting | Explicit new grant | Explicit share      | Denied unless explicit category          | Hidden                               |
| Baby / Child   | Parent-managed if allowed | Explicit share only         | Allowed parent/admin                       | Allowed by setting | Not applicable     | Explicit share      | Feeding/sleep/diaper/medicine tasks only | Emergency info only                  |
| Men’s Health   | Own data                  | Explicit category share     | Hidden unless child permission and enabled | Transition setting | Explicit new grant | Explicit share      | Denied unless explicit category          | Hidden                               |
| Device Sync    | Own data only             | Never auto-shared           | Never auto-shared                          | Never auto-shared  | Never auto-shared  | Never auto-shared   | Never auto-shared                        | Hidden                               |
| AI Assistant   | Consent-scoped            | No cross-profile access     | Permission-filtered                        | Transition setting | Explicit new grant | Permission-filtered | Task-only if allowed                     | Hidden                               |

## Required Checks

- Caregiver contacts never appear as switchable health profiles.
- Adult conversion stops parent access by default.
- Partner access requires explicit category or record sharing.
- Widgets and calendar overlays use the same permission filtering as realm screens.
- Locked states show `You do not have access to this information.` and no private values.
- Shared Women’s Health overlays show only allowed categories.
- Baby data is limited to parents or allowed caregiver task scopes.
- Records and documents remain private by default.
