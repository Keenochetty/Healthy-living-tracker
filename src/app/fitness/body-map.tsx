import { router } from "expo-router";
import { useEffect, useState } from "react";
import { StyleSheet, Text, View } from "react-native";

import { MuscleFocusCard, topMuscles, type MuscleScoreMap } from "@/components/fitness/muscle-map";
import { AppMainLayout } from "@/components/layout/AppMainLayout";
import { AppButton } from "@/components/ui";
import { getMuscleHistoryScores } from "@/services/fitnessMuscleMapService";

export default function FitnessBodyMapScreen() {
  const [scores, setScores] = useState<MuscleScoreMap>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    getMuscleHistoryScores(7)
      .then((nextScores) => {
        if (mounted) setScores(nextScores);
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, []);

  const top = topMuscles(scores, 3);
  const hasScores = top.length > 0;

  return (
    <AppMainLayout
      showAi
      subtitle="See what you trained recently and what needs balance."
      title="Body Map"
    >
      <View style={styles.stack}>
        <AppButton onPress={() => router.back()} title="Back" variant="secondary" />

        {loading ? (
          <View style={styles.infoCard}>
            <Text style={styles.infoTitle}>Loading muscle balance...</Text>
            <Text style={styles.infoText}>Checking your recent workout history.</Text>
          </View>
        ) : hasScores ? (
          <>
            <View style={styles.infoCard}>
              <Text style={styles.infoTitle}>Your last 7 days</Text>
              <Text style={styles.infoText}>
                Most active: {top.map((item) => item.label).join(", ")}. Darker areas show higher
                recent training load.
              </Text>
            </View>
            <MuscleFocusCard mode="history" muscleScores={scores} title="Recent Muscle Balance" />
          </>
        ) : (
          <View style={styles.infoCard}>
            <Text style={styles.infoTitle}>No muscle history yet</Text>
            <Text style={styles.infoText}>
              Complete and log workouts to build your seven-day muscle balance map.
            </Text>
            <Text style={styles.guidanceText}>
              This map provides general fitness guidance and does not diagnose pain or injury.
            </Text>
          </View>
        )}
      </View>
    </AppMainLayout>
  );
}

const styles = StyleSheet.create({
  guidanceText: {
    color: "#9a3412",
    fontSize: 12,
    fontWeight: "700",
    lineHeight: 18,
    marginTop: 4
  },
  infoCard: {
    backgroundColor: "#ffffff",
    borderColor: "#e2e8f0",
    borderRadius: 24,
    borderWidth: 1,
    gap: 5,
    padding: 16
  },
  infoText: {
    color: "#64748b",
    fontSize: 13,
    fontWeight: "600",
    lineHeight: 19
  },
  infoTitle: {
    color: "#0f172a",
    fontSize: 16,
    fontWeight: "900"
  },
  stack: {
    gap: 14
  }
});
