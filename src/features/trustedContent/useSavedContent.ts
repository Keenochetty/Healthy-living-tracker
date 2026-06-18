import { archiveSavedContent, getSavedContent, saveExternalContentLink } from "./trustedContentService";
import type { HealthOSSavedContentItem } from "./trustedContentTypes";
import { useTrustedContentResource } from "./useTrustedContentResource";

export function useSavedContent() {
  const resource = useTrustedContentResource<HealthOSSavedContentItem, Partial<HealthOSSavedContentItem>>(
    getSavedContent,
    saveExternalContentLink,
  );
  return { ...resource, archive: archiveSavedContent };
}
