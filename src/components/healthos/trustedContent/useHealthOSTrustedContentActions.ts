import { Alert, Linking } from "react-native";
import { Href, router } from "expo-router";

import type {
  HealthOSTrustedContentFilterKey,
  HealthOSTrustedContentItem,
  HealthOSTrustedContentRealm,
} from "@/features/trustedContent";
import { saveTrustedContentState } from "./useHealthOSTrustedContentData";

type Options = {
  allContent: HealthOSTrustedContentItem[];
  activeFilters: HealthOSTrustedContentFilterKey[];
  onRefresh: () => Promise<void>;
  setActiveFilters: (filters: HealthOSTrustedContentFilterKey[]) => void;
};

export function useHealthOSTrustedContentActions({
  activeFilters,
  allContent,
  onRefresh,
  setActiveFilters,
}: Options) {
  function openContent(item: HealthOSTrustedContentItem) {
    return item;
  }

  async function openSource(item: HealthOSTrustedContentItem) {
    if (!item.source.sourceUrl) {
      Alert.alert("Source unavailable", "Source link is not available.");
      return;
    }
    await Linking.openURL(item.source.sourceUrl);
  }

  async function saveContent(item: HealthOSTrustedContentItem) {
    await persistItemState(item.id, { saved: true });
    await onRefresh();
  }

  async function removeSavedContent(item: HealthOSTrustedContentItem) {
    await persistItemState(item.id, { readLater: false, saved: false });
    await onRefresh();
  }

  async function markRead(item: HealthOSTrustedContentItem) {
    await persistItemState(item.id, { readStatus: "read" });
    await onRefresh();
  }

  function askAIAboutContent(item: HealthOSTrustedContentItem) {
    router.push({
      pathname: "/ai",
      params: {
        sourceId: item.source.sourceId,
        sourceName: item.source.sourceName,
        title: item.title,
      },
    } as never);
  }

  function reportSourceIssue(item: HealthOSTrustedContentItem) {
    Alert.alert(
      "Source concern",
      `${item.source.sourceName} can be marked for review in a future content admin flow.`,
    );
  }

  function toggleFilter(filter: HealthOSTrustedContentFilterKey) {
    if (filter === "all") {
      setActiveFilters(["all"]);
      return;
    }
    const withoutAll = activeFilters.filter((item) => item !== "all");
    setActiveFilters(
      withoutAll.includes(filter)
        ? withoutAll.filter((item) => item !== filter)
        : [...withoutAll, filter],
    );
  }

  function clearFilters() {
    setActiveFilters(["all"]);
  }

  function openRealm(realm: HealthOSTrustedContentRealm) {
    const routes: Partial<Record<HealthOSTrustedContentRealm, Href>> = {
      ai: "/ai" as Href,
      babyChild: "/baby-child" as Href,
      calendar: "/health-calendar" as Href,
      family: "/(tabs)/circle" as Href,
      fitness: "/(tabs)/fitness" as Href,
      health: "/(tabs)/health" as Href,
      medication: "/medication" as Href,
      nutrition: "/(tabs)/food" as Href,
      pregnancy: "/pregnancy" as Href,
      records: "/records" as Href,
      scan: "/(tabs)/scan" as Href,
      supplements: "/supplements" as Href,
      womensHealth: "/cycle" as Href,
    };
    const route = routes[realm];
    if (route) router.push(route);
  }

  async function persistItemState(
    id: string,
    partial: Partial<Pick<
      HealthOSTrustedContentItem,
      "readLater" | "readStatus" | "saved"
    >>,
  ) {
    const state = Object.fromEntries(
      allContent.map((item) => [
        item.id,
        {
          readLater: item.readLater,
          readStatus: item.readStatus,
          saved: item.saved,
        },
      ]),
    );
    await saveTrustedContentState({
      ...state,
      [id]: {
        ...(state[id] ?? {}),
        ...partial,
      },
    });
  }

  return {
    askAIAboutContent,
    clearFilters,
    markRead,
    openContent,
    openRealm,
    openSource,
    removeSavedContent,
    reportSourceIssue,
    saveContent,
    toggleFilter,
  };
}
