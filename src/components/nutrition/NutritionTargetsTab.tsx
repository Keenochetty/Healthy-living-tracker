import { useCallback, useEffect, useMemo, useState } from "react";
import { Text, TextInput, TouchableOpacity, View } from "react-native";

import { AppCard, AppIcon } from "@/components/ui";
import {
  calculateDailyNutritionProgress,
  calculateTargetProgressPercent,
  createNutritionTarget,
  formatMacroProgress,
  getActiveNutritionTarget,
  suggestGoalMessage,
  suggestNutritionTargets,
} from "@/lib/nutritionStorage";
import type {
  ActivityLevel,
  DailyNutritionProgress,
  NutritionDayAdjustment,
  NutritionGoalType,
  NutritionTarget,
} from "@/types/nutrition";

type WizardStep = 1 | 2 | 3 | 4 | 5 | 6;

const GOAL_OPTIONS: Array<{
  description: string;
  key: NutritionGoalType;
  title: string;
}> = [
  {
    description:
      "Use a sustainable target with protein, fiber, and hydration support.",
    key: "lose_weight",
    title: "Lose Weight",
  },
  {
    description:
      "Support strength training with enough energy, protein, and recovery nutrition.",
    key: "gain_muscle",
    title: "Gain Muscle",
  },
  {
    description: "Keep steady energy with balanced macros and hydration.",
    key: "maintain_weight",
    title: "Maintain Weight",
  },
  {
    description: "Support running energy, hydration, and recovery.",
    key: "improve_running",
    title: "Improve Running",
  },
  {
    description:
      "Support workouts with recovery-focused protein, carbs, and water.",
    key: "workout_recovery",
    title: "Workout Recovery",
  },
  {
    description: "Build a balanced target for everyday wellness.",
    key: "general_health",
    title: "General Health",
  },
  {
    description: "Set your own nutrition goal and target values.",
    key: "custom",
    title: "Custom Goal",
  },
];

const FUTURE_GOALS = [
  "Pregnancy Nutrition",
  "Child Nutrition",
  "Elder Care Nutrition",
  "Medical Condition Plan",
];

const ACTIVITY_LEVELS: Array<{ key: ActivityLevel; label: string }> = [
  { key: "low", label: "Low" },
  { key: "light", label: "Light" },
  { key: "moderate", label: "Moderate" },
  { key: "high", label: "High" },
  { key: "athlete", label: "Athlete" },
];

const WORKOUT_FOCUS_OPTIONS = [
  "Strength",
  "Muscle building",
  "Running",
  "Weight loss",
  "General fitness",
  "Home workouts",
  "Gym workouts",
];

const WORKOUT_ADJUSTMENTS: Array<{
  adjustment: NutritionDayAdjustment;
  label: string;
}> = [
  { adjustment: { mode: "same" }, label: "Same" },
  {
    adjustment: { caloriesAdjustmentPercent: 8, mode: "higher_calories" },
    label: "Higher Calories",
  },
  {
    adjustment: { carbsAdjustmentPercent: 12, mode: "higher_carbs" },
    label: "Higher Carbs",
  },
  {
    adjustment: { mode: "higher_protein", proteinAdjustmentPercent: 8 },
    label: "Higher Protein",
  },
  {
    adjustment: {
      caloriesAdjustmentPercent: 5,
      carbsAdjustmentPercent: 5,
      mode: "custom",
      proteinAdjustmentPercent: 5,
    },
    label: "Custom",
  },
];

const REST_ADJUSTMENTS: Array<{
  adjustment: NutritionDayAdjustment;
  label: string;
}> = [
  { adjustment: { mode: "same" }, label: "Same" },
  {
    adjustment: { caloriesAdjustmentPercent: -8, mode: "lower_calories" },
    label: "Slightly Lower",
  },
  {
    adjustment: { carbsAdjustmentPercent: -12, mode: "lower_carbs" },
    label: "Lower Carbs",
  },
  {
    adjustment: {
      caloriesAdjustmentPercent: -5,
      carbsAdjustmentPercent: -5,
      mode: "custom",
    },
    label: "Custom",
  },
];

const INPUT_STYLE = {
  backgroundColor: "#ffffff",
  borderColor: "#fde68a",
  borderRadius: 16,
  borderWidth: 1,
  color: "#0f172a",
  minHeight: 50,
  paddingHorizontal: 14,
};

