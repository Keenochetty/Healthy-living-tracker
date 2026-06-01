import type { ReactNode } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { spacing } from "@/constants/spacing";
import { colors } from "@/constants/theme";

import { AppIcon, type AppIconName } from "./AppIcon";
import { StatusPill } from "./status-pill";

type AccessRowTone = "success" | "warning" | "emergency" | "ai" | "system" | "private";

type AccessControlRowProps = {
  action?: ReactNode;
  description: string;
  icon: AppIconName;
  label: string;
  onPress?: () => void;
  statusLabel: string;
  tone?: AccessRowTone;
};

const toneColor: Record<AccessRowTone, string> = {
  ai: colors.status.ai,
  emergency: colors.status.emergency,
  private: colors.text.secondary,
  success: colors.status.success,
  system: colors.status.system,
  warning: colors.status.warning
};

const pillTone: Record<AccessRowTone, "ai" | "default" | "emergency" | "success" | "warning"> = {
  ai: "ai",
  emergency: "emergency",
  private: "default",
  success: "success",
  system: "default",
  warning: "warning"
};

export function AccessControlRow({
  action,
  description,
  icon,
  label,
  onPress,
  statusLabel,
  tone = "system"
}: AccessControlRowProps) {
  const content = (
    <>
      <View style={[styles.iconShell, { backgroundColor: `${toneColor[tone]}1A` }]}>
        <AppIcon color={toneColor[tone]} name={icon} size={20} />
      </View>
      <View style={styles.copy}>
        <Text style={styles.label}>{label}</Text>
        <Text style={styles.description}>{description}</Text>
      </View>
      {action ?? <StatusPill label={statusLabel} tone={pillTone[tone]} />}
    </>
  );

  if (onPress) {
    return (
      <Pressable accessibilityRole="button" onPress={onPress} style={({ pressed }) => [styles.row, pressed && styles.pressed]}>
        {content}
      </Pressable>
    );
  }

  return <View style={styles.row}>{content}</View>;
}

const styles = StyleSheet.create({
  copy: {
    flex: 1,
    gap: spacing.xs,
    minWidth: 0
  },
  description: {
    color: colors.text.muted,
    fontSize: 12,
    lineHeight: 16
  },
  iconShell: {
    alignItems: "center",
    borderRadius: 14,
    height: 40,
    justifyContent: "center",
    width: 40
  },
  label: {
    color: colors.text.primary,
    fontSize: 14,
    fontWeight: "900"
  },
  pressed: {
    opacity: 0.82,
    transform: [{ scale: 0.99 }]
  },
  row: {
    alignItems: "center",
    backgroundColor: colors.background.warm,
    borderColor: colors.border.soft,
    borderRadius: 18,
    borderWidth: 1,
    flexDirection: "row",
    gap: spacing.sm,
    minHeight: 62,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm
  }
});
