import { getContentReadHistory, recordContentOpened } from "./trustedContentService";
import type { HealthOSContentReadHistory } from "./trustedContentTypes";
import { useTrustedContentResource } from "./useTrustedContentResource";

export function useContentReadHistory() {
  return useTrustedContentResource<HealthOSContentReadHistory, Partial<HealthOSContentReadHistory>>(
    getContentReadHistory,
    recordContentOpened,
  );
}
