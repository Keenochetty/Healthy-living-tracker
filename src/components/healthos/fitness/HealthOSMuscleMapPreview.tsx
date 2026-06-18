import { useState } from "react";
import { StyleSheet, Text, useColorScheme, View } from "react-native";

import { HealthOSCard } from "@/components/healthos/HealthOSCard";
import { HealthOSPill } from "@/components/healthos/HealthOSPill";
import {
  getHealthOSPalette,
  healthOSRadius,
  healthOSSpacing,
  healthOSTypography,
  type HealthOSColorMode,
} from "@/theme/healthos";

import type { HealthOSMuscleStatusItem } from "./HealthOSFitnessTypes";

type HealthOSMuscleMapPreviewProps = {
  muscles: HealthOSMuscleStatusItem[];
  onFilter: () => void;
};

export function HealthOSMuscleMapPreview({ muscles, onFilter }: HealthOSMuscleMapPreviewProps) {
  const [view, setView] = useState<"front" | "back">("front");
  const mode: HealthOSColorMode = useColorScheme() === "dark" ? "dark" : "light";
  const palette = getHealthOSPalette(mode);

  return (
    <HealthOSCard title="Muscle map" subtitle="Foundation preview for targeted and recovered muscles" variant="elevated">
      <View style={styles.toggle}>
        <HealthOSPill label="Front" onPress={() => setView("front")} selected={view === "front"} size="sm" variant="glass" />
        <HealthOSPill label="Back" onPress={() => setView("back")} selected={view === "back"} size="sm" variant="glass" />
      </View>
      <View style={[styles.silhouette, { backgroundColor: `${palette.fitness}18` }]}>
        <Text style={[healthOSTypography.cardTitle, { color: palette.inkText }]}>
          {view === "front" ? "Front body" : "Back body"}
        </Text>
        <Text style={[healthOSTypography.caption, { color: palette.softText }]}>
          Native muscle map SVG pending.
        </Text>
      </View>
      <View style={styles.chips}>
        {muscles.map((item) => (
          <HealthOSPill
            key={`${item.group}-${item.status}`}
            label={`${item.label}: ${item.status}`}
            onPress={onFilter}
            size="sm"
            variant="glass"
          />
        ))}
      </View>
    </HealthOSCard>
  );
}

const styles = StyleSheet.create({
  chips: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: healthOSSpacing.sm,
  },
  silhouette: {
    alignItems: "center",
    borderRadius: healthOSRadius.xl,
    gap: healthOSSpacing.xs,
    justifyContent: "center",
    minHeight: 150,
  },
  toggle: {
    flexDirection: "row",
    gap: healthOSSpacing.sm,
  },
});

