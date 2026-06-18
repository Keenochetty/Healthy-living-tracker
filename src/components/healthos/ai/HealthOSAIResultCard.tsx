import { StyleSheet, Text, useColorScheme, View } from "react-native";
import { CalendarDays, Dumbbell, FileText, HeartPulse, Pill, Soup, Sparkles } from "lucide-react-native";

import { HealthOSCard } from "@/components/healthos/HealthOSCard";
import { HealthOSPill } from "@/components/healthos/HealthOSPill";
import {
  getHealthOSPalette,
  healthOSSpacing,
  healthOSTypography,
  type HealthOSColorMode,
} from "@/theme/healthos";

import type { HealthOSAIResultCardModel as ResultCard } from "./HealthOSAITypes";
import { HealthOSAIResultActions } from "./HealthOSAIResultActions";

type Props = {
  card: ResultCard;
  onReview: (id: string) => void;
};

export function HealthOSAIResultCard({ card, onReview }: Props) {
  const mode: HealthOSColorMode = useColorScheme() === "dark" ? "dark" : "light";
  const palette = getHealthOSPalette(mode);
  return (
    <HealthOSCard
      icon={getIcon(card.type, palette.ai)}
      subtitle="Detected from AI response"
      title={card.title}
      variant="ai"
    >
      <View style={styles.stack}>
        <Text style={[healthOSTypography.bodySmall, { color: palette.softText }]}>
          {card.summary}
        </Text>
        <View style={styles.chips}>
          <HealthOSPill label={card.importType.replace(/_/g, " ")} size="sm" variant="ai" />
          <HealthOSPill label={`Target: ${card.target}`} size="sm" variant="glass" />
          {card.confidenceLabel ? (
            <HealthOSPill label={`Confidence: ${card.confidenceLabel}`} size="sm" variant="default" />
          ) : null}
        </View>
        <Text style={[healthOSTypography.caption, { color: palette.softText }]}>
          This creates an import preview only. Nothing is saved until you review and confirm.
        </Text>
        <HealthOSAIResultActions onReview={() => onReview(card.id)} />
      </View>
    </HealthOSCard>
  );
}

function getIcon(type: ResultCard["type"], color: string) {
  if (type === "calendar") return <CalendarDays color={color} size={20} />;
  if (type === "document") return <FileText color={color} size={20} />;
  if (type === "health_plan") return <HeartPulse color={color} size={20} />;
  if (type === "medication") return <Pill color={color} size={20} />;
  if (type === "nutrition" || type === "recipe") return <Soup color={color} size={20} />;
  if (type === "workout") return <Dumbbell color={color} size={20} />;
  return <Sparkles color={color} size={20} />;
}

const styles = StyleSheet.create({
  chips: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: healthOSSpacing.sm,
  },
  stack: {
    gap: healthOSSpacing.md,
  },
});
