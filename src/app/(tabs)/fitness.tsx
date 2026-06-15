import { Href, router, useFocusEffect } from "expo-router";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

import {
  DateWheelPicker,
  ManualEntryToggle,
  NumberWheelPicker,
  PresetChipGroup,
  QuickLogBottomSheet,
  QuickNoteField,
  QuickSaveButton,
  TimeWheelPicker,
} from "@/components/fitness/QuickWorkoutInputs";
import {
  MuscleFocusCard,
  type MuscleScoreMap,
} from "@/components/fitness/muscle-map";
import {
  FitnessExploreGrid,
  FitnessDashboardSections,
  FitnessGoalPaths,
  FitnessMuscleBalancePreview,
  FitnessNutritionSupport,
  FitnessSafetyRecoveryCard,
  FitnessStatusRow,
  FitnessTodayHero,
  FitnessWorkoutPrograms,
} from "@/components/fitness/realm";
import { AppMainLayout } from "@/components/layout/AppMainLayout";
import { AppButton, AppCard, AppIcon, AppSection } from "@/components/ui";
import {
  FITNESS_EXPLORE_FEATURES,
  FITNESS_GOAL_FEATURES,
  FITNESS_PROGRAM_FEATURES,
} from "@/constants/featurePreferenceConfig";
import {
  FITNESS_EXPLORE_CATEGORIES,
  FITNESS_GOAL_PATHS,
  FITNESS_WORKOUT_PROGRAMS,
} from "@/constants/fitnessRealmConfig";
import {
  EXERCISE_EQUIPMENT,
  EXERCISE_LIBRARY,
  MUSCLE_GROUPS,
  PREBUILT_ROUTINES,
  WORKOUT_DIFFICULTIES,
  WORKOUT_GOALS,
  WORKOUT_LOCATIONS,
  formatWorkoutLabel,
  getExerciseById,
} from "@/constants/workoutLibrary";
import { useActiveProfile } from "@/context/ActiveProfileContext";
import {
  completeWorkoutSession,
  createWorkoutSession,
  getTodayFitnessSummary,
  getWorkoutSessions,
} from "@/lib/fitnessStorage";
import { lightImpact, successImpact } from "@/lib/haptics";
import {
  getExercises,
  getNutritionTemplates,
  getWorkoutPrograms,
} from "@/services/fitnessContentService";
import {
  getMuscleHistoryScores,
  recordMuscleLoadForExercise,
  scoresFromExerciseFallback,
} from "@/services/fitnessMuscleMapService";
import {
  getUserFeaturePreferences,
  shouldShowFeature,
  type UserFeaturePreference,
} from "@/services/userFeaturePreferencesService";
import { useAppTheme } from "@/theme/ThemeProvider";
import type {
  ExerciseEquipment,
  ExerciseLibraryItem,
  FitnessSummary,
  GuidedWorkoutExercise,
  GuidedWorkoutSet,
  MuscleGroup,
  RunningLogDraft,
  WorkoutDifficulty,
  WorkoutGoalTag,
  WorkoutLocation,
  WorkoutRoutine,
  WorkoutSession,
} from "@/types/fitness";

type FitnessTab =
  | "today"
  | "start"
  | "routines"
  | "library"
  | "running"
  | "progress"
  | "body"
  | "guides";
type EditableSetField =
  | "reps"
  | "weight"
  | "rest"
  | "duration"
  | "distance"
  | null;
type FitnessContentPreview = {
  exerciseCount: number;
  nutritionSuggestion?: string;
  programCount: number;
};

const FITNESS_TABS: Array<{ key: FitnessTab; label: string }> = [
  { key: "today", label: "Today" },
  { key: "start", label: "Start" },
  { key: "routines", label: "Routines" },
  { key: "library", label: "Exercise Library" },
  { key: "running", label: "Running" },
  { key: "progress", label: "Progress" },
  { key: "body", label: "Body" },
  { key: "guides", label: "Guides" },
];

const SAFETY_COPY =
  "Exercise guidance is for general fitness tracking only. If you are unsure, injured, pregnant, or managing a health condition, speak to a qualified professional.";
