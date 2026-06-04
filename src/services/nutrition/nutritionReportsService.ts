import { getWorkoutSessions } from "@/lib/fitnessStorage";
import {
  getActiveNutritionTarget,
  getNutritionDailyNote,
  getNutritionEntriesByDate,
  getRecipes,
  getSavedMeals,
  getWaterGoal,
  toNutritionDateKey
} from "@/lib/nutritionStorage";
import { NUTRITION_MEAL_GROUP_OPTIONS } from "@/constants/nutritionOptions";
import type {
  DailyMacroTrend,
  DiaryConsistencyReport,
  GoalProgressReport,
  MostLoggedFood,
  MostUsedMealItem,
  NutritionDiaryEntry,
  NutritionInsight,
  NutritionMealGroup,
  NutritionReportSummary,
  NutritionTarget,
  ReportRange,
  WaterTrendReport,
  WorkoutFoodConnectionReport
} from "@/types/nutrition";

type DayReportData = {
  date: Date;
  dateKey: string;
  entries: NutritionDiaryEntry[];
  hasNote: boolean;
  target: NutritionTarget | null;
  waterCurrentMl: number;
  waterTargetMl: number;
};

const REPORT_DAY_COUNTS: Record<ReportRange, number> = {
  "30_days": 30,
  "7_days": 7,
  today: 1
};

const MEAL_GROUPS = NUTRITION_MEAL_GROUP_OPTIONS.map((option) => option.key);

export function getDateRangeForReport(range: ReportRange) {
  const end = new Date();
  const start = new Date(end);

  start.setDate(end.getDate() - REPORT_DAY_COUNTS[range] + 1);

  return {
    dates: getDatesBetween(start, end),
    endDate: toNutritionDateKey(end),
    startDate: toNutritionDateKey(start)
  };
}

export function calculateAverage(values: number[]) {
  if (!values.length) return 0;

  return values.reduce((total, value) => total + value, 0) / values.length;
}

export function calculateTargetHitRate(
  values: Array<{ target?: number; value: number }>,
  mode: "near" | "at_least" = "near"
) {
  const targetValues = values.filter((item) => item.target && item.target > 0);

  if (!targetValues.length) return undefined;

  const hitCount = targetValues.filter((item) => {
    const ratio = item.value / (item.target ?? 1);

    return mode === "at_least" ? ratio >= 0.8 : ratio >= 0.8 && ratio <= 1.2;
  }).length;

  return Math.round((hitCount / targetValues.length) * 100);
}

export function calculateLoggingConsistency(daysLogged: number, totalDays: number) {
  if (!totalDays) return 0;

  return Math.round((daysLogged / totalDays) * 100);
}

export function calculateMacroTrendData(days: DayReportData[]): DailyMacroTrend[] {
  return days.map((day) => {
    const totals = getEntryTotals(day.entries);

    return {
      calories: totals.calories,
      caloriesTarget: day.target?.caloriesTarget,
      carbsG: totals.carbsG,
      date: day.dateKey,
      fatG: totals.fatG,
      fiberG: totals.fiberG,
      proteinG: totals.proteinG,
      proteinTargetG: day.target?.proteinTargetG,
      waterMl: day.waterCurrentMl,
      waterTargetMl: day.waterTargetMl
    };
  });
}

export function buildInsightMessage(type: NutritionInsight["type"], message: string) {
  return `${message} This is based on your logged nutrition data.`;
}

