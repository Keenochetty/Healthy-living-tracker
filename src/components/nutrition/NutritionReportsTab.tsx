import { useCallback, useEffect, useState } from "react";
import { Text, TouchableOpacity, View } from "react-native";

import { AppCard } from "@/components/ui/AppCard";
import { getMealTypeOption } from "@/constants/nutritionOptions";
import { getNutritionBiometricInsights } from "@/lib/biometricsStorage";
import {
  generateNutritionInsights,
  getDailyMacroTrends,
  getDiaryConsistencyReport,
  getGoalProgressReport,
  getMostLoggedFoods,
  getMostUsedSavedMeals,
  getNutritionReportSummary,
  getWaterTrends,
  getWorkoutFoodConnectionReport
} from "@/services/nutrition/nutritionReportsService";
import type {
  DailyMacroTrend,
  DiaryConsistencyReport,
  GoalProgressReport,
  MostLoggedFood,
  MostUsedMealItem,
  NutritionInsight,
  NutritionReportSummary,
  ReportRange,
  WaterTrendReport,
  WorkoutFoodConnectionReport
} from "@/types/nutrition";
import type { BiometricsInsight } from "@/types/biometrics";

type ReportsState = {
  diaryConsistency: DiaryConsistencyReport;
  biometricInsights: BiometricsInsight[];
  goalProgress: GoalProgressReport;
  insights: NutritionInsight[];
  macroTrends: DailyMacroTrend[];
  mostLoggedFoods: MostLoggedFood[];
  mostUsedMeals: MostUsedMealItem[];
  summary: NutritionReportSummary;
  waterTrends: WaterTrendReport;
  workoutFood: WorkoutFoodConnectionReport;
};

const RANGES: Array<{ key: ReportRange; label: string }> = [
  { key: "today", label: "Today" },
  { key: "7_days", label: "7 Days" },
  { key: "30_days", label: "30 Days" }
];

