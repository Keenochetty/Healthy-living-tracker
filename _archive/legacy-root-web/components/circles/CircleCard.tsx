import { Pressable, StyleSheet, Text, View } from "react-native";

import {
  circleRelationshipLabels,
  circleRoleLabels,
} from "@/constants/circles";
import { spacing } from "@/constants/spacing";
import { colors } from "@/constants/theme";
import type { FamilyCircle } from "@/types/circles";
import { AppIcon, QuickActionButton, StatusPill } from "@/components/ui";

type CircleCardProps = {
  actionLabel?: string;
  circle: FamilyCircle;
  onPress?: () => void;
  selected?: boolean;
};

export function CircleCard({
  actionLabel = "Open",
  circle,
  onPress,
  selected = false,
}: CircleCardProps) {
  const relationship = circle.currentUserRelationship
    ? circleRelationshipLabels[circle.currentUserRelationship]
    : "Relationship pending";

  return (
    <Pressable
      accessibilityRole="button"
      disabled={!onPress}
      onPress={onPress}
      style={({ pressed }) => [
        styles.card,
        selected && styles.selected,
        pressed && styles.pressed,
      ]}
    >
      <View style={styles.iconShell}>
        <AppIcon
          color={colors.brand.primary}
          name={circle.kind === "care_circle" ? "care" : "family"}
          size={23}
          variant="filled"
        />
      </View>
      <View style={styles.copy}>
        <View style={styles.titleRow}>
          <Text style={styles.title}>{circle.name}</Text>
          {selected ? <StatusPill label="Selected" tone="success" /> : null}
        </View>
        <Text style={styles.subtitle}>
          {circle.description ?? "Family Circle"}
        </Text>
        <View style={styles.metaRow}>
          <StatusPill
            label={circleRoleLabels[circle.currentUserRole]}
            tone={circle.currentUserRole === "owner" ? "success" : "default"}
          />
          <StatusPill label={relationship} />
          <StatusPill label={`${circle.memberCount} members`} />
          <StatusPill
            label={`${circle.dependentCount} care profiles`}
            tone="ai"
          />
        </View>
      </View>
      {onPress ? (
        <QuickActionButton
          label={actionLabel}
          onPress={onPress}
          toneColor={colors.brand.primary}
        />
      ) : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    alignItems: "center",
    backgroundColor: colors.background.warm,
    borderColor: colors.border.soft,
    borderRadius: 20,
    borderWidth: 1,
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.md,
    padding: spacing.md,
  },
  copy: {
    flex: 1,
    gap: spacing.xs,
    minWidth: 210,
  },
  iconShell: {
    alignItems: "center",
    backgroundColor: colors.brand.primarySoft,
    borderRadius: 18,
    height: 52,
    justifyContent: "center",
    width: 52,
  },
  metaRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
    marginTop: spacing.xs,
  },
  pressed: {
    opacity: 0.84,
    transform: [{ scale: 0.99 }],
  },
  selected: {
    borderColor: colors.brand.primary,
  },
  subtitle: {
    color: colors.text.muted,
    fontSize: 14,
    lineHeight: 20,
  },
  title: {
    color: colors.text.primary,
    flex: 1,
    fontSize: 18,
    fontWeight: "900",
  },
  titleRow: {
    alignItems: "center",
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
  },
});
