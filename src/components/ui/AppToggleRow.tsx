import { ReactNode } from "react";
import { Switch, Text, View } from "react-native";

import { spacing } from "@/theme/tokens";
import { useAppTheme } from "@/theme/ThemeProvider";
import { AppCard } from "./AppCard";

type AppToggleRowProps = {
  description?: string;
  disabled?: boolean;
  icon?: ReactNode;
  onValueChange: (value: boolean) => void;
  title: string;
  value: boolean;
};

export function AppToggleRow({ description, disabled = false, icon, onValueChange, title, value }: AppToggleRowProps) {
  const { theme } = useAppTheme();

  return (
    <AppCard padding="md" style={{ opacity: disabled ? 0.62 : 1 }}>
      <View style={{ alignItems: "center", flexDirection: "row", gap: spacing.md }}>
        {icon}
        <View style={{ flex: 1 }}>
          <Text style={{ color: theme.text, fontWeight: "900" }}>{title}</Text>
          {description ? <Text style={{ color: theme.mutedText, lineHeight: 19, marginTop: 3 }}>{description}</Text> : null}
        </View>
        <Switch disabled={disabled} onValueChange={onValueChange} thumbColor="#ffffff" trackColor={{ false: "#cbd5e1", true: theme.primary }} value={value} />
      </View>
    </AppCard>
  );
}