export function NutritionTargetsTab({
  onSaved,
  todayKey,
}: {
  onSaved: () => void;
  todayKey: string;
}) {
  const [activeTarget, setActiveTarget] = useState<NutritionTarget | null>(
    null,
  );
  const [progress, setProgress] = useState<DailyNutritionProgress | null>(null);
  const [isWizardOpen, setIsWizardOpen] = useState(false);
  const [savedMessage, setSavedMessage] = useState<string | null>(null);

  const loadTargets = useCallback(async () => {
    const [target, dailyProgress] = await Promise.all([
      getActiveNutritionTarget(),
      calculateDailyNutritionProgress(todayKey),
    ]);

    setActiveTarget(target);
    setProgress(dailyProgress);
  }, [todayKey]);

  useEffect(() => {
    Promise.resolve()
      .then(loadTargets)
      .catch(() => undefined);
  }, [loadTargets]);

  if (isWizardOpen) {
    return (
      <TargetsWizard
        existingTarget={activeTarget}
        onCancel={() => setIsWizardOpen(false)}
        onSaved={async () => {
          setSavedMessage(
            "Targets saved. Your Food / Nutrition dashboard is now personalized.",
          );
          setIsWizardOpen(false);
          await loadTargets();
          onSaved();
        }}
      />
    );
  }

  return (
    <View style={{ gap: 12 }}>
      {savedMessage ? (
        <AppCard backgroundColor="#ecfdf5">
          <Text style={{ color: "#047857", fontWeight: "900" }}>
            {savedMessage}
          </Text>
        </AppCard>
      ) : null}

      {activeTarget ? (
        <TargetsHome
          onEdit={() => setIsWizardOpen(true)}
          progress={progress}
          target={activeTarget}
        />
      ) : (
        <AppCard>
          <View style={{ gap: 12 }}>
            <View
              style={{ alignItems: "center", flexDirection: "row", gap: 10 }}
            >
              <AppIcon
                color="#f59e0b"
                container
                containerVariant="white"
                name="vitals"
                size={22}
              />
              <Text
                style={{
                  color: "#0f172a",
                  flex: 1,
                  fontSize: 22,
                  fontWeight: "900",
                }}
              >
                Nutrition Targets
              </Text>
            </View>
            <Text style={{ color: "#64748b", lineHeight: 21 }}>
              Set a nutrition goal to personalize your food dashboard.
            </Text>
            <PrimaryButton
              label="Set My Nutrition Goal"
              onPress={() => setIsWizardOpen(true)}
            />
          </View>
        </AppCard>
      )}

      <SafetyNotice />
    </View>
  );
}

