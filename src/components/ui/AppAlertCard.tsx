import { ReactNode } from "react";
import { Text, View } from "react-native";

import { fontSizes, spacing } from "@/theme/tokens";
import { useAppTheme } from "@/theme/ThemeProvider";
import { AppCard } from "./AppCard";

type AppAlertCardProps = {
  icon?: ReactNode;
  message: string;
  title: string;
  variant?: "info" | "warning" | "danger" | "success" | "privacy" | "medical";
};

export function AppAlertCard({ icon, message, title, variant = "info" }: AppAlertCardProps) {
  const { theme } = useAppTheme();
  const colors = getAlertColors(variant, theme);

  return (
    <AppCard backgroundColor={colors.background} padding="md">
      <View style={{ alignItems: "flex-start", flexDirection: "row", gap: spacing.md }}>
        {icon ? <View style={{ marginTop: 2 }}>{icon}</View> : null}
        <View style={{ flex: 1 }}>
          <Text style={{ color: colors.text, fontSize: fontSizes.base, fontWeight: "900" }}>{title}</Text>
          <Text style={{ color: colors.text, lineHeight: 21, marginTop: spacing.xs }}>{message}</Text>
        </View>
      </View>
    </AppCard>
  );
}

function getAlertColors(variant: NonNullable<AppAlertCardProps["variant"]>, theme: ReturnType<typeof useAppTheme>["theme"]) {
  switch (variant) {
    case "danger":
      return { background: "#fee2e2", text: "#991b1b" };
    case "medical":
    case "warning":
      return { background: "#fff7ed", text: "#9a3412" };
    case "privacy":
      return { background: "#f5f3ff", text: "#6d28d9" };
    case "success":
      return { background: "#ecfdf5", text: "#047857" };
    default:
      return { background: theme.primarySoft, text: theme.primary };
  }
}
