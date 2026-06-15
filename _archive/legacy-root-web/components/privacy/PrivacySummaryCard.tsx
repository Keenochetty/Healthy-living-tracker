import { StyleSheet, Text, View } from "react-native";

import { StatusPill, WidgetCard } from "@/components/ui";
import {
  permissionCategoryLabels,
  privacyLevelDescriptions,
  privacyLevelLabels,
} from "@/constants/permissions";
import { spacing } from "@/constants/spacing";
import { colors } from "@/constants/theme";
import type { PermissionSummary } from "@/types/permissions";

type PrivacySummaryCardProps = {
  summary: PermissionSummary;
  title?: string;
};

export function PrivacySummaryCard({
  summary,
  title = "Privacy summary",
}: PrivacySummaryCardProps) {
  return (
    <WidgetCard
      accentColor={colors.status.ai}
      action={
        <StatusPill
          label={privacyLevelLabels[summary.privacyLevel]}
          tone={summary.privacyLevel === "private" ? "success" : "ai"}
        />
      }
      subtitle={privacyLevelDescriptions[summary.privacyLevel]}
      title={title}
    >
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Granted by default</Text>
        <View style={styles.pillRow}>
          {summary.defaultPermissions.map((permission) => (
            <StatusPill
              key={permission}
              label={permissionCategoryLabels[permission]}
              tone={permission.includes("manage") ? "success" : "default"}
            />
          ))}
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Controls</Text>
        <View style={styles.pillRow}>
          {summary.adultConsentRequired ? (
            <StatusPill label="Adult consent required" tone="warning" />
          ) : null}
          {summary.teenTransitionRequired ? (
            <StatusPill label="Teen transition" tone="warning" />
          ) : null}
          {summary.caregiverAssignmentRequired ? (
            <StatusPill label="Assign caregiver first" tone="warning" />
          ) : null}
          {!summary.adultConsentRequired &&
          !summary.teenTransitionRequired &&
          !summary.caregiverAssignmentRequired ? (
            <StatusPill label="No extra approval placeholder" tone="success" />
          ) : null}
        </View>
      </View>

      <View style={styles.section}>
        {summary.ruleNotes.map((note) => (
          <Text key={note} style={styles.note}>
            {note}
          </Text>
        ))}
      </View>
    </WidgetCard>
  );
}

const styles = StyleSheet.create({
  note: {
    color: colors.text.muted,
    fontSize: 14,
    lineHeight: 20,
  },
  pillRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
  },
  section: {
    gap: spacing.sm,
  },
  sectionTitle: {
    color: colors.text.primary,
    fontSize: 15,
    fontWeight: "900",
  },
});