export function NutritionReportsTab() {
  const [range, setRange] = useState<ReportRange>("today");
  const [reports, setReports] = useState<ReportsState | null>(null);
  const [loading, setLoading] = useState(true);
  const [exportMessage, setExportMessage] = useState<string | null>(null);

  const loadReports = useCallback(async () => {
    setLoading(true);
    setExportMessage(null);

    const [
      summary,
      macroTrends,
      waterTrends,
      goalProgress,
      diaryConsistency,
      workoutFood,
      mostLoggedFoods,
      mostUsedMeals,
      insights,
      biometricInsights
    ] = await Promise.all([
      getNutritionReportSummary(range),
      getDailyMacroTrends(range),
      getWaterTrends(range),
      getGoalProgressReport(range),
      getDiaryConsistencyReport(range),
      getWorkoutFoodConnectionReport(range),
      getMostLoggedFoods(range),
      getMostUsedSavedMeals(range),
      generateNutritionInsights(range),
      getNutritionBiometricInsights()
    ]);

    setReports({
      biometricInsights,
      diaryConsistency,
      goalProgress,
      insights,
      macroTrends,
      mostLoggedFoods,
      mostUsedMeals,
      summary,
      waterTrends,
      workoutFood
    });
    setLoading(false);
  }, [range]);

  useEffect(() => {
    Promise.resolve()
      .then(loadReports)
      .catch(() => {
        setReports(null);
        setLoading(false);
      });
  }, [loadReports]);

  if (loading) {
    return (
      <AppCard>
        <Text style={{ color: "#64748b", lineHeight: 21 }}>Loading nutrition reports...</Text>
      </AppCard>
    );
  }

  if (!reports) {
    return (
      <AppCard backgroundColor="#fff7ed">
        <Text style={{ color: "#9a3412", lineHeight: 21 }}>
          Reports are unavailable right now. Your logs are still saved locally.
        </Text>
      </AppCard>
    );
  }

  return (
    <View style={{ gap: 14 }}>
      <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
        {RANGES.map((option) => (
          <TouchableOpacity
            activeOpacity={0.85}
            key={option.key}
            onPress={() => setRange(option.key)}
            style={{
              backgroundColor: range === option.key ? "#f59e0b" : "#ffffff",
              borderColor: "#fde68a",
              borderRadius: 999,
              borderWidth: 1,
              paddingHorizontal: 14,
              paddingVertical: 10
            }}
          >
            <Text style={{ color: range === option.key ? "#ffffff" : "#92400e", fontWeight: "900" }}>
              {option.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <TodaySummaryCard summary={reports.summary} />
      <RangeSummaryCard summary={reports.summary} />
      <MacroTrendsCard trends={reports.macroTrends} />
      <WaterTrendsCard report={reports.waterTrends} />
      <GoalProgressCard report={reports.goalProgress} />
      <BiometricInsightsCard insights={reports.biometricInsights} />
      <WorkoutFoodCard report={reports.workoutFood} />
      <DiaryConsistencyCard report={reports.diaryConsistency} />
      <InsightsCard insights={reports.insights} />
      <MostLoggedFoodsCard foods={reports.mostLoggedFoods} />
      <MealUsageCard meals={reports.mostUsedMeals} />

      <AppCard>
        <View style={{ gap: 10 }}>
          <Text style={{ color: "#0f172a", fontSize: 20, fontWeight: "900" }}>Export Report</Text>
          <Text style={{ color: "#64748b", lineHeight: 21 }}>
            {exportMessage ?? "Create a nutrition report export later from this view."}
          </Text>
          <ReportButton
            label="Export Report"
            onPress={() => setExportMessage("Exporting reports will be added in a later phase.")}
          />
        </View>
      </AppCard>

      <Text style={{ color: "#64748b", fontSize: 12, lineHeight: 18 }}>
        Reports are based on the information you log and are for general wellness tracking only.
        They are not medical advice. For medical conditions, pregnancy, children, medication
        concerns, or eating concerns, speak to a healthcare professional.
      </Text>
    </View>
  );
}

function BiometricInsightsCard({ insights }: { insights: BiometricsInsight[] }) {
  return (
    <AppCard backgroundColor="#f8fafc">
      <View style={{ gap: 12 }}>
        <SectionHeader subtitle="Weight, sleep, energy and symptoms" title="Biometrics Connection" />
        {insights.length ? (
          insights.map((insight) => (
            <View key={`${insight.type}-${insight.title}`} style={{ backgroundColor: "#ffffff", borderRadius: 16, padding: 12 }}>
              <Text style={{ color: "#0f172a", fontWeight: "900" }}>{insight.title}</Text>
              <Text style={{ color: "#64748b", lineHeight: 20, marginTop: 4 }}>{insight.message}</Text>
            </View>
          ))
        ) : (
          <EmptyText text="Add biometric logs to compare body, recovery and symptom patterns with nutrition reports." />
        )}
      </View>
    </AppCard>
  );
}

function TodaySummaryCard({ summary }: { summary: NutritionReportSummary }) {
  const isToday = summary.range === "today";

  return (
    <AppCard>
      <View style={{ gap: 12 }}>
        <SectionHeader subtitle={`${summary.startDate} to ${summary.endDate}`} title="Today Summary" />
        {!summary.daysLogged ? (
          <EmptyText text="Log meals to unlock nutrition reports." />
        ) : null}
        <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 10 }}>
          <MetricTile
            label="Calories"
            value={formatTargetValue(summary.caloriesAverage, summary.caloriesTargetAverage, "kcal")}
          />
          <MetricTile
            label="Protein"
            value={formatTargetValue(summary.proteinAverageG, summary.proteinTargetAverageG, "g")}
          />
          <MetricTile label="Carbs" value={`${summary.carbsAverageG} g`} />
          <MetricTile label="Fat" value={`${summary.fatAverageG} g`} />
          <MetricTile label="Fiber" value={`${summary.fiberAverageG} g`} />
          <MetricTile
            label="Water"
            value={formatTargetValue(summary.waterAverageMl, summary.waterTargetAverageMl, "ml")}
          />
          <MetricTile label="Meals" value={`${summary.mealsLogged}`} />
          <MetricTile label="Note" value={summary.notesLogged ? "Logged" : "No note"} />
        </View>
        {!isToday ? (
          <Text style={{ color: "#64748b", lineHeight: 21 }}>
            This card shows daily averages for the selected range.
          </Text>
        ) : null}
      </View>
    </AppCard>
  );
}

function RangeSummaryCard({ summary }: { summary: NutritionReportSummary }) {
  return (
    <AppCard backgroundColor="#fffbeb">
      <View style={{ gap: 12 }}>
        <SectionHeader subtitle={`${summary.totalDays} day${summary.totalDays === 1 ? "" : "s"}`} title="Range Summary" />
        <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 10 }}>
          <MetricTile label="Days logged" value={`${summary.daysLogged} / ${summary.totalDays}`} />
          <MetricTile label="Consistency" value={`${summary.foodLoggingConsistencyPercent}%`} />
          <MetricTile label="Meals logged" value={`${summary.mealsLogged}`} />
          <MetricTile label="Target near-hit" value={formatOptionalPercent(summary.targetHitRatePercent)} />
          <MetricTile label="Best protein day" value={summary.bestProteinDay ?? "No data"} />
          <MetricTile label="Low logging day" value={summary.lowLoggingDay ?? "No data"} />
        </View>
      </View>
    </AppCard>
  );
}