export async function getNutritionReportSummary(range: ReportRange): Promise<NutritionReportSummary> {
  const days = await getReportDays(range);
  const trends = calculateMacroTrendData(days);
  const daysLogged = days.filter((day) => day.entries.length > 0).length;
  const proteinBest = trends.reduce<DailyMacroTrend | null>(
    (best, trend) => (!best || trend.proteinG > best.proteinG ? trend : best),
    null
  );
  const loggedTrends = trends.filter((trend) => trend.calories > 0 || trend.proteinG > 0);
  const lowLoggingDay = loggedTrends.reduce<DailyMacroTrend | null>(
    (lowest, trend) => (!lowest || trend.calories < lowest.calories ? trend : lowest),
    null
  );
  const workoutsByDate = await getWorkoutDateKeys(days);
  const workoutDaysWithFoodLogs = days.filter(
    (day) => workoutsByDate.has(day.dateKey) && day.entries.length > 0
  ).length;

  return {
    bestProteinDay: proteinBest && proteinBest.proteinG > 0 ? proteinBest.date : undefined,
    caloriesAverage: Math.round(calculateAverage(trends.map((trend) => trend.calories))),
    caloriesTargetAverage: roundedAverageTarget(trends.map((trend) => trend.caloriesTarget)),
    carbsAverageG: Math.round(calculateAverage(trends.map((trend) => trend.carbsG))),
    daysLogged,
    endDate: days[days.length - 1]?.dateKey ?? toNutritionDateKey(new Date()),
    fatAverageG: Math.round(calculateAverage(trends.map((trend) => trend.fatG))),
    fiberAverageG: Math.round(calculateAverage(trends.map((trend) => trend.fiberG))),
    foodLoggingConsistencyPercent: calculateLoggingConsistency(daysLogged, days.length),
    lowLoggingDay: lowLoggingDay?.date,
    mealsLogged: days.reduce((total, day) => total + day.entries.length, 0),
    notesLogged: days.filter((day) => day.hasNote).length,
    proteinAverageG: Math.round(calculateAverage(trends.map((trend) => trend.proteinG))),
    proteinTargetAverageG: roundedAverageTarget(trends.map((trend) => trend.proteinTargetG)),
    range,
    startDate: days[0]?.dateKey ?? toNutritionDateKey(new Date()),
    targetHitRatePercent: calculateTargetHitRate(
      trends.map((trend) => ({ target: trend.caloriesTarget, value: trend.calories }))
    ),
    totalDays: days.length,
    waterAverageMl: Math.round(calculateAverage(trends.map((trend) => trend.waterMl))),
    waterTargetAverageMl: roundedAverageTarget(trends.map((trend) => trend.waterTargetMl)),
    workoutDays: workoutsByDate.size,
    workoutDaysWithFoodLogs
  };
}

export async function getDailyMacroTrends(range: ReportRange) {
  return calculateMacroTrendData(await getReportDays(range));
}

export async function getWaterTrends(range: ReportRange): Promise<WaterTrendReport> {
  const trends = await getDailyMacroTrends(range);
  const bestHydrationDay = trends.reduce<DailyMacroTrend | null>(
    (best, trend) => (!best || trend.waterMl > best.waterMl ? trend : best),
    null
  );

  return {
    averageMl: Math.round(calculateAverage(trends.map((trend) => trend.waterMl))),
    bestHydrationDay: bestHydrationDay && bestHydrationDay.waterMl > 0 ? bestHydrationDay.date : undefined,
    daysUnderTarget: trends.filter((trend) => trend.waterTargetMl && trend.waterMl < trend.waterTargetMl).length,
    targetAverageMl: roundedAverageTarget(trends.map((trend) => trend.waterTargetMl)),
    trends
  };
}

export async function getGoalProgressReport(range: ReportRange): Promise<GoalProgressReport> {
  const [target, trends, workoutConnection] = await Promise.all([
    getActiveNutritionTarget(),
    getDailyMacroTrends(range),
    getWorkoutFoodConnectionReport(range)
  ]);

  if (!target) {
    return {
      goalMessage: "Set nutrition targets to compare your progress.",
      hasTarget: false
    };
  }

  return {
    caloriesConsistencyPercent: calculateTargetHitRate(
      trends.map((trend) => ({ target: trend.caloriesTarget, value: trend.calories }))
    ),
    carbsConsistencyPercent: calculateTargetHitRate(
      trends.map((trend) => ({ target: target.carbsTargetG, value: trend.carbsG }))
    ),
    currentWeightKg: target.currentWeightKg,
    fiberConsistencyPercent: calculateTargetHitRate(
      trends.map((trend) => ({ target: target.fiberTargetG, value: trend.fiberG })),
      "at_least"
    ),
    goalMessage: getGoalReportMessage(target, workoutConnection),
    goalType: target.goalType,
    goalWeightKg: target.goalWeightKg,
    hasTarget: true,
    proteinConsistencyPercent: calculateTargetHitRate(
      trends.map((trend) => ({ target: trend.proteinTargetG, value: trend.proteinG })),
      "at_least"
    ),
    waterConsistencyPercent: calculateTargetHitRate(
      trends.map((trend) => ({ target: trend.waterTargetMl, value: trend.waterMl })),
      "at_least"
    ),
    workoutFoodConsistencyPercent: workoutConnection.workoutDays
      ? Math.round((workoutConnection.workoutDaysWithFoodLogs / workoutConnection.workoutDays) * 100)
      : undefined
  };
}

