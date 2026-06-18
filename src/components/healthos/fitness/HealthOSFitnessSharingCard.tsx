import { StyleSheet, Text, useColorScheme, View } from "react-native";

import { AppIcon } from "@/components/ui/AppIcon";
import { HealthOSCard } from "@/components/healthos/HealthOSCard";
import { HealthOSPill } from "@/components/healthos/HealthOSPill";
import {
  getHealthOSPalette,
  healthOSSpacing,
  healthOSTypography,
  type HealthOSColorMode,
} from "@/theme/healthos";

type HealthOSFitnessSharingCardProps = {
  onAddToCalendar: () => void;
  onShareProgress: () => void;
  onViewCalendar: () => void;
};

export function HealthOSFitnessSharingCard({
  onAddToCalendar,
  onShareProgress,
  onViewCalendar,
}: HealthOSFitnessSharingCardProps) {
  const mode: HealthOSColorMode = useColorScheme() === "dark" ? "dark" : "light";
  const palette = getHealthOSPalette(mode);

  return (
    <HealthOSCard
      icon={<AppIcon decorative name="shared" size={20} variant="primary" />}
      subtitle="Calendar and family sharing foundation"
      title="Schedule and share"
      variant="elevated"
    >
      <Text style={[healthOSTypography.bodySmall, { color: palette.softText }]}>
        You choose what family can see. Calendar saves and sharing are not automatic in this phase.
      </Text>
      <View style={styles.actions}>
        <HealthOSPill label="Add to calendar" onPress={onAddToCalendar} size="sm" variant="realm" />
        <HealthOSPill label="View calendar" onPress={onViewCalendar} size="sm" variant="glass" />
        <HealthOSPill label="Share progress" onPress={onShareProgress} size="sm" variant="glass" />
      </View>
    </HealthOSCard>
  );
}

const styles = StyleSheet.create({
  actions: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: healthOSSpacing.sm,
  },
});

