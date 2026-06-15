import { Href, router } from "expo-router";
import { Pressable, StyleSheet, Text, View } from "react-native";

import {
  HealthDonutChart,
  HealthMiniLineChart,
  HealthProgressRing,
} from "@/components/health/HealthHubCharts";
import { AppCard, AppChip, AppIcon, AppSection } from "@/components/ui";
import type { AppIconName } from "@/constants/appIcons";
import { healthRealmAccents } from "@/theme/healthTheme";
import { useAppTheme } from "@/theme/ThemeProvider";
import { fontSizes, spacing } from "@/theme/tokens";
import type {
  DailyNutritionSummary,
  NutritionDiaryEntry,
  NutritionMealGroup,
  NutritionTarget,
  Recipe,
  SavedMeal,
  WaterGoal,
} from "@/types/nutrition";

const ORANGE = "#ea580c";
const ORANGE_SOFT = "#ffedd5";
const GREEN = "#15803d";
const GREEN_SOFT = "#dcfce7";

type MealKey = "breakfast" | "lunch" | "dinner" | "snacks";

const MEALS: Array<{ key: MealKey; label: string; group: NutritionMealGroup }> =
  [
    { group: "breakfast", key: "breakfast", label: "Breakfast" },
    { group: "lunch", key: "lunch", label: "Lunch" },
    { group: "dinner", key: "dinner", label: "Dinner" },
    { group: "snacks", key: "snacks", label: "Snacks" },
  ];

export function FoodRealmOverview({
  entries,
  onAddWater,
  onOpenMeal,
  onOpenPlanner,
  onScanFood,
  recipes,
  savedMeals,
  summary,
  target,
  waterGoal,
}: {
  entries: NutritionDiaryEntry[];
  onAddWater: () => void;
  onOpenMeal: (meal: MealKey) => void;
  onOpenPlanner: () => void;
  onScanFood: () => void;
  recipes: Recipe[];
  savedMeals: SavedMeal[];
  summary: DailyNutritionSummary | null;
  target: NutritionTarget | null;
  waterGoal: WaterGoal | null;
}) {
  const calories = summary?.calories ?? 0;
  const calorieTarget = target?.caloriesTarget ?? 2000;
  const water = waterGoal?.currentMl ?? summary?.waterMl ?? 0;
  const waterTarget = waterGoal?.targetMl ?? target?.waterTargetMl ?? 2500;

  return (
    <>
      <NutritionHero
        calories={calories}
        calorieTarget={calorieTarget}
        entries={entries}
        onOpenMeal={onOpenMeal}
        onScanFood={onScanFood}
        summary={summary}
        target={target}
        water={water}
        waterTarget={waterTarget}
      />
      <NutritionQuickActions
        onAddWater={onAddWater}
        onOpenMeal={onOpenMeal}
        onOpenPlanner={onOpenPlanner}
      />
      <NutrientSummary entries={entries} summary={summary} target={target} />
      <MealCards entries={entries} onOpenMeal={onOpenMeal} />
      <RecentFoods entries={entries} />
      <LibraryPreview recipes={recipes} savedMeals={savedMeals} />
      <ScanFoodCard onPress={onScanFood} />
      <HydrationCard
        currentMl={water}
        onAddWater={onAddWater}
        targetMl={waterTarget}
      />
      <PlanningShortcut onPress={onOpenPlanner} />
      <InteractionReminder />
    </>
  );
}

