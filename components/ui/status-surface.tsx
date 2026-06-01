import type { ReactNode } from "react";
import { StyleSheet, Text, View } from "react-native";

import { spacing } from "@/constants/spacing";
import { colors, shadows } from "@/constants/theme";

import { AppIcon, type AppIconName } from "./AppIcon";

type StatusSurfaceTone = "success" | "warning" | "emergency" | "ai" | "system" | "private" | "connected";

type StatusSurfaceProps = {
  action?: ReactNode;
  children?: ReactNode;
  description: string;
  icon?: AppIconName;
  title: string;
  tone?: StatusSurfaceTone;
};

const toneStyles: Record<StatusSurfaceTone, { backgroundColor: string; borderColor: string; color: string; iconBackground: string }> = {
  ai: {
    backgroundColor: colors.status.aiSoft,
    borderColor: "#D8D0FF",
    color: colors.status.ai,
    iconBackground: colors.card.background
  },
  connected: {
    backgroundColor: colors.brand.primarySoft,
    borderColor: colors.border.strong,
    color: colors.brand.primary,
    iconBackground: colors.card.background
  },
  emergency: {
    backgroundColor: colors.status.emergencySoft,
    borderColor: "#FDA4AF",
    color: colors.status.emergency,
    iconBackground: colors.card.background
  },
  private: {
    backgroundColor: colors.background.mist,
    borderColor: colors.border.soft,
    color: colors.text.secondary,
    iconBackground: colors.card.background
  },
  success: {
    backgroundColor: colors.status.successSoft,
    borderColor: colors.border.strong,
    color: colors.status.success,
    iconBackground: colors.card.background
  },
  system: {
    backgroundColor: colors.status.systemSoft,
    borderColor: colors.border.soft,
    color: colors.status.system,
    iconBackground: colors.card.background
  },
  warning: {
    backgroundColor: colors.status.warningSoft,
    borderColor: "#E4C36C",
    color: colors.status.warning,
    iconBackground: colors.card.background
  }
};

export function StatusSurface({
  action,
  children,
  description,
  icon = "shield",
  title,
  tone = "system"
}: StatusSurfaceProps) {
  const toneStyle = toneStyles[tone];

  return (
    <View style={[styles.surface, { backgroundColor: toneStyle.backgroundColor, borderColor: toneStyle.borderColor }]}>
      <View style={styles.header}>
        <View style={[styles.iconShell, { backgroundColor: toneStyle.iconBackground }]}>
          <AppIcon color={toneStyle.color} name={icon} size={23} />
        </View>
        <View style={styles.copy}>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.description}>{description}</Text>
        </View>
        {action ? <View style={styles.action}>{action}</View> : null}
      </View>
      {children ? <View style={styles.children}>{children}</View> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  action: {
    alignItems: "flex-end"
  },
  children: {
    gap: spacing.md
  },
  copy: {
    flex: 1,
    gap: spacing.xs,
    minWidth: 0
  },
  description: {
    color: colors.text.secondary,
    fontSize: 14,
    lineHeight: 20
  },
  header: {
    alignItems: "center",
    flexDirection: "row",
    gap: spacing.md
  },
  iconShell: {
    alignItems: "center",
    borderRadius: 18,
    height: 48,
    justifyContent: "center",
    width: 48
  },
  surface: {
    borderRadius: 24,
    borderWidth: 1,
    gap: spacing.md,
    padding: spacing.lg,
    ...shadows.soft
  },
  title: {
    color: colors.text.primary,
    fontSize: 18,
    fontWeight: "900"
  }
});