function TargetsHome({
  onEdit,
  progress,
  target,
}: {
  onEdit: () => void;
  progress: DailyNutritionProgress | null;
  target: NutritionTarget;
}) {
  return (
    <View style={{ gap: 12 }}>
      <AppCard>
        <View style={{ gap: 12 }}>
          <View style={{ alignItems: "center", flexDirection: "row", gap: 10 }}>
            <AppIcon
              color="#f59e0b"
              container
              containerVariant="white"
              name="vitals"
              size={22}
            />
            <View style={{ flex: 1 }}>
              <Text
                style={{ color: "#b45309", fontSize: 13, fontWeight: "900" }}
              >
                Current Goal
              </Text>
              <Text
                style={{ color: "#0f172a", fontSize: 24, fontWeight: "900" }}
              >
                {getGoalLabel(target.goalType)}
              </Text>
            </View>
          </View>

          <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 10 }}>
            <MetricPill
              label="Calories"
              value={`${Math.round(target.caloriesTarget).toLocaleString()} / day`}
            />
            <MetricPill
              label="Protein"
              value={`${Math.round(target.proteinTargetG)} g / day`}
            />
            <MetricPill
              label="Water"
              value={`${formatWaterMl(target.waterTargetMl)} / day`}
            />
          </View>

          <View style={{ flexDirection: "row", gap: 10 }}>
            <PrimaryButton label="Edit Targets" onPress={onEdit} />
            <SecondaryButton label="Change Goal" onPress={onEdit} />
          </View>
        </View>
      </AppCard>

      <AppCard backgroundColor="#fffbeb">
        <Text style={{ color: "#92400e", fontSize: 20, fontWeight: "900" }}>
          Goal Support
        </Text>
        <Text style={{ color: "#92400e", lineHeight: 21, marginTop: 6 }}>
          {suggestGoalMessage(target.goalType)}
        </Text>
      </AppCard>

      <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 10 }}>
        <ProgressMetricCard
          label="Calories Target"
          progress={calculateTargetProgressPercent(
            progress?.caloriesConsumed,
            progress?.caloriesTarget,
          )}
          value={
            progress
              ? formatMacroProgress(
                  progress.caloriesConsumed,
                  progress.caloriesTarget,
                  "kcal",
                )
              : `0 / ${target.caloriesTarget} kcal`
          }
        />
        <ProgressMetricCard
          label="Protein Target"
          progress={calculateTargetProgressPercent(
            progress?.proteinConsumedG,
            progress?.proteinTargetG,
          )}
          value={
            progress
              ? formatMacroProgress(
                  progress.proteinConsumedG,
                  progress.proteinTargetG,
                  "g",
                )
              : `0 / ${target.proteinTargetG} g`
          }
        />
        <ProgressMetricCard
          label="Carbs Target"
          progress={calculateTargetProgressPercent(
            progress?.carbsConsumedG,
            progress?.carbsTargetG,
          )}
          value={
            progress
              ? formatMacroProgress(
                  progress.carbsConsumedG,
                  progress.carbsTargetG,
                  "g",
                )
              : `0 / ${target.carbsTargetG} g`
          }
        />
        <ProgressMetricCard
          label="Fat Target"
          progress={calculateTargetProgressPercent(
            progress?.fatConsumedG,
            progress?.fatTargetG,
          )}
          value={
            progress
              ? formatMacroProgress(
                  progress.fatConsumedG,
                  progress.fatTargetG,
                  "g",
                )
              : `0 / ${target.fatTargetG} g`
          }
        />
        <ProgressMetricCard
          label="Fiber Target"
          progress={calculateTargetProgressPercent(
            progress?.fiberConsumedG,
            progress?.fiberTargetG,
          )}
          value={
            progress
              ? formatMacroProgress(
                  progress.fiberConsumedG ?? 0,
                  progress.fiberTargetG ?? target.fiberTargetG ?? 0,
                  "g",
                )
              : `0 / ${target.fiberTargetG ?? 0} g`
          }
        />
        <ProgressMetricCard
          label="Water Target"
          progress={calculateTargetProgressPercent(
            progress?.waterConsumedMl,
            progress?.waterTargetMl,
          )}
          value={
            progress
              ? `${formatWaterMl(progress.waterConsumedMl)} / ${formatWaterMl(progress.waterTargetMl)}`
              : `0 / ${formatWaterMl(target.waterTargetMl)}`
          }
        />
      </View>

      <AppCard>
        <Text style={{ color: "#0f172a", fontSize: 20, fontWeight: "900" }}>
          Workout and rest days
        </Text>
        <Text style={{ color: "#64748b", lineHeight: 21, marginTop: 6 }}>
          Workout days: {getAdjustmentLabel(target.workoutDayAdjustment)}. Rest
          days: {getAdjustmentLabel(target.restDayAdjustment)}.
        </Text>
      </AppCard>
    </View>
  );
}

