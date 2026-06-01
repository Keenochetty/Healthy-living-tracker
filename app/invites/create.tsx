import { router, useLocalSearchParams } from "expo-router";
import { useMemo, useState } from "react";
import { Modal, Pressable, StyleSheet, Text, TextInput, View } from "react-native";

import { InviteCard } from "@/components/invites/InviteCard";
import { InviteMethodCard } from "@/components/invites/InviteMethodCard";
import { InvitePermissionPresetCard } from "@/components/invites/InvitePermissionPresetCard";
import { AppHeader, AppIcon, AppScreen, QuickActionButton, StatusPill, WidgetCard } from "@/components/ui";
import {
  CIRCLE_MEMBER_ROLES,
  CIRCLE_RELATIONSHIPS,
  CIRCLE_PERMISSIONS,
  circlePermissionLabels,
  circleRelationshipLabels,
  circleRoleLabels
} from "@/constants/circles";
import {
  INVITE_METHODS,
  INVITE_PERMISSION_PRESETS
} from "@/constants/invites";
import { spacing } from "@/constants/spacing";
import { colors } from "@/constants/theme";
import { getCircleById, listMyCirclesFromContext } from "@/lib/circles";
import { buildPlaceholderCircleInvite, getDefaultPermissionsForInvitePreset } from "@/lib/invites";
import { useProfileContext } from "@/lib/profile-context";
import type { CirclePermission, CircleRelationship } from "@/types/circles";
import type { CircleInvite, InviteMethod, InvitePermissionPreset, InviteRole } from "@/types/invites";

function openRoute(route: string) {
  router.push(route as Parameters<typeof router.push>[0]);
}

const inviteRoles = CIRCLE_MEMBER_ROLES.filter((item): item is InviteRole => item !== "owner");

