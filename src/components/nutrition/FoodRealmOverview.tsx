import { Href, router } from "expo-router";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { AppCard, AppIcon, AppSection } from "@/components/ui";
import type { AppIconName } from "@/constants/appIcons";
import { useAppTheme } from "@/theme/ThemeProvider";
import type {
  DailyNutritionSummary,
  NutritionDiaryEntry,
  NutritionMealGroup,
  NutritionTarget,
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
  summary,
  target,
  waterGoal,
}: {
  entries: NutritionDiaryEntry[];
  onAddWater: () => void;
  onOpenMeal: (meal: MealKey) => void;
  onOpenPlanner: () => void;
  onScanFood: () => void;
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
        onOpenMeal={onOpenMeal}
        onScanFood={onScanFood}
      />
      <NutrientSummary entries={entries} summary={summary} target={target} />
      <MealCards entries={entries} onOpenMeal={onOpenMeal} />
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
  onOpenMeal,
  onScanFood,
}: {
  calories: number;
  calorieTarget: number;
  onOpenMeal: (meal: MealKey) => void;
  onScanFood: () => void;
}) {
  const { theme } = useAppTheme();
  const progress = Math.min(1, calories / Math.max(1, calorieTarget));
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
          accessibilityLabel={`${Math.round(progress * 100)} percent of daily calorie target logged`}
          style={styles.targetRing}
        >
          <Text style={[styles.targetValue, { color: theme.text }]}>
            {Math.round(calories)}
          </Text>
          <Text style={styles.targetUnit}>of {calorieTarget} kcal</Text>
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
    backgroundColor: "#ffffff",
    borderColor: "#fdba74",
    borderRadius: 999,
    borderWidth: 7,
    height: 108,
    justifyContent: "center",
    width: 108,
  },
  targetUnit: {
    color: "#9a3412",
    fontSize: 9,
    fontWeight: "800",
    marginTop: 2,
  },
  targetValue: { fontSize: 20, fontWeight: "900" },
  waterFill: { backgroundColor: "#38bdf8", borderRadius: 999, height: "100%" },
  waterTrack: {
    backgroundColor: "#bae6fd",
    borderRadius: 999,
    height: 7,
    marginTop: 9,
    overflow: "hidden",
  },
});
