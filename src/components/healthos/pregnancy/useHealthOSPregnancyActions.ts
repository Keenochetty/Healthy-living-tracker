import { Linking } from "react-native";
import { type Href, router } from "expo-router";

import {
  createPregnancySymptomLog,
  enablePregnancyMode,
} from "@/lib/pregnancyStorage";
import type { PregnancyProfile } from "@/types/pregnancy";

import type {
  HealthOSPregnancyLogType,
  HealthOSPregnancyQuickLogDraft,
  HealthOSPregnancySetupDraft,
} from "./HealthOSPregnancyTypes";

export function useHealthOSPregnancyActions({
  onOpenQuickLog,
  onRefresh,
}: {
  onOpenQuickLog?: (type: HealthOSPregnancyLogType) => void;
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
    addReminder() {
      go("/reminders" as Href);
    },
    askAI() {
      go("/ai" as Href);
    },
    createBabyProfile() {
      go("/baby-child" as Href);
    },
    inviteCareProfessional() {
      go("/settings/privacy-center" as Href);
    },
    manageCareTeamAccess() {
      go("/settings/privacy-center" as Href);
    },
    managePrivacy() {
      go("/settings/privacy-center" as Href);
    },
    openArticleSource(url: string) {
      void Linking.openURL(url);
    },
    openBabyProfile() {
      go("/baby-child" as Href);
    },
    openCalendar() {
      go("/(tabs)/calendar");
    },
    openMedication() {
      go("/medication" as Href);
    },
    openQuickLog(type: HealthOSPregnancyLogType) {
      onOpenQuickLog?.(type);
    },
    openSupplements() {
      go("/supplements" as Href);
    },
    savePregnancySetup: async (draft: HealthOSPregnancySetupDraft) => {
      const input: Partial<PregnancyProfile> = {
        activatedAt: new Date().toISOString(),
        dateBasis: draft.estimatedDueDate
          ? "estimated_due_date"
          : draft.lastMenstrualPeriodDate
            ? "last_menstrual_period"
            : "manual",
        estimatedDueDate: clean(draft.estimatedDueDate),
        lastMenstrualPeriodDate: clean(draft.lastMenstrualPeriodDate),
        pregnancyType: "prefer_not_to_say",
        privacy: "private",
        status: "active",
      };
      await enablePregnancyMode(input);
      await refresh();
      return "Pregnancy mode started privately.";
    },
    saveQuickLog: async (draft: HealthOSPregnancyQuickLogDraft) => {
      if (draft.logType === "symptom" || draft.logType === "pain" || draft.logType === "mood") {
        const severityScore = draft.severityScore;
        await createPregnancySymptomLog({
          loggedAt: new Date().toISOString(),
          notes: clean(draft.note),
          severity:
            severityScore === undefined
              ? "mild"
              : severityScore >= 7
                ? "severe"
                : severityScore >= 4
                  ? "moderate"
                  : "mild",
          severityScore,
          symptomKey: makeSymptomKey(draft),
        });
        await refresh();
        return "Pregnancy log saved privately.";
      }
      return "This log type is UI foundation only until a safe pregnancy storage model is added.";
    },
    scanScript() {
      go("/(tabs)/scan");
    },
    shareFamilyUpdate() {
      go("/(tabs)/circle" as Href);
    },
    startPregnancyMode() {
      onOpenQuickLog?.("note");
    },
    toggleChecklistItem(_id?: string) {
      return "Checklist completion is UI-only in this phase and is not persisted.";
    },
    updateBabyGenderLater() {
      return "Unknown / update later is supported in the baby profile foundation.";
    },
    uploadRecord() {
      go("/records" as Href);
    },
  };
}

function makeSymptomKey(draft: HealthOSPregnancyQuickLogDraft) {
  if (draft.logType === "mood") return `Mood: ${draft.mood ?? "noted"}`;
  if (draft.logType === "pain") return `Pain: ${draft.painArea ?? draft.symptom ?? "noted"}`;
  return draft.symptom ?? "Custom note";
}

function clean(value?: string) {
  return value?.trim() || undefined;
}
