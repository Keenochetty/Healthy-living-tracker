import { ScrollView, StyleSheet, View } from "react-native";
import { type Href, router } from "expo-router";

import { AppIcon } from "@/components/ui/AppIcon";
import { HealthOSPill } from "@/components/healthos/HealthOSPill";
import { healthOSSpacing } from "@/theme/healthos";
import type { AppIconName } from "@/constants/appIcons";

type QuickAction = {
  icon: AppIconName;
  label: string;
  route: Href;
};

const QUICK_ACTIONS: QuickAction[] = [
  { icon: "note", label: "Log symptom", route: "/health/general/notes" },
  { icon: "medication", label: "Add medication", route: "/medication/add" },
  { icon: "scan", label: "Scan script", route: "/(tabs)/scan" },
  { icon: "nutrition", label: "Log meal", route: "/(tabs)/food" },
  { icon: "fitness", label: "Add workout", route: "/(tabs)/fitness" },
  { icon: "upload", label: "Upload record", route: "/records" },
  { icon: "device_sync", label: "Connect device", route: "/device-sync" },
  { icon: "ai", label: "Ask AI", route: "/ai" },
];

export function HealthOSHealthQuickActions() {
  return (
    <ScrollView
      contentContainerStyle={styles.content}
      horizontal
      showsHorizontalScrollIndicator={false}
    >
      {QUICK_ACTIONS.map((action) => (
        <View key={action.label}>
          <HealthOSPill
            icon={<AppIcon decorative name={action.icon} size={16} variant="muted" />}
            label={action.label}
            onPress={() => router.push(action.route)}
            variant="glass"
          />
        </View>
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
