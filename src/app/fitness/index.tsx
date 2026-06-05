import { Href, router, useFocusEffect } from "expo-router";
import { useCallback, useMemo, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";

import {
  DateWheelPicker,
  ManualEntryToggle,
  NumberWheelPicker,
  PresetChipGroup,
  QuickLogBottomSheet,
  QuickNoteField,
  QuickSaveButton,
  TimeWheelPicker
} from "@/components/fitness/QuickWorkoutInputs";
import { AppMainLayout } from "@/components/layout/AppMainLayout";
import { AppButton, AppCard, AppIcon, AppSection } from "@/components/ui";
import {
  EXERCISE_EQUIPMENT,
  EXERCISE_LIBRARY,
  MUSCLE_GROUPS,
  PREBUILT_ROUTINES,
  WORKOUT_DIFFICULTIES,
  WORKOUT_GOALS,
  WORKOUT_LOCATIONS,
  formatWorkoutLabel,
  getExerciseById
} from "@/constants/workoutLibrary";
import {
  completeWorkoutSession,
  createWorkoutSession,
  getTodayFitnessSummary,
  getWorkoutSessions
} from "@/lib/fitnessStorage";
import { lightImpact, successImpact } from "@/lib/haptics";
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
  WorkoutSession
} from "@/types/fitness";

type FitnessTab = "today" | "start" | "routines" | "library" | "running" | "progress" | "body" | "guides";
type EditableSetField = "reps" | "weight" | "rest" | "duration" | "distance" | null;

const FITNESS_TABS: Array<{ key: FitnessTab; label: string }> = [
  { key: "today", label: "Today" },
  { key: "start", label: "Start" },
  { key: "routines", label: "Routines" },
  { key: "library", label: "Exercise Library" },
  { key: "running", label: "Running" },
  { key: "progress", label: "Progress" },
  { key: "body", label: "Body" },
  { key: "guides", label: "Guides" }
];

const SAFETY_COPY =
  "Exercise guidance is for general fitness tracking only. If you are unsure, injured, pregnant, or managing a health condition, speak to a qualified professional.";