export default function CreateInviteScreen() {
  const { circleId } = useLocalSearchParams();
  const { families, profile } = useProfileContext();
  const circles = useMemo(() => listMyCirclesFromContext(families), [families]);
  const circle = getCircleById(circles, circleId);
  const [method, setMethod] = useState<InviteMethod>("share_link");
  const [relationship, setRelationship] = useState<CircleRelationship>("other");
  const [role, setRole] = useState<InviteRole>("member");
  const [permissionPreset, setPermissionPreset] = useState<InvitePermissionPreset>("adult_family_member");
  const [recipientLabel, setRecipientLabel] = useState("");
  const [invitedEmail, setInvitedEmail] = useState("");
  const [invitedPhone, setInvitedPhone] = useState("");
  const [defaultPermissions, setDefaultPermissions] = useState<CirclePermission[]>(getDefaultPermissionsForInvitePreset("adult_family_member"));
  const [invite, setInvite] = useState<CircleInvite | null>(null);
  const [placeholderMessage, setPlaceholderMessage] = useState<string | null>(null);
  const backRoute = circle ? `/circles/${circle.id}` : "/circles";

  function togglePermission(permission: CirclePermission) {
    setDefaultPermissions((current) =>
      current.includes(permission)
        ? current.filter((item) => item !== permission)
        : [...current, permission]
    );
  }

  function handleSelectPreset(preset: InvitePermissionPreset) {
    setPermissionPreset(preset);
    setDefaultPermissions(getDefaultPermissionsForInvitePreset(preset));
    if (preset === "caregiver") {
      setRole("caregiver");
      setRelationship("caregiver");
    } else if (preset === "viewer") {
      setRole("viewer");
    }
  }

  function handleGenerateInvite() {
    if (!circle) {
      return;
    }

    setInvite(buildPlaceholderCircleInvite({
      circleId: circle.id,
      createdBy: profile?.display_name || profile?.full_name || "Circle admin",
      defaultPermissions,
      invitedEmail,
      invitedPhone,
      method,
      recipientLabel,
      permissionPreset,
      relationship,
      role
    }));
  }

  function handlePlaceholderShare(action: string) {
    setPlaceholderMessage(`${action} is a placeholder for now. The invite token is ready for future copy/share integration.`);
  }

  if (!circle) {
    return (
      <View style={styles.root}>
        <AppScreen>
          <AppHeader
            action={<QuickActionButton label="Back" onPress={() => openRoute("/circles")} toneColor={colors.brand.primary} />}
            eyebrow="Invite"
            subtitle="Choose a circle before creating an invite."
            title="Circle not found"
          />
        </AppScreen>
      </View>
    );
  }

  return (
    <View style={styles.root}>
      <AppScreen>
        <AppHeader
          action={<QuickActionButton label="Back" onPress={() => openRoute(backRoute)} toneColor={colors.text.muted} />}
          eyebrow="Circle Invite"
          subtitle={`Create a placeholder invite for ${circle.name}. Recipient acceptance and backend delivery come later.`}
          title="Create invite"
        />

        <WidgetCard
          accentColor={colors.brand.primary}
          action={<StatusPill label="Admin flow" tone="success" />}
          subtitle="Select invite method, relationship, role, and default permissions."
          title="Invite setup"
        >
          <View style={styles.form}>
            <TextInput
              onChangeText={setRecipientLabel}
              placeholder="Recipient label optional"
              placeholderTextColor={colors.text.muted}
              style={styles.input}
              value={recipientLabel}
            />
            <TextInput
              autoCapitalize="none"
              keyboardType="email-address"
              onChangeText={setInvitedEmail}
              placeholder="Email optional"
              placeholderTextColor={colors.text.muted}
              style={styles.input}
              value={invitedEmail}
            />
            <TextInput
              keyboardType="phone-pad"
              onChangeText={setInvitedPhone}
              placeholder="Phone optional"
              placeholderTextColor={colors.text.muted}
              style={styles.input}
              value={invitedPhone}
            />

            <Text style={styles.groupTitle}>Invite method</Text>
            <View style={styles.methodGrid}>
              {INVITE_METHODS.map((item) => (
                <InviteMethodCard key={item} method={item} onPress={setMethod} selected={method === item} />
              ))}
            </View>

            <Text style={styles.groupTitle}>Relationship</Text>
            <View style={styles.pillGrid}>
              {CIRCLE_RELATIONSHIPS.map((item) => (
                <QuickActionButton
                  key={item}
                  icon={relationship === item ? <AppIcon color={colors.brand.primary} name="sync" size={18} /> : undefined}
                  label={circleRelationshipLabels[item]}
                  onPress={() => setRelationship(item)}
                  toneColor={relationship === item ? colors.brand.primary : colors.text.muted}
                />
              ))}
            </View>

            <Text style={styles.groupTitle}>Role</Text>
            <View style={styles.pillGrid}>
              {inviteRoles.map((item) => (
                <QuickActionButton
                  key={item}
                  icon={role === item ? <AppIcon color={colors.status.success} name="sync" size={18} /> : undefined}
                  label={circleRoleLabels[item]}
                  onPress={() => setRole(item)}
                  toneColor={role === item ? colors.status.success : colors.text.muted}
                />
              ))}
            </View>

            <Text style={styles.groupTitle}>Permission preset</Text>
            <View style={styles.methodGrid}>
              {INVITE_PERMISSION_PRESETS.map((preset) => (
                <InvitePermissionPresetCard
                  key={preset}
                  onPress={handleSelectPreset}
                  preset={preset}
                  selected={permissionPreset === preset}
                />
              ))}
            </View>

            <Text style={styles.groupTitle}>Default permissions</Text>
            <View style={styles.pillGrid}>
              {CIRCLE_PERMISSIONS.map((permission) => (
                <QuickActionButton
                  key={permission}
                  icon={defaultPermissions.includes(permission) ? <AppIcon color={colors.status.ai} name="sync" size={18} /> : undefined}
                  label={circlePermissionLabels[permission]}
                  onPress={() => togglePermission(permission)}
                  toneColor={defaultPermissions.includes(permission) ? colors.status.ai : colors.text.muted}
                />
              ))}
            </View>

            <QuickActionButton
              icon={<AppIcon color={colors.brand.primary} name="family" size={20} variant="filled" />}
              label="Generate invite link"
              onPress={handleGenerateInvite}
              toneColor={colors.brand.primary}
            />
          </View>
        </WidgetCard>

        <WidgetCard
          accentColor={colors.status.ai}
          action={<StatusPill label="QR placeholder" tone="warning" />}
          subtitle="Real QR generation is intentionally deferred until a QR package is intentionally added."
          title="QR code"
        >
          <View style={styles.qrPlaceholder}>
            <Text style={styles.qrText}>QR</Text>
            <Text style={styles.muted}>Placeholder only</Text>
          </View>
        </WidgetCard>

        {invite ? (
          <WidgetCard
            accentColor={colors.status.success}
            action={<StatusPill label="Generated" tone="success" />}
            subtitle="This token is local placeholder data only."
            title="Generated invite"
          >
            <InviteCard
              invite={invite}
              onApprove={() => handlePlaceholderShare("Admin approval")}
              onCopy={() => handlePlaceholderShare("Copy invite link")}
              onOpen={() => openRoute(`/invites/${invite.id}`)}
              onShare={() => handlePlaceholderShare("Copy/share invite")}
            />
          </WidgetCard>
        ) : null}

        <Modal transparent visible={Boolean(placeholderMessage)} animationType="fade">
          <Pressable style={styles.modalBackdrop} onPress={() => setPlaceholderMessage(null)}>
            <View style={styles.modalCard}>
              <Text style={styles.modalTitle}>Coming next</Text>
              <Text style={styles.modalText}>{placeholderMessage}</Text>
              <QuickActionButton label="Close" onPress={() => setPlaceholderMessage(null)} toneColor={colors.brand.primary} />
            </View>
          </Pressable>
        </Modal>
      </AppScreen>
    </View>
  );
}

