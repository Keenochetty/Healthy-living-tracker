import { Href, router, useLocalSearchParams } from "expo-router";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Image, Text, TextInput, TouchableOpacity, View } from "react-native";

import { ScreenWrapper } from "@/components/layout/ScreenWrapper";
import { NutritionReportsTab } from "@/components/nutrition/NutritionReportsTab";
import { NutritionTargetsTab } from "@/components/nutrition/NutritionTargetsTab";
import { AppCard } from "@/components/ui/AppCard";
import { NUTRITION_MEAL_GROUP_OPTIONS, QUICK_WATER_AMOUNTS } from "@/constants/nutritionOptions";
import {
  addWaterLog,
  createNutritionEntry,
  deleteNutritionEntry,
  getNutritionDailyNote,
  getNutritionEntriesByDate,
  getCommonFoodResults,
  getFavouriteFoods,
  calculateDailyNutritionProgress,
  calculateTargetProgressPercent,
  formatMacroProgress,
  getActiveNutritionTarget,
  getNutritionGoalMessage,
  getCustomFoods,
  getRecipes,
  getRecentFoods,
  getSavedMeals,
  getTodayNutritionSummary,
  getWaterGoal,
  saveNutritionDailyNote,
  setWaterGoal,
  toNutritionDateKey
} from "@/lib/nutritionStorage";
import { searchFoods } from "@/services/nutrition/foodSearchService";
import { getRecentlyScannedProducts } from "@/services/nutrition/barcodeLookupService";
import { getSmartFoodSuggestionsForToday } from "@/services/nutrition/smartLoggingService";
import { getNutritionBiometricInsights } from "@/lib/biometricsStorage";
import { getMedicationSupplementFoodTimingSummary } from "@/lib/medicationSupplementStorage";
import type { BiometricsInsight } from "@/types/biometrics";
import type { SmartFoodSuggestion } from "@/types/smartLogging";
import type {
  DailyNutritionSummary,
  DailyNutritionProgress,
  FavouriteFood,
  CustomFood,
  FoodSearchResult,
  FoodSource,
  NutritionDailyNote,
  NutritionDiaryEntry,
  NutritionMealGroup,
  NutritionTarget,
  Recipe,
  RecentFood,
  RecentlyScannedProduct,
  SavedMeal,
  WaterGoal
} from "@/types/nutrition";

type NutritionTab = "today" | "diary" | "add" | "library" | "targets" | "reports" | "water" | "notes";

const TABS: Array<{ key: NutritionTab; label: string }> = [
  { key: "today", label: "Today" },
  { key: "diary", label: "Diary" },
  { key: "add", label: "Add" },
  { key: "library", label: "Library" },
  { key: "targets", label: "Targets" },
  { key: "reports", label: "Reports" },
  { key: "water", label: "Water" },
  { key: "notes", label: "Notes" }
];

const INPUT_STYLE = {
  backgroundColor: "#ffffff",
  borderColor: "#fde68a",
  borderRadius: 16,
  borderWidth: 1,
  color: "#0f172a",
  minHeight: 50,
  paddingHorizontal: 14
};