function MacroTrendsCard({ trends }: { trends: DailyMacroTrend[] }) {
  const hasMeals = trends.some((trend) => trend.calories > 0 || trend.proteinG > 0);

  return (
    <AppCard>
      <View style={{ gap: 12 }}>
        <SectionHeader subtitle="Daily totals" title="Macro Trends" />
        {hasMeals ? (
          <>
            <MiniBarChart color="#f59e0b" label="Calories" suffix="kcal" values={trends.map((trend) => ({ label: shortDate(trend.date), value: trend.calories }))} />
            <MiniBarChart color="#22c55e" label="Protein" suffix="g" values={trends.map((trend) => ({ label: shortDate(trend.date), value: trend.proteinG }))} />
            <MiniBarChart color="#3b82f6" label="Carbs" suffix="g" values={trends.map((trend) => ({ label: shortDate(trend.date), value: trend.carbsG }))} />
            <MiniBarChart color="#a855f7" label="Fat" suffix="g" values={trends.map((trend) => ({ label: shortDate(trend.date), value: trend.fatG }))} />
            <MiniBarChart color="#14b8a6" label="Fiber" suffix="g" values={trends.map((trend) => ({ label: shortDate(trend.date), value: trend.fiberG }))} />
          </>
        ) : (
          <EmptyText text="Log meals to unlock nutrition reports." />
        )}
      </View>
    </AppCard>
  );
}

function WaterTrendsCard({ report }: { report: WaterTrendReport }) {
  const hasWater = report.trends.some((trend) => trend.waterMl > 0);

  return (
    <AppCard backgroundColor="#eff6ff">
      <View style={{ gap: 12 }}>
        <SectionHeader subtitle={`${report.daysUnderTarget} day${report.daysUnderTarget === 1 ? "" : "s"} under target`} title="Water Trends" />
        {hasWater ? (
          <>
            <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 10 }}>
              <MetricTile label="Average" value={formatWater(report.averageMl)} />
              <MetricTile label="Target" value={report.targetAverageMl ? formatWater(report.targetAverageMl) : "No target"} />
              <MetricTile label="Best day" value={report.bestHydrationDay ?? "No data"} />
            </View>
            <MiniBarChart color="#3b82f6" label="Water" suffix="ml" values={report.trends.map((trend) => ({ label: shortDate(trend.date), value: trend.waterMl }))} />
          </>
        ) : (
          <EmptyText text="Add water logs to see hydration trends." />
        )}
      </View>
    </AppCard>
  );
}

function GoalProgressCard({ report }: { report: GoalProgressReport }) {
  if (!report.hasTarget) {
    return (
      <AppCard>
        <SectionHeader subtitle="Targets" title="Goal Progress" />
        <EmptyText text="Set nutrition targets to compare your progress." />
      </AppCard>
    );
  }

  return (
    <AppCard>
      <View style={{ gap: 12 }}>
        <SectionHeader subtitle={formatGoalType(report.goalType)} title="Goal Progress" />
        <Text style={{ color: "#64748b", lineHeight: 21 }}>{report.goalMessage}</Text>
        <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 10 }}>
          <MetricTile label="Calories" value={formatOptionalPercent(report.caloriesConsistencyPercent)} />
          <MetricTile label="Protein" value={formatOptionalPercent(report.proteinConsistencyPercent)} />
          <MetricTile label="Carbs" value={formatOptionalPercent(report.carbsConsistencyPercent)} />
          <MetricTile label="Fiber" value={formatOptionalPercent(report.fiberConsistencyPercent)} />
          <MetricTile label="Water" value={formatOptionalPercent(report.waterConsistencyPercent)} />
          <MetricTile label="Workout food" value={formatOptionalPercent(report.workoutFoodConsistencyPercent)} />
          <MetricTile label="Goal weight" value={formatWeightProgress(report.currentWeightKg, report.goalWeightKg)} />
        </View>
      </View>
    </AppCard>
  );
}

