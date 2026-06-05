import { ArrowUpRight } from "lucide-react-native";
import { Text, View } from "react-native";

import { radius, spacing } from "@/theme/tokens";
import { useAppTheme } from "@/theme/ThemeProvider";
import { AppCard } from "./AppCard";

type DashboardHeroScoreCardProps = {
  helper?: string;
  maxScore?: number;
  onPress?: () => void;
  score: number;
  subtitle: string;
  title: string;
};

export function DashboardHeroScoreCard({
  helper,
  maxScore = 100,
  onPress,
  score,
  subtitle,
  title
}: DashboardHeroScoreCardProps) {
  const { theme } = useAppTheme();
  const progress = maxScore > 0 ? Math.min(score / maxScore, 1) : 0;

  return (
    <AppCard
      backgroundColor={theme.card ?? theme.surface}
      onPress={onPress}
      radius="2xl"
      style={{
        borderColor: "rgba(255,255,255,0.10)",
        borderWidth: 1,
        shadowColor: "#000",
        shadowOffset: { height: 16, width: 0 },
        shadowOpacity: 0.22,
        shadowRadius: 28
      }}
    >
      <View style={{ alignItems: "center", flexDirection: "row", gap: spacing.lg }}>
        <View style={{ flex: 1 }}>
          <Text style={{ color: theme.mutedText, fontSize: 14, fontWeight: "800" }}>{subtitle}</Text>
          <Text style={{ color: theme.text, fontSize: 30, fontWeight: "900", marginTop: 8 }}>
            {title}
          </Text>
          {helper ? (
            <Text style={{ color: theme.primary, fontWeight: "800", marginTop: 8 }}>{helper}</Text>
          ) : null}
        </View>

        <View
          style={{
            alignItems: "center",
            borderColor: "rgba(110, 231, 200, 0.22)",
            borderRadius: radius.full,
            borderWidth: 9,
            backgroundColor: "rgba(110, 231, 200, 0.08)",
            height: 86,
            justifyContent: "center",
            width: 86
          }}
        >
          <View
            style={{
              alignItems: "center",
              borderColor: theme.primary,
              borderRadius: radius.full,
              borderWidth: 3 + Math.round(progress * 2),
              height: 66,
              justifyContent: "center",
              width: 66
            }}
          >
            <Text style={{ color: theme.text, fontSize: 22, fontWeight: "900" }}>{score}</Text>
          </View>
        </View>

        {onPress ? <ArrowUpRight color={theme.primary} size={22} /> : null}
      </View>
    </AppCard>
  );
}
