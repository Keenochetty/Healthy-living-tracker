# HealthOS Source Quality Model

## Values

- `officialHealthAuthority`
- `clinicalInstitution`
- `peerReviewed`
- `registeredProfessional`
- `trustedPublisher`
- `manufacturer`
- `community`
- `userSaved`
- `aiGenerated`
- `unknown`

## Rules

- Unknown is not trusted.
- AI-generated is not trusted by default.
- Manufacturer content must be labeled clearly.
- User-saved external links are private and not globally trusted.
- Official, clinical, peer-reviewed, registered professional, and trusted publisher sources can be shown as health education sources.

Helpers live in `src/features/trustedContent/sourceQuality.ts`.
