import AsyncStorage from "@react-native-async-storage/async-storage";

import { addFoodDetailsToDiary, getCustomFoods } from "@/lib/nutritionStorage";
import type {
  BarcodeProductCache,
  BarcodeProductLookupResult,
  FoodDataQuality,
  FoodDetails,
  NutritionMealGroup,
  RecentlyScannedProduct,
  ServingOption,
} from "@/types/nutrition";

const BARCODE_CACHE_STORAGE_KEY = "family_health_barcode_products_cache";
const RECENT_SCANNED_STORAGE_KEY = "family_health_recently_scanned_products";
const LOCAL_USER_ID = "local-user";
const LOCAL_PROFILE_ID = "local-profile";

export async function lookupProductByBarcode(
  barcode: string,
): Promise<BarcodeProductLookupResult> {
  const normalizedBarcode = normalizeBarcode(barcode);

  if (!isValidBarcode(normalizedBarcode)) {
    return {
      barcode: normalizedBarcode,
      message: "Enter a numeric barcode with 8 to 14 digits.",
      status: "error",
    };
  }

  try {
    const customFood = await lookupCustomFoodByBarcode(normalizedBarcode);

    if (customFood) {
      await saveRecentlyScannedProduct(customFood);
      return {
        barcode: normalizedBarcode,
        product: customFood,
        status: getLookupStatus(customFood),
      };
    }

    const cachedFood = await lookupCachedBarcodeProduct(normalizedBarcode);

    if (cachedFood) {
      await saveRecentlyScannedProduct(cachedFood);
      return {
        barcode: normalizedBarcode,
        product: cachedFood,
        status: getLookupStatus(cachedFood),
      };
    }

    const openFoodFactsProduct =
      await lookupOpenFoodFactsProduct(normalizedBarcode);

    if (openFoodFactsProduct) {
      await saveBarcodeProductCache(openFoodFactsProduct);
      await saveRecentlyScannedProduct(openFoodFactsProduct);
      return {
        barcode: normalizedBarcode,
        message:
          getLookupStatus(openFoodFactsProduct) === "incomplete"
            ? "Some nutrition information is missing."
            : undefined,
        product: openFoodFactsProduct,
        status: getLookupStatus(openFoodFactsProduct),
      };
    }

    return {
      barcode: normalizedBarcode,
      message:
        "We could not find this product. You can create it as a custom food.",
      status: "not_found",
    };
  } catch {
    return {
      barcode: normalizedBarcode,
      message:
        "Product lookup is unavailable right now. You can still add the food manually.",
      status: "error",
    };
  }
}

export async function lookupCustomFoodByBarcode(barcode: string) {
  const customFoods = await getCustomFoods();
  const customFood = customFoods.find(
    (food) =>
      normalizeBarcode(food.barcode ?? "") === normalizeBarcode(barcode),
  );

  if (!customFood) {
    return null;
  }

  return {
    barcode: customFood.barcode,
    brand: customFood.brand,
    calories: customFood.calories,
    carbsG: customFood.carbsG,
    dataQuality: "estimated" as FoodDataQuality,
    defaultServingSize: customFood.servingSize,
    defaultServingUnit: customFood.servingUnit,
    description: customFood.notes,
    fatG: customFood.fatG,
    fiberG: customFood.fiberG,
    id: customFood.id,
    imageUrl: customFood.imageUrl,
    ingredients: customFood.notes,
    name: customFood.name,
    proteinG: customFood.proteinG,
    servingOptions: [
      {
        label: `${customFood.servingSize} ${customFood.servingUnit}`,
        quantity: customFood.servingSize,
        unit: customFood.servingUnit,
      },
    ],
    sodiumMg: customFood.sodiumMg,
    source: "custom" as const,
    sourceFoodId: `custom-food-${customFood.id}`,
    sugarG: customFood.sugarG,
  };
}

export async function lookupCachedBarcodeProduct(barcode: string) {
  const cachedProducts = await readJsonArray<BarcodeProductCache>(
    BARCODE_CACHE_STORAGE_KEY,
  );
  const cachedProduct = cachedProducts.find(
    (product) =>
      normalizeBarcode(product.barcode) === normalizeBarcode(barcode),
  );

  return cachedProduct ? barcodeCacheToFoodDetails(cachedProduct) : null;
}

export async function lookupOpenFoodFactsProduct(barcode: string) {
  const fields = [
    "code",
    "product_name",
    "brands",
    "image_front_url",
    "image_url",
    "serving_size",
    "nutriments",
    "ingredients_text",
    "allergens_tags",
    "states_tags",
    "last_modified_t",
  ].join(",");
  const response = await fetch(
    `https://world.openfoodfacts.org/api/v2/product/${encodeURIComponent(barcode)}.json?fields=${fields}`,
    {
      headers: {
        Accept: "application/json",
        "User-Agent": "FamilyHealth/1.0 (packaged product lookup)",
      },
    },
  );

  if (!response.ok) {
    return null;
  }

  return normalizeOpenFoodFactsProduct(await response.json(), barcode);
}