export default function FoodScreen() {
  const params = useLocalSearchParams<{ tab?: NutritionTab }>();
  const [activeTab, setActiveTab] = useState<NutritionTab>(params.tab ?? "today");
  const [entries, setEntries] = useState<NutritionDiaryEntry[]>([]);
  const [summary, setSummary] = useState<DailyNutritionSummary | null>(null);
  const [waterGoal, setWaterGoalState] = useState<WaterGoal | null>(null);
  const [dailyNote, setDailyNote] = useState<NutritionDailyNote | null>(null);
  const [activeTarget, setActiveTarget] = useState<NutritionTarget | null>(null);
  const [dailyProgress, setDailyProgress] = useState<DailyNutritionProgress | null>(null);
  const [biometricInsights, setBiometricInsights] = useState<BiometricsInsight[]>([]);
  const [smartSuggestions, setSmartSuggestions] = useState<SmartFoodSuggestion[]>([]);
  const [foodTimingMessage, setFoodTimingMessage] = useState<string | null>(null);
  const [selectedMealGroup, setSelectedMealGroup] = useState<NutritionMealGroup>("breakfast");

  const todayKey = useMemo(() => toNutritionDateKey(new Date()), []);

  const loadNutrition = useCallback(async () => {
    const [nextEntries, nextSummary, nextWaterGoal, nextDailyNote, nextTarget, nextProgress, nextBiometricInsights, nextSmartSuggestions, nextFoodTimingSummary] = await Promise.all([
      getNutritionEntriesByDate(todayKey),
      getTodayNutritionSummary(),
      getWaterGoal(new Date()),
      getNutritionDailyNote(todayKey),
      getActiveNutritionTarget(),
      calculateDailyNutritionProgress(todayKey),
      getNutritionBiometricInsights(),
      getSmartFoodSuggestionsForToday(),
      getMedicationSupplementFoodTimingSummary()
    ]);

    setEntries(nextEntries);
    setSummary(nextSummary);
    setWaterGoalState(nextWaterGoal);
    setDailyNote(nextDailyNote);
    setActiveTarget(nextTarget);
    setDailyProgress(nextProgress);
    setBiometricInsights(nextBiometricInsights);
    setSmartSuggestions(nextSmartSuggestions);
    setFoodTimingMessage(nextFoodTimingSummary.hasFoodTimingNotes ? nextFoodTimingSummary.message : null);
  }, [todayKey]);

  useEffect(() => {
    Promise.resolve()
      .then(loadNutrition)
      .catch(() => undefined);
  }, [loadNutrition]);

  useEffect(() => {
    if (params.tab && TABS.some((tab) => tab.key === params.tab)) {
      Promise.resolve().then(() => setActiveTab(params.tab as NutritionTab));
    }
  }, [params.tab]);

  function openAddForMeal(mealGroup: NutritionMealGroup) {
    setSelectedMealGroup(mealGroup);
    setActiveTab("add");
  }

  return (
    <ScreenWrapper backgroundColor="#fffaf0">
      <View style={{ gap: 4 }}>
        <Text style={{ color: "#b45309", fontSize: 14, fontWeight: "800" }}>
          Health realm
        </Text>
        <Text style={{ color: "#0f172a", fontSize: 30, fontWeight: "900" }}>
          Food / Nutrition
        </Text>
        <Text style={{ color: "#64748b", lineHeight: 20 }}>
          Today&apos;s balance for meals, water and daily food notes.
        </Text>
      </View>

      <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
        {TABS.map((tab) => (
          <TouchableOpacity
            activeOpacity={0.85}
            key={tab.key}
            onPress={() => setActiveTab(tab.key)}
            style={{
              backgroundColor: activeTab === tab.key ? "#f59e0b" : "#ffffff",
              borderColor: "#fde68a",
              borderRadius: 999,
              borderWidth: 1,
              paddingHorizontal: 14,
              paddingVertical: 10
            }}
          >
            <Text style={{ color: activeTab === tab.key ? "#ffffff" : "#92400e", fontWeight: "900" }}>
              {tab.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {activeTab === "today" ? (
        <TodayTab
          dailyNote={dailyNote}
          biometricInsights={biometricInsights}
          entries={entries}
          onAddFood={() => setActiveTab("add")}
          onSetTargets={() => setActiveTab("targets")}
          onAddWater={() => setActiveTab("water")}
          progress={dailyProgress}
          foodTimingMessage={foodTimingMessage}
          smartSuggestions={smartSuggestions}
          summary={summary}
          target={activeTarget}
          waterGoal={waterGoal}
        />
      ) : null}

      {activeTab === "diary" ? (
        <DiaryTab
          entries={entries}
          onAdd={openAddForMeal}
          onDelete={async (entryId) => {
            await deleteNutritionEntry(entryId);
            await loadNutrition();
          }}
        />
      ) : null}

      {activeTab === "add" ? (
        <AddTab
          defaultMealGroup={selectedMealGroup}
          onMealGroupChange={setSelectedMealGroup}
          onSaved={async () => {
            await loadNutrition();
            setActiveTab("diary");
          }}
          todayKey={todayKey}
        />
      ) : null}

      {activeTab === "library" ? (
        <LibraryTab />
      ) : null}

      {activeTab === "targets" ? (
        <NutritionTargetsTab
          onSaved={async () => {
            await loadNutrition();
            setActiveTab("today");
          }}
          todayKey={todayKey}
        />
      ) : null}

      {activeTab === "reports" ? (
        <NutritionReportsTab />
      ) : null}

      {activeTab === "water" ? (
        <WaterTab
          key={waterGoal?.targetMl ?? "water"}
          onChange={loadNutrition}
          waterGoal={waterGoal}
        />
      ) : null}

      {activeTab === "notes" ? (
        <NotesTab
          key={dailyNote?.updatedAt ?? "note"}
          dailyNote={dailyNote}
          onSaved={loadNutrition}
          todayKey={todayKey}
        />
      ) : null}
    </ScreenWrapper>
  );
}

function TodayTab({
  dailyNote,
  biometricInsights,
  entries,
  foodTimingMessage,
  onAddFood,
  onSetTargets,
  onAddWater,
  progress,
  smartSuggestions,
  summary,
  target,
  waterGoal
}: {
  dailyNote: NutritionDailyNote | null;
  biometricInsights: BiometricsInsight[];
  entries: NutritionDiaryEntry[];
  foodTimingMessage: string | null;
  onAddFood: () => void;
  onSetTargets: () => void;
  onAddWater: () => void;
  progress: DailyNutritionProgress | null;
  smartSuggestions: SmartFoodSuggestion[];
  summary: DailyNutritionSummary | null;
  target: NutritionTarget | null;
  waterGoal: WaterGoal | null;
}) {
  const completedMealGroups = new Set(entries.map((entry) => entry.mealGroup));
  const mealCompletion = Math.round((completedMealGroups.size / NUTRITION_MEAL_GROUP_OPTIONS.length) * 100);
  const waterProgress = waterGoal?.targetMl
    ? Math.min(100, Math.round((waterGoal.currentMl / waterGoal.targetMl) * 100))
    : 0;

  return (
    <View style={{ gap: 12 }}>
      {target && progress ? (
        <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 10 }}>
          <ProgressMetricCard label="Calories" progress={calculateTargetProgressPercent(progress.caloriesConsumed, progress.caloriesTarget)} value={formatMacroProgress(progress.caloriesConsumed, progress.caloriesTarget, "kcal")} />
          <ProgressMetricCard label="Protein" progress={calculateTargetProgressPercent(progress.proteinConsumedG, progress.proteinTargetG)} value={formatMacroProgress(progress.proteinConsumedG, progress.proteinTargetG, "g")} />
          <ProgressMetricCard label="Carbs" progress={calculateTargetProgressPercent(progress.carbsConsumedG, progress.carbsTargetG)} value={formatMacroProgress(progress.carbsConsumedG, progress.carbsTargetG, "g")} />
          <ProgressMetricCard label="Fat" progress={calculateTargetProgressPercent(progress.fatConsumedG, progress.fatTargetG)} value={formatMacroProgress(progress.fatConsumedG, progress.fatTargetG, "g")} />
          <ProgressMetricCard label="Fiber" progress={calculateTargetProgressPercent(progress.fiberConsumedG, progress.fiberTargetG)} value={formatMacroProgress(progress.fiberConsumedG ?? 0, progress.fiberTargetG ?? 0, "g")} />
          <ProgressMetricCard label="Water" progress={calculateTargetProgressPercent(progress.waterConsumedMl, progress.waterTargetMl)} value={`${formatWaterValue(progress.waterConsumedMl)} / ${formatWaterValue(progress.waterTargetMl)}`} />
        </View>
      ) : (
        <View style={{ gap: 12 }}>
          <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 10 }}>
            <MetricCard label="Calories" value={`${Math.round(summary?.calories ?? 0)}`} />
            <MetricCard label="Protein" value={`${Math.round(summary?.proteinGrams ?? 0)}g`} />
            <MetricCard label="Carbs" value={`${Math.round(summary?.carbsGrams ?? 0)}g`} />
            <MetricCard label="Fat" value={`${Math.round(summary?.fatGrams ?? 0)}g`} />
            <MetricCard label="Water" value={`${Math.round(summary?.waterMl ?? 0)}ml`} />
            <MetricCard label="Meals" value={`${mealCompletion}%`} />
          </View>
          <AppCard>
            <View style={{ gap: 10 }}>
              <Text style={{ color: "#64748b", lineHeight: 21 }}>
                Set your nutrition targets to see your daily progress.
              </Text>
              <PrimaryButton label="Set Targets" onPress={onSetTargets} />
            </View>
          </AppCard>
        </View>
      )}

      <AppCard backgroundColor="#fffbeb">
        <Text style={{ color: "#92400e", fontSize: 20, fontWeight: "900" }}>
          Food + Goal Balance
        </Text>
        <Text style={{ color: "#92400e", lineHeight: 21, marginTop: 6 }}>
          {getNutritionGoalMessage(target, progress)}
        </Text>
      </AppCard>

      <AppCard>
        <Text style={{ color: "#0f172a", fontSize: 20, fontWeight: "900" }}>
          Smart Suggestions
        </Text>
        {smartSuggestions.length ? (
          <View style={{ gap: 10, marginTop: 10 }}>
            {smartSuggestions.slice(0, 3).map((suggestion) => (
              <TouchableOpacity
                activeOpacity={0.85}
                key={suggestion.id}
                onPress={() => router.push(suggestion.route as Href)}
                style={{ backgroundColor: "#f8fafc", borderRadius: 16, padding: 12 }}
              >
                <Text style={{ color: "#0f172a", fontWeight: "900" }}>{suggestion.title}</Text>
                <Text style={{ color: "#64748b", lineHeight: 20, marginTop: 4 }}>{suggestion.message}</Text>
                <Text style={{ color: "#92400e", fontWeight: "900", marginTop: 8 }}>{suggestion.actionLabel}</Text>
              </TouchableOpacity>
            ))}
          </View>
        ) : (
          <Text style={{ color: "#64748b", lineHeight: 21, marginTop: 6 }}>
            Add meals and water to unlock gentle smart logging suggestions.
          </Text>
        )}
      </AppCard>

      {foodTimingMessage ? (
        <AppCard backgroundColor="#fff7ed">
          <Text style={{ color: "#9a3412", fontSize: 20, fontWeight: "900" }}>
            Food timing notes
          </Text>
          <Text style={{ color: "#9a3412", lineHeight: 21, marginTop: 6 }}>
            {foodTimingMessage}
          </Text>
        </AppCard>
      ) : null}

      <AppCard>
        <Text style={{ color: "#0f172a", fontSize: 20, fontWeight: "900" }}>
          Biometrics connection
        </Text>
        {biometricInsights.length ? (
          <View style={{ gap: 10, marginTop: 10 }}>
            {biometricInsights.map((insight) => (
              <View key={`${insight.type}-${insight.title}`} style={{ backgroundColor: "#f8fafc", borderRadius: 16, padding: 12 }}>
                <Text style={{ color: "#0f172a", fontWeight: "900" }}>{insight.title}</Text>
                <Text style={{ color: "#64748b", lineHeight: 20, marginTop: 4 }}>{insight.message}</Text>
              </View>
            ))}
          </View>
        ) : (
          <Text style={{ color: "#64748b", lineHeight: 21, marginTop: 6 }}>
            Weight, sleep, energy and digestion logs can add context to your food notes over time.
          </Text>
        )}
      </AppCard>

      <AppCard>
        <Text style={{ color: "#0f172a", fontSize: 20, fontWeight: "900" }}>
          Today&apos;s note
        </Text>
        <Text style={{ color: "#64748b", lineHeight: 21, marginTop: 6 }}>
          {dailyNote?.note || "No food note added yet."}
        </Text>
      </AppCard>

      <AppCard backgroundColor="#eff6ff">
        <Text style={{ color: "#1d4ed8", fontSize: 20, fontWeight: "900" }}>
          Water progress
        </Text>
        <Text style={{ color: "#1d4ed8", marginTop: 4 }}>
          {waterGoal?.currentMl ?? 0}ml of {waterGoal?.targetMl ?? 2000}ml
        </Text>
        <ProgressBar color="#3b82f6" progress={waterProgress} trackColor="#dbeafe" />
      </AppCard>

      <View style={{ flexDirection: "row", gap: 10 }}>
        <PrimaryButton label="Add Food" onPress={onAddFood} />
        <PrimaryButton label="Log Water" onPress={onAddWater} />
      </View>

      <Text style={{ color: "#64748b", fontSize: 12, lineHeight: 18 }}>
        Nutrition insights are for general wellness tracking only and are not medical advice.
        For medical conditions, pregnancy, children, or medication concerns, speak to a
        healthcare professional.
      </Text>
    </View>
  );
}

