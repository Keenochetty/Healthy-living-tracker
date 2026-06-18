import { ScrollView, StyleSheet } from "react-native";

import { HealthOSCard } from "@/components/healthos/HealthOSCard";
import { HealthOSPill } from "@/components/healthos/HealthOSPill";
import { healthOSSpacing } from "@/theme/healthos";

import type { HealthOSPregnancyLogType } from "./HealthOSPregnancyTypes";

type Props = {
  onAddAppointment: () => void;
  onAddSupplement: () => void;
  onAskAI: () => void;
  onOpenChecklist: () => void;
  onOpenLog: (type: HealthOSPregnancyLogType) => void;
  onUpdateFamily: () => void;
  onUploadRecord: () => void;
};

export function HealthOSPregnancyQuickActions({
  onAddAppointment,
  onAddSupplement,
  onAskAI,
  onOpenChecklist,
  onOpenLog,
  onUpdateFamily,
  onUploadRecord,
}: Props) {
  return (
    <HealthOSCard title="Quick actions" variant="compact">
      <ScrollView
        contentContainerStyle={styles.row}
        horizontal
        showsHorizontalScrollIndicator={false}
      >
        <HealthOSPill label="Log symptom" onPress={() => onOpenLog("symptom")} variant="realm" />
        <HealthOSPill label="Log mood" onPress={() => onOpenLog("mood")} variant="realm" />
        <HealthOSPill label="Log pain" onPress={() => onOpenLog("pain")} variant="realm" />
        <HealthOSPill label="Add appointment" onPress={onAddAppointment} variant="glass" />
        <HealthOSPill label="Add supplement" onPress={onAddSupplement} variant="glass" />
        <HealthOSPill label="Upload record" onPress={onUploadRecord} variant="glass" />
        <HealthOSPill label="Hospital checklist" onPress={onOpenChecklist} variant="glass" />
        <HealthOSPill label="Update family" onPress={onUpdateFamily} variant="glass" />
        <HealthOSPill label="Ask AI" onPress={onAskAI} variant="ai" />
      </ScrollView>
    </HealthOSCard>
  );
}

const styles = StyleSheet.create({
  row: {
    gap: healthOSSpacing.sm,
    paddingRight: healthOSSpacing.lg,
  },
});
