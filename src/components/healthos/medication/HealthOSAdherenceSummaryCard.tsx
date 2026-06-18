import { StyleSheet, Text, useColorScheme, View } from "react-native";

import { HealthOSCard } from "@/components/healthos/HealthOSCard";
import {
  getHealthOSPalette,
  healthOSSpacing,
  healthOSTypography,
  type HealthOSColorMode,
} from "@/theme/healthos";

import type { HealthOSMedicationData } from "./HealthOSMedicationTypes";
import { MedicationText } from "./HealthOSMedicationShared";

type Props = {
  adherence: HealthOSMedicationData["adherence"];
};

export function HealthOSAdherenceSummaryCard({ adherence }: Props) {
  const mode: HealthOSColorMode = useColorScheme() === "dark" ? "dark" : "light";
  const palette = getHealthOSPalette(mode);
  return (
    <HealthOSCard title="Adherence summary" subtitle="Based on saved dose logs.">
      <View style={styles.stats}>
        <Stat label="Medication" value={formatAdherence(adherence.medication)} color={palette.medication} />
        <Stat label="Supplements" value={formatAdherence(adherence.supplement)} color={palette.nutrition} />
      </View>
      <MedicationText muted>Skipped, missed, and snoozed entries are organization signals, not medical advice.</MedicationText>
    </HealthOSCard>
  );
}

function Stat({ color, label, value }: { color: string; label: string; value: string }) {
  return (
    <View style={styles.stat}>
      <Text style={[healthOSTypography.statNumber, { color }]}>{value}</Text>
      <Text style={[healthOSTypography.caption, { color }]}>{label}</Text>
    </View>
  );
}

function formatAdherence(value: HealthOSMedicationData["adherence"]["medication"]) {
  if (!value.total) return "0%";
  return `${Math.round((value.taken / value.total) * 100)}%`;
}

const styles = StyleSheet.create({
  stat: {
    flex: 1,
    gap: healthOSSpacing.xxs,
  },
  stats: {
    flexDirection: "row",
    gap: healthOSSpacing.lg,
    marginBottom: healthOSSpacing.md,
  },
});
