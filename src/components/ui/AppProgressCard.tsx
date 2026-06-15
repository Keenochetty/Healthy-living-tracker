import { Text, View } from "react-native";

import type { AppIconName } from "@/constants/appIcons";
import { radius, spacing } from "@/theme/tokens";
import { useAppTheme } from "@/theme/ThemeProvider";
import { AppCard } from "./AppCard";
import { AppIcon } from "./AppIcon";

type AppProgressCardProps = {
  emoji?: string;
  helper?: string;
  iconName?: AppIconName;
  label?: string;
  max: number;
  title: string;
  value: number;
  variant?: "default" | "primary" | "success" | "warning" | "danger";
};

export function AppProgressCard({
  emoji,
  helper,
  iconName,
  label,
  max,
  title,
  value,
  variant = "primary",
}: AppProgressCardProps) {
  const { theme } = useAppTheme();
  const progress = max > 0 ? Math.min(value / max, 1) : 0;
  const color =
    variant === "success"
      ? theme.success
      : variant === "warning"
        ? theme.warning
        : variant === "danger"
          ? theme.danger
          : theme.primary;

  return (
    <AppCard>
      <View style={{ gap: spacing.md }}>
        <View
          style={{
            alignItems: "center",
            flexDirection: "row",
            justifyContent: "space-between",
          }}
        >
          <View
            style={{
              alignItems: "center",
              flexDirection: "row",
              gap: spacing.sm,
            }}
          >
            {iconName ? (
              <AppIcon
                name={iconName}
                size={18}
                variant={
                  variant === "success"
                    ? "success"
                    : variant === "warning"
                      ? "warning"
                      : variant === "danger"
                        ? "danger"
                        : "primary"
                }
              />
            ) : null}
            <Text
              style={{ color: theme.text, fontSize: 17, fontWeight: "900" }}
            >
              {emoji ? `${emoji} ` : ""}
              {title}
            </Text>
          </View>
          <Text style={{ color: theme.mutedText, fontWeight: "800" }}>
            {label ?? `${value} / ${max}`}
          </Text>
        </View>
        <View
          style={{
            backgroundColor: theme.primarySoft,
            borderRadius: radius.full,
            height: 10,
            overflow: "hidden",
          }}
        >
          <View
            style={{
              backgroundColor: color,
              borderRadius: radius.full,
              height: 10,
              width: `${progress * 100}%`,
            }}
          />
        </View>
        {helper ? (
          <Text style={{ color: theme.mutedText, lineHeight: 20 }}>
            {helper}
          </Text>
        ) : null}
      </View>
    </AppCard>
  );
}
