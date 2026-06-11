import { Pressable, StyleSheet, Text, View } from "react-native";

import { AppIcon } from "@/components/ui";
import {
  FITNESS_EXPLORE_CATEGORIES,
  type FitnessExploreCategory,
} from "@/constants/fitnessRealmConfig";

export function FitnessExploreGrid({
  onSelect,
}: {
  onSelect: (category: FitnessExploreCategory) => void;
}) {
  return (
    <View style={styles.section}>
      <View>
        <Text style={styles.eyebrow}>Find your movement</Text>
        <Text style={styles.heading}>Explore Fitness</Text>
      </View>
      <View style={styles.grid}>
        {FITNESS_EXPLORE_CATEGORIES.map((category) => (
          <Pressable
            key={category.id}
            onPress={() => onSelect(category)}
            style={styles.card}
          >
            <View
              style={[
                styles.icon,
                { backgroundColor: `${category.accentColor}20` },
              ]}
            >
              <AppIcon
                color={category.accentColor}
                decorative
                name={category.icon}
                size={21}
              />
            </View>
            <Text style={styles.title}>{category.title}</Text>
            {category.safetyBadge ? (
              <Text style={styles.badge}>{category.safetyBadge}</Text>
            ) : null}
          </Pressable>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    color: "#9a3412",
    fontSize: 8,
    fontWeight: "900",
    textTransform: "uppercase",
  },
  card: {
    alignItems: "center",
    backgroundColor: "#ffffff",
    borderColor: "#e2e8f0",
    borderRadius: 20,
    borderWidth: 1,
    flexBasis: "22%",
    flexGrow: 1,
    gap: 7,
    minHeight: 105,
    padding: 10,
  },
  eyebrow: {
    color: "#0f766e",
    fontSize: 11,
    fontWeight: "900",
    letterSpacing: 0.9,
    textTransform: "uppercase",
  },
  grid: { flexDirection: "row", flexWrap: "wrap", gap: 9 },
  heading: { color: "#0f172a", fontSize: 22, fontWeight: "900", marginTop: 3 },
  icon: {
    alignItems: "center",
    borderRadius: 15,
    height: 42,
    justifyContent: "center",
    width: 42,
  },
  section: { gap: 12 },
  title: {
    color: "#1e293b",
    fontSize: 10,
    fontWeight: "900",
    lineHeight: 14,
    textAlign: "center",
  },
});