function NutritionHero({
  calories,
  calorieTarget,
  entries,
  onOpenMeal,
  onScanFood,
  summary,
  target,
  water,
  waterTarget,
}: {
  calories: number;
  calorieTarget: number;
  entries: NutritionDiaryEntry[];
  onOpenMeal: (meal: MealKey) => void;
  onScanFood: () => void;
  summary: DailyNutritionSummary | null;
  target: NutritionTarget | null;
  water: number;
  waterTarget: number;
}) {
  const { theme } = useAppTheme();
  const progress = Math.min(1, calories / Math.max(1, calorieTarget));
  const proteinProgress = (summary?.proteinGrams ?? 0) / Math.max(1, target?.proteinTargetG ?? 140);
  const waterProgress = water / Math.max(1, waterTarget);
  // UI-only balance score until a reviewed nutrition scoring model is connected.
  const score = Math.min(
    98,
    Math.round(
      35 +
        Math.min(25, progress * 25) +
        Math.min(20, proteinProgress * 20) +
        Math.min(15, waterProgress * 15) +
        Math.min(3, entries.length) * 1,
    ),
  );
  return (
    <AppCard style={[styles.hero, { borderColor: `${ORANGE}35` }]}>
      <View style={styles.heroGlow} />
      <View style={styles.heroTop}>
        <View style={styles.heroCopy}>
          <Text style={styles.heroKicker}>TODAY'S NUTRITION</Text>
          <Text style={[styles.heroTitle, { color: theme.text }]}>
            Fuel your day, your way
          </Text>
          <Text style={[styles.heroBody, { color: theme.mutedText }]}>
            A practical daily target without pressure. Log what is useful and
            skip what is not.
          </Text>
        </View>
        <View
          accessible
          accessibilityLabel={`Nutrition balance score ${score} out of 100`}
          style={styles.targetRing}
        >
          <HealthProgressRing color={healthRealmAccents.food} progress={score} trackColor={theme.primarySoft} size={94} />
          <View style={styles.scoreText}>
            <Text style={[styles.targetValue, { color: theme.text }]}>{score}</Text>
            <Text style={[styles.targetUnit, { color: theme.mutedText }]}>balance</Text>
          </View>
        </View>
      </View>
      <View style={styles.progressTrack}>
        <View
          style={[
            styles.progressFill,
            { width: `${Math.max(4, progress * 100)}%` },
          ]}
        />
      </View>
      <View style={styles.heroActions}>
        <FoodButton
          icon="add"
          label="Log meal"
          onPress={() => onOpenMeal("breakfast")}
          primary
        />
        <FoodButton icon="ai_draft" label="Scan food" onPress={onScanFood} />
      </View>
    </AppCard>
  );
}

function NutritionQuickActions({
  onAddWater,
  onOpenMeal,
  onOpenPlanner,
}: {
  onAddWater: () => void;
  onOpenMeal: (meal: MealKey) => void;
  onOpenPlanner: () => void;
}) {
  return (
    <AppSection subtitle="Continue existing food and nutrition flows." title="Quick actions">
      <View style={styles.quickActions}>
        <AppChip label="Log meal" onPress={() => onOpenMeal("breakfast")} selected />
        <AppChip label="Scan barcode" onPress={() => router.push("/food/barcode-scanner" as Href)} />
        <AppChip label="Smart-log image" onPress={() => router.push("/food/smart-log" as Href)} />
        <AppChip label="Add water" onPress={onAddWater} />
        <AppChip label="Saved meals" onPress={() => router.push({ pathname: "/food", params: { tab: "saved_meals" } } as Href)} />
        <AppChip label="Recipes" onPress={onOpenPlanner} />
        <AppChip label="Daily note" onPress={() => router.push({ pathname: "/food", params: { tab: "settings" } } as Href)} />
        <AppChip label="View reports" onPress={() => router.push({ pathname: "/food", params: { tab: "reports" } } as Href)} />
      </View>
    </AppSection>
  );
}

function RecentFoods({ entries }: { entries: NutritionDiaryEntry[] }) {
  const { theme } = useAppTheme();
  return (
    <AppSection subtitle="Recent real diary entries and their source." title="Recent foods">
      {entries.length ? (
        <View style={styles.recentList}>
          {entries.slice(0, 4).map((entry) => (
            <AppCard key={entry.id} padding="sm" style={styles.recentCard}>
              <AppIcon color={healthRealmAccents.food} decorative name="nutrition" size={18} />
              <View style={styles.recentCopy}>
                <Text numberOfLines={1} style={[styles.recentTitle, { color: theme.text }]}>{entry.foodName}</Text>
                <Text style={[styles.recentMeta, { color: theme.mutedText }]}>
                  {Math.round(entry.calories)} kcal · {entry.entrySource?.replace(/_/g, " ") ?? "manual"}
                </Text>
              </View>
              <AppChip label={entry.mealGroup} variant="muted" />
            </AppCard>
          ))}
        </View>
      ) : (
        <AppCard padding="sm" variant="soft">
          <Text style={[styles.recentMeta, { color: theme.mutedText }]}>No recent foods yet. Log a meal when ready.</Text>
        </AppCard>
      )}
    </AppSection>
  );
}

