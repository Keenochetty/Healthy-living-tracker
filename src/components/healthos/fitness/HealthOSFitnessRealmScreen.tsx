import { useState } from "react";
import { ScrollView, StyleSheet, Text, useColorScheme, View } from "react-native";

import { HealthOSCard } from "@/components/healthos/HealthOSCard";
import { HealthOSAppShell } from "@/components/healthos/shell/HealthOSAppShell";
import {
  getHealthOSPalette,
  healthOSLayout,
  healthOSSafeArea,
  healthOSSpacing,
  healthOSTypography,
  type HealthOSColorMode,
} from "@/theme/healthos";

import { HealthOSExerciseDetailSheet } from "./HealthOSExerciseDetailSheet";
import { HealthOSFitnessHeader } from "./HealthOSFitnessHeader";
import { HealthOSFitnessProgressHero } from "./HealthOSFitnessProgressHero";
import { HealthOSFitnessProgressSection } from "./HealthOSFitnessProgressSection";
import { HealthOSFitnessQuickActions } from "./HealthOSFitnessQuickActions";
import { HealthOSFitnessSharingCard } from "./HealthOSFitnessSharingCard";
import { HealthOSFitnessStatCards } from "./HealthOSFitnessStatCards";
import { HealthOSFitnessWeekStrip } from "./HealthOSFitnessWeekStrip";
import type { HealthOSExerciseDisplay } from "./HealthOSFitnessTypes";
import { HealthOSMuscleMapPreview } from "./HealthOSMuscleMapPreview";
import { HealthOSTodaysWorkoutPlan } from "./HealthOSTodaysWorkoutPlan";
import { HealthOSWorkoutBuilderCard } from "./HealthOSWorkoutBuilderCard";
import { useHealthOSFitnessActions } from "./useHealthOSFitnessActions";
import { useHealthOSFitnessData } from "./useHealthOSFitnessData";

export function HealthOSFitnessRealmScreen() {
  const mode: HealthOSColorMode = useColorScheme() === "dark" ? "dark" : "light";
  const palette = getHealthOSPalette(mode);
  const fitness = useHealthOSFitnessData();
  const [selectedExercise, setSelectedExercise] =
    useState<HealthOSExerciseDisplay | null>(null);
  const [workoutMenuVisible, setWorkoutMenuVisible] = useState(false);
  const actions = useHealthOSFitnessActions({
    onOpenExercise: setSelectedExercise,
  });

  return (
    <HealthOSAppShell
      activeNavKey="health"
      showAICommandBar={false}
      showBottomNav={false}
      subtitle="Training planner"
      title="Fitness"
      withBottomNavSpace={false}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.content}>
          <HealthOSFitnessHeader
            activeGoal={fitness.activeGoal}
            onManageGoal={actions.buildPlan}
          />
          {fitness.error ? (
            <HealthOSCard variant="danger">
              <Text style={[healthOSTypography.bodySmall, { color: palette.danger }]}>
                {fitness.error}
              </Text>
            </HealthOSCard>
          ) : null}
          <HealthOSFitnessWeekStrip
            days={fitness.weekDays}
            onLongPressDate={actions.viewCalendar}
            onSelectDate={fitness.setSelectedDate}
            selectedDate={fitness.selectedDate}
          />
          <HealthOSFitnessProgressHero
            legendItems={fitness.legendItems}
            note={fitness.todayProgress.statusNote}
            percent={fitness.todayProgress.percent}
            segments={fitness.progressSegments}
          />
          <HealthOSFitnessStatCards stats={fitness.statCards} />
          <HealthOSFitnessQuickActions
            onAddExercise={actions.addExercise}
            onBuildPlan={actions.buildPlan}
            onLogRun={actions.logRun}
            onScanMachine={actions.scanMachine}
            onShareProgress={actions.shareProgress}
            onStartWorkout={actions.startWorkout}
            onViewProgress={actions.viewProgress}
          />
          <HealthOSTodaysWorkoutPlan
            menuVisible={workoutMenuVisible}
            onAddToCalendar={actions.addToCalendar}
            onBuildPlan={actions.buildPlan}
            onCloseMenu={() => setWorkoutMenuVisible(false)}
            onExerciseLongPress={setSelectedExercise}
            onExercisePress={actions.openExercise}
            onMove={actions.moveExercise}
            onScanMachine={actions.scanMachine}
            onShare={actions.shareProgress}
            onStart={actions.startWorkout}
            onWorkoutLongPress={() => setWorkoutMenuVisible(true)}
            workout={fitness.todaysWorkout}
          />
          <HealthOSMuscleMapPreview
            muscles={fitness.muscleStatus}
            onFilter={actions.filterByMuscle}
          />
          <HealthOSWorkoutBuilderCard onBuildWorkout={actions.buildPlan} />
          <HealthOSCard
            subtitle="At the gym? Scan a machine to find matching exercises later."
            title="Scan machine"
            variant="compact"
          >
            <Text style={[healthOSTypography.bodySmall, { color: palette.softText }]}>
              Machine recognition is pending. This opens Scan safely for now.
            </Text>
          </HealthOSCard>
          <HealthOSFitnessProgressSection onViewProgress={actions.viewProgress} />
          <HealthOSFitnessSharingCard
            onAddToCalendar={actions.addToCalendar}
            onShareProgress={actions.shareProgress}
            onViewCalendar={actions.viewCalendar}
          />
        </View>
      </ScrollView>
      <HealthOSExerciseDetailSheet
        exercise={selectedExercise}
        onAddToPlan={actions.addExercise}
        onClose={() => setSelectedExercise(null)}
        onMarkComplete={actions.markExerciseComplete}
        onReplace={actions.replaceExercise}
        onSchedule={actions.addToCalendar}
      />
    </HealthOSAppShell>
  );
}

const styles = StyleSheet.create({
  content: {
    alignSelf: "center",
    gap: healthOSSpacing.lg,
    maxWidth: healthOSLayout.screenMaxWidth,
    paddingHorizontal: healthOSSafeArea.screenHorizontal,
    width: "100%",
  },
  scrollContent: {
    paddingBottom: healthOSSafeArea.bottomNavSpace + healthOSSpacing.xl,
  },
});

