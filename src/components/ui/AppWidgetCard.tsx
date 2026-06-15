import { ReactNode } from "react";
import { Text, View } from "react-native";

import type { AppIconName } from "@/constants/appIcons";
import { fontSizes, spacing } from "@/theme/tokens";
import { useAppTheme } from "@/theme/ThemeProvider";
import { AppCard } from "./AppCard";
import { AppIcon } from "./AppIcon";

type AppWidgetCardProps = {
  emoji?: string;
  helper?: string;
  icon?: ReactNode;
  iconName?: AppIconName;
  onPress?: () => void;
  size?: "small" | "medium" | "large";
  title: string;
  value: string;
  variant?:
    | "pink"
    | "blue"
    | "green"
    | "purple"
    | "orange"
    | "yellow"
    | "neutral"
    | "dark";
};

export function AppWidgetCard({
  emoji,
  helper,
  icon,
  iconName,
  onPress,
  size = "medium",
  title,
  value,
  variant = "neutral",
}: AppWidgetCardProps) {
  const { theme } = useAppTheme();
  const backgroundColor = getWidgetBackground(variant, theme);
  const large = size === "large";

  return (
    <AppCard
      backgroundColor={backgroundColor}
      onPress={onPress}
      padding={size === "small" ? "md" : "lg"}
      radius="xl"
      style={{
        justifyContent: "space-between",
        minHeight: large ? 148 : size === "small" ? 104 : 122,
        width: large ? "100%" : "48%",
      }}
    >
      <View style={{ gap: spacing.lg }}>
        <View
          style={{
            alignItems: "center",
            flexDirection: "row",
            justifyContent: "space-between",
          }}
        >
          <Text
            style={{
              color: theme.mutedText,
              flex: 1,
              fontSize: fontSizes.sm,
              fontWeight: "800",
            }}
          >
            {title}
          </Text>
          {iconName ? (
            <AppIcon
              container
              containerVariant="soft"
              name={iconName}
              size={18}
              variant={
                variant === "green"
                  ? "success"
                  : variant === "orange" || variant === "yellow"
                    ? "warning"
                    : variant === "pink" || variant === "purple"
                      ? "private"
                      : "primary"
              }
            />
          ) : emoji ? (
            <Text style={{ fontSize: 18 }}>{emoji}</Text>
          ) : (
            icon
          )}
        </View>
        <View>
          <Text
            style={{
              color: theme.text,
              fontSize: large ? fontSizes["2xl"] : fontSizes.xl,
              fontWeight: "900",
            }}
          >
            {value}
          </Text>
          {helper ? (
            <Text
              style={{
                color: theme.mutedText,
                fontSize: fontSizes.sm,
                lineHeight: 18,
                marginTop: 4,
              }}
            >
              {helper}
            </Text>
          ) : null}
        </View>
      </View>
    </AppCard>
  );
}

function getWidgetBackground(
  variant: NonNullable<AppWidgetCardProps["variant"]>,
  theme: ReturnType<typeof useAppTheme>["theme"],
) {
  const map = {
    blue: "#eff6ff",
    dark: theme.surface,
    green: "#f0fdf4",
    neutral: theme.surface,
    orange: "#fff7ed",
    pink: "#fdf2f8",
    purple: "#f5f3ff",
    yellow: "#fefce8",
  } as const;

  return theme.background === "#0f172a" ? theme.surface : map[variant];
}
