import { Href, router, useLocalSearchParams } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import { Text, TextInput, TouchableOpacity, View } from "react-native";

import { ScreenWrapper } from "@/components/layout/ScreenWrapper";
import { AppCard } from "@/components/ui/AppCard";
import { NUTRITION_MEAL_GROUP_OPTIONS } from "@/constants/nutritionOptions";
import {
  addFoodDetailsToDiary,
  getFavouriteFoods,
  removeFavouriteFood,
  saveFavouriteFood,
} from "@/lib/nutritionStorage";
import { getFoodDetails } from "@/services/nutrition/foodSearchService";
import type {
  FavouriteFood,
  FoodDetails,
  FoodSource,
  NutritionMealGroup,
  ServingOption,
} from "@/types/nutrition";

const INPUT_STYLE = {
  backgroundColor: "#ffffff",
  borderColor: "#fde68a",
  borderRadius: 16,
  borderWidth: 1,
  color: "#0f172a",
  minHeight: 50,
  paddingHorizontal: 14,
};

export default function FoodDetailsScreen() {
  const params = useLocalSearchParams<{
    mealGroup?: NutritionMealGroup;
    source?: FoodSource;
    sourceFoodId?: string;
  }>();
  const source = params.source;
  const sourceFoodId = params.sourceFoodId;
  const [details, setDetails] = useState<FoodDetails | null>(null);
  const [favourites, setFavourites] = useState<FavouriteFood[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [mealGroup, setMealGroup] = useState<NutritionMealGroup>(
    params.mealGroup ?? "breakfast",
  );
  const [quantity, setQuantity] = useState("1");
  const [selectedServingIndex, setSelectedServingIndex] = useState(0);
  const [showMoreNutrients, setShowMoreNutrients] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    Promise.resolve()
      .then(async () => {
        setLoading(true);
        setErrorMessage(null);

        if (!source || !sourceFoodId) {
          setErrorMessage("Food details are unavailable right now.");
          return;
        }

        const [nextDetails, nextFavourites] = await Promise.all([
          getFoodDetails(source, sourceFoodId),
          getFavouriteFoods(),
        ]);

        setDetails(nextDetails);
        setFavourites(nextFavourites);
        setQuantity(String(nextDetails?.defaultServingSize ?? 1));
        setSelectedServingIndex(0);

        if (!nextDetails) {
          setErrorMessage("Food details are unavailable right now.");
        }
      })
      .catch(() => {
        setErrorMessage("Food details are unavailable right now.");
      })
      .finally(() => {
        setLoading(false);
      });
  }, [source, sourceFoodId]);

  const selectedServing = details?.servingOptions[selectedServingIndex] ?? null;
  const calculatedNutrition = useMemo(() => {
    if (!details || !selectedServing) {
      return null;
    }

    return scaleNutrition(details, Number(quantity) || 0, selectedServing);
  }, [details, quantity, selectedServing]);
  const isFavourite = Boolean(
    details &&
    favourites.some(
      (favourite) =>
        favourite.source === details.source &&
        favourite.sourceFoodId === details.sourceFoodId,
    ),
  );

  async function toggleFavourite() {
    if (!details || !selectedServing) {
      return;
    }

    if (isFavourite) {
      await removeFavouriteFood(details.source, details.sourceFoodId);
    } else {
      await saveFavouriteFood({
        defaultQuantity: Number(quantity) || details.defaultServingSize,
        defaultUnit: selectedServing.unit,
        details,
      });
    }

    setFavourites(await getFavouriteFoods());
  }

  async function addToDiary() {
    if (!details || !selectedServing) {
      return;
    }

    await addFoodDetailsToDiary({
      details,
      mealGroup,
      quantity: Number(quantity) || details.defaultServingSize,
      serving: selectedServing,
    });

    const mealLabel =
      NUTRITION_MEAL_GROUP_OPTIONS.find((option) => option.key === mealGroup)
        ?.label ?? "Diary";

    setSuccessMessage(`Added to ${mealLabel}`);
    setTimeout(() => {
      router.replace({ pathname: "/(tabs)/food", params: { tab: "diary" } } as Href);
    }, 650);
  }

  if (loading) {
    return (
      <ScreenWrapper backgroundColor="#fffaf0">
        <AppCard>
          <Text style={{ color: "#64748b", lineHeight: 21 }}>
            Loading food details...
          </Text>
        </AppCard>
      </ScreenWrapper>
    );
  }

  if (!details || errorMessage) {
    return (
      <ScreenWrapper backgroundColor="#fffaf0">
        <AppCard>
          <Text style={{ color: "#0f172a", fontSize: 20, fontWeight: "900" }}>
            Food details
          </Text>
          <Text style={{ color: "#64748b", lineHeight: 21, marginTop: 8 }}>
            {errorMessage ?? "Food details are unavailable right now."}
          </Text>
          <TouchableOpacity
            activeOpacity={0.85}
            onPress={() =>
              router.replace({
                pathname: "/(tabs)/food",
                params: { tab: "add" },
              } as Href)
            }
            style={{
              alignItems: "center",
              backgroundColor: "#f59e0b",
              borderRadius: 18,
              justifyContent: "center",
              marginTop: 14,
              minHeight: 52,
            }}
          >
            <Text style={{ color: "#ffffff", fontSize: 16, fontWeight: "900" }}>
              Back to search
            </Text>
          </TouchableOpacity>
        </AppCard>
      </ScreenWrapper>
    );
  }

  return (
    <ScreenWrapper backgroundColor="#fffaf0">
      <View style={{ gap: 4 }}>
        <Text style={{ color: "#b45309", fontSize: 14, fontWeight: "800" }}>
          {getSourceLabel(details.source)} - {details.dataQuality ?? "unknown"}
        </Text>
        <Text style={{ color: "#0f172a", fontSize: 30, fontWeight: "900" }}>
          {details.name}
        </Text>
        {details.brand ? (
          <Text style={{ color: "#64748b", lineHeight: 20 }}>
            {details.brand}
          </Text>
        ) : null}
      </View>

      <AppCard>
        <View style={{ gap: 12 }}>
          <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
            <Badge label={getSourceLabel(details.source)} />
            <Badge label={details.dataQuality ?? "unknown"} />
          </View>

          <Text style={{ color: "#64748b", lineHeight: 21 }}>
            Nutrition values may vary by brand, preparation, and serving size.
          </Text>

          <View style={{ flexDirection: "row", gap: 10 }}>
            <TextInput
              keyboardType="numeric"
              onChangeText={setQuantity}
              placeholder="Quantity"
              placeholderTextColor="#94a3b8"
              style={{ ...INPUT_STYLE, flex: 1 }}
              value={quantity}
            />
            <TouchableOpacity
              activeOpacity={0.85}
              onPress={toggleFavourite}
              style={{
                alignItems: "center",
                backgroundColor: isFavourite ? "#ffe4e6" : "#fffbeb",
                borderRadius: 16,
                justifyContent: "center",
                paddingHorizontal: 14,
              }}
            >
              <Text
                style={{
                  color: isFavourite ? "#be123c" : "#92400e",
                  fontWeight: "900",
                }}
              >
                {isFavourite ? "Saved" : "Favourite"}
              </Text>
            </TouchableOpacity>
          </View>

          <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
            {details.servingOptions.map((servingOption, index) => (
              <TouchableOpacity
                activeOpacity={0.85}
                key={`${servingOption.label}-${index}`}
                onPress={() => {
                  setSelectedServingIndex(index);
                  setQuantity(String(servingOption.quantity));
                }}
                style={{
                  backgroundColor:
                    selectedServingIndex === index ? "#f59e0b" : "#fffbeb",
                  borderRadius: 999,
                  paddingHorizontal: 12,
                  paddingVertical: 9,
                }}
              >
                <Text
                  style={{
                    color:
                      selectedServingIndex === index ? "#ffffff" : "#92400e",
                    fontWeight: "900",
                  }}
                >
                  {servingOption.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
            {NUTRITION_MEAL_GROUP_OPTIONS.filter(
              (option) => option.key !== "notes",
            ).map((option) => (
              <TouchableOpacity
                activeOpacity={0.85}
                key={option.key}
                onPress={() => setMealGroup(option.key)}
                style={{
                  backgroundColor:
                    mealGroup === option.key ? "#f59e0b" : "#f8fafc",
                  borderRadius: 999,
                  paddingHorizontal: 12,
                  paddingVertical: 9,
                }}
              >
                <Text
                  style={{
                    color: mealGroup === option.key ? "#ffffff" : "#475569",
                    fontWeight: "900",
                  }}
                >
                  {option.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </AppCard>

      <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 10 }}>
        <MetricCard
          label="Calories"
          value={`${Math.round(calculatedNutrition?.calories ?? 0)}`}
        />
        <MetricCard
          label="Protein"
          value={`${round(calculatedNutrition?.proteinG)}g`}
        />
        <MetricCard
          label="Carbs"
          value={`${round(calculatedNutrition?.carbsG)}g`}
        />
        <MetricCard
          label="Fat"
          value={`${round(calculatedNutrition?.fatG)}g`}
        />
        <MetricCard
          label="Fiber"
          value={`${round(calculatedNutrition?.fiberG)}g`}
        />
        <MetricCard
          label="Sugar"
          value={`${round(calculatedNutrition?.sugarG)}g`}
        />
        <MetricCard
          label="Sodium"
          value={`${round(calculatedNutrition?.sodiumMg)}mg`}
        />
      </View>

      <AppCard>
        <TouchableOpacity
          activeOpacity={0.85}
          onPress={() => setShowMoreNutrients((current) => !current)}
        >
          <Text style={{ color: "#0f172a", fontSize: 18, fontWeight: "900" }}>
            More nutrients
          </Text>
        </TouchableOpacity>
        {showMoreNutrients ? (
          <View style={{ gap: 8, marginTop: 12 }}>
            <NutrientLine
              label="Potassium"
              value={`${round(calculatedNutrition?.potassiumMg)}mg`}
            />
            <NutrientLine
              label="Calcium"
              value={`${round(calculatedNutrition?.calciumMg)}mg`}
            />
            <NutrientLine
              label="Iron"
              value={`${round(calculatedNutrition?.ironMg)}mg`}
            />
            <NutrientLine
              label="Vitamin A"
              value={`${round(calculatedNutrition?.vitaminAMcg)}mcg`}
            />
            <NutrientLine
              label="Vitamin C"
              value={`${round(calculatedNutrition?.vitaminCMg)}mg`}
            />
            <NutrientLine
              label="Vitamin D"
              value={`${round(calculatedNutrition?.vitaminDMcg)}mcg`}
            />
          </View>
        ) : null}
      </AppCard>

      {successMessage ? (
        <AppCard backgroundColor="#ecfdf5">
          <Text style={{ color: "#047857", fontWeight: "900" }}>
            {successMessage}
          </Text>
        </AppCard>
      ) : null}

      <TouchableOpacity
        activeOpacity={0.85}
        onPress={addToDiary}
        style={{
          alignItems: "center",
          backgroundColor: "#f59e0b",
          borderRadius: 18,
          justifyContent: "center",
          minHeight: 54,
        }}
      >
        <Text style={{ color: "#ffffff", fontSize: 16, fontWeight: "900" }}>
          Add to Diary
        </Text>
      </TouchableOpacity>

      <Text style={{ color: "#64748b", fontSize: 12, lineHeight: 18 }}>
        Nutrition data is for general wellness tracking and may vary by brand,
        preparation, and serving size.
      </Text>
    </ScreenWrapper>
  );
}

function scaleNutrition(
  details: FoodDetails,
  quantity: number,
  serving: ServingOption,
) {
  const multiplier = getMultiplier(details, quantity, serving);

  return {
    calciumMg: scale(details.calciumMg, multiplier),
    calories: scale(details.calories, multiplier),
    carbsG: scale(details.carbsG, multiplier),
    fatG: scale(details.fatG, multiplier),
    fiberG: scale(details.fiberG, multiplier),
    ironMg: scale(details.ironMg, multiplier),
    potassiumMg: scale(details.potassiumMg, multiplier),
    proteinG: scale(details.proteinG, multiplier),
    sodiumMg: scale(details.sodiumMg, multiplier),
    sugarG: scale(details.sugarG, multiplier),
    vitaminAMcg: scale(details.vitaminAMcg, multiplier),
    vitaminCMg: scale(details.vitaminCMg, multiplier),
    vitaminDMcg: scale(details.vitaminDMcg, multiplier),
  };
}

function getMultiplier(
  details: FoodDetails,
  quantity: number,
  serving: ServingOption,
) {
  if (details.defaultServingSize <= 0) {
    return Math.max(0, quantity);
  }

  if (serving.unit === details.defaultServingUnit) {
    return Math.max(0, quantity / details.defaultServingSize);
  }

  const defaultServing = details.servingOptions.find(
    (option) =>
      option.quantity === details.defaultServingSize &&
      option.unit === details.defaultServingUnit,
  );

  if (
    serving.gramsEquivalent &&
    defaultServing?.gramsEquivalent &&
    serving.quantity
  ) {
    return Math.max(
      0,
      (quantity * serving.gramsEquivalent) /
        (serving.quantity * defaultServing.gramsEquivalent),
    );
  }

  return Math.max(0, quantity / details.defaultServingSize);
}

function scale(value: number | undefined, multiplier: number) {
  return value === undefined ? undefined : value * multiplier;
}

function round(value: number | undefined) {
  return Math.round((value ?? 0) * 10) / 10;
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

function Badge({ label }: { label: string }) {
  return (
    <View
      style={{
        backgroundColor: "#fffbeb",
        borderRadius: 999,
        paddingHorizontal: 10,
        paddingVertical: 6,
      }}
    >
      <Text style={{ color: "#92400e", fontSize: 12, fontWeight: "900" }}>
        {label}
      </Text>
    </View>
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
        padding: 14,
      }}
    >
      <Text style={{ color: "#92400e", fontSize: 12, fontWeight: "900" }}>
        {label}
      </Text>
      <Text
        style={{
          color: "#0f172a",
          fontSize: 20,
          fontWeight: "900",
          marginTop: 4,
        }}
      >
        {value}
      </Text>
    </View>
  );
}

function NutrientLine({ label, value }: { label: string; value: string }) {
  return (
    <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
      <Text style={{ color: "#64748b", fontWeight: "800" }}>{label}</Text>
      <Text style={{ color: "#0f172a", fontWeight: "900" }}>{value}</Text>
    </View>
  );
}
