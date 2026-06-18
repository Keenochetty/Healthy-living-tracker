import { Href, router, useLocalSearchParams } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import { Pressable, StyleSheet, Text, TextInput, View } from "react-native";

import {
  NumberWheelPicker,
  PresetChipGroup,
  QuickLogBottomSheet,
  QuickNoteField,
  QuickSaveButton,
} from "@/components/fitness/QuickWorkoutInputs";
import {
  MuscleFocusCard,
  type MuscleScoreMap,
} from "@/components/fitness/muscle-map";
import { AppMainLayout } from "@/components/layout/AppMainLayout";
import { AppButton, AppCard, AppIcon, AppSection } from "@/components/ui";
import {
  EXERCISE_LIBRARY,
  formatWorkoutLabel,
  getExerciseById as getLocalExerciseById,
} from "@/constants/workoutLibrary";
import {
  completeWorkoutSession,
  createWorkoutSession,
} from "@/lib/fitnessStorage";
import {
  getExerciseById as getLiveExerciseById,
  normalizeExerciseContent,
  type FitnessExerciseContent,
} from "@/services/fitnessContentService";
import { getExerciseMuscleScores } from "@/services/fitnessMuscleMapService";
import { useAppTheme } from "@/theme/ThemeProvider";

const STOP_GUIDANCE =
  "Stop if you feel pain, dizziness, bleeding, unusual shortness of breath, or symptoms that feel unsafe. Seek professional advice when needed.";

