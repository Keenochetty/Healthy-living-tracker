import { StyleSheet, Text, useColorScheme, View } from "react-native";

import { HealthOSCard } from "@/components/healthos/HealthOSCard";
import { HealthOSPill } from "@/components/healthos/HealthOSPill";
import { getHealthOSPalette, healthOSSpacing, healthOSTypography, type HealthOSColorMode } from "@/theme/healthos";

import type { HealthOSContraceptionSummary } from "./HealthOSWomenHealthTypes";

type Props = {
  onAdd: () => void;
  onLearn: () => void;
  onLogMissed: () => void;
  onSetReminder: () => void;
  summary: HealthOSContraceptionSummary;
};

export function HealthOSContraceptionSection({
  onAdd,
  onLearn,
  onLogMissed,
  onSetReminder,
  summary,
}: Props) {
  const mode: HealthOSColorMode = useColorScheme() === "dark" ? "dark" : "light";
  const palette = getHealthOSPalette(mode);

  return (
    <HealthOSCard title="Contraception" variant="compact">
      <Text style={[healthOSTypography.bodySmall, { color: palette.softText }]}>
        {summary.status}
      </Text>
      {summary.nextReminder ? (
        <Text style={[healthOSTypography.caption, styles.meta, { color: palette.softText }]}>
          Next reminder: {summary.nextReminder}
        </Text>
      ) : null}
      {summary.cautionCount ? <HealthOSPill label={`${summary.cautionCount} timing note(s)`} size="sm" variant="warning" /> : null}
      <Text style={[healthOSTypography.caption, styles.meta, { color: palette.softText }]}>
        Confirm contraception questions with a healthcare professional.
      </Text>
      <View style={styles.actions}>
        <HealthOSPill label="Add contraception" onPress={onAdd} variant="glass" />
        <HealthOSPill label="Set reminder" onPress={onSetReminder} variant="glass" />
        <HealthOSPill label="Log missed" onPress={onLogMissed} variant="warning" />
        <HealthOSPill label="Learn" onPress={onLearn} variant="glass" />
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
  meta: {
    marginTop: healthOSSpacing.sm,
  },
});
