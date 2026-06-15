import type { ReactNode } from "react";
import { StyleSheet, Text, View } from "react-native";

import { spacing } from "@/constants/spacing";
import { colors } from "@/constants/theme";
import { WidgetCard } from "@/components/ui/widget-card";

type HealthCardProps = {
  accentColor?: string;
  footer?: ReactNode;
  label: string;
  onPress?: () => void;
  status?: string;
  subtitle?: string;
  value: string;
};

export function HealthCard({
  accentColor = colors.brand.primary,
  footer,
  label,
  onPress,
  status,
  subtitle,
  value,
}: HealthCardProps) {
  return (
    <WidgetCard accentColor={accentColor} onPress={onPress}>
      <View style={styles.header}>
        <Text style={styles.label}>{label}</Text>
        {status ? (
          <Text style={[styles.status, { color: accentColor }]}>{status}</Text>
        ) : null}
      </View>
      <Text style={styles.value}>{value}</Text>
      {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
      {footer}
    </WidgetCard>
  );
}

const styles = StyleSheet.create({
  header: {
    alignItems: "center",
    flexDirection: "row",
    gap: spacing.sm,
    justifyContent: "space-between",
  },
  label: {
    color: colors.text.muted,
    fontSize: 14,
    fontWeight: "600",
  },
  status: {
    fontSize: 13,
    fontWeight: "700",
  },
  subtitle: {
    color: colors.text.secondary,
    fontSize: 14,
    lineHeight: 20,
  },
  value: {
    color: colors.text.primary,
    fontSize: 28,
    fontWeight: "800",
  },
});
