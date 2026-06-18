# HealthOS Trusted Content Service Implementation

## Files

- `trustedContentTypes.ts`
- `trustedContentDefaults.ts`
- `trustedContentMappers.ts`
- `trustedContentValidation.ts`
- `trustedContentSafety.ts`
- `trustedContentService.ts`
- `useTrustedContentFeed.ts`
- `useTrustedContentItem.ts`
- `useSavedContent.ts`
- `useContentReadHistory.ts`
- `useContentFeedback.ts`

## Methods

- `getCurrentAuthUser`
- `getTrustedContentFeed`
- `getTrustedContentForRealm`
- `getTrustedContentItemById`
- `getTrustedContentSources`
- `getTrustedContentTargeting`
- `searchTrustedContent`
- `getSavedContent`
- `saveContentItem`
- `saveExternalContentLink`
- `archiveSavedContent`
- `recordContentOpened`
- `getContentReadHistory`
- `createContentFeedback`
- `hideContentItemForUser`
- `getContentByCategory`
- `getContentBySourceQuality`

## Status Handling

The service returns `missingAuth`, `missingTable`, `adminDeferred`, `deferred`, or `error` instead of throwing raw Supabase errors to UI callers.

Global content writes from client are intentionally deferred.
