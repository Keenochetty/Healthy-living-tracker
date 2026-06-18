import { Text, View, StyleSheet } from "react-native";
import { router } from "expo-router";

import { AppIcon } from "@/components/ui/AppIcon";
import { HealthOSPill } from "@/components/healthos/HealthOSPill";
import {
  getHealthOSPalette,
  healthOSSpacing,
  healthOSTypography,
} from "@/theme/healthos";
import { useColorScheme } from "react-native";

import { HealthOSHealthSectionCard } from "./HealthOSHealthSectionCard";
import type { HealthOSHealthSectionMeta } from "./HealthOSHealthTypes";

type WomenSummary = {
  contraceptionActiveCount?: number;
  cycleDay?: number;
  todaySymptomsCount?: number;
};

type HealthOSWomenHealthSectionProps = {
  onLongPress: () => void;
  section: HealthOSHealthSectionMeta;
  summary: WomenSummary | null;
};

export function HealthOSWomenHealthSection({
  onLongPress,
  section,
  summary,
}: HealthOSWomenHealthSectionProps) {
  const palette = getHealthOSPalette(useColorScheme() === "dark" ? "dark" : "light");
  const detail =
    summary && (summary.cycleDay || summary.todaySymptomsCount || summary.contraceptionActiveCount)
      ? "Private tracking is active for this profile."
      : "Private cycle, symptom, mood, and contraception tools.";

  return (
    <HealthOSHealthSectionCard
      icon={<AppIcon decorative name="pregnancy_cycle" size={20} variant="private" />}
      onLongPress={onLongPress}
      onPress={() => router.push("/cycle")}
      privacyLabel="Private"
      section={section}
      variant="glass"
    >
      <Text style={[healthOSTypography.bodySmall, { color: palette.softText }]}>
        {detail}
      </Text>
      <View style={styles.actions}>
        <HealthOSPill label="Cycle tracker" onPress={() => router.push("/cycle")} size="sm" variant="realm" />
        <HealthOSPill label="Learn" onPress={() => router.push("/trusted-content")} size="sm" variant="glass" />
      </View>
    </HealthOSHealthSectionCard>
  );
}

const styles = StyleSheet.create({
  actions: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: healthOSSpacing.sm,
  },
});

