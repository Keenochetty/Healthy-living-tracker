import { StyleSheet, Text, useColorScheme, View } from "react-native";

import { AppIcon } from "@/components/ui/AppIcon";
import { HealthOSPill } from "@/components/healthos/HealthOSPill";
import { getHealthOSPalette, healthOSSpacing, healthOSTypography, type HealthOSColorMode } from "@/theme/healthos";

type HealthOSNutritionHeaderProps = {
  activeGoal: string;
  onManageGoal: () => void;
  statusLine?: string;
};

export function HealthOSNutritionHeader({
  activeGoal,
  onManageGoal,
  statusLine = "Meal planning, scan imports, and nutrition goals.",
}: HealthOSNutritionHeaderProps) {
  const mode: HealthOSColorMode = useColorScheme() === "dark" ? "dark" : "light";
  const palette = getHealthOSPalette(mode);

  return (
    <View style={styles.container}>
      <View style={styles.titleBlock}>
        <Text style={[healthOSTypography.screenTitle, { color: palette.inkText }]}>
          Nutrition
        </Text>
        <Text style={[healthOSTypography.bodySmall, { color: palette.softText }]}>
          {activeGoal}
        </Text>
        <Text style={[healthOSTypography.caption, { color: palette.softText }]}>
          {statusLine}
        </Text>
      </View>
      <HealthOSPill
        icon={<AppIcon decorative name="settings" size={14} variant="muted" />}
        label="Manage"
        onPress={onManageGoal}
        variant="glass"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "flex-start",
    flexDirection: "row",
    gap: healthOSSpacing.md,
    justifyContent: "space-between",
  },
  titleBlock: {
    flex: 1,
    gap: healthOSSpacing.xs,
  },
});
