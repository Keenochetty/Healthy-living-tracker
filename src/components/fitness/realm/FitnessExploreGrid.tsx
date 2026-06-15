import { Pressable, StyleSheet, Text, View } from "react-native";

import { AppIcon } from "@/components/ui";
import {
  FITNESS_EXPLORE_CATEGORIES,
  type FitnessExploreCategory,
} from "@/constants/fitnessRealmConfig";
import { useAppTheme } from "@/theme/ThemeProvider";

export function FitnessExploreGrid({
  categories = FITNESS_EXPLORE_CATEGORIES,
  onSelect,
}: {
  categories?: FitnessExploreCategory[];
  onSelect: (category: FitnessExploreCategory) => void;
}) {
  const { theme } = useAppTheme();
  return (
    <View style={styles.section}>
      <View>
        <Text style={[styles.eyebrow, { color: theme.primary }]}>
          Find your movement
        </Text>
        <Text style={[styles.heading, { color: theme.text }]}>
          Explore Fitness
        </Text>
      </View>
      <View style={styles.grid}>
        {categories.map((category) => (
          <Pressable
            key={category.id}
            onPress={() => onSelect(category)}
            style={[
              styles.card,
              {
                backgroundColor: theme.card ?? theme.surface,
                borderColor: theme.border,
              },
            ]}
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
            <Text style={[styles.title, { color: theme.text }]}>
              {category.title}
            </Text>
            {category.safetyBadge ? (
              <Text style={[styles.badge, { color: theme.warning }]}>
                {category.safetyBadge}
              </Text>
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
