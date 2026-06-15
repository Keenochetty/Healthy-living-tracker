import { useEffect, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

import {
  MuscleHeatMap,
  topMuscles,
  type MuscleScoreMap,
} from "@/components/fitness/muscle-map";
import { AppCard } from "@/components/ui";
import { getMuscleHistoryScores } from "@/services/fitnessMuscleMapService";
import { useAppTheme } from "@/theme/ThemeProvider";

export function FitnessMuscleBalancePreview({
  onOpen,
  scores,
}: {
  onOpen: () => void;
  scores?: MuscleScoreMap;
}) {
  const { theme } = useAppTheme();
  const [historyScores, setHistoryScores] = useState<MuscleScoreMap>({});

  useEffect(() => {
    let mounted = true;

    getMuscleHistoryScores(7).then((nextScores) => {
      if (mounted) setHistoryScores(nextScores);
    });

    return () => {
      mounted = false;
    };
  }, []);

  const resolvedScores = Object.keys(historyScores).length
    ? historyScores
    : scores;
  const muscleScores = Object.keys(resolvedScores ?? {}).length
    ? resolvedScores!
    : { abs: 0.45, chest: 0.7, quads: 0.25 };
  const rankedMuscles = topMuscles(muscleScores, 3);
  const workedMost = rankedMuscles[0]?.label ?? "Not logged yet";
  const needsAttention = rankedMuscles.at(-1)?.label ?? "Build a balanced week";
  const recoveryAttention =
    (rankedMuscles[0]?.score ?? 0) >= 0.65 ? workedMost : "No high load";

  return (
    <AppCard style={[styles.card, { backgroundColor: theme.card ?? theme.surface, borderColor: theme.border }]}>
      <View style={styles.copy}>
        <Text style={styles.eyebrow}>Muscles used this week</Text>
        <Text style={[styles.title, { color: theme.text }]}>Muscle Balance This Week</Text>
        <Text style={[styles.body, { color: theme.mutedText }]}>
          See active areas and where balanced recovery may help.
        </Text>
        <View style={styles.insights}>
          <Text style={[styles.insight, { color: theme.text }]}>Worked most: {workedMost}</Text>
          <Text style={[styles.insight, { color: theme.mutedText }]}>Needs attention: {needsAttention}</Text>
          <Text style={[styles.insight, { color: theme.warning }]}>Recovery attention: {recoveryAttention}</Text>
        </View>
        <Pressable onPress={onOpen} style={styles.button}>
          <Text style={styles.buttonText}>View body map</Text>
        </Pressable>
      </View>
      <View pointerEvents="none" style={styles.preview}>
        <MuscleHeatMap
          compact
          height={225}
          mode="history"
          muscleScores={muscleScores}
        />
      </View>
    </AppCard>
  );
}

const styles = StyleSheet.create({
  body: { color: "#475569", fontSize: 12, lineHeight: 18, marginTop: 7 },
  button: {
    alignSelf: "flex-start",
    backgroundColor: "#2563eb",
    borderRadius: 999,
    marginTop: 14,
    paddingHorizontal: 13,
    paddingVertical: 9,
  },
  buttonText: { color: "#ffffff", fontSize: 11, fontWeight: "900" },
  card: {
    alignItems: "center",
    backgroundColor: "#eff6ff",
    borderColor: "#bfdbfe",
    borderWidth: 1,
    flexDirection: "row",
    minHeight: 230,
    overflow: "hidden",
    paddingBottom: 0,
    paddingRight: 0,
  },
  copy: { flex: 1, paddingBottom: 18, paddingTop: 18, zIndex: 2 },
  eyebrow: {
    color: "#2563eb",
    fontSize: 10,
    fontWeight: "900",
    letterSpacing: 0.8,
    textTransform: "uppercase",
  },
  insight: { fontSize: 10, fontWeight: "800", lineHeight: 15 },
  insights: { gap: 1, marginTop: 9 },
  preview: { alignSelf: "flex-end", height: 225, width: 145 },
  title: {
    color: "#0f172a",
    fontSize: 18,
    fontWeight: "900",
    lineHeight: 23,
    marginTop: 5,
  },
});
