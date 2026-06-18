import { StyleSheet, View } from "react-native";

import { HealthOSPill } from "@/components/healthos/HealthOSPill";
import { healthOSSpacing } from "@/theme/healthos";

const DEFAULT_PROMPTS = [
  "Create a workout plan",
  "Turn this meal into a plan",
  "Summarize a document",
  "Prepare appointment questions",
  "Help me import a health note",
];

type Props = {
  onSelect: (prompt: string) => void;
  prompts?: string[];
};

export function HealthOSAISuggestionChips({ onSelect, prompts = DEFAULT_PROMPTS }: Props) {
  return (
    <View style={styles.wrap}>
      {prompts.map((prompt) => (
        <HealthOSPill key={prompt} label={prompt} onPress={() => onSelect(prompt)} variant="ai" />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: healthOSSpacing.sm,
  },
});
