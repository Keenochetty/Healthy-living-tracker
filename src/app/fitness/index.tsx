import { useCallback, useEffect, useState } from "react";
import { Text, View } from "react-native";

import { ActiveWorkoutTimer } from "@/components/fitness/ActiveWorkoutTimer";
import { AddWorkoutPlanCard } from "@/components/fitness/AddWorkoutPlanCard";
import { FitnessDisclaimerCard } from "@/components/fitness/FitnessDisclaimerCard";
import { FitnessSummaryCard } from "@/components/fitness/FitnessSummaryCard";
import { IntervalTimerCard } from "@/components/fitness/IntervalTimerCard";
import { StepCounterCard } from "@/components/fitness/StepCounterCard";
import { WorkoutPlanCard } from "@/components/fitness/WorkoutPlanCard";
import { WorkoutSessionCard } from "@/components/fitness/WorkoutSessionCard";
import { ScreenWrapper } from "@/components/layout/ScreenWrapper";
import { AppCard } from "@/components/ui/AppCard";
import {
  getTrainingBodyProgressSummary,
  getWorkoutReadinessSummary
} from "@/lib/biometricsStorage";
import {
  deleteWorkoutPlan,
  getIntervalPresets,
  getTodayFitnessSummary,
  getWorkoutPlans,
  getWorkoutSessions
} from "@/lib/fitnessStorage";
import type {
  FitnessSummary,
  IntervalTimerPreset,
  WorkoutPlan,
  WorkoutSession
} from "@/types/fitness";
import type { TrainingBodyProgressSummary, WorkoutReadinessSummary } from "@/types/biometrics";

export default function FitnessScreen() {
  const [summary, setSummary] = useState<FitnessSummary | null>(null);
  const [plans, setPlans] = useState<WorkoutPlan[]>([]);
  const [sessions, setSessions] = useState<WorkoutSession[]>([]);
  const [presets, setPresets] = useState<IntervalTimerPreset[]>([]);
  const [readiness, setReadiness] = useState<WorkoutReadinessSummary | null>(null);
  const [bodyProgress, setBodyProgress] = useState<TrainingBodyProgressSummary | null>(null);

  const loadFitness = useCallback(async () => {
    const [nextSummary, nextPlans, nextSessions, nextPresets, nextReadiness, nextBodyProgress] = await Promise.all([
      getTodayFitnessSummary(),
      getWorkoutPlans(),
      getWorkoutSessions(),
      getIntervalPresets(),
      getWorkoutReadinessSummary(),
      getTrainingBodyProgressSummary()
    ]);

    setSummary(nextSummary);
    setPlans(nextPlans);
    setSessions(nextSessions);
    setPresets(nextPresets);
    setReadiness(nextReadiness);
    setBodyProgress(nextBodyProgress);
  }, []);

  useEffect(() => {
    let isActive = true;

    Promise.all([
      getTodayFitnessSummary(),
      getWorkoutPlans(),
      getWorkoutSessions(),
      getIntervalPresets(),
      getWorkoutReadinessSummary(),
      getTrainingBodyProgressSummary()
    ]).then(([nextSummary, nextPlans, nextSessions, nextPresets, nextReadiness, nextBodyProgress]) => {
      if (isActive) {
        setSummary(nextSummary);
        setPlans(nextPlans);
        setSessions(nextSessions);
        setPresets(nextPresets);
        setReadiness(nextReadiness);
        setBodyProgress(nextBodyProgress);
      }
    });

    return () => {
      isActive = false;
    };
  }, []);

  async function removePlan(planId: string) {
    await deleteWorkoutPlan(planId);
    await loadFitness();
  }

  return (
    <ScreenWrapper>
      <View style={{ gap: 4 }}>
        <Text style={{ color: "#64748b", fontSize: 14 }}>Optional movement</Text>
        <Text style={{ color: "#0f172a", fontSize: 30, fontWeight: "900" }}>
          Fitness
        </Text>
        <Text style={{ color: "#64748b", lineHeight: 20 }}>
          Track movement, workouts and progress at your pace.
        </Text>
      </View>

      <FitnessDisclaimerCard />
      {summary ? <FitnessSummaryCard summary={summary} /> : null}
      {readiness ? (
        <AppCard backgroundColor="#f0fdf4">
          <View style={{ gap: 8 }}>
            <Text style={{ color: "#166534", fontSize: 20, fontWeight: "900" }}>
              {readiness.title}
            </Text>
            <Text style={{ color: "#166534", lineHeight: 21 }}>{readiness.message}</Text>
            <Text style={{ color: "#64748b", lineHeight: 20 }}>
              Sleep: {readiness.sleepDurationMinutes ? formatSleep(readiness.sleepDurationMinutes) : "No log"}.
              Energy: {readiness.energyLabel ?? "No log"}.
            </Text>
            {bodyProgress?.weightMessage ? (
              <Text style={{ color: "#64748b", lineHeight: 20 }}>{bodyProgress.weightMessage}</Text>
            ) : null}
            {bodyProgress?.bodyMeasurementMessage ? (
              <Text style={{ color: "#64748b", lineHeight: 20 }}>{bodyProgress.bodyMeasurementMessage}</Text>
            ) : null}
          </View>
        </AppCard>
      ) : null}
      <StepCounterCard onRefresh={loadFitness} />
      <ActiveWorkoutTimer onCompleted={loadFitness} />
      <IntervalTimerCard onCompleted={loadFitness} presets={presets} />
      <AddWorkoutPlanCard onSaved={loadFitness} />

      <View style={{ gap: 10 }}>
        <Text style={{ color: "#0f172a", fontSize: 21, fontWeight: "900" }}>
          Workout plans
        </Text>
        {plans.length ? (
          plans.map((plan) => (
            <WorkoutPlanCard
              key={plan.id}
              onDelete={() => removePlan(plan.id)}
              onStart={loadFitness}
              plan={plan}
            />
          ))
        ) : (
          <View style={{ backgroundColor: "#ffffff", borderRadius: 24, padding: 16 }}>
            <Text style={{ color: "#64748b", lineHeight: 21 }}>
              No workout plans yet. Add a simple plan when you are ready.
            </Text>
          </View>
        )}
      </View>

      <View style={{ gap: 10 }}>
        <Text style={{ color: "#0f172a", fontSize: 21, fontWeight: "900" }}>
          Recent workouts
        </Text>
        {sessions.length ? (
          sessions.slice(0, 5).map((session) => (
            <WorkoutSessionCard key={session.id} session={session} />
          ))
        ) : (
          <View style={{ backgroundColor: "#ffffff", borderRadius: 24, padding: 16 }}>
            <Text style={{ color: "#64748b", lineHeight: 21 }}>
              No workouts logged yet. Start small when it feels right.
            </Text>
          </View>
        )}
      </View>
    </ScreenWrapper>
  );
}

function formatSleep(minutes: number) {
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = Math.round(minutes % 60);

  return `${hours}h ${remainingMinutes}m`;
}