export default function FitnessScreen() {
  const { activeProfile } = useActiveProfile();
  const [activeTab, setActiveTab] = useState<FitnessTab>("today");
  const [summary, setSummary] = useState<FitnessSummary | null>(null);
  const [sessions, setSessions] = useState<WorkoutSession[]>([]);
  const [selectedRoutine, setSelectedRoutine] = useState<WorkoutRoutine>(
    PREBUILT_ROUTINES[0],
  );
  const [sessionExercises, setSessionExercises] = useState<
    GuidedWorkoutExercise[]
  >(() => buildSessionExercises(PREBUILT_ROUTINES[0]));
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0);
  const [editing, setEditing] = useState<{
    exerciseIndex: number;
    field: EditableSetField;
    setIndex: number;
  } | null>(null);
  const [quickValue, setQuickValue] = useState(0);
  const [manualMode, setManualMode] = useState(false);
  const [manualValue, setManualValue] = useState("");
  const [saveMessage, setSaveMessage] = useState("");
  const [contentPreview, setContentPreview] =
    useState<FitnessContentPreview | null>(null);
  const [contentError, setContentError] = useState("");
  const [contentLoading, setContentLoading] = useState(true);
  const [featurePreferences, setFeaturePreferences] = useState<
    UserFeaturePreference[]
  >([]);

  const loadFitness = useCallback(async () => {
    const [nextSummary, nextSessions] = await Promise.all([
      getTodayFitnessSummary(),
      getWorkoutSessions(),
    ]);
    setSummary(nextSummary);
    setSessions(nextSessions);

    setContentLoading(true);
    const [exerciseResult, programResult, nutritionResult] = await Promise.all([
      getExercises(),
      getWorkoutPrograms(),
      getNutritionTemplates({ goal: "muscle_gain" }),
    ]);
    const contentFailure =
      exerciseResult.error ?? programResult.error ?? nutritionResult.error;

    if (contentFailure) {
      setContentError(
        "Live fitness content is unavailable. Showing the built-in starter library.",
      );
      setContentPreview(null);
    } else {
      const nutritionRow = nutritionResult.data?.[0] as
        | { title?: string }
        | undefined;
      setContentError("");
      setContentPreview({
        exerciseCount: exerciseResult.data?.length ?? 0,
        nutritionSuggestion: nutritionRow?.title,
        programCount: programResult.data?.length ?? 0,
      });
    }
    setContentLoading(false);
  }, []);

  useFocusEffect(
    useCallback(() => {
      Promise.resolve()
        .then(() =>
          Promise.all([
            loadFitness(),
            getUserFeaturePreferences(activeProfile?.id).then(
              setFeaturePreferences,
            ),
          ]),
        )
        .catch(() => undefined);
    }, [activeProfile?.id, loadFitness]),
  );

  const featureContext = useMemo(
    () => ({
      preferences: featurePreferences,
      profileType: activeProfile?.profileType,
    }),
    [activeProfile?.profileType, featurePreferences],
  );
  const visibleGoals = useMemo(
    () =>
      FITNESS_GOAL_PATHS.filter((goal) =>
        shouldShowFeature(
          FITNESS_GOAL_FEATURES[goal.id] ?? "fitness",
          featureContext,
        ),
      ),
    [featureContext],
  );
  const visiblePrograms = useMemo(
    () =>
      FITNESS_WORKOUT_PROGRAMS.filter((program) =>
        shouldShowFeature(
          FITNESS_PROGRAM_FEATURES[program.id] ?? "fitness",
          featureContext,
        ),
      ),
    [featureContext],
  );
  const visibleExplore = useMemo(
    () =>
      FITNESS_EXPLORE_CATEGORIES.filter((category) =>
        shouldShowFeature(
          FITNESS_EXPLORE_FEATURES[category.id] ?? "fitness",
          featureContext,
        ),
      ),
    [featureContext],
  );

  const completedSetCount = sessionExercises.reduce(
    (total, item) => total + item.sets.filter((set) => set.completed).length,
    0,
  );
  const totalSetCount = sessionExercises.reduce(
    (total, item) => total + item.sets.length,
    0,
  );
  const latestWorkout =
    sessions.find((session) => session.completed) ?? summary?.latestWorkout;

  function selectRoutine(routine: WorkoutRoutine, tab: FitnessTab = "start") {
    setSelectedRoutine(routine);
    setSessionExercises(buildSessionExercises(routine));
    setCurrentExerciseIndex(0);
    setActiveTab(tab);
  }

  function openSetEditor(
    exerciseIndex: number,
    setIndex: number,
    field: Exclude<EditableSetField, null>,
  ) {
    const currentSet = sessionExercises[exerciseIndex]?.sets[setIndex];
    const currentValue =
      field === "weight"
        ? (currentSet?.weightKg ?? 0)
        : (currentSet?.reps ?? 0);
    setEditing({ exerciseIndex, field, setIndex });
    setQuickValue(currentValue);
    setManualValue(String(currentValue || ""));
    setManualMode(false);
  }

  function saveSetValue() {
    if (!editing) return;
    const nextValue = Number(manualMode ? manualValue : quickValue);
    if (!Number.isFinite(nextValue)) return;
    setSessionExercises((current) =>
      current.map((exercise, exerciseIndex) =>
        exerciseIndex !== editing.exerciseIndex
          ? exercise
          : {
              ...exercise,
              sets: exercise.sets.map((set, setIndex) =>
                setIndex !== editing.setIndex
                  ? set
                  : editing.field === "weight"
                    ? { ...set, weightKg: nextValue }
                    : { ...set, reps: Math.round(nextValue) },
              ),
            },
      ),
    );
    setEditing(null);
    successImpact();
  }

  function toggleSet(exerciseIndex: number, setIndex: number) {
    setSessionExercises((current) =>
      current.map((exercise, currentExerciseIndexValue) =>
        currentExerciseIndexValue !== exerciseIndex
          ? exercise
          : {
              ...exercise,
              sets: exercise.sets.map((set, currentSetIndex) =>
                currentSetIndex === setIndex
                  ? { ...set, completed: !set.completed }
                  : set,
              ),
            },
      ),
    );
    successImpact();
  }

  function addSet(exerciseIndex: number) {
    setSessionExercises((current) =>
      current.map((exercise, currentExerciseIndexValue) => {
        if (currentExerciseIndexValue !== exerciseIndex) return exercise;
        const lastSet = exercise.sets[exercise.sets.length - 1];
        const nextSet: GuidedWorkoutSet = {
          completed: false,
          id: `${exercise.exerciseId}-set-${Date.now()}`,
          reps: lastSet?.reps ?? 10,
          setNumber: exercise.sets.length + 1,
          weightKg: lastSet?.weightKg,
        };
        return { ...exercise, sets: [...exercise.sets, nextSet] };
      }),
    );
  }

  async function finishWorkout() {
    const durationSeconds = Math.max(
      selectedRoutine.durationMinutes * 60,
      completedSetCount * 90,
    );
    const session = await createWorkoutSession({
      durationSeconds,
      intensity:
        selectedRoutine.difficulty === "beginner" ? "easy" : "moderate",
      notes: `${completedSetCount}/${totalSetCount} sets completed from ${selectedRoutine.name}.`,
      title: selectedRoutine.name,
      workoutType:
        selectedRoutine.goal === "endurance"
          ? "running"
          : selectedRoutine.goal === "mobility"
            ? "mobility"
            : "strength",
    });
    await completeWorkoutSession(session.id, {
      durationSeconds,
      endedAt: new Date().toISOString(),
    });
    await Promise.allSettled(
      sessionExercises
        .filter((item) => item.sets.some((set) => set.completed))
        .map((item) => {
          const fallbackExercise = getExerciseById(item.exerciseId);
          const completedSets = item.sets.filter((set) => set.completed).length;
          const totalSets = Math.max(1, item.sets.length);
          const intensityMultiplier = completedSets / totalSets;

          return recordMuscleLoadForExercise({
            exerciseId: item.exerciseId,
            fallbackExercise,
            intensityMultiplier,
            source: "guided_workout_completed",
            workoutSessionId: session.id,
          });
        }),
    );
    setSaveMessage("Workout saved");
    await loadFitness();
    setActiveTab("progress");
  }

  return (
    <AppMainLayout
      subtitle="Movement, strength, recovery and progress"
      title="Fitness Realm"
    >
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.tabRow}
      >
        {FITNESS_TABS.map((tab) => (
          <FilterChip
            key={tab.key}
            label={tab.label}
            onPress={() => setActiveTab(tab.key)}
            selected={activeTab === tab.key}
          />
        ))}
      </ScrollView>

      {saveMessage ? (
        <SuccessState
          message={saveMessage}
          onDismiss={() => setSaveMessage("")}
        />
      ) : null}

      {activeTab === "today" ? (
        <TodayTab
          latestWorkout={latestWorkout}
          contentError={contentError}
          contentLoading={contentLoading}
          contentPreview={contentPreview}
          onRoutine={selectRoutine}
          onTab={setActiveTab}
          summary={summary}
          visibleExplore={visibleExplore}
          visibleGoals={visibleGoals}
          visiblePrograms={visiblePrograms}
          showAiImport={shouldShowFeature("ai_plan_import", featureContext)}
          showNutrition={shouldShowFeature("nutrition", featureContext)}
        />
      ) : null}
      {activeTab === "start" ? (
        <StartTab
          addSet={addSet}
          completedSetCount={completedSetCount}
          currentExerciseIndex={currentExerciseIndex}
          finishWorkout={finishWorkout}
          onExerciseIndexChange={setCurrentExerciseIndex}
          onSetEdit={openSetEditor}
          routine={selectedRoutine}
          sessionExercises={sessionExercises}
          toggleSet={toggleSet}
          totalSetCount={totalSetCount}
        />
      ) : null}
      {activeTab === "routines" ? (
        <RoutinesTab onRoutine={selectRoutine} />
      ) : null}
      {activeTab === "library" ? <LibraryTab /> : null}
      {activeTab === "running" ? (
        <RunningTab onSaved={loadFitness} onTab={setActiveTab} />
      ) : null}
      {activeTab === "progress" ? (
        <ProgressTab sessions={sessions} summary={summary} />
      ) : null}
      {activeTab === "body" ? <BodyTab /> : null}
      {activeTab === "guides" ? <GuidesTab /> : null}

      <SafetyCard />

      <QuickLogBottomSheet
        onClose={() => setEditing(null)}
        title={editing?.field === "weight" ? "Update weight" : "Update reps"}
        visible={Boolean(editing)}
      >
        <ManualEntryToggle
          enabled={manualMode}
          onToggle={() => setManualMode((current) => !current)}
        />
        {manualMode ? (
          <TextInput
            keyboardType="decimal-pad"
            onChangeText={setManualValue}
            placeholder="Enter value"
            placeholderTextColor="#94a3b8"
            style={styles.darkInput}
            value={manualValue}
          />
        ) : editing?.field === "weight" ? (
          <>
            <PresetChipGroup
              onSelect={setQuickValue}
              presets={[0, 5, 10, 15, 20, 25, 30]}
              selectedValue={quickValue}
              suffix="kg"
            />
            <NumberWheelPicker
              max={120}
              min={0}
              onChange={setQuickValue}
              step={2.5}
              suffix="kg"
              value={quickValue}
            />
          </>
        ) : (
          <>
            <PresetChipGroup
              onSelect={setQuickValue}
              presets={[5, 8, 10, 12, 15, 20]}
              selectedValue={quickValue}
            />
            <NumberWheelPicker
              max={30}
              min={1}
              onChange={setQuickValue}
              value={quickValue}
            />
          </>
        )}
        <QuickSaveButton onPress={saveSetValue} title="Save set value" />
      </QuickLogBottomSheet>
    </AppMainLayout>
  );
}