function TargetsWizard({
  existingTarget,
  onCancel,
  onSaved,
}: {
  existingTarget: NutritionTarget | null;
  onCancel: () => void;
  onSaved: () => void;
}) {
  const [step, setStep] = useState<WizardStep>(1);
  const [goalType, setGoalType] = useState<NutritionGoalType>(
    existingTarget?.goalType ?? "gain_muscle",
  );
  const [currentWeightKg, setCurrentWeightKg] = useState(
    existingTarget?.currentWeightKg
      ? String(existingTarget.currentWeightKg)
      : "",
  );
  const [goalWeightKg, setGoalWeightKg] = useState(
    existingTarget?.goalWeightKg ? String(existingTarget.goalWeightKg) : "",
  );
  const [goalDate, setGoalDate] = useState(existingTarget?.goalDate ?? "");
  const [activityLevel, setActivityLevel] = useState<ActivityLevel>(
    existingTarget?.activityLevel ?? "moderate",
  );
  const [trainingDaysPerWeek, setTrainingDaysPerWeek] = useState(
    existingTarget?.trainingDaysPerWeek
      ? String(existingTarget.trainingDaysPerWeek)
      : "3",
  );
  const [mainWorkoutFocus, setMainWorkoutFocus] = useState(
    existingTarget?.mainWorkoutFocus ?? "General fitness",
  );
  const [caloriesTarget, setCaloriesTarget] = useState(
    String(existingTarget?.caloriesTarget ?? 2300),
  );
  const [proteinTargetG, setProteinTargetG] = useState(
    String(existingTarget?.proteinTargetG ?? 130),
  );
  const [carbsTargetG, setCarbsTargetG] = useState(
    String(existingTarget?.carbsTargetG ?? 250),
  );
  const [fatTargetG, setFatTargetG] = useState(
    String(existingTarget?.fatTargetG ?? 70),
  );
  const [fiberTargetG, setFiberTargetG] = useState(
    String(existingTarget?.fiberTargetG ?? 30),
  );
  const [waterTargetMl, setWaterTargetMl] = useState(
    String(existingTarget?.waterTargetMl ?? 2500),
  );
  const [workoutDayAdjustment, setWorkoutDayAdjustment] =
    useState<NutritionDayAdjustment>(
      existingTarget?.workoutDayAdjustment ?? { mode: "same" },
    );
  const [restDayAdjustment, setRestDayAdjustment] =
    useState<NutritionDayAdjustment>(
      existingTarget?.restDayAdjustment ?? { mode: "same" },
    );

  const suggestedTargets = useMemo(
    () =>
      suggestNutritionTargets({
        activityLevel,
        currentWeightKg: Number(currentWeightKg) || undefined,
        goalType,
        trainingDaysPerWeek: Number(trainingDaysPerWeek) || undefined,
      }),
    [activityLevel, currentWeightKg, goalType, trainingDaysPerWeek],
  );

  function useSuggestedTargets() {
    setCaloriesTarget(String(suggestedTargets.caloriesTarget));
    setProteinTargetG(String(suggestedTargets.proteinTargetG));
    setCarbsTargetG(String(suggestedTargets.carbsTargetG));
    setFatTargetG(String(suggestedTargets.fatTargetG));
    setFiberTargetG(String(suggestedTargets.fiberTargetG ?? 30));
    setWaterTargetMl(String(suggestedTargets.waterTargetMl));
    setStep(4);
  }

  async function saveTargets() {
    await createNutritionTarget({
      activityLevel,
      caloriesTarget: Number(caloriesTarget) || 0,
      carbsTargetG: Number(carbsTargetG) || 0,
      currentWeightKg: Number(currentWeightKg) || undefined,
      fatTargetG: Number(fatTargetG) || 0,
      fiberTargetG: Number(fiberTargetG) || undefined,
      goalDate: goalDate.trim() || undefined,
      goalType,
      goalWeightKg: Number(goalWeightKg) || undefined,
      mainWorkoutFocus,
      preferredUnits: "metric",
      proteinTargetG: Number(proteinTargetG) || 0,
      restDayAdjustment,
      trainingDaysPerWeek: Number(trainingDaysPerWeek) || undefined,
      waterTargetMl: Number(waterTargetMl) || 0,
      workoutDayAdjustment,
    });

    onSaved();
  }

  return (
    <View style={{ gap: 12 }}>
      <AppCard>
        <View style={{ gap: 8 }}>
          <Text style={{ color: "#b45309", fontSize: 13, fontWeight: "900" }}>
            Step {step} of 6
          </Text>
          <Text style={{ color: "#0f172a", fontSize: 24, fontWeight: "900" }}>
            {getStepTitle(step)}
          </Text>
          <ProgressBar progress={Math.round((step / 6) * 100)} />
        </View>
      </AppCard>

      {step === 1 ? (
        <WizardGoalStep goalType={goalType} onSelect={setGoalType} />
      ) : null}

      {step === 2 ? (
        <WizardBodyStep
          activityLevel={activityLevel}
          currentWeightKg={currentWeightKg}
          goalDate={goalDate}
          goalWeightKg={goalWeightKg}
          mainWorkoutFocus={mainWorkoutFocus}
          onActivityLevelChange={setActivityLevel}
          onCurrentWeightChange={setCurrentWeightKg}
          onGoalDateChange={setGoalDate}
          onGoalWeightChange={setGoalWeightKg}
          onMainWorkoutFocusChange={setMainWorkoutFocus}
          onTrainingDaysChange={setTrainingDaysPerWeek}
          trainingDaysPerWeek={trainingDaysPerWeek}
        />
      ) : null}

      {step === 3 ? (
        <WizardSuggestedStep
          onAdjust={() => setStep(4)}
          onUseSuggested={useSuggestedTargets}
          suggestedTargets={suggestedTargets}
        />
      ) : null}

      {step === 4 ? (
        <WizardManualStep
          caloriesTarget={caloriesTarget}
          carbsTargetG={carbsTargetG}
          fatTargetG={fatTargetG}
          fiberTargetG={fiberTargetG}
          onCaloriesChange={setCaloriesTarget}
          onCarbsChange={setCarbsTargetG}
          onFatChange={setFatTargetG}
          onFiberChange={setFiberTargetG}
          onProteinChange={setProteinTargetG}
          onWaterChange={setWaterTargetMl}
          proteinTargetG={proteinTargetG}
          waterTargetMl={waterTargetMl}
        />
      ) : null}

      {step === 5 ? (
        <WizardAdjustmentStep
          onRestChange={setRestDayAdjustment}
          onWorkoutChange={setWorkoutDayAdjustment}
          restDayAdjustment={restDayAdjustment}
          workoutDayAdjustment={workoutDayAdjustment}
        />
      ) : null}

      {step === 6 ? (
        <WizardReviewStep
          caloriesTarget={caloriesTarget}
          carbsTargetG={carbsTargetG}
          fatTargetG={fatTargetG}
          fiberTargetG={fiberTargetG}
          goalType={goalType}
          proteinTargetG={proteinTargetG}
          restDayAdjustment={restDayAdjustment}
          waterTargetMl={waterTargetMl}
          workoutDayAdjustment={workoutDayAdjustment}
        />
      ) : null}

      <View style={{ flexDirection: "row", gap: 10 }}>
        <SecondaryButton
          label={step === 1 ? "Cancel" : "Back"}
          onPress={
            step === 1
              ? onCancel
              : () =>
                  setStep((current) => Math.max(1, current - 1) as WizardStep)
          }
        />
        <PrimaryButton
          label={step === 6 ? "Save Targets" : "Next"}
          onPress={
            step === 6
              ? saveTargets
              : () =>
                  setStep((current) => Math.min(6, current + 1) as WizardStep)
          }
        />
      </View>

      <SafetyNotice />
    </View>
  );
}

