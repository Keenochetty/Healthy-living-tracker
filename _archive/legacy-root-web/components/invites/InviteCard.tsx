import { Pressable, StyleSheet, Text, View } from "react-native";

import { AppIcon, QuickActionButton, StatusPill } from "@/components/ui";
import {
  formatInvitePermissions,
  inviteMethodLabels,
  invitePermissionPresetDescriptions,
  invitePermissionPresetLabels,
} from "@/constants/invites";
import {
  circleRelationshipLabels,
  circleRoleLabels,
  getCircleRoleTone,
} from "@/constants/circles";
import { spacing } from "@/constants/spacing";
import { colors } from "@/constants/theme";
import type { CircleInvite } from "@/types/invites";

type InviteCardProps = {
  invite: CircleInvite;
  onApprove?: (invite: CircleInvite) => void;
  onCopy?: (invite: CircleInvite) => void;
  onOpen?: (invite: CircleInvite) => void;
  onShare?: (invite: CircleInvite) => void;
};

export function InviteCard({
  invite,
  onApprove,
  onCopy,
  onOpen,
  onShare,
}: InviteCardProps) {
  return (
    <Pressable
      accessibilityRole="button"
      onPress={() => onOpen?.(invite)}
      style={({ pressed }) => [styles.card, pressed && styles.pressed]}
    >
      <View style={styles.iconShell}>
        <AppIcon
          color={colors.brand.primary}
          name="family"
          size={22}
          variant="filled"
        />
      </View>

      <View style={styles.copy}>
        <View style={styles.titleRow}>
          <Text style={styles.title}>
            {invite.recipientLabel ?? "Circle invite"}
          </Text>
          <StatusPill
            label={invite.status}
            tone={invite.status === "pending" ? "warning" : "default"}
          />
        </View>
        <Text style={styles.linkText} numberOfLines={1}>
          {invite.inviteLink}
        </Text>
        <Text style={styles.tokenText} numberOfLines={1}>
          Token: {invite.inviteToken}
        </Text>
        <View style={styles.badges}>
          <StatusPill
            label={circleRoleLabels[invite.role]}
            tone={getCircleRoleTone(invite.role)}
          />
          <StatusPill label={circleRelationshipLabels[invite.relationship]} />
          <StatusPill label={inviteMethodLabels[invite.method]} tone="ai" />
          <StatusPill
            label={invitePermissionPresetLabels[invite.permissionPreset]}
            tone={
              invite.permissionPreset === "caregiver" ? "warning" : "default"
            }
          />
          {invite.requiresAdminApproval ? (
            <StatusPill label="Admin approval" tone="warning" />
          ) : null}
        </View>
        <Text style={styles.meta}>
          {invitePermissionPresetDescriptions[invite.permissionPreset]}
        </Text>
        <Text style={styles.meta}>
          Default permissions:{" "}
          {formatInvitePermissions(invite.defaultPermissions) || "None"}
        </Text>
        {invite.invitedEmail ? (
          <Text style={styles.meta}>Email: {invite.invitedEmail}</Text>
        ) : null}
        {invite.invitedPhone ? (
          <Text style={styles.meta}>Phone: {invite.invitedPhone}</Text>
        ) : null}
        <Text style={styles.meta}>
          Created by {invite.createdBy}
          {invite.expiresAt
            ? ` - Expires ${new Date(invite.expiresAt).toLocaleDateString()}`
            : ""}
        </Text>
      </View>

      <View style={styles.actions}>
        <QuickActionButton
          label="Open"
          onPress={() => onOpen?.(invite)}
          toneColor={colors.brand.primary}
        />
        <QuickActionButton
          label="Copy link"
          onPress={() => onCopy?.(invite)}
          toneColor={colors.status.success}
        />
        <QuickActionButton
          label="Share"
          onPress={() => onShare?.(invite)}
          toneColor={colors.status.ai}
        />
        {invite.requiresAdminApproval ? (
          <QuickActionButton
            label="Approve"
            onPress={() => onApprove?.(invite)}
            toneColor={colors.status.success}
          />
        ) : null}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  actions: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
  },
  badges: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
    marginTop: spacing.xs,
  },
  card: {
    backgroundColor: colors.background.warm,
    borderColor: colors.border.soft,
    borderRadius: 20,
    borderWidth: 1,
    gap: spacing.md,
    padding: spacing.md,
  },
  copy: {
    gap: spacing.xs,
  },
  iconShell: {
    alignItems: "center",
    backgroundColor: colors.brand.primarySoft,
    borderRadius: 16,
    height: 46,
    justifyContent: "center",
    width: 46,
  },
  linkText: {
    color: colors.text.secondary,
    fontSize: 14,
    fontWeight: "700",
  },
  meta: {
    color: colors.text.muted,
    fontSize: 13,
    lineHeight: 19,
    marginTop: spacing.xs,
  },
  pressed: {
    opacity: 0.86,
    transform: [{ scale: 0.99 }],
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
  tokenText: {
    color: colors.text.muted,
    fontSize: 12,
    fontWeight: "700",
  },
});
