import { Pressable, StyleSheet, Text, View } from "react-native";

import { AppIcon, QuickActionButton, StatusPill } from "@/components/ui";
import {
  canManageCircleMembers,
  circleRelationshipLabels,
  circleRoleLabels,
  getCircleRoleTone
} from "@/constants/circles";
import { spacing } from "@/constants/spacing";
import { colors } from "@/constants/theme";
import type { CircleMember, CircleMemberRole } from "@/types/circles";

type CircleMemberCardProps = {
  currentUserRole: CircleMemberRole;
  member: CircleMember;
  onManage?: (member: CircleMember) => void;
  onView?: (member: CircleMember) => void;
};

export function CircleMemberCard({ currentUserRole, member, onManage, onView }: CircleMemberCardProps) {
  const canManage = canManageCircleMembers(currentUserRole);
  const initials = member.displayName
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part.slice(0, 1).toUpperCase())
    .join("");

  return (
    <Pressable accessibilityRole="button" onPress={() => onView?.(member)} style={({ pressed }) => [styles.card, pressed && styles.pressed]}>
      <View style={styles.avatar}>
        <Text style={styles.avatarText}>{initials || "M"}</Text>
      </View>

      <View style={styles.copy}>
        <View style={styles.titleRow}>
          <Text style={styles.name}>{member.displayName}</Text>
          {member.isCurrentUser ? <StatusPill label="You" tone="success" /> : null}
        </View>
        <Text style={styles.meta}>{member.email ?? member.notes ?? "Circle member"}</Text>
        <View style={styles.badges}>
          <StatusPill label={circleRoleLabels[member.role]} tone={getCircleRoleTone(member.role)} />
          <StatusPill label={circleRelationshipLabels[member.relationship]} />
          {member.status !== "active" ? <StatusPill label={member.status === "pending" ? "Pending" : "Mock"} tone="warning" /> : null}
        </View>
      </View>

      <View style={styles.actions}>
        {canManage ? (
          <QuickActionButton
            icon={<AppIcon color={colors.brand.primary} name="settings" size={18} />}
            label="Manage"
            onPress={() => onManage?.(member)}
            toneColor={colors.brand.primary}
          />
        ) : (
          <QuickActionButton label="View" onPress={() => onView?.(member)} toneColor={colors.text.muted} />
        )}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  actions: {
    alignItems: "flex-start"
  },
  avatar: {
    alignItems: "center",
    backgroundColor: colors.brand.primarySoft,
    borderRadius: 999,
    height: 50,
    justifyContent: "center",
    width: 50
  },
  avatarText: {
    color: colors.brand.primary,
    fontSize: 17,
    fontWeight: "900"
  },
  badges: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
    marginTop: spacing.xs
  },
  card: {
    alignItems: "center",
    backgroundColor: colors.background.warm,
    borderColor: colors.border.soft,
    borderRadius: 18,
    borderWidth: 1,
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.md,
    padding: spacing.md
  },
  copy: {
    flex: 1,
    gap: spacing.xs,
    minWidth: 190
  },
  meta: {
    color: colors.text.muted,
    fontSize: 14,
    lineHeight: 20
  },
  name: {
    color: colors.text.primary,
    flex: 1,
    fontSize: 17,
    fontWeight: "900"
  },
  pressed: {
    opacity: 0.84,
    transform: [{ scale: 0.99 }]
  },
  titleRow: {
    alignItems: "center",
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm
  }
});