export default function ExerciseDetailScreen() {
  const { theme } = useAppTheme();
  const params = useLocalSearchParams<{ exerciseId?: string }>();
  const exerciseId = String(params.exerciseId ?? "");
  const localFallback = useMemo(
    () => getLocalExerciseById(exerciseId) ?? EXERCISE_LIBRARY[0],
    [exerciseId],
  );
  const [exercise, setExercise] = useState<FitnessExerciseContent>(() =>
    normalizeExerciseContent(localFallback),
  );
  const [muscleScores, setMuscleScores] = useState<MuscleScoreMap>({});
  const [loading, setLoading] = useState(true);
  const [sets, setSets] = useState("3");
  const [reps, setReps] = useState(10);
  const [weightKg, setWeightKg] = useState(0);
  const [notes, setNotes] = useState("");
  const [editing, setEditing] = useState<"reps" | "weight" | null>(null);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    getLiveExerciseById(exerciseId)
      .then(({ data, error }) => {
        const resolved =
          !error && data
            ? normalizeExerciseContent(data)
            : normalizeExerciseContent(localFallback);
        if (!mounted) return;
        setExercise(resolved);
        setSets(resolved.sets ?? "3");
        const parsedReps = Number.parseInt(resolved.reps ?? "10", 10);
        setReps(Number.isFinite(parsedReps) ? parsedReps : 10);
        return getExerciseMuscleScores(
          resolved.exerciseId,
          data ?? localFallback,
        );
      })
      .then((scores) => {
        if (mounted && scores) setMuscleScores(scores);
      })
      .catch(async () => {
        if (!mounted) return;
        const fallback = normalizeExerciseContent(localFallback);
        setExercise(fallback);
        setMuscleScores(
          await getExerciseMuscleScores(fallback.exerciseId, localFallback),
        );
      })
      .finally(() => mounted && setLoading(false));
    return () => {
      mounted = false;
    };
  }, [exerciseId, localFallback]);

  const safetyBadge = getSafetyBadge(exercise);
  const recoveryPairing = getRecoveryPairing(exercise);

  async function saveExerciseLog() {
    const durationSeconds = Math.max(90, Number(sets || 1) * 90);
    const session = await createWorkoutSession({
      durationSeconds,
      intensity: exercise.level.toLowerCase().includes("beginner")
        ? "easy"
        : "moderate",
      notes: [
        `${sets} sets x ${reps} reps`,
        weightKg ? `${weightKg} kg` : "",
        notes,
      ]
        .filter(Boolean)
        .join(" - "),
      title: exercise.name,
      workoutType: getWorkoutType(exercise),
    });
    await completeWorkoutSession(session.id, {
      durationSeconds,
      endedAt: new Date().toISOString(),
    });
    setSaved(true);
  }

  return (
    <AppMainLayout
      subtitle="Educational movement guidance"
      title={exercise.name}
    >
      {loading ? (
        <AppCard variant="soft">
          <Text style={{ color: theme.text, fontWeight: "800" }}>
            Loading exercise details...
          </Text>
        </AppCard>
      ) : null}
      {saved ? (
        <AppCard variant="success">
          <Text style={[styles.successText, { color: theme.success }]}>
            Exercise log saved
          </Text>
        </AppCard>
      ) : null}

      <AppCard
        style={[
          styles.hero,
          {
            backgroundColor: theme.card ?? theme.surface,
            borderColor: theme.border,
          },
        ]}
      >
        <View
          style={[
            styles.mediaPlaceholder,
            { backgroundColor: theme.primarySoft, borderColor: theme.border },
          ]}
        >
          <AppIcon color={theme.primary} decorative name="source" size={28} />
          <Text style={[styles.mediaText, { color: theme.mutedText }]}>
            {exercise.videoApproved && exercise.videoUrl
              ? "Approved demo available"
              : "Demo video coming soon."}
          </Text>
        </View>
        <Text style={[styles.heroTitle, { color: theme.text }]}>
          {exercise.name}
        </Text>
        <Text style={[styles.bodyText, { color: theme.mutedText }]}>
          {exercise.description}
        </Text>
        <View style={styles.chipRow}>
          <Pill label={formatWorkoutLabel(exercise.category)} />
          <Pill label={formatWorkoutLabel(exercise.level)} />
          <Pill
            label={
              exercise.equipment.map(formatWorkoutLabel).join(" + ") ||
              "No equipment"
            }
          />
          {exercise.durationMinutes ? (
            <Pill label={`${exercise.durationMinutes} min`} />
          ) : null}
          <Pill label={`${sets} sets`} />
          <Pill label={`${reps} reps`} />
        </View>
        {safetyBadge ? (
          <Text style={[styles.safetyBadge, { color: theme.warning }]}>
            {safetyBadge}
          </Text>
        ) : null}
        <View style={styles.actionRow}>
          <AppButton onPress={saveExerciseLog} title="Start exercise" />
          <AppButton
            onPress={() => router.push("/(tabs)/fitness" as Href)}
            title="Add to workout"
            variant="secondary"
          />
          <AppButton
            onPress={() => router.push("/fitness/library" as Href)}
            title="Back to library"
            variant="ghost"
          />
        </View>
      </AppCard>

      <AppSection
        title="Muscles Worked"
        subtitle="Primary, secondary and stabilizing areas for this movement."
      />
      <MuscleFocusCard
        mode="exercise"
        muscleScores={muscleScores}
        title="Muscles Worked"
      />
      <AppCard style={styles.roleCard}>
        <RoleRow label="Primary" values={exercise.primaryMuscles} />
        <RoleRow label="Secondary" values={exercise.secondaryMuscles} />
        <RoleRow label="Stabilizers" values={exercise.stabilizerMuscles} />
      </AppCard>

      <GuidanceSection
        items={exercise.instructions}
        title="How to do it"
        fallback={[
          "Set up in a stable position.",
          "Move with control through a comfortable range.",
          "Pause and reset between repetitions when needed.",
        ]}
      />
      <GuidanceSection
        items={exercise.formCues}
        title="Form cues"
        fallback={[
          "Keep the movement controlled.",
          "Use a range that feels stable and repeatable.",
        ]}
      />
      <GuidanceSection
        items={exercise.breathing}
        title="Breathing"
        fallback={[
          "Breathe steadily and avoid holding your breath through long efforts.",
        ]}
      />
      <GuidanceSection
        items={exercise.commonMistakes}
        title="Common mistakes"
        fallback={[
          "Moving too quickly to keep control.",
          "Using a range that feels uncomfortable.",
        ]}
      />
      <GuidanceSection
        items={exercise.easierVersion ? [exercise.easierVersion] : []}
        title="Easier version"
        fallback={[
          "Reduce the range, load, or duration while keeping the movement comfortable.",
        ]}
      />
      <GuidanceSection
        items={exercise.harderVersion ? [exercise.harderVersion] : []}
        title="Harder version"
        fallback={[
          "Increase difficulty gradually only after the current version feels controlled.",
        ]}
      />
      <GuidanceSection
        items={[...exercise.safetyNotes, STOP_GUIDANCE]}
        title="Safety notes"
        fallback={[STOP_GUIDANCE]}
        warning
      />

      <AppSection
        title="Log this exercise"
        subtitle="Use the current workout logging system."
      />
      <AppCard style={styles.logCard}>
        <Text style={[styles.label, { color: theme.mutedText }]}>Sets</Text>
        <TextInput
          keyboardType="numeric"
          onChangeText={setSets}
          placeholder="3"
          placeholderTextColor={theme.mutedText}
          style={[
            styles.input,
            {
              backgroundColor: theme.surfaceSoft ?? theme.background,
              borderColor: theme.border,
              color: theme.text,
            },
          ]}
          value={sets}
        />
        <Text style={[styles.label, { color: theme.mutedText }]}>Reps</Text>
        <PresetChipGroup
          onSelect={setReps}
          presets={[5, 8, 10, 12, 15, 20]}
          selectedValue={reps}
        />
        <Text style={[styles.label, { color: theme.mutedText }]}>Weight</Text>
        <PresetChipGroup
          onSelect={setWeightKg}
          presets={[0, 5, 10, 15, 20, 25]}
          selectedValue={weightKg}
          suffix="kg"
        />
        <View style={styles.actionRow}>
          <AppButton
            onPress={() => setEditing("reps")}
            title="Edit reps"
            variant="secondary"
          />
          <AppButton
            onPress={() => setEditing("weight")}
            title="Edit weight"
            variant="secondary"
          />
        </View>
        <QuickNoteField onChangeText={setNotes} value={notes} />
        <QuickSaveButton onPress={saveExerciseLog} title="Save exercise log" />
      </AppCard>

      <AppCard
        style={[
          styles.recoveryCard,
          {
            backgroundColor: theme.card ?? theme.surface,
            borderColor: theme.border,
          },
        ]}
      >
        <View
          style={[styles.recoveryIcon, { backgroundColor: theme.primarySoft }]}
        >
          <AppIcon
            color={theme.warning}
            decorative
            name="nutrition"
            size={23}
          />
        </View>
        <View style={styles.recoveryCopy}>
          <Text style={[styles.recoveryEyebrow, { color: theme.warning }]}>
            Nutrition + recovery pairing
          </Text>
          <Text style={[styles.recoveryTitle, { color: theme.text }]}>
            {recoveryPairing}
          </Text>
          <Text style={[styles.bodyText, { color: theme.mutedText }]}>
            Use the existing Food realm to plan or log meals.
          </Text>
          <Pressable onPress={() => router.push("/(tabs)/food" as Href)}>
            <Text style={[styles.foodLink, { color: theme.primary }]}>
              Open Food realm
            </Text>
          </Pressable>
        </View>
      </AppCard>

      <QuickLogBottomSheet
        onClose={() => setEditing(null)}
        title={editing === "weight" ? "Weight picker" : "Reps picker"}
        visible={Boolean(editing)}
      >
        {editing === "weight" ? (
          <NumberWheelPicker
            max={120}
            min={0}
            onChange={setWeightKg}
            step={2.5}
            suffix="kg"
            value={weightKg}
          />
        ) : (
          <NumberWheelPicker max={30} min={1} onChange={setReps} value={reps} />
        )}
        <QuickSaveButton onPress={() => setEditing(null)} title="Save" />
      </QuickLogBottomSheet>
    </AppMainLayout>
  );
}

