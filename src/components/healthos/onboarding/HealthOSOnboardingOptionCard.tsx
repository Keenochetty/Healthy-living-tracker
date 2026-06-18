import type { ReactNode } from "react";
import { StyleSheet, Text, useColorScheme, View } from "react-native";

import { HealthOSCard } from "@/components/healthos/HealthOSCard";
import {
  getHealthOSPalette,
  healthOSBorderWidth,
  healthOSSpacing,
  healthOSTypography,
  type HealthOSColorMode,
} from "@/theme/healthos";

type HealthOSOnboardingOptionCardProps = {
  description?: string;
  icon?: ReactNode;
  onPress?: () => void;
  selected?: boolean;
  title: string;
};

export function HealthOSOnboardingOptionCard({
  description,
  icon,
  onPress,
  selected = false,
  title,
}: HealthOSOnboardingOptionCardProps) {
  const mode: HealthOSColorMode = useColorScheme() === "dark" ? "dark" : "light";
  const palette = getHealthOSPalette(mode);

  return (
    <HealthOSCard
      icon={icon}
      onPress={onPress}
      rightAccessory={
        selected ? (
          <Text style={[healthOSTypography.caption, { color: palette.skyBlue }]}>
            Selected
          </Text>
        ) : null
      }
      style={[
        styles.card,
        selected && {
          borderColor: palette.skyBlue,
          borderWidth: healthOSBorderWidth.strong,
        },
      ]}
      title={title}
      variant={selected ? "ai" : "compact"}
    >
      {description ? (
        <View style={styles.body}>
          <Text style={[healthOSTypography.bodySmall, { color: palette.softText }]}>
            {description}
          </Text>
        </View>
      ) : null}
    </HealthOSCard>
  );
}

const styles = StyleSheet.create({
  body: {
    marginTop: healthOSSpacing.xs,
  },
  card: {
    minHeight: 76,
  },
});
