import {
  Href,
  router,
  useFocusEffect,
  useLocalSearchParams,
} from "expo-router";
import { useCallback, useMemo, useState } from "react";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

import {
  ManualEntryToggle,
  NumberWheelPicker,
  PresetChipGroup,
  QuickLogBottomSheet,
  QuickNoteField,
  QuickSaveButton,
} from "@/components/fitness/QuickWorkoutInputs";
import { AppMainLayout } from "@/components/layout/AppMainLayout";
import { FoodRealmOverview } from "@/components/nutrition/FoodRealmOverview";
import { AppButton, AppCard, AppIcon, AppSection } from "@/components/ui";
import {
  addRecipeServingToDiary,
  addSavedMealToDiary,
  addWaterLog,
  createNutritionEntry,
  deleteNutritionEntry,
  getActiveNutritionTarget,
  getDailyNutritionSummary,
  getNutritionDailyNote,
  getNutritionEntriesByDate,
  getRecipes,
  getSavedMeals,
  getTodayNutritionSummary,
  getWaterGoal,
  saveNutritionDailyNote,
  toNutritionDateKey,
} from "@/lib/nutritionStorage";
import { getTodayFitnessSummary } from "@/lib/fitnessStorage";
import type { FitnessSummary } from "@/types/fitness";
import type {
  DailyNutritionSummary,
  NutritionDailyNote,
  NutritionDiaryEntry,
  NutritionMealGroup,
  NutritionTarget,
  Recipe,
  SavedMeal,
  WaterGoal,
} from "@/types/nutrition";

type NutritionTab =
  | "today"
  | "diary"
  | "add"
  | "saved_meals"
  | "recipes"
  | "water"
  | "reports"
  | "guides"
  | "settings";
type MealKey = "breakfast" | "lunch" | "dinner" | "snacks" | "drinks";
type SheetMode = "meal" | "water" | "barcode" | "smart_log" | null;

const TABS: Array<{ key: NutritionTab; label: string }> = [
  { key: "today", label: "Today" },
  { key: "diary", label: "Diary" },
  { key: "add", label: "Add" },
  { key: "saved_meals", label: "Saved Meals" },
  { key: "recipes", label: "Recipes" },
  { key: "water", label: "Water" },
  { key: "reports", label: "Reports" },
  { key: "guides", label: "Learn / Guides" },
  { key: "settings", label: "Settings" },
];

const MEALS: Array<{
  key: MealKey;
  label: string;
  storageGroup: NutritionMealGroup;
}> = [
  { key: "breakfast", label: "Breakfast", storageGroup: "breakfast" },
  { key: "lunch", label: "Lunch", storageGroup: "lunch" },
  { key: "dinner", label: "Dinner", storageGroup: "dinner" },
  { key: "snacks", label: "Snacks", storageGroup: "snacks" },
  { key: "drinks", label: "Drinks", storageGroup: "notes" },
];

const MOCK_SAVED_MEALS = [
  {
    calories: 420,
    mealType: "Breakfast",
    name: "Greek yogurt bowl",
    protein: 32,
  },
  { calories: 610, mealType: "Lunch", name: "Chicken rice plate", protein: 44 },
  { calories: 520, mealType: "Dinner", name: "Tuna potato salad", protein: 36 },
];

const MOCK_RECIPES = [
  {
    calories: 480,
    name: "Oats protein bake",
    protein: 28,
    servings: 4,
    tags: ["Breakfast", "Prep"],
  },
  {
    calories: 560,
    name: "Turkey pasta bowl",
    protein: 38,
    servings: 3,
    tags: ["Dinner", "Protein"],
  },
  {
    calories: 390,
    name: "Avocado egg toast",
    protein: 22,
    servings: 2,
    tags: ["Quick", "Lunch"],
  },
];

const SAFETY_COPY =
  "Nutrition tracking is for general wellness only and is not medical advice. For medical conditions, pregnancy, children, medication concerns, or eating concerns, speak to a healthcare professional.";

