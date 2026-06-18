import { StyleSheet, Text, useColorScheme, View } from "react-native";

import { HealthOSCard } from "@/components/healthos/HealthOSCard";
import { HealthOSPill } from "@/components/healthos/HealthOSPill";
import { getHealthOSPalette, healthOSSpacing, healthOSTypography, type HealthOSColorMode } from "@/theme/healthos";

import type { HealthOSMoodSymptomSummary, HealthOSWomenLogType } from "./HealthOSWomenHealthTypes";

type Props = {
  onOpenQuickLog: (type: HealthOSWomenLogType) => void;
  summary: HealthOSMoodSymptomSummary;
};

export function HealthOSMoodSymptomSection({ onOpenQuickLog, summary }: Props) {
  const mode: HealthOSColorMode = useColorScheme() === "dark" ? "dark" : "light";
  const palette = getHealthOSPalette(mode);

  return (
    <HealthOSCard title="Mood and symptoms" subtitle="Private summary" variant="compact">
      <Text style={[healthOSTypography.bodySmall, { color: palette.softText }]}>
        {summary.status}
      </Text>
      <View style={styles.chips}>
        {summary.latestMood?.mood ? <HealthOSPill label={`Mood: ${summary.latestMood.mood}`} size="sm" variant="glass" /> : null}
        {summary.recentSymptoms.map((symptom) => (
          <HealthOSPill key={symptom.id} label={symptom.symptom} size="sm" variant="warning" />
        ))}
      </View>
      <View style={styles.actions}>
        <HealthOSPill label="Add mood" onPress={() => onOpenQuickLog("mood")} variant="glass" />
        <HealthOSPill label="Add symptom" onPress={() => onOpenQuickLog("symptom")} variant="glass" />
      </View>
    </HealthOSCard>
  );
}

const styles = StyleSheet.create({
  actions: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: healthOSSpacing.sm,
    marginTop: healthOSSpacing.md,
  },
  chips: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: healthOSSpacing.sm,
    marginTop: healthOSSpacing.md,
  },
});