function WizardGoalStep({
  goalType,
  onSelect,
}: {
  goalType: NutritionGoalType;
  onSelect: (goalType: NutritionGoalType) => void;
}) {
  return (
    <View style={{ gap: 10 }}>
      {GOAL_OPTIONS.map((goal) => (
        <TouchableOpacity
          activeOpacity={0.85}
          key={goal.key}
          onPress={() => onSelect(goal.key)}
          style={{
            backgroundColor: goalType === goal.key ? "#fffbeb" : "#ffffff",
            borderColor: goalType === goal.key ? "#f59e0b" : "#fde68a",
            borderRadius: 18,
            borderWidth: 1,
            padding: 14,
          }}
        >
          <Text style={{ color: "#0f172a", fontSize: 18, fontWeight: "900" }}>
            {goal.title}
          </Text>
          <Text style={{ color: "#64748b", lineHeight: 20, marginTop: 4 }}>
            {goal.description}
          </Text>
        </TouchableOpacity>
      ))}

      {FUTURE_GOALS.map((goal) => (
        <AppCard key={goal} backgroundColor="#f8fafc">
          <Text style={{ color: "#64748b", fontWeight: "900" }}>{goal}</Text>
          <Text style={{ color: "#94a3b8", lineHeight: 20, marginTop: 4 }}>
            Coming later with safer guidance and professional confirmation.
          </Text>
        </AppCard>
      ))}
    </View>
  );
}

function WizardBodyStep({
  activityLevel,
  currentWeightKg,
  goalDate,
  goalWeightKg,
  mainWorkoutFocus,
  onActivityLevelChange,
  onCurrentWeightChange,
  onGoalDateChange,
  onGoalWeightChange,
  onMainWorkoutFocusChange,
  onTrainingDaysChange,
  trainingDaysPerWeek,
}: {
  activityLevel: ActivityLevel;
  currentWeightKg: string;
  goalDate: string;
  goalWeightKg: string;
  mainWorkoutFocus: string;
  onActivityLevelChange: (level: ActivityLevel) => void;
  onCurrentWeightChange: (value: string) => void;
  onGoalDateChange: (value: string) => void;
  onGoalWeightChange: (value: string) => void;
  onMainWorkoutFocusChange: (value: string) => void;
  onTrainingDaysChange: (value: string) => void;
  trainingDaysPerWeek: string;
}) {
  return (
    <AppCard>
      <View style={{ gap: 12 }}>
        <TargetInput
          keyboardType="numeric"
          label="Current weight (kg)"
          onChangeText={onCurrentWeightChange}
          value={currentWeightKg}
        />
        <TargetInput
          keyboardType="numeric"
          label="Goal weight (kg)"
          onChangeText={onGoalWeightChange}
          value={goalWeightKg}
        />
        <TargetInput
          label="Goal date optional"
          onChangeText={onGoalDateChange}
          placeholder="YYYY-MM-DD"
          value={goalDate}
        />
        <TargetInput
          keyboardType="numeric"
          label="Training days per week"
          onChangeText={onTrainingDaysChange}
          value={trainingDaysPerWeek}
        />

        <ChoiceGroup
          label="Activity level"
          options={ACTIVITY_LEVELS.map((item) => ({
            key: item.key,
            label: item.label,
          }))}
          selectedKey={activityLevel}
          onSelect={(key) => onActivityLevelChange(key as ActivityLevel)}
        />

        <ChoiceGroup
          label="Main workout focus"
          options={WORKOUT_FOCUS_OPTIONS.map((label) => ({
            key: label,
            label,
          }))}
          selectedKey={mainWorkoutFocus}
          onSelect={onMainWorkoutFocusChange}
        />

        <Text style={{ color: "#64748b", lineHeight: 20 }}>
          Preferred units: metric (kg, cm, ml, grams). Imperial support is
          prepared for later.
        </Text>
      </View>
    </AppCard>
  );
}

