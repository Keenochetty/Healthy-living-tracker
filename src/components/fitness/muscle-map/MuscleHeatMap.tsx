import { useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import Svg, { Path } from "react-native-svg";

import { useActiveProfile } from "@/context/ActiveProfileContext";

import {
  BODY_PATHS,
  BODY_VIEW_BOXES,
  bodyGenderFromProfile,
  type BodyGender,
  type BodyPathPart,
  type BodyView,
} from "./bodyPathData";
import {
  getMuscleFill,
  getMuscleOpacity,
  getMuscleStroke,
} from "./muscleColorScale";
import {
  MUSCLE_LABELS,
  type MuscleKey,
  type MuscleScoreMap,
} from "./muscleLayerMap";

export type MuscleHeatMapProps = {
  bodyGender?: BodyGender;
  cautionMuscles?: MuscleKey[];
  compact?: boolean;
  height?: number;
  mode?: "exercise" | "workout" | "history";
  muscleScores: MuscleScoreMap;
  onSelectMuscle?: (muscleKey: MuscleKey) => void;
  selectedMuscleKey?: MuscleKey;
  suggestedMuscles?: MuscleKey[];
};

function scoreFor(scores: MuscleScoreMap, muscleKey?: MuscleKey) {
  if (!muscleKey) return 0;
  return Math.min(1, Math.max(0, Number(scores[muscleKey] ?? 0)));
}

function isIn(list: MuscleKey[] | undefined, muscleKey?: MuscleKey) {
  return Boolean(muscleKey && list?.includes(muscleKey));
}

const RELATED_MUSCLES_BY_SLUG: Partial<Record<string, MuscleKey[]>> = {
  hipFlexors: ["hip_flexors", "abductors"],
  outerQuad: ["quads", "abductors"],
  upperBack: ["upper_back", "lats"],
};

function AnatomicalPart({
  cautionMuscles,
  onSelectMuscle,
  part,
  scores,
  selectedMuscleKey,
  suggestedMuscles,
}: {
  cautionMuscles?: MuscleKey[];
  onSelectMuscle?: (muscleKey: MuscleKey) => void;
  part: BodyPathPart;
  scores: MuscleScoreMap;
  selectedMuscleKey?: MuscleKey;
  suggestedMuscles?: MuscleKey[];
}) {
  const relatedMuscles = RELATED_MUSCLES_BY_SLUG[part.slug] ?? [];
  const muscleKeys = Array.from(
    new Set([part.muscleKey, ...relatedMuscles].filter(Boolean) as MuscleKey[]),
  );
  const score = Math.max(
    ...muscleKeys.map((muscleKey) => scoreFor(scores, muscleKey)),
    0,
  );
  const selected = muscleKeys.includes(selectedMuscleKey as MuscleKey);
  const suggested = muscleKeys.some((muscleKey) =>
    isIn(suggestedMuscles, muscleKey),
  );
  const caution = muscleKeys.some((muscleKey) =>
    isIn(cautionMuscles, muscleKey),
  );
  const selectedPartMuscle = muscleKeys.sort(
    (left, right) => scoreFor(scores, right) - scoreFor(scores, left),
  )[0];
  const interactive = Boolean(selectedPartMuscle);
  const accessibilityLabel = muscleKeys.length
    ? `${muscleKeys.map((muscleKey) => MUSCLE_LABELS[muscleKey]).join(", ")} muscle area`
    : undefined;

  return part.paths.map((path, index) => (
    <Path
      accessibilityLabel={accessibilityLabel}
      d={path}
      fill={interactive ? getMuscleFill(score) : "#e9eef5"}
      key={`${part.slug}-${index}`}
      onPress={
        selectedPartMuscle
          ? () => onSelectMuscle?.(selectedPartMuscle)
          : undefined
      }
      opacity={interactive ? getMuscleOpacity(score) : 0.72}
      stroke={
        interactive ? getMuscleStroke(score, suggested, caution) : "#cbd5e1"
      }
      strokeLinejoin="round"
      strokeWidth={selected || suggested || caution ? 4 : 1.6}
    />
  ));
}

export function MuscleHeatMap({
  bodyGender,
  cautionMuscles,
  compact = false,
  height,
  mode = "exercise",
  muscleScores,
  onSelectMuscle,
  selectedMuscleKey,
  suggestedMuscles,
}: MuscleHeatMapProps) {
  const { activeProfile } = useActiveProfile();
  const [bodyView, setBodyView] = useState<BodyView>("front");
  const resolvedBodyGender =
    bodyGender ?? bodyGenderFromProfile(activeProfile?.gender);
  const mapHeight = height ?? (compact ? 220 : 430);
  const title =
    mode === "history"
      ? "Muscle balance"
      : mode === "workout"
        ? "Workout muscle focus"
        : "Muscles worked";

  return (
    <View style={styles.container}>
      {!compact ? (
        <View style={styles.headerRow}>
          <View style={styles.headerCopy}>
            <Text style={styles.title}>{title}</Text>
            <Text style={styles.subtitle}>
              {resolvedBodyGender === "female" ? "Female" : "Male"} profile body
              - Tap a muscle to learn more
            </Text>
          </View>
          <View accessibilityRole="tablist" style={styles.viewToggle}>
            {(["front", "back"] as BodyView[]).map((view) => {
              const active = bodyView === view;
              return (
                <Pressable
                  accessibilityRole="tab"
                  accessibilityState={{ selected: active }}
                  key={view}
                  onPress={() => setBodyView(view)}
                  style={[styles.viewButton, active && styles.viewButtonActive]}
                >
                  <Text
                    style={[
                      styles.viewButtonText,
                      active && styles.viewButtonTextActive,
                    ]}
                  >
                    {view === "front" ? "Front" : "Back"}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </View>
      ) : null}

      <View style={[styles.mapWrap, compact && styles.mapWrapCompact]}>
        <Svg
          height={mapHeight}
          preserveAspectRatio="xMidYMid meet"
          viewBox={BODY_VIEW_BOXES[resolvedBodyGender][bodyView]}
          width="100%"
        >
          {BODY_PATHS[resolvedBodyGender][bodyView].map((part) => (
            <AnatomicalPart
              cautionMuscles={cautionMuscles}
              key={part.slug}
              onSelectMuscle={onSelectMuscle}
              part={part}
              scores={muscleScores}
              selectedMuscleKey={selectedMuscleKey}
              suggestedMuscles={suggestedMuscles}
            />
          ))}
        </Svg>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 12,
  },
  headerCopy: {
    flex: 1,
    gap: 3,
  },
  headerRow: {
    alignItems: "flex-start",
    flexDirection: "row",
    gap: 10,
    justifyContent: "space-between",
  },
  mapWrap: {
    alignItems: "center",
    backgroundColor: "#f8fafc",
    borderRadius: 28,
    overflow: "hidden",
    paddingVertical: 8,
  },
  mapWrapCompact: {
    backgroundColor: "transparent",
    borderRadius: 0,
    paddingVertical: 0,
  },
  subtitle: {
    color: "#64748b",
    fontSize: 12,
    fontWeight: "600",
    lineHeight: 17,
  },
  title: {
    color: "#0f172a",
    fontSize: 18,
    fontWeight: "800",
  },
  viewButton: {
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 7,
  },
  viewButtonActive: {
    backgroundColor: "#0f172a",
  },
  viewButtonText: {
    color: "#64748b",
    fontSize: 11,
    fontWeight: "800",
    textTransform: "capitalize",
  },
  viewButtonTextActive: {
    color: "#ffffff",
  },
  viewToggle: {
    backgroundColor: "#eef2f7",
    borderRadius: 999,
    flexDirection: "row",
    padding: 3,
  },
});
