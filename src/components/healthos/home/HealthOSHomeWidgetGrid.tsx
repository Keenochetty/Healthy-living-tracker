import type { ReactNode } from "react";
import { StyleSheet, View } from "react-native";

import { healthOSSpacing } from "@/theme/healthos";

type HealthOSHomeWidgetGridProps = {
  children: ReactNode;
};

export function HealthOSHomeWidgetGrid({ children }: HealthOSHomeWidgetGridProps) {
  return <View style={styles.grid}>{children}</View>;
}

const styles = StyleSheet.create({
  grid: {
    gap: healthOSSpacing.md,
  },
});