export default function FitnessScreen() {
  const [activeTab, setActiveTab] = useState<FitnessTab>("today");
  const [summary, setSummary] = useState<FitnessSummary | null>(null);
  const [sessions, setSessions] = useState<WorkoutSession[]>([]);
  const [selectedRoutine, setSelectedRoutine] = useState<WorkoutRoutine>(PREBUILT_ROUTINES[0]);
  const [sessionExercises, setSessionExercises] = useState<GuidedWorkoutExercise[]>(() =>
    buildSessionExercises(PREBUILT_ROUTINES[0])
  );
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0);
  const [editing, setEditing] = useState<{ exerciseIndex: number; field: EditableSetField; setIndex: number } | null>(null);
  const [quickValue, setQuickValue] = useState(0);
  const [manualMode, setManualMode] = useState(false);
  const [manualValue, setManualValue] = useState("");
  const [saveMessage, setSaveMessage] = useState("");

  const loadFitness = useCallback(async () => {
    const [nextSummary, nextSessions] = await Promise.all([getTodayFitnessSummary(), getWorkoutSessions()]);
    setSummary(nextSummary);
    setSessions(nextSessions);
  }, []);

  useFocusEffect(
    useCallback(() => {
      Promise.resolve().then(loadFitness).catch(() => undefined);
    }, [loadFitness])
  );

  const completedSetCount = sessionExercises.reduce(
    (total, item) => total + item.sets.filter((set) => set.completed).length,
    0
  );
  const totalSetCount = sessionExercises.reduce((total, item) => total + item.sets.length, 0);
  const latestWorkout = sessions.find((session) => session.completed) ?? summary?.latestWorkout;

  function selectRoutine(routine: WorkoutRoutine, tab: FitnessTab = "start") {
    setSelectedRoutine(routine);
    setSessionExercises(buildSessionExercises(routine));
    setCurrentExerciseIndex(0);
    setActiveTab(tab);
  }

  function openSetEditor(exerciseIndex: number, setIndex: number, field: Exclude<EditableSetField, null>) {
    const currentSet = sessionExercises[exerciseIndex]?.sets[setIndex];
    const currentValue = field === "weight" ? currentSet?.weightKg ?? 0 : currentSet?.reps ?? 0;
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
                    : { ...set, reps: Math.round(nextValue) }
              )
            }
      )
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
                currentSetIndex === setIndex ? { ...set, completed: !set.completed } : set
              )
            }
      )
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
          weightKg: lastSet?.weightKg
        };
        return { ...exercise, sets: [...exercise.sets, nextSet] };
      })
    );
  }

  async function finishWorkout() {
    const durationSeconds = Math.max(selectedRoutine.durationMinutes * 60, completedSetCount * 90);
    const session = await createWorkoutSession({
      durationSeconds,
      intensity: selectedRoutine.difficulty === "beginner" ? "easy" : "moderate",
      notes: `${completedSetCount}/${totalSetCount} sets completed from ${selectedRoutine.name}.`,
      title: selectedRoutine.name,
      workoutType: selectedRoutine.goal === "endurance" ? "running" : selectedRoutine.goal === "mobility" ? "mobility" : "strength"
    });
    await completeWorkoutSession(session.id, { durationSeconds, endedAt: new Date().toISOString() });
    setSaveMessage("Workout saved");
    await loadFitness();
    setActiveTab("progress");
  }

  return (
    <AppMainLayout subtitle="Plans, sessions, running and progress" title="Workout">
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tabRow}>
        {FITNESS_TABS.map((tab) => (
          <FilterChip key={tab.key} label={tab.label} onPress={() => setActiveTab(tab.key)} selected={activeTab === tab.key} />
        ))}
      </ScrollView>

      {saveMessage ? <SuccessState message={saveMessage} onDismiss={() => setSaveMessage("")} /> : null}

      {activeTab === "today" ? (
        <TodayTab
          latestWorkout={latestWorkout}
          onRoutine={selectRoutine}
          onTab={setActiveTab}
          summary={summary}
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
      {activeTab === "routines" ? <RoutinesTab onRoutine={selectRoutine} /> : null}
      {activeTab === "library" ? <LibraryTab /> : null}
      {activeTab === "running" ? <RunningTab onSaved={loadFitness} onTab={setActiveTab} /> : null}
      {activeTab === "progress" ? <ProgressTab sessions={sessions} summary={summary} /> : null}
      {activeTab === "body" ? <BodyTab /> : null}
      {activeTab === "guides" ? <GuidesTab /> : null}

      <SafetyCard />

      <QuickLogBottomSheet
        onClose={() => setEditing(null)}
        title={editing?.field === "weight" ? "Update weight" : "Update reps"}
        visible={Boolean(editing)}
      >
        <ManualEntryToggle enabled={manualMode} onToggle={() => setManualMode((current) => !current)} />
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
            <PresetChipGroup onSelect={setQuickValue} presets={[0, 5, 10, 15, 20, 25, 30]} selectedValue={quickValue} suffix="kg" />
            <NumberWheelPicker max={120} min={0} onChange={setQuickValue} step={2.5} suffix="kg" value={quickValue} />
          </>
        ) : (
          <>
            <PresetChipGroup onSelect={setQuickValue} presets={[5, 8, 10, 12, 15, 20]} selectedValue={quickValue} />
            <NumberWheelPicker max={30} min={1} onChange={setQuickValue} value={quickValue} />
          </>
        )}
        <QuickSaveButton onPress={saveSetValue} title="Save set value" />
      </QuickLogBottomSheet>
    </AppMainLayout>
  );
}