function DiaryTab({
  entries,
  onAdd,
  onDelete
}: {
  entries: NutritionDiaryEntry[];
  onAdd: (mealGroup: NutritionMealGroup) => void;
  onDelete: (entryId: string) => void;
}) {
  return (
    <View style={{ gap: 12 }}>
      {entries.length ? null : (
        <AppCard>
          <Text style={{ color: "#64748b", lineHeight: 21 }}>
            Start by adding your first meal for today.
          </Text>
        </AppCard>
      )}

      {NUTRITION_MEAL_GROUP_OPTIONS.map((mealGroup) => {
        const mealEntries = entries.filter((entry) => entry.mealGroup === mealGroup.key);
        const calories = mealEntries.reduce((total, entry) => total + entry.calories, 0);

        return (
          <AppCard key={mealGroup.key}>
            <View style={{ gap: 12 }}>
              <View style={{ alignItems: "center", flexDirection: "row", justifyContent: "space-between" }}>
                <View>
                  <Text style={{ color: "#0f172a", fontSize: 20, fontWeight: "900" }}>
                    {mealGroup.label}
                  </Text>
                  <Text style={{ color: "#64748b", marginTop: 3 }}>
                    {Math.round(calories)} calories - {mealEntries.length} entr{mealEntries.length === 1 ? "y" : "ies"}
                  </Text>
                </View>
                <TouchableOpacity
                  activeOpacity={0.85}
                  onPress={() => onAdd(mealGroup.key)}
                  style={{ backgroundColor: "#fef3c7", borderRadius: 999, paddingHorizontal: 14, paddingVertical: 9 }}
                >
                  <Text style={{ color: "#92400e", fontWeight: "900" }}>Add</Text>
                </TouchableOpacity>
              </View>

              {mealEntries.map((entry) => (
                <View
                  key={entry.id}
                  style={{
                    backgroundColor: "#f8fafc",
                    borderRadius: 16,
                    gap: 8,
                    padding: 12
                  }}
                >
                  <View style={{ flexDirection: "row", gap: 10, justifyContent: "space-between" }}>
                    <View style={{ flex: 1 }}>
                      <Text style={{ color: "#0f172a", fontWeight: "900" }}>{entry.foodName}</Text>
                      <Text style={{ color: "#64748b", marginTop: 3 }}>
                        {entry.quantity} {entry.unit} - {Math.round(entry.calories)} kcal
                      </Text>
                    </View>
                    <TouchableOpacity activeOpacity={0.85} onPress={() => onDelete(entry.id)}>
                      <Text style={{ color: "#dc2626", fontWeight: "900" }}>Delete</Text>
                    </TouchableOpacity>
                  </View>
                  {entry.notes ? (
                    <Text style={{ color: "#64748b", lineHeight: 20 }}>{entry.notes}</Text>
                  ) : null}
                </View>
              ))}
            </View>
          </AppCard>
        );
      })}
    </View>
  );
}