export default function FoodScreen() {
  const params = useLocalSearchParams<{ tab?: NutritionTab }>();
  const [activeTab, setActiveTab] = useState<NutritionTab>(toTab(params.tab));
  const [entries, setEntries] = useState<NutritionDiaryEntry[]>([]);
  const [summary, setSummary] = useState<DailyNutritionSummary | null>(null);
  const [target, setTarget] = useState<NutritionTarget | null>(null);
  const [waterGoal, setWaterGoal] = useState<WaterGoal | null>(null);
  const [dailyNote, setDailyNote] = useState<NutritionDailyNote | null>(null);
  const [savedMeals, setSavedMeals] = useState<SavedMeal[]>([]);
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [fitnessSummary, setFitnessSummary] = useState<FitnessSummary | null>(
    null,
  );
  const [sheetMode, setSheetMode] = useState<SheetMode>(null);
  const [selectedMeal, setSelectedMeal] = useState<MealKey>("breakfast");
  const [toast, setToast] = useState("");

  const todayKey = useMemo(() => toNutritionDateKey(new Date()), []);
  const loadNutrition = useCallback(async () => {
    const [
      nextEntries,
      nextSummary,
      nextTarget,
      nextWaterGoal,
      nextNote,
      nextSavedMeals,
      nextRecipes,
      nextFitness,
    ] = await Promise.all([
      getNutritionEntriesByDate(todayKey),
      getTodayNutritionSummary(),
      getActiveNutritionTarget(),
      getWaterGoal(new Date()),
      getNutritionDailyNote(todayKey),
      getSavedMeals(),
      getRecipes(),
      getTodayFitnessSummary(),
    ]);
    setEntries(nextEntries);
    setSummary(nextSummary);
    setTarget(nextTarget);
    setWaterGoal(nextWaterGoal);
    setDailyNote(nextNote);
    setSavedMeals(nextSavedMeals);
    setRecipes(nextRecipes);
    setFitnessSummary(nextFitness);
  }, [todayKey]);

  useFocusEffect(
    useCallback(() => {
      Promise.resolve()
        .then(loadNutrition)
        .catch(() => undefined);
    }, [loadNutrition]),
  );

  function openMealSheet(meal: MealKey = "breakfast") {
    setSelectedMeal(meal);
    setSheetMode("meal");
  }

  async function afterSaved(message: string) {
    setToast(message);
    setSheetMode(null);
    await loadNutrition();
  }

  return (
    <AppMainLayout
      subtitle="Meals, water, goals and reports"
      title="Food / Nutrition"
    >
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.tabRow}
      >
        {TABS.map((tab) => (
          <Chip
            key={tab.key}
            label={tab.label}
            onPress={() => setActiveTab(tab.key)}
            selected={activeTab === tab.key}
          />
        ))}
      </ScrollView>

      {toast ? (
        <SuccessToast message={toast} onDismiss={() => setToast("")} />
      ) : null}

      {activeTab === "today" ? (
        <TodayTab
          dailyNote={dailyNote}
          entries={entries}
          fitnessSummary={fitnessSummary}
          onOpenMeal={openMealSheet}
          onSheet={setSheetMode}
          onTab={setActiveTab}
          summary={summary}
          recipes={recipes}
          savedMeals={savedMeals}
          target={target}
          waterGoal={waterGoal}
        />
      ) : null}
      {activeTab === "diary" ? (
        <DiaryTab
          entries={entries}
          onDelete={async (id) => {
            await deleteNutritionEntry(id);
            await loadNutrition();
          }}
          onOpenMeal={openMealSheet}
        />
      ) : null}
      {activeTab === "add" ? (
        <AddTab
          onOpenMeal={openMealSheet}
          onSheet={setSheetMode}
          onTab={setActiveTab}
        />
      ) : null}
      {activeTab === "saved_meals" ? (
        <SavedMealsTab
          meals={savedMeals}
          onAdded={(message) => afterSaved(message)}
          onOpenMeal={openMealSheet}
        />
      ) : null}
      {activeTab === "recipes" ? (
        <RecipesTab
          onAdded={(message) => afterSaved(message)}
          recipes={recipes}
        />
      ) : null}
      {activeTab === "water" ? (
        <WaterTab
          onSaved={(message) => afterSaved(message)}
          waterGoal={waterGoal}
        />
      ) : null}
      {activeTab === "reports" ? (
        <ReportsTab
          entries={entries}
          summary={summary}
          target={target}
          waterGoal={waterGoal}
        />
      ) : null}
      {activeTab === "guides" ? <GuidesTab /> : null}
      {activeTab === "settings" ? (
        <SettingsTab
          dailyNote={dailyNote}
          onSaved={loadNutrition}
          todayKey={todayKey}
        />
      ) : null}

      <SafetyCard />

      <AddMealSheet
        meal={selectedMeal}
        onClose={() => setSheetMode(null)}
        onMealChange={setSelectedMeal}
        onSaved={(message) => afterSaved(message)}
        todayKey={todayKey}
        visible={sheetMode === "meal"}
      />
      <AddWaterSheet
        onClose={() => setSheetMode(null)}
        onSaved={(message) => afterSaved(message)}
        visible={sheetMode === "water"}
      />
      <PlaceholderSheet
        body="Barcode lookup is coming soon. You can add this manually for now."
        onClose={() => setSheetMode(null)}
        onManual={() => {
          setSheetMode("meal");
        }}
        title="Barcode lookup"
        visible={sheetMode === "barcode"}
      />
      <PlaceholderSheet
        body="Estimated draft. Review before saving. AI meal drafts stay editable and are not saved automatically."
        onClose={() => setSheetMode(null)}
        onManual={() =>
          router.push("/ai?mode=quick_logger&prompt=Log%20this%20meal" as Href)
        }
        title="Smart Log"
        visible={sheetMode === "smart_log"}
      />
    </AppMainLayout>
  );
}

function TodayTab({
  dailyNote,
  entries,
  fitnessSummary,
  onOpenMeal,
  onSheet,
  onTab,
  recipes,
  savedMeals,
  summary,
  target,
  waterGoal,
}: {
  dailyNote: NutritionDailyNote | null;
  entries: NutritionDiaryEntry[];
  fitnessSummary: FitnessSummary | null;
  onOpenMeal: (meal: MealKey) => void;
  onSheet: (mode: SheetMode) => void;
  onTab: (tab: NutritionTab) => void;
  recipes: Recipe[];
  savedMeals: SavedMeal[];
  summary: DailyNutritionSummary | null;
  target: NutritionTarget | null;
  waterGoal: WaterGoal | null;
}) {
  return (
    <View style={styles.stack}>
      <FoodRealmOverview
        entries={entries}
        onAddWater={() => onSheet("water")}
        onOpenMeal={onOpenMeal}
        onOpenPlanner={() => onTab("recipes")}
        onScanFood={() => onSheet("smart_log")}
        recipes={recipes}
        savedMeals={savedMeals}
        summary={summary}
        target={target}
        waterGoal={waterGoal}
      />

      <AppCard style={styles.darkCard}>
        <Text style={styles.darkTitle}>Suggested next action</Text>
        <Text style={styles.darkMuted}>
          {entries.length
            ? "Review your water or save a frequent meal for faster logging."
            : "Log breakfast, lunch, dinner, or a snack when you are ready."}
        </Text>
        <View style={styles.actionRow}>
          <GhostButton
            label={entries.length ? "Add water" : "Add meal"}
            onPress={() =>
              entries.length ? onSheet("water") : onOpenMeal("breakfast")
            }
          />
          <GhostButton
            label="Reports preview"
            onPress={() => onTab("reports")}
          />
        </View>
      </AppCard>

      <AppCard style={styles.darkCard}>
        <Text style={styles.darkTitle}>Workout connection</Text>
        <Text style={styles.darkMuted}>
          {fitnessSummary?.latestWorkout
            ? "Use your food and workout logs together to review patterns."
            : "Training today? Protein and water logs can help you review your workout day."}
        </Text>
      </AppCard>

      <ReportsPreview
        entries={entries}
        summary={summary}
        waterGoal={waterGoal}
      />

      <AppCard style={styles.darkCard}>
        <Text style={styles.darkTitle}>Today note</Text>
        <Text style={styles.darkMuted}>
          {dailyNote?.note ||
            "Add a note about energy, timing, appetite, or anything useful to remember."}
        </Text>
      </AppCard>
    </View>
  );
}

