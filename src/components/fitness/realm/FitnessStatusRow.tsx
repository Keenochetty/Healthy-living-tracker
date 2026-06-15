import { ScrollView, StyleSheet, Text, View, Pressable } from "react-native";

import { AppIcon } from "@/components/ui";
import type { AppIconName } from "@/constants/appIcons";
import type { FitnessSummary } from "@/types/fitness";
import { useAppTheme } from "@/theme/ThemeProvider";

export function FitnessStatusRow({
  onProgress,
  onReminder,
  summary,
}: {
  onProgress: () => void;
  onReminder: () => void;
  summary: FitnessSummary | null;
}) {
  const { theme } = useAppTheme();
  const items: Array<{
    icon: AppIconName;
    label: string;
    onPress: () => void;
    value: string;
  }> = [
    {
      icon: "success",
      label: "Weekly streak",
      onPress: onProgress,
      value: `${summary?.currentStreakDays ?? 0} days`,
    },
    {
      icon: "planning",
      label: "Goal progress",
      onPress: onProgress,
      value: `${Math.round(summary?.weeklyGoalProgress ?? 0)}%`,
    },
    {
      icon: "fitness",
      label: "Muscles trained",
      onPress: onProgress,
      value: summary?.workoutsThisWeek ? "Building" : "Ready",
    },
    {
      icon: "health",
      label: "Recovery",
      onPress: onProgress,
      value: summary?.activeMinutesToday ? "Recover" : "Fresh",
    },
    {
      icon: "reminder",
      label: "Next reminder",
      onPress: onReminder,
      value: "Plan it",
    },
  ];

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.rail}
    >
      {items.map((item) => (
        <Pressable key={item.label} onPress={item.onPress} style={[styles.card, { backgroundColor: theme.card ?? theme.surface, borderColor: theme.border }]}>
          <View style={[styles.icon, { backgroundColor: theme.primarySoft }]}>
            <AppIcon color={theme.primary} decorative name={item.icon} size={18} />
          </View>
          <Text style={[styles.value, { color: theme.text }]}>{item.value}</Text>
          <Text style={[styles.label, { color: theme.mutedText }]}>{item.label}</Text>
        </Pressable>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#ffffff",
    borderColor: "#e2e8f0",
    borderRadius: 22,
    borderWidth: 1,
    gap: 5,
    minHeight: 125,
    padding: 14,
    shadowColor: "#0f172a",
    shadowOffset: { height: 7, width: 0 },
    shadowOpacity: 0.05,
    shadowRadius: 14,
    width: 132,
  },
  icon: {
    alignItems: "center",
    backgroundColor: "#ccfbf1",
    borderRadius: 13,
    height: 36,
    justifyContent: "center",
    marginBottom: 4,
    width: 36,
  },
  label: { color: "#64748b", fontSize: 11, fontWeight: "700" },
  rail: { gap: 10, paddingRight: 16 },
  value: { color: "#0f172a", fontSize: 15, fontWeight: "900" },
});
