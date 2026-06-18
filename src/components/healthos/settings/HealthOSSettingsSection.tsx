import type { ReactNode } from "react";
import { StyleSheet, Text, useColorScheme, View } from "react-native";

import { HealthOSCard } from "@/components/healthos/HealthOSCard";
import {
  getHealthOSPalette,
  healthOSSpacing,
  healthOSTypography,
  type HealthOSColorMode,
} from "@/theme/healthos";

type Props = {
  action?: ReactNode;
  children: ReactNode;
  footerNote?: string;
  sensitive?: boolean;
  subtitle?: string;
  title: string;
};

export function HealthOSSettingsSection({
  action,
  children,
  footerNote,
  sensitive = false,
  subtitle,
  title,
}: Props) {
  const mode: HealthOSColorMode = useColorScheme() === "dark" ? "dark" : "light";
  const palette = getHealthOSPalette(mode);
  return (
    <HealthOSCard title={title} subtitle={subtitle} variant={sensitive ? "danger" : "elevated"} rightAccessory={action}>
      <View style={styles.stack}>{children}</View>
      {footerNote ? (
        <Text style={[healthOSTypography.caption, styles.footer, { color: palette.softText }]}>
          {footerNote}
        </Text>
      ) : null}
    </HealthOSCard>
  );
}

const styles = StyleSheet.create({
  footer: {
    marginTop: healthOSSpacing.md,
  },
  stack: {
    gap: healthOSSpacing.sm,
  },
});
