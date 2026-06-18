import { Href, router } from "expo-router";

import {
  markDoseSkipped,
  markDoseTaken,
  snoozeDoseReminder,
} from "@/lib/medicationSupplementStorage";

import type { HealthOSMedicationDisplayItem, HealthOSMedicationKind } from "./HealthOSMedicationTypes";

type Options = {
  onOpenDetail: (item: HealthOSMedicationDisplayItem) => void;
  onOpenExtractionReview: () => void;
  onRefresh: () => Promise<void>;
  onToast: (message: string) => void;
};

export function useHealthOSMedicationActions({
  onOpenDetail,
  onOpenExtractionReview,
  onRefresh,
  onToast,
}: Options) {
  async function withRefresh(action: () => Promise<unknown>, message: string) {
    await action();
    await onRefresh();
    onToast(message);
  }

  return {
    addItem(kind: HealthOSMedicationKind) {
      router.push((kind === "medication" ? "/medication/add" : "/supplements/add") as Href);
    },
    addToCalendar() {
      router.push("/(tabs)/calendar" as Href);
    },
    askAI() {
      router.push("/ai" as Href);
    },
    importFromScan() {
      router.push("/(tabs)/scan" as Href);
    },
    logSideEffect() {
      onToast("Side-effect notes stay user-entered and should be reviewed with a healthcare professional.");
    },
    markSkipped(item: HealthOSMedicationDisplayItem) {
      void withRefresh(
        () => markDoseSkipped({ itemId: item.id, itemType: item.kind }),
        `${item.name} marked as skipped.`,
      );
    },
    markTaken(item: HealthOSMedicationDisplayItem) {
      void withRefresh(
        () => markDoseTaken({ itemId: item.id, itemType: item.kind }),
        `${item.name} marked as taken.`,
      );
    },
    manageSharing() {
      router.push("/settings/privacy-center" as Href);
    },
    openDetail(item: HealthOSMedicationDisplayItem) {
      onOpenDetail(item);
    },
    openExtractionReview() {
      onOpenExtractionReview();
    },
    openRecords() {
      router.push("/records" as Href);
    },
    scanLabel() {
      router.push("/(tabs)/scan" as Href);
    },
    saveReviewedExtraction() {
      onToast("Import preview is ready for review only. Nothing is saved until the user confirms.");
    },
    snooze(item: HealthOSMedicationDisplayItem) {
      void withRefresh(
        () => snoozeDoseReminder({ itemId: item.id, itemType: item.kind, notes: "Snoozed for 15 minutes." }),
        `${item.name} snoozed for 15 minutes.`,
      );
    },
  };
}
