import { ReactNode } from "react";
import { Text, View } from "react-native";

import { fontSizes, spacing } from "@/theme/tokens";
import { useAppTheme } from "@/theme/ThemeProvider";
import { AppChip } from "./AppChip";

type AppSectionProps = {
  actionLabel?: string;
  children?: ReactNode;
  onActionPress?: () => void;
  subtitle?: string;
  title: string;
};

export function AppSection({ actionLabel, children, onActionPress, subtitle, title }: AppSectionProps) {
  const { theme } = useAppTheme();

  return (
    <View style={{ gap: spacing.md }}>
      <View style={{ alignItems: "center", flexDirection: "row", justifyContent: "space-between" }}>
        <View style={{ flex: 1, paddingRight: spacing.md }}>
          <Text style={{ color: theme.text, fontSize: fontSizes.lg, fontWeight: "900" }}>{title}</Text>
          {subtitle ? <Text style={{ color: theme.mutedText, lineHeight: 20, marginTop: 3 }}>{subtitle}</Text> : null}
        </View>
        {actionLabel ? <AppChip label={actionLabel} onPress={onActionPress} variant="primary" /> : null}
      </View>
      {children}
    </View>
  );
}