export function normalizeOpenFoodFactsProduct(
  raw: unknown,
  barcode: string,
): FoodDetails | null {
  if (!raw || typeof raw !== "object") {
    return null;
  }

  const result = raw as { product?: Record<string, unknown>; status?: number };
  const product = result.product;

  if (result.status === 0 || !product) {
    return null;
  }

  const nutriments = asRecord(product.nutriments);
  const serving = parseServing(String(product.serving_size ?? "100 g"));
  const calories = getNutriment(nutriments, [
    "energy-kcal_serving",
    "energy-kcal_100g",
    "energy-kcal",
  ]);
  const protein = getNutriment(nutriments, [
    "proteins_serving",
    "proteins_100g",
    "proteins",
  ]);
  const carbs = getNutriment(nutriments, [
    "carbohydrates_serving",
    "carbohydrates_100g",
    "carbohydrates",
  ]);
  const fat = getNutriment(nutriments, ["fat_serving", "fat_100g", "fat"]);
  const sourceFoodId = String(product.code ?? barcode);

  return {
    allergens: normalizeAllergens(product.allergens_tags),
    barcode,
    brand: firstText(product.brands),
    calories,
    carbsG: carbs,
    dataQuality: getOpenFoodFactsDataQuality(product.states_tags),
    defaultServingSize: serving.quantity,
    defaultServingUnit: serving.unit,
    description: firstText(product.ingredients_text),
    fatG: fat,
    fiberG: getNutriment(nutriments, ["fiber_serving", "fiber_100g", "fiber"]),
    id: `open-food-facts-${sourceFoodId}`,
    imageUrl:
      firstText(product.image_front_url) ?? firstText(product.image_url),
    ingredients: firstText(product.ingredients_text),
    name: firstText(product.product_name) ?? `Barcode ${barcode}`,
    nutrientsJson: nutriments,
    proteinG: protein,
    servingOptions: buildServingOptions(serving),
    sodiumMg: getSodiumMg(nutriments),
    source: "open_food_facts",
    sourceFoodId,
    sugarG: getNutriment(nutriments, [
      "sugars_serving",
      "sugars_100g",
      "sugars",
    ]),
  };
}

export async function saveBarcodeProductCache(details: FoodDetails) {
  if (!details.barcode) {
    return null;
  }

  const cachedProducts = await readJsonArray<BarcodeProductCache>(
    BARCODE_CACHE_STORAGE_KEY,
  );
  const now = new Date().toISOString();
  const existingProduct = cachedProducts.find(
    (product) => product.barcode === details.barcode,
  );
  const cacheProduct: BarcodeProductCache = {
    allergens: details.allergens,
    barcode: details.barcode,
    brand: details.brand,
    calories: details.calories,
    carbsG: details.carbsG,
    createdAt: existingProduct?.createdAt ?? now,
    dataQuality: details.dataQuality ?? "unknown",
    fatG: details.fatG,
    fiberG: details.fiberG,
    id:
      existingProduct?.id ??
      `barcode-cache-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    imageUrl: details.imageUrl,
    ingredients: details.ingredients,
    lastFetchedAt: now,
    name: details.name,
    nutrientsJson: details.nutrientsJson,
    proteinG: details.proteinG,
    rawSourceJson: details.nutrientsJson,
    servingSize: details.defaultServingSize,
    servingUnit: details.defaultServingUnit,
    sodiumMg: details.sodiumMg,
    source: details.source,
    sourceFoodId: details.sourceFoodId,
    sugarG: details.sugarG,
    updatedAt: now,
  };

  await writeJsonArray(BARCODE_CACHE_STORAGE_KEY, [
    cacheProduct,
    ...cachedProducts.filter((product) => product.barcode !== details.barcode),
  ]);

  return cacheProduct;
}

export async function getRecentlyScannedProducts() {
  const products = await readJsonArray<RecentlyScannedProduct>(
    RECENT_SCANNED_STORAGE_KEY,
  );

  return products.sort(
    (left, right) =>
      new Date(right.lastScannedAt).getTime() -
      new Date(left.lastScannedAt).getTime(),
  );
}

export async function saveRecentlyScannedProduct(details: FoodDetails) {
  if (!details.barcode) {
    return null;
  }

  const products = await getRecentlyScannedProducts();
  const now = new Date().toISOString();
  const existingProduct = products.find(
    (product) => product.barcode === details.barcode,
  );
  const recentProduct: RecentlyScannedProduct = {
    barcode: details.barcode,
    brand: details.brand,
    calories: details.calories,
    createdAt: existingProduct?.createdAt ?? now,
    id:
      existingProduct?.id ??
      `recent-scan-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    imageUrl: details.imageUrl,
    lastScannedAt: now,
    productName: details.name,
    profileId: existingProduct?.profileId ?? LOCAL_PROFILE_ID,
    source: details.source,
    sourceFoodId: details.sourceFoodId,
    timesScanned: (existingProduct?.timesScanned ?? 0) + 1,
    userId: existingProduct?.userId ?? LOCAL_USER_ID,
  };

  await writeJsonArray(RECENT_SCANNED_STORAGE_KEY, [
    recentProduct,
    ...products.filter((product) => product.id !== recentProduct.id),
  ]);

  return recentProduct;
}