function DiaryTab({
  entries,
  onDelete,
  onOpenMeal,
}: {
  entries: NutritionDiaryEntry[];
  onDelete: (id: string) => void;
  onOpenMeal: (meal: MealKey) => void;
}) {
  return (
    <View style={styles.stack}>
      <AppSection
        title="Food diary"
        subtitle="Clean meal sections for today."
      />
      {!entries.length ? (
        <PremiumEmptyState
          button="Add meal"
          message="Log breakfast, lunch, dinner, or a snack when you are ready."
          onPress={() => onOpenMeal("breakfast")}
          title="Start your first meal"
        />
      ) : null}
      {MEALS.map((meal) => {
        const mealEntries = entries.filter(
          (entry) => entry.mealGroup === meal.storageGroup,
        );
        const calories = mealEntries.reduce(
          (total, entry) => total + entry.calories,
          0,
        );
        const protein = mealEntries.reduce(
          (total, entry) => total + entry.proteinG,
          0,
        );
        return (
          <AppCard key={meal.key} style={styles.mealCard}>
            <View style={styles.mealHeader}>
              <View>
                <Text style={styles.mealTitle}>{meal.label}</Text>
                <Text style={styles.muted}>
                  {Math.round(calories)} cal - {Math.round(protein)}g protein -{" "}
                  {mealEntries.length} entries
                </Text>
              </View>
              <GhostButton label="Add" onPress={() => onOpenMeal(meal.key)} />
            </View>
            {mealEntries.map((entry) => (
              <FoodRow
                entry={entry}
                key={entry.id}
                onDelete={() => onDelete(entry.id)}
              />
            ))}
            <View style={styles.actionRow}>
              <SmallAction label="Copy meal" />
              <SmallAction label="Save as meal" />
            </View>
          </AppCard>
        );
      })}
    </View>
  );
}

function AddTab({
  onOpenMeal,
  onSheet,
  onTab,
}: {
  onOpenMeal: (meal: MealKey) => void;
  onSheet: (mode: SheetMode) => void;
  onTab: (tab: NutritionTab) => void;
}) {
  return (
    <View style={styles.stack}>
      <AppCard style={styles.darkHero}>
        <Text style={styles.heroTitle}>Fast food logging</Text>
        <Text style={styles.heroSubtitle}>
          Choose a quick action and save common logs in a few taps.
        </Text>
      </AppCard>
      <View style={styles.quickGrid}>
        <QuickAction
          icon="add"
          label="Add Meal"
          onPress={() => onOpenMeal("breakfast")}
        />
        <QuickAction
          icon="scan_barcode"
          label="Scan Barcode"
          onPress={() => onSheet("barcode")}
        />
        <QuickAction
          icon="ai_draft"
          label="Smart Log"
          onPress={() => onSheet("smart_log")}
        />
        <QuickAction
          icon="water"
          label="Add Water"
          onPress={() => onSheet("water")}
        />
        <QuickAction
          icon="save"
          label="Saved Meal"
          onPress={() => onTab("saved_meals")}
        />
        <QuickAction
          icon="source"
          label="Create Recipe"
          onPress={() => router.push("/food/recipe" as Href)}
        />
      </View>
      <PremiumEmptyState
        button="Add meal"
        message="Search or enter a food, choose quantity, then save."
        onPress={() => onOpenMeal("breakfast")}
        title="Log your first meal"
      />
      <BarcodePlaceholder />
      <SmartLogPlaceholder />
    </View>
  );
}

function SavedMealsTab({
  meals,
  onAdded,
  onOpenMeal,
}: {
  meals: SavedMeal[];
  onAdded: (message: string) => void;
  onOpenMeal: (meal: MealKey) => void;
}) {
  return (
    <View style={styles.stack}>
      <AppSection
        title="Saved Meals"
        subtitle="Meals you eat often for faster logging."
      />
      {!meals.length ? (
        <PremiumEmptyState
          button="Create saved meal"
          message="Create quick meals for breakfast, lunch, dinner, or snacks."
          onPress={() => router.push("/food/saved-meal" as Href)}
          title="Save meals you eat often"
        />
      ) : null}
      {meals.map((meal) => (
        <LibraryMealCard
          key={meal.id}
          meta={meal.defaultMealGroup}
          name={meal.name}
          onAdd={async () => {
            await addSavedMealToDiary(meal.id);
            onAdded("Saved meal added");
          }}
        />
      ))}
      {!meals.length
        ? MOCK_SAVED_MEALS.map((meal) => (
            <MockMealCard
              key={meal.name}
              meal={meal}
              onAdd={() => onOpenMeal(meal.mealType.toLowerCase() as MealKey)}
            />
          ))
        : null}
    </View>
  );
}

function RecipesTab({
  onAdded,
  recipes,
}: {
  onAdded: (message: string) => void;
  recipes: Recipe[];
}) {
  return (
    <View style={styles.stack}>
      <AppSection
        title="Recipes"
        subtitle="Ingredients, servings, notes and nutrition per serving."
      />
      {!recipes.length ? (
        <PremiumEmptyState
          button="Create recipe"
          message="Save meals with ingredients and serving sizes."
          onPress={() => router.push("/food/recipe" as Href)}
          title="Build your recipe library"
        />
      ) : null}
      {recipes.map((recipe) => (
        <RecipeCard
          key={recipe.id}
          name={recipe.name}
          onAdd={async () => {
            await addRecipeServingToDiary({
              mealGroup: "dinner",
              recipeId: recipe.id,
              servings: 1,
            });
            onAdded("Recipe serving added");
          }}
          servings={recipe.servings}
        />
      ))}
      {!recipes.length
        ? MOCK_RECIPES.map((recipe) => (
            <RecipeCard
              key={recipe.name}
              name={recipe.name}
              servings={recipe.servings}
              mock={recipe}
            />
          ))
        : null}
    </View>
  );
}