function WorkoutFoodCard({ report }: { report: WorkoutFoodConnectionReport }) {
  return (
    <AppCard backgroundColor="#f0fdf4">
      <View style={{ gap: 12 }}>
        <SectionHeader subtitle="Correlation only" title="Workout + Food Connection" />
        {!report.hasWorkoutData ? (
          <EmptyText text="Log workouts to connect food with training." />
        ) : (
          <>
            <Text style={{ color: "#166534", lineHeight: 21 }}>{report.message}</Text>
            <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 10 }}>
              <MetricTile label="Workout days" value={`${report.workoutDays}`} />
              <MetricTile label="With food logs" value={`${report.workoutDaysWithFoodLogs}`} />
              <MetricTile label="Avg protein" value={formatOptionalNumber(report.averageProteinGOnWorkoutDays, "g")} />
              <MetricTile label="Avg water" value={report.averageWaterMlOnWorkoutDays ? formatWater(report.averageWaterMlOnWorkoutDays) : "No data"} />
              <MetricTile label="Protein target" value={formatOptionalPercent(report.proteinTargetHitPercent)} />
              <MetricTile label="Water target" value={formatOptionalPercent(report.waterTargetHitPercent)} />
            </View>
          </>
        )}
      </View>
    </AppCard>
  );
}

function DiaryConsistencyCard({ report }: { report: DiaryConsistencyReport }) {
  return (
    <AppCard>
      <View style={{ gap: 12 }}>
        <SectionHeader subtitle="Food diary" title="Diary Consistency" />
        <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 10 }}>
          <MetricTile label="Days logged" value={`${report.daysLogged} / ${report.totalDays}`} />
          <MetricTile label="Meals logged" value={`${report.totalMealsLogged}`} />
          <MetricTile
            label="Top meal"
            value={report.mostConsistentMealGroup ? getMealTypeOption(report.mostConsistentMealGroup).label : "No data"}
          />
          <MetricTile label="Streak" value={`${report.currentLoggingStreakDays} day${report.currentLoggingStreakDays === 1 ? "" : "s"}`} />
        </View>
        <Text style={{ color: "#64748b", lineHeight: 21 }}>
          Missed groups: {report.missedMealGroups.length ? report.missedMealGroups.map((group) => getMealTypeOption(group).label).join(", ") : "None in this range"}
        </Text>
      </View>
    </AppCard>
  );
}

function InsightsCard({ insights }: { insights: NutritionInsight[] }) {
  return (
    <AppCard>
      <View style={{ gap: 12 }}>
        <SectionHeader subtitle="Rule-based, non-medical" title="Nutrition Insights" />
        {insights.map((insight) => (
          <View
            key={insight.id}
            style={{
              backgroundColor: getInsightBackground(insight.severity),
              borderRadius: 16,
              gap: 4,
              padding: 12
            }}
          >
            <Text style={{ color: "#0f172a", fontWeight: "900" }}>{insight.title}</Text>
            <Text style={{ color: "#64748b", lineHeight: 20 }}>{insight.message}</Text>
          </View>
        ))}
      </View>
    </AppCard>
  );
}

function MostLoggedFoodsCard({ foods }: { foods: MostLoggedFood[] }) {
  return (
    <AppCard>
      <View style={{ gap: 12 }}>
        <SectionHeader subtitle="All diary sources" title="Most Logged Foods" />
        {foods.length ? (
          foods.map((food) => (
            <ReportListRow
              key={`${food.source ?? "manual"}-${food.foodName}`}
              meta={`${food.timesLogged} log${food.timesLogged === 1 ? "" : "s"} - avg ${food.averageQuantity ?? 0} ${food.averageUnit ?? ""}`}
              title={food.brand ? `${food.foodName} (${food.brand})` : food.foodName}
            />
          ))
        ) : (
          <EmptyText text="Log meals to unlock nutrition reports." />
        )}
      </View>
    </AppCard>
  );
}

function MealUsageCard({ meals }: { meals: MostUsedMealItem[] }) {
  return (
    <AppCard>
      <View style={{ gap: 12 }}>
        <SectionHeader subtitle="Saved meal and recipe diary use" title="Favourite Meals / Recipes" />
        {meals.length ? (
          meals.map((meal) => (
            <ReportListRow
              key={`${meal.itemType}-${meal.id ?? meal.name}`}
              meta={`${meal.itemType === "recipe" ? "Recipe" : "Saved meal"} - ${meal.timesUsed} use${meal.timesUsed === 1 ? "" : "s"}`}
              title={meal.name}
            />
          ))
        ) : (
          <EmptyText text="Saved meals and recipes you log will appear here." />
        )}
      </View>
    </AppCard>
  );
}

function SectionHeader({ subtitle, title }: { subtitle?: string; title: string }) {
  return (
    <View style={{ gap: 3 }}>
      <Text style={{ color: "#0f172a", fontSize: 20, fontWeight: "900" }}>{title}</Text>
      {subtitle ? <Text style={{ color: "#64748b", lineHeight: 20 }}>{subtitle}</Text> : null}
    </View>
  );
}

