import { Href, router, useLocalSearchParams } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import { StyleSheet, Text, View } from "react-native";

import {
  MuscleFocusCard,
  type MuscleScoreMap,
} from "@/components/fitness/muscle-map";
import { AppMainLayout } from "@/components/layout/AppMainLayout";
import { AppButton, AppCard, AppSection } from "@/components/ui";
import { FITNESS_PROGRAM_FEATURES } from "@/constants/featurePreferenceConfig";
import { FITNESS_WORKOUT_PROGRAMS } from "@/constants/fitnessRealmConfig";
import { useActiveProfile } from "@/context/ActiveProfileContext";
import {
  EXERCISE_LIBRARY,
  PREBUILT_ROUTINES,
  getExerciseById,
} from "@/constants/workoutLibrary";
import {
  getWorkoutProgramById,
  getWorkoutProgramDays,
  normalizeProgramContent,
  normalizeProgramDayContent,
  type FitnessProgramContent,
  type FitnessProgramDayContent,
} from "@/services/fitnessContentService";
import {
  aggregateMuscleScores,
  scoresFromExerciseFallback,
} from "@/services/fitnessMuscleMapService";
import {
  getUserFeaturePreferences,
  shouldShowFeature,
} from "@/services/userFeaturePreferencesService";
import { useAppTheme } from "@/theme/ThemeProvider";
import { programFromFallback, ProgramCard } from "@/app/fitness/programs";

const STOP_GUIDANCE =
  "Stop for pain, dizziness, bleeding, unusual shortness of breath, or symptoms that feel unsafe. Seek professional advice when needed.";

