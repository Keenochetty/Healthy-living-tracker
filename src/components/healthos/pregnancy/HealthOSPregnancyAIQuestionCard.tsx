import { StyleSheet, Text, useColorScheme, View } from "react-native";

import { HealthOSCard } from "@/components/healthos/HealthOSCard";
import { HealthOSPill } from "@/components/healthos/HealthOSPill";
import { getHealthOSPalette, healthOSSpacing, healthOSTypography, type HealthOSColorMode } from "@/theme/healthos";

type Props = {
  onAskAI: () => void;
};

const SUGGESTIONS = [
  "Help me prepare questions for my doctor",
  "What should I pack for hospital?",
  "Help me plan after birth",
  "What should I track this week?",
];

export function HealthOSPregnancyAIQuestionCard({ onAskAI }: Props) {
  const mode: HealthOSColorMode = useColorScheme() === "dark" ? "dark" : "light";
  const palette = getHealthOSPalette(mode);

  return (
    <HealthOSCard
      subtitle="Ask about checklists, symptoms to track, questions for your doctor, or preparing for baby."
      title="Ask privately"
      variant="ai"
    >
      <View style={styles.stack}>
        <View style={styles.pills}>
          {SUGGESTIONS.map((suggestion) => (
            <HealthOSPill key={suggestion} label={suggestion} onPress={onAskAI} variant="glass" />
          ))}
        </View>
        <Text style={[healthOSTypography.caption, { color: palette.softText }]}>
          AI can help you prepare questions and plans, but it does not replace medical care.
        </Text>
      </View>
    </HealthOSCard>
  );
}

const styles = StyleSheet.create({
  pills: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: healthOSSpacing.sm,
  },
  stack: {
    gap: healthOSSpacing.md,
  },
});
