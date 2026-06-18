# HealthOS After-MVP Backend Scope

Date: 2026-06-17

| Feature | Why Deferred | Dependencies | Complexity | Risk If Built Now | Revisit When |
| --- | --- | --- | --- | --- | --- |
| Full subscription billing | Billing needs entitlements, webhooks, refunds, and legal/store setup. | Pricing, terms, billing provider | Very high | Billing defects create support and review risk. | MVP value is validated. |
| Full push notification backend | Needs native/dev build, scheduling backend, and device QA. | Reminder source model, notification preferences | High | Push can fail silently. | Reminder persistence is stable. |
| Caregiver billing/rates/payments | Adds marketplace/payment compliance. | Caregiver access, billing, legal | Very high | Payment flows before permission stability are risky. | Caregiver flows are proven. |
| Medical aid/pharmacy directory | Needs licensed third-party data. | Vendor/source selection | High | Bad directory data damages trust. | Source process exists. |
| Device integrations | Needs native permissions and mapping. | Native build, privacy copy | Very high | Bad imports can corrupt health records. | Manual logs are stable. |
| Apple Health / Health Connect | Platform-specific sensitive data import. | Native build, device QA | Very high | Permission and mapping errors are high risk. | Dedicated native phase. |
| Advanced analytics/charts | Needs stable data and chart QA. | Canonical logs, chart components | Medium | Charts can imply false precision. | Real persistence exists. |
| Automated data export/delete | Must cover final schema/storage inventory. | Final schema, legal review | High | Incomplete coverage violates trust. | Schema scope is frozen. |
| Full content admin panel | Needs roles, moderation, and audit trail. | Trusted content schema, admin auth | High | Unreviewed health content risk. | Trusted content MVP exists. |
| Advanced AI history/search | Needs retention and privacy model. | AI import schema, retention policy | High | AI content is highly sensitive. | AI review storage is stable. |
| Automated child age transfer | Needs legal/product rule. | Child account model, legal | Very high | Can expose minor data incorrectly. | Compliance phase starts. |
| Multi-country medical content rules | Regional content law and guidance. | Trusted source policy | Very high | Wrong regional advice creates legal risk. | Market expansion. |
| AI source verification pipeline | Requires verification and citation workflow. | Trusted content and AI safety | Very high | False verification creates misplaced trust. | Trusted content is stable. |
| Offline sync | Requires conflict resolution and audit model. | Canonical schema, conflict policy | Very high | Bad merges corrupt records. | Online flows are stable. |

