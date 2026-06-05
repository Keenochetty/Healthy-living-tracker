import { useLocalSearchParams } from "expo-router";
import { useMemo, useState } from "react";
import { ScrollView, StyleSheet, Text, TextInput, View } from "react-native";

import {
  NumberWheelPicker,
  PresetChipGroup,
  QuickLogBottomSheet,
  QuickNoteField,
  QuickSaveButton
} from "@/components/fitness/QuickWorkoutInputs";
import { AppMainLayout } from "@/components/layout/AppMainLayout";
import { AppButton, AppCard, AppIcon, AppSection } from "@/components/ui";
import { EXERCISE_LIBRARY, formatWorkoutLabel, getExerciseById } from "@/constants/workoutLibrary";
import { createWorkoutSession, completeWorkoutSession } from "@/lib/fitnessStorage";

const SAFETY_COPY =
  "Exercise guidance is for general fitness tracking only. If you are unsure, injured, pregnant, or managing a health condition, speak to a qualified professional.";

export default function ExerciseDetailScreen() {
  const params = useLocalSearchParams<{ exerciseId?: string }>();
  const exercise = useMemo(
    () => getExerciseById(String(params.exerciseId ?? "")) ?? EXERCISE_LIBRARY[0],
    [params.exerciseId]
  );
  const [sets, setSets] = useState("3");
  const [reps, setReps] = useState(10);
  const [weightKg, setWeightKg] = useState(0);
  const [notes, setNotes] = useState("");
  const [editing, setEditing] = useState<"reps" | "weight" | null>(null);
  const [saved, setSaved] = useState(false);

  async function saveExerciseLog() {
    const session = await createWorkoutSession({
      durationSeconds: Number(sets) * 90,
      intensity: exercise.difficulty === "beginner" ? "easy" : "moderate",
      notes: [`${sets} sets x ${reps} reps`, weightKg ? `${weightKg} kg` : "", notes].filter(Boolean).join(" - "),
      title: exercise.name,
      workoutType: exercise.primaryMuscle === "cardio" ? "cardio" : exercise.primaryMuscle === "mobility" ? "mobility" : "strength"
    });
    await completeWorkoutSession(session.id, { durationSeconds: Number(sets) * 90, endedAt: new Date().toISOString() });
    setSaved(true);
  }

  return (
    <AppMainLayout subtitle="Exercise Library" title={exercise.name}>
      {saved ? (
        <AppCard backgroundColor="#dcfce7">
          <Text style={styles.successText}>Exercise log saved</Text>
        </AppCard>
      ) : null}

      <AppCard style={styles.darkHero}>
        <View style={styles.mediaPlaceholder}>
          <AppIcon color="#6ee7c8" decorative name="source" size={30} />
          <Text style={styles.mediaText}>Exercise image / video placeholder</Text>
        </View>
        <Text style={styles.heroTitle}>{exercise.name}</Text>
        <Text style={styles.darkMuted}>{exercise.description}</Text>
        <View style={styles.chipRow}>
          <Pill label={formatWorkoutLabel(exercise.primaryMuscle)} />
          {exercise.secondaryMuscles.slice(0, 3).map((muscle) => <Pill key={muscle} label={formatWorkoutLabel(muscle)} />)}
          <Pill label={formatWorkoutLabel(exercise.difficulty)} />
        </View>
      </AppCard>

      <AppSection title="Instructions" />
      <AppCard style={styles.darkCard}>
        {exercise.instructions.map((instruction, index) => (
          <Text key={instruction} style={styles.darkMuted}>{index + 1}. {instruction}</Text>
        ))}
      </AppCard>

      <AppSection title="Common mistakes" />
      <AppCard style={styles.darkCard}>
        {exercise.commonMistakes.map((mistake) => (
          <Text key={mistake} style={styles.darkMuted}>- {mistake}</Text>
        ))}
      </AppCard>

      <AppSection title="Log this exercise" subtitle="Fast presets first, manual entry when needed." />
      <AppCard style={styles.darkCard}>
        <Text style={styles.label}>Sets</Text>
        <TextInput keyboardType="numeric" onChangeText={setSets} placeholder="3" placeholderTextColor="#94a3b8" style={styles.input} value={sets} />
        <Text style={styles.label}>Reps</Text>
        <PresetChipGroup onSelect={setReps} presets={[5, 8, 10, 12, 15, 20]} selectedValue={reps} />
        <Text style={styles.label}>Weight</Text>
        <PresetChipGroup onSelect={setWeightKg} presets={[0, 5, 10, 15, 20, 25]} selectedValue={weightKg} suffix="kg" />
        <View style={styles.actionRow}>
          <AppButton onPress={() => setEditing("reps")} title="Edit reps" variant="secondary" />
          <AppButton onPress={() => setEditing("weight")} title="Edit weight" variant="secondary" />
        </View>
        <QuickNoteField onChangeText={setNotes} value={notes} />
        <QuickSaveButton onPress={saveExerciseLog} title="Save exercise log" />
      </AppCard>

      <View style={styles.grid}>
        <Metric label="Rest timer" value="Placeholder" />
        <Metric label="Personal best" value="Start today" />
        <Metric label="Notes" value={notes ? "Added" : "Optional"} />
        <Metric label="Routine" value="Add later" />
      </View>

      <AppCard backgroundColor="#fff7ed">
        <Text style={styles.safetyText}>{SAFETY_COPY}</Text>
      </AppCard>

      <QuickLogBottomSheet
        onClose={() => setEditing(null)}
        title={editing === "weight" ? "Weight picker" : "Reps picker"}
        visible={Boolean(editing)}
      >
        {editing === "weight" ? (
          <NumberWheelPicker max={120} min={0} onChange={setWeightKg} step={2.5} suffix="kg" value={weightKg} />
        ) : (
          <NumberWheelPicker max={30} min={1} onChange={setReps} value={reps} />
        )}
        <QuickSaveButton onPress={() => setEditing(null)} title="Save" />
      </QuickLogBottomSheet>
    </AppMainLayout>
  );
}

