import { Linking } from "react-native";
import { type Href, router } from "expo-router";

import {
  createContraceptionLog,
  createMoodEnergyLog,
  createPeriodLog,
  createSymptomLog,
} from "@/lib/womensHealthStorage";

import type { HealthOSWomenLogType, HealthOSPeriodFlow } from "./HealthOSWomenHealthTypes";

export type HealthOSWomenQuickLogDraft = {
  contraceptionStatus?: "taken" | "missed" | "side_effect";
  flow?: HealthOSPeriodFlow;
  mood?: string;
  note?: string;
  painLevel?: number;
  symptom?: string;
  type: HealthOSWomenLogType;
};

export function useHealthOSWomenHealthActions({
  onOpenQuickLog,
}: {
  onOpenQuickLog?: (type: HealthOSWomenLogType) => void;
} = {}) {
  function go(route: Href) {
    router.push(route);
  }

  return {
    askAI() {
      go("/ai" as Href);
    },
    manageSharing() {
      go("/settings/privacy-center" as Href);
    },
    openArticleSource(url: string) {
      void Linking.openURL(url);
    },
    openCalendar() {
      go("/(tabs)/calendar");
    },
    openContraception() {
      onOpenQuickLog?.("contraception");
    },
    openPatternDetails() {
      go("/cycle" as Href);
    },
    openPregnancy() {
      go("/pregnancy" as Href);
    },
    openPrivacy() {
      go("/settings/privacy-center" as Href);
    },
    openQuickLog(type: HealthOSWomenLogType) {
      onOpenQuickLog?.(type);
    },
    async saveQuickLog(draft: HealthOSWomenQuickLogDraft) {
      const today = new Date().toISOString().slice(0, 10);
      if (draft.type === "period") {
        await createPeriodLog({
          crampsLevel: draft.painLevel,
          date: today,
          flowLevel: draft.flow ?? "medium",
          notes: draft.note,
          painLevel: draft.painLevel,
        });
        return "Period log saved privately.";
      }
      if (draft.type === "symptom") {
        await createSymptomLog({
          date: today,
          notes: draft.note,
          severity: "mild",
          symptom: draft.symptom ?? "Cramps",
        });
        return "Symptom log saved privately.";
      }
      if (draft.type === "mood") {
        await createMoodEnergyLog({
          date: today,
          mood: draft.mood ?? "Calm",
          notes: draft.note,
        });
        return "Mood log saved privately.";
      }
      if (draft.type === "contraception") {
        await createContraceptionLog({
          eventAt: new Date().toISOString(),
          eventType: draft.contraceptionStatus === "missed" ? "missed" : "user_noted",
          notes: draft.note,
        });
        return "Contraception note saved privately.";
      }
      return "This log type is UI foundation only until a safe storage model is added.";
    },
    setContraceptionReminder() {
      onOpenQuickLog?.("contraception");
    },
    startPregnancyMode() {
      go("/pregnancy" as Href);
    },
  };
}
