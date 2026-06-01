import { Pressable, StyleSheet, Text, View } from "react-native";

import { AppIcon, QuickActionButton, StatusPill } from "@/components/ui";
import {
  ageAccessStageLabels,
  careProfilePrivacyLabels,
  careProfileTypeLabels,
  getAgeAccessStageTone,
  getCareProfilePrivacyTone
} from "@/constants/care-profiles";
import { circleRelationshipLabels } from "@/constants/circles";
import { spacing } from "@/constants/spacing";
import { colors } from "@/constants/theme";
import { formatCareProfileAge, isAdultCareProfile } from "@/lib/care-profiles";
import type { CareProfile } from "@/types/care-profiles";

type CareProfileCardProps = {
  onCalendar?: (profile: CareProfile) => void;
  onCareNotes?: (profile: CareProfile) => void;
  onEmergency?: (profile: CareProfile) => void;
  onView?: (profile: CareProfile) => void;
  profile: CareProfile;
};

function getInitials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part.slice(0, 1).toUpperCase())
    .join("");
}

export function CareProfileCard({ onCalendar, onCareNotes, onEmergency, onView, profile }: CareProfileCardProps) {
  const adultProfile = isAdultCareProfile(profile);

  return (
    <Pressable accessibilityRole="button" onPress={() => onView?.(profile)} style={({ pressed }) => [styles.card, pressed && styles.pressed]}>
      <View style={[styles.avatar, adultProfile && styles.adultAvatar]}>
        <Text style={[styles.avatarText, adultProfile && styles.adultAvatarText]}>{getInitials(profile.displayName) || "CP"}</Text>
      </View>

      <View style={styles.copy}>
        <View style={styles.titleRow}>
          <Text style={styles.name}>{profile.displayName}</Text>
          <StatusPill label={careProfileTypeLabels[profile.profileType]} tone="ai" />
        </View>
        <Text style={styles.ageText}>{formatCareProfileAge(profile)}</Text>
        <Text style={styles.meta}>{profile.notes ?? "Care profile foundation"}</Text>
        <View style={styles.badges}>
          <StatusPill label={ageAccessStageLabels[profile.ageAccessStage]} tone={getAgeAccessStageTone(profile.ageAccessStage)} />
          <StatusPill label={careProfilePrivacyLabels[profile.privacyStatus]} tone={getCareProfilePrivacyTone(profile.privacyStatus)} />
          <StatusPill label={circleRelationshipLabels[profile.relationship]} />
          {profile.caregiverAssignmentStatus === "placeholder" ? <StatusPill label="Caregiver placeholder" tone="warning" /> : null}
        </View>
      </View>

      <View style={styles.actions}>
        <QuickActionButton
          icon={<AppIcon color={colors.brand.primary} name="profiles" size={18} />}
          label="View profile"
          onPress={() => onView?.(profile)}
          toneColor={colors.brand.primary}
        />
        <QuickActionButton
          icon={<AppIcon color={colors.accent.sky} name="calendar" size={18} />}
          label="Calendar"
          onPress={() => onCalendar?.(profile)}
          toneColor={colors.accent.sky}
        />
        <QuickActionButton
          icon={<AppIcon color={colors.status.emergency} name="emergency" size={18} />}
          label="Emergency"
          onPress={() => onEmergency?.(profile)}
          toneColor={colors.status.emergency}
        />
        <QuickActionButton
          icon={<AppIcon color={colors.status.success} name="note" size={18} />}
          label="Care notes"
          onPress={() => onCareNotes?.(profile)}
          toneColor={colors.status.success}
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
  adultAvatar: {
    backgroundColor: colors.brand.primarySoft
  },
  adultAvatarText: {
    color: colors.brand.primary
  },
  ageText: {
    color: colors.text.secondary,
    fontSize: 13,
    fontWeight: "800"
  },
  avatar: {
    alignItems: "center",
    backgroundColor: colors.status.aiSoft,
    borderRadius: 18,
    height: 54,
    justifyContent: "center",
    width: 54
  },
  avatarText: {
    color: colors.status.ai,
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
    backgroundColor: colors.background.warm,
    borderColor: colors.border.soft,
    borderRadius: 20,
    borderWidth: 1,
    gap: spacing.md,
    padding: spacing.md
  },
  copy: {
    gap: spacing.xs
  },
  meta: {
    color: colors.text.muted,
    fontSize: 14,
    lineHeight: 20
  },
  name: {
    color: colors.text.primary,
    flex: 1,
    fontSize: 18,
    fontWeight: "900"
  },
  pressed: {
    opacity: 0.86,
    transform: [{ scale: 0.99 }]
  },
  titleRow: {
    alignItems: "center",
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm
  }
});
