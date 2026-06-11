import { ScrollView, StyleSheet, Text, View, Pressable } from "react-native";

import { AppIcon } from "@/components/ui";
import type { AppIconName } from "@/constants/appIcons";
import type { FitnessSummary } from "@/types/fitness";

export function FitnessStatusRow({
  onProgress,
  onReminder,
  summary,
}: {
  onProgress: () => void;
  onReminder: () => void;
  summary: FitnessSummary | null;
}) {
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
        <Pressable key={item.label} onPress={item.onPress} style={styles.card}>
          <View style={styles.icon}>
            <AppIcon color="#0f766e" decorative name={item.icon} size={18} />
          </View>
          <Text style={styles.value}>{item.value}</Text>
          <Text style={styles.label}>{item.label}</Text>
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
