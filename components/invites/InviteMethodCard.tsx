import { Pressable, StyleSheet, Text, View } from "react-native";

import { AppIcon, StatusPill } from "@/components/ui";
import { inviteMethodDescriptions, inviteMethodLabels } from "@/constants/invites";
import { spacing } from "@/constants/spacing";
import { colors } from "@/constants/theme";
import type { InviteMethod } from "@/types/invites";

type InviteMethodCardProps = {
  method: InviteMethod;
  onPress?: (method: InviteMethod) => void;
  selected?: boolean;
};

export function InviteMethodCard({ method, onPress, selected = false }: InviteMethodCardProps) {
  const iconName = method === "email" ? "notifications" : method === "qr_placeholder" ? "sync" : "family";

  return (
    <Pressable accessibilityRole="button" onPress={() => onPress?.(method)} style={({ pressed }) => [styles.card, selected && styles.selected, pressed && styles.pressed]}>
      <View style={styles.iconShell}>
        <AppIcon color={selected ? colors.brand.primary : colors.text.secondary} name={iconName} size={22} />
      </View>
      <View style={styles.copy}>
        <View style={styles.titleRow}>
          <Text style={styles.title}>{inviteMethodLabels[method]}</Text>
          {selected ? <StatusPill label="Selected" tone="success" /> : null}
        </View>
        <Text style={styles.description}>{inviteMethodDescriptions[method]}</Text>
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
