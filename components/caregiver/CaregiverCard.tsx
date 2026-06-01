import { Pressable, StyleSheet, Text, View } from "react-native";

import { AppIcon, QuickActionButton, StatusPill } from "@/components/ui";
import { careProfileTypeLabels } from "@/constants/care-profiles";
import { spacing } from "@/constants/spacing";
import { colors } from "@/constants/theme";
import type { AssignedCareProfileSummary } from "@/types/caregiver-assignments";
import type { CaregiverAvailabilityDay, CaregiverCareType, CaregiverProfile } from "@/types/caregiver";

type CaregiverCardProps = {
  assignedCareProfiles?: AssignedCareProfileSummary[];
  caregiver: CaregiverProfile;
  onEdit?: () => void;
  onOpen?: () => void;
  onOpenAssignedProfile?: (profile: AssignedCareProfileSummary) => void;
  onShare?: () => void;
};

const careTypeLabels = {
  adults: "Adults",
  both: "Children and adults",
  children: "Children"
} as const satisfies Record<CaregiverCareType, string>;

const dayLabels = {
  friday: "Fri",
  monday: "Mon",
  saturday: "Sat",
  sunday: "Sun",
  thursday: "Thu",
  tuesday: "Tue",
  wednesday: "Wed"
} as const satisfies Record<CaregiverAvailabilityDay, string>;

function getFullName(caregiver: CaregiverProfile) {
  return [caregiver.firstName, caregiver.middleName, caregiver.lastName].filter(Boolean).join(" ");
}

function formatCurrency(value?: number | null) {
  if (typeof value !== "number") {
    return "Not set";
  }

  return new Intl.NumberFormat(undefined, {
    currency: "USD",
    maximumFractionDigits: 0,
    style: "currency"
  }).format(value);
}