function TodayTab({
  contentError,
  contentLoading,
  contentPreview,
  latestWorkout,
  onRoutine,
  onTab,
  summary,
  showAiImport,
  showNutrition,
  visibleExplore,
  visibleGoals,
  visiblePrograms,
}: {
  contentError: string;
  contentLoading: boolean;
  contentPreview: FitnessContentPreview | null;
  latestWorkout?: WorkoutSession;
  onRoutine: (routine: WorkoutRoutine, tab?: FitnessTab) => void;
  onTab: (tab: FitnessTab) => void;
  summary: FitnessSummary | null;
  showAiImport: boolean;
  showNutrition: boolean;
  visibleExplore: typeof FITNESS_EXPLORE_CATEGORIES;
  visibleGoals: typeof FITNESS_GOAL_PATHS;
  visiblePrograms: typeof FITNESS_WORKOUT_PROGRAMS;
}) {
  const plan = PREBUILT_ROUTINES[0];
  const { theme } = useAppTheme();

  return (
    <View style={styles.realmStack}>
      <Pressable
        accessibilityRole="button"
        onPress={() => router.push("/fitness/preferences" as Href)}
        style={styles.customizeRow}
      >
        <AppIcon color={theme.primary} decorative name="settings" size={16} />
        <Text style={[styles.customizeText, { color: theme.primary }]}>
          Customize
        </Text>
      </Pressable>
      {contentLoading ? (
        <ContentState icon="sync" text="Loading live fitness suggestions..." />
      ) : null}
      {contentError ? (
        <ContentState icon="warning" text={contentError} warning />
      ) : null}
      {!contentLoading &&
      !contentError &&
      contentPreview?.exerciseCount === 0 ? (
        <ContentState
          icon="source"
          text="No live exercises yet. Showing the built-in starter library."
        />
      ) : null}

      <FitnessTodayHero
        focusMuscles={plan.targetMuscles
          .slice(0, 3)
          .map((muscle) => formatWorkoutLabel(muscle))}
        minutes={plan.durationMinutes}
        movementTitle={plan.name}
        onQuickLog={() => onTab("start")}
        onStart={() => onRoutine(plan)}
        onSwap={() => onTab("routines")}
        readiness={
          summary?.activeMinutesToday ? "Recovery mindful" : "Ready today"
        }
        weeklyProgress={summary?.weeklyGoalProgress ?? 0}
        workoutsThisWeek={summary?.workoutsThisWeek ?? 0}
      />

      <FitnessDashboardSections
        latestWorkout={latestWorkout}
        onTab={onTab}
        summary={summary}
      />

      <FitnessStatusRow
        onProgress={() => router.push("/fitness/history" as Href)}
        onReminder={() => onTab("guides")}
        summary={summary}
      />

      <FitnessGoalPaths
        goals={visibleGoals}
        onSelect={(goal) => router.push(`/fitness/goal/${goal.id}` as Href)}
        onViewAll={() => router.push("/fitness/goals" as Href)}
      />

      <FitnessWorkoutPrograms
        onSelect={(program) =>
          router.push(`/fitness/program/${program.id}` as Href)
        }
        onViewAll={() => router.push("/fitness/programs" as Href)}
        programs={visiblePrograms}
      />

      {showAiImport ? (
        <Pressable
          accessibilityRole="button"
          onPress={() => router.push("/fitness/ai-import" as Href)}
        >
          <AppCard style={styles.aiImportCard}>
            <View style={styles.aiImportIcon}>
              <AppIcon color="#6ee7c8" decorative name="search" size={22} />
            </View>
            <View style={styles.aiImportCopy}>
              <Text style={styles.aiImportKicker}>AI plan import</Text>
              <Text style={styles.aiImportTitle}>Find or import a plan</Text>
              <Text style={styles.aiImportBody}>
                Review workout, nutrition, or wellness guidance before importing
                an editable draft.
              </Text>
            </View>
            <AppIcon color="#94a3b8" decorative name="add" size={20} />
          </AppCard>
        </Pressable>
      ) : null}

      <FitnessExploreGrid
        categories={visibleExplore}
        onSelect={(category) =>
          category.destination === "library"
            ? router.push("/fitness/library" as Href)
            : onTab(category.destination)
        }
      />

      <FitnessMuscleBalancePreview
        onOpen={() => router.push("/fitness/body-map" as Href)}
        scores={
          summary?.workoutsThisWeek
            ? { abs: 0.45, chest: 0.7, quads: 0.25 }
            : undefined
        }
      />

      {showNutrition ? (
        <FitnessNutritionSupport
          onOpenFood={() => router.push("/food" as Href)}
          suggestion={contentPreview?.nutritionSuggestion}
        />
      ) : null}

      <FitnessSafetyRecoveryCard />

      <AppCard style={styles.liveLibraryCard}>
        <View>
          <Text style={styles.liveLibraryValue}>
            {contentPreview?.exerciseCount || EXERCISE_LIBRARY.length}+
          </Text>
          <Text style={styles.liveLibraryLabel}>exercise previews ready</Text>
        </View>
        <View>
          <Text style={styles.liveLibraryValue}>
            {contentPreview?.programCount || PREBUILT_ROUTINES.length}
          </Text>
          <Text style={styles.liveLibraryLabel}>goal paths available</Text>
        </View>
        <Pressable
          onPress={() => onTab("library")}
          style={styles.liveLibraryButton}
        >
          <AppIcon color="#06231c" decorative name="search" size={18} />
        </Pressable>
      </AppCard>

      {latestWorkout ? (
        <Text style={styles.lastWorkoutCopy}>
          Last logged: {latestWorkout.title}
        </Text>
      ) : null}
    </View>
  );
}

function ContentState({
  icon,
  text,
  warning = false,
}: {
  icon: "source" | "sync" | "warning";
  text: string;
  warning?: boolean;
}) {
  return (
    <View
      style={[styles.contentState, warning ? styles.contentStateWarning : null]}
    >
      <AppIcon
        color={warning ? "#c2410c" : "#0f766e"}
        decorative
        name={icon}
        size={18}
      />
      <Text
        style={[
          styles.contentStateText,
          warning ? styles.contentStateWarningText : null,
        ]}
      >
        {text}
      </Text>
    </View>
  );
}

function StartTab({
  addSet,
  completedSetCount,
  currentExerciseIndex,
  finishWorkout,
  onExerciseIndexChange,
  onSetEdit,
  routine,
  sessionExercises,
  toggleSet,
  totalSetCount,
}: {
  addSet: (exerciseIndex: number) => void;
  completedSetCount: number;
  currentExerciseIndex: number;
  finishWorkout: () => void;
  onExerciseIndexChange: (index: number) => void;
  onSetEdit: (
    exerciseIndex: number,
    setIndex: number,
    field: Exclude<EditableSetField, null>,
  ) => void;
  routine: WorkoutRoutine;
  sessionExercises: GuidedWorkoutExercise[];
  toggleSet: (exerciseIndex: number, setIndex: number) => void;
  totalSetCount: number;
}) {
  const current = sessionExercises[currentExerciseIndex];
  const exercise = current ? getExerciseById(current.exerciseId) : undefined;
  const activeMuscleScores = scoresFromExerciseFallback(exercise);
  const progress = totalSetCount ? completedSetCount / totalSetCount : 0;

  return (
    <View style={styles.stack}>
      <AppCard style={styles.darkCard}>
        <Text style={styles.darkKicker}>Guided session</Text>
        <Text style={styles.darkTitle}>{routine.name}</Text>
        <Text style={styles.darkMuted}>
          {completedSetCount}/{totalSetCount} sets complete
        </Text>
        <ProgressBar color={routine.accentColor} value={progress} />
      </AppCard>

      {exercise && current ? (
        <AppCard style={styles.darkCard}>
          <MediaPlaceholder
            accentColor={routine.accentColor}
            label="Exercise demo"
          />
          <Text style={styles.darkTitle}>{exercise.name}</Text>
          <Text style={styles.darkMuted}>
            {formatWorkoutLabel(exercise.primaryMuscle)} -{" "}
            {exercise.equipment.map(formatWorkoutLabel).join(", ")}
          </Text>
          <View style={{ marginTop: 14 }}>
            <MuscleFocusCard
              compact
              mode="exercise"
              muscleScores={activeMuscleScores}
              title="Working Muscles"
            />
          </View>
          <View style={styles.setList}>
            {current.sets.map((set, setIndex) => (
              <SetRow
                key={set.id}
                onEdit={(field) =>
                  onSetEdit(currentExerciseIndex, setIndex, field)
                }
                onToggle={() => toggleSet(currentExerciseIndex, setIndex)}
                set={set}
              />
            ))}
          </View>
          <View style={styles.actionRow}>
            <GhostButton
              label="Add set"
              onPress={() => addSet(currentExerciseIndex)}
            />
            <GhostButton
              label="Next exercise"
              onPress={() =>
                onExerciseIndexChange(
                  Math.min(
                    sessionExercises.length - 1,
                    currentExerciseIndex + 1,
                  ),
                )
              }
            />
          </View>
        </AppCard>
      ) : (
        <PremiumEmptyState
          button="Browse routines"
          message="Choose a routine, build your own, or log a quick session."
          onPress={() => undefined}
          title="Ready to move?"
        />
      )}

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.horizontalCards}
      >
        {sessionExercises.map((item, index) => {
          const itemExercise = getExerciseById(item.exerciseId);
          return (
            <FilterChip
              key={item.exerciseId}
              label={`${index + 1}. ${itemExercise?.name ?? "Exercise"}`}
              onPress={() => onExerciseIndexChange(index)}
              selected={index === currentExerciseIndex}
            />
          );
        })}
      </ScrollView>

      <AppCard style={styles.darkCard}>
        <Text style={styles.darkTitle}>Rest timer</Text>
        <Text style={styles.darkMuted}>
          Rest timer placeholder: 60-90 seconds between hard sets.
        </Text>
        <View style={styles.chipRow}>
          {[30, 60, 90, 120].map((seconds) => (
            <Pill key={seconds} label={`${seconds}s`} />
          ))}
        </View>
      </AppCard>
      <AppButton onPress={finishWorkout} title="Finish workout" />
    </View>
  );
}

