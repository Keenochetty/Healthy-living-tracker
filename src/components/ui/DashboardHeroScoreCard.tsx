import { ArrowUpRight } from "lucide-react-native";
import { Text, View } from "react-native";

import { radius, spacing } from "@/theme/tokens";
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
  const progress = maxScore > 0 ? Math.min(score / maxScore, 1) : 0;

  return (
    <AppCard backgroundColor="#ffd029" onPress={onPress} radius="2xl">
      <View style={{ alignItems: "center", flexDirection: "row", gap: spacing.lg }}>
        <View style={{ flex: 1 }}>
          <Text style={{ color: "#171b22", fontSize: 14, fontWeight: "800" }}>{subtitle}</Text>
          <Text style={{ color: "#171b22", fontSize: 30, fontWeight: "900", marginTop: 8 }}>
            {title}
          </Text>
          {helper ? (
            <Text style={{ color: "#4a3d10", fontWeight: "800", marginTop: 8 }}>{helper}</Text>
          ) : null}
        </View>

        <View
          style={{
            alignItems: "center",
            borderColor: "rgba(23,27,34,0.16)",
            borderRadius: radius.full,
            borderWidth: 9,
            height: 86,
            justifyContent: "center",
            width: 86
          }}
        >
          <View
            style={{
              alignItems: "center",
              borderColor: "#171b22",
              borderRadius: radius.full,
              borderWidth: 3 + Math.round(progress * 2),
              height: 66,
              justifyContent: "center",
              width: 66
            }}
          >
            <Text style={{ color: "#171b22", fontSize: 22, fontWeight: "900" }}>{score}</Text>
          </View>
        </View>

        {onPress ? <ArrowUpRight color="#171b22" size={22} /> : null}
      </View>
    </AppCard>
  );
}
