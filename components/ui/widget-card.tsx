import type { PropsWithChildren, ReactNode } from "react";
import { Pressable, StyleSheet, Text, View, type ViewStyle } from "react-native";

import { componentRadius } from "@/constants/radius";
import { spacing } from "@/constants/spacing";
import { colors, shadows } from "@/constants/theme";

type WidgetCardProps = PropsWithChildren<{
  accentColor?: string;
  action?: ReactNode;
  onPress?: () => void;
  subtitle?: string;
  style?: ViewStyle;
  title?: string;
}>;

export function WidgetCard({ accentColor = colors.brand.primary, action, children, onPress, style, subtitle, title }: WidgetCardProps) {
  const content = (
    <View style={[styles.card, style]}>
      {title || subtitle || action ? (
        <View style={styles.header}>
          <View style={styles.titleGroup}>
            {title ? <Text style={styles.title}>{title}</Text> : null}
            {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
          </View>
          {action}
        </View>
      ) : null}
      <View style={[styles.accent, { backgroundColor: accentColor }]} />
      {children}
    </View>
  );

  if (!onPress) {
    return content;
  }

  return (
    <Pressable accessibilityRole="button" onPress={onPress} style={({ pressed }) => [pressed && styles.pressed]}>
      {content}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  accent: {
    borderRadius: 999,
    height: 4,
    width: 44
  },
  card: {
    backgroundColor: colors.card.background,
    borderColor: colors.card.border,
    borderRadius: componentRadius.widget,
    borderWidth: 1,
    gap: spacing.md,
    padding: spacing.xl,
    ...shadows.card
  },
  header: {
    alignItems: "flex-start",
    flexDirection: "row",
    gap: spacing.md,
    justifyContent: "space-between"
  },
  pressed: {
    opacity: 0.9,
    transform: [{ scale: 0.985 }, { translateY: 1 }]
  },
  subtitle: {
    color: colors.text.muted,
    fontSize: 14,
    lineHeight: 20
  },
  title: {
    color: colors.text.primary,
    fontSize: 18,
    fontWeight: "700"
  },
  titleGroup: {
    flex: 1,
    gap: spacing.xs
  }
});
