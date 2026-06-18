import { Href, router } from "expo-router";
import { ScrollView, StyleSheet } from "react-native";

import { AppIcon } from "@/components/ui";
import type { AppIconName } from "@/constants/appIcons";
import { HealthOSPill } from "@/components/healthos/HealthOSPill";
import { getHealthOSPalette, healthOSSpacing } from "@/theme/healthos";
import { useColorScheme } from "react-native";

const quickActions: Array<{
  icon: AppIconName;
  label: string;
  route: Href;
  variant?: "active" | "ai" | "glass";
}> = [
  { icon: "food", label: "Log meal", route: "/(tabs)/food" as Href },
  { icon: "medication", label: "Log medicine", route: "/medication" as Href },
  { icon: "fitness", label: "Add workout", route: "/(tabs)/fitness" as Href },
  { icon: "health", label: "Add symptom", route: "/health/general/notes" as Href },
  { icon: "ai", label: "Scan", route: "/(tabs)/scan" as Href, variant: "ai" },
  { icon: "note", label: "Add note", route: "/health/general/notes" as Href },
  { icon: "calendar", label: "Add event", route: "/(tabs)/calendar" as Href },
];

export function HealthOSQuickActionRow() {
  const palette = getHealthOSPalette(useColorScheme() === "dark" ? "dark" : "light");

  return (
    <ScrollView
      accessibilityLabel="Home quick actions"
      contentContainerStyle={styles.content}
      horizontal
      showsHorizontalScrollIndicator={false}
    >
      {quickActions.map((action, index) => (
        <HealthOSPill
          icon={
            <AppIcon
              color={action.variant === "ai" ? palette.ai : palette.inkText}
              decorative
              name={action.icon}
              size={16}
            />
          }
          key={action.label}
          label={action.label}
          onPress={() => router.push(action.route)}
          variant={action.variant ?? (index === 0 ? "active" : "glass")}
        />
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: {
    gap: healthOSSpacing.sm,
    paddingRight: healthOSSpacing.lg,
  },
});
