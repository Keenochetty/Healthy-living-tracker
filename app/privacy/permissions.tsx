import { useMemo, useState } from "react";
import { StyleSheet, Text, View } from "react-native";

import { AdultConsentCard } from "@/components/privacy/AdultConsentCard";
import { CaregiverPermissionCard } from "@/components/privacy/CaregiverPermissionCard";
import { PermissionToggleGroup } from "@/components/privacy/PermissionToggleGroup";
import { PrivacySummaryCard } from "@/components/privacy/PrivacySummaryCard";
import { TeenTransitionCard } from "@/components/privacy/TeenTransitionCard";
import { AppHeader, AppIcon, AppScreen, QuickActionButton, StatusPill, WidgetCard } from "@/components/ui";
import { PERMISSION_CATEGORIES, PERMISSION_PRESETS } from "@/constants/permissions";
import { spacing } from "@/constants/spacing";
import { colors } from "@/constants/theme";
import {
  buildPermissionPreset,
  buildPermissionSummary,
  canManageCircle,
  canViewAdultPrivateData,
  createPermissionAuditPlaceholder,
  getSafePreview,
  toPermissionGrants
} from "@/lib/permissions";
import type { PermissionAuditEvent, PermissionCategory } from "@/types/permissions";

export default function PermissionsScreen() {
  const [enabledPermissions, setEnabledPermissions] = useState<PermissionCategory[]>([
    "view_calendar",
    "view_health_summary",
    "view_emergency_info",
    "view_care_notes"
  ]);
  const [auditEvents, setAuditEvents] = useState<PermissionAuditEvent[]>([]);
  const summary = useMemo(
    () =>
      buildPermissionSummary({
        ageAccessStage: "adult_controlled",
        currentUserRole: "admin",
        isAssignedCaregiver: false,
        isSelfManagedAdult: false,
        privacyLevel: "private"
      }),
    []
  );
  const grants = toPermissionGrants(enabledPermissions, ["view_emergency_info"]);
  const presets = PERMISSION_PRESETS.map((preset) => buildPermissionPreset(preset));
  const adultPrivateDataVisible = canViewAdultPrivateData(enabledPermissions);
  const canAdminManageCircle = canManageCircle("admin");

  function handlePermissionChange(category: PermissionCategory, enabled: boolean) {
    setEnabledPermissions((current) => {
      if (enabled) {
        return Array.from(new Set([...current, category]));
      }

      return current.filter((item) => item !== category);
    });
    setAuditEvents((current) => [createPermissionAuditPlaceholder(category, enabled), ...current].slice(0, 4));
  }

  return (
    <View style={styles.root}>
      <AppScreen>
        <AppHeader
          action={<StatusPill label="UI foundation" tone="ai" />}
          eyebrow="Privacy"
          subtitle="Circle and care profile permission controls before backend policies and RLS are implemented."
          title="Permissions"
        />

        <PrivacySummaryCard summary={summary} title="Adult private profile rules" />

        <WidgetCard
          accentColor={colors.status.ai}
          action={<StatusPill label={`${presets.length} presets`} tone="ai" />}
          subtitle="Presets describe the intended starting point. Final enforcement will come with backend policies later."
          title="Permission presets"
        >
          <View style={styles.presetList}>
            {presets.map((preset) => (
              <View key={preset.name} style={styles.presetCard}>
                <View style={styles.presetTitleRow}>
                  <Text style={styles.presetTitle}>{preset.title}</Text>
                  <StatusPill label={`${preset.grants.length} permissions`} tone={preset.name === "custom" ? "warning" : "default"} />
                </View>
                <Text style={styles.muted}>{preset.description}</Text>
              </View>
            ))}
          </View>
        </WidgetCard>

        <WidgetCard
          accentColor={colors.brand.primary}
          action={<StatusPill label={`${PERMISSION_CATEGORIES.length} permissions`} tone="success" />}
          subtitle="These toggles are local placeholders for future persistence and policy enforcement."
          title="Permission settings"
        >
          <PermissionToggleGroup grants={grants} onChange={handlePermissionChange} />
        </WidgetCard>

        <AdultConsentCard onRequestConsent={() => handlePermissionChange("manage_privacy", true)} />
        <TeenTransitionCard onOpenSettings={() => handlePermissionChange("view_health_summary", true)} />
        <CaregiverPermissionCard onConfigure={() => handlePermissionChange("assign_caregivers", true)} />

        <WidgetCard
          accentColor={colors.status.success}
          action={<StatusPill label="Safe preview" tone="success" />}
          subtitle="Sensitive data is suppressed before it reaches cards, lock-screen previews, or AI summaries."
          title="Sensitive data preview"
        >
          <Text style={styles.previewText}>
            {getSafePreview("Medication: private adult health note hidden from dashboard cards.", adultPrivateDataVisible)}
          </Text>
          <Text style={styles.muted}>
            Admin circle management is {canAdminManageCircle ? "allowed" : "blocked"}, but adult private health access still needs consent.
          </Text>
        </WidgetCard>

        <WidgetCard
          accentColor={colors.status.warning}
          action={<StatusPill label={`${auditEvents.length} local`} tone="warning" />}
          subtitle="Permission changes create a local audit placeholder only. No backend audit table is written yet."
          title="Audit log placeholder"
        >
          {auditEvents.length > 0 ? (
            <View style={styles.auditList}>
              {auditEvents.map((event) => (
                <Text key={`${event.createdAt}-${event.category}`} style={styles.muted}>
                  {event.category} {event.enabled ? "enabled" : "disabled"} at {new Date(event.createdAt).toLocaleTimeString()}
                </Text>
              ))}
            </View>
          ) : (
            <Text style={styles.muted}>No local permission changes yet.</Text>
          )}
          <View style={styles.placeholderList}>
            <QuickActionButton
              icon={<AppIcon color={colors.status.warning} name="lock" size={20} />}
              label="Write audit placeholder"
              onPress={() => handlePermissionChange("view_activity_logs", true)}
              toneColor={colors.status.warning}
            />
          </View>
          <Text style={styles.muted}>No database policies are created in this foundation step.</Text>
        </WidgetCard>
      </AppScreen>
    </View>
  );
}

const styles = StyleSheet.create({
  auditList: {
    gap: spacing.xs
  },
  muted: {
    color: colors.text.muted,
    fontSize: 14,
    lineHeight: 20
  },
  placeholderList: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm
  },
  presetCard: {
    backgroundColor: colors.background.warm,
    borderColor: colors.border.soft,
    borderRadius: 18,
    borderWidth: 1,
    gap: spacing.sm,
    padding: spacing.md
  },
  presetList: {
    gap: spacing.md
  },
  presetTitle: {
    color: colors.text.primary,
    flex: 1,
    fontSize: 16,
    fontWeight: "900"
  },
  presetTitleRow: {
    alignItems: "center",
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm
  },
  previewText: {
    color: colors.text.primary,
    fontSize: 16,
    fontWeight: "800",
    lineHeight: 22
  },
  root: {
    backgroundColor: colors.background.app,
    flex: 1
  }
});
