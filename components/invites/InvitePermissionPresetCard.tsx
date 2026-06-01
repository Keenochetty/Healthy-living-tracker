import { Pressable, StyleSheet, Text, View } from "react-native";

import { AppIcon, StatusPill } from "@/components/ui";
import {
  invitePermissionPresetDescriptions,
  invitePermissionPresetDetails,
  invitePermissionPresetLabels
} from "@/constants/invites";
import { spacing } from "@/constants/spacing";
import { colors } from "@/constants/theme";
import type { InvitePermissionPreset } from "@/types/invites";

type InvitePermissionPresetCardProps = {
  onPress?: (preset: InvitePermissionPreset) => void;
  preset: InvitePermissionPreset;
  selected?: boolean;
};

export function InvitePermissionPresetCard({ onPress, preset, selected = false }: InvitePermissionPresetCardProps) {
  const toneColor = preset === "caregiver" ? colors.status.warning : preset === "parent_guardian" ? colors.status.success : colors.brand.primary;

  return (
    <Pressable
      accessibilityRole="button"
      onPress={() => onPress?.(preset)}
      style={({ pressed }) => [styles.card, selected && styles.selected, pressed && styles.pressed]}
    >
      <View style={[styles.iconShell, selected && styles.selectedIcon]}>
        <AppIcon color={selected ? toneColor : colors.text.secondary} name={preset === "caregiver" ? "care" : "family"} size={22} />
      </View>

      <View style={styles.copy}>
        <View style={styles.titleRow}>
          <Text style={styles.title}>{invitePermissionPresetLabels[preset]}</Text>
          {selected ? <StatusPill label="Selected" tone="success" /> : null}
        </View>
        <Text style={styles.description}>{invitePermissionPresetDescriptions[preset]}</Text>
        <View style={styles.detailRow}>
          {invitePermissionPresetDetails[preset].map((detail) => (
            <StatusPill key={detail} label={detail} tone={preset === "caregiver" ? "warning" : "default"} />
          ))}
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    alignItems: "center",
    backgroundColor: colors.card.background,
    borderColor: colors.border.soft,
    borderRadius: 18,
    borderWidth: 1,
    flexDirection: "row",
    gap: spacing.md,
    padding: spacing.md
  },
  copy: {
    flex: 1,
    gap: spacing.xs,
    minWidth: 190
  },
  description: {
    color: colors.text.muted,
    fontSize: 14,
    lineHeight: 20
  },
  detailRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.xs,
    marginTop: spacing.xs
  },
  iconShell: {
    alignItems: "center",
    backgroundColor: colors.background.mist,
    borderRadius: 15,
    height: 44,
    justifyContent: "center",
    width: 44
  },
  pressed: {
    opacity: 0.84,
    transform: [{ scale: 0.99 }]
  },
  selected: {
    backgroundColor: colors.brand.primarySoft,
    borderColor: colors.brand.primary
  },
  selectedIcon: {
    backgroundColor: colors.card.background
  },
  title: {
    color: colors.text.primary,
    flex: 1,
    fontSize: 16,
    fontWeight: "900"
  },
  titleRow: {
    alignItems: "center",
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm
  }
});
