import { HeartPulse } from "lucide-react-native";
import type { ReactNode } from "react";
import { Text, View } from "react-native";

import { AppCard, AppScreen } from "@/components/ui";
import { spacing } from "@/theme/tokens";
import { useAppTheme } from "@/theme/ThemeProvider";

type AuthShellProps = {
  children: ReactNode;
  kicker?: string;
  subtitle: string;
  title: string;
};

export function AuthShell({ children, kicker = "Private care space", subtitle, title }: AuthShellProps) {
  const { theme } = useAppTheme();

  return (
    <AppScreen style={{ flexGrow: 1, justifyContent: "center" }}>
      <View style={{ flex: 1, justifyContent: "center", gap: spacing.xl }}>
        <AppCard radius="2xl" style={{ alignItems: "center", gap: spacing.md, padding: spacing["2xl"] }}>
          <View
            style={{
              alignItems: "center",
              backgroundColor: theme.primary,
              borderRadius: 24,
              height: 64,
              justifyContent: "center",
              shadowColor: theme.primary,
              shadowOffset: { height: 8, width: 0 },
              shadowOpacity: 0.22,
              shadowRadius: 14,
              width: 64
            }}
          >
            <HeartPulse color="#ffffff" size={30} strokeWidth={2.4} />
          </View>
          <View style={{ alignItems: "center", gap: spacing.xs }}>
            <Text style={{ color: theme.mutedText, fontSize: 12, fontWeight: "800", letterSpacing: 1.5, textTransform: "uppercase" }}>
              {kicker}
            </Text>
            <Text style={{ color: theme.text, fontSize: 30, fontWeight: "900", lineHeight: 36, textAlign: "center" }}>{title}</Text>
            <Text style={{ color: theme.mutedText, lineHeight: 21, textAlign: "center" }}>{subtitle}</Text>
          </View>
        </AppCard>
        {children}
      </View>
    </AppScreen>
  );
}