function WaterTab({
  onSaved,
  waterGoal,
}: {
  onSaved: (message: string) => void;
  waterGoal: WaterGoal | null;
}) {
  return (
    <View style={styles.stack}>
      <AppCard style={styles.waterCard}>
        <Text style={styles.waterTitle}>Water</Text>
        <Text style={styles.waterValue}>
          {formatWater(waterGoal?.currentMl ?? 0)} /{" "}
          {formatWater(waterGoal?.targetMl ?? 2000)}
        </Text>
        <ProgressBar
          color="#38bdf8"
          value={(waterGoal?.currentMl ?? 0) / (waterGoal?.targetMl ?? 2000)}
        />
      </AppCard>
      {(waterGoal?.currentMl ?? 0) === 0 ? (
        <PremiumEmptyState
          button="Add water"
          message="Add your first glass or bottle."
          onPress={() => undefined}
          title="Start hydration tracking"
        />
      ) : null}
      <View style={styles.quickGrid}>
        {[250, 500, 750].map((amount) => (
          <QuickAction
            icon="water"
            key={amount}
            label={`+${amount} ml`}
            onPress={async () => {
              await addWaterLog(amount);
              onSaved("Water added");
            }}
          />
        ))}
      </View>
    </View>
  );
}

function ReportsTab({
  entries,
  summary,
  target,
  waterGoal,
}: {
  entries: NutritionDiaryEntry[];
  summary: DailyNutritionSummary | null;
  target: NutritionTarget | null;
  waterGoal: WaterGoal | null;
}) {
  return (
    <View style={styles.stack}>
      <AppSection
        title="Reports"
        subtitle="Compact trends based on your logs."
      />
      {!entries.length ? (
        <PremiumEmptyState
          button="Add meal"
          message="Log a few meals to see calories, protein, water, and macro trends."
          onPress={() => undefined}
          title="Nutrition trends will appear here"
        />
      ) : null}
      <ReportsPreview
        entries={entries}
        summary={summary}
        waterGoal={waterGoal}
      />
      <ChartCard
        title="Calories over 7 days"
        values={[
          0.2,
          0.35,
          0.6,
          0.45,
          0.7,
          0.5,
          Math.min(
            1,
            (summary?.calories ?? 0) / (target?.caloriesTarget ?? 2000),
          ),
        ]}
      />
      <ChartCard
        title="Protein over 7 days"
        values={[
          0.25,
          0.4,
          0.55,
          0.45,
          0.65,
          0.52,
          Math.min(
            1,
            (summary?.proteinGrams ?? 0) / (target?.proteinTargetG ?? 140),
          ),
        ]}
      />
      <ChartCard
        title="Water over 7 days"
        values={[
          0.3,
          0.45,
          0.4,
          0.55,
          0.7,
          0.5,
          Math.min(
            1,
            (waterGoal?.currentMl ?? 0) / (waterGoal?.targetMl ?? 2000),
          ),
        ]}
        water
      />
      <View style={styles.macroGrid}>
        <MacroCard
          helper="Based on your logs"
          label="Meal consistency"
          target="5 sections"
          value={`${new Set(entries.map((entry) => entry.mealGroup)).size}/5`}
          valueRatio={new Set(entries.map((entry) => entry.mealGroup)).size / 5}
        />
        <MacroCard
          helper="Most logged foods"
          label="Foods"
          target="More data later"
          value={entries[0]?.foodName ?? "Start today"}
          valueRatio={entries.length ? 0.7 : 0}
        />
      </View>
    </View>
  );
}

function GuidesTab() {
  const prompts = [
    "Log this meal",
    "Estimate this plate",
    "Create a meal draft",
    "Build a grocery idea from my protein target",
    "Summarize today food",
    "Save this as a meal",
  ];
  return (
    <View style={styles.stack}>
      <AppSection
        title="Learn / Guides"
        subtitle="Nutrition organization, source placeholders and draft-first AI."
      />
      <SmartLogPlaceholder />
      <AppCard style={styles.darkCard}>
        <Text style={styles.darkTitle}>Nutrition assistant prompts</Text>
        <Text style={styles.darkMuted}>
          AI must create drafts only. Review before saving.
        </Text>
        <View style={styles.chipRow}>
          {prompts.map((prompt) => (
            <Pill
              key={prompt}
              label={prompt}
              onPress={() =>
                router.push(
                  `/ai?mode=quick_logger&prompt=${encodeURIComponent(prompt)}` as Href,
                )
              }
            />
          ))}
        </View>
      </AppCard>
      <AppCard style={styles.darkCard}>
        <Text style={styles.darkTitle}>Medication / supplement timing</Text>
        <Text style={styles.darkMuted}>
          Some medicines or supplements may have food timing instructions.
          Always follow your label or healthcare professional advice.
        </Text>
      </AppCard>
      <SkeletonCard label="Meal section skeleton" />
      <SkeletonCard label="Recipe card skeleton" />
      <SkeletonCard label="Report chart skeleton" />
    </View>
  );
}

function SettingsTab({
  dailyNote,
  onSaved,
  todayKey,
}: {
  dailyNote: NutritionDailyNote | null;
  onSaved: () => void;
  todayKey: string;
}) {
  const [note, setNote] = useState(dailyNote?.note ?? "");
  return (
    <View style={styles.stack}>
      <AppSection
        title="Settings"
        subtitle="Private local-first nutrition preferences."
      />
      <AppCard style={styles.darkCard}>
        <Text style={styles.darkTitle}>Daily note</Text>
        <QuickNoteField onChangeText={setNote} value={note} />
        <QuickSaveButton
          onPress={async () => {
            await saveNutritionDailyNote(note, todayKey);
            await onSaved();
          }}
          title="Save note"
        />
      </AppCard>
      <AppCard style={styles.darkCard}>
        <Text style={styles.darkTitle}>Sensitive contexts</Text>
        <Text style={styles.darkMuted}>
          Pregnancy nutrition needs vary. Speak to your healthcare professional
          or dietitian if unsure.
        </Text>
        <Text style={styles.darkMuted}>
          Baby feeding and solids guidance should be discussed with a
          pediatrician, clinic, nurse, or healthcare professional if unsure.
        </Text>
      </AppCard>
    </View>
  );
}