export function CaregiverCard({ assignedCareProfiles = [], caregiver, onEdit, onOpen, onOpenAssignedProfile, onShare }: CaregiverCardProps) {
  const initials = [caregiver.firstName, caregiver.lastName].map((part) => part.slice(0, 1).toUpperCase()).join("");
  const availabilityDays = caregiver.availability.days.map((day) => dayLabels[day]).join(", ");
  const availabilityWindow = [caregiver.availability.availableFromTime, caregiver.availability.availableToTime].filter(Boolean).join(" - ");

  return (
    <Pressable accessibilityRole="button" onPress={onOpen} style={({ pressed }) => [styles.card, pressed && styles.pressed]}>
      <View style={styles.header}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{initials || "CG"}</Text>
        </View>
        <View style={styles.copy}>
          <View style={styles.titleRow}>
            <Text style={styles.name}>{getFullName(caregiver)}</Text>
            <StatusPill label={careTypeLabels[caregiver.careType]} tone="ai" />
          </View>
          <Text style={styles.meta}>{caregiver.serviceArea}</Text>
          <View style={styles.badges}>
            <StatusPill label={`${caregiver.yearsOfExperience} years experience`} tone="success" />
            <StatusPill label={caregiver.referencesStatus === "placeholder" ? "References placeholder" : "References available"} />
          </View>
        </View>
      </View>

      <Text style={styles.summary}>{caregiver.experienceSummary}</Text>

      <View style={styles.detailGrid}>
        <View style={styles.detailItem}>
          <Text style={styles.detailLabel}>Availability</Text>
          <Text style={styles.detailValue}>{availabilityDays || "Not set"}</Text>
          <Text style={styles.detailMeta}>{availabilityWindow || "Time not set"}</Text>
        </View>
        <View style={styles.detailItem}>
          <Text style={styles.detailLabel}>Hourly</Text>
          <Text style={styles.detailValue}>{formatCurrency(caregiver.rate.hourlyRate)}</Text>
          <Text style={styles.detailMeta}>{caregiver.rate.rateNotes ?? "Rate notes pending"}</Text>
        </View>
        <View style={styles.detailItem}>
          <Text style={styles.detailLabel}>Daily</Text>
          <Text style={styles.detailValue}>{formatCurrency(caregiver.rate.dailyRate)}</Text>
          <Text style={styles.detailMeta}>Daily care rate</Text>
        </View>
      </View>

      {assignedCareProfiles.length > 0 ? (
        <View style={styles.assignedSection}>
          <Text style={styles.sectionTitle}>Assigned care profiles</Text>
          {assignedCareProfiles.map((profile) => (
            <Pressable
              accessibilityRole="button"
              key={profile.id}
              onPress={() => onOpenAssignedProfile?.(profile)}
              style={({ pressed }) => [styles.assignedRow, pressed && styles.pressed]}
            >
              <View style={styles.assignedCopy}>
                <Text style={styles.assignedName}>{profile.displayName}</Text>
                <Text style={styles.assignedMeta}>{profile.circleName}</Text>
              </View>
              <StatusPill label={careProfileTypeLabels[profile.profileType]} tone="ai" />
            </Pressable>
          ))}
        </View>
      ) : null}

      <View style={styles.actions}>
        <QuickActionButton
          icon={<AppIcon color={colors.brand.primary} name="profiles" size={18} />}
          label="View profile"
          onPress={onOpen ?? (() => undefined)}
          toneColor={colors.brand.primary}
        />
        <QuickActionButton
          icon={<AppIcon color={colors.status.success} name="settings" size={18} />}
          label="Edit"
          onPress={onEdit ?? (() => undefined)}
          toneColor={colors.status.success}
        />
        <QuickActionButton
          icon={<AppIcon color={colors.status.ai} name="sync" size={18} />}
          label="Share"
          onPress={onShare ?? (() => undefined)}
          toneColor={colors.status.ai}
        />
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  actions: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm
  },
  assignedCopy: {
    flex: 1,
    gap: spacing.xs,
    minWidth: 160
  },
  assignedMeta: {
    color: colors.text.muted,
    fontSize: 13,
    lineHeight: 18
  },
  assignedName: {
    color: colors.text.primary,
    fontSize: 15,
    fontWeight: "900"
  },
  assignedRow: {
    alignItems: "center",
    backgroundColor: colors.card.background,
    borderColor: colors.border.soft,
    borderRadius: 16,
    borderWidth: 1,
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
    padding: spacing.md
  },
  assignedSection: {
    gap: spacing.sm
  },
  avatar: {
    alignItems: "center",
    backgroundColor: colors.status.aiSoft,
    borderRadius: 20,
    height: 60,
    justifyContent: "center",
    width: 60
  },
  avatarText: {
    color: colors.status.ai,
    fontSize: 20,
    fontWeight: "900"
  },
  badges: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
    marginTop: spacing.xs
  },
  card: {
    backgroundColor: colors.background.warm,
    borderColor: colors.border.soft,
    borderRadius: 22,
    borderWidth: 1,
    gap: spacing.md,
    padding: spacing.lg
  },
  copy: {
    flex: 1,
    gap: spacing.xs,
    minWidth: 210
  },
  detailGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.md
  },
  detailItem: {
    backgroundColor: colors.card.background,
    borderColor: colors.border.soft,
    borderRadius: 16,
    borderWidth: 1,
    flex: 1,
    gap: spacing.xs,
    minWidth: 150,
    padding: spacing.md
  },
  detailLabel: {
    color: colors.text.muted,
    fontSize: 12,
    fontWeight: "800",
    textTransform: "uppercase"
  },
  detailMeta: {
    color: colors.text.muted,
    fontSize: 13,
    lineHeight: 18
  },
  detailValue: {
    color: colors.text.primary,
    fontSize: 16,
    fontWeight: "900"
  },
  header: {
    alignItems: "center",
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.md
  },
  meta: {
    color: colors.text.muted,
    fontSize: 14,
    lineHeight: 20
  },
  name: {
    color: colors.text.primary,
    flex: 1,
    fontSize: 20,
    fontWeight: "900"
  },
  pressed: {
    opacity: 0.86,
    transform: [{ scale: 0.99 }]
  },
  summary: {
    color: colors.text.secondary,
    fontSize: 15,
    lineHeight: 22
  },
  sectionTitle: {
    color: colors.text.primary,
    fontSize: 15,
    fontWeight: "900"
  },
  titleRow: {
    alignItems: "center",
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm
  }
});
