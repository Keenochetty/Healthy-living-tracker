import { useEffect, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

import {
  MuscleHeatMap,
  type MuscleScoreMap,
} from "@/components/fitness/muscle-map";
import { AppCard } from "@/components/ui";
import { getMuscleHistoryScores } from "@/services/fitnessMuscleMapService";

export function FitnessMuscleBalancePreview({
  onOpen,
  scores,
}: {
  onOpen: () => void;
  scores?: MuscleScoreMap;
}) {
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

  return (
    <AppCard style={styles.card}>
      <View style={styles.copy}>
        <Text style={styles.eyebrow}>Muscles used this week</Text>
        <Text style={styles.title}>Muscle Balance This Week</Text>
        <Text style={styles.body}>
          See active areas and where balanced recovery may help.
        </Text>
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
    backgroundColor: "#0f172a",
    borderRadius: 999,
    marginTop: 14,
    paddingHorizontal: 13,
    paddingVertical: 9,
  },
  buttonText: { color: "#ffffff", fontSize: 11, fontWeight: "900" },
  card: {
    alignItems: "center",
    backgroundColor: "#e6fffa",
    borderColor: "#99f6e4",
    borderWidth: 1,
    flexDirection: "row",
    minHeight: 230,
    overflow: "hidden",
    paddingBottom: 0,
    paddingRight: 0,
  },
  copy: { flex: 1, paddingBottom: 18, paddingTop: 18, zIndex: 2 },
  eyebrow: {
    color: "#0f766e",
    fontSize: 10,
    fontWeight: "900",
    letterSpacing: 0.8,
    textTransform: "uppercase",
  },
  preview: { alignSelf: "flex-end", height: 225, width: 145 },
  title: {
    color: "#0f172a",
    fontSize: 18,
    fontWeight: "900",
    lineHeight: 23,
    marginTop: 5,
  },
});