function GuidanceSection({
  fallback,
  items,
  title,
  warning = false,
}: {
  fallback: string[];
  items: string[];
  title: string;
  warning?: boolean;
}) {
  const { theme } = useAppTheme();
  const resolved = items.length ? items : fallback;
  return (
    <View style={styles.section}>
      <AppSection title={title} />
      <AppCard
        style={
          warning ? { borderColor: theme.warning, borderWidth: 1 } : undefined
        }
      >
        {resolved.map((item, index) => (
          <Text
            key={`${title}-${index}`}
            style={[
              styles.guidanceText,
              { color: warning ? theme.warning : theme.mutedText },
            ]}
          >
            • {item}
          </Text>
        ))}
      </AppCard>
    </View>
  );
}

function RoleRow({ label, values }: { label: string; values: string[] }) {
  const { theme } = useAppTheme();
  return (
    <View style={styles.roleRow}>
      <Text style={[styles.roleLabel, { color: theme.text }]}>{label}</Text>
      <View style={styles.chipRow}>
        {(values.length ? values : ["Not specified"]).map((value) => (
          <Pill key={`${label}-${value}`} label={formatWorkoutLabel(value)} />
        ))}
      </View>
    </View>
  );
}

function Pill({ label }: { label: string }) {
  const { theme } = useAppTheme();
  return (
    <View style={[styles.pill, { backgroundColor: theme.primarySoft }]}>
      <Text style={[styles.pillText, { color: theme.primary }]}>{label}</Text>
    </View>
  );
}