const styles = StyleSheet.create({
  form: {
    gap: spacing.md
  },
  groupTitle: {
    color: colors.text.primary,
    fontSize: 15,
    fontWeight: "900"
  },
  input: {
    backgroundColor: colors.card.background,
    borderColor: colors.border.soft,
    borderRadius: 16,
    borderWidth: 1,
    color: colors.text.primary,
    fontSize: 16,
    minHeight: 52,
    padding: spacing.md
  },
  methodGrid: {
    gap: spacing.sm
  },
  modalBackdrop: {
    alignItems: "center",
    backgroundColor: "rgba(15, 23, 42, 0.32)",
    flex: 1,
    justifyContent: "center",
    padding: spacing.xl
  },
  modalCard: {
    backgroundColor: colors.card.background,
    borderColor: colors.border.soft,
    borderRadius: 24,
    borderWidth: 1,
    gap: spacing.md,
    maxWidth: 420,
    padding: spacing.xl,
    width: "100%"
  },
  modalText: {
    color: colors.text.secondary,
    fontSize: 15,
    lineHeight: 22
  },
  modalTitle: {
    color: colors.text.primary,
    fontSize: 22,
    fontWeight: "900"
  },
  muted: {
    color: colors.text.muted,
    fontSize: 14,
    lineHeight: 20,
    textAlign: "center"
  },
  pillGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm
  },
  qrPlaceholder: {
    alignItems: "center",
    backgroundColor: colors.background.warm,
    borderColor: colors.border.soft,
    borderRadius: 24,
    borderWidth: 1,
    gap: spacing.sm,
    height: 180,
    justifyContent: "center"
  },
  qrText: {
    color: colors.status.ai,
    fontSize: 44,
    fontWeight: "900"
  },
  root: {
    backgroundColor: colors.background.app,
    flex: 1
  }
});
