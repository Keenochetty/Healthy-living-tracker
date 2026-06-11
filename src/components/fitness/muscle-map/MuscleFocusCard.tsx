import { useMemo, useState } from "react";
import { StyleSheet, Text, View } from "react-native";

import { useActiveProfile } from "@/context/ActiveProfileContext";

import { bodyGenderFromProfile, type BodyGender } from "./bodyPathData";
import { MuscleHeatMap } from "./MuscleHeatMap";
import { MuscleLegendDropdown } from "./MuscleLegendDropdown";
import { MUSCLE_LABELS, topMuscles, type MuscleKey, type MuscleScoreMap } from "./muscleLayerMap";

export type MuscleFocusCardProps = {
  bodyGender?: BodyGender;
  cautionMuscles?: MuscleKey[];
  compact?: boolean;
  mode?: "exercise" | "workout" | "history";
  muscleScores: MuscleScoreMap;
  suggestedMuscles?: MuscleKey[];
  title?: string;
};

export function MuscleFocusCard({
  bodyGender,
  cautionMuscles,
  compact = false,
  mode = "exercise",
  muscleScores,
  suggestedMuscles,
  title = "Muscles Worked"
}: MuscleFocusCardProps) {
  const { activeProfile } = useActiveProfile();
  const [selectedMuscleKey, setSelectedMuscleKey] = useState<MuscleKey | undefined>();
  const top = useMemo(() => topMuscles(muscleScores, 4), [muscleScores]);
  const selectedLabel = selectedMuscleKey ? MUSCLE_LABELS[selectedMuscleKey] : undefined;
  const selectedScore = selectedMuscleKey ? muscleScores[selectedMuscleKey] ?? 0 : 0;

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.subtitle}>
            {mode === "history"
              ? "Recent training load by muscle group"
              : "Targeted areas for this movement"}
          </Text>
        </View>
      </View>

      {top.length ? (
        <View style={styles.chipRow}>
          {top.map((item) => (
            <View key={item.muscleKey} style={styles.chip}>
              <Text style={styles.chipText}>{item.label}</Text>
            </View>
          ))}
        </View>
      ) : (
        <Text style={styles.emptyText}>No muscle targets found yet.</Text>
      )}

      <MuscleHeatMap
        bodyGender={bodyGender ?? bodyGenderFromProfile(activeProfile?.gender)}
        cautionMuscles={cautionMuscles}
        mode={mode}
        muscleScores={muscleScores}
        onSelectMuscle={setSelectedMuscleKey}
        selectedMuscleKey={selectedMuscleKey}
        suggestedMuscles={suggestedMuscles}
      />

      {selectedLabel ? (
        <View style={styles.selectedPanel}>
          <Text style={styles.selectedTitle}>{selectedLabel}</Text>
          <Text style={styles.selectedText}>
            Current focus score: {Math.round(selectedScore * 100)}%. Higher scores mean stronger
            involvement or heavier recent load.
          </Text>
        </View>
      ) : null}

      {!compact ? <MuscleLegendDropdown /> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#ffffff",
    borderColor: "#e2e8f0",
    borderRadius: 28,
    borderWidth: 1,
    gap: 14,
    padding: 16,
    shadowColor: "#0f172a",
    shadowOffset: { height: 10, width: 0 },
    shadowOpacity: 0.06,
    shadowRadius: 18
  },
  chip: {
    backgroundColor: "#fff7ed",
    borderColor: "#fed7aa",
    borderRadius: 999,
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 6
  },
  chipRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8
  },
  chipText: {
    color: "#9a3412",
    fontSize: 12,
    fontWeight: "800"
  },
  emptyText: {
    color: "#64748b",
    fontSize: 13,
    fontWeight: "600"
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between"
  },
  selectedPanel: {
    backgroundColor: "#f8fafc",
    borderRadius: 18,
    gap: 4,
    padding: 12
  },
  selectedText: {
    color: "#64748b",
    fontSize: 12,
    fontWeight: "600",
    lineHeight: 17
  },
  selectedTitle: {
    color: "#0f172a",
    fontSize: 13,
    fontWeight: "900"
  },
  subtitle: {
    color: "#64748b",
    fontSize: 12,
    fontWeight: "600",
    marginTop: 3
  },
  title: {
    color: "#0f172a",
    fontSize: 18,
    fontWeight: "900"
  }
});