export async function getDiaryConsistencyReport(range: ReportRange): Promise<DiaryConsistencyReport> {
  const days = await getReportDays(range);
  const mealCounts = new Map<NutritionMealGroup, number>();
  const missedMealGroups = new Set<NutritionMealGroup>();

  MEAL_GROUPS.forEach((group) => mealCounts.set(group, 0));

  days.forEach((day) => {
    const groupsLogged = new Set(day.entries.map((entry) => entry.mealGroup));

    MEAL_GROUPS.forEach((group) => {
      if (groupsLogged.has(group)) {
        mealCounts.set(group, (mealCounts.get(group) ?? 0) + 1);
      } else {
        missedMealGroups.add(group);
      }
    });
  });

  const mostConsistentMealGroup = [...mealCounts.entries()].sort((left, right) => right[1] - left[1])[0]?.[0];

  return {
    currentLoggingStreakDays: calculateCurrentLoggingStreak(days),
    daysLogged: days.filter((day) => day.entries.length > 0).length,
    missedMealGroups: [...missedMealGroups],
    mostConsistentMealGroup,
    totalDays: days.length,
    totalMealsLogged: days.reduce((total, day) => total + day.entries.length, 0)
  };
}

export async function getWorkoutFoodConnectionReport(range: ReportRange): Promise<WorkoutFoodConnectionReport> {
  const days = await getReportDays(range);
  const workoutDateKeys = await getWorkoutDateKeys(days);
  const workoutDays = days.filter((day) => workoutDateKeys.has(day.dateKey));
  const workoutTrends = calculateMacroTrendData(workoutDays);
  const workoutDaysWithFoodLogs = workoutDays.filter((day) => day.entries.length > 0).length;

  if (!workoutDays.length) {
    return {
      hasWorkoutData: false,
      message: "Log workouts to connect food with training.",
      workoutDays: 0,
      workoutDaysWithFoodLogs: 0
    };
  }

  return {
    averageCaloriesOnWorkoutDays: Math.round(calculateAverage(workoutTrends.map((trend) => trend.calories))),
    averageProteinGOnWorkoutDays: Math.round(calculateAverage(workoutTrends.map((trend) => trend.proteinG))),
    averageWaterMlOnWorkoutDays: Math.round(calculateAverage(workoutTrends.map((trend) => trend.waterMl))),
    hasWorkoutData: true,
    message: `Based on your logs, food was logged on ${workoutDaysWithFoodLogs} of ${workoutDays.length} workout days. This may help you spot training-day patterns.`,
    proteinTargetHitPercent: calculateTargetHitRate(
      workoutTrends.map((trend) => ({ target: trend.proteinTargetG, value: trend.proteinG })),
      "at_least"
    ),
    waterTargetHitPercent: calculateTargetHitRate(
      workoutTrends.map((trend) => ({ target: trend.waterTargetMl, value: trend.waterMl })),
      "at_least"
    ),
    workoutDays: workoutDays.length,
    workoutDaysWithFoodLogs
  };
}

export async function getMostLoggedFoods(range: ReportRange): Promise<MostLoggedFood[]> {
  const days = await getReportDays(range);
  const groups = new Map<string, NutritionDiaryEntry[]>();

  days.flatMap((day) => day.entries).forEach((entry) => {
    const key = `${entry.source ?? "manual"}:${entry.sourceFoodId ?? entry.foodName.toLowerCase()}`;
    groups.set(key, [...(groups.get(key) ?? []), entry]);
  });

  return [...groups.values()]
    .map((items) => {
      const latest = items.reduce((nextLatest, item) =>
        new Date(item.createdAt).getTime() > new Date(nextLatest.createdAt).getTime() ? item : nextLatest
      );

      return {
        averageQuantity: Math.round(calculateAverage(items.map((item) => item.quantity)) * 10) / 10,
        averageUnit: latest.unit,
        brand: latest.brand,
        foodName: latest.foodName,
        lastLoggedAt: latest.createdAt,
        source: latest.source,
        timesLogged: items.length
      };
    })
    .sort((left, right) => right.timesLogged - left.timesLogged)
    .slice(0, 8);
}

