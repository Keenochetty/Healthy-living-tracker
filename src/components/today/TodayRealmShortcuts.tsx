import { Href, router } from "expo-router";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { AppCard, AppIcon } from "@/components/ui";
import type { AppIconName } from "@/constants/appIcons";
import {
  healthRealmAccents,
  realmAccentWithOpacity,
} from "@/theme/designSystem";
import { spacing } from "@/theme/tokens";
import { useAppTheme } from "@/theme/ThemeProvider";

type RealmShortcut = {
  accent: keyof typeof healthRealmAccents;
  icon: AppIconName;
  label: string;
  meta: string;
  route: Href;
  visible: boolean;
};

type TodayRealmShortcutsProps = {
  showChildCare: boolean;
  showFamily: boolean;
  showFitness: boolean;
  showNutrition: boolean;
};

export function TodayRealmShortcuts({
  showChildCare,
  showFamily,
  showFitness,
  showNutrition,
}: TodayRealmShortcutsProps) {
  const { theme } = useAppTheme();
  const shortcuts: RealmShortcut[] = [
    {
      accent: "health",
      icon: "health",
      label: "Vitals",
      meta: "Overview",
      route: "/health" as Href,
      visible: true,
    },
    {
      accent: "fitness",
      icon: "fitness",
      label: "Fitness",
      meta: "Today",
      route: "/fitness" as Href,
      visible: showFitness,
    },
    {
      accent: "food",
      icon: "food",
      label: "Food",
      meta: "Fuel",
      route: "/food" as Href,
      visible: showNutrition,
    },
    {
      accent: "meds",
      icon: "medication",
      label: "Meds",
      meta: "Safety",
      route: "/medication" as Href,
      visible: true,
    },
    {
      accent: "records",
      icon: "records",
      label: "Records",
      meta: "Protected",
      route: "/records" as Href,
      visible: true,
    },
    {
      accent: showChildCare ? "baby" : "family",
      icon: showChildCare ? "child_baby" : "caregiver",
      label: showChildCare ? "Child" : "Family",
      meta: "Shared care",
      route: (showChildCare ? "/baby-child" : "/circle") as Href,
      visible: showChildCare || showFamily,
    },
  ];

  return (
    <View style={styles.section}>
      <View style={styles.header}>
        <View>
          <Text style={[styles.kicker, { color: theme.mutedText }]}>
            Whole-life overview
          </Text>
          <Text style={[styles.title, { color: theme.text }]}>
            Realm shortcuts
          </Text>
        </View>
        <Pressable onPress={() => router.push("/health" as Href)}>
          <Text style={[styles.link, { color: theme.primary }]}>See all</Text>
        </Pressable>
      </View>
      <View style={styles.grid}>
        {shortcuts
          .filter((shortcut) => shortcut.visible)
          .map((shortcut) => {
            const accent = healthRealmAccents[shortcut.accent];
            return (
              <AppCard
                key={shortcut.label}
                onPress={() => router.push(shortcut.route)}
                padding="sm"
                style={styles.card}
              >
                <View
                  style={[
                    styles.icon,
                    {
                      backgroundColor: realmAccentWithOpacity(shortcut.accent),
                    },
                  ]}
                >
                  <AppIcon
                    color={accent}
                    decorative
                    name={shortcut.icon}
                    size={18}
                  />
                </View>
                <Text style={[styles.cardTitle, { color: theme.text }]}>
                  {shortcut.label}
                </Text>
                <Text style={[styles.meta, { color: theme.mutedText }]}>
                  {shortcut.meta}
                </Text>
              </AppCard>
            );
          })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { flexBasis: "30%", flexGrow: 1, gap: 5, minHeight: 104 },
  cardTitle: { fontSize: 12, fontWeight: "900", marginTop: 5 },
  grid: { flexDirection: "row", flexWrap: "wrap", gap: 9 },
  header: {
    alignItems: "flex-end",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  icon: {
    alignItems: "center",
    borderRadius: 12,
    height: 32,
    justifyContent: "center",
    width: 32,
  },
  kicker: {
    fontSize: 10,
    fontWeight: "900",
    letterSpacing: 0.8,
    textTransform: "uppercase",
  },
  link: { fontSize: 11, fontWeight: "900" },
  meta: { fontSize: 10, fontWeight: "700" },
  section: { gap: spacing.md },
  title: { fontSize: 17, fontWeight: "900", marginTop: 2 },
});
