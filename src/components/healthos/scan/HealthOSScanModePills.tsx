import { ScrollView, StyleSheet } from "react-native";

import { HealthOSPill } from "@/components/healthos/HealthOSPill";
import type { HealthOSScanMode, HealthOSScanModeConfig } from "./HealthOSScanTypes";

type HealthOSScanModePillsProps = {
  modes: HealthOSScanModeConfig[];
  selectedMode: HealthOSScanMode;
  onSelectMode: (mode: HealthOSScanMode) => void;
};

export function HealthOSScanModePills({
  modes,
  onSelectMode,
  selectedMode,
}: HealthOSScanModePillsProps) {
  return (
    <ScrollView
      accessibilityLabel="Scan modes. These are user-selected modes, not automatic detection."
      contentContainerStyle={styles.content}
      horizontal
      showsHorizontalScrollIndicator={false}
    >
      {modes.map((mode) => (
        <HealthOSPill
          key={mode.key}
          label={mode.key === selectedMode ? `${mode.label} selected` : mode.label}
          onPress={() => onSelectMode(mode.key)}
          selected={mode.key === selectedMode}
          variant={mode.key === "general" ? "ai" : "glass"}
        />
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: {
    gap: 8,
    paddingHorizontal: 16,
  },
});
