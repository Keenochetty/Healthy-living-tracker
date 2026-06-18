import { StyleSheet, Text, useColorScheme, View } from "react-native";
import { Sparkles } from "lucide-react-native";

import { HealthOSCard } from "@/components/healthos/HealthOSCard";
import {
  getHealthOSPalette,
  healthOSSpacing,
  healthOSTypography,
  type HealthOSColorMode,
} from "@/theme/healthos";

import { HealthOSAISuggestionChips } from "./HealthOSAISuggestionChips";

type Props = {
  onPrompt: (prompt: string) => void;
};

export function HealthOSAIEmptyState({ onPrompt }: Props) {
  const mode: HealthOSColorMode = useColorScheme() === "dark" ? "dark" : "light";
  const palette = getHealthOSPalette(mode);
  return (
    <HealthOSCard variant="ai">
      <View style={styles.stack}>
        <Sparkles color={palette.ai} size={22} />
        <Text style={[healthOSTypography.cardTitle, { color: palette.inkText }]}>
          Start with a health task
        </Text>
        <Text style={[healthOSTypography.bodySmall, { color: palette.softText }]}>
          Ask HealthOS AI to search, explain, prepare a plan, or create a review-only import.
        </Text>
        <HealthOSAISuggestionChips onSelect={onPrompt} />
      </View>
    </HealthOSCard>
  );
}

const styles = StyleSheet.create({
  stack: {
    gap: healthOSSpacing.md,
  },
});