export async function addScannedProductToDiary({
  details,
  mealGroup,
  quantity,
  serving,
}: {
  details: FoodDetails;
  mealGroup: NutritionMealGroup;
  quantity: number;
  serving: ServingOption;
}) {
  const entry = await addFoodDetailsToDiary({
    details,
    mealGroup,
    quantity,
    serving,
  });

  await Promise.all([
    saveRecentlyScannedProduct(details),
    saveBarcodeProductCache(details),
  ]);

  return entry;
}

function barcodeCacheToFoodDetails(product: BarcodeProductCache): FoodDetails {
  const serving = {
    label: `${product.servingSize ?? 100} ${product.servingUnit ?? "g"}`,
    quantity: product.servingSize ?? 100,
    unit: product.servingUnit ?? "g",
  };

  return {
    allergens: product.allergens,
    barcode: product.barcode,
    brand: product.brand,
    calories: product.calories ?? 0,
    carbsG: product.carbsG ?? 0,
    dataQuality: product.dataQuality,
    defaultServingSize: serving.quantity,
    defaultServingUnit: serving.unit,
    fatG: product.fatG ?? 0,
    fiberG: product.fiberG,
    id: product.id,
    imageUrl: product.imageUrl,
    ingredients: product.ingredients,
    name: product.name,
    nutrientsJson: product.nutrientsJson,
    proteinG: product.proteinG ?? 0,
    servingOptions: buildServingOptions(serving),
    sodiumMg: product.sodiumMg,
    source: product.source,
    sourceFoodId: product.sourceFoodId,
    sugarG: product.sugarG,
  };
}

function buildServingOptions(serving: ServingOption): ServingOption[] {
  const options = [serving];

  if (serving.unit !== "g" || serving.quantity !== 100) {
    options.push({ label: "100 g", quantity: 100, unit: "g" });
  }

  return options;
}

function getLookupStatus(
  details: FoodDetails,
): BarcodeProductLookupResult["status"] {
  return details.calories <= 0 ||
    details.proteinG === 0 ||
    details.carbsG === 0 ||
    details.fatG === 0
    ? "incomplete"
    : "found";
}

function parseServing(servingSize: string): ServingOption {
  const match = servingSize.match(/([\d,.]+)\s*([a-zA-Z]+)/);
  const quantity = match ? Number(match[1].replace(",", ".")) : 100;
  const unit = match?.[2]?.toLowerCase() ?? "g";

  return {
    label: `${Number.isFinite(quantity) ? quantity : 100} ${unit}`,
    quantity: Number.isFinite(quantity) ? quantity : 100,
    unit,
  };
}

function getNutriment(nutriments: Record<string, unknown>, keys: string[]) {
  for (const key of keys) {
    const value = Number(nutriments[key]);

    if (Number.isFinite(value)) {
      return Math.max(0, value);
    }
  }

  return 0;
}

function getSodiumMg(nutriments: Record<string, unknown>) {
  const sodiumServing = Number(nutriments.sodium_serving);
  const sodium100g = Number(nutriments.sodium_100g);
  const saltServing = Number(nutriments.salt_serving);
  const salt100g = Number(nutriments.salt_100g);

  if (Number.isFinite(sodiumServing)) return Math.max(0, sodiumServing * 1000);
  if (Number.isFinite(sodium100g)) return Math.max(0, sodium100g * 1000);
  if (Number.isFinite(saltServing)) return Math.max(0, saltServing * 400);
  if (Number.isFinite(salt100g)) return Math.max(0, salt100g * 400);

  return undefined;
}

function getOpenFoodFactsDataQuality(statesTags: unknown): FoodDataQuality {
  const tags = Array.isArray(statesTags) ? statesTags.map(String) : [];

  return tags.some((tag) => tag.includes("nutrition-facts-completed"))
    ? "community"
    : "unknown";
}

function normalizeAllergens(value: unknown) {
  return Array.isArray(value)
    ? value.map((item) => String(item).replace(/^en:/, "")).filter(Boolean)
    : undefined;
}

function firstText(value: unknown) {
  return typeof value === "string" && value.trim() ? value.trim() : undefined;
}

function asRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === "object"
    ? (value as Record<string, unknown>)
    : {};
}

function normalizeBarcode(barcode: string) {
  return barcode.trim().replace(/\D/g, "");
}

export function isValidBarcode(barcode: string) {
  return /^\d{8,14}$/.test(normalizeBarcode(barcode));
}

async function readJsonArray<T>(key: string) {
  try {
    const storedValue = await AsyncStorage.getItem(key);

    if (!storedValue) {
      return [] as T[];
    }

    const parsedValue = JSON.parse(storedValue);

    return Array.isArray(parsedValue) ? (parsedValue as T[]) : [];
  } catch {
    return [] as T[];
  }
}

async function writeJsonArray<T>(key: string, value: T[]) {
  await AsyncStorage.setItem(key, JSON.stringify(value));

  return value;
}