function WizardSuggestedStep({
  onAdjust,
  onUseSuggested,
  suggestedTargets,
}: {
  onAdjust: () => void;
  onUseSuggested: () => void;
  suggestedTargets: {
    caloriesTarget: number;
    carbsTargetG: number;
    fatTargetG: number;
    fiberTargetG?: number;
    proteinTargetG: number;
    waterTargetMl: number;
  };
}) {
  return (
    <View style={{ gap: 12 }}>
      <AppCard>
        <Text style={{ color: "#64748b", lineHeight: 21 }}>
          These are general starting targets. You can edit them before saving.
        </Text>
      </AppCard>
      <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 10 }}>
        <MetricPill
          label="Calories"
          value={`${suggestedTargets.caloriesTarget} kcal`}
        />
        <MetricPill
          label="Protein"
          value={`${suggestedTargets.proteinTargetG} g`}
        />
        <MetricPill
          label="Carbs"
          value={`${suggestedTargets.carbsTargetG} g`}
        />
        <MetricPill label="Fat" value={`${suggestedTargets.fatTargetG} g`} />
        <MetricPill
          label="Fiber"
          value={`${suggestedTargets.fiberTargetG ?? 30} g`}
        />
        <MetricPill
          label="Water"
          value={`${suggestedTargets.waterTargetMl} ml`}
        />
      </View>
      <View style={{ flexDirection: "row", gap: 10 }}>
        <PrimaryButton label="Use Suggested Targets" onPress={onUseSuggested} />
        <SecondaryButton label="Adjust Manually" onPress={onAdjust} />
      </View>
    </View>
  );
}

function WizardManualStep({
  caloriesTarget,
  carbsTargetG,
  fatTargetG,
  fiberTargetG,
  onCaloriesChange,
  onCarbsChange,
  onFatChange,
  onFiberChange,
  onProteinChange,
  onWaterChange,
  proteinTargetG,
  waterTargetMl,
}: {
  caloriesTarget: string;
  carbsTargetG: string;
  fatTargetG: string;
  fiberTargetG: string;
  onCaloriesChange: (value: string) => void;
  onCarbsChange: (value: string) => void;
  onFatChange: (value: string) => void;
  onFiberChange: (value: string) => void;
  onProteinChange: (value: string) => void;
  onWaterChange: (value: string) => void;
  proteinTargetG: string;
  waterTargetMl: string;
}) {
  return (
    <AppCard>
      <View style={{ gap: 12 }}>
        <TargetInput
          helper="Energy target used to compare daily food intake with your goal."
          keyboardType="numeric"
          label="Calories per day"
          onChangeText={onCaloriesChange}
          value={caloriesTarget}
        />
        <TargetInput
          helper="Helps support muscle repair and recovery after workouts."
          keyboardType="numeric"
          label="Protein grams"
          onChangeText={onProteinChange}
          value={proteinTargetG}
        />
        <TargetInput
          helper="Supports training energy and daily meals."
          keyboardType="numeric"
          label="Carbs grams"
          onChangeText={onCarbsChange}
          value={carbsTargetG}
        />
        <TargetInput
          helper="Supports balanced meals and energy."
          keyboardType="numeric"
          label="Fat grams"
          onChangeText={onFatChange}
          value={fatTargetG}
        />
        <TargetInput
          helper="Supports a balanced nutrition pattern."
          keyboardType="numeric"
          label="Fiber grams"
          onChangeText={onFiberChange}
          value={fiberTargetG}
        />
        <TargetInput
          helper="Used for your daily water progress widget."
          keyboardType="numeric"
          label="Water ml"
          onChangeText={onWaterChange}
          value={waterTargetMl}
        />
      </View>
    </AppCard>
  );
}

