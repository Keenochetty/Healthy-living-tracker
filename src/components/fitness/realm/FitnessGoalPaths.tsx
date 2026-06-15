import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

import { AppIcon } from "@/components/ui";
import {
  FITNESS_GOAL_PATHS,
  type FitnessGoalPath,
} from "@/constants/fitnessRealmConfig";
import { useAppTheme } from "@/theme/ThemeProvider";

export function FitnessGoalPaths({
  goals = FITNESS_GOAL_PATHS,
  onSelect,
  onViewAll,
}: {
  goals?: FitnessGoalPath[];
  onSelect: (goal: FitnessGoalPath) => void;
  onViewAll?: () => void;
}) {
  const { theme } = useAppTheme();
  return (
    <View style={styles.section}>
      <View style={styles.headingRow}>
        <View>
          <Text style={[styles.eyebrow, { color: theme.primary }]}>Build towards something</Text>
          <Text style={[styles.heading, { color: theme.text }]}>Goal Paths</Text>
        </View>
        {onViewAll ? <Pressable onPress={onViewAll}><Text style={[styles.viewAll, { color: theme.primary }]}>View all</Text></Pressable> : null}
      </View>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.rail}
      >
        {goals.map((goal) => (
          <Pressable
            key={goal.id}
            onPress={() => onSelect(goal)}
            style={[styles.card, { backgroundColor: goal.accentColor }]}
          >
            <View style={styles.topRow}>
              <View style={styles.icon}>
                <AppIcon
                  color="#ffffff"
                  decorative
                  name={goal.icon}
                  size={20}
                />
              </View>
              {goal.safetyBadge ? (
                <Text style={styles.badge}>{goal.safetyBadge}</Text>
              ) : null}
            </View>
            <Text style={styles.title}>{goal.title}</Text>
            <Text style={styles.subtitle}>{goal.subtitle}</Text>
            <Text style={styles.open}>Explore path +</Text>
          </Pressable>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    backgroundColor: "rgba(255,255,255,0.16)",
    borderRadius: 999,
    color: "#ffffff",
    fontSize: 9,
    fontWeight: "900",
    overflow: "hidden",
    paddingHorizontal: 8,
    paddingVertical: 5,
  },
  card: { borderRadius: 25, minHeight: 200, padding: 17, width: 220 },
  eyebrow: {
    color: "#0f766e",
    fontSize: 11,
    fontWeight: "900",
    letterSpacing: 0.9,
    textTransform: "uppercase",
  },
  heading: { color: "#0f172a", fontSize: 22, fontWeight: "900", marginTop: 3 },
  headingRow: { alignItems: "flex-end", flexDirection: "row", justifyContent: "space-between" },
  icon: {
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.14)",
    borderRadius: 14,
    height: 40,
    justifyContent: "center",
    width: 40,
  },
  open: {
    color: "#ffffff",
    fontSize: 11,
    fontWeight: "900",
    marginTop: "auto",
  },
  rail: { gap: 11, paddingRight: 16 },
  section: { gap: 12 },
  subtitle: {
    color: "rgba(255,255,255,0.78)",
    fontSize: 12,
    lineHeight: 17,
    marginTop: 7,
  },
  title: {
    color: "#ffffff",
    fontSize: 18,
    fontWeight: "900",
    lineHeight: 23,
    marginTop: 18,
  },
  topRow: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  viewAll: { fontSize: 11, fontWeight: "900", paddingVertical: 6 },
});