export default function ProgramDetailScreen() {
  const { theme } = useAppTheme();
  const { activeProfile } = useActiveProfile();
  const { programId = "" } = useLocalSearchParams<{ programId?: string }>();
  const fallbackConfig =
    FITNESS_WORKOUT_PROGRAMS.find((item) => item.id === String(programId)) ??
    FITNESS_WORKOUT_PROGRAMS[0];
  const fallback = useMemo(
    () => programFromFallback(fallbackConfig),
    [fallbackConfig],
  );
  const [program, setProgram] = useState<FitnessProgramContent>(fallback);
  const [days, setDays] = useState<FitnessProgramDayContent[]>([]);
  const [message, setMessage] = useState("");
  const [enabled, setEnabled] = useState(true);

  useEffect(() => {
    let mounted = true;
    Promise.all([
      getWorkoutProgramById(String(programId)),
      getWorkoutProgramDays(String(programId)),
    ])
      .then(([programResult, dayResult]) => {
        if (!mounted) return;
        if (programResult.data)
          setProgram(normalizeProgramContent(programResult.data));
        setDays(
          dayResult.data?.length
            ? dayResult.data.map((row) => normalizeProgramDayContent(row))
            : fallbackDays(fallbackConfig),
        );
      })
      .catch(() => mounted && setDays(fallbackDays(fallbackConfig)));
    return () => {
      mounted = false;
    };
  }, [fallbackConfig, programId]);

  useEffect(() => {
    getUserFeaturePreferences(activeProfile?.id)
      .then((preferences) => {
        setEnabled(
          shouldShowFeature(
            FITNESS_PROGRAM_FEATURES[String(programId)] ?? "fitness",
            { preferences, profileType: activeProfile?.profileType },
          ),
        );
      })
      .catch(() => undefined);
  }, [activeProfile?.id, activeProfile?.profileType, programId]);

  const muscleScores = useMemo(
    () => programMuscleScores(fallbackConfig),
    [fallbackConfig],
  );
  const firstExerciseId =
    PREBUILT_ROUTINES.find((item) => item.id === fallbackConfig.routineId)
      ?.exerciseIds[0] ?? EXERCISE_LIBRARY[0].id;
  const safety = safetyText(program);
  return (
    <AppMainLayout subtitle="Guided workout program" title={program.title}>
      {!enabled ? (
        <AppCard variant="soft">
          <Text style={{ color: theme.text, fontWeight: "800" }}>
            This area is not currently enabled in your preferences. You can
            enable it anytime.
          </Text>
          <AppButton
            onPress={() => router.push("/fitness/preferences" as Href)}
            size="sm"
            title="Customize Fitness"
            variant="secondary"
          />
        </AppCard>
      ) : null}
      {message ? (
        <AppCard variant="soft">
          <Text style={{ color: theme.text, fontWeight: "800" }}>
            {message}
          </Text>
        </AppCard>
      ) : null}
      <AppCard style={[styles.hero, { borderColor: theme.border }]}>
        <Text style={[styles.title, { color: theme.text }]}>
          {program.title}
        </Text>
        <Text style={[styles.body, { color: theme.mutedText }]}>
          {program.description}
        </Text>
        <View style={styles.chips}>
          <Chip label={`${program.days} days`} />
          <Chip label={program.level} />
          <Chip label={program.goal} />
          <Chip label={program.equipment.join(" + ") || "No equipment"} />
          <Chip label={program.audience.join(", ") || "Adults"} />
        </View>
        {safety ? (
          <Text style={[styles.safety, { color: theme.warning }]}>
            {safety}
          </Text>
        ) : null}
        <View style={styles.actions}>
          <AppButton
            onPress={() =>
              router.push(`/fitness/exercise/${firstExerciseId}` as Href)
            }
            title="Start Day 1"
          />
          <AppButton
            onPress={() => setMessage("Schedule preview is shown below.")}
            title="Preview schedule"
            variant="secondary"
          />
          <AppButton
            onPress={() => setMessage("Plan saved locally for this preview.")}
            title="Save plan"
            variant="secondary"
          />
          <AppButton
            onPress={() =>
              router.push(
                `/fitness/program/${String(programId)}/activate` as Href,
              )
            }
            title="Activate on calendar"
            variant="ghost"
          />
        </View>
      </AppCard>
      <View style={styles.metrics}>
        <Metric label="Days per week" value={String(program.daysPerWeek)} />
        <Metric
          label="Average session"
          value={`${program.averageMinutes} min`}
        />
        <Metric
          label="Main focus"
          value={program.focus.slice(0, 2).join(" + ") || "Balanced"}
        />
        <Metric label="Recovery" value={program.recoveryDays} />
        <Metric label="Nutrition support" value={nutritionSupport(program)} />
      </View>
      <AppSection
        title="Program Muscle Focus"
        subtitle="Planned muscle emphasis based on available exercises."
      />
      <MuscleFocusCard
        mode="exercise"
        muscleScores={muscleScores}
        title="Program Muscle Focus"
      />
      <AppSection
        title="Day-by-day schedule"
        subtitle="Keep each session controlled and adjust to your body."
      />
      <View style={styles.stack}>
        {days.map((day) => (
          <DayCard day={day} key={day.dayNumber} />
        ))}
      </View>
      <AppCard style={{ borderColor: theme.warning, borderWidth: 1 }}>
        <Text style={[styles.body, { color: theme.warning }]}>
          {STOP_GUIDANCE}
        </Text>
      </AppCard>
      <AppButton
        onPress={() => router.push("/fitness/programs" as Href)}
        title="Back to programs"
        variant="secondary"
      />
    </AppMainLayout>
  );
}

