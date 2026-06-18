import { StyleSheet, Text, useColorScheme, View } from "react-native";

import { HealthOSCard } from "@/components/healthos/HealthOSCard";
import { HealthOSProgressRingPlaceholder } from "@/components/healthos/HealthOSProgressRingPlaceholder";
import {
  getHealthOSPalette,
  healthOSSpacing,
  healthOSTypography,
  type HealthOSColorMode,
} from "@/theme/healthos";

type HealthOSHealthHeroProps = {
  attentionCount: number;
  totalSectionCount: number;
  visibleSectionCount: number;
};

export function HealthOSHealthHero({
  attentionCount,
  totalSectionCount,
  visibleSectionCount,
}: HealthOSHealthHeroProps) {
  const mode: HealthOSColorMode = useColorScheme() === "dark" ? "dark" : "light";
  const palette = getHealthOSPalette(mode);
  const subtitle =
    attentionCount > 0
      ? `${attentionCount} area${attentionCount === 1 ? "" : "s"} may need attention today.`
      : visibleSectionCount > 0
        ? `${visibleSectionCount} sections active.`
        : "Choose what you want to track first.";

  return (
    <HealthOSCard variant="glass">
      <View style={styles.row}>
        <View style={styles.copy}>
          <Text style={[healthOSTypography.screenTitle, { color: palette.inkText }]}>
            Health
          </Text>
          <Text style={[healthOSTypography.body, { color: palette.softText }]}>
            {subtitle}
          </Text>
          <Text style={[healthOSTypography.caption, { color: palette.softText }]}>
            Your modular control center for health realms.
          </Text>
        </View>
        <HealthOSProgressRingPlaceholder
          label="Hub"
          max={Math.max(totalSectionCount, 1)}
          size={76}
          sublabel={`${visibleSectionCount}/${totalSectionCount}`}
          value={visibleSectionCount}
          variant="wellness"
        />
      </View>
    </HealthOSCard>
  );
}

const styles = StyleSheet.create({
  copy: {
    flex: 1,
    gap: healthOSSpacing.xs,
  },
  row: {
    alignItems: "center",
    flexDirection: "row",
    gap: healthOSSpacing.md,
  },
});
