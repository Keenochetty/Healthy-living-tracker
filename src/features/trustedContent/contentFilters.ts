import { isSourceQualityTrusted } from "./sourceQuality";
import type {
  HealthOSTrustedContentFilterKey,
  HealthOSTrustedContentItem,
  HealthOSTrustedContentRealm,
} from "./types";

export function filterTrustedContent(input: {
  filters: HealthOSTrustedContentFilterKey[];
  items: HealthOSTrustedContentItem[];
  query: string;
}) {
  const query = input.query.trim().toLowerCase();
  return input.items.filter((item) => {
    const matchesQuery =
      !query ||
      [
        item.title,
        item.summary,
        item.source.sourceName,
        ...(item.topicChips ?? []),
        ...item.categories,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase()
        .includes(query);
    if (!matchesQuery) return false;
    if (!input.filters.length || input.filters.includes("all")) return true;
    return input.filters.every((filter) => matchesFilter(item, filter));
  });
}

export function contentByRealm(
  items: HealthOSTrustedContentItem[],
  realm: HealthOSTrustedContentRealm,
) {
  return items.filter((item) => item.targetRealms.includes(realm));
}

function matchesFilter(
  item: HealthOSTrustedContentItem,
  filter: HealthOSTrustedContentFilterKey,
) {
  switch (filter) {
    case "saved":
      return Boolean(item.saved || item.readLater);
    case "needsReview":
      return (
        item.safetyFlags?.includes("sourceNeedsReview") ||
        item.source.sourceQuality === "unknown"
      );
    case "officialSources":
      return isSourceQualityTrusted(item.source.sourceQuality);
    case "recentlyUpdated":
      return wasUpdatedRecently(item.updatedAt);
    case "all":
      return true;
    default:
      return item.categories.includes(filter);
  }
}

function wasUpdatedRecently(value?: string) {
  if (!value) return false;
  const date = new Date(value).getTime();
  return Date.now() - date <= 1000 * 60 * 60 * 24 * 90;
}