export async function getMostUsedSavedMeals(range: ReportRange): Promise<MostUsedMealItem[]> {
  const [days, savedMeals, recipes] = await Promise.all([
    getReportDays(range),
    getSavedMeals(),
    getRecipes()
  ]);
  const usage = new Map<string, MostUsedMealItem>();

  days.flatMap((day) => day.entries).forEach((entry) => {
    if (entry.entrySource !== "saved_meal" && entry.entrySource !== "recipe") return;

    const itemType = entry.entrySource;
    const id = entry.sourceRefId;
    const matchingSavedMeal = itemType === "saved_meal" ? savedMeals.find((meal) => meal.id === id) : undefined;
    const matchingRecipe = itemType === "recipe" ? recipes.find((recipe) => recipe.id === id) : undefined;
    const name = matchingSavedMeal?.name ?? matchingRecipe?.name ?? entry.foodName;
    const key = `${itemType}:${id ?? name}`;
    const current = usage.get(key);

    usage.set(key, {
      id,
      itemType,
      name,
      timesUsed: (current?.timesUsed ?? 0) + 1
    });
  });

  return [...usage.values()].sort((left, right) => right.timesUsed - left.timesUsed).slice(0, 6);
}

export async function generateNutritionInsights(range: ReportRange): Promise<NutritionInsight[]> {
  const [summary, water, goal, diary, workout, foods] = await Promise.all([
    getNutritionReportSummary(range),
    getWaterTrends(range),
    getGoalProgressReport(range),
    getDiaryConsistencyReport(range),
    getWorkoutFoodConnectionReport(range),
    getMostLoggedFoods(range)
  ]);
  const now = new Date().toISOString();
  const insights: NutritionInsight[] = [];

  if (summary.daysLogged === 0) {
    insights.push(makeInsight(range, now, "logging", "Start with one log", "Log meals to unlock nutrition reports.", "info"));
  } else if (summary.foodLoggingConsistencyPercent >= 70) {
    insights.push(makeInsight(range, now, "logging", "Steady logging", buildInsightMessage("logging", "Your food diary appears consistent for this range."), "positive"));
  } else {
    insights.push(makeInsight(range, now, "logging", "Diary consistency", buildInsightMessage("logging", "Adding one meal log each day could make these reports more useful."), "info"));
  }

  if (water.trends.every((trend) => trend.waterMl === 0)) {
    insights.push(makeInsight(range, now, "water", "Hydration trend", "Add water logs to see hydration trends.", "info"));
  } else if ((goal.waterConsistencyPercent ?? 0) >= 70) {
    insights.push(makeInsight(range, now, "water", "Hydration pattern", buildInsightMessage("water", "Your logged water intake appears close to your target on many days."), "positive"));
  } else {
    insights.push(makeInsight(range, now, "water", "Hydration pattern", buildInsightMessage("water", "Your logs suggest some days may be below your water target."), "gentle_warning"));
  }

  if (!goal.hasTarget) {
    insights.push(makeInsight(range, now, "goal", "Targets", "Set nutrition targets to compare your progress.", "info"));
  } else if ((goal.proteinConsistencyPercent ?? 0) < 50) {
    insights.push(makeInsight(range, now, "protein", "Protein trend", buildInsightMessage("protein", "Protein appears below your target on several logged days."), "info"));
  }

  if (!workout.hasWorkoutData) {
    insights.push(makeInsight(range, now, "workout_food", "Workout connection", "Log workouts to connect food with training.", "info"));
  } else {
    insights.push(makeInsight(range, now, "workout_food", "Workout connection", workout.message, "info"));
  }

  if (foods[0]) {
    insights.push(makeInsight(range, now, "general", "Most logged food", `${foods[0].foodName} appears most often in this report range.`, "info"));
  }

  if (diary.currentLoggingStreakDays >= 2) {
    insights.push(makeInsight(range, now, "logging", "Current streak", `You have a ${diary.currentLoggingStreakDays}-day food logging streak based on your logs.`, "positive"));
  }

  return insights.slice(0, 6);
}

