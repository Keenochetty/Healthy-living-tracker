import { createContentFeedback } from "./trustedContentService";
import type { HealthOSContentFeedback, HealthOSTrustedContentServiceResult } from "./trustedContentTypes";

export function useContentFeedback() {
  async function create(input: Partial<HealthOSContentFeedback>): Promise<HealthOSTrustedContentServiceResult<HealthOSContentFeedback>> {
    return createContentFeedback(input);
  }

  return { create };
}
