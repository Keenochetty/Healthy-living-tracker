import { StyleSheet, Text, useColorScheme, View } from "react-native";

import { HealthOSCard } from "@/components/healthos/HealthOSCard";
import { HealthOSPill } from "@/components/healthos/HealthOSPill";
import { getHealthOSPalette, healthOSSpacing, healthOSTypography, type HealthOSColorMode } from "@/theme/healthos";

type Props = {
  onLearnFirst: () => void;
  onOpenPregnancy: () => void;
  onStartPregnancyMode: () => void;
  status: string;
};

export function HealthOSPregnancyTransitionCard({
  onLearnFirst,
  onOpenPregnancy,
  onStartPregnancyMode,
  status,
}: Props) {
  const mode: HealthOSColorMode = useColorScheme() === "dark" ? "dark" : "light";
  const palette = getHealthOSPalette(mode);

  return (
    <HealthOSCard title="Starting a pregnancy journey?" variant="elevated">
      <Text style={[healthOSTypography.bodySmall, { color: palette.softText }]}>
        Turn your cycle tracker into a pregnancy timeline with due-date progress, milestones, checklists, and family updates.
      </Text>
      <Text style={[healthOSTypography.caption, styles.status, { color: palette.softText }]}>
        {status}
      </Text>
      <View style={styles.actions}>
        <HealthOSPill label="Start pregnancy mode" onPress={onStartPregnancyMode} variant="realm" realmColor={palette.pregnancy} />
        <HealthOSPill label="Learn first" onPress={onLearnFirst} variant="glass" />
        <HealthOSPill label="Open Pregnancy" onPress={onOpenPregnancy} variant="glass" />
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
  status: {
    marginTop: healthOSSpacing.sm,
  },
});
