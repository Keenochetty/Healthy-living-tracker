import { StyleSheet, Text, useColorScheme, View } from "react-native";

import { HealthOSCard } from "@/components/healthos/HealthOSCard";
import { HealthOSProgressRingPlaceholder } from "@/components/healthos/HealthOSProgressRingPlaceholder";
import {
  getHealthOSPalette,
  healthOSSpacing,
  healthOSTypography,
  type HealthOSColorMode,
} from "@/theme/healthos";

import type { HealthOSMedicationData } from "./HealthOSMedicationTypes";
import { MedicationAction, MedicationText, medicationSharedStyles } from "./HealthOSMedicationShared";

type Props = {
  onAddReminder: () => void;
  summary: HealthOSMedicationData["todaySummary"];
  nextReminder?: HealthOSMedicationData["nextReminder"];
};

export function HealthOSMedicationTodayHero({ nextReminder, onAddReminder, summary }: Props) {
  const mode: HealthOSColorMode = useColorScheme() === "dark" ? "dark" : "light";
  const palette = getHealthOSPalette(mode);
  return (
    <HealthOSCard title="Today" subtitle="Only confirmed schedules are shown here.">
      <View style={styles.hero}>
        <HealthOSProgressRingPlaceholder
          label={`${summary.takenCount}/${summary.totalCount}`}
          max={Math.max(summary.totalCount, 1)}
          sublabel="taken"
          value={summary.takenCount}
        />
        <View style={styles.copy}>
          <Text style={[healthOSTypography.sectionTitle, { color: palette.inkText }]}>
            {summary.dueCount ? `${summary.dueCount} due now` : "No due reminders"}
          </Text>
          <MedicationText muted>
            {nextReminder
              ? `Next: ${nextReminder.itemName}${nextReminder.scheduledAt ? ` at ${formatTime(nextReminder.scheduledAt)}` : ""}`
              : "Add confirmed schedules to see your next reminder."}
          </MedicationText>
          <View style={medicationSharedStyles.actions}>
            <MedicationAction label="Add reminder" onPress={onAddReminder} variant="realm" />
            <MedicationAction label={`${summary.missedCount} missed`} variant={summary.missedCount ? "warning" : "default"} />
          </View>
        </View>
      </View>
    </HealthOSCard>
  );
}

function formatTime(value: string) {
  return new Intl.DateTimeFormat(undefined, { hour: "2-digit", minute: "2-digit" }).format(new Date(value));
}

const styles = StyleSheet.create({
  copy: {
    flex: 1,
    gap: healthOSSpacing.sm,
  },
  hero: {
    alignItems: "center",
    flexDirection: "row",
    gap: healthOSSpacing.lg,
  },
});
