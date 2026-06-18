import { ScrollView, StyleSheet } from "react-native";

import { HealthOSCard } from "@/components/healthos/HealthOSCard";
import { HealthOSPill } from "@/components/healthos/HealthOSPill";
import { healthOSSpacing } from "@/theme/healthos";

import type { HealthOSChildCareLogType } from "./HealthOSBabyChildTypes";

type Props = {
  onOpenLog: (type: HealthOSChildCareLogType) => void;
  onScanRecord: () => void;
};

const ACTIONS: Array<{ key: HealthOSChildCareLogType; label: string }> = [
  { key: "feed", label: "Feed" },
  { key: "sleep", label: "Sleep" },
  { key: "diaper", label: "Diaper" },
  { key: "medicine", label: "Medicine" },
  { key: "symptom", label: "Symptom" },
  { key: "temperature", label: "Temperature" },
  { key: "milestone", label: "Milestone" },
  { key: "solidFood", label: "Solid food" },
  { key: "note", label: "Note" },
  { key: "appointment", label: "Appointment" },
];

export function HealthOSBabyChildQuickActions({ onOpenLog, onScanRecord }: Props) {
  return (
    <HealthOSCard title="Quick actions" variant="compact">
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.row}>
        {ACTIONS.map((action) => (
          <HealthOSPill key={action.key} label={action.label} onPress={() => onOpenLog(action.key)} variant="realm" />
        ))}
        <HealthOSPill label="Scan record" onPress={onScanRecord} variant="ai" />
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
