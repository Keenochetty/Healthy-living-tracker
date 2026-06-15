import { router, useLocalSearchParams } from "expo-router";
import { useMemo, useState } from "react";
import {
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

import { CaregiverAssignmentCard } from "@/components/caregiver/CaregiverAssignmentCard";
import { CaregiverAssignmentPermissions } from "@/components/caregiver/CaregiverAssignmentPermissions";
import {
  AppHeader,
  AppIcon,
  AppScreen,
  QuickActionButton,
  StatusPill,
  WidgetCard,
} from "@/components/ui";
import {
  CAREGIVER_ASSIGNMENT_PRESETS,
  caregiverAssignmentPresetDescriptions,
  caregiverAssignmentPresetLabels,
} from "@/constants/caregiver-assignments";
import { spacing } from "@/constants/spacing";
import { colors } from "@/constants/theme";
import {
  buildCaregiverAssignmentPermissions,
  buildPlaceholderCaregiverAssignment,
  revokeCaregiverAssignment,
  updateCaregiverAssignmentPermission,
} from "@/lib/caregiver-assignments";
import { listMyCirclesFromContext } from "@/lib/circles";
import { useProfileContext } from "@/lib/profile-context";
import type {
  CaregiverAssignment,
  CaregiverAssignmentPermissionKey,
  CaregiverAssignmentPreset,
} from "@/types/caregiver-assignments";

function openRoute(route: string) {
  router.push(route as Parameters<typeof router.push>[0]);
}

const mockCaregivers = [
  {
    email: "caregiver@example.com",
    id: "placeholder-caregiver-profile",
    name: "Maya Stone",
    phone: "+1 555 014 2700",
  },
  {
    email: "sam.care@example.com",
    id: "placeholder-caregiver-sam",
    name: "Sam Rivera",
    phone: "+1 555 014 2755",
  },
];

export default function AssignCaregiverScreen() {
  const { careProfileId } = useLocalSearchParams();
  const { families, profile } = useProfileContext();
  const circles = useMemo(() => listMyCirclesFromContext(families), [families]);
  const careProfiles = circles.flatMap((circle) =>
    circle.careProfiles.map((careProfile) => ({
      ...careProfile,
      circleName: circle.name,
    })),
  );
  const initialProfile =
    careProfiles.find((item) => item.id === careProfileId) ??
    careProfiles[0] ??
    null;
  const [selectedCareProfileId, setSelectedCareProfileId] = useState(
    initialProfile?.id ??
      (typeof careProfileId === "string"
        ? careProfileId
        : "placeholder-care-profile"),
  );
  const selectedCareProfile =
    careProfiles.find((item) => item.id === selectedCareProfileId) ??
    initialProfile;
  const selectedCircle = selectedCareProfile
    ? (circles.find((circle) => circle.id === selectedCareProfile.circleId) ??
      null)
    : null;
  const [selectedCaregiverId, setSelectedCaregiverId] = useState(
    mockCaregivers[0].id,
  );
  const selectedCaregiver =
    mockCaregivers.find((caregiver) => caregiver.id === selectedCaregiverId) ??
    mockCaregivers[0];
  const [preset, setPreset] = useState<CaregiverAssignmentPreset>("basic_care");
  const [permissions, setPermissions] = useState(() =>
    buildCaregiverAssignmentPermissions("basic_care"),
  );
  const [notes, setNotes] = useState(
    "Assigned-only access. No full circle browsing.",
  );
  const [assignment, setAssignment] = useState<CaregiverAssignment | null>(
    null,
  );
  const [placeholderMessage, setPlaceholderMessage] = useState<string | null>(
    null,
  );

  function handleSelectPreset(nextPreset: CaregiverAssignmentPreset) {
    setPreset(nextPreset);
    setPermissions(buildCaregiverAssignmentPermissions(nextPreset));
  }

  function handlePermissionChange(
    permissionKey: CaregiverAssignmentPermissionKey,
    enabled: boolean,
  ) {
    setPreset("custom");
    setPermissions((current) => ({
      ...current,
      [permissionKey]: enabled,
    }));
  }

  function handleBuildAssignment() {
    const nextAssignment = buildPlaceholderCaregiverAssignment({
      assignedByProfileId: profile?.id ?? "local-admin-profile",
      caregiverEmail: selectedCaregiver.email,
      caregiverName: selectedCaregiver.name,
      caregiverPhone: selectedCaregiver.phone,
      caregiverProfileId: selectedCaregiver.id,
      careProfileId: selectedCareProfile?.id ?? selectedCareProfileId,
      careProfileName:
        selectedCareProfile?.displayName ?? "Selected care profile",
      careProfileType: selectedCareProfile?.profileType ?? "elderly_dependent",
      circleId:
        selectedCircle?.id ??
        selectedCareProfile?.circleId ??
        "placeholder-circle",
      circleName:
        selectedCircle?.name ??
        selectedCareProfile?.circleName ??
        "Care Circle",
      notes,
      permissionPreset: preset,
    });

    setAssignment({
      ...nextAssignment,
      permissions,
    });
    setPlaceholderMessage(
      "Caregiver assignment saved locally as placeholder data. Audit log entry placeholder created.",
    );
  }

  function handleAssignmentPermissionChange(
    current: CaregiverAssignment,
    permissionKey: CaregiverAssignmentPermissionKey,
    enabled: boolean,
  ) {
    setAssignment(
      updateCaregiverAssignmentPermission(
        current,
        permissionKey,
        enabled,
        profile?.id ?? "local-admin-profile",
      ),
    );
    setPlaceholderMessage(
      "Permission change captured locally. Audit log persistence will be added later.",
    );
  }

  return (
    <View style={styles.root}>
      <AppScreen>
        <AppHeader
          action={
            <QuickActionButton
              label="Back"
              onPress={() =>
                openRoute(`/care-profiles/${selectedCareProfileId}`)
              }
              toneColor={colors.text.muted}
            />
          }
          eyebrow="Caregiver"
          subtitle="Assign one caregiver to one care profile with assigned-only placeholder permissions."
          title="Assign caregiver"
        />

        <WidgetCard
          accentColor={colors.status.success}
          action={<StatusPill label="Assigned-only" tone="success" />}
          subtitle="Caregivers cannot browse the full Family/Care Circle. They only see assigned profiles and granted fields."
          title="Assignment setup"
        >
          <View style={styles.form}>
            <Text style={styles.groupTitle}>Care profile</Text>
            <View style={styles.pillGrid}>
              {(careProfiles.length > 0
                ? careProfiles
                : [
                    {
                      id: selectedCareProfileId,
                      displayName: "Selected care profile",
                      circleName: "Care Circle",
                    },
                  ]
              ).map((item) => (
                <QuickActionButton
                  key={item.id}
                  icon={
                    selectedCareProfileId === item.id ? (
                      <AppIcon
                        color={colors.status.success}
                        name="sync"
                        size={18}
                      />
                    ) : undefined
                  }
                  label={item.displayName}
                  onPress={() => setSelectedCareProfileId(item.id)}
                  toneColor={
                    selectedCareProfileId === item.id
                      ? colors.status.success
                      : colors.text.muted
                  }
                />
              ))}
            </View>

            <Text style={styles.groupTitle}>Caregiver</Text>
            <View style={styles.pillGrid}>
              {mockCaregivers.map((caregiver) => (
                <QuickActionButton
                  key={caregiver.id}
                  icon={
                    selectedCaregiverId === caregiver.id ? (
                      <AppIcon
                        color={colors.brand.primary}
                        name="caregiver"
                        size={18}
                      />
                    ) : undefined
                  }
                  label={caregiver.name}
                  onPress={() => setSelectedCaregiverId(caregiver.id)}
                  toneColor={
                    selectedCaregiverId === caregiver.id
                      ? colors.brand.primary
                      : colors.text.muted
                  }
                />
              ))}
            </View>

            <Text style={styles.groupTitle}>Permission preset</Text>
            <View style={styles.presetList}>
              {CAREGIVER_ASSIGNMENT_PRESETS.map((item) => (
                <Pressable
                  accessibilityRole="button"
                  key={item}
                  onPress={() => handleSelectPreset(item)}
                  style={({ pressed }) => [
                    styles.presetCard,
                    preset === item && styles.selectedPreset,
                    pressed && styles.pressed,
                  ]}
                >
                  <View style={styles.presetTitleRow}>
                    <Text style={styles.presetTitle}>
                      {caregiverAssignmentPresetLabels[item]}
                    </Text>
                    {preset === item ? (
                      <StatusPill label="Selected" tone="success" />
                    ) : null}
                  </View>
                  <Text style={styles.muted}>
                    {caregiverAssignmentPresetDescriptions[item]}
                  </Text>
                </Pressable>
              ))}
            </View>

            <Text style={styles.groupTitle}>Customize permissions</Text>
            <CaregiverAssignmentPermissions
              permissions={permissions}
              onChange={handlePermissionChange}
            />

            <TextInput
              multiline
              onChangeText={setNotes}
              placeholder="Assignment notes optional"
              placeholderTextColor={colors.text.muted}
              style={[styles.input, styles.notesInput]}
              value={notes}
            />

            <QuickActionButton
              icon={
                <AppIcon
                  color={colors.status.success}
                  name="caregiver"
                  size={20}
                  variant="filled"
                />
              }
              label="Save assignment placeholder"
              onPress={handleBuildAssignment}
              toneColor={colors.status.success}
            />
          </View>
        </WidgetCard>

        {assignment ? (
          <CaregiverAssignmentCard
            assignment={assignment}
            onManagePermissions={() =>
              setPlaceholderMessage(
                "Manage permissions is represented by the grouped toggles in this foundation step.",
              )
            }
            onOpenProfile={() =>
              openRoute(`/care-profiles/${assignment.careProfileId}`)
            }
            onPermissionChange={handleAssignmentPermissionChange}
            onRevoke={(item) => {
              setAssignment(
                revokeCaregiverAssignment(
                  item,
                  profile?.id ?? "local-admin-profile",
                ),
              );
              setPlaceholderMessage(
                "Remove/revoke access captured locally. Future backend will revoke assignment and write audit history.",
              );
            }}
            showPermissionToggles
          />
        ) : null}

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
              <Text style={styles.modalTitle}>Assignment placeholder</Text>
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
  form: {
    gap: spacing.md,
  },
  groupTitle: {
    color: colors.text.primary,
    fontSize: 15,
    fontWeight: "900",
  },
  input: {
    backgroundColor: colors.card.background,
    borderColor: colors.border.soft,
    borderRadius: 16,
    borderWidth: 1,
    color: colors.text.primary,
    fontSize: 16,
    minHeight: 52,
    padding: spacing.md,
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
    fontSize: 14,
    lineHeight: 20,
  },
  notesInput: {
    minHeight: 96,
    textAlignVertical: "top",
  },
  pillGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
  },
  pressed: {
    opacity: 0.84,
    transform: [{ scale: 0.99 }],
  },
  presetCard: {
    backgroundColor: colors.card.background,
    borderColor: colors.border.soft,
    borderRadius: 18,
    borderWidth: 1,
    gap: spacing.sm,
    padding: spacing.md,
  },
  presetList: {
    gap: spacing.sm,
  },
  presetTitle: {
    color: colors.text.primary,
    flex: 1,
    fontSize: 16,
    fontWeight: "900",
  },
  presetTitleRow: {
    alignItems: "center",
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
  },
  root: {
    backgroundColor: colors.background.app,
    flex: 1,
  },
  selectedPreset: {
    backgroundColor: colors.status.successSoft,
    borderColor: colors.status.success,
  },
});