function WizardAdjustmentStep({
  onRestChange,
  onWorkoutChange,
  restDayAdjustment,
  workoutDayAdjustment,
}: {
  onRestChange: (adjustment: NutritionDayAdjustment) => void;
  onWorkoutChange: (adjustment: NutritionDayAdjustment) => void;
  restDayAdjustment: NutritionDayAdjustment;
  workoutDayAdjustment: NutritionDayAdjustment;
}) {
  return (
    <View style={{ gap: 12 }}>
      <AppCard>
        <ChoiceGroup
          label="Workout days"
          options={WORKOUT_ADJUSTMENTS.map((item) => ({
            key: item.adjustment.mode,
            label: item.label,
          }))}
          selectedKey={workoutDayAdjustment.mode}
          onSelect={(key) =>
            onWorkoutChange(
              WORKOUT_ADJUSTMENTS.find((item) => item.adjustment.mode === key)
                ?.adjustment ?? { mode: "same" },
            )
          }
        />
      </AppCard>
      <AppCard>
        <ChoiceGroup
          label="Rest days"
          options={REST_ADJUSTMENTS.map((item) => ({
            key: item.adjustment.mode,
            label: item.label,
          }))}
          selectedKey={restDayAdjustment.mode}
          onSelect={(key) =>
            onRestChange(
              REST_ADJUSTMENTS.find((item) => item.adjustment.mode === key)
                ?.adjustment ?? { mode: "same" },
            )
          }
        />
      </AppCard>
    </View>
  );
}

function WizardReviewStep({
  caloriesTarget,
  carbsTargetG,
  fatTargetG,
  fiberTargetG,
  goalType,
  proteinTargetG,
  restDayAdjustment,
  waterTargetMl,
  workoutDayAdjustment,
}: {
  caloriesTarget: string;
  carbsTargetG: string;
  fatTargetG: string;
  fiberTargetG: string;
  goalType: NutritionGoalType;
  proteinTargetG: string;
  restDayAdjustment: NutritionDayAdjustment;
  waterTargetMl: string;
  workoutDayAdjustment: NutritionDayAdjustment;
}) {
  return (
    <AppCard>
      <View style={{ gap: 10 }}>
        <Text style={{ color: "#0f172a", fontSize: 20, fontWeight: "900" }}>
          Review Your Nutrition Targets
        </Text>
        <MetricLine label="Goal" value={getGoalLabel(goalType)} />
        <MetricLine label="Calories" value={`${caloriesTarget} kcal`} />
        <MetricLine label="Protein" value={`${proteinTargetG} g`} />
        <MetricLine label="Carbs" value={`${carbsTargetG} g`} />
        <MetricLine label="Fat" value={`${fatTargetG} g`} />
        <MetricLine label="Fiber" value={`${fiberTargetG} g`} />
        <MetricLine label="Water" value={`${waterTargetMl} ml`} />
        <MetricLine
          label="Workout Days"
          value={getAdjustmentLabel(workoutDayAdjustment)}
        />
        <MetricLine
          label="Rest Days"
          value={getAdjustmentLabel(restDayAdjustment)}
        />
      </View>
    </AppCard>
  );
}

function TargetInput({
  helper,
  keyboardType,
  label,
  onChangeText,
  placeholder,
  value,
}: {
  helper?: string;
  keyboardType?: "default" | "numeric";
  label: string;
  onChangeText: (value: string) => void;
  placeholder?: string;
  value: string;
}) {
  return (
    <View style={{ gap: 6 }}>
      <Text style={{ color: "#0f172a", fontWeight: "900" }}>{label}</Text>
      {helper ? (
        <Text style={{ color: "#64748b", lineHeight: 20 }}>{helper}</Text>
      ) : null}
      <TextInput
        keyboardType={keyboardType}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor="#94a3b8"
        style={INPUT_STYLE}
        value={value}
      />
    </View>
  );
}