function LibraryPreview({
  recipes,
  savedMeals,
}: {
  recipes: Recipe[];
  savedMeals: SavedMeal[];
}) {
  const { theme } = useAppTheme();
  return (
    <AppSection subtitle="Reusable meals and recipes already saved." title="Meal library">
      <View style={styles.libraryGrid}>
        <AppCard onPress={() => router.push({ pathname: "/food", params: { tab: "saved_meals" } } as Href)} padding="sm" style={styles.libraryCard}>
          <HealthMiniLineChart color={healthRealmAccents.food} data={[0, 1, savedMeals.length, 1, savedMeals.length + 1]} />
          <Text style={[styles.libraryValue, { color: theme.text }]}>{savedMeals.length}</Text>
          <Text style={[styles.libraryLabel, { color: theme.mutedText }]}>Saved meals</Text>
        </AppCard>
        <AppCard onPress={() => router.push({ pathname: "/food", params: { tab: "recipes" } } as Href)} padding="sm" style={styles.libraryCard}>
          <HealthDonutChart colors={[healthRealmAccents.food, healthRealmAccents.health]} trackColor={theme.primarySoft} values={[recipes.length, Math.max(1, savedMeals.length)]} />
          <Text style={[styles.libraryValue, { color: theme.text }]}>{recipes.length}</Text>
          <Text style={[styles.libraryLabel, { color: theme.mutedText }]}>Recipes</Text>
        </AppCard>
      </View>
    </AppSection>
  );
}

function FoodButton({
  icon,
  label,
  onPress,
  primary = false,
}: {
  icon: AppIconName;
  label: string;
  onPress: () => void;
  primary?: boolean;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={[styles.foodButton, primary ? styles.foodButtonPrimary : null]}
    >
      <AppIcon
        color={primary ? "#ffffff" : ORANGE}
        decorative
        name={icon}
        size={17}
      />
      <Text
        style={[
          styles.foodButtonText,
          primary ? styles.foodButtonTextPrimary : null,
        ]}
      >
        {label}
      </Text>
    </Pressable>
  );
}

function NutrientSummary({
  entries,
  summary,
  target,
}: {
  entries: NutritionDiaryEntry[];
  summary: DailyNutritionSummary | null;
  target: NutritionTarget | null;
}) {
  const fiber = entries.reduce(
    (total, entry) => total + (entry.fiberG ?? 0),
    0,
  );
  const nutrients = [
    {
      label: "Protein",
      target: target?.proteinTargetG ?? 140,
      unit: "g",
      value: summary?.proteinGrams ?? 0,
    },
    {
      label: "Carbs",
      target: target?.carbsTargetG ?? 250,
      unit: "g",
      value: summary?.carbsGrams ?? 0,
    },
    {
      label: "Fat",
      target: target?.fatTargetG ?? 70,
      unit: "g",
      value: summary?.fatGrams ?? 0,
    },
    {
      label: "Fiber",
      target: target?.fiberTargetG ?? 30,
      unit: "g",
      value: fiber,
    },
    {
      label: "Water",
      target: (target?.waterTargetMl ?? 2500) / 1000,
      unit: "L",
      value: (summary?.waterMl ?? 0) / 1000,
    },
    {
      label: "Food logs",
      target: 3,
      unit: " today",
      value: summary?.foodLogCount ?? 0,
    },
  ];
  const { theme } = useAppTheme();
  return (
    <AppSection
      subtitle="Macros and practical daily signals, shown with units."
      title="Nutrition summary"
    >
      <View style={styles.nutrientGrid}>
        {nutrients.map((item) => {
          const progress = Math.min(1, item.value / Math.max(1, item.target));
          return (
            <View
              key={item.label}
              style={[
                styles.nutrientCard,
                { backgroundColor: theme.surface, borderColor: theme.border },
              ]}
            >
              <Text style={[styles.nutrientLabel, { color: theme.mutedText }]}>
                {item.label}
              </Text>
              <Text style={[styles.nutrientValue, { color: theme.text }]}>
                {formatValue(item.value)}
                {item.unit}
              </Text>
              <Text style={[styles.nutrientTarget, { color: theme.mutedText }]}>
                Daily target: {formatValue(item.target)}
                {item.unit}
              </Text>
              <View
                style={[
                  styles.macroTrack,
                  { backgroundColor: theme.primarySoft },
                ]}
              >
                <View
                  style={[
                    styles.macroFill,
                    { width: `${Math.max(4, progress * 100)}%` },
                  ]}
                />
              </View>
            </View>
          );
        })}
      </View>
    </AppSection>
  );
}