function RoutinesTab({
  onRoutine,
}: {
  onRoutine: (routine: WorkoutRoutine, tab?: FitnessTab) => void;
}) {
  return (
    <View style={styles.stack}>
      <AppSection
        title="Routines"
        subtitle="Starter plans for home, gym, running, strength and recovery."
      />
      {PREBUILT_ROUTINES.map((routine) => (
        <RoutineCard
          key={routine.id}
          onStart={() => onRoutine(routine)}
          routine={routine}
        />
      ))}
    </View>
  );
}

function LibraryTab() {
  const [muscle, setMuscle] = useState<MuscleGroup | "all">("all");
  const [equipment, setEquipment] = useState<ExerciseEquipment | "all">("all");
  const [location, setLocation] = useState<WorkoutLocation | "all">("all");
  const [difficulty, setDifficulty] = useState<WorkoutDifficulty | "all">(
    "all",
  );
  const [goal, setGoal] = useState<WorkoutGoalTag | "all">("all");

  const filteredExercises = useMemo(
    () =>
      EXERCISE_LIBRARY.filter(
        (exercise) =>
          (muscle === "all" ||
            exercise.primaryMuscle === muscle ||
            exercise.secondaryMuscles.includes(muscle)) &&
          (equipment === "all" || exercise.equipment.includes(equipment)) &&
          (location === "all" || exercise.location.includes(location)) &&
          (difficulty === "all" || exercise.difficulty === difficulty) &&
          (goal === "all" || exercise.goalTags.includes(goal)),
      ),
    [difficulty, equipment, goal, location, muscle],
  );

  return (
    <View style={styles.stack}>
      <AppSection
        title="Exercise Library"
        subtitle="Browse by muscle, equipment, location, difficulty and goal."
      />
      <AppButton
        onPress={() => router.push("/fitness/library" as Href)}
        title="Open full exercise library"
      />
      <FilterGroup
        label="Muscle group"
        options={["all", ...MUSCLE_GROUPS]}
        selected={muscle}
        onSelect={(value) => setMuscle(value as typeof muscle)}
      />
      <FilterGroup
        label="Equipment"
        options={["all", ...EXERCISE_EQUIPMENT]}
        selected={equipment}
        onSelect={(value) => setEquipment(value as typeof equipment)}
      />
      <FilterGroup
        label="Location"
        options={["all", ...WORKOUT_LOCATIONS]}
        selected={location}
        onSelect={(value) => setLocation(value as typeof location)}
      />
      <FilterGroup
        label="Difficulty"
        options={["all", ...WORKOUT_DIFFICULTIES]}
        selected={difficulty}
        onSelect={(value) => setDifficulty(value as typeof difficulty)}
      />
      <FilterGroup
        label="Goal"
        options={["all", ...WORKOUT_GOALS]}
        selected={goal}
        onSelect={(value) => setGoal(value as typeof goal)}
      />
      {filteredExercises.length ? (
        filteredExercises.map((exercise) => (
          <ExerciseCard exercise={exercise} key={exercise.id} />
        ))
      ) : (
        <PremiumEmptyState
          button="Browse exercises"
          message="Start with bodyweight, gym, machine, or running exercises."
          onPress={() => {
            setMuscle("all");
            setEquipment("all");
            setLocation("all");
            setDifficulty("all");
            setGoal("all");
          }}
          title="Build your exercise library"
        />
      )}
    </View>
  );
}

function RunningTab({
  onSaved,
  onTab,
}: {
  onSaved: () => void;
  onTab: (tab: FitnessTab) => void;
}) {
  const [draft, setDraft] = useState<RunningLogDraft>({
    distanceKm: 3,
    durationMinutes: 25,
    effort: "easy",
  });
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const pace =
    draft.distanceKm > 0 ? draft.durationMinutes / draft.distanceKm : 0;

  async function saveRun() {
    const session = await createWorkoutSession({
      distanceKm: draft.distanceKm,
      durationSeconds: draft.durationMinutes * 60,
      intensity: draft.effort ?? "easy",
      notes:
        [draft.routeNote, draft.notes].filter(Boolean).join(" - ") || undefined,
      startedAt: `${date}T12:00:00.000Z`,
      title: "Running",
      workoutType: "running",
    });
    await completeWorkoutSession(session.id, {
      durationSeconds: draft.durationMinutes * 60,
      endedAt: new Date().toISOString(),
    });
    await onSaved();
    onTab("progress");
  }

  return (
    <View style={styles.stack}>
      <AppCard style={styles.darkHero}>
        <Text style={styles.heroKicker}>Running</Text>
        <Text style={styles.heroTitle}>Quick Start Run</Text>
        <Text style={styles.heroSubtitle}>
          Manual logging now. Device routes can connect later.
        </Text>
        <View style={styles.actionRow}>
          <AppButton onPress={saveRun} title="Save run" />
          <GhostButton label="Starter plan" onPress={() => undefined} />
        </View>
      </AppCard>
      <AppCard style={styles.darkCard}>
        <Text style={styles.darkTitle}>Manual Run Log</Text>
        <Text style={styles.darkMuted}>
          Pace preview: {pace ? `${pace.toFixed(1)} min/km` : "Add distance"}
        </Text>
        <Text style={styles.filterLabel}>Distance</Text>
        <PresetChipGroup
          onSelect={(value) =>
            setDraft((current) => ({ ...current, distanceKm: value }))
          }
          presets={[1, 3, 5, 10]}
          selectedValue={draft.distanceKm}
          suffix="km"
        />
        <NumberWheelPicker
          max={21}
          min={0.5}
          onChange={(value) =>
            setDraft((current) => ({ ...current, distanceKm: value }))
          }
          step={0.5}
          suffix="km"
          value={draft.distanceKm}
        />
        <Text style={styles.filterLabel}>Duration</Text>
        <TimeWheelPicker
          onChange={(value) =>
            setDraft((current) => ({ ...current, durationMinutes: value }))
          }
          valueMinutes={draft.durationMinutes}
        />
        <Text style={styles.filterLabel}>Date</Text>
        <DateWheelPicker onChange={setDate} value={date} />
        <QuickNoteField
          onChangeText={(notes) =>
            setDraft((current) => ({ ...current, notes }))
          }
          value={draft.notes ?? ""}
        />
        <QuickSaveButton onPress={saveRun} title="Save run" />
      </AppCard>
      <View style={styles.grid}>
        <MetricCard label="Weekly distance" value="Log runs to unlock" />
        <MetricCard
          label="Pace preview"
          value={pace ? `${pace.toFixed(1)} min/km` : "Start today"}
        />
        <MetricCard label="Last run" value="Start today" />
        <MetricCard label="Running plan" value="Running Starter Plan" />
      </View>
    </View>
  );
}

