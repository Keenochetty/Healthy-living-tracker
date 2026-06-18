import { Href, router } from "expo-router";
import { Linking } from "react-native";

import type { HealthOSRecordDisplay, HealthOSRecordLinkedRealm } from "./HealthOSRecordsTypes";

type Options = {
  onOpenDetail: (record: HealthOSRecordDisplay) => void;
  onOpenExtractionReview: (record: HealthOSRecordDisplay | null) => void;
  onOpenUpload: () => void;
  onToast: (message: string) => void;
};

export function useHealthOSRecordsActions({
  onOpenDetail,
  onOpenExtractionReview,
  onOpenUpload,
  onToast,
}: Options) {
  return {
    addManualNote() {
      onOpenUpload();
    },
    addToEmergencyPacket() {
      onToast("Emergency packet is foundation only. The user must choose records before anything is included.");
    },
    clearFilters() {},
    createEmergencyPacket() {
      onToast("Emergency packet setup is foundation only in this phase.");
    },
    deleteRecord() {
      onToast("Delete requires a confirmation flow and is not exposed from the HealthOS overview yet.");
    },
    extractWithAI(record?: HealthOSRecordDisplay | null) {
      onOpenExtractionReview(record ?? null);
    },
    importFromAI() {
      router.push("/ai" as Href);
    },
    linkRecord() {
      onToast("Record linking is foundation only unless a saved relationship already exists.");
    },
    manageSharing() {
      router.push("/settings/privacy-center" as Href);
    },
    moveCategory() {
      onToast("Move category will use existing record update flow in a later phase.");
    },
    openArticleSource(sourceUrl: string) {
      void Linking.openURL(sourceUrl);
    },
    openFile(record: HealthOSRecordDisplay) {
      onToast(record.original.fileUrl ? "File opening is deferred to the secure file viewer." : "No original file is linked to this record.");
    },
    openLinkedRealm(realm: HealthOSRecordLinkedRealm) {
      const routes: Record<HealthOSRecordLinkedRealm, Href> = {
        babyChild: "/baby-child",
        calendar: "/(tabs)/calendar",
        family: "/(tabs)/circle",
        fitness: "/(tabs)/fitness",
        general: "/(tabs)/health",
        health: "/(tabs)/health",
        medication: "/medication",
        nutrition: "/(tabs)/food",
        pregnancy: "/pregnancy",
        supplements: "/supplements",
      };
      router.push(routes[realm]);
    },
    openRecord(record: HealthOSRecordDisplay) {
      onOpenDetail(record);
    },
    removeFromEmergencyPacket() {
      onToast("No emergency packet item was removed. Packet membership is not persisted yet.");
    },
    renameRecord() {
      onToast("Rename remains in the existing records edit flow for a later phase.");
    },
    reviewExtraction(record?: HealthOSRecordDisplay | null) {
      onOpenExtractionReview(record ?? null);
    },
    saveReviewedExtraction() {
      onToast("Extraction review creates a preview only. Nothing is saved without confirmation.");
    },
    scanDocument() {
      router.push("/(tabs)/scan" as Href);
    },
    shareRecord() {
      onToast("Sharing requires explicit permissions and is not automatic.");
    },
    uploadFile() {
      onOpenUpload();
    },
    uploadPhoto() {
      onOpenUpload();
    },
  };
}
