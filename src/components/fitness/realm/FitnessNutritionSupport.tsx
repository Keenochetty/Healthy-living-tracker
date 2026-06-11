import { Pressable, StyleSheet, Text, View } from "react-native";

import { AppCard, AppIcon } from "@/components/ui";

export function FitnessNutritionSupport({
  onOpenFood,
  suggestion,
}: {
  onOpenFood: () => void;
  suggestion?: string;
}) {
  return (
    <AppCard style={styles.card}>
      <View style={styles.icon}>
        <AppIcon color="#f59e0b" decorative name="nutrition" size={24} />
      </View>
      <View style={styles.copy}>
        <Text style={styles.eyebrow}>Workout-linked nutrition</Text>
        <Text style={styles.title}>
          {suggestion ?? "Strength day: protein-focused recovery meal"}
        </Text>
        <Text style={styles.body}>
          Get recovery guidance here, then use Food to plan or log meals.
        </Text>
        <Pressable onPress={onOpenFood}>
          <Text style={styles.link}>Open Food realm</Text>
        </Pressable>
      </View>
    </AppCard>
  );
}

const styles = StyleSheet.create({
  body: { color: "#78350f", fontSize: 12, lineHeight: 18, marginTop: 5 },
  card: {
    alignItems: "flex-start",
    backgroundColor: "#fffbeb",
    borderColor: "#fde68a",
    borderWidth: 1,
    flexDirection: "row",
    gap: 13,
  },
  copy: { flex: 1 },
  eyebrow: {
    color: "#b45309",
    fontSize: 10,
    fontWeight: "900",
    letterSpacing: 0.8,
    textTransform: "uppercase",
  },
  icon: {
    alignItems: "center",
    backgroundColor: "#fef3c7",
    borderRadius: 16,
    height: 46,
    justifyContent: "center",
    width: 46,
  },
  link: { color: "#92400e", fontSize: 12, fontWeight: "900", marginTop: 10 },
  title: {
    color: "#451a03",
    fontSize: 16,
    fontWeight: "900",
    lineHeight: 21,
    marginTop: 4,
  },
});