function ProgressTab({
  sessions,
  summary,
}: {
  sessions: WorkoutSession[];
  summary: FitnessSummary | null;
}) {
  const completedSessions = sessions.filter((session) => session.completed);
  const totalVolume = completedSessions.reduce(
    (total, session) => total + Math.round(session.durationSeconds / 60),
    0,
  );
  const runningDistance = completedSessions.reduce(
    (total, session) => total + (session.distanceKm ?? 0),
    0,
  );
  return (
    <View style={styles.stack}>
      <AppSection
        title="Progress"
        subtitle="Useful answers from the workouts you log."
      />
      {!completedSessions.length ? (
        <PremiumEmptyState
          button="Start workout"
          message="Complete a workout to see consistency, personal bests, and trends."
          onPress={() => undefined}
          title="Progress starts with your first session"
        />
      ) : null}
      <ProgressPreview sessions={sessions} summary={summary} />
      <View style={styles.grid}>
        <MetricCard label="Total volume" value={`${totalVolume} min`} />
        <MetricCard
          label="Workout streak"
          value={`${summary?.currentStreakDays ?? 0} days`}
        />
        <MetricCard
          label="Running trend"
          value={`${runningDistance.toFixed(1)} km`}
        />
        <MetricCard
          label="Personal bests"
          value={completedSessions[0]?.title ?? "Start today"}
        />
      </View>
      <ChartCard
        title="Muscle group balance"
        values={[0.7, 0.5, 0.35, 0.6, 0.4]}
      />
      <ChartCard
        title="Running distance trend"
        values={[0.2, 0.25, 0.45, 0.3, 0.55, 0.7, 0.6]}
      />
    </View>
  );
}

function BodyTab() {
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

  const hasHistory = Object.keys(scores).length > 0;

  return (
    <View style={{ gap: 16 }}>
      <MuscleFocusCard
        mode="history"
        muscleScores={scores}
        suggestedMuscles={hasHistory ? undefined : ["upper_back", "glutes"]}
        title="Muscle Balance This Week"
      />

      <AppCard style={styles.darkCard}>
        <Text style={styles.darkTitle}>
          {loading ? "Loading muscle history..." : "Body map guidance"}
        </Text>
        <Text style={styles.darkMuted}>
          {hasHistory
            ? "Darker areas show higher recent load. Suggested areas help balance training across the week."
            : "No muscle history yet. Complete workouts to build your real heatmap. Suggested areas show where you can begin."}
        </Text>
        <View style={{ marginTop: 12 }}>
          <AppButton
            onPress={() => router.push("/fitness/body-map" as Href)}
            title="Open full body map"
          />
        </View>
      </AppCard>
    </View>
  );
}

function GuidesTab() {
  const prompts = [
    "Build me a beginner workout",
    "Explain this exercise",
    "Log my sets",
    "Suggest a home workout",
    "Summarize my week",
  ];
  return (
    <View style={styles.stack}>
      <AppSection
        title="Guides"
        subtitle="Workout education, media placeholders and assistant drafts."
      />
      <AppCard style={styles.darkCard}>
        <Text style={styles.darkTitle}>Exercise media placeholders</Text>
        <Text style={styles.darkMuted}>
          Exercise demo images, video URLs, routine covers and muscle diagrams
          are structured locally and ready for real media later.
        </Text>
      </AppCard>
      <AppCard style={styles.darkCard}>
        <Text style={styles.darkTitle}>AI workout prompts</Text>
        <Text style={styles.darkMuted}>
          Assistant output should create drafts only and avoid medical claims.
        </Text>
        <View style={styles.chipRow}>
          {prompts.map((prompt) => (
            <Pill
              key={prompt}
              label={prompt}
              onPress={() =>
                router.push(
                  `/ai?mode=workout_logger&prompt=${encodeURIComponent(prompt)}` as Href,
                )
              }
            />
          ))}
        </View>
      </AppCard>
      <SkeletonCard label="Workout session skeleton" />
      <SkeletonCard label="Progress chart skeleton" />
    </View>
  );
}

function RoutineCard({
  compact = false,
  onStart,
  routine,
}: {
  compact?: boolean;
  onStart: () => void;
  routine: WorkoutRoutine;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      onPress={() => {
        lightImpact();
        onStart();
      }}
      style={[
        styles.routineCard,
        compact ? styles.compactRoutine : null,
        { borderColor: routine.accentColor },
      ]}
    >
      <MediaPlaceholder
        accentColor={routine.accentColor}
        label="Routine cover"
        small={compact}
      />
      <Text style={styles.darkTitle}>{routine.name}</Text>
      <Text style={styles.darkMuted}>{routine.description}</Text>
      <View style={styles.chipRow}>
        <Pill label={`${routine.durationMinutes} min`} />
        <Pill label={formatWorkoutLabel(routine.difficulty)} />
        <Pill
          label={routine.equipment
            .slice(0, 2)
            .map(formatWorkoutLabel)
            .join(", ")}
        />
      </View>
      <Text style={styles.darkMuted}>
        Target: {routine.targetMuscles.map(formatWorkoutLabel).join(" - ")}
      </Text>
      <View style={styles.actionRow}>
        <GhostButton label="Start" onPress={onStart} />
        <GhostButton label="Save" onPress={() => undefined} />
      </View>
    </Pressable>
  );
}

function ExerciseCard({ exercise }: { exercise: ExerciseLibraryItem }) {
  return (
    <Pressable
      accessibilityRole="button"
      onPress={() => router.push(`/fitness/exercise/${exercise.id}` as Href)}
      style={styles.exerciseCard}
    >
      <MediaPlaceholder accentColor="#6ee7c8" label="Exercise demo" small />
      <View style={styles.exerciseBody}>
        <Text style={styles.darkTitle}>{exercise.name}</Text>
        <Text style={styles.darkMuted}>
          {formatWorkoutLabel(exercise.primaryMuscle)}
        </Text>
        <View style={styles.chipRow}>
          <Pill label={formatWorkoutLabel(exercise.equipment[0] ?? "none")} />
          <Pill label={formatWorkoutLabel(exercise.difficulty)} />
        </View>
      </View>
      <AppIcon color="#6ee7c8" decorative name="add" size={22} />
    </Pressable>
  );
}

function SetRow({
  onEdit,
  onToggle,
  set,
}: {
  onEdit: (field: Exclude<EditableSetField, null>) => void;
  onToggle: () => void;
  set: GuidedWorkoutSet;
}) {
  return (
    <View
      style={[styles.setRow, set.completed ? styles.setRowCompleted : null]}
    >
      <Text style={styles.setNumber}>{set.setNumber}</Text>
      <Pressable onPress={() => onEdit("reps")} style={styles.setValue}>
        <Text style={styles.setLabel}>Reps</Text>
        <Text style={styles.setText}>{set.reps}</Text>
      </Pressable>
      <Pressable onPress={() => onEdit("weight")} style={styles.setValue}>
        <Text style={styles.setLabel}>Weight</Text>
        <Text style={styles.setText}>{set.weightKg ?? 0} kg</Text>
      </Pressable>
      <Pressable
        accessibilityRole="button"
        onPress={onToggle}
        style={styles.completeButton}
      >
        <AppIcon
          color={set.completed ? "#10201d" : "#6ee7c8"}
          decorative
          name="success"
          size={20}
        />
      </Pressable>
    </View>
  );
}

function FilterGroup({
  label,
  onSelect,
  options,
  selected,
}: {
  label: string;
  onSelect: (value: string) => void;
  options: string[];
  selected: string;
}) {
  return (
    <View style={styles.filterGroup}>
      <Text style={styles.filterLabel}>{label}</Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.chipRow}
      >
        {options.map((option) => (
          <FilterChip
            key={option}
            label={formatWorkoutLabel(option)}
            onPress={() => onSelect(option)}
            selected={selected === option}
          />
        ))}
      </ScrollView>
    </View>
  );
}

function FilterChip({
  label,
  onPress,
  selected,
}: {
  label: string;
  onPress: () => void;
  selected: boolean;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      onPress={() => {
        lightImpact();
        onPress();
      }}
      style={[styles.filterChip, selected ? styles.filterChipSelected : null]}
    >
      <Text
        style={[
          styles.filterChipText,
          selected ? styles.filterChipTextSelected : null,
        ]}
      >
        {label}
      </Text>
    </Pressable>
  );
}

function QuickAction({
  iconName,
  label,
  onPress,
}: {
  iconName: string;
  label: string;
  onPress: () => void;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={styles.quickAction}
    >
      <AppIcon color="#6ee7c8" decorative name={iconName as never} size={22} />
      <Text style={styles.quickActionText}>{label}</Text>
    </Pressable>
  );
}