function AddMealSheet({
  meal,
  onClose,
  onMealChange,
  onSaved,
  todayKey,
  visible,
}: {
  meal: MealKey;
  onClose: () => void;
  onMealChange: (meal: MealKey) => void;
  onSaved: (message: string) => void;
  todayKey: string;
  visible: boolean;
}) {
  const [foodName, setFoodName] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [manualMode, setManualMode] = useState(false);
  const [manualQuantity, setManualQuantity] = useState("1");
  const [unit, setUnit] = useState("serving");
  const [calories, setCalories] = useState("250");
  const [protein, setProtein] = useState("20");
  const [carbs, setCarbs] = useState("25");
  const [fat, setFat] = useState("8");
  const [notes, setNotes] = useState("");

  async function save() {
    const mealConfig = MEALS.find((item) => item.key === meal) ?? MEALS[0];
    await createNutritionEntry({
      calories: Number(calories) || 0,
      carbsG: Number(carbs) || 0,
      entryDate: todayKey,
      entrySource: "manual",
      fatG: Number(fat) || 0,
      foodName: foodName.trim() || "Quick meal",
      mealGroup: mealConfig.storageGroup,
      notes,
      proteinG: Number(protein) || 0,
      quantity: manualMode ? Number(manualQuantity) || 1 : quantity,
      unit,
    });
    setFoodName("");
    setNotes("");
    onSaved("Meal saved");
  }

  return (
    <QuickLogBottomSheet onClose={onClose} title="Add meal" visible={visible}>
      <Text style={styles.sheetLabel}>Meal type</Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.chipRow}
      >
        {MEALS.map((item) => (
          <Chip
            key={item.key}
            label={item.label}
            onPress={() => onMealChange(item.key)}
            selected={meal === item.key}
          />
        ))}
      </ScrollView>
      <TextInput
        onChangeText={setFoodName}
        placeholder="Search or enter food"
        placeholderTextColor="#94a3b8"
        style={styles.darkInput}
        value={foodName}
      />
      <ManualEntryToggle
        enabled={manualMode}
        onToggle={() => setManualMode((current) => !current)}
      />
      {manualMode ? (
        <TextInput
          keyboardType="decimal-pad"
          onChangeText={setManualQuantity}
          placeholder="Custom quantity"
          placeholderTextColor="#94a3b8"
          style={styles.darkInput}
          value={manualQuantity}
        />
      ) : (
        <>
          <PresetChipGroup
            onSelect={setQuantity}
            presets={[0.5, 1, 2, 3]}
            selectedValue={quantity}
            suffix=" serving"
          />
          <NumberWheelPicker
            max={5}
            min={0.5}
            onChange={setQuantity}
            step={0.5}
            value={quantity}
          />
        </>
      )}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.chipRow}
      >
        {["serving", "100g", "cup", "piece", "bottle"].map((option) => (
          <Chip
            key={option}
            label={option}
            onPress={() => setUnit(option)}
            selected={unit === option}
          />
        ))}
      </ScrollView>
      <View style={styles.inputGrid}>
        <TextInput
          keyboardType="numeric"
          onChangeText={setCalories}
          placeholder="Calories"
          placeholderTextColor="#94a3b8"
          style={styles.darkInput}
          value={calories}
        />
        <TextInput
          keyboardType="numeric"
          onChangeText={setProtein}
          placeholder="Protein g"
          placeholderTextColor="#94a3b8"
          style={styles.darkInput}
          value={protein}
        />
        <TextInput
          keyboardType="numeric"
          onChangeText={setCarbs}
          placeholder="Carbs g"
          placeholderTextColor="#94a3b8"
          style={styles.darkInput}
          value={carbs}
        />
        <TextInput
          keyboardType="numeric"
          onChangeText={setFat}
          placeholder="Fat g"
          placeholderTextColor="#94a3b8"
          style={styles.darkInput}
          value={fat}
        />
      </View>
      <QuickNoteField onChangeText={setNotes} value={notes} />
      <QuickSaveButton onPress={save} title="Save meal" />
    </QuickLogBottomSheet>
  );
}

function AddWaterSheet({
  onClose,
  onSaved,
  visible,
}: {
  onClose: () => void;
  onSaved: (message: string) => void;
  visible: boolean;
}) {
  const [amount, setAmount] = useState(250);
  const [manualMode, setManualMode] = useState(false);
  const [manualAmount, setManualAmount] = useState("250");
  async function save() {
    await addWaterLog(manualMode ? Number(manualAmount) || 0 : amount);
    onSaved("Water added");
  }
  return (
    <QuickLogBottomSheet onClose={onClose} title="Add water" visible={visible}>
      <ManualEntryToggle
        enabled={manualMode}
        onToggle={() => setManualMode((current) => !current)}
      />
      {manualMode ? (
        <TextInput
          keyboardType="numeric"
          onChangeText={setManualAmount}
          placeholder="Amount ml"
          placeholderTextColor="#94a3b8"
          style={styles.darkInput}
          value={manualAmount}
        />
      ) : (
        <>
          <PresetChipGroup
            onSelect={setAmount}
            presets={[250, 500, 750]}
            selectedValue={amount}
            suffix="ml"
          />
          <NumberWheelPicker
            max={2000}
            min={100}
            onChange={setAmount}
            step={50}
            suffix="ml"
            value={amount}
          />
        </>
      )}
      <QuickSaveButton onPress={save} title="Save water" />
    </QuickLogBottomSheet>
  );
}

function PlaceholderSheet({
  body,
  onClose,
  onManual,
  title,
  visible,
}: {
  body: string;
  onClose: () => void;
  onManual: () => void;
  title: string;
  visible: boolean;
}) {
  return (
    <QuickLogBottomSheet onClose={onClose} title={title} visible={visible}>
      <Text style={styles.sheetText}>{body}</Text>
      <QuickSaveButton onPress={onManual} title="Add manually" />
    </QuickLogBottomSheet>
  );
}

