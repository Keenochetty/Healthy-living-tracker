import { StyleSheet, Text, useColorScheme, View } from "react-native";

import { HealthOSPill } from "@/components/healthos/HealthOSPill";
import {
  getHealthOSPalette,
  healthOSSpacing,
  healthOSTypography,
  type HealthOSColorMode,
} from "@/theme/healthos";

type HealthOSFitnessHeaderProps = {
  activeGoal: string | null;
  onManageGoal: () => void;
};

export function HealthOSFitnessHeader({ activeGoal, onManageGoal }: HealthOSFitnessHeaderProps) {
  const mode: HealthOSColorMode = useColorScheme() === "dark" ? "dark" : "light";
  const palette = getHealthOSPalette(mode);

  return (
    <View style={styles.header}>
      <View style={styles.copy}>
        <Text style={[healthOSTypography.screenTitle, { color: palette.inkText }]}>
          Fitness
        </Text>
        <Text style={[healthOSTypography.bodySmall, { color: palette.softText }]}>
          {activeGoal ?? "Choose your first fitness goal."}
        </Text>
      </View>
      <HealthOSPill label="Manage goal" onPress={onManageGoal} variant="glass" />
    </View>
  );
}

const styles = StyleSheet.create({
  copy: {
    flex: 1,
    gap: healthOSSpacing.xxs,
  },
  header: {
    alignItems: "center",
    flexDirection: "row",
    gap: healthOSSpacing.md,
  },
});