function MetricCard({ label, value }: { label: string; value: string }) {
  return (
    <AppCard style={styles.metricCard}>
      <Text style={styles.metricLabel}>{label}</Text>
      <Text style={styles.metricValue}>{value}</Text>
    </AppCard>
  );
}

function ProgressPreview({
  sessions,
  summary,
}: {
  sessions: WorkoutSession[];
  summary: FitnessSummary | null;
}) {
  const values = [
    0.35,
    0.52,
    0.25,
    Math.min(1, (summary?.workoutsThisWeek ?? 0) / 3),
    0.6,
    0.42,
    0.7,
  ];
  return (
    <ChartCard
      subtitle={`${summary?.workoutsThisWeek ?? 0} workouts this week - ${sessions.length} total logs`}
      title="Weekly workout consistency"
      values={values}
    />
  );
}

function ChartCard({
  subtitle,
  title,
  values,
}: {
  subtitle?: string;
  title: string;
  values: number[];
}) {
  return (
    <AppCard style={styles.darkCard}>
      <Text style={styles.darkTitle}>{title}</Text>
      {subtitle ? <Text style={styles.darkMuted}>{subtitle}</Text> : null}
      <View style={styles.barRow}>
        {values.map((value, index) => (
          <View key={`${title}-${index}`} style={styles.barTrack}>
            <View
              style={[
                styles.barFill,
                { height: `${Math.max(12, value * 100)}%` },
              ]}
            />
          </View>
        ))}
      </View>
    </AppCard>
  );
}

function MediaPlaceholder({
  accentColor,
  label,
  small = false,
}: {
  accentColor: string;
  label: string;
  small?: boolean;
}) {
  return (
    <View
      style={[
        styles.mediaPlaceholder,
        small ? styles.mediaSmall : null,
        { borderColor: accentColor },
      ]}
    >
      <AppIcon
        color={accentColor}
        decorative
        name="source"
        size={small ? 18 : 24}
      />
      <Text style={styles.mediaText}>{label}</Text>
    </View>
  );
}

function PremiumEmptyState({
  button,
  message,
  onPress,
  title,
}: {
  button: string;
  message: string;
  onPress: () => void;
  title: string;
}) {
  return (
    <AppCard style={styles.darkCard}>
      <Text style={styles.darkTitle}>{title}</Text>
      <Text style={styles.darkMuted}>{message}</Text>
      <View style={{ marginTop: 12 }}>
        <AppButton onPress={onPress} title={button} />
      </View>
    </AppCard>
  );
}

function SkeletonCard({ label }: { label: string }) {
  return (
    <AppCard style={styles.darkCard}>
      <Text style={styles.darkMuted}>{label}</Text>
      <View style={styles.skeletonLine} />
      <View style={[styles.skeletonLine, { width: "70%" }]} />
    </AppCard>
  );
}

function SafetyCard() {
  return (
    <AppCard backgroundColor="#fff7ed">
      <Text style={styles.safetyText}>{SAFETY_COPY}</Text>
    </AppCard>
  );
}

function SuccessState({
  message,
  onDismiss,
}: {
  message: string;
  onDismiss: () => void;
}) {
  return (
    <Pressable onPress={onDismiss} style={styles.successState}>
      <AppIcon color="#10201d" decorative name="success" size={20} />
      <Text style={styles.successText}>{message}</Text>
    </Pressable>
  );
}

function GhostButton({
  label,
  onPress,
}: {
  label: string;
  onPress: () => void;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={styles.ghostButton}
    >
      <Text style={styles.ghostText}>{label}</Text>
    </Pressable>
  );
}

function Pill({ label, onPress }: { label: string; onPress?: () => void }) {
  return (
    <Pressable
      accessibilityRole={onPress ? "button" : undefined}
      onPress={onPress}
      style={styles.pill}
    >
      <Text style={styles.pillText}>{label}</Text>
    </Pressable>
  );
}

function ProgressBar({ color, value }: { color: string; value: number }) {
  return (
    <View style={styles.progressTrack}>
      <View
        style={[
          styles.progressFill,
          {
            backgroundColor: color,
            width: `${Math.max(4, Math.min(100, value * 100))}%`,
          },
        ]}
      />
    </View>
  );
}

function buildSessionExercises(
  routine: WorkoutRoutine,
): GuidedWorkoutExercise[] {
  return routine.exerciseIds.map((exerciseId) => ({
    exerciseId,
    sets: [1, 2, 3].map((setNumber) => ({
      completed: false,
      id: `${exerciseId}-${setNumber}`,
      reps: routine.goal === "endurance" ? 15 : 10,
      setNumber,
      weightKg: routine.location === "home" ? 0 : undefined,
    })),
  }));
}

