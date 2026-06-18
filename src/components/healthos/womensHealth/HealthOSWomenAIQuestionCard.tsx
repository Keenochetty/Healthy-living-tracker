import { StyleSheet, Text, useColorScheme, View } from "react-native";

import { HealthOSCard } from "@/components/healthos/HealthOSCard";
import { HealthOSPill } from "@/components/healthos/HealthOSPill";
import { getHealthOSPalette, healthOSSpacing, healthOSTypography, type HealthOSColorMode } from "@/theme/healthos";

type Props = {
  onAskAI: () => void;
};

export function HealthOSWomenAIQuestionCard({ onAskAI }: Props) {
  const mode: HealthOSColorMode = useColorScheme() === "dark" ? "dark" : "light";
  const palette = getHealthOSPalette(mode);
  const suggestions = [
    "What should I track today?",
    "Explain contraception reminders",
    "Help me prepare questions for my doctor",
    "Ask about symptoms",
  ];

  return (
    <HealthOSCard title="Ask privately" subtitle="Symptoms, contraception, cycle patterns, or what to log." variant="ai">
      <View style={styles.suggestions}>
        {suggestions.map((suggestion) => (
          <HealthOSPill key={suggestion} label={suggestion} onPress={onAskAI} size="sm" variant="glass" />
        ))}
      </View>
      <Text style={[healthOSTypography.caption, styles.copy, { color: palette.softText }]}>
        AI can help you prepare questions, but it does not replace medical care.
      </Text>
    </HealthOSCard>
  );
}

const styles = StyleSheet.create({
  copy: {
    marginTop: healthOSSpacing.md,
  },
  suggestions: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: healthOSSpacing.sm,
  },
});
