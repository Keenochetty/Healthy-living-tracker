import { type Href, router } from "expo-router";

import type { HealthOSExerciseDisplay } from "./HealthOSFitnessTypes";

export function useHealthOSFitnessActions({
  onOpenExercise,
}: {
  onOpenExercise?: (exercise: HealthOSExerciseDisplay) => void;
} = {}) {
  function go(route: Href) {
    router.push(route);
  }

  return {
    addExercise() {
      go("/fitness/library" as Href);
    },
    addToCalendar() {
      go("/(tabs)/calendar");
    },
    addWorkoutNote() {
      go("/fitness/history" as Href);
    },
    buildPlan() {
      go("/fitness/programs" as Href);
    },
    filterByEquipment() {
      go("/fitness/library" as Href);
    },
    filterByMuscle() {
      go("/fitness/body-map" as Href);
    },
    logRun() {
      go("/fitness/history" as Href);
    },
    markExerciseComplete() {
      // UI foundation only. No write in this phase.
    },
    moveExercise() {
      go("/(tabs)/calendar");
    },
    openExercise(exercise: HealthOSExerciseDisplay) {
      onOpenExercise?.(exercise);
    },
    replaceExercise() {
      go("/fitness/library" as Href);
    },
    scanMachine() {
      go("/(tabs)/scan" as Href);
    },
    shareProgress() {
      go("/(tabs)/circle");
    },
    startWorkout() {
      go("/fitness/programs" as Href);
    },
    viewCalendar() {
      go("/(tabs)/calendar");
    },
    viewProgress() {
      go("/fitness/history" as Href);
    },
  };
}