function MealTimeline({
  entries,
  onOpenMeal,
}: {
  entries: NutritionDiaryEntry[];
  onOpenMeal: (meal: MealKey) => void;
}) {
  return (
    <View style={styles.stack}>
      {MEALS.map((meal) => {
        const mealEntries = entries.filter(
          (entry) => entry.mealGroup === meal.storageGroup,
        );
        return (
          <Pressable
            accessibilityRole="button"
            key={meal.key}
            onPress={() => onOpenMeal(meal.key)}
            style={styles.timelineRow}
          >
            <View style={styles.timelineDot} />
            <View style={{ flex: 1 }}>
              <Text style={styles.timelineTitle}>{meal.label}</Text>
              <Text style={styles.muted}>
                {mealEntries.length
                  ? `${mealEntries.length} entries - ${Math.round(mealEntries.reduce((total, entry) => total + entry.calories, 0))} cal`
                  : "Log your first meal"}
              </Text>
            </View>
            <Text style={styles.timelineAction}>Add</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

function FoodRow({
  entry,
  onDelete,
}: {
  entry: NutritionDiaryEntry;
  onDelete: () => void;
}) {
  return (
    <View style={styles.foodRow}>
      <View style={styles.foodThumb}>
        <AppIcon color="#6ee7c8" decorative name="nutrition" size={18} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={styles.foodName}>{entry.foodName}</Text>
        <Text style={styles.muted}>
          {entry.quantity} {entry.unit} - {Math.round(entry.calories)} cal
        </Text>
        <Text style={styles.foodMacro}>
          {Math.round(entry.proteinG)}g protein - {Math.round(entry.carbsG)}g
          carbs - {Math.round(entry.fatG)}g fat
        </Text>
      </View>
      <View style={styles.rowActions}>
        <SmallAction label="Copy" />
        <Pressable accessibilityRole="button" onPress={onDelete}>
          <Text style={styles.deleteText}>Delete</Text>
        </Pressable>
      </View>
    </View>
  );
}

function ReportsPreview({
  entries,
  summary,
  waterGoal,
}: {
  entries: NutritionDiaryEntry[];
  summary: DailyNutritionSummary | null;
  waterGoal: WaterGoal | null;
}) {
  return (
    <AppCard style={styles.darkCard}>
      <Text style={styles.darkTitle}>Reports preview</Text>
      <Text style={styles.darkMuted}>
        Based on your logs: {entries.length} food entries,{" "}
        {Math.round(summary?.proteinGrams ?? 0)}g protein,{" "}
        {formatWater(waterGoal?.currentMl ?? 0)} water.
      </Text>
      <ChartCard
        title="Macro split"
        values={[
          summary?.proteinGrams ?? 0,
          summary?.carbsGrams ?? 0,
          summary?.fatGrams ?? 0,
        ].map((value) => Math.min(1, value / 120))}
      />
    </AppCard>
  );
}

function MacroCard({
  helper,
  label,
  target,
  value,
  valueRatio,
  water = false,
}: {
  helper: string;
  label: string;
  target: string;
  value: string;
  valueRatio: number;
  water?: boolean;
}) {
  return (
    <AppCard style={styles.macroCard}>
      <View style={styles.cardTop}>
        <Text style={styles.macroLabel}>{label}</Text>
        <AppIcon
          color={water ? "#38bdf8" : "#6ee7c8"}
          decorative
          name={water ? "water" : "nutrition"}
          size={18}
        />
      </View>
      <Text style={styles.macroValue}>{value}</Text>
      <Text style={styles.muted}>Target: {target}</Text>
      <ProgressBar color={water ? "#38bdf8" : "#6ee7c8"} value={valueRatio} />
      <Text style={styles.helper}>{helper}</Text>
    </AppCard>
  );
}

function HeroMetric({
  label,
  progress,
  value,
  water = false,
}: {
  label: string;
  progress: number;
  value: string;
  water?: boolean;
}) {
  return (
    <View style={styles.heroMetric}>
      <Text style={styles.heroMetricLabel}>{label}</Text>
      <Text style={styles.heroMetricValue}>{value}</Text>
      <ProgressBar color={water ? "#38bdf8" : "#6ee7c8"} value={progress} />
    </View>
  );
}

function ChartCard({
  title,
  values,
  water = false,
}: {
  title: string;
  values: number[];
  water?: boolean;
}) {
  return (
    <View style={styles.chartBlock}>
      <Text style={styles.chartTitle}>{title}</Text>
      <View style={styles.barRow}>
        {values.map((value, index) => (
          <View key={`${title}-${index}`} style={styles.barTrack}>
            <View
              style={[
                styles.barFill,
                {
                  backgroundColor: water ? "#38bdf8" : "#6ee7c8",
                  height: `${Math.max(10, Math.min(100, value * 100))}%`,
                },
              ]}
            />
          </View>
        ))}
      </View>
    </View>
  );
}

function LibraryMealCard({
  meta,
  name,
  onAdd,
}: {
  meta: string;
  name: string;
  onAdd: () => void;
}) {
  return (
    <AppCard style={styles.darkCard}>
      <FoodMedia label="Saved meal" />
      <Text style={styles.darkTitle}>{name}</Text>
      <Text style={styles.darkMuted}>{meta}</Text>
      <View style={styles.actionRow}>
        <GhostButton label="Add to today" onPress={onAdd} />
        <SmallAction label="Edit" />
        <SmallAction label="Duplicate" />
      </View>
    </AppCard>
  );
}

function MockMealCard({
  meal,
  onAdd,
}: {
  meal: { calories: number; mealType: string; name: string; protein: number };
  onAdd: () => void;
}) {
  return (
    <AppCard style={styles.darkCard}>
      <FoodMedia label="Meal thumbnail" />
      <Text style={styles.darkTitle}>{meal.name}</Text>
      <Text style={styles.darkMuted}>
        {meal.mealType} - {meal.calories} cal - {meal.protein}g protein
      </Text>
      <GhostButton label="Quick add" onPress={onAdd} />
    </AppCard>
  );
}

function RecipeCard({
  mock,
  name,
  onAdd,
  servings,
}: {
  mock?: { calories: number; protein: number; tags: string[] };
  name: string;
  onAdd?: () => void;
  servings: number;
}) {
  return (
    <AppCard style={styles.darkCard}>
      <FoodMedia label="Recipe image" />
      <Text style={styles.darkTitle}>{name}</Text>
      <Text style={styles.darkMuted}>
        {servings} servings
        {mock
          ? ` - ${mock.calories} cal - ${mock.protein}g protein per serving`
          : ""}
      </Text>
      {mock ? (
        <View style={styles.chipRow}>
          {mock.tags.map((tag) => (
            <Pill key={tag} label={tag} />
          ))}
        </View>
      ) : null}
      <View style={styles.actionRow}>
        <GhostButton label="Add serving" onPress={onAdd ?? (() => undefined)} />
        <SmallAction label="Recipe detail" />
      </View>
    </AppCard>
  );
}

function FoodMedia({ label }: { label: string }) {
  return (
    <View style={styles.foodMedia}>
      <AppIcon color="#6ee7c8" decorative name="source" size={22} />
      <Text style={styles.mediaText}>{label}</Text>
    </View>
  );
}

function BarcodePlaceholder() {
  return (
    <AppCard style={styles.darkCard}>
      <Text style={styles.darkTitle}>Barcode scan</Text>
      <Text style={styles.darkMuted}>
        Ready to scan, searching product, product found, product not found, and
        manual fallback states are prepared. Barcode lookup is coming soon. You
        can add this manually for now.
      </Text>
    </AppCard>
  );
}

function SmartLogPlaceholder() {
  return (
    <AppCard style={styles.darkCard}>
      <Text style={styles.darkTitle}>Smart Log drafts</Text>
      <Text style={styles.darkMuted}>
        Estimated draft. Review before saving. AI estimates are placeholders
        until a trusted backend is connected.
      </Text>
    </AppCard>
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

function QuickAction({
  icon,
  label,
  onPress,
}: {
  icon: string;
  label: string;
  onPress: () => void;
}) {
  return (
    <Pressable
      accessibilityLabel={label}
      accessibilityRole="button"
      onPress={onPress}
      style={styles.quickAction}
    >
      <AppIcon color="#6ee7c8" decorative name={icon as never} size={22} />
      <Text style={styles.quickActionText}>{label}</Text>
    </Pressable>
  );
}

function Chip({
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
      accessibilityState={{ selected }}
      onPress={onPress}
      style={[styles.chip, selected ? styles.chipSelected : null]}
    >
      <Text
        style={[styles.chipText, selected ? styles.chipTextSelected : null]}
      >
        {label}
      </Text>
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

function SmallAction({ label }: { label: string }) {
  return (
    <Pressable accessibilityRole="button" style={styles.smallAction}>
      <Text style={styles.smallActionText}>{label}</Text>
    </Pressable>
  );
}

function SuccessToast({
  message,
  onDismiss,
}: {
  message: string;
  onDismiss: () => void;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onDismiss}
      style={styles.successToast}
    >
      <AppIcon color="#10201d" decorative name="success" size={20} />
      <Text style={styles.successText}>{message}</Text>
    </Pressable>
  );
}

function SafetyCard() {
  return (
    <AppCard backgroundColor="#fff7ed">
      <Text style={styles.safetyText}>{SAFETY_COPY}</Text>
    </AppCard>
  );
}

function ProgressBar({ color, value }: { color: string; value: number }) {
  return (
    <View
      accessibilityLabel={`Progress ${Math.round(Math.max(0, Math.min(1, value)) * 100)} percent`}
      style={styles.progressTrack}
    >
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

function formatWater(amountMl: number) {
  return amountMl >= 1000
    ? `${(amountMl / 1000).toFixed(1)}L`
    : `${Math.round(amountMl)}ml`;
}

function toTab(tab?: string): NutritionTab {
  return TABS.some((item) => item.key === tab)
    ? (tab as NutritionTab)
    : "today";
}

const styles = StyleSheet.create({
  actionRow: {
    alignItems: "center",
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginTop: 12,
  },
  barFill: {
    borderRadius: 999,
    bottom: 0,
    position: "absolute",
    width: "100%",
  },
  barRow: {
    alignItems: "flex-end",
    flexDirection: "row",
    gap: 8,
    height: 98,
    marginTop: 12,
  },
  barTrack: {
    backgroundColor: "rgba(255,255,255,0.10)",
    borderRadius: 999,
    flex: 1,
    height: "100%",
    overflow: "hidden",
  },
  cardTop: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  chartBlock: { marginTop: 12 },
  chartTitle: { color: "#f8fafc", fontWeight: "900" },
  chip: {
    backgroundColor: "rgba(15,23,42,0.08)",
    borderColor: "rgba(15,23,42,0.12)",
    borderRadius: 999,
    borderWidth: 1,
    minHeight: 42,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  chipRow: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  chipSelected: { backgroundColor: "#111827", borderColor: "#6ee7c8" },
  chipText: { color: "#475569", fontWeight: "900" },
  chipTextSelected: { color: "#f8fafc" },
  darkCard: {
    backgroundColor: "#111827",
    borderColor: "rgba(255,255,255,0.12)",
    borderWidth: 1,
  },
  darkHero: {
    backgroundColor: "#0f172a",
    borderColor: "#6ee7c8",
    borderWidth: 1,
  },
  darkInput: {
    backgroundColor: "rgba(255,255,255,0.08)",
    borderColor: "rgba(255,255,255,0.14)",
    borderRadius: 16,
    borderWidth: 1,
    color: "#f8fafc",
    flex: 1,
    minHeight: 48,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  darkMuted: { color: "#cbd5e1", lineHeight: 21, marginTop: 6 },
  darkTitle: { color: "#f8fafc", fontSize: 20, fontWeight: "900" },
  deleteText: { color: "#fca5a5", fontSize: 12, fontWeight: "900" },
  foodMacro: { color: "#94a3b8", fontSize: 12, marginTop: 4 },
  foodMedia: {
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.08)",
    borderColor: "#6ee7c8",
    borderRadius: 22,
    borderWidth: 1,
    gap: 8,
    height: 130,
    justifyContent: "center",
    marginBottom: 12,
  },
  foodName: { color: "#f8fafc", fontSize: 16, fontWeight: "900" },
  foodRow: {
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.07)",
    borderRadius: 18,
    flexDirection: "row",
    gap: 10,
    padding: 10,
  },
  foodThumb: {
    alignItems: "center",
    backgroundColor: "rgba(110,231,200,0.12)",
    borderRadius: 14,
    height: 44,
    justifyContent: "center",
    width: 44,
  },
  ghostButton: {
    alignItems: "center",
    borderColor: "rgba(255,255,255,0.18)",
    borderRadius: 999,
    borderWidth: 1,
    minHeight: 42,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  ghostText: { color: "#f8fafc", fontWeight: "900" },
  helper: { color: "#94a3b8", fontSize: 12, marginTop: 8 },
  heroIcon: {
    alignItems: "center",
    backgroundColor: "rgba(110,231,200,0.12)",
    borderRadius: 20,
    height: 52,
    justifyContent: "center",
    width: 52,
  },
  heroMetric: {
    backgroundColor: "rgba(255,255,255,0.08)",
    borderRadius: 18,
    flex: 1,
    minWidth: "31%",
    padding: 12,
  },
  heroMetricLabel: { color: "#94a3b8", fontSize: 12, fontWeight: "900" },
  heroMetricValue: {
    color: "#f8fafc",
    fontSize: 14,
    fontWeight: "900",
    marginTop: 4,
  },
  heroMetrics: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    marginTop: 16,
  },
  heroSubtitle: { color: "#cbd5e1", lineHeight: 21, marginTop: 6 },
  heroTitle: {
    color: "#f8fafc",
    fontSize: 30,
    fontWeight: "900",
    marginTop: 14,
  },
  inputGrid: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  macroCard: {
    backgroundColor: "#111827",
    borderColor: "rgba(255,255,255,0.12)",
    borderWidth: 1,
    flexBasis: "47%",
    flexGrow: 1,
  },
  macroGrid: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  macroLabel: { color: "#94a3b8", fontSize: 12, fontWeight: "900" },
  macroValue: {
    color: "#f8fafc",
    fontSize: 18,
    fontWeight: "900",
    marginTop: 8,
  },
  mealCard: {
    backgroundColor: "#111827",
    borderColor: "rgba(255,255,255,0.12)",
    borderWidth: 1,
  },
  mealHeader: {
    alignItems: "center",
    flexDirection: "row",
    gap: 10,
    justifyContent: "space-between",
    marginBottom: 12,
  },
  mealTitle: { color: "#f8fafc", fontSize: 20, fontWeight: "900" },
  mediaText: { color: "#cbd5e1", fontSize: 12, fontWeight: "900" },
  muted: { color: "#94a3b8", lineHeight: 20, marginTop: 4 },
  pill: {
    backgroundColor: "rgba(255,255,255,0.10)",
    borderRadius: 999,
    minHeight: 34,
    paddingHorizontal: 11,
    paddingVertical: 8,
  },
  pillText: { color: "#e2e8f0", fontSize: 12, fontWeight: "900" },
  progressFill: { borderRadius: 999, height: "100%" },
  progressTrack: {
    backgroundColor: "rgba(255,255,255,0.12)",
    borderRadius: 999,
    height: 9,
    marginTop: 10,
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
    justifyContent: "center",
    minHeight: 92,
    padding: 12,
  },
  quickActionText: {
    color: "#f8fafc",
    fontSize: 12,
    fontWeight: "900",
    textAlign: "center",
  },
  quickGrid: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  rowActions: { alignItems: "flex-end", gap: 8 },
  safetyText: { color: "#9a3412", lineHeight: 20 },
  sheetLabel: { color: "#cbd5e1", fontWeight: "900" },
  sheetText: { color: "#cbd5e1", lineHeight: 21 },
  skeletonLine: {
    backgroundColor: "rgba(255,255,255,0.12)",
    borderRadius: 999,
    height: 14,
    marginTop: 12,
    width: "90%",
  },
  smallAction: {
    backgroundColor: "rgba(255,255,255,0.08)",
    borderRadius: 999,
    minHeight: 34,
    paddingHorizontal: 11,
    paddingVertical: 8,
  },
  smallActionText: { color: "#e2e8f0", fontSize: 12, fontWeight: "900" },
  stack: { gap: 14 },
  successText: { color: "#10201d", fontWeight: "900" },
  successToast: {
    alignItems: "center",
    alignSelf: "flex-start",
    backgroundColor: "#6ee7c8",
    borderRadius: 999,
    flexDirection: "row",
    gap: 8,
    minHeight: 44,
    paddingHorizontal: 14,
  },
  tabRow: { gap: 8, paddingRight: 16 },
  timelineAction: { color: "#6ee7c8", fontWeight: "900" },
  timelineDot: {
    backgroundColor: "#6ee7c8",
    borderRadius: 999,
    height: 12,
    width: 12,
  },
  timelineRow: {
    alignItems: "center",
    backgroundColor: "#111827",
    borderColor: "rgba(255,255,255,0.12)",
    borderRadius: 20,
    borderWidth: 1,
    flexDirection: "row",
    gap: 12,
    padding: 14,
  },
  timelineTitle: { color: "#f8fafc", fontSize: 16, fontWeight: "900" },
  waterCard: {
    backgroundColor: "#082f49",
    borderColor: "#38bdf8",
    borderWidth: 1,
  },
  waterTitle: { color: "#bae6fd", fontSize: 20, fontWeight: "900" },
  waterValue: {
    color: "#f0f9ff",
    fontSize: 28,
    fontWeight: "900",
    marginTop: 6,
  },
});