function MetricTile({ label, value }: { label: string; value: string }) {
  return (
    <View
      style={{
        backgroundColor: "#ffffff",
        borderColor: "#fde68a",
        borderRadius: 16,
        borderWidth: 1,
        flexGrow: 1,
        minWidth: "45%",
        padding: 12
      }}
    >
      <Text style={{ color: "#92400e", fontSize: 12, fontWeight: "900" }}>{label}</Text>
      <Text style={{ color: "#0f172a", fontSize: 17, fontWeight: "900", marginTop: 4 }}>
        {value}
      </Text>
    </View>
  );
}

function MiniBarChart({
  color,
  label,
  suffix,
  values
}: {
  color: string;
  label: string;
  suffix: string;
  values: Array<{ label: string; value: number }>;
}) {
  const maxValue = Math.max(...values.map((item) => item.value), 1);

  return (
    <View style={{ gap: 8 }}>
      <Text style={{ color: "#0f172a", fontWeight: "900" }}>{label}</Text>
      <View style={{ flexDirection: "row", gap: 5, minHeight: 120 }}>
        {values.map((item, index) => {
          const height = Math.max(6, Math.round((item.value / maxValue) * 92));

          return (
            <View
              key={`${item.label}-${index}`}
              style={{ alignItems: "center", flex: 1, gap: 5, justifyContent: "flex-end", minWidth: 8 }}
            >
              <Text style={{ color: "#64748b", fontSize: 10 }}>{Math.round(item.value)}</Text>
              <View
                style={{
                  backgroundColor: color,
                  borderRadius: 999,
                  height,
                  opacity: item.value > 0 ? 1 : 0.25,
                  width: "100%"
                }}
              />
              <Text style={{ color: "#94a3b8", fontSize: 9 }}>{values.length > 10 ? "" : item.label}</Text>
            </View>
          );
        })}
      </View>
      <Text style={{ color: "#94a3b8", fontSize: 12 }}>{suffix}</Text>
    </View>
  );
}

function ReportListRow({ meta, title }: { meta: string; title: string }) {
  return (
    <View
      style={{
        backgroundColor: "#f8fafc",
        borderRadius: 16,
        gap: 3,
        padding: 12
      }}
    >
      <Text style={{ color: "#0f172a", fontWeight: "900" }}>{title}</Text>
      <Text style={{ color: "#64748b" }}>{meta}</Text>
    </View>
  );
}

function EmptyText({ text }: { text: string }) {
  return <Text style={{ color: "#64748b", lineHeight: 21 }}>{text}</Text>;
}

function ReportButton({ label, onPress }: { label: string; onPress: () => void }) {
  return (
    <TouchableOpacity
      activeOpacity={0.85}
      onPress={onPress}
      style={{
        alignItems: "center",
        backgroundColor: "#f59e0b",
        borderRadius: 18,
        justifyContent: "center",
        minHeight: 50,
        paddingHorizontal: 14
      }}
    >
      <Text style={{ color: "#ffffff", fontWeight: "900" }}>{label}</Text>
    </TouchableOpacity>
  );
}

function formatTargetValue(value: number, target: number | undefined, unit: string) {
  return target ? `${Math.round(value)} / ${Math.round(target)} ${unit}` : `${Math.round(value)} ${unit}`;
}

function formatOptionalNumber(value: number | undefined, unit: string) {
  return value === undefined ? "No data" : `${Math.round(value)} ${unit}`;
}

function formatOptionalPercent(value: number | undefined) {
  return value === undefined ? "No target" : `${value}%`;
}

function formatWater(amountMl: number) {
  return amountMl >= 1000 ? `${(amountMl / 1000).toFixed(1)} L` : `${Math.round(amountMl)} ml`;
}

function formatWeightProgress(currentWeightKg?: number, goalWeightKg?: number) {
  if (!currentWeightKg || !goalWeightKg) return "Not set";

  return `${currentWeightKg} kg -> ${goalWeightKg} kg`;
}

function formatGoalType(goalType: GoalProgressReport["goalType"]) {
  if (!goalType) return "No target";

  return goalType
    .split("_")
    .map((word) => word[0].toUpperCase() + word.slice(1))
    .join(" ");
}

function shortDate(dateKey: string) {
  const [, month, day] = dateKey.split("-");

  return `${month}/${day}`;
}

function getInsightBackground(severity: NutritionInsight["severity"]) {
  switch (severity) {
    case "positive":
      return "#ecfdf5";
    case "gentle_warning":
      return "#fff7ed";
    default:
      return "#f8fafc";
  }
}
