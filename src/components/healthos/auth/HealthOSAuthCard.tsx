import type { ReactNode } from "react";
import { StyleSheet, Text, useColorScheme, View } from "react-native";

import {
  getHealthOSPalette,
  getHealthOSSurfaces,
  healthOSSpacing,
  healthOSTypography,
  type HealthOSColorMode,
} from "@/theme/healthos";

type HealthOSAuthCardProps = {
  children: ReactNode;
  subtitle?: string;
  title: string;
};

export function HealthOSAuthCard({ children, subtitle, title }: HealthOSAuthCardProps) {
  const mode: HealthOSColorMode = useColorScheme() === "dark" ? "dark" : "light";
  const palette = getHealthOSPalette(mode);
  const surfaces = getHealthOSSurfaces(mode);

  return (
    <View style={[surfaces.glassPanel, styles.card]}>
      <View style={styles.header}>
        <Text style={[healthOSTypography.screenTitle, { color: palette.inkText }]}>
          {title}
        </Text>
        {subtitle ? (
          <Text style={[healthOSTypography.bodySmall, { color: palette.softText }]}>
            {subtitle}
          </Text>
        ) : null}
      </View>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    gap: healthOSSpacing.md,
    padding: healthOSSpacing.xl,
  },
  header: {
    gap: healthOSSpacing.xs,
  },
});
