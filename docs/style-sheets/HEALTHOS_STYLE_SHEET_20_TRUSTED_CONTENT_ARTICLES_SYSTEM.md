# HealthOS Style Sheet 20 — Trusted Content + Articles System

## Purpose

Trusted Content is the educational layer of HealthOS. It powers source-linked articles, guides, tips, recipes, disclaimers, realm content sections, saved/read-later items, and source-aware cards.

## Route

- Active route: `/trusted-content`
- Trusted Content is not a visible bottom nav item.
- Bottom nav remains Home, Calendar, Scan, Health, Family.

## Rules

- Use existing trusted content data and source metadata.
- Do not invent article titles, sources, URLs, images, author names, reviewed dates, or medical facts.
- Do not fetch or scrape web content.
- Do not copy full external articles into the app.
- Do not create a new database table in this phase.
- Use empty states if no content is available.

## Source Quality

Supported quality levels:

- Official health authority
- Clinical institution
- Peer reviewed
- Professional reviewed
- Trusted publisher
- Manufacturer / label
- User saved
- Community
- Unknown source

Unknown and community sources are not treated as trusted.

## Safety

Medical disclaimer copy appears when content discusses medication, supplements, pregnancy, baby/child health, women’s health, high-risk topics, unknown sources, or emergency-sensitive material.

Default disclaimer:

> Educational only. This does not replace medical care.

## Components

- `HealthOSTrustedContentHubScreen`
- `HealthOSTrustedContentHeader`
- `HealthOSTrustedContentSearchFilter`
- `HealthOSTrustedContentFeatured`
- `HealthOSTrustedContentSection`
- `HealthOSTrustedContentCard`
- `HealthOSTrustedContentRow`
- `HealthOSTrustedContentDetailSheet`
- `HealthOSSourceQualityBadge`
- `HealthOSContentSafetyDisclaimer`
- `HealthOSContentSaveButton`
- `HealthOSRealmContentBlocks`
- `HealthOSContentEmptyState`

## Persistence

Existing trusted content and source registry storage remain in `trustedContentStorage`.

Save/read-later state is local AsyncStorage only for this phase. Database persistence is deferred.

## AI Integration

The UI includes an explicit “Ask AI” action from the detail sheet. It passes source metadata only when the user taps the action. Private health data is not sent automatically.
