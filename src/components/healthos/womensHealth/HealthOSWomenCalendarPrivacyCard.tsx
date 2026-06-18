import { StyleSheet, Text, useColorScheme, View } from "react-native";

import { HealthOSCard } from "@/components/healthos/HealthOSCard";
import { HealthOSPill } from "@/components/healthos/HealthOSPill";
import { getHealthOSPalette, healthOSSpacing, healthOSTypography, type HealthOSColorMode } from "@/theme/healthos";

type Props = {
  onAddReminder: () => void;
  onManagePrivacy: () => void;
  onViewCalendar: () => void;
};

export function HealthOSWomenCalendarPrivacyCard({
  onAddReminder,
  onManagePrivacy,
  onViewCalendar,
}: Props) {
  const mode: HealthOSColorMode = useColorScheme() === "dark" ? "dark" : "light";
  const palette = getHealthOSPalette(mode);

  return (
    <HealthOSCard title="Calendar and privacy" variant="compact">
      <Text style={[healthOSTypography.bodySmall, { color: palette.softText }]}>
        Private cycle overlays can appear in Calendar for you. Shared overlays only happen if you choose. Sex-day logs stay private unless explicitly shared by supported permissions.
      </Text>
      <View style={styles.actions}>
        <HealthOSPill label="View calendar" onPress={onViewCalendar} variant="glass" />
        <HealthOSPill label="Manage privacy" onPress={onManagePrivacy} variant="glass" />
        <HealthOSPill label="Add reminder" onPress={onAddReminder} variant="glass" />
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
});
