import { StyleSheet, Text, useColorScheme, View } from "react-native";

import { HealthOSProgressRingPlaceholder } from "@/components/healthos/HealthOSProgressRingPlaceholder";
import {
  getHealthOSPalette,
  healthOSSpacing,
  healthOSTypography,
  type HealthOSColorMode,
} from "@/theme/healthos";

type HealthOSHomeHeroProps = {
  displayName?: string | null;
  attentionCount?: number;
};

export function HealthOSHomeHero({
  attentionCount = 0,
  displayName,
}: HealthOSHomeHeroProps) {
  const mode: HealthOSColorMode = useColorScheme() === "dark" ? "dark" : "light";
  const palette = getHealthOSPalette(mode);
  const greeting = `Good ${dayPart()}${displayName ? `, ${displayName}` : ""}`;
  const status =
    attentionCount > 0
      ? `${attentionCount} ${attentionCount === 1 ? "thing needs" : "things need"} attention today`
      : "Your day is clear";

  return (
    <View
      accessibilityLabel={`${greeting}. ${formatLongDate()}. ${status}.`}
      style={styles.container}
    >
      <View style={styles.copy}>
        <Text style={[healthOSTypography.screenTitle, { color: palette.inkText }]}>
          {greeting}
        </Text>
        <Text style={[healthOSTypography.bodySmall, { color: palette.softText }]}>
          {formatLongDate()} · {status}
        </Text>
      </View>
      <HealthOSProgressRingPlaceholder
        label="Today"
        max={1}
        size={64}
        sublabel={attentionCount > 0 ? "Open" : "Clear"}
        value={attentionCount > 0 ? 0.35 : 1}
      />
    </View>
  );
}

function dayPart() {
  const hour = new Date().getHours();
  if (hour < 12) return "morning";
  if (hour < 18) return "afternoon";
  return "evening";
}

function formatLongDate() {
  return new Intl.DateTimeFormat(undefined, {
    day: "numeric",
    month: "long",
    weekday: "long",
  }).format(new Date());
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    flexDirection: "row",
    gap: healthOSSpacing.md,
    justifyContent: "space-between",
  },
  copy: {
    flex: 1,
    gap: healthOSSpacing.xs,
  },
});
