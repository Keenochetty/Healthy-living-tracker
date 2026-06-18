import { Href, router, useLocalSearchParams } from "expo-router";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Image, Text, TextInput, TouchableOpacity, View } from "react-native";

import { ScreenWrapper } from "@/components/layout/ScreenWrapper";
import { AppCard } from "@/components/ui/AppCard";
import { NUTRITION_MEAL_GROUP_OPTIONS } from "@/constants/nutritionOptions";
import {
  getFavouriteFoods,
  removeFavouriteFood,
  saveFavouriteFood,
} from "@/lib/nutritionStorage";
import {
  addScannedProductToDiary,
  lookupProductByBarcode,
  saveBarcodeProductCache,
} from "@/services/nutrition/barcodeLookupService";
import type {
  BarcodeProductLookupResult,
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

export default function BarcodeProductScreen() {
  const params = useLocalSearchParams<{
    barcode?: string;
    mealGroup?: NutritionMealGroup;
  }>();
  const barcode = params.barcode ?? "";
  const [lookupResult, setLookupResult] =
    useState<BarcodeProductLookupResult | null>(null);
  const [favourites, setFavourites] = useState<FavouriteFood[]>([]);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState("1");
  const [selectedServingIndex, setSelectedServingIndex] = useState(0);
  const [mealGroup, setMealGroup] = useState<NutritionMealGroup>(
    params.mealGroup ?? "breakfast",
  );
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const loadProduct = useCallback(async () => {
    setLoading(true);
    setLookupResult(null);

    const [result, nextFavourites] = await Promise.all([
      lookupProductByBarcode(barcode),
      getFavouriteFoods(),
    ]);

    setLookupResult(result);
    setFavourites(nextFavourites);
    setQuantity(String(result.product?.defaultServingSize ?? 1));
    setSelectedServingIndex(0);
    setLoading(false);
  }, [barcode]);

  useEffect(() => {
    Promise.resolve()
      .then(loadProduct)
      .catch(() => {
        setLookupResult({
          barcode,
          message:
            "Product lookup is unavailable right now. You can still add the food manually.",
          status: "error",
        });
        setLoading(false);
      });
  }, [barcode, loadProduct]);

  const product = lookupResult?.product ?? null;
  const selectedServing = product?.servingOptions[selectedServingIndex] ?? null;
  const calculatedNutrition = useMemo(() => {
    if (!product || !selectedServing) {
      return null;
    }

    return scaleNutrition(product, Number(quantity) || 0, selectedServing);
  }, [product, quantity, selectedServing]);
  const isFavourite = Boolean(
    product &&
    favourites.some(
      (favourite) =>
        favourite.source === product.source &&
        favourite.sourceFoodId === product.sourceFoodId,
    ),
  );

  async function toggleFavourite() {
    if (!product || !selectedServing) {
      return;
    }

    if (isFavourite) {
      await removeFavouriteFood(product.source, product.sourceFoodId);
    } else {
      await saveFavouriteFood({
        defaultQuantity: Number(quantity) || product.defaultServingSize,
        defaultUnit: selectedServing.unit,
        details: product,
      });
    }

    setFavourites(await getFavouriteFoods());
  }

  async function addToDiary() {
    if (!product || !selectedServing) {
      return;
    }

    await addScannedProductToDiary({
      details: product,
      mealGroup,
      quantity: Number(quantity) || product.defaultServingSize,
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
            Looking up product...
          </Text>
        </AppCard>
      </ScreenWrapper>
    );
  }

  if (
    !product ||
    lookupResult?.status === "not_found" ||
    lookupResult?.status === "error"
  ) {
    return (
      <ScreenWrapper backgroundColor="#fffaf0">
        <AppCard>
          <View style={{ gap: 12 }}>
            <Text style={{ color: "#0f172a", fontSize: 24, fontWeight: "900" }}>
              {lookupResult?.status === "not_found"
                ? "Product not found"
                : "Product lookup"}
            </Text>
            <Text style={{ color: "#64748b", lineHeight: 21 }}>
              {lookupResult?.message ??
                "We could not find this product. You can create it as a custom food."}
            </Text>
            <PrimaryButton
              label="Create Custom Food"
              onPress={() =>
                router.push(
                  `/food/custom-food?barcode=${encodeURIComponent(barcode)}` as Href,
                )
              }
            />
            <SecondaryButton
              label="Search by Product Name"
              onPress={() =>
                router.replace({
                  pathname: "/(tabs)/food",
                  params: { tab: "add" },
                } as Href)
              }
            />
            <SecondaryButton label="Try Again" onPress={loadProduct} />
            <SecondaryButton
              label="Enter Barcode Manually"
              onPress={() => router.replace("/food/barcode-scanner" as Href)}
            />
          </View>
        </AppCard>
      </ScreenWrapper>
    );
  }

  return (
    <ScreenWrapper backgroundColor="#fffaf0">
      <View style={{ gap: 4 }}>
        <Text style={{ color: "#b45309", fontSize: 14, fontWeight: "800" }}>
          {getSourceLabel(product.source)} - {product.dataQuality ?? "unknown"}
        </Text>
        <Text style={{ color: "#0f172a", fontSize: 30, fontWeight: "900" }}>
          {product.name}
        </Text>
        {product.brand ? (
          <Text style={{ color: "#64748b", lineHeight: 20 }}>
            {product.brand}
          </Text>
        ) : null}
      </View>

      <AppCard>
        <View style={{ gap: 12 }}>
          {product.imageUrl ? (
            <Image
              alt={`${product.name} product image`}
              source={{ uri: product.imageUrl }}
              style={{
                alignSelf: "center",
                backgroundColor: "#f8fafc",
                borderRadius: 18,
                height: 170,
                width: 170,
              }}
            />
          ) : null}
          <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
            <Badge label={getSourceLabel(product.source)} />
            <Badge label={product.dataQuality ?? "unknown"} />
            {product.barcode ? <Badge label={product.barcode} /> : null}
          </View>

          {lookupResult?.status === "incomplete" ? (
            <AppCard backgroundColor="#fff7ed" padding="md">
              <Text style={{ color: "#9a3412", fontWeight: "900" }}>
                Some nutrition information is missing.
              </Text>
              <Text style={{ color: "#9a3412", lineHeight: 20, marginTop: 4 }}>
                You can add available data anyway, edit nutrition before adding,
                or create a custom version.
              </Text>
            </AppCard>
          ) : null}

          <Text style={{ color: "#64748b", lineHeight: 21 }}>
            Packaged product nutrition may vary by region, recipe, and serving
            size. Check the product label if accuracy is important.
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
            {product.servingOptions.map((servingOption, index) => (
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

      {product.ingredients || product.allergens?.length ? (
        <AppCard>
          <View style={{ gap: 10 }}>
            {product.ingredients ? (
              <View>
                <Text
                  style={{ color: "#0f172a", fontSize: 18, fontWeight: "900" }}
                >
                  Ingredients
                </Text>
                <Text
                  style={{ color: "#64748b", lineHeight: 21, marginTop: 4 }}
                >
                  {product.ingredients}
                </Text>
              </View>
            ) : null}
            {product.allergens?.length ? (
              <View>
                <Text
                  style={{ color: "#0f172a", fontSize: 18, fontWeight: "900" }}
                >
                  Allergens
                </Text>
                <Text
                  style={{ color: "#64748b", lineHeight: 21, marginTop: 4 }}
                >
                  {product.allergens.join(", ")}
                </Text>
              </View>
            ) : null}
          </View>
        </AppCard>
      ) : null}

      {successMessage ? (
        <AppCard backgroundColor="#ecfdf5">
          <Text style={{ color: "#047857", fontWeight: "900" }}>
            {successMessage}
          </Text>
        </AppCard>
      ) : null}

      <View style={{ gap: 10 }}>
        <PrimaryButton label="Add to Diary" onPress={addToDiary} />
        <SecondaryButton
          label="Save to Local Cache"
          onPress={() => saveBarcodeProductCache(product)}
        />
        <SecondaryButton
          label="Create Custom Version"
          onPress={() =>
            router.push(
              `/food/custom-food?barcode=${encodeURIComponent(product.barcode ?? barcode)}` as Href,
            )
          }
        />
      </View>
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
    calories: scale(details.calories, multiplier),
    carbsG: scale(details.carbsG, multiplier),
    fatG: scale(details.fatG, multiplier),
    fiberG: scale(details.fiberG, multiplier),
    proteinG: scale(details.proteinG, multiplier),
    sodiumMg: scale(details.sodiumMg, multiplier),
    sugarG: scale(details.sugarG, multiplier),
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

function PrimaryButton({
  label,
  onPress,
}: {
  label: string;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity
      activeOpacity={0.85}
      onPress={onPress}
      style={{
        alignItems: "center",
        backgroundColor: "#f59e0b",
        borderRadius: 18,
        justifyContent: "center",
        minHeight: 52,
      }}
    >
      <Text style={{ color: "#ffffff", fontSize: 16, fontWeight: "900" }}>
        {label}
      </Text>
    </TouchableOpacity>
  );
}

function SecondaryButton({
  label,
  onPress,
}: {
  label: string;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity
      activeOpacity={0.85}
      onPress={onPress}
      style={{
        alignItems: "center",
        backgroundColor: "#fffbeb",
        borderRadius: 18,
        justifyContent: "center",
        minHeight: 50,
      }}
    >
      <Text style={{ color: "#92400e", fontSize: 15, fontWeight: "900" }}>
        {label}
      </Text>
    </TouchableOpacity>
  );
}