function AddTab({
  defaultMealGroup,
  onMealGroupChange,
  onSaved,
  todayKey
}: {
  defaultMealGroup: NutritionMealGroup;
  onMealGroupChange: (mealGroup: NutritionMealGroup) => void;
  onSaved: () => void;
  todayKey: string;
}) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<FoodSearchResult[]>([]);
  const [recentFoods, setRecentFoods] = useState<RecentFood[]>([]);
  const [recentlyScannedProducts, setRecentlyScannedProducts] = useState<RecentlyScannedProduct[]>([]);
  const [favouriteFoods, setFavouriteFoods] = useState<FavouriteFood[]>([]);
  const [commonFoods, setCommonFoods] = useState<FoodSearchResult[]>(() =>
    getCommonFoodResults().slice(0, 10)
  );
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [showManualForm, setShowManualForm] = useState(false);

  useEffect(() => {
    Promise.resolve()
      .then(async () => {
        const [nextRecentFoods, nextRecentlyScannedProducts, nextFavouriteFoods] = await Promise.all([
          getRecentFoods(),
          getRecentlyScannedProducts(),
          getFavouriteFoods()
        ]);

        setRecentFoods(nextRecentFoods);
        setRecentlyScannedProducts(nextRecentlyScannedProducts);
        setFavouriteFoods(nextFavouriteFoods);
        setCommonFoods(getCommonFoodResults().slice(0, 10));
      })
      .catch(() => undefined);
  }, []);

  useEffect(() => {
    const searchTimer = setTimeout(() => {
      Promise.resolve()
        .then(async () => {
          const trimmedQuery = query.trim();

          setErrorMessage(null);

          if (trimmedQuery.length < 2) {
            setResults([]);
            setLoading(false);
            return;
          }

          setLoading(true);
          setResults(await searchFoods(trimmedQuery));
        })
        .catch(() => {
          setResults([]);
          setErrorMessage("Food search is unavailable right now. You can still add food manually.");
        })
        .finally(() => {
          setLoading(false);
        });
    }, 300);

    return () => clearTimeout(searchTimer);
  }, [query]);

  function openFoodDetails(food: {
    defaultMealGroup?: NutritionMealGroup;
    source: FoodSource;
    sourceFoodId: string;
  }) {
    const detailPath = `/food/details?source=${encodeURIComponent(food.source)}&sourceFoodId=${encodeURIComponent(food.sourceFoodId)}&mealGroup=${encodeURIComponent(food.defaultMealGroup ?? defaultMealGroup)}`;

    router.push(detailPath as Href);
  }

  const hasQuery = query.trim().length >= 2;

  return (
    <View style={{ gap: 12 }}>
      <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 10 }}>
        <ActionCard
          description="Find seed, custom, recent, and favourite foods."
          label="Search Food"
          onPress={() => undefined}
        />
        <ActionCard
          description="Create editable drafts from photo, label, typed voice fallback, repeat meals, or quick builder."
          label="Smart Log"
          onPress={() => router.push(`/food/smart-log?mealGroup=${encodeURIComponent(defaultMealGroup)}` as Href)}
        />
        <ActionCard
          description="Scan supermarket products, supplements, shakes, snacks, and drinks."
          label="Scan Barcode"
          onPress={() => router.push("/food/barcode-scanner" as Href)}
        />
        <ActionCard
          description="Save your own foods and South African products."
          label="Create Custom Food"
          onPress={() => router.push("/food/custom-food" as Href)}
        />
        <ActionCard
          description="Save foods you eat together often."
          label="Create Saved Meal"
          onPress={() => router.push("/food/saved-meal" as Href)}
        />
        <ActionCard
          description="Build recipes with ingredients and servings."
          label="Create Recipe"
          onPress={() => router.push("/food/recipe" as Href)}
        />
      </View>

      <AppCard>
        <View style={{ gap: 12 }}>
          <View>
            <Text style={{ color: "#0f172a", fontSize: 20, fontWeight: "900" }}>
              Search food
            </Text>
            <Text style={{ color: "#64748b", lineHeight: 20, marginTop: 4 }}>
              Nutrition values may vary by brand, preparation, and serving size.
            </Text>
          </View>

          <TextInput
            onChangeText={setQuery}
            placeholder="Search food, meal, or brand"
            placeholderTextColor="#94a3b8"
            style={INPUT_STYLE}
            value={query}
          />

          <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
            {NUTRITION_MEAL_GROUP_OPTIONS.filter((option) => option.key !== "notes").map((option) => (
              <TouchableOpacity
                activeOpacity={0.85}
                key={option.key}
                onPress={() => onMealGroupChange(option.key)}
                style={{
                  backgroundColor: defaultMealGroup === option.key ? "#f59e0b" : "#fffbeb",
                  borderRadius: 999,
                  paddingHorizontal: 12,
                  paddingVertical: 9
                }}
              >
                <Text style={{ color: defaultMealGroup === option.key ? "#ffffff" : "#92400e", fontWeight: "900" }}>
                  {option.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <TouchableOpacity
            activeOpacity={0.85}
            onPress={() => setShowManualForm((current) => !current)}
            style={{ backgroundColor: "#fffbeb", borderRadius: 16, padding: 12 }}
          >
            <Text style={{ color: "#92400e", fontWeight: "900" }}>
              {showManualForm ? "Hide manual entry" : "Add food manually"}
            </Text>
          </TouchableOpacity>
        </View>
      </AppCard>

      {showManualForm ? (
        <ManualFoodForm
          defaultMealGroup={defaultMealGroup}
          onMealGroupChange={onMealGroupChange}
          onSaved={onSaved}
          todayKey={todayKey}
        />
      ) : null}

      {hasQuery ? (
        <FoodSearchSection
          emptyText="No food found. Add it manually or create a custom food."
          errorText={errorMessage}
          foods={results}
          loading={loading}
          onPress={openFoodDetails}
          title="Search Results"
        />
      ) : (
        <View style={{ gap: 12 }}>
          <RecentFoodSection foods={recentFoods} onPress={openFoodDetails} />
          <RecentlyScannedSection foods={recentlyScannedProducts} />
          <FavouriteFoodSection foods={favouriteFoods} onPress={openFoodDetails} />
          <FoodSearchSection
            foods={commonFoods}
            onPress={openFoodDetails}
            title="Common Foods"
          />
        </View>
      )}
    </View>
  );
}

function ActionCard({
  description,
  label,
  onPress
}: {
  description: string;
  label: string;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity
      activeOpacity={0.85}
      onPress={onPress}
      style={{
        backgroundColor: "#ffffff",
        borderColor: "#fde68a",
        borderRadius: 20,
        borderWidth: 1,
        flexGrow: 1,
        minHeight: 116,
        minWidth: "45%",
        padding: 14
      }}
    >
      <Text style={{ color: "#0f172a", fontSize: 17, fontWeight: "900" }}>{label}</Text>
      <Text style={{ color: "#64748b", lineHeight: 19, marginTop: 6 }}>{description}</Text>
    </TouchableOpacity>
  );
}

function ManualFoodForm({
  defaultMealGroup,
  onMealGroupChange,
  onSaved,
  todayKey
}: {
  defaultMealGroup: NutritionMealGroup;
  onMealGroupChange: (mealGroup: NutritionMealGroup) => void;
  onSaved: () => void;
  todayKey: string;
}) {
  const [foodName, setFoodName] = useState("");
  const [quantity, setQuantity] = useState("1");
  const [unit, setUnit] = useState("serving");
  const [calories, setCalories] = useState("");
  const [proteinG, setProteinG] = useState("");
  const [carbsG, setCarbsG] = useState("");
  const [fatG, setFatG] = useState("");
  const [notes, setNotes] = useState("");

  async function saveEntry() {
    if (!foodName.trim()) {
      return;
    }

    await createNutritionEntry({
      calories: Number(calories) || 0,
      carbsG: Number(carbsG) || 0,
      entryDate: todayKey,
      fatG: Number(fatG) || 0,
      foodName,
      mealGroup: defaultMealGroup,
      notes,
      proteinG: Number(proteinG) || 0,
      quantity: Number(quantity) || 1,
      unit
    });

    setFoodName("");
    setQuantity("1");
    setUnit("serving");
    setCalories("");
    setProteinG("");
    setCarbsG("");
    setFatG("");
    setNotes("");
    onSaved();
  }

  return (
    <AppCard>
      <View style={{ gap: 12 }}>
        <View>
          <Text style={{ color: "#0f172a", fontSize: 20, fontWeight: "900" }}>
            Manual food entry
          </Text>
          <Text style={{ color: "#64748b", lineHeight: 20, marginTop: 4 }}>
            Use this when search is unavailable or the food is not listed.
          </Text>
        </View>

        <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
          {NUTRITION_MEAL_GROUP_OPTIONS.filter((option) => option.key !== "notes").map((option) => (
            <TouchableOpacity
              activeOpacity={0.85}
              key={option.key}
              onPress={() => onMealGroupChange(option.key)}
              style={{
                backgroundColor: defaultMealGroup === option.key ? "#f59e0b" : "#fffbeb",
                borderRadius: 999,
                paddingHorizontal: 12,
                paddingVertical: 9
              }}
            >
              <Text style={{ color: defaultMealGroup === option.key ? "#ffffff" : "#92400e", fontWeight: "900" }}>
                {option.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <TextInput onChangeText={setFoodName} placeholder="Food name" placeholderTextColor="#94a3b8" style={INPUT_STYLE} value={foodName} />
        <View style={{ flexDirection: "row", gap: 10 }}>
          <TextInput keyboardType="numeric" onChangeText={setQuantity} placeholder="Quantity" placeholderTextColor="#94a3b8" style={{ ...INPUT_STYLE, flex: 1 }} value={quantity} />
          <TextInput onChangeText={setUnit} placeholder="Unit" placeholderTextColor="#94a3b8" style={{ ...INPUT_STYLE, flex: 1 }} value={unit} />
        </View>
        <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 10 }}>
          <TextInput keyboardType="numeric" onChangeText={setCalories} placeholder="Calories" placeholderTextColor="#94a3b8" style={{ ...INPUT_STYLE, flexGrow: 1, minWidth: "46%" }} value={calories} />
          <TextInput keyboardType="numeric" onChangeText={setProteinG} placeholder="Protein grams" placeholderTextColor="#94a3b8" style={{ ...INPUT_STYLE, flexGrow: 1, minWidth: "46%" }} value={proteinG} />
          <TextInput keyboardType="numeric" onChangeText={setCarbsG} placeholder="Carbs grams" placeholderTextColor="#94a3b8" style={{ ...INPUT_STYLE, flexGrow: 1, minWidth: "46%" }} value={carbsG} />
          <TextInput keyboardType="numeric" onChangeText={setFatG} placeholder="Fat grams" placeholderTextColor="#94a3b8" style={{ ...INPUT_STYLE, flexGrow: 1, minWidth: "46%" }} value={fatG} />
        </View>
        <TextInput multiline onChangeText={setNotes} placeholder="Notes" placeholderTextColor="#94a3b8" style={{ ...INPUT_STYLE, minHeight: 82, paddingTop: 13 }} value={notes} />
        <PrimaryButton disabled={!foodName.trim()} label="Save food" onPress={saveEntry} />
      </View>
    </AppCard>
  );
}

function FoodSearchSection({
  emptyText,
  errorText,
  foods,
  loading = false,
  onPress,
  title
}: {
  emptyText?: string;
  errorText?: string | null;
  foods: FoodSearchResult[];
  loading?: boolean;
  onPress: (food: FoodSearchResult) => void;
  title: string;
}) {
  return (
    <View style={{ gap: 10 }}>
      <Text style={{ color: "#0f172a", fontSize: 21, fontWeight: "900" }}>{title}</Text>
      {loading ? (
        <AppCard>
          <Text style={{ color: "#64748b", lineHeight: 21 }}>Searching foods...</Text>
        </AppCard>
      ) : null}
      {errorText ? (
        <AppCard backgroundColor="#fff7ed">
          <Text style={{ color: "#9a3412", lineHeight: 21 }}>{errorText}</Text>
        </AppCard>
      ) : null}
      {!loading && !errorText && foods.length === 0 && emptyText ? (
        <AppCard>
          <Text style={{ color: "#64748b", lineHeight: 21 }}>{emptyText}</Text>
        </AppCard>
      ) : null}
      {foods.map((food) => (
        <FoodResultCard key={`${food.source}-${food.sourceFoodId}`} food={food} onPress={() => onPress(food)} />
      ))}
    </View>
  );
}

function RecentFoodSection({
  foods,
  onPress
}: {
  foods: RecentFood[];
  onPress: (food: RecentFood) => void;
}) {
  return (
    <View style={{ gap: 10 }}>
      <Text style={{ color: "#0f172a", fontSize: 21, fontWeight: "900" }}>Recent Foods</Text>
      {foods.length ? (
        foods.slice(0, 5).map((food) => (
          <FoodMemoryCard
            key={food.id}
            meta={`${food.timesUsed} use${food.timesUsed === 1 ? "" : "s"}`}
            name={food.foodName}
            onPress={() => onPress(food)}
            source={food.source}
          />
        ))
      ) : (
        <AppCard>
          <Text style={{ color: "#64748b", lineHeight: 21 }}>
            Foods you add will appear here.
          </Text>
        </AppCard>
      )}
    </View>
  );
}

function RecentlyScannedSection({ foods }: { foods: RecentlyScannedProduct[] }) {
  return (
    <View style={{ gap: 10 }}>
      <Text style={{ color: "#0f172a", fontSize: 21, fontWeight: "900" }}>Recently Scanned</Text>
      {foods.length ? (
        foods.slice(0, 5).map((food) => (
          <TouchableOpacity
            activeOpacity={0.85}
            key={food.id}
            onPress={() => {
              const path = `/food/barcode-product?barcode=${encodeURIComponent(food.barcode)}`;
              router.push(path as Href);
            }}
            style={{
              alignItems: "center",
              backgroundColor: "#ffffff",
              borderColor: "#fde68a",
              borderRadius: 18,
              borderWidth: 1,
              flexDirection: "row",
              gap: 12,
              padding: 14
            }}
          >
            {food.imageUrl ? (
              <Image
                alt={`${food.productName} product image`}
                source={{ uri: food.imageUrl }}
                style={{ backgroundColor: "#f8fafc", borderRadius: 12, height: 54, width: 54 }}
              />
            ) : (
              <View style={{ backgroundColor: "#fffbeb", borderRadius: 12, height: 54, width: 54 }} />
            )}
            <View style={{ flex: 1 }}>
              <Text style={{ color: "#0f172a", fontSize: 16, fontWeight: "900" }}>{food.productName}</Text>
              <Text style={{ color: "#64748b", marginTop: 3 }}>
                {food.brand || "Packaged product"} - {Math.round(food.calories ?? 0)} kcal
              </Text>
              <Text style={{ color: "#94a3b8", fontSize: 12, marginTop: 3 }}>
                Last scanned {new Date(food.lastScannedAt).toLocaleDateString()}
              </Text>
            </View>
          </TouchableOpacity>
        ))
      ) : (
        <AppCard>
          <Text style={{ color: "#64748b", lineHeight: 21 }}>
            Scanned products will appear here.
          </Text>
        </AppCard>
      )}
    </View>
  );
}

function FavouriteFoodSection({
  foods,
  onPress
}: {
  foods: FavouriteFood[];
  onPress: (food: FavouriteFood) => void;
}) {
  return (
    <View style={{ gap: 10 }}>
      <Text style={{ color: "#0f172a", fontSize: 21, fontWeight: "900" }}>Favourite Foods</Text>
      {foods.length ? (
        foods.slice(0, 5).map((food) => (
          <FoodMemoryCard
            key={food.id}
            meta="Saved favourite"
            name={food.foodName}
            onPress={() => onPress(food)}
            source={food.source}
          />
        ))
      ) : (
        <AppCard>
          <Text style={{ color: "#64748b", lineHeight: 21 }}>
            Save favourites from a food detail screen.
          </Text>
        </AppCard>
      )}
    </View>
  );
}

function FoodResultCard({ food, onPress }: { food: FoodSearchResult; onPress: () => void }) {
  return (
    <TouchableOpacity
      activeOpacity={0.85}
      onPress={onPress}
      style={{
        backgroundColor: "#ffffff",
        borderColor: "#fde68a",
        borderRadius: 20,
        borderWidth: 1,
        gap: 8,
        padding: 14
      }}
    >
      <View style={{ flexDirection: "row", gap: 10, justifyContent: "space-between" }}>
        <View style={{ flex: 1 }}>
          <Text style={{ color: "#0f172a", fontSize: 17, fontWeight: "900" }}>{food.name}</Text>
          <Text style={{ color: "#64748b", marginTop: 3 }}>
            {food.brand || food.servingLabel || "Local seed data"}
          </Text>
        </View>
        <SourceBadge source={food.source} />
      </View>
      <Text style={{ color: "#64748b", lineHeight: 20 }}>
        {food.caloriesPerServing !== undefined ? `${Math.round(food.caloriesPerServing)} kcal` : "Calories unavailable"}
        {food.proteinGPerServing !== undefined ? ` - ${Math.round(food.proteinGPerServing)}g protein` : ""}
      </Text>
      <Text style={{ color: "#92400e", fontSize: 12, fontWeight: "900" }}>
        {food.verified ? "Verified" : "Estimated"}
      </Text>
    </TouchableOpacity>
  );
}

function FoodMemoryCard({
  meta,
  name,
  onPress,
  source
}: {
  meta: string;
  name: string;
  onPress: () => void;
  source: FoodSource;
}) {
  return (
    <TouchableOpacity
      activeOpacity={0.85}
      onPress={onPress}
      style={{
        alignItems: "center",
        backgroundColor: "#ffffff",
        borderColor: "#fde68a",
        borderRadius: 18,
        borderWidth: 1,
        flexDirection: "row",
        gap: 12,
        justifyContent: "space-between",
        padding: 14
      }}
    >
      <View style={{ flex: 1 }}>
        <Text style={{ color: "#0f172a", fontSize: 16, fontWeight: "900" }}>{name}</Text>
        <Text style={{ color: "#64748b", marginTop: 3 }}>{meta}</Text>
      </View>
      <SourceBadge source={source} />
    </TouchableOpacity>
  );
}

function SourceBadge({ source }: { source: FoodSource }) {
  return (
    <View style={{ backgroundColor: "#fffbeb", borderRadius: 999, paddingHorizontal: 10, paddingVertical: 6 }}>
      <Text style={{ color: "#92400e", fontSize: 12, fontWeight: "900" }}>
        {getSourceLabel(source)}
      </Text>
    </View>
  );
}

function getSourceLabel(source: FoodSource) {
  switch (source) {
    case "open_food_facts":
      return "Open Food Facts";
    case "usda":
      return "USDA";
    case "custom":
      return "Custom";
    default:
      return "Local";
  }
}

function LibraryTab() {
  const [customFoods, setCustomFoods] = useState<CustomFood[]>([]);
  const [savedMeals, setSavedMeals] = useState<SavedMeal[]>([]);
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [favouriteFoods, setFavouriteFoods] = useState<FavouriteFood[]>([]);

  useEffect(() => {
    Promise.resolve()
      .then(async () => {
        const [nextCustomFoods, nextSavedMeals, nextRecipes, nextFavouriteFoods] =
          await Promise.all([
            getCustomFoods(),
            getSavedMeals(),
            getRecipes(),
            getFavouriteFoods()
          ]);

        setCustomFoods(nextCustomFoods);
        setSavedMeals(nextSavedMeals);
        setRecipes(nextRecipes);
        setFavouriteFoods(nextFavouriteFoods);
      })
      .catch(() => undefined);
  }, []);

  return (
    <View style={{ gap: 14 }}>
      <LibrarySection
        actionLabel="Create custom food"
        emptyText="No custom foods yet. Create your first one."
        items={customFoods.map((food) => ({
          id: food.id,
          meta: `${food.servingSize} ${food.servingUnit} - ${Math.round(food.calories)} kcal`,
          title: food.name,
          type: "custom_food" as const
        }))}
        onAction={() => router.push("/food/custom-food" as Href)}
        title="Custom Foods"
      />

      <LibrarySection
        actionLabel="Create saved meal"
        emptyText="No saved meals yet. Save meals you eat often."
        items={savedMeals.map((meal) => ({
          id: meal.id,
          meta: meal.description ?? meal.defaultMealGroup,
          title: meal.name,
          type: "saved_meal" as const
        }))}
        onAction={() => router.push("/food/saved-meal" as Href)}
        title="Saved Meals"
      />

      <LibrarySection
        actionLabel="Create recipe"
        emptyText="No recipes yet. Add family recipes and track nutrition per serving."
        items={recipes.map((recipe) => ({
          id: recipe.id,
          meta: `${recipe.servings} serving${recipe.servings === 1 ? "" : "s"}`,
          title: recipe.name,
          type: "recipe" as const
        }))}
        onAction={() => router.push("/food/recipe" as Href)}
        title="Recipes"
      />

      <View style={{ gap: 10 }}>
        <Text style={{ color: "#0f172a", fontSize: 21, fontWeight: "900" }}>Favourites</Text>
        {favouriteFoods.length ? (
          favouriteFoods.map((food) => (
            <FoodMemoryCard
              key={food.id}
              meta={`${food.defaultQuantity} ${food.defaultUnit}`}
              name={food.foodName}
              onPress={() => {
                const path = `/food/details?source=${encodeURIComponent(food.source)}&sourceFoodId=${encodeURIComponent(food.sourceFoodId)}`;
                router.push(path as Href);
              }}
              source={food.source}
            />
          ))
        ) : (
          <AppCard>
            <Text style={{ color: "#64748b", lineHeight: 21 }}>
              Favourite foods you save from detail screens will appear here.
            </Text>
          </AppCard>
        )}
      </View>

      <Text style={{ color: "#64748b", fontSize: 12, lineHeight: 18 }}>
        Nutrition insights are for general wellness tracking only and are not medical advice.
        For medical conditions, pregnancy, children, or medication concerns, speak to a
        healthcare professional.
      </Text>
    </View>
  );
}

function LibrarySection({
  actionLabel,
  emptyText,
  items,
  onAction,
  title
}: {
  actionLabel: string;
  emptyText: string;
  items: Array<{ id: string; meta: string; title: string; type: "custom_food" | "saved_meal" | "recipe" }>;
  onAction: () => void;
  title: string;
}) {
  return (
    <View style={{ gap: 10 }}>
      <View style={{ alignItems: "center", flexDirection: "row", justifyContent: "space-between", gap: 10 }}>
        <Text style={{ color: "#0f172a", flex: 1, fontSize: 21, fontWeight: "900" }}>{title}</Text>
        <TouchableOpacity activeOpacity={0.85} onPress={onAction} style={{ backgroundColor: "#fffbeb", borderRadius: 999, paddingHorizontal: 12, paddingVertical: 9 }}>
          <Text style={{ color: "#92400e", fontWeight: "900" }}>{actionLabel}</Text>
        </TouchableOpacity>
      </View>

      {items.length ? (
        items.map((item) => (
          <TouchableOpacity
            activeOpacity={0.85}
            key={`${item.type}-${item.id}`}
            onPress={() => {
              const path = `/food/library-item?type=${encodeURIComponent(item.type)}&id=${encodeURIComponent(item.id)}`;
              router.push(path as Href);
            }}
            style={{
              backgroundColor: "#ffffff",
              borderColor: "#fde68a",
              borderRadius: 18,
              borderWidth: 1,
              padding: 14
            }}
          >
            <Text style={{ color: "#0f172a", fontSize: 16, fontWeight: "900" }}>{item.title}</Text>
            <Text style={{ color: "#64748b", marginTop: 3 }}>{item.meta}</Text>
          </TouchableOpacity>
        ))
      ) : (
        <AppCard>
          <Text style={{ color: "#64748b", lineHeight: 21 }}>{emptyText}</Text>
        </AppCard>
      )}
    </View>
  );
}

function WaterTab({ onChange, waterGoal }: { onChange: () => void; waterGoal: WaterGoal | null }) {
  const [customAmount, setCustomAmount] = useState("");
  const [targetMl, setTargetMl] = useState(String(waterGoal?.targetMl ?? 2000));
  const progress = waterGoal?.targetMl
    ? Math.min(100, Math.round((waterGoal.currentMl / waterGoal.targetMl) * 100))
    : 0;

  async function addWater(amountMl: number) {
    await addWaterLog(amountMl);
    await onChange();
  }

  async function saveTarget() {
    await setWaterGoal(Number(targetMl) || 0);
    await onChange();
  }

  return (
    <AppCard backgroundColor="#eff6ff">
      <View style={{ gap: 12 }}>
        <Text style={{ color: "#1d4ed8", fontSize: 20, fontWeight: "900" }}>
          Water
        </Text>
        <Text style={{ color: "#1d4ed8" }}>
          {waterGoal?.currentMl ?? 0}ml of {waterGoal?.targetMl ?? 2000}ml
        </Text>
        <ProgressBar color="#3b82f6" progress={progress} trackColor="#dbeafe" />

        {(waterGoal?.currentMl ?? 0) === 0 ? (
          <Text style={{ color: "#64748b", lineHeight: 21 }}>
            Add your first glass of water.
          </Text>
        ) : null}

        <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
          {QUICK_WATER_AMOUNTS.map((amount) => (
            <TouchableOpacity
              activeOpacity={0.85}
              key={amount}
              onPress={() => addWater(amount)}
              style={{ backgroundColor: "#ffffff", borderRadius: 999, paddingHorizontal: 14, paddingVertical: 10 }}
            >
              <Text style={{ color: "#2563eb", fontWeight: "900" }}>+{amount} ml</Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={{ flexDirection: "row", gap: 10 }}>
          <TextInput keyboardType="numeric" onChangeText={setCustomAmount} placeholder="Custom amount ml" placeholderTextColor="#94a3b8" style={{ ...INPUT_STYLE, borderColor: "#bfdbfe", flex: 1 }} value={customAmount} />
          <TouchableOpacity
            activeOpacity={0.85}
            onPress={() => {
              addWater(Number(customAmount) || 0);
              setCustomAmount("");
            }}
            style={{ alignItems: "center", backgroundColor: "#3b82f6", borderRadius: 16, justifyContent: "center", paddingHorizontal: 14 }}
          >
            <Text style={{ color: "#ffffff", fontWeight: "900" }}>Add</Text>
          </TouchableOpacity>
        </View>

        <View style={{ flexDirection: "row", gap: 10 }}>
          <TextInput keyboardType="numeric" onChangeText={setTargetMl} placeholder="Daily target ml" placeholderTextColor="#94a3b8" style={{ ...INPUT_STYLE, borderColor: "#bfdbfe", flex: 1 }} value={targetMl} />
          <TouchableOpacity
            activeOpacity={0.85}
            onPress={saveTarget}
            style={{ alignItems: "center", backgroundColor: "#1d4ed8", borderRadius: 16, justifyContent: "center", paddingHorizontal: 14 }}
          >
            <Text style={{ color: "#ffffff", fontWeight: "900" }}>Save</Text>
          </TouchableOpacity>
        </View>
      </View>
    </AppCard>
  );
}

function NotesTab({
  dailyNote,
  onSaved,
  todayKey
}: {
  dailyNote: NutritionDailyNote | null;
  onSaved: () => void;
  todayKey: string;
}) {
  const [note, setNote] = useState(dailyNote?.note ?? "");

  async function saveNote() {
    await saveNutritionDailyNote(note, todayKey);
    await onSaved();
  }

  return (
    <AppCard>
      <View style={{ gap: 12 }}>
        <Text style={{ color: "#0f172a", fontSize: 20, fontWeight: "900" }}>
          Daily nutrition note
        </Text>
        <TextInput
          multiline
          onChangeText={setNote}
          placeholder="Felt low energy today, ate late, heavy workout, stomach felt uncomfortable..."
          placeholderTextColor="#94a3b8"
          style={{ ...INPUT_STYLE, minHeight: 130, paddingTop: 13 }}
          value={note}
        />
        <PrimaryButton label="Save note" onPress={saveNote} />
      </View>
    </AppCard>
  );
}

function MetricCard({ label, value }: { label: string; value: string }) {
  return (
    <View
      style={{
        backgroundColor: "#ffffff",
        borderColor: "#fde68a",
        borderRadius: 18,
        borderWidth: 1,
        flexGrow: 1,
        minWidth: "30%",
        padding: 14
      }}
    >
      <Text style={{ color: "#92400e", fontSize: 12, fontWeight: "900" }}>{label}</Text>
      <Text style={{ color: "#0f172a", fontSize: 20, fontWeight: "900", marginTop: 4 }}>
        {value}
      </Text>
    </View>
  );
}

function ProgressMetricCard({ label, progress, value }: { label: string; progress: number; value: string }) {
  return (
    <View
      style={{
        backgroundColor: "#ffffff",
        borderColor: "#fde68a",
        borderRadius: 18,
        borderWidth: 1,
        flexGrow: 1,
        minWidth: "46%",
        padding: 14
      }}
    >
      <Text style={{ color: "#92400e", fontSize: 12, fontWeight: "900" }}>{label}</Text>
      <Text style={{ color: "#0f172a", fontSize: 17, fontWeight: "900", marginTop: 4 }}>
        {value}
      </Text>
      <ProgressBar color="#f59e0b" progress={progress} trackColor="#fde68a" />
    </View>
  );
}

function formatWaterValue(amountMl: number) {
  return amountMl >= 1000 ? `${(amountMl / 1000).toFixed(1)} L` : `${Math.round(amountMl)} ml`;
}

function ProgressBar({ color, progress, trackColor }: { color: string; progress: number; trackColor: string }) {
  return (
    <View style={{ backgroundColor: trackColor, borderRadius: 999, height: 12, marginTop: 12, overflow: "hidden" }}>
      <View
        style={{
          backgroundColor: color,
          borderRadius: 999,
          height: "100%",
          width: `${Math.max(0, Math.min(100, progress))}%` as `${number}%`
        }}
      />
    </View>
  );
}

function PrimaryButton({
  disabled = false,
  label,
  onPress
}: {
  disabled?: boolean;
  label: string;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity
      activeOpacity={0.85}
      disabled={disabled}
      onPress={onPress}
      style={{
        alignItems: "center",
        backgroundColor: "#f59e0b",
        borderRadius: 18,
        flex: 1,
        justifyContent: "center",
        minHeight: 52,
        opacity: disabled ? 0.55 : 1
      }}
    >
      <Text style={{ color: "#ffffff", fontSize: 16, fontWeight: "900" }}>
        {label}
      </Text>
    </TouchableOpacity>
  );
}