function ChoiceGroup({
  label,
  onSelect,
  options,
  selectedKey,
}: {
  label: string;
  onSelect: (key: string) => void;
  options: Array<{ key: string; label: string }>;
  selectedKey: string;
}) {
  return (
    <View style={{ gap: 8 }}>
      <Text style={{ color: "#0f172a", fontWeight: "900" }}>{label}</Text>
      <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
        {options.map((option) => (
          <TouchableOpacity
            activeOpacity={0.85}
            key={option.key}
            onPress={() => onSelect(option.key)}
            style={{
              backgroundColor:
                selectedKey === option.key ? "#f59e0b" : "#fffbeb",
              borderRadius: 999,
              paddingHorizontal: 12,
              paddingVertical: 9,
            }}
          >
            <Text
              style={{
                color: selectedKey === option.key ? "#ffffff" : "#92400e",
                fontWeight: "900",
              }}
            >
              {option.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

function MetricPill({ label, value }: { label: string; value: string }) {
  return (
    <View
      style={{
        backgroundColor: "#fffbeb",
        borderRadius: 16,
        flexGrow: 1,
        minWidth: "30%",
        padding: 12,
      }}
    >
      <Text style={{ color: "#92400e", fontSize: 12, fontWeight: "900" }}>
        {label}
      </Text>
      <Text
        style={{
          color: "#0f172a",
          fontSize: 16,
          fontWeight: "900",
          marginTop: 4,
        }}
      >
        {value}
      </Text>
    </View>
  );
}

function ProgressMetricCard({
  label,
  progress,
  value,
}: {
  label: string;
  progress: number;
  value: string;
}) {
  return (
    <AppCard style={{ flexGrow: 1, minWidth: "46%" }}>
      <Text style={{ color: "#92400e", fontSize: 12, fontWeight: "900" }}>
        {label}
      </Text>
      <Text
        style={{
          color: "#0f172a",
          fontSize: 17,
          fontWeight: "900",
          marginTop: 4,
        }}
      >
        {value}
      </Text>
      <ProgressBar progress={progress} />
    </AppCard>
  );
}

function ProgressBar({ progress }: { progress: number }) {
  return (
    <View
      style={{
        backgroundColor: "#fde68a",
        borderRadius: 999,
        height: 10,
        marginTop: 10,
        overflow: "hidden",
      }}
    >
      <View
        style={{
          backgroundColor: "#f59e0b",
          borderRadius: 999,
          height: "100%",
          width: `${Math.max(0, Math.min(100, progress))}%` as `${number}%`,
        }}
      />
    </View>
  );
}

function MetricLine({ label, value }: { label: string; value: string }) {
  return (
    <View
      style={{ flexDirection: "row", gap: 10, justifyContent: "space-between" }}
    >
      <Text style={{ color: "#64748b", flex: 1, fontWeight: "800" }}>
        {label}
      </Text>
      <Text style={{ color: "#0f172a", fontWeight: "900" }}>{value}</Text>
    </View>
  );
}

function PrimaryButton({
  label,
  onPress,
}: {
  label: string;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity
      activeOpacity={0.85}
      onPress={onPress}
      style={{
        alignItems: "center",
        backgroundColor: "#f59e0b",
        borderRadius: 18,
        flex: 1,
        justifyContent: "center",
        minHeight: 52,
      }}
    >
      <Text style={{ color: "#ffffff", fontSize: 16, fontWeight: "900" }}>
        {label}
      </Text>
    </TouchableOpacity>
  );
}

function SecondaryButton({
  label,
  onPress,
}: {
  label: string;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity
      activeOpacity={0.85}
      onPress={onPress}
      style={{
        alignItems: "center",
        backgroundColor: "#fffbeb",
        borderRadius: 18,
        flex: 1,
        justifyContent: "center",
        minHeight: 52,
      }}
    >
      <Text style={{ color: "#92400e", fontSize: 16, fontWeight: "900" }}>
        {label}
      </Text>
    </TouchableOpacity>
  );
}

function SafetyNotice() {
  return (
    <Text style={{ color: "#64748b", fontSize: 12, lineHeight: 18 }}>
      Targets are for general wellness tracking only and are not medical advice.
      For pregnancy, children, medical conditions, medication concerns, or
      eating concerns, speak to a healthcare professional.
    </Text>
  );
}

function getStepTitle(step: WizardStep) {
  switch (step) {
    case 1:
      return "What are you working towards?";
    case 2:
      return "Tell us about your starting point";
    case 3:
      return "Suggested starting targets";
    case 4:
      return "Fine-tune your targets";
    case 5:
      return "Should targets change on workout days?";
    case 6:
      return "Review Your Nutrition Targets";
  }
}

export function getGoalLabel(goalType?: NutritionGoalType) {
  return (
    GOAL_OPTIONS.find((goal) => goal.key === goalType)?.title ??
    "Nutrition Goal"
  );
}

function getAdjustmentLabel(adjustment?: NutritionDayAdjustment) {
  switch (adjustment?.mode) {
    case "higher_calories":
      return "Slightly higher calories";
    case "higher_carbs":
      return "Higher carbs";
    case "higher_protein":
      return "Higher protein";
    case "lower_calories":
      return "Slightly lower calories";
    case "lower_carbs":
      return "Lower carbs";
    case "custom":
      return "Custom";
    case "same":
    default:
      return "Same as normal";
  }
}

function formatWaterMl(amountMl: number) {
  return amountMl >= 1000
    ? `${(amountMl / 1000).toFixed(1)} L`
    : `${Math.round(amountMl)} ml`;
}
