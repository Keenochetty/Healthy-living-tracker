import type { PropsWithChildren, ReactNode } from "react";
import { Pressable, Text, View, type ViewStyle } from "react-native";

import { componentMetrics } from "@/constants/layout";
import { componentRadius } from "@/constants/radius";
import { spacing } from "@/constants/spacing";
import { typography, useHealthTheme } from "@/constants/theme";

export type AppCardVariant = "standard" | "compact" | "flat" | "hero";

type AppCardProps = PropsWithChildren<{
  action?: ReactNode;
  accentColor?: string;
  onPress?: () => void;
  subtitle?: string;
  style?: ViewStyle;
  title?: string;
  variant?: AppCardVariant;
}>;

export function AppCard({
  accentColor,
  action,
  children,
  onPress,
  style,
  subtitle,
  title,
  variant = "standard",
}: AppCardProps) {
  const { colors, elevations } = useHealthTheme();
  const compact = variant === "compact";
  const flat = variant === "flat";
  const hero = variant === "hero";
  const content = (
    <View
      style={[
        {
          backgroundColor: flat
            ? colors.surface.secondary
            : colors.surface.glassStrong,
          borderColor: colors.border.soft,
          borderRadius: hero
            ? componentRadius.hero
            : compact
              ? componentRadius.compactCard
              : componentRadius.card,
          borderWidth: 1,
          gap: compact ? spacing.sm : spacing.md,
          overflow: "hidden",
          padding: compact
            ? componentMetrics.card.compactPadding
            : hero
              ? spacing["2xl"]
              : componentMetrics.card.padding,
          ...(flat ? elevations.none : elevations.card),
        },
        style,
      ]}
    >
      {accentColor ? (
        <View
          style={{
            backgroundColor: accentColor,
            borderRadius: componentRadius.chip,
            height: 3,
            width: 36,
          }}
        />
      ) : null}
      {title || subtitle || action ? (
        <View
          style={{
            alignItems: "flex-start",
            flexDirection: "row",
            gap: spacing.md,
            justifyContent: "space-between",
          }}
        >
          <View style={{ flex: 1, gap: spacing.xs }}>
            {title ? (
              <Text
                style={{ color: colors.text.primary, ...typography.cardTitle }}
              >
                {title}
              </Text>
            ) : null}
            {subtitle ? (
              <Text
                style={{
                  color: colors.text.secondary,
                  ...typography.bodySmall,
                }}
              >
                {subtitle}
              </Text>
            ) : null}
          </View>
          {action}
        </View>
      ) : null}
      {children}
    </View>
  );

  return onPress ? (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [
        pressed && { opacity: 0.9, transform: [{ scale: 0.985 }] },
      ]}
    >
      {content}
    </Pressable>
  ) : (
    content
  );
}