function Pill({ label }: { label: string }) {
  return (
    <View style={styles.pill}>
      <Text style={styles.pillText}>{label}</Text>
    </View>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <AppCard style={styles.metricCard}>
      <Text style={styles.metricLabel}>{label}</Text>
      <Text style={styles.metricValue}>{value}</Text>
    </AppCard>
  );
}

const styles = StyleSheet.create({
  actionRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    marginVertical: 12
  },
  chipRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginTop: 12
  },
  darkCard: {
    backgroundColor: "#111827",
    borderColor: "rgba(255,255,255,0.12)",
    borderWidth: 1
  },
  darkHero: {
    backgroundColor: "#0f172a",
    borderColor: "#6ee7c8",
    borderWidth: 1
  },
  darkMuted: {
    color: "#cbd5e1",
    lineHeight: 21,
    marginTop: 6
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10
  },
  heroTitle: {
    color: "#f8fafc",
    fontSize: 30,
    fontWeight: "900",
    marginTop: 14
  },
  input: {
    backgroundColor: "rgba(255,255,255,0.08)",
    borderColor: "rgba(255,255,255,0.14)",
    borderRadius: 16,
    borderWidth: 1,
    color: "#f8fafc",
    minHeight: 48,
    paddingHorizontal: 14,
    paddingVertical: 10
  },
  label: {
    color: "#94a3b8",
    fontSize: 12,
    fontWeight: "900",
    marginBottom: 8,
    marginTop: 12,
    textTransform: "uppercase"
  },
  mediaPlaceholder: {
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.08)",
    borderColor: "#6ee7c8",
    borderRadius: 24,
    borderWidth: 1,
    gap: 8,
    height: 190,
    justifyContent: "center"
  },
  mediaText: {
    color: "#cbd5e1",
    fontWeight: "900"
  },
  metricCard: {
    backgroundColor: "#111827",
    borderColor: "rgba(255,255,255,0.12)",
    borderWidth: 1,
    flexBasis: "47%",
    flexGrow: 1
  },
  metricLabel: {
    color: "#94a3b8",
    fontSize: 12,
    fontWeight: "800"
  },
  metricValue: {
    color: "#f8fafc",
    fontSize: 18,
    fontWeight: "900",
    marginTop: 6
  },
  pill: {
    backgroundColor: "rgba(255,255,255,0.10)",
    borderRadius: 999,
    paddingHorizontal: 11,
    paddingVertical: 8
  },
  pillText: {
    color: "#e2e8f0",
    fontSize: 12,
    fontWeight: "900"
  },
  safetyText: {
    color: "#9a3412",
    lineHeight: 20
  },
  successText: {
    color: "#166534",
    fontWeight: "900"
  }
});
