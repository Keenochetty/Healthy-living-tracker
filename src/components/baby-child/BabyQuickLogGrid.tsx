import { Pressable, StyleSheet, Text, View } from "react-native";

import { AppIcon } from "@/components/ui";
import { useAppTheme } from "@/theme/ThemeProvider";

export type BabyQuickLogMode =
  | "feed"
  | "sleep"
  | "diaper"
  | "growth"
  | "solid"
  | "medicine"
  | "vaccine"
  | "note";

const ACTIONS: Array<{
  color: string;
  icon: string;
  label: string;
  mode: BabyQuickLogMode;
}> = [
  { color: "#fff0e8", icon: "nutrition", label: "Feed", mode: "feed" },
  { color: "#f1edff", icon: "sleep", label: "Sleep", mode: "sleep" },
  { color: "#e8f8f4", icon: "baby_child", label: "Diaper", mode: "diaper" },
  { color: "#edf5ff", icon: "medication", label: "Medicine", mode: "medicine" },
  { color: "#fff4e8", icon: "edit", label: "Note", mode: "note" },
  { color: "#ffecee", icon: "weight", label: "Growth", mode: "growth" },
  { color: "#f7f2df", icon: "food", label: "Solid Food", mode: "solid" },
  { color: "#f3efff", icon: "vaccines", label: "Vaccine", mode: "vaccine" },
];

export function BabyQuickLogGrid({
  onSelect,
}: {
  onSelect: (mode: BabyQuickLogMode) => void;
}) {
  const { theme } = useAppTheme();
  return (
    <View style={styles.grid}>
      {ACTIONS.map((action) => (
        <Pressable
          accessibilityLabel={`Log ${action.label}`}
          accessibilityRole="button"
          key={action.mode}
          onPress={() => onSelect(action.mode)}
          style={({ pressed }) => [
            styles.action,
            {
              backgroundColor: isDark(theme.background)
                ? (theme.surfaceSoft ?? theme.surface)
                : action.color,
              borderColor: theme.border,
            },
            pressed ? styles.pressed : null,
          ]}
        >
          <View style={[styles.iconWrap, { backgroundColor: theme.surface }]}>
            <AppIcon
              color={theme.primary}
              decorative
              name={action.icon as never}
              size={24}
            />
          </View>
          <Text style={[styles.label, { color: theme.text }]}>
            {action.label}
          </Text>
        </Pressable>
      ))}
    </View>
  );
}

function isDark(background: string) {
  return (
    background.startsWith("#0") ||
    background.startsWith("#1") ||
    background.startsWith("rgb")
  );
}

const styles = StyleSheet.create({
  action: {
    alignItems: "center",
    borderRadius: 22,
    borderWidth: 1,
    flexBasis: "22%",
    flexGrow: 1,
    gap: 8,
    justifyContent: "center",
    minHeight: 96,
    minWidth: 82,
    padding: 10,
  },
  grid: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  iconWrap: {
    alignItems: "center",
    borderRadius: 18,
    height: 46,
    justifyContent: "center",
    width: 46,
  },
  label: { fontSize: 12, fontWeight: "900", textAlign: "center" },
  pressed: { opacity: 0.72, transform: [{ scale: 0.98 }] },
});
