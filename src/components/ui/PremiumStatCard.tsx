import { ReactNode } from "react";
import { Text, View } from "react-native";

import type { AppIconName } from "@/constants/appIcons";
import { radius, spacing } from "@/theme/tokens";
import { useAppTheme } from "@/theme/ThemeProvider";
import { AppCard } from "./AppCard";
import { AppIcon } from "./AppIcon";

type PremiumStatCardProps = {
  accentColor?: string;
  emoji?: string;
  helper?: string;
  icon?: ReactNode;
  iconName?: AppIconName;
  onPress?: () => void;
  progress?: number;
  title: string;
  value: string;
};

export function PremiumStatCard({
  accentColor,
  emoji,
  helper,
  icon,
  iconName,
  onPress,
  progress,
  title,
  value
}: PremiumStatCardProps) {
  const { theme } = useAppTheme();
  const accent = accentColor ?? theme.primary;

  return (
    <AppCard
      backgroundColor={theme.card ?? theme.surface}
      onPress={onPress}
      padding="md"
      radius="xl"
      style={{ minHeight: 138, width: "48%" }}
    >
      <View style={{ gap: spacing.md }}>
        <View
          style={{
            alignItems: "center",
            backgroundColor: `${accent}22`,
            borderRadius: radius.full,
            height: 42,
            justifyContent: "center",
            width: 42
          }}
        >
          {iconName ? <AppIcon color={accent} name={iconName} size={20} /> : emoji ? <Text style={{ fontSize: 20 }}>{emoji}</Text> : icon}
        </View>

        <View>
          <Text style={{ color: theme.mutedText, fontSize: 13, fontWeight: "800" }}>{title}</Text>
          <Text style={{ color: theme.text, fontSize: 24, fontWeight: "900", marginTop: 5 }}>{value}</Text>
          {helper ? <Text style={{ color: theme.subtleText ?? theme.mutedText, fontSize: 12, lineHeight: 17, marginTop: 4 }}>{helper}</Text> : null}
        </View>

        {typeof progress === "number" ? (
          <View style={{ backgroundColor: theme.surfaceSoft ?? theme.background, borderRadius: radius.full, height: 6, overflow: "hidden" }}>
            <View style={{ backgroundColor: accent, borderRadius: radius.full, height: 6, width: `${Math.max(0, Math.min(progress, 1)) * 100}%` }} />
          </View>
        ) : null}
      </View>
    </AppCard>
  );
}
