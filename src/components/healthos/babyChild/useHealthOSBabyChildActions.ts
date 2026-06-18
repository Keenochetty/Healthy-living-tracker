import { Linking } from "react-native";
import { type Href, router } from "expo-router";

import {
  createBabyChildProfile,
  createBabyDiaperLog,
  createBabyFeedingLog,
  createBabyMedicineLog,
  createBabyMilestoneLog,
  createBabySleepLog,
  createBabySolidFoodLog,
  transitionPregnancyToBabyProfile,
} from "@/lib/babyChildStorage";

import type {
  HealthOSBabyChildQuickLogDraft,
  HealthOSChildCareLogType,
  HealthOSChildSetupDraft,
} from "./HealthOSBabyChildTypes";

export function useHealthOSBabyChildActions({
  activeChildId,
  onOpenQuickLog,
  onRefresh,
}: {
  activeChildId?: string;
  onOpenQuickLog?: (type: HealthOSChildCareLogType) => void;
  onRefresh?: () => Promise<void>;
} = {}) {
  function go(route: Href) {
    router.push(route);
  }

  async function refresh() {
    await onRefresh?.();
  }

  return {
    addAppointment() {
      go("/(tabs)/calendar");
    },
    addMedication() {
      go("/medication" as Href);
    },
    askAI() {
      go("/ai" as Href);
    },
    contactCaregiver() {
      go("/(tabs)/circle" as Href);
    },
    createBabyFromPregnancy() {
      go("/pregnancy" as Href);
    },
    createProfile: async (draft: HealthOSChildSetupDraft) => {
      if (!draft.displayName.trim()) return "Add a name or nickname first.";
      await createBabyChildProfile({
        dateOfBirth: draft.dateOfBirth || new Date().toISOString().slice(0, 10),
        displayName: draft.displayName.trim(),
        privacy: "private",
      });
      await refresh();
      return "Baby/child profile created privately.";
    },
    createProfileFromPregnancy: async (draft: HealthOSChildSetupDraft) => {
      if (!draft.displayName.trim()) return "Add a name or nickname first.";
      await transitionPregnancyToBabyProfile({
        birthDate: draft.dateOfBirth || new Date().toISOString().slice(0, 10),
        displayName: draft.displayName.trim(),
        includeDueDate: true,
      });
      await refresh();
      return "Baby profile created from pregnancy privately.";
    },
    manageParentControls() {
      go("/settings/privacy-center" as Href);
    },
    manageProfile() {
      go("/profile" as Href);
    },
    manageSharing() {
      go("/settings/privacy-center" as Href);
    },
    openArticleSource(url: string) {
      if (url) void Linking.openURL(url);
    },
    openCalendar() {
      go("/(tabs)/calendar");
    },
    openFamily() {
      go("/(tabs)/circle" as Href);
    },
    openMedication() {
      go("/medication" as Href);
    },
    openNutrition() {
      go("/(tabs)/food");
    },
    openQuickLog(type: HealthOSChildCareLogType) {
      onOpenQuickLog?.(type);
    },
    openRecords() {
      go("/records" as Href);
    },
    saveQuickLog: async (draft: HealthOSBabyChildQuickLogDraft) => {
      const childProfileId = draft.childProfileId ?? activeChildId;
      if (!childProfileId) return "Create a baby or child profile before saving logs.";
      if (draft.logType === "feed") {
        await createBabyFeedingLog({
          amountMl: draft.amountMl,
          childProfileId,
          feedingType: "bottle_formula",
          notes: draft.note,
        });
        await refresh();
        return "Feed saved privately.";
      }
      if (draft.logType === "sleep") {
        await createBabySleepLog({
          childProfileId,
          endedAt: draft.sleepEnd,
          notes: draft.note,
          sleepType: "unknown",
          startedAt: draft.sleepStart,
        });
        await refresh();
        return "Sleep log saved privately.";
      }
      if (draft.logType === "diaper") {
        await createBabyDiaperLog({
          childProfileId,
          diaperType: draft.diaperType === "both" ? "mixed" : draft.diaperType === "unknown" ? "other" : draft.diaperType ?? "wet",
          notes: draft.note,
        });
        await refresh();
        return "Diaper log saved privately.";
      }
      if (draft.logType === "medicine") {
        await createBabyMedicineLog({
          childProfileId,
          loggedAt: new Date().toISOString(),
          medicineName: draft.medicineName || "Medicine note",
          notes: draft.note,
          status: "noted",
        });
        await refresh();
        return "Medicine note saved privately.";
      }
      if (draft.logType === "milestone") {
        await createBabyMilestoneLog({
          category: "custom",
          childProfileId,
          notes: draft.note,
          observedDate: new Date().toISOString(),
          status: "observed",
          title: draft.note || "Milestone note",
        });
        await refresh();
        return "Milestone saved privately.";
      }
      if (draft.logType === "solidFood") {
        await createBabySolidFoodLog({
          childProfileId,
          foodName: draft.foodName || "Food note",
          likedStatus: "unknown",
          notes: draft.note,
          triedAt: new Date().toISOString(),
        });
        await refresh();
        return "Solid food log saved privately.";
      }
      return "This log type is UI foundation only until a safe child care storage model is added.";
    },
    scanRecord() {
      go("/(tabs)/scan");
    },
    scanScript() {
      go("/(tabs)/scan");
    },
    selectProfile(_id: string) {
      return undefined;
    },
    uploadRecord() {
      go("/records" as Href);
    },
  };
}
