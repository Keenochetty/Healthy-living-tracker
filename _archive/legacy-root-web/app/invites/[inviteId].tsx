import { router, useLocalSearchParams } from "expo-router";
import { useMemo, useState } from "react";
import { Modal, Pressable, StyleSheet, Text, View } from "react-native";

import { InviteCard } from "@/components/invites/InviteCard";
import { InviteMethodCard } from "@/components/invites/InviteMethodCard";
import { InvitePermissionPresetCard } from "@/components/invites/InvitePermissionPresetCard";
import {
  AppHeader,
  AppScreen,
  QuickActionButton,
  StatusPill,
  WidgetCard,
} from "@/components/ui";
import { INVITE_METHODS } from "@/constants/invites";
import { getPlaceholderCircleInvites } from "@/lib/invites";
import { spacing } from "@/constants/spacing";
import { colors } from "@/constants/theme";
import { listMyCirclesFromContext } from "@/lib/circles";
import { useProfileContext } from "@/lib/profile-context";
import type { CircleInvite } from "@/types/invites";

function openRoute(route: string) {
  router.push(route as Parameters<typeof router.push>[0]);
}

export default function InviteDetailScreen() {
  const { inviteId } = useLocalSearchParams();
  const { families } = useProfileContext();
  const [placeholderMessage, setPlaceholderMessage] = useState<string | null>(
    null,
  );
  const circles = useMemo(() => listMyCirclesFromContext(families), [families]);
  const invites = circles.flatMap((circle) =>
    getPlaceholderCircleInvites(circle.id),
  );
  const invite =
    invites.find(
      (item) => item.id === inviteId || item.inviteToken === inviteId,
    ) ?? null;
  const circle = invite
    ? (circles.find((item) => item.id === invite.circleId) ?? null)
    : null;

  function handlePlaceholderAction(nextInvite: CircleInvite, action: string) {
    setPlaceholderMessage(
      `${action} for ${nextInvite.recipientLabel ?? "this invite"} will connect to backend invite handling later.`,
    );
  }

  if (!invite) {
    return (
      <View style={styles.root}>
        <AppScreen>
          <AppHeader
            action={
              <QuickActionButton
                label="Back"
                onPress={() => openRoute("/circles")}
                toneColor={colors.brand.primary}
              />
            }
            eyebrow="Invite"
            subtitle="This placeholder invite is not available in the current circle data."
            title="Invite not found"
          />
        </AppScreen>
      </View>
    );
  }

  return (
    <View style={styles.root}>
      <AppScreen>
        <AppHeader
          action={
            <QuickActionButton
              label="Circle"
              onPress={() =>
                openRoute(circle ? `/circles/${circle.id}` : "/circles")
              }
              toneColor={colors.brand.primary}
            />
          }
          eyebrow="Circle Invite"
          subtitle={`${circle?.name ?? "Family Circle"} invite placeholder.`}
          title={invite.recipientLabel ?? "Invite"}
        />

        <InviteCard
          invite={invite}
          onApprove={(item) => handlePlaceholderAction(item, "Admin approval")}
          onCopy={(item) => handlePlaceholderAction(item, "Copy link")}
          onOpen={(item) => handlePlaceholderAction(item, "Invite acceptance")}
          onShare={(item) => handlePlaceholderAction(item, "Copy/share")}
        />

        <WidgetCard
          accentColor={
            invite.permissionPreset === "caregiver"
              ? colors.status.warning
              : colors.brand.primary
          }
          action={
            <StatusPill
              label="Default access"
              tone={
                invite.permissionPreset === "caregiver" ? "warning" : "success"
              }
            />
          }
          subtitle="This is the access template the recipient will start with after acceptance and admin review."
          title="Permission preset"
        >
          <InvitePermissionPresetCard
            preset={invite.permissionPreset}
            selected
          />
        </WidgetCard>

        <WidgetCard
          accentColor={colors.status.ai}
          action={<StatusPill label="Placeholder methods" tone="ai" />}
          subtitle="QR, email, share link, and SMS/WhatsApp are represented without real delivery integrations."
          title="Invite methods"
        >
          <View style={styles.methodList}>
            {INVITE_METHODS.map((method) => (
              <InviteMethodCard
                key={method}
                method={method}
                selected={method === invite.method}
              />
            ))}
          </View>
        </WidgetCard>

        <WidgetCard
          accentColor={colors.status.success}
          action={<StatusPill label="Approval placeholder" tone="warning" />}
          subtitle="Admins will approve or revoke invites here once backend invite state exists."
          title="Admin approval"
        >
          <Text style={styles.muted}>
            Recipient joins, approval checks, expiry, and audit history are
            placeholders in this UI foundation.
          </Text>
        </WidgetCard>

        <Modal
          transparent
          visible={Boolean(placeholderMessage)}
          animationType="fade"
        >
          <Pressable
            style={styles.modalBackdrop}
            onPress={() => setPlaceholderMessage(null)}
          >
            <View style={styles.modalCard}>
              <Text style={styles.modalTitle}>Coming next</Text>
              <Text style={styles.modalText}>{placeholderMessage}</Text>
              <QuickActionButton
                label="Close"
                onPress={() => setPlaceholderMessage(null)}
                toneColor={colors.brand.primary}
              />
            </View>
          </Pressable>
        </Modal>
      </AppScreen>
    </View>
  );
}

const styles = StyleSheet.create({
  methodList: {
    gap: spacing.sm,
  },
  modalBackdrop: {
    alignItems: "center",
    backgroundColor: "rgba(15, 23, 42, 0.32)",
    flex: 1,
    justifyContent: "center",
    padding: spacing.xl,
  },
  modalCard: {
    backgroundColor: colors.card.background,
    borderColor: colors.border.soft,
    borderRadius: 24,
    borderWidth: 1,
    gap: spacing.md,
    maxWidth: 420,
    padding: spacing.xl,
    width: "100%",
  },
  modalText: {
    color: colors.text.secondary,
    fontSize: 15,
    lineHeight: 22,
  },
  modalTitle: {
    color: colors.text.primary,
    fontSize: 22,
    fontWeight: "900",
  },
  muted: {
    color: colors.text.muted,
    fontSize: 15,
    lineHeight: 22,
  },
  root: {
    backgroundColor: colors.background.app,
    flex: 1,
  },
});