const styles = StyleSheet.create({
  aiImportBody: {
    color: "#94a3b8",
    fontSize: 12,
    lineHeight: 18,
    marginTop: 4,
  },
  aiImportCard: {
    alignItems: "center",
    backgroundColor: "#111827",
    borderColor: "rgba(110,231,200,0.28)",
    borderWidth: 1,
    flexDirection: "row",
    gap: 12,
  },
  aiImportCopy: {
    flex: 1,
  },
  aiImportIcon: {
    alignItems: "center",
    backgroundColor: "rgba(110,231,200,0.12)",
    borderRadius: 18,
    height: 44,
    justifyContent: "center",
    width: 44,
  },
  aiImportKicker: {
    color: "#6ee7c8",
    fontSize: 10,
    fontWeight: "900",
    letterSpacing: 0.6,
    textTransform: "uppercase",
  },
  aiImportTitle: {
    color: "#f8fafc",
    fontSize: 16,
    fontWeight: "900",
    marginTop: 2,
  },
  customizeRow: {
    alignItems: "center",
    alignSelf: "flex-end",
    flexDirection: "row",
    gap: 6,
    paddingHorizontal: 4,
    paddingVertical: 2,
  },
  customizeText: {
    fontSize: 11,
    fontWeight: "900",
  },
  actionRow: {
    alignItems: "center",
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    marginTop: 12,
  },
  bodyMapCard: {
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
  bodyMapCopy: {
    flex: 1,
    paddingBottom: 18,
    paddingLeft: 2,
    paddingTop: 18,
    zIndex: 2,
  },
  bodyMapPreview: {
    alignSelf: "flex-end",
    height: 225,
    width: 145,
  },
  barFill: {
    backgroundColor: "#6ee7c8",
    borderRadius: 999,
    bottom: 0,
    position: "absolute",
    width: "100%",
  },
  barRow: {
    alignItems: "flex-end",
    flexDirection: "row",
    gap: 8,
    height: 110,
    marginTop: 16,
  },
  barTrack: {
    backgroundColor: "rgba(255,255,255,0.08)",
    borderRadius: 999,
    flex: 1,
    height: "100%",
    overflow: "hidden",
  },
  chipRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  contentState: {
    alignItems: "center",
    backgroundColor: "#ecfdf5",
    borderColor: "#a7f3d0",
    borderRadius: 18,
    borderWidth: 1,
    flexDirection: "row",
    gap: 9,
    paddingHorizontal: 13,
    paddingVertical: 11,
  },
  contentStateText: {
    color: "#065f46",
    flex: 1,
    fontSize: 12,
    fontWeight: "800",
    lineHeight: 17,
  },
  contentStateWarning: {
    backgroundColor: "#fff7ed",
    borderColor: "#fed7aa",
  },
  contentStateWarningText: {
    color: "#9a3412",
  },
  compactRoutine: {
    width: 260,
  },
  completeButton: {
    alignItems: "center",
    backgroundColor: "rgba(110,231,200,0.14)",
    borderRadius: 999,
    height: 44,
    justifyContent: "center",
    width: 44,
  },
  darkCard: {
    backgroundColor: "#111827",
    borderColor: "rgba(255,255,255,0.12)",
    borderWidth: 1,
  },
  darkHero: {
    backgroundColor: "#0f172a",
    borderWidth: 1,
  },
  darkInput: {
    backgroundColor: "rgba(255,255,255,0.08)",
    borderColor: "rgba(255,255,255,0.14)",
    borderRadius: 16,
    borderWidth: 1,
    color: "#f8fafc",
    minHeight: 48,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  darkKicker: {
    color: "#6ee7c8",
    fontSize: 12,
    fontWeight: "900",
    letterSpacing: 0,
    textTransform: "uppercase",
  },
  darkMuted: {
    color: "#cbd5e1",
    lineHeight: 21,
    marginTop: 4,
  },
  darkTitle: {
    color: "#f8fafc",
    fontSize: 20,
    fontWeight: "900",
    marginTop: 4,
  },
  exerciseBody: {
    flex: 1,
    gap: 4,
  },
  exerciseCard: {
    alignItems: "center",
    backgroundColor: "#111827",
    borderColor: "rgba(255,255,255,0.12)",
    borderRadius: 24,
    borderWidth: 1,
    flexDirection: "row",
    gap: 12,
    padding: 12,
  },
  exploreCard: {
    alignItems: "center",
    backgroundColor: "#ffffff",
    borderColor: "#e2e8f0",
    borderRadius: 20,
    borderWidth: 1,
    flexBasis: "22%",
    flexGrow: 1,
    gap: 8,
    justifyContent: "center",
    minHeight: 100,
    padding: 9,
  },
  exploreGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 9,
  },
  exploreIcon: {
    alignItems: "center",
    borderRadius: 15,
    height: 42,
    justifyContent: "center",
    width: 42,
  },
  exploreLabel: {
    color: "#1e293b",
    fontSize: 11,
    fontWeight: "900",
    lineHeight: 15,
    textAlign: "center",
  },
  filterChip: {
    backgroundColor: "rgba(15,23,42,0.08)",
    borderColor: "rgba(15,23,42,0.12)",
    borderRadius: 999,
    borderWidth: 1,
    minHeight: 42,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  filterChipSelected: {
    backgroundColor: "#111827",
    borderColor: "#6ee7c8",
  },
  filterChipText: {
    color: "#475569",
    fontWeight: "900",
  },
  filterChipTextSelected: {
    color: "#f8fafc",
  },
  filterGroup: {
    gap: 8,
  },
  filterLabel: {
    color: "#64748b",
    fontSize: 12,
    fontWeight: "900",
    textTransform: "uppercase",
  },
  ghostButton: {
    alignItems: "center",
    borderColor: "rgba(255,255,255,0.18)",
    borderRadius: 999,
    borderWidth: 1,
    minHeight: 44,
    paddingHorizontal: 16,
    paddingVertical: 11,
  },
  ghostText: {
    color: "#f8fafc",
    fontWeight: "900",
  },
  goalArrow: {
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.14)",
    borderRadius: 999,
    height: 34,
    justifyContent: "center",
    marginTop: "auto",
    transform: [{ rotate: "45deg" }],
    width: 34,
  },
  goalCard: {
    borderRadius: 25,
    minHeight: 190,
    padding: 17,
    width: 210,
  },
  goalIndex: {
    color: "rgba(255,255,255,0.58)",
    fontSize: 12,
    fontWeight: "900",
    letterSpacing: 1,
  },
  goalRail: {
    gap: 11,
    paddingRight: 16,
  },
  goalSubtitle: {
    color: "rgba(255,255,255,0.78)",
    fontSize: 12,
    lineHeight: 17,
    marginTop: 7,
  },
  goalTitle: {
    color: "#ffffff",
    fontSize: 20,
    fontWeight: "900",
    lineHeight: 24,
    marginTop: 18,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  heroKicker: {
    color: "#6ee7c8",
    fontSize: 13,
    fontWeight: "900",
    marginTop: 12,
    textTransform: "uppercase",
  },
  heroSubtitle: {
    color: "#cbd5e1",
    lineHeight: 21,
    marginTop: 6,
  },
  heroTitle: {
    color: "#f8fafc",
    fontSize: 30,
    fontWeight: "900",
    marginTop: 4,
  },
  horizontalCards: {
    gap: 12,
    paddingRight: 16,
  },
  heroGlowOne: {
    backgroundColor: "rgba(45,212,191,0.20)",
    borderRadius: 999,
    height: 210,
    position: "absolute",
    right: -75,
    top: -75,
    width: 210,
  },
  heroGlowTwo: {
    backgroundColor: "rgba(56,189,248,0.10)",
    borderRadius: 999,
    bottom: -85,
    height: 180,
    left: -60,
    position: "absolute",
    width: 180,
  },
  lastWorkoutCopy: {
    color: "#64748b",
    fontSize: 12,
    fontWeight: "700",
    textAlign: "center",
  },
  lightButton: {
    alignSelf: "flex-start",
    backgroundColor: "#0f766e",
    borderRadius: 999,
    marginTop: 15,
    paddingHorizontal: 15,
    paddingVertical: 11,
  },
  lightButtonText: {
    color: "#ffffff",
    fontSize: 12,
    fontWeight: "900",
  },
  listenCopy: {
    color: "#fed7aa",
    fontSize: 12,
    fontWeight: "800",
    lineHeight: 18,
    marginTop: 14,
  },
  liveLibraryButton: {
    alignItems: "center",
    backgroundColor: "#5eead4",
    borderRadius: 999,
    height: 44,
    justifyContent: "center",
    marginLeft: "auto",
    width: 44,
  },
  liveLibraryCard: {
    alignItems: "center",
    backgroundColor: "#0f172a",
    borderColor: "#334155",
    borderWidth: 1,
    flexDirection: "row",
    gap: 22,
  },
  liveLibraryLabel: {
    color: "#94a3b8",
    fontSize: 10,
    fontWeight: "800",
    marginTop: 2,
  },
  liveLibraryValue: {
    color: "#f8fafc",
    fontSize: 22,
    fontWeight: "900",
  },
  mediaGlow: {
    alignItems: "center",
    alignSelf: "flex-start",
    backgroundColor: "rgba(110,231,200,0.12)",
    borderRadius: 20,
    height: 52,
    justifyContent: "center",
    width: 52,
  },
  mediaPlaceholder: {
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.08)",
    borderRadius: 22,
    borderWidth: 1,
    gap: 8,
    height: 150,
    justifyContent: "center",
    marginBottom: 12,
  },
  mediaSmall: {
    height: 84,
    marginBottom: 0,
    width: 84,
  },
  mediaText: {
    color: "#cbd5e1",
    fontSize: 12,
    fontWeight: "800",
  },
  metricCard: {
    backgroundColor: "#111827",
    borderColor: "rgba(255,255,255,0.12)",
    borderWidth: 1,
    flexBasis: "47%",
    flexGrow: 1,
  },
  metricLabel: {
    color: "#94a3b8",
    fontSize: 12,
    fontWeight: "800",
  },
  metricValue: {
    color: "#f8fafc",
    fontSize: 18,
    fontWeight: "900",
    marginTop: 6,
  },
  pill: {
    backgroundColor: "rgba(255,255,255,0.10)",
    borderRadius: 999,
    minHeight: 34,
    paddingHorizontal: 11,
    paddingVertical: 8,
  },
  pillText: {
    color: "#e2e8f0",
    fontSize: 12,
    fontWeight: "900",
  },
  primaryRealmButton: {
    alignItems: "center",
    backgroundColor: "#5eead4",
    borderRadius: 999,
    flexDirection: "row",
    gap: 7,
    minHeight: 46,
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  primaryRealmButtonText: {
    color: "#06231c",
    fontWeight: "900",
  },
  progressFill: {
    borderRadius: 999,
    height: "100%",
  },
  progressTrack: {
    backgroundColor: "rgba(255,255,255,0.10)",
    borderRadius: 999,
    height: 8,
    marginTop: 14,
    overflow: "hidden",
  },
  quickAction: {
    alignItems: "center",
    backgroundColor: "#111827",
    borderColor: "rgba(255,255,255,0.12)",
    borderRadius: 22,
    borderWidth: 1,
    flexBasis: "30%",
    flexGrow: 1,
    gap: 8,
    minHeight: 92,
    justifyContent: "center",
    padding: 12,
  },
  quickActionText: {
    color: "#f8fafc",
    fontSize: 12,
    fontWeight: "900",
    textAlign: "center",
  },
  quickGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  realmActionRow: {
    alignItems: "center",
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginTop: 20,
  },
  realmCardBody: {
    color: "#47635e",
    fontSize: 12,
    lineHeight: 18,
    marginTop: 8,
  },
  realmCardEyebrow: {
    color: "#0f766e",
    fontSize: 10,
    fontWeight: "900",
    letterSpacing: 0.9,
    textTransform: "uppercase",
  },
  realmCardTitle: {
    color: "#12352f",
    fontSize: 21,
    fontWeight: "900",
    lineHeight: 25,
    marginTop: 6,
  },
  realmHero: {
    backgroundColor: "#071f1a",
    borderColor: "#0f766e",
    borderWidth: 1,
    overflow: "hidden",
    padding: 20,
  },
  realmHeroSubtitle: {
    color: "#b9d8d1",
    lineHeight: 20,
    marginTop: 7,
    maxWidth: 330,
  },
  realmHeroTitle: {
    color: "#f0fdfa",
    fontSize: 31,
    fontWeight: "900",
    letterSpacing: -0.8,
    lineHeight: 35,
    marginTop: 5,
  },
  realmHeroTop: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  realmIcon: {
    alignItems: "center",
    backgroundColor: "#5eead4",
    borderRadius: 18,
    height: 52,
    justifyContent: "center",
    width: 52,
  },
  realmKicker: {
    color: "#5eead4",
    fontSize: 11,
    fontWeight: "900",
    letterSpacing: 1.1,
    marginTop: 22,
    textTransform: "uppercase",
  },
  realmMeta: {
    alignItems: "center",
    flexDirection: "row",
    gap: 5,
  },
  realmMetaRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 13,
    marginTop: 17,
  },
  realmMetaText: {
    color: "#ccfbf1",
    fontSize: 11,
    fontWeight: "800",
  },
  realmPill: {
    backgroundColor: "rgba(94,234,212,0.10)",
    borderColor: "rgba(153,246,228,0.18)",
    borderRadius: 999,
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 7,
  },
  realmPillRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 7,
    marginTop: 12,
  },
  realmPillText: {
    color: "#99f6e4",
    fontSize: 11,
    fontWeight: "900",
  },
  realmSectionAction: {
    backgroundColor: "#e2e8f0",
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  realmSectionActionText: {
    color: "#334155",
    fontSize: 11,
    fontWeight: "900",
  },
  realmSectionEyebrow: {
    color: "#0f766e",
    fontSize: 10,
    fontWeight: "900",
    letterSpacing: 1,
    textTransform: "uppercase",
  },
  realmSectionHeader: {
    alignItems: "flex-end",
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 4,
  },
  realmSectionTitle: {
    color: "#0f172a",
    fontSize: 22,
    fontWeight: "900",
    letterSpacing: -0.4,
    marginTop: 3,
  },
  realmStack: {
    gap: 18,
  },
  recoveryBody: {
    color: "#fde7ce",
    lineHeight: 20,
    marginTop: 14,
  },
  recoveryCard: {
    backgroundColor: "#422006",
    borderColor: "#9a3412",
    borderWidth: 1,
  },
  recoveryEyebrow: {
    color: "#fdba74",
    fontSize: 10,
    fontWeight: "900",
    letterSpacing: 1,
    textTransform: "uppercase",
  },
  recoveryHeader: {
    alignItems: "center",
    flexDirection: "row",
    gap: 12,
  },
  recoveryHeaderCopy: {
    flex: 1,
  },
  recoveryIcon: {
    alignItems: "center",
    backgroundColor: "rgba(251,146,60,0.18)",
    borderRadius: 16,
    height: 46,
    justifyContent: "center",
    width: 46,
  },
  recoverySuggestion: {
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.08)",
    borderRadius: 18,
    flexDirection: "row",
    gap: 11,
    marginTop: 15,
    padding: 12,
  },
  recoverySuggestionBody: {
    color: "#fed7aa",
    fontSize: 12,
    lineHeight: 17,
    marginTop: 2,
  },
  recoverySuggestionCopy: {
    flex: 1,
  },
  recoverySuggestionTitle: {
    color: "#fff7ed",
    fontSize: 12,
    fontWeight: "900",
  },
  recoveryTitle: {
    color: "#fff7ed",
    fontSize: 19,
    fontWeight: "900",
    marginTop: 3,
  },
  routineCard: {
    backgroundColor: "#111827",
    borderRadius: 26,
    borderWidth: 1,
    padding: 14,
  },
  safetyBadge: {
    alignItems: "center",
    backgroundColor: "rgba(34,197,94,0.12)",
    borderColor: "rgba(187,247,208,0.18)",
    borderRadius: 999,
    borderWidth: 1,
    flexDirection: "row",
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 7,
  },
  safetyBadgeText: {
    color: "#bbf7d0",
    fontSize: 10,
    fontWeight: "900",
  },
  safetyText: {
    color: "#9a3412",
    lineHeight: 20,
  },
  setLabel: {
    color: "#94a3b8",
    fontSize: 11,
    fontWeight: "900",
    textTransform: "uppercase",
  },
  setList: {
    gap: 8,
    marginTop: 14,
  },
  setNumber: {
    color: "#f8fafc",
    fontSize: 18,
    fontWeight: "900",
    width: 28,
  },
  setRow: {
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.07)",
    borderRadius: 18,
    flexDirection: "row",
    gap: 10,
    padding: 10,
  },
  setRowCompleted: {
    backgroundColor: "rgba(110,231,200,0.18)",
  },
  setText: {
    color: "#f8fafc",
    fontSize: 16,
    fontWeight: "900",
  },
  setValue: {
    flex: 1,
    gap: 2,
    minHeight: 44,
    justifyContent: "center",
  },
  secondaryRealmButton: {
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.08)",
    borderColor: "rgba(255,255,255,0.14)",
    borderRadius: 999,
    borderWidth: 1,
    flexDirection: "row",
    gap: 6,
    minHeight: 46,
    paddingHorizontal: 14,
    paddingVertical: 11,
  },
  secondaryRealmButtonText: {
    color: "#f8fafc",
    fontSize: 12,
    fontWeight: "900",
  },
  skeletonLine: {
    backgroundColor: "rgba(255,255,255,0.12)",
    borderRadius: 999,
    height: 14,
    marginTop: 12,
    width: "90%",
  },
  stack: {
    gap: 14,
  },
  statusCard: {
    backgroundColor: "#ffffff",
    borderColor: "#e2e8f0",
    borderRadius: 21,
    borderWidth: 1,
    minHeight: 116,
    padding: 13,
    width: 125,
  },
  statusIcon: {
    alignItems: "center",
    backgroundColor: "#ccfbf1",
    borderRadius: 13,
    height: 34,
    justifyContent: "center",
    width: 34,
  },
  statusLabel: {
    color: "#64748b",
    fontSize: 10,
    fontWeight: "800",
    marginTop: 3,
  },
  statusRail: {
    gap: 9,
    paddingRight: 16,
  },
  statusValue: {
    color: "#0f172a",
    fontSize: 15,
    fontWeight: "900",
    marginTop: 12,
  },
  supportBody: {
    color: "#64748b",
    fontSize: 12,
    lineHeight: 18,
    marginTop: 5,
  },
  supportCopy: {
    flex: 1,
  },
  supportEyebrow: {
    color: "#b45309",
    fontSize: 10,
    fontWeight: "900",
    letterSpacing: 0.8,
    textTransform: "uppercase",
  },
  supportIcon: {
    alignItems: "center",
    backgroundColor: "#fef3c7",
    borderRadius: 17,
    height: 50,
    justifyContent: "center",
    width: 50,
  },
  supportLink: {
    color: "#b45309",
    fontSize: 12,
    fontWeight: "900",
    marginTop: 10,
  },
  supportTitle: {
    color: "#422006",
    fontSize: 17,
    fontWeight: "900",
    lineHeight: 21,
    marginTop: 4,
  },
  nutritionSupportCard: {
    alignItems: "flex-start",
    backgroundColor: "#fffbeb",
    borderColor: "#fde68a",
    borderWidth: 1,
    flexDirection: "row",
    gap: 13,
  },
  successState: {
    alignItems: "center",
    alignSelf: "flex-start",
    backgroundColor: "#6ee7c8",
    borderRadius: 999,
    flexDirection: "row",
    gap: 8,
    minHeight: 44,
    paddingHorizontal: 14,
  },
  successText: {
    color: "#10201d",
    fontWeight: "900",
  },
  tabRow: {
    gap: 8,
    paddingRight: 16,
  },
});
