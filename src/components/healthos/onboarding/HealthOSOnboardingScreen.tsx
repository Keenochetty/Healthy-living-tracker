import type { ReactNode } from "react";
import { StyleSheet, View } from "react-native";

import { HealthOSScreen } from "@/components/healthos/HealthOSScreen";
import { healthOSSpacing } from "@/theme/healthos";

type HealthOSOnboardingScreenProps = {
  children: ReactNode;
  subtitle?: string;
  title?: string;
};

export function HealthOSOnboardingScreen({
  children,
  subtitle,
  title,
}: HealthOSOnboardingScreenProps) {
  return (
    <HealthOSScreen
      scroll
      subtitle={subtitle}
      title={title}
      withBottomNavSpace={false}
    >
      <View style={styles.content}>{children}</View>
    </HealthOSScreen>
  );
}

const styles = StyleSheet.create({
  content: {
    gap: healthOSSpacing.md,
  },
});
