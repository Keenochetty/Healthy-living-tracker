import type { ReactNode } from "react";
import { StyleSheet, Text, View } from "react-native";

import { spacing } from "@/constants/spacing";
import { colors } from "@/constants/theme";

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

const toneStyles: Record<StatusSurfaceTone, { backgroundColor: string; borderColor: string; color: string }> = {
  ai: {
    backgroundColor: colors.status.aiSoft,
    borderColor: "#D8D0FF",
    color: colors.status.ai
  },
  connected: {
    backgroundColor: colors.brand.primarySoft,
    borderColor: "#BFE5E1",
    color: colors.brand.primary
  },
  emergency: {
    backgroundColor: colors.status.emergencySoft,
    borderColor: "#FDA4AF",
    color: colors.status.emergency
  },
  private: {
    backgroundColor: colors.background.mist,
    borderColor: colors.border.soft,
    color: colors.text.secondary
  },
  success: {
    backgroundColor: colors.status.successSoft,
    borderColor: "#BFE8D7",
    color: colors.status.success
  },
  system: {
    backgroundColor: colors.status.systemSoft,
    borderColor: colors.border.soft,
    color: colors.status.system
  },
  warning: {
    backgroundColor: colors.status.warningSoft,
    borderColor: "#F2D28A",
    color: colors.status.warning
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
        <View style={[styles.iconShell, { backgroundColor: colors.card.background }]}>
          <AppIcon color={toneStyle.color} name={icon} size={20} />
        </View>
        <View style={styles.copy}>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.description} numberOfLines={2}>
            {description}
          </Text>
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
    gap: spacing.sm
  },
  copy: {
    flex: 1,
    gap: 2,
    minWidth: 0
  },
  description: {
    color: colors.text.secondary,
    fontSize: 13,
    lineHeight: 18
  },
  header: {
    alignItems: "center",
    flexDirection: "row",
    gap: spacing.sm
  },
  iconShell: {
    alignItems: "center",
    borderRadius: 14,
    height: 38,
    justifyContent: "center",
    width: 38
  },
  surface: {
    borderRadius: 18,
    borderWidth: 1,
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm
  },
  title: {
    color: colors.text.primary,
    fontSize: 15,
    fontWeight: "900"
  }
});