function MealCards({
  entries,
  onOpenMeal,
}: {
  entries: NutritionDiaryEntry[];
  onOpenMeal: (meal: MealKey) => void;
}) {
  const { theme } = useAppTheme();
  return (
    <AppSection
      subtitle="Today's meals. Add details only when they are useful."
      title="Meals"
    >
      <View style={styles.mealGrid}>
        {MEALS.map((meal) => {
          const mealEntries = entries.filter(
            (entry) => entry.mealGroup === meal.group,
          );
          const calories = mealEntries.reduce(
            (total, entry) => total + entry.calories,
            0,
          );
          return (
            <Pressable
              accessibilityRole="button"
              key={meal.key}
              onPress={() => onOpenMeal(meal.key)}
              style={({ pressed }) => [
                styles.mealCard,
                { backgroundColor: theme.surface, borderColor: theme.border },
                pressed ? styles.pressed : null,
              ]}
            >
              <View style={styles.mealImage}>
                <AppIcon color={ORANGE} decorative name="nutrition" size={24} />
              </View>
              <Text style={[styles.mealTitle, { color: theme.text }]}>
                {meal.label}
              </Text>
              <Text style={[styles.mealMeta, { color: theme.mutedText }]}>
                {mealEntries.length
                  ? `${mealEntries.length} entries | ${Math.round(calories)} kcal`
                  : "Nothing logged yet. Add when ready."}
              </Text>
              <Text style={styles.mealAction}>
                {mealEntries.length ? "Add another" : "Log meal"}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </AppSection>
  );
}

function ScanFoodCard({ onPress }: { onPress: () => void }) {
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={styles.scanCard}
    >
      <View style={styles.scanIcon}>
        <AppIcon color={ORANGE} decorative name="ai_draft" size={25} />
      </View>
      <Text style={styles.scanTitle}>Scan or describe food with AI</Text>
      <Text style={styles.scanBody}>
        Create an editable estimate, review it, then choose whether to save.
      </Text>
    </Pressable>
  );
}

function HydrationCard({
  currentMl,
  onAddWater,
  targetMl,
}: {
  currentMl: number;
  onAddWater: () => void;
  targetMl: number;
}) {
  const { theme } = useAppTheme();
  const progress = Math.min(1, currentMl / Math.max(1, targetMl));
  return (
    <AppSection
      subtitle="Today's hydration, shown in milliliters and liters."
      title="Water and hydration"
    >
      <Pressable accessibilityRole="button" onPress={onAddWater}>
        <AppCard style={[styles.hydrationCard, { borderColor: "#bae6fd" }]}>
          <View style={styles.hydrationIcon}>
            <AppIcon color="#0284c7" decorative name="water" size={23} />
          </View>
          <View style={styles.hydrationCopy}>
            <Text style={[styles.hydrationValue, { color: theme.text }]}>
              {formatWater(currentMl)} / {formatWater(targetMl)}
            </Text>
            <Text style={[styles.hydrationBody, { color: theme.mutedText }]}>
              {currentMl
                ? "Logged today"
                : "Start with your first glass when ready"}
            </Text>
            <View style={styles.waterTrack}>
              <View
                style={[
                  styles.waterFill,
                  { width: `${Math.max(4, progress * 100)}%` },
                ]}
              />
            </View>
          </View>
          <Text style={styles.hydrationAction}>Add</Text>
        </AppCard>
      </Pressable>
    </AppSection>
  );
}

function PlanningShortcut({ onPress }: { onPress: () => void }) {
  const { theme } = useAppTheme();
  return (
    <AppSection
      subtitle="Turn saved meals into a practical plan."
      title="Plan and shop"
    >
      <Pressable accessibilityRole="button" onPress={onPress}>
        <AppCard style={[styles.planningCard, { borderColor: theme.border }]}>
          <View style={styles.planningIcon}>
            <AppIcon color={GREEN} decorative name="planning" size={22} />
          </View>
          <View style={styles.planningCopy}>
            <Text style={[styles.planningTitle, { color: theme.text }]}>
              Food planning and shopping
            </Text>
            <Text style={[styles.planningBody, { color: theme.mutedText }]}>
              Open recipes and saved meals to prepare your next shopping list.
            </Text>
          </View>
          <Text style={styles.planningAction}>Open</Text>
        </AppCard>
      </Pressable>
    </AppSection>
  );
}

function InteractionReminder() {
  const { theme } = useAppTheme();
  return (
    <AppCard style={[styles.interactionCard, { borderColor: "#fde68a" }]}>
      <View style={styles.interactionIcon}>
        <AppIcon color="#a16207" decorative name="medication" size={21} />
      </View>
      <View style={styles.interactionCopy}>
        <Text style={[styles.interactionTitle, { color: theme.text }]}>
          Medication and supplement reminder
        </Text>
        <Text style={[styles.interactionBody, { color: theme.mutedText }]}>
          Some foods and supplements can affect medicines. Review instructions
          or ask a qualified professional when unsure.
        </Text>
        <Pressable
          accessibilityRole="button"
          onPress={() => router.push("/medication" as Href)}
        >
          <Text style={styles.interactionAction}>
            Review medication and supplements
          </Text>
        </Pressable>
      </View>
    </AppCard>
  );
}

function formatValue(value: number) {
  return Number.isInteger(value) ? value.toLocaleString() : value.toFixed(1);
}

function formatWater(amountMl: number) {
  return amountMl >= 1000
    ? `${(amountMl / 1000).toFixed(1)} L`
    : `${Math.round(amountMl)} ml`;
}

const styles = StyleSheet.create({
  foodButton: {
    alignItems: "center",
    backgroundColor: "#ffffff",
    borderColor: `${ORANGE}40`,
    borderRadius: 999,
    borderWidth: 1,
    flexDirection: "row",
    gap: 7,
    minHeight: 46,
    paddingHorizontal: 16,
  },
  foodButtonPrimary: { backgroundColor: ORANGE, borderColor: ORANGE },
  foodButtonText: { color: ORANGE, fontSize: 12, fontWeight: "900" },
  foodButtonTextPrimary: { color: "#ffffff" },
  hero: {
    backgroundColor: "#fff7ed",
    borderWidth: 1,
    overflow: "hidden",
    padding: 20,
  },
  heroActions: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 9,
    marginTop: 18,
  },
  heroBody: { fontSize: 13, lineHeight: 20, marginTop: 7 },
  heroCopy: { flex: 1, minWidth: 180 },
  heroGlow: {
    backgroundColor: "rgba(251,146,60,0.14)",
    borderRadius: 999,
    height: 190,
    position: "absolute",
    right: -80,
    top: -90,
    width: 190,
  },
  heroKicker: {
    color: ORANGE,
    fontSize: 11,
    fontWeight: "900",
    letterSpacing: 1,
    textTransform: "uppercase",
  },
  heroTitle: { fontSize: 27, fontWeight: "900", lineHeight: 32, marginTop: 7 },
  heroTop: { alignItems: "center", flexDirection: "row", gap: 14 },
  hydrationAction: { color: "#0284c7", fontSize: 12, fontWeight: "900" },
  hydrationBody: { fontSize: 11, marginTop: 4 },
  hydrationCard: {
    alignItems: "center",
    backgroundColor: "#f0f9ff",
    borderWidth: 1,
    flexDirection: "row",
    gap: 12,
  },
  hydrationCopy: { flex: 1 },
  hydrationIcon: {
    alignItems: "center",
    backgroundColor: "#e0f2fe",
    borderRadius: 17,
    height: 48,
    justifyContent: "center",
    width: 48,
  },
  hydrationValue: { fontSize: 17, fontWeight: "900" },
  interactionAction: {
    color: "#a16207",
    fontSize: 12,
    fontWeight: "900",
    marginTop: 9,
  },
  interactionBody: { fontSize: 12, lineHeight: 18, marginTop: 5 },
  interactionCard: {
    alignItems: "flex-start",
    backgroundColor: "#fffbeb",
    borderWidth: 1,
    flexDirection: "row",
    gap: 12,
  },
  interactionCopy: { flex: 1 },
  interactionIcon: {
    alignItems: "center",
    backgroundColor: "#fef3c7",
    borderRadius: 16,
    height: 46,
    justifyContent: "center",
    width: 46,
  },
  interactionTitle: { fontSize: 15, fontWeight: "900" },
  macroFill: { backgroundColor: ORANGE, borderRadius: 999, height: "100%" },
  macroTrack: {
    borderRadius: 999,
    height: 7,
    marginTop: 10,
    overflow: "hidden",
  },
  mealAction: {
    color: ORANGE,
    fontSize: 11,
    fontWeight: "900",
    marginTop: "auto",
    paddingTop: 10,
  },
  mealCard: {
    borderRadius: 22,
    borderWidth: 1,
    flexBasis: "46%",
    flexGrow: 1,
    minHeight: 188,
    padding: 12,
  },
  mealGrid: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  mealImage: {
    alignItems: "center",
    backgroundColor: ORANGE_SOFT,
    borderRadius: 17,
    height: 72,
    justifyContent: "center",
  },
  mealMeta: { fontSize: 10, lineHeight: 15, marginTop: 4 },
  mealTitle: { fontSize: 15, fontWeight: "900", marginTop: 10 },
  nutrientCard: {
    borderRadius: 18,
    borderWidth: 1,
    flexBasis: "30%",
    flexGrow: 1,
    minHeight: 125,
    padding: 11,
  },
  nutrientGrid: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  nutrientLabel: {
    fontSize: 10,
    fontWeight: "900",
    textTransform: "uppercase",
  },
  nutrientTarget: { fontSize: 9, lineHeight: 13, marginTop: 4 },
  nutrientValue: { fontSize: 15, fontWeight: "900", marginTop: 5 },
  planningAction: { color: GREEN, fontSize: 12, fontWeight: "900" },
  planningBody: { fontSize: 11, lineHeight: 17, marginTop: 4 },
  planningCard: {
    alignItems: "center",
    backgroundColor: "#f0fdf4",
    borderWidth: 1,
    flexDirection: "row",
    gap: 12,
  },
  planningCopy: { flex: 1 },
  planningIcon: {
    alignItems: "center",
    backgroundColor: GREEN_SOFT,
    borderRadius: 17,
    height: 48,
    justifyContent: "center",
    width: 48,
  },
  planningTitle: { fontSize: 15, fontWeight: "900" },
  pressed: { opacity: 0.76, transform: [{ scale: 0.985 }] },
  quickActions: { flexDirection: "row", flexWrap: "wrap", gap: spacing.sm },
  recentCard: { alignItems: "center", borderWidth: 1, flexDirection: "row", gap: spacing.sm },
  recentCopy: { flex: 1, minWidth: 0 },
  recentList: { gap: spacing.sm },
  recentMeta: { fontSize: fontSizes.xs, lineHeight: 16 },
  recentTitle: { fontSize: fontSizes.sm, fontWeight: "900" },
  progressFill: { backgroundColor: ORANGE, borderRadius: 999, height: "100%" },
  progressTrack: {
    backgroundColor: "#fed7aa",
    borderRadius: 999,
    height: 9,
    marginTop: 18,
    overflow: "hidden",
  },
  scanBody: {
    color: "#9a3412",
    fontSize: 11,
    lineHeight: 17,
    marginTop: 5,
    maxWidth: 290,
    textAlign: "center",
  },
  scanCard: {
    alignItems: "center",
    backgroundColor: ORANGE_SOFT,
    borderColor: `${ORANGE}65`,
    borderRadius: 24,
    borderStyle: "dashed",
    borderWidth: 1,
    justifyContent: "center",
    minHeight: 126,
    padding: 18,
  },
  scanIcon: {
    alignItems: "center",
    backgroundColor: "#ffffff",
    borderRadius: 17,
    height: 48,
    justifyContent: "center",
    width: 48,
  },
  scanTitle: {
    color: "#7c2d12",
    fontSize: 16,
    fontWeight: "900",
    marginTop: 10,
    textAlign: "center",
  },
  targetRing: {
    alignItems: "center",
    borderRadius: 999,
    height: 94,
    justifyContent: "center",
    width: 94,
  },
  scoreText: { alignItems: "center", position: "absolute" },
  targetUnit: {
    color: "#9a3412",
    fontSize: 9,
    fontWeight: "800",
    marginTop: 2,
  },
  targetValue: { fontSize: 20, fontWeight: "900" },
  libraryCard: { flex: 1, minHeight: 130 },
  libraryGrid: { flexDirection: "row", gap: spacing.sm },
  libraryLabel: { fontSize: fontSizes.xs, fontWeight: "800", marginTop: 2 },
  libraryValue: { fontSize: fontSizes.lg, fontWeight: "900", marginTop: spacing.sm },
  waterFill: { backgroundColor: "#38bdf8", borderRadius: 999, height: "100%" },
  waterTrack: {
    backgroundColor: "#bae6fd",
    borderRadius: 999,
    height: 7,
    marginTop: 9,
    overflow: "hidden",
  },
});
