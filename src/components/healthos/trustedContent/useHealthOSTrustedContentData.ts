import AsyncStorage from "@react-native-async-storage/async-storage";
import { useCallback, useEffect, useMemo, useState } from "react";

import {
  contentByRealm,
  filterTrustedContent,
  HEALTHOS_TRUSTED_CONTENT_EMPTY_STATES,
  HEALTHOS_SOURCE_QUALITY_LABELS,
  normalizeTrustedContentCard,
  type HealthOSSourceQualitySummary,
  type HealthOSTrustedContentFilterKey,
  type HealthOSTrustedContentItem,
  type HealthOSTrustedContentRealm,
} from "@/features/trustedContent";
import {
  getContentReviewQueue,
  getTrustedHealthContentCards,
  getTrustedSources,
} from "@/lib/trustedContentStorage";

const CONTENT_STATE_KEY = "healthos_phase20_trusted_content_local_state";

type SavedContentState = Record<
  string,
  Pick<HealthOSTrustedContentItem, "readLater" | "readStatus" | "saved">
>;

export type HealthOSTrustedContentData = {
  activeFilters: HealthOSTrustedContentFilterKey[];
  allContent: HealthOSTrustedContentItem[];
  contentByCategory: Record<string, HealthOSTrustedContentItem[]>;
  contentByRealm: Record<HealthOSTrustedContentRealm, HealthOSTrustedContentItem[]>;
  emptyState: string;
  error?: string;
  featuredContent?: HealthOSTrustedContentItem;
  filteredContent: HealthOSTrustedContentItem[];
  latestContent: HealthOSTrustedContentItem[];
  loading: boolean;
  needsReviewContent: HealthOSTrustedContentItem[];
  savedContent: HealthOSTrustedContentItem[];
  searchQuery: string;
  setActiveFilters: (filters: HealthOSTrustedContentFilterKey[]) => void;
  setSearchQuery: (query: string) => void;
  sourceQualitySummary: HealthOSSourceQualitySummary[];
  refresh: () => Promise<void>;
};

export function useHealthOSTrustedContentData(): HealthOSTrustedContentData {
  const [activeFilters, setActiveFilters] = useState<
    HealthOSTrustedContentFilterKey[]
  >(["all"]);
  const [allContent, setAllContent] = useState<HealthOSTrustedContentItem[]>([]);
  const [error, setError] = useState<string>();
  const [loading, setLoading] = useState(true);
  const [needsReviewIds, setNeedsReviewIds] = useState<Set<string>>(
    () => new Set(),
  );
  const [savedState, setSavedState] = useState<SavedContentState>({});
  const [searchQuery, setSearchQuery] = useState("");

  const refresh = useCallback(async () => {
    try {
      setLoading(true);
      setError(undefined);
      const [sources, cards, reviewQueue, storedState] = await Promise.all([
        getTrustedSources(),
        getTrustedHealthContentCards(),
        getContentReviewQueue(),
        readSavedContentState(),
      ]);
      const sourceById = new Map(sources.map((source) => [source.id, source]));
      setSavedState(storedState);
      setNeedsReviewIds(new Set(reviewQueue.map((card) => card.id)));
      setAllContent(
        cards
          .filter((card) => card.status === "published")
          .map((card) =>
            normalizeTrustedContentCard(
              card,
              sourceById.get(card.sourceId),
              storedState[card.id],
            ),
          ),
      );
    } catch (currentError) {
      setError(
        currentError instanceof Error
          ? currentError.message
          : "Trusted content could not load right now.",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const filteredContent = useMemo(
    () =>
      filterTrustedContent({
        filters: activeFilters,
        items: allContent,
        query: searchQuery,
      }),
    [activeFilters, allContent, searchQuery],
  );
  const savedContent = useMemo(
    () => allContent.filter((item) => item.saved || item.readLater),
    [allContent],
  );
  const needsReviewContent = useMemo(
    () => allContent.filter((item) => needsReviewIds.has(item.id)),
    [allContent, needsReviewIds],
  );
  const sourceQualitySummary = useMemo(() => {
    const counts = new Map<string, number>();
    allContent.forEach((item) =>
      counts.set(
        item.source.sourceQuality,
        (counts.get(item.source.sourceQuality) ?? 0) + 1,
      ),
    );
    return Array.from(counts.entries()).map(([quality, total]) => ({
      label:
        HEALTHOS_SOURCE_QUALITY_LABELS[
          quality as keyof typeof HEALTHOS_SOURCE_QUALITY_LABELS
        ],
      quality: quality as HealthOSSourceQualitySummary["quality"],
      total,
    }));
  }, [allContent]);

  return {
    activeFilters,
    allContent,
    contentByCategory: groupByCategory(allContent),
    contentByRealm: groupByRealm(allContent),
    emptyState: searchQuery
      ? HEALTHOS_TRUSTED_CONTENT_EMPTY_STATES.search
      : HEALTHOS_TRUSTED_CONTENT_EMPTY_STATES.all,
    error,
    featuredContent: allContent[0],
    filteredContent,
    latestContent: [...allContent]
      .sort(
        (left, right) =>
          new Date(right.updatedAt ?? right.publishedAt ?? 0).getTime() -
          new Date(left.updatedAt ?? left.publishedAt ?? 0).getTime(),
      )
      .slice(0, 8),
    loading,
    needsReviewContent,
    savedContent,
    searchQuery,
    setActiveFilters,
    setSearchQuery,
    sourceQualitySummary,
    refresh,
  };
}

export async function saveTrustedContentState(
  state: SavedContentState,
) {
  await AsyncStorage.setItem(CONTENT_STATE_KEY, JSON.stringify(state));
}

async function readSavedContentState(): Promise<SavedContentState> {
  try {
    const stored = await AsyncStorage.getItem(CONTENT_STATE_KEY);
    const parsed = stored ? JSON.parse(stored) : {};
    return parsed && typeof parsed === "object"
      ? (parsed as SavedContentState)
      : {};
  } catch {
    return {};
  }
}

function groupByCategory(items: HealthOSTrustedContentItem[]) {
  return items.reduce<Record<string, HealthOSTrustedContentItem[]>>(
    (acc, item) => {
      item.categories.forEach((category) => {
        acc[category] = [...(acc[category] ?? []), item];
      });
      return acc;
    },
    {},
  );
}

function groupByRealm(items: HealthOSTrustedContentItem[]) {
  const realms: HealthOSTrustedContentRealm[] = [
    "home",
    "health",
    "nutrition",
    "medication",
    "supplements",
    "fitness",
    "pregnancy",
    "babyChild",
    "womensHealth",
    "records",
    "family",
    "calendar",
    "ai",
    "scan",
  ];
  return realms.reduce<Record<HealthOSTrustedContentRealm, HealthOSTrustedContentItem[]>>(
    (acc, realm) => {
      acc[realm] = contentByRealm(items, realm);
      return acc;
    },
    {} as Record<HealthOSTrustedContentRealm, HealthOSTrustedContentItem[]>,
  );
}