function fallbackDays(
  program: (typeof FITNESS_WORKOUT_PROGRAMS)[number],
): FitnessProgramDayContent[] {
  const routine =
    PREBUILT_ROUTINES.find((item) => item.id === program.routineId) ??
    PREBUILT_ROUTINES[0];
  return Array.from({ length: Math.min(program.days ?? 7, 7) }, (_, index) => ({
    dayNumber: index + 1,
    durationMinutes: index % 3 === 2 ? 15 : routine.durationMinutes,
    exercises:
      index % 3 === 2
        ? ["Gentle mobility or rest"]
        : routine.exerciseIds.map((id) => getExerciseById(id)?.name ?? id),
    focus: index % 3 === 2 ? "Recovery / lighter day" : routine.name,
    safetyNote: program.safetyBadge
      ? "General guidance: adjust to your body and seek professional advice when needed."
      : undefined,
    setsReps: index % 3 === 2 ? "Easy pace" : "3 controlled sets per movement",
  }));
}
function programMuscleScores(
  program: (typeof FITNESS_WORKOUT_PROGRAMS)[number],
): MuscleScoreMap {
  const routine = PREBUILT_ROUTINES.find(
    (item) => item.id === program.routineId,
  );
  const exercises =
    routine?.exerciseIds.map((id) => getExerciseById(id)).filter(Boolean) ??
    EXERCISE_LIBRARY.slice(0, 3);
  return aggregateMuscleScores(
    exercises.map((exercise) => scoresFromExerciseFallback(exercise)),
  );
}
function DayCard({ day }: { day: FitnessProgramDayContent }) {
  const { theme } = useAppTheme();
  return (
    <AppCard style={[styles.day, { borderColor: theme.border }]}>
      <Text style={[styles.dayNumber, { color: theme.primary }]}>
        Day {day.dayNumber}
      </Text>
      <Text style={[styles.dayTitle, { color: theme.text }]}>{day.focus}</Text>
      <Text style={[styles.body, { color: theme.mutedText }]}>
        {day.exercises.slice(0, 5).join(" · ") ||
          "Exercise details coming soon"}
      </Text>
      <Text style={[styles.meta, { color: theme.mutedText }]}>
        {day.setsReps ?? "Controlled session"} · ~{day.durationMinutes} min
      </Text>
      {day.safetyNote ? (
        <Text style={[styles.safety, { color: theme.warning }]}>
          {day.safetyNote}
        </Text>
      ) : null}
    </AppCard>
  );
}
function Metric({ label, value }: { label: string; value: string }) {
  const { theme } = useAppTheme();
  return (
    <AppCard style={styles.metric}>
      <Text style={[styles.metricLabel, { color: theme.mutedText }]}>
        {label}
      </Text>
      <Text
        style={[styles.metricValue, { color: theme.text }]}
        numberOfLines={3}
      >
        {value}
      </Text>
    </AppCard>
  );
}
function Chip({ label }: { label: string }) {
  const { theme } = useAppTheme();
  return (
    <View style={[styles.chip, { backgroundColor: theme.primarySoft }]}>
      <Text style={{ color: theme.primary, fontSize: 10, fontWeight: "900" }}>
        {label}
      </Text>
    </View>
  );
}
function safetyText(program: FitnessProgramContent) {
  const value = [
    program.title,
    program.goal,
    program.level,
    ...program.audience,
  ]
    .join(" ")
    .toLowerCase();
  return /pregnan|postpartum|injur|advanced|high intensity/.test(value)
    ? "General guidance · adjust to your body · seek professional advice when needed."
    : undefined;
}
function nutritionSupport(program: FitnessProgramContent) {
  const value = program.goal.toLowerCase();
  return value.includes("run") || value.includes("cardio")
    ? "Hydration + carbs"
    : value.includes("weight")
      ? "Calorie-aware planning"
      : "Protein + balanced meals";
}
const styles = StyleSheet.create({
  actions: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginTop: 14 },
  body: { fontSize: 12, lineHeight: 18, marginTop: 5 },
  chip: { borderRadius: 999, paddingHorizontal: 9, paddingVertical: 6 },
  chips: { flexDirection: "row", flexWrap: "wrap", gap: 7, marginTop: 12 },
  day: { borderWidth: 1 },
  dayNumber: { fontSize: 10, fontWeight: "900", textTransform: "uppercase" },
  dayTitle: { fontSize: 17, fontWeight: "900", marginTop: 3 },
  hero: { borderWidth: 1 },
  meta: { fontSize: 11, fontWeight: "800", marginTop: 8 },
  metric: { flexBasis: "46%", flexGrow: 1 },
  metricLabel: { fontSize: 10, fontWeight: "900", textTransform: "uppercase" },
  metricValue: { fontSize: 15, fontWeight: "900", marginTop: 6 },
  metrics: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  safety: { fontSize: 10, fontWeight: "900", lineHeight: 16, marginTop: 8 },
  stack: { gap: 11 },
  title: { fontSize: 27, fontWeight: "900" },
});