async function getReportDays(range: ReportRange): Promise<DayReportData[]> {
  const { dates } = getDateRangeForReport(range);
  const activeTarget = await getActiveNutritionTarget();

  return Promise.all(
    dates.map(async (date) => {
      const dateKey = toNutritionDateKey(date);
      const [entries, note, waterGoal] = await Promise.all([
        getNutritionEntriesByDate(dateKey),
        getNutritionDailyNote(dateKey),
        getWaterGoal(date)
      ]);

      return {
        date,
        dateKey,
        entries,
        hasNote: Boolean(note?.note.trim()),
        target: activeTarget,
        waterCurrentMl: waterGoal.currentMl,
        waterTargetMl: waterGoal.targetMl
      };
    })
  );
}

async function getWorkoutDateKeys(days: DayReportData[]) {
  const validDateKeys = new Set(days.map((day) => day.dateKey));
  const sessions = await getWorkoutSessions();

  return new Set(
    sessions
      .filter((session) => validDateKeys.has(toNutritionDateKey(new Date(session.startedAt))))
      .map((session) => toNutritionDateKey(new Date(session.startedAt)))
  );
}

function getEntryTotals(entries: NutritionDiaryEntry[]) {
  return entries.reduce(
    (totals, entry) => ({
      calories: totals.calories + entry.calories,
      carbsG: totals.carbsG + entry.carbsG,
      fatG: totals.fatG + entry.fatG,
      fiberG: totals.fiberG + (entry.fiberG ?? 0),
      proteinG: totals.proteinG + entry.proteinG
    }),
    {
      calories: 0,
      carbsG: 0,
      fatG: 0,
      fiberG: 0,
      proteinG: 0
    }
  );
}

function getDatesBetween(start: Date, end: Date) {
  const dates: Date[] = [];
  const current = new Date(start);

  current.setHours(12, 0, 0, 0);

  while (toNutritionDateKey(current) <= toNutritionDateKey(end)) {
    dates.push(new Date(current));
    current.setDate(current.getDate() + 1);
  }

  return dates;
}

function roundedAverageTarget(values: Array<number | undefined>) {
  const validValues = values.filter((value): value is number => value !== undefined && value > 0);

  if (!validValues.length) return undefined;

  return Math.round(calculateAverage(validValues));
}

function calculateCurrentLoggingStreak(days: DayReportData[]) {
  let streak = 0;

  for (const day of [...days].reverse()) {
    if (!day.entries.length) break;
    streak += 1;
  }

  return streak;
}

function getGoalReportMessage(target: NutritionTarget, workoutConnection: WorkoutFoodConnectionReport) {
  switch (target.goalType) {
    case "lose_weight":
      return "For your weight goal, calories, protein, water, and steady logging are the main comparison points.";
    case "gain_muscle":
      return "For muscle gain, this report focuses on protein consistency and whether workout days have food logs.";
    case "improve_running":
      return "For running, this report looks at carbs, hydration, and logged food around workout days.";
    case "workout_recovery":
      return "For workout recovery, protein, hydration, and balanced energy are the main comparison points.";
    case "maintain_weight":
      return "For maintenance, this report checks whether calories and macros appear steady across your logs.";
    case "custom":
      return "For your custom goal, this report compares your logs against the targets you saved.";
    default:
      return workoutConnection.hasWorkoutData
        ? "For general health, this report compares fiber, water, macro balance, and workout-day logs."
        : "For general health, this report compares fiber, water, and macro balance.";
  }
}

function makeInsight(
  range: ReportRange,
  now: string,
  type: NutritionInsight["type"],
  title: string,
  message: string,
  severity: NutritionInsight["severity"]
): NutritionInsight {
  return {
    createdAt: now,
    dateRange: range,
    id: `insight-${type}-${title.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`,
    message,
    severity,
    title,
    type
  };
}