function TodayTab({
  latestWorkout,
  onRoutine,
  onTab,
  summary
}: {
  latestWorkout?: WorkoutSession;
  onRoutine: (routine: WorkoutRoutine, tab?: FitnessTab) => void;
  onTab: (tab: FitnessTab) => void;
  summary: FitnessSummary | null;
}) {
  const plan = PREBUILT_ROUTINES[0];
  return (
    <View style={styles.stack}>
      <AppCard style={[styles.darkHero, { borderColor: plan.accentColor }]}>
        <View style={styles.mediaGlow}>
          <AppIcon color={plan.accentColor} decorative name="fitness" size={28} />
        </View>
        <Text style={styles.heroKicker}>Today Plan</Text>
        <Text style={styles.heroTitle}>{plan.name}</Text>
        <Text style={styles.heroSubtitle}>
          {plan.durationMinutes} min - {formatWorkoutLabel(plan.location)} - {formatWorkoutLabel(plan.difficulty)}
        </Text>
        <View style={styles.chipRow}>
          {plan.targetMuscles.slice(0, 3).map((muscle) => (
            <Pill key={muscle} label={formatWorkoutLabel(muscle)} />
          ))}
        </View>
        <View style={styles.actionRow}>
          <AppButton onPress={() => onRoutine(plan)} title="Start Workout" />
          <GhostButton label="Change plan" onPress={() => onTab("routines")} />
        </View>
      </AppCard>

      <AppSection title="Quick actions" subtitle="Start, build, browse or log in a few taps." />
      <View style={styles.quickGrid}>
        {[
          ["Start Workout", "start", "fitness"],
          ["Build Plan", "routines", "add"],
          ["Exercise Library", "library", "search"],
          ["Log Workout", "start", "edit"],
          ["Running", "running", "fitness"],
          ["Progress", "progress", "success"]
        ].map(([label, tab, icon]) => (
          <QuickAction key={label} iconName={icon} label={label} onPress={() => onTab(tab as FitnessTab)} />
        ))}
      </View>

      <AppSection title="Suggested routines" />
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.horizontalCards}>
        {PREBUILT_ROUTINES.slice(0, 4).map((routine) => (
          <RoutineCard compact key={routine.id} onStart={() => onRoutine(routine)} routine={routine} />
        ))}
      </ScrollView>

      <View style={styles.grid}>
        <MetricCard label="Last workout" value={latestWorkout?.title ?? "Start today"} />
        <MetricCard label="Weekly consistency" value={`${summary?.workoutsThisWeek ?? 0}/3 sessions`} />
        <MetricCard label="Personal best" value="Complete a workout" />
        <MetricCard label="Muscle focus" value="Back - Core - Arms" />
      </View>
      <ProgressPreview sessions={[]} summary={summary} />
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
  totalSetCount
}: {
  addSet: (exerciseIndex: number) => void;
  completedSetCount: number;
  currentExerciseIndex: number;
  finishWorkout: () => void;
  onExerciseIndexChange: (index: number) => void;
  onSetEdit: (exerciseIndex: number, setIndex: number, field: Exclude<EditableSetField, null>) => void;
  routine: WorkoutRoutine;
  sessionExercises: GuidedWorkoutExercise[];
  toggleSet: (exerciseIndex: number, setIndex: number) => void;
  totalSetCount: number;
}) {
  const current = sessionExercises[currentExerciseIndex];
  const exercise = current ? getExerciseById(current.exerciseId) : undefined;
  const progress = totalSetCount ? completedSetCount / totalSetCount : 0;

  return (
    <View style={styles.stack}>
      <AppCard style={styles.darkCard}>
        <Text style={styles.darkKicker}>Guided session</Text>
        <Text style={styles.darkTitle}>{routine.name}</Text>
        <Text style={styles.darkMuted}>{completedSetCount}/{totalSetCount} sets complete</Text>
        <ProgressBar color={routine.accentColor} value={progress} />
      </AppCard>

      {exercise && current ? (
        <AppCard style={styles.darkCard}>
          <MediaPlaceholder accentColor={routine.accentColor} label="Exercise demo" />
          <Text style={styles.darkTitle}>{exercise.name}</Text>
          <Text style={styles.darkMuted}>{formatWorkoutLabel(exercise.primaryMuscle)} - {exercise.equipment.map(formatWorkoutLabel).join(", ")}</Text>
          <View style={styles.setList}>
            {current.sets.map((set, setIndex) => (
              <SetRow
                key={set.id}
                onEdit={(field) => onSetEdit(currentExerciseIndex, setIndex, field)}
                onToggle={() => toggleSet(currentExerciseIndex, setIndex)}
                set={set}
              />
            ))}
          </View>
          <View style={styles.actionRow}>
            <GhostButton label="Add set" onPress={() => addSet(currentExerciseIndex)} />
            <GhostButton
              label="Next exercise"
              onPress={() => onExerciseIndexChange(Math.min(sessionExercises.length - 1, currentExerciseIndex + 1))}
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

      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.horizontalCards}>
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
        <Text style={styles.darkMuted}>Rest timer placeholder: 60-90 seconds between hard sets.</Text>
        <View style={styles.chipRow}>
          {[30, 60, 90, 120].map((seconds) => <Pill key={seconds} label={`${seconds}s`} />)}
        </View>
      </AppCard>
      <AppButton onPress={finishWorkout} title="Finish workout" />
    </View>
  );
}

function RoutinesTab({ onRoutine }: { onRoutine: (routine: WorkoutRoutine, tab?: FitnessTab) => void }) {
  return (
    <View style={styles.stack}>
      <AppSection title="Routines" subtitle="Starter plans for home, gym, running, strength and recovery." />
      {PREBUILT_ROUTINES.map((routine) => (
        <RoutineCard key={routine.id} onStart={() => onRoutine(routine)} routine={routine} />
      ))}
    </View>
  );
}

function LibraryTab() {
  const [muscle, setMuscle] = useState<MuscleGroup | "all">("all");
  const [equipment, setEquipment] = useState<ExerciseEquipment | "all">("all");
  const [location, setLocation] = useState<WorkoutLocation | "all">("all");
  const [difficulty, setDifficulty] = useState<WorkoutDifficulty | "all">("all");
  const [goal, setGoal] = useState<WorkoutGoalTag | "all">("all");

  const filteredExercises = useMemo(
    () =>
      EXERCISE_LIBRARY.filter((exercise) =>
        (muscle === "all" || exercise.primaryMuscle === muscle || exercise.secondaryMuscles.includes(muscle)) &&
        (equipment === "all" || exercise.equipment.includes(equipment)) &&
        (location === "all" || exercise.location.includes(location)) &&
        (difficulty === "all" || exercise.difficulty === difficulty) &&
        (goal === "all" || exercise.goalTags.includes(goal))
      ),
    [difficulty, equipment, goal, location, muscle]
  );

  return (
    <View style={styles.stack}>
      <AppSection title="Exercise Library" subtitle="Browse by muscle, equipment, location, difficulty and goal." />
      <FilterGroup label="Muscle group" options={["all", ...MUSCLE_GROUPS]} selected={muscle} onSelect={(value) => setMuscle(value as typeof muscle)} />
      <FilterGroup label="Equipment" options={["all", ...EXERCISE_EQUIPMENT]} selected={equipment} onSelect={(value) => setEquipment(value as typeof equipment)} />
      <FilterGroup label="Location" options={["all", ...WORKOUT_LOCATIONS]} selected={location} onSelect={(value) => setLocation(value as typeof location)} />
      <FilterGroup label="Difficulty" options={["all", ...WORKOUT_DIFFICULTIES]} selected={difficulty} onSelect={(value) => setDifficulty(value as typeof difficulty)} />
      <FilterGroup label="Goal" options={["all", ...WORKOUT_GOALS]} selected={goal} onSelect={(value) => setGoal(value as typeof goal)} />
      {filteredExercises.length ? (
        filteredExercises.map((exercise) => <ExerciseCard exercise={exercise} key={exercise.id} />)
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

function RunningTab({ onSaved, onTab }: { onSaved: () => void; onTab: (tab: FitnessTab) => void }) {
  const [draft, setDraft] = useState<RunningLogDraft>({ distanceKm: 3, durationMinutes: 25, effort: "easy" });
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const pace = draft.distanceKm > 0 ? draft.durationMinutes / draft.distanceKm : 0;

  async function saveRun() {
    const session = await createWorkoutSession({
      distanceKm: draft.distanceKm,
      durationSeconds: draft.durationMinutes * 60,
      intensity: draft.effort ?? "easy",
      notes: [draft.routeNote, draft.notes].filter(Boolean).join(" - ") || undefined,
      startedAt: `${date}T12:00:00.000Z`,
      title: "Running",
      workoutType: "running"
    });
    await completeWorkoutSession(session.id, { durationSeconds: draft.durationMinutes * 60, endedAt: new Date().toISOString() });
    await onSaved();
    onTab("progress");
  }

  return (
    <View style={styles.stack}>
      <AppCard style={styles.darkHero}>
        <Text style={styles.heroKicker}>Running</Text>
        <Text style={styles.heroTitle}>Quick Start Run</Text>
        <Text style={styles.heroSubtitle}>Manual logging now. Device routes can connect later.</Text>
        <View style={styles.actionRow}>
          <AppButton onPress={saveRun} title="Save run" />
          <GhostButton label="Starter plan" onPress={() => undefined} />
        </View>
      </AppCard>
      <AppCard style={styles.darkCard}>
        <Text style={styles.darkTitle}>Manual Run Log</Text>
        <Text style={styles.darkMuted}>Pace preview: {pace ? `${pace.toFixed(1)} min/km` : "Add distance"}</Text>
        <Text style={styles.filterLabel}>Distance</Text>
        <PresetChipGroup onSelect={(value) => setDraft((current) => ({ ...current, distanceKm: value }))} presets={[1, 3, 5, 10]} selectedValue={draft.distanceKm} suffix="km" />
        <NumberWheelPicker max={21} min={0.5} onChange={(value) => setDraft((current) => ({ ...current, distanceKm: value }))} step={0.5} suffix="km" value={draft.distanceKm} />
        <Text style={styles.filterLabel}>Duration</Text>
        <TimeWheelPicker onChange={(value) => setDraft((current) => ({ ...current, durationMinutes: value }))} valueMinutes={draft.durationMinutes} />
        <Text style={styles.filterLabel}>Date</Text>
        <DateWheelPicker onChange={setDate} value={date} />
        <QuickNoteField onChangeText={(notes) => setDraft((current) => ({ ...current, notes }))} value={draft.notes ?? ""} />
        <QuickSaveButton onPress={saveRun} title="Save run" />
      </AppCard>
      <View style={styles.grid}>
        <MetricCard label="Weekly distance" value="Log runs to unlock" />
        <MetricCard label="Pace preview" value={pace ? `${pace.toFixed(1)} min/km` : "Start today"} />
        <MetricCard label="Last run" value="Start today" />
        <MetricCard label="Running plan" value="Running Starter Plan" />
      </View>
    </View>
  );
}

function ProgressTab({ sessions, summary }: { sessions: WorkoutSession[]; summary: FitnessSummary | null }) {
  const completedSessions = sessions.filter((session) => session.completed);
  const totalVolume = completedSessions.reduce((total, session) => total + Math.round(session.durationSeconds / 60), 0);
  const runningDistance = completedSessions.reduce((total, session) => total + (session.distanceKm ?? 0), 0);
  return (
    <View style={styles.stack}>
      <AppSection title="Progress" subtitle="Useful answers from the workouts you log." />
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
        <MetricCard label="Workout streak" value={`${summary?.currentStreakDays ?? 0} days`} />
        <MetricCard label="Running trend" value={`${runningDistance.toFixed(1)} km`} />
        <MetricCard label="Personal bests" value={completedSessions[0]?.title ?? "Start today"} />
      </View>
      <ChartCard title="Muscle group balance" values={[0.7, 0.5, 0.35, 0.6, 0.4]} />
      <ChartCard title="Running distance trend" values={[0.2, 0.25, 0.45, 0.3, 0.55, 0.7, 0.6]} />
    </View>
  );
}

function BodyTab() {
  return (
    <View style={styles.stack}>
      <AppSection title="Body" subtitle="Simple body progress support without image analysis or medical claims." />
      <View style={styles.grid}>
        <MetricCard label="Weight tracking" value="Open Biometrics" />
        <MetricCard label="Measurements" value="Set up when ready" />
        <MetricCard label="Progress photos" value="Placeholder" />
        <MetricCard label="Goals" value="Strength - Mobility" />
      </View>
      <AppCard style={styles.darkCard}>
        <Text style={styles.darkTitle}>Muscle focus summary</Text>
        <Text style={styles.darkMuted}>Based on starter routines: back, core, arms, legs and glutes are ready to track once sessions are logged.</Text>
      </AppCard>
    </View>
  );
}

function GuidesTab() {
  const prompts = ["Build me a beginner workout", "Explain this exercise", "Log my sets", "Suggest a home workout", "Summarize my week"];
  return (
    <View style={styles.stack}>
      <AppSection title="Guides" subtitle="Workout education, media placeholders and assistant drafts." />
      <AppCard style={styles.darkCard}>
        <Text style={styles.darkTitle}>Exercise media placeholders</Text>
        <Text style={styles.darkMuted}>Exercise demo images, video URLs, routine covers and muscle diagrams are structured locally and ready for real media later.</Text>
      </AppCard>
      <AppCard style={styles.darkCard}>
        <Text style={styles.darkTitle}>AI workout prompts</Text>
        <Text style={styles.darkMuted}>Assistant output should create drafts only and avoid medical claims.</Text>
        <View style={styles.chipRow}>
          {prompts.map((prompt) => (
            <Pill
              key={prompt}
              label={prompt}
              onPress={() => router.push(`/ai?mode=workout_logger&prompt=${encodeURIComponent(prompt)}` as Href)}
            />
          ))}
        </View>
      </AppCard>
      <SkeletonCard label="Workout session skeleton" />
      <SkeletonCard label="Progress chart skeleton" />
    </View>
  );
}

function RoutineCard({ compact = false, onStart, routine }: { compact?: boolean; onStart: () => void; routine: WorkoutRoutine }) {
  return (
    <Pressable
      accessibilityRole="button"
      onPress={() => {
        lightImpact();
        onStart();
      }}
      style={[styles.routineCard, compact ? styles.compactRoutine : null, { borderColor: routine.accentColor }]}
    >
      <MediaPlaceholder accentColor={routine.accentColor} label="Routine cover" small={compact} />
      <Text style={styles.darkTitle}>{routine.name}</Text>
      <Text style={styles.darkMuted}>{routine.description}</Text>
      <View style={styles.chipRow}>
        <Pill label={`${routine.durationMinutes} min`} />
        <Pill label={formatWorkoutLabel(routine.difficulty)} />
        <Pill label={routine.equipment.slice(0, 2).map(formatWorkoutLabel).join(", ")} />
      </View>
      <Text style={styles.darkMuted}>Target: {routine.targetMuscles.map(formatWorkoutLabel).join(" - ")}</Text>
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
        <Text style={styles.darkMuted}>{formatWorkoutLabel(exercise.primaryMuscle)}</Text>
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
  set
}: {
  onEdit: (field: Exclude<EditableSetField, null>) => void;
  onToggle: () => void;
  set: GuidedWorkoutSet;
}) {
  return (
    <View style={[styles.setRow, set.completed ? styles.setRowCompleted : null]}>
      <Text style={styles.setNumber}>{set.setNumber}</Text>
      <Pressable onPress={() => onEdit("reps")} style={styles.setValue}>
        <Text style={styles.setLabel}>Reps</Text>
        <Text style={styles.setText}>{set.reps}</Text>
      </Pressable>
      <Pressable onPress={() => onEdit("weight")} style={styles.setValue}>
        <Text style={styles.setLabel}>Weight</Text>
        <Text style={styles.setText}>{set.weightKg ?? 0} kg</Text>
      </Pressable>
      <Pressable accessibilityRole="button" onPress={onToggle} style={styles.completeButton}>
        <AppIcon color={set.completed ? "#10201d" : "#6ee7c8"} decorative name="success" size={20} />
      </Pressable>
    </View>
  );
}

function FilterGroup({ label, onSelect, options, selected }: { label: string; onSelect: (value: string) => void; options: string[]; selected: string }) {
  return (
    <View style={styles.filterGroup}>
      <Text style={styles.filterLabel}>{label}</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipRow}>
        {options.map((option) => (
          <FilterChip key={option} label={formatWorkoutLabel(option)} onPress={() => onSelect(option)} selected={selected === option} />
        ))}
      </ScrollView>
    </View>
  );
}

function FilterChip({ label, onPress, selected }: { label: string; onPress: () => void; selected: boolean }) {
  return (
    <Pressable
      accessibilityRole="button"
      onPress={() => {
        lightImpact();
        onPress();
      }}
      style={[styles.filterChip, selected ? styles.filterChipSelected : null]}
    >
      <Text style={[styles.filterChipText, selected ? styles.filterChipTextSelected : null]}>{label}</Text>
    </Pressable>
  );
}

function QuickAction({ iconName, label, onPress }: { iconName: string; label: string; onPress: () => void }) {
  return (
    <Pressable accessibilityRole="button" onPress={onPress} style={styles.quickAction}>
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

function ProgressPreview({ sessions, summary }: { sessions: WorkoutSession[]; summary: FitnessSummary | null }) {
  const values = [0.35, 0.52, 0.25, Math.min(1, (summary?.workoutsThisWeek ?? 0) / 3), 0.6, 0.42, 0.7];
  return (
    <ChartCard
      subtitle={`${summary?.workoutsThisWeek ?? 0} workouts this week - ${sessions.length} total logs`}
      title="Weekly workout consistency"
      values={values}
    />
  );
}

function ChartCard({ subtitle, title, values }: { subtitle?: string; title: string; values: number[] }) {
  return (
    <AppCard style={styles.darkCard}>
      <Text style={styles.darkTitle}>{title}</Text>
      {subtitle ? <Text style={styles.darkMuted}>{subtitle}</Text> : null}
      <View style={styles.barRow}>
        {values.map((value, index) => (
          <View key={`${title}-${index}`} style={styles.barTrack}>
            <View style={[styles.barFill, { height: `${Math.max(12, value * 100)}%` }]} />
          </View>
        ))}
      </View>
    </AppCard>
  );
}

function MediaPlaceholder({ accentColor, label, small = false }: { accentColor: string; label: string; small?: boolean }) {
  return (
    <View style={[styles.mediaPlaceholder, small ? styles.mediaSmall : null, { borderColor: accentColor }]}>
      <AppIcon color={accentColor} decorative name="source" size={small ? 18 : 24} />
      <Text style={styles.mediaText}>{label}</Text>
    </View>
  );
}

function PremiumEmptyState({ button, message, onPress, title }: { button: string; message: string; onPress: () => void; title: string }) {
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

function SuccessState({ message, onDismiss }: { message: string; onDismiss: () => void }) {
  return (
    <Pressable onPress={onDismiss} style={styles.successState}>
      <AppIcon color="#10201d" decorative name="success" size={20} />
      <Text style={styles.successText}>{message}</Text>
    </Pressable>
  );
}

function GhostButton({ label, onPress }: { label: string; onPress: () => void }) {
  return (
    <Pressable accessibilityRole="button" onPress={onPress} style={styles.ghostButton}>
      <Text style={styles.ghostText}>{label}</Text>
    </Pressable>
  );
}

function Pill({ label, onPress }: { label: string; onPress?: () => void }) {
  return (
    <Pressable accessibilityRole={onPress ? "button" : undefined} onPress={onPress} style={styles.pill}>
      <Text style={styles.pillText}>{label}</Text>
    </Pressable>
  );
}

function ProgressBar({ color, value }: { color: string; value: number }) {
  return (
    <View style={styles.progressTrack}>
      <View style={[styles.progressFill, { backgroundColor: color, width: `${Math.max(4, Math.min(100, value * 100))}%` }]} />
    </View>
  );
}

function buildSessionExercises(routine: WorkoutRoutine): GuidedWorkoutExercise[] {
  return routine.exerciseIds.map((exerciseId) => ({
    exerciseId,
    sets: [1, 2, 3].map((setNumber) => ({
      completed: false,
      id: `${exerciseId}-${setNumber}`,
      reps: routine.goal === "endurance" ? 15 : 10,
      setNumber,
      weightKg: routine.location === "home" ? 0 : undefined
    }))
  }));
}

const styles = StyleSheet.create({
  actionRow: {
    alignItems: "center",
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    marginTop: 12
  },
  barFill: {
    backgroundColor: "#6ee7c8",
    borderRadius: 999,
    bottom: 0,
    position: "absolute",
    width: "100%"
  },
  barRow: {
    alignItems: "flex-end",
    flexDirection: "row",
    gap: 8,
    height: 110,
    marginTop: 16
  },
  barTrack: {
    backgroundColor: "rgba(255,255,255,0.08)",
    borderRadius: 999,
    flex: 1,
    height: "100%",
    overflow: "hidden"
  },
  chipRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8
  },
  compactRoutine: {
    width: 260
  },
  completeButton: {
    alignItems: "center",
    backgroundColor: "rgba(110,231,200,0.14)",
    borderRadius: 999,
    height: 44,
    justifyContent: "center",
    width: 44
  },
  darkCard: {
    backgroundColor: "#111827",
    borderColor: "rgba(255,255,255,0.12)",
    borderWidth: 1
  },
  darkHero: {
    backgroundColor: "#0f172a",
    borderWidth: 1
  },
  darkInput: {
    backgroundColor: "rgba(255,255,255,0.08)",
    borderColor: "rgba(255,255,255,0.14)",
    borderRadius: 16,
    borderWidth: 1,
    color: "#f8fafc",
    minHeight: 48,
    paddingHorizontal: 14,
    paddingVertical: 10
  },
  darkKicker: {
    color: "#6ee7c8",
    fontSize: 12,
    fontWeight: "900",
    letterSpacing: 0,
    textTransform: "uppercase"
  },
  darkMuted: {
    color: "#cbd5e1",
    lineHeight: 21,
    marginTop: 4
  },
  darkTitle: {
    color: "#f8fafc",
    fontSize: 20,
    fontWeight: "900",
    marginTop: 4
  },
  exerciseBody: {
    flex: 1,
    gap: 4
  },
  exerciseCard: {
    alignItems: "center",
    backgroundColor: "#111827",
    borderColor: "rgba(255,255,255,0.12)",
    borderRadius: 24,
    borderWidth: 1,
    flexDirection: "row",
    gap: 12,
    padding: 12
  },
  filterChip: {
    backgroundColor: "rgba(15,23,42,0.08)",
    borderColor: "rgba(15,23,42,0.12)",
    borderRadius: 999,
    borderWidth: 1,
    minHeight: 42,
    paddingHorizontal: 14,
    paddingVertical: 10
  },
  filterChipSelected: {
    backgroundColor: "#111827",
    borderColor: "#6ee7c8"
  },
  filterChipText: {
    color: "#475569",
    fontWeight: "900"
  },
  filterChipTextSelected: {
    color: "#f8fafc"
  },
  filterGroup: {
    gap: 8
  },
  filterLabel: {
    color: "#64748b",
    fontSize: 12,
    fontWeight: "900",
    textTransform: "uppercase"
  },
  ghostButton: {
    alignItems: "center",
    borderColor: "rgba(255,255,255,0.18)",
    borderRadius: 999,
    borderWidth: 1,
    minHeight: 44,
    paddingHorizontal: 16,
    paddingVertical: 11
  },
  ghostText: {
    color: "#f8fafc",
    fontWeight: "900"
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10
  },
  heroKicker: {
    color: "#6ee7c8",
    fontSize: 13,
    fontWeight: "900",
    marginTop: 12,
    textTransform: "uppercase"
  },
  heroSubtitle: {
    color: "#cbd5e1",
    lineHeight: 21,
    marginTop: 6
  },
  heroTitle: {
    color: "#f8fafc",
    fontSize: 30,
    fontWeight: "900",
    marginTop: 4
  },
  horizontalCards: {
    gap: 12,
    paddingRight: 16
  },
  mediaGlow: {
    alignItems: "center",
    alignSelf: "flex-start",
    backgroundColor: "rgba(110,231,200,0.12)",
    borderRadius: 20,
    height: 52,
    justifyContent: "center",
    width: 52
  },
  mediaPlaceholder: {
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.08)",
    borderRadius: 22,
    borderWidth: 1,
    gap: 8,
    height: 150,
    justifyContent: "center",
    marginBottom: 12
  },
  mediaSmall: {
    height: 84,
    marginBottom: 0,
    width: 84
  },
  mediaText: {
    color: "#cbd5e1",
    fontSize: 12,
    fontWeight: "800"
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
    minHeight: 34,
    paddingHorizontal: 11,
    paddingVertical: 8
  },
  pillText: {
    color: "#e2e8f0",
    fontSize: 12,
    fontWeight: "900"
  },
  progressFill: {
    borderRadius: 999,
    height: "100%"
  },
  progressTrack: {
    backgroundColor: "rgba(255,255,255,0.10)",
    borderRadius: 999,
    height: 8,
    marginTop: 14,
    overflow: "hidden"
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
    padding: 12
  },
  quickActionText: {
    color: "#f8fafc",
    fontSize: 12,
    fontWeight: "900",
    textAlign: "center"
  },
  quickGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10
  },
  routineCard: {
    backgroundColor: "#111827",
    borderRadius: 26,
    borderWidth: 1,
    padding: 14
  },
  safetyText: {
    color: "#9a3412",
    lineHeight: 20
  },
  setLabel: {
    color: "#94a3b8",
    fontSize: 11,
    fontWeight: "900",
    textTransform: "uppercase"
  },
  setList: {
    gap: 8,
    marginTop: 14
  },
  setNumber: {
    color: "#f8fafc",
    fontSize: 18,
    fontWeight: "900",
    width: 28
  },
  setRow: {
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.07)",
    borderRadius: 18,
    flexDirection: "row",
    gap: 10,
    padding: 10
  },
  setRowCompleted: {
    backgroundColor: "rgba(110,231,200,0.18)"
  },
  setText: {
    color: "#f8fafc",
    fontSize: 16,
    fontWeight: "900"
  },
  setValue: {
    flex: 1,
    gap: 2,
    minHeight: 44,
    justifyContent: "center"
  },
  skeletonLine: {
    backgroundColor: "rgba(255,255,255,0.12)",
    borderRadius: 999,
    height: 14,
    marginTop: 12,
    width: "90%"
  },
  stack: {
    gap: 14
  },
  successState: {
    alignItems: "center",
    alignSelf: "flex-start",
    backgroundColor: "#6ee7c8",
    borderRadius: 999,
    flexDirection: "row",
    gap: 8,
    minHeight: 44,
    paddingHorizontal: 14
  },
  successText: {
    color: "#10201d",
    fontWeight: "900"
  },
  tabRow: {
    gap: 8,
    paddingRight: 16
  }
});
