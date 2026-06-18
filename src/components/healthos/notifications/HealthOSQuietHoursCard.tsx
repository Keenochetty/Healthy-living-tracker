import { StyleSheet, Switch, Text, useColorScheme, View } from "react-native";
import { Moon } from "lucide-react-native";

import { HealthOSCard } from "@/components/healthos/HealthOSCard";
import {
  getHealthOSPalette,
  healthOSSpacing,
  healthOSTypography,
  type HealthOSColorMode,
} from "@/theme/healthos";
import type { HealthOSQuietHoursDisplay } from "@/features/reminders";

type Props = {
  onToggle: (enabled: boolean) => void;
  quietHours: HealthOSQuietHoursDisplay;
};

export function HealthOSQuietHoursCard({ onToggle, quietHours }: Props) {
  const mode: HealthOSColorMode = useColorScheme() === "dark" ? "dark" : "light";
  const palette = getHealthOSPalette(mode);

  return (
    <HealthOSCard icon={<Moon color={palette.ai} size={20} />} title="Quiet hours" subtitle="Delay or soften non-critical reminders during rest windows.">
      <View style={styles.row}>
        <View style={styles.copy}>
          <Text style={[healthOSTypography.cardTitle, { color: palette.inkText }]}>
            {quietHours.enabled ? "Quiet hours active" : "Quiet hours off"}
          </Text>
          <Text style={[healthOSTypography.bodySmall, { color: palette.softText }]}>
            {quietHours.start ?? "22:00"} to {quietHours.end ?? "07:00"} · Critical medical categories can still use deliver behavior.
          </Text>
        </View>
        <Switch onValueChange={onToggle} value={quietHours.enabled} />
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
