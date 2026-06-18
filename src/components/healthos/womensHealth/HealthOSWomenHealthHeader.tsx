import { StyleSheet, Text, useColorScheme, View } from "react-native";

import { HealthOSPill } from "@/components/healthos/HealthOSPill";
import { AppIcon } from "@/components/ui/AppIcon";
import { getHealthOSPalette, healthOSSpacing, healthOSTypography, type HealthOSColorMode } from "@/theme/healthos";

import type { HealthOSCycleSummary, HealthOSWomenPrivacyStatus } from "./HealthOSWomenHealthTypes";

type Props = {
  cycleSummary: HealthOSCycleSummary;
  onManage: () => void;
  privacyStatus: HealthOSWomenPrivacyStatus;
};

export function HealthOSWomenHealthHeader({ cycleSummary, onManage, privacyStatus }: Props) {
  const mode: HealthOSColorMode = useColorScheme() === "dark" ? "dark" : "light";
  const palette = getHealthOSPalette(mode);
  const status = cycleSummary.cycleDay
    ? `Cycle day ${cycleSummary.cycleDay} - ${cycleSummary.currentPhase}`
    : "Start tracking when you're ready.";

  return (
    <View style={styles.container}>
      <View style={styles.copy}>
        <Text style={[healthOSTypography.screenTitle, { color: palette.inkText }]}>
          Women's Health
        </Text>
        <Text style={[healthOSTypography.bodySmall, { color: palette.softText }]}>
          {status}
        </Text>
        <View style={styles.chips}>
          <HealthOSPill
            icon={<AppIcon decorative name="privacy" size={14} variant="private" />}
            label={privacyLabel(privacyStatus)}
            size="sm"
            variant={privacyStatus === "sharedSelected" ? "warning" : "glass"}
          />
        </View>
      </View>
      <HealthOSPill label="Manage" onPress={onManage} variant="glass" />
    </View>
  );
}

function privacyLabel(status: HealthOSWomenPrivacyStatus) {
  if (status === "sharedSelected") return "Shared with selected people";
  if (status === "unknown") return "Private status unknown";
  return "Private";
}

const styles = StyleSheet.create({
  chips: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: healthOSSpacing.sm,
  },
  container: {
    alignItems: "flex-start",
    flexDirection: "row",
    gap: healthOSSpacing.md,
    justifyContent: "space-between",
  },
  copy: {
    flex: 1,
    gap: healthOSSpacing.xs,
  },
});
