import { StyleSheet, Text, useColorScheme, View } from "react-native";

import { HealthOSCard } from "@/components/healthos/HealthOSCard";
import { HealthOSPill } from "@/components/healthos/HealthOSPill";
import { getHealthOSPalette, healthOSSpacing, healthOSTypography, type HealthOSColorMode } from "@/theme/healthos";

type Props = {
  onAskAI: () => void;
};

const SUGGESTIONS = [
  "What should I track today?",
  "Help me prepare questions for the doctor",
  "Create a feeding summary",
  "Help organize vaccine records",
];

export function HealthOSChildAIQuestionCard({ onAskAI }: Props) {
  const mode: HealthOSColorMode = useColorScheme() === "dark" ? "dark" : "light";
  const palette = getHealthOSPalette(mode);

  return (
    <HealthOSCard subtitle="Ask about what to track, questions for your doctor, routines, or preparing for appointments." title="Ask about care" variant="ai">
      <View style={styles.stack}>
        <View style={styles.pills}>
          {SUGGESTIONS.map((suggestion) => (
            <HealthOSPill key={suggestion} label={suggestion} onPress={onAskAI} variant="glass" />
          ))}
        </View>
        <Text style={[healthOSTypography.caption, { color: palette.softText }]}>
          AI can help organize information, but it does not replace medical care.
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
