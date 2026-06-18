import { getTrustedContentFeed, getTrustedContentForRealm } from "./trustedContentService";
import type { HealthOSTrustedContentBackendItem, HealthOSTrustedContentRealm } from "./trustedContentTypes";
import { useTrustedContentResource } from "./useTrustedContentResource";

export function useTrustedContentFeed(realm?: HealthOSTrustedContentRealm) {
  return useTrustedContentResource<HealthOSTrustedContentBackendItem>(
    () => (realm ? getTrustedContentForRealm(realm) : getTrustedContentFeed()),
  );
}
