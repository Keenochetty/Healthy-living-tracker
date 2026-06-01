import { Pressable, StyleSheet, Text, View } from "react-native";

import { circleRoleLabels } from "@/constants/circles";
import { spacing } from "@/constants/spacing";
import { colors } from "@/constants/theme";
import type { FamilyCircle } from "@/types/circles";
import { AppIcon, QuickActionButton, StatusPill } from "@/components/ui";

type CircleSwitcherProps = {
  circles: FamilyCircle[];
  onManage?: () => void;
  onSelectCircle?: (circleId: string) => void;
  selectedCircleId?: string | null;
};

export function CircleSwitcher({ circles, onManage, onSelectCircle, selectedCircleId }: CircleSwitcherProps) {
  const selectedCircle = circles.find((circle) => circle.id === selectedCircleId) ?? circles[0] ?? null;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerCopy}>
          <Text style={styles.eyebrow}>Family Circle</Text>
          <Text style={styles.title}>{selectedCircle?.name ?? "No circle selected"}</Text>
          <Text style={styles.subtitle}>Switch between household and care circles. Caregiver work stays in the Care tab.</Text>
        </View>
        {onManage ? <QuickActionButton label="Manage" onPress={onManage} toneColor={colors.brand.primary} /> : null}
      </View>

      <View style={styles.circleRow}>
        {circles.map((circle) => {
          const selected = selectedCircle?.id === circle.id;

          return (
            <Pressable
              accessibilityRole="button"
              key={circle.id}
              onPress={() => onSelectCircle?.(circle.id)}
              style={({ pressed }) => [styles.circleButton, selected && styles.selectedCircle, pressed && styles.pressed]}
            >
              <View style={[styles.circleIcon, selected && styles.selectedIcon]}>
                <AppIcon color={selected ? colors.brand.primary : colors.text.secondary} name={circle.kind === "care_circle" ? "care" : "family"} size={20} />
              </View>
              <View style={styles.circleCopy}>
                <Text numberOfLines={1} style={styles.circleName}>
                  {circle.name}
                </Text>
                <Text style={styles.circleMeta}>{circleRoleLabels[circle.currentUserRole]}</Text>
              </View>
              {circle.source === "placeholder" ? <StatusPill label="Demo" /> : null}
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  circleButton: {
    alignItems: "center",
    backgroundColor: colors.card.background,
    borderColor: colors.border.soft,
    borderRadius: 18,
    borderWidth: 1,
    flexDirection: "row",
    gap: spacing.sm,
    minHeight: 58,
    minWidth: 190,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm
  },
  circleCopy: {
    flex: 1,
    minWidth: 0
  },
  circleIcon: {
    alignItems: "center",
    backgroundColor: colors.background.mist,
    borderRadius: 14,
    height: 38,
    justifyContent: "center",
    width: 38
  },
  circleMeta: {
    color: colors.text.muted,
    fontSize: 12,
    fontWeight: "700",
    marginTop: 2
  },
  circleName: {
    color: colors.text.primary,
    fontSize: 15,
    fontWeight: "900"
  },
  circleRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm
  },
  container: {
    backgroundColor: colors.card.background,
    borderColor: colors.border.soft,
    borderRadius: 24,
    borderWidth: 1,
    gap: spacing.md,
    padding: spacing.lg
  },
  eyebrow: {
    color: colors.brand.primary,
    fontSize: 12,
    fontWeight: "900",
    textTransform: "uppercase"
  },
  header: {
    alignItems: "flex-start",
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.md,
    justifyContent: "space-between"
  },
  headerCopy: {
    flex: 1,
    gap: spacing.xs,
    minWidth: 220
  },
  pressed: {
    opacity: 0.82,
    transform: [{ scale: 0.99 }]
  },
  selectedCircle: {
    backgroundColor: colors.brand.primarySoft,
    borderColor: colors.brand.primary
  },
  selectedIcon: {
    backgroundColor: colors.card.background
  },
  subtitle: {
    color: colors.text.muted,
    fontSize: 14,
    lineHeight: 20
  },
  title: {
    color: colors.text.primary,
    fontSize: 20,
    fontWeight: "900"
  }
});