function getSafetyBadge(exercise: FitnessExerciseContent) {
  const value = [
    ...exercise.audience,
    exercise.category,
    exercise.level,
    ...exercise.safetyNotes,
  ]
    .join(" ")
    .toLowerCase();
  if (value.includes("pregnan")) return "Pregnancy content: general guidance";
  if (value.includes("postpartum"))
    return "Postpartum content: general guidance";
  if (
    value.includes("child") ||
    value.includes("kid") ||
    value.includes("teen")
  )
    return "Age-aware general guidance";
  if (value.includes("injur")) return "Injury-conscious general guidance";
  if (value.includes("advanced")) return "Advanced training caution";
  return undefined;
}

function getRecoveryPairing(exercise: FitnessExerciseContent) {
  const value = [
    exercise.category,
    ...exercise.goalTags,
    ...exercise.primaryMuscles,
  ]
    .join(" ")
    .toLowerCase();
  if (
    value.includes("run") ||
    value.includes("cardio") ||
    value.includes("endurance")
  )
    return "Hydration + carbohydrate support";
  if (
    value.includes("mobility") ||
    value.includes("yoga") ||
    value.includes("stretch")
  )
    return "Light balanced meal + hydration";
  if (value.includes("weight_loss") || value.includes("weight loss"))
    return "Calorie-aware meal planning";
  return "Protein-focused recovery meal";
}

function getWorkoutType(
  exercise: FitnessExerciseContent,
): "cardio" | "mobility" | "running" | "strength" {
  const value = [
    exercise.category,
    ...exercise.goalTags,
    ...exercise.primaryMuscles,
  ]
    .join(" ")
    .toLowerCase();
  if (value.includes("run")) return "running";
  if (value.includes("cardio") || value.includes("endurance")) return "cardio";
  if (
    value.includes("mobility") ||
    value.includes("yoga") ||
    value.includes("stretch")
  )
    return "mobility";
  return "strength";
}

const styles = StyleSheet.create({
  actionRow: { flexDirection: "row", flexWrap: "wrap", gap: 9, marginTop: 14 },
  bodyText: { fontSize: 13, lineHeight: 20, marginTop: 6 },
  chipRow: { flexDirection: "row", flexWrap: "wrap", gap: 7, marginTop: 10 },
  foodLink: { fontSize: 12, fontWeight: "900", marginTop: 9 },
  guidanceText: { fontSize: 13, lineHeight: 20, marginVertical: 2 },
  hero: { borderWidth: 1 },
  heroTitle: { fontSize: 28, fontWeight: "900", lineHeight: 34, marginTop: 16 },
  input: {
    borderRadius: 16,
    borderWidth: 1,
    minHeight: 48,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  label: {
    fontSize: 11,
    fontWeight: "900",
    marginBottom: 7,
    marginTop: 12,
    textTransform: "uppercase",
  },
  logCard: { gap: 2 },
  mediaPlaceholder: {
    alignItems: "center",
    borderRadius: 22,
    borderWidth: 1,
    gap: 8,
    height: 145,
    justifyContent: "center",
  },
  mediaText: { fontSize: 12, fontWeight: "800" },
  pill: { borderRadius: 999, paddingHorizontal: 10, paddingVertical: 7 },
  pillText: { fontSize: 11, fontWeight: "900" },
  recoveryCard: {
    alignItems: "flex-start",
    borderWidth: 1,
    flexDirection: "row",
    gap: 12,
  },
  recoveryCopy: { flex: 1 },
  recoveryEyebrow: {
    fontSize: 10,
    fontWeight: "900",
    letterSpacing: 0.7,
    textTransform: "uppercase",
  },
  recoveryIcon: {
    alignItems: "center",
    borderRadius: 15,
    height: 46,
    justifyContent: "center",
    width: 46,
  },
  recoveryTitle: { fontSize: 16, fontWeight: "900", marginTop: 4 },
  roleCard: { gap: 12 },
  roleLabel: { fontSize: 12, fontWeight: "900" },
  roleRow: { gap: 2 },
  safetyBadge: { fontSize: 11, fontWeight: "900", marginTop: 12 },
  section: { gap: 8 },
  successText: { fontWeight: "900" },
});
