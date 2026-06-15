import { Href, router, useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import { Switch, Text, TextInput, TouchableOpacity, View } from "react-native";

import { ScreenWrapper } from "@/components/layout/ScreenWrapper";
import { AppCard } from "@/components/ui/AppCard";
import {
  createCustomFood,
  getCustomFoodById,
  updateCustomFood,
} from "@/lib/nutritionStorage";

const INPUT_STYLE = {
  backgroundColor: "#ffffff",
  borderColor: "#fde68a",
  borderRadius: 16,
  borderWidth: 1,
  color: "#0f172a",
  minHeight: 50,
  paddingHorizontal: 14,
};

type NumberField =
  | "servingSize"
  | "calories"
  | "proteinG"
  | "carbsG"
  | "fatG"
  | "fiberG"
  | "sugarG"
  | "sodiumMg"
  | "potassiumMg"
  | "calciumMg"
  | "ironMg"
  | "vitaminAMcg"
  | "vitaminCMg"
  | "vitaminDMcg";

const NUMBER_FIELDS: Array<{
  key: NumberField;
  label: string;
  required?: boolean;
}> = [
  { key: "calories", label: "Calories", required: true },
  { key: "proteinG", label: "Protein grams", required: true },
  { key: "carbsG", label: "Carbs grams", required: true },
  { key: "fatG", label: "Fat grams", required: true },
  { key: "fiberG", label: "Fiber grams" },
  { key: "sugarG", label: "Sugar grams" },
  { key: "sodiumMg", label: "Sodium mg" },
  { key: "potassiumMg", label: "Potassium mg" },
  { key: "calciumMg", label: "Calcium mg" },
  { key: "ironMg", label: "Iron mg" },
  { key: "vitaminAMcg", label: "Vitamin A mcg" },
  { key: "vitaminCMg", label: "Vitamin C mg" },
  { key: "vitaminDMcg", label: "Vitamin D mcg" },
];

export default function CustomFoodScreen() {
  const params = useLocalSearchParams<{ barcode?: string; id?: string }>();
  const [name, setName] = useState("");
  const [brand, setBrand] = useState("");
  const [barcode, setBarcode] = useState(params.barcode ?? "");
  const [servingUnit, setServingUnit] = useState("serving");
  const [notes, setNotes] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [isSharedWithFamily, setIsSharedWithFamily] = useState(false);
  const [numbers, setNumbers] = useState<Record<NumberField, string>>({
    calories: "0",
    calciumMg: "",
    carbsG: "0",
    fatG: "0",
    fiberG: "",
    ironMg: "",
    potassiumMg: "",
    proteinG: "0",
    servingSize: "1",
    sodiumMg: "",
    sugarG: "",
    vitaminAMcg: "",
    vitaminCMg: "",
    vitaminDMcg: "",
  });
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!params.id) return;

    Promise.resolve()
      .then(async () => {
        const customFood = await getCustomFoodById(params.id ?? "");

        if (!customFood) return;

        setName(customFood.name);
        setBrand(customFood.brand ?? "");
        setBarcode(customFood.barcode ?? "");
        setServingUnit(customFood.servingUnit);
        setNotes(customFood.notes ?? "");
        setImageUrl(customFood.imageUrl ?? "");
        setIsSharedWithFamily(customFood.isSharedWithFamily);
        setNumbers({
          calories: String(customFood.calories),
          calciumMg: toInput(customFood.calciumMg),
          carbsG: String(customFood.carbsG),
          fatG: String(customFood.fatG),
          fiberG: toInput(customFood.fiberG),
          ironMg: toInput(customFood.ironMg),
          potassiumMg: toInput(customFood.potassiumMg),
          proteinG: String(customFood.proteinG),
          servingSize: String(customFood.servingSize),
          sodiumMg: toInput(customFood.sodiumMg),
          sugarG: toInput(customFood.sugarG),
          vitaminAMcg: toInput(customFood.vitaminAMcg),
          vitaminCMg: toInput(customFood.vitaminCMg),
          vitaminDMcg: toInput(customFood.vitaminDMcg),
        });
      })
      .catch(() => undefined);
  }, [params.id]);

  async function saveCustomFood() {
    setErrorMessage(null);

    if (!name.trim()) {
      setErrorMessage("Food name is required.");
      return;
    }

    if (!servingUnit.trim() || Number(numbers.servingSize) <= 0) {
      setErrorMessage("Serving size and unit are required.");
      return;
    }

    const payload = {
      barcode: barcode.trim() || undefined,
      brand: brand.trim() || undefined,
      calciumMg: optionalNumber(numbers.calciumMg),
      calories: requiredNumber(numbers.calories),
      carbsG: requiredNumber(numbers.carbsG),
      fatG: requiredNumber(numbers.fatG),
      fiberG: optionalNumber(numbers.fiberG),
      imageUrl: imageUrl.trim() || undefined,
      ironMg: optionalNumber(numbers.ironMg),
      isSharedWithFamily,
      name,
      notes: notes.trim() || undefined,
      potassiumMg: optionalNumber(numbers.potassiumMg),
      proteinG: requiredNumber(numbers.proteinG),
      servingSize: requiredNumber(numbers.servingSize),
      servingUnit,
      sodiumMg: optionalNumber(numbers.sodiumMg),
      sugarG: optionalNumber(numbers.sugarG),
      vitaminAMcg: optionalNumber(numbers.vitaminAMcg),
      vitaminCMg: optionalNumber(numbers.vitaminCMg),
      vitaminDMcg: optionalNumber(numbers.vitaminDMcg),
    };

    if (params.id) {
      await updateCustomFood(params.id, payload);
    } else {
      await createCustomFood(payload);
    }

    router.replace({ pathname: "/food", params: { tab: "library" } } as Href);
  }

  return (
    <ScreenWrapper backgroundColor="#fffaf0">
      <View style={{ gap: 4 }}>
        <Text style={{ color: "#b45309", fontSize: 14, fontWeight: "800" }}>
          Food / Nutrition
        </Text>
        <Text style={{ color: "#0f172a", fontSize: 30, fontWeight: "900" }}>
          {params.id ? "Edit Custom Food" : "Create Custom Food"}
        </Text>
        <Text style={{ color: "#64748b", lineHeight: 20 }}>
          Nutrition values are estimates and may vary by ingredients,
          preparation, and serving size.
        </Text>
      </View>

      <AppCard>
        <View style={{ gap: 12 }}>
          <TextInput
            onChangeText={setName}
            placeholder="Food name"
            placeholderTextColor="#94a3b8"
            style={INPUT_STYLE}
            value={name}
          />
          <TextInput
            onChangeText={setBrand}
            placeholder="Brand optional"
            placeholderTextColor="#94a3b8"
            style={INPUT_STYLE}
            value={brand}
          />
          <TextInput
            onChangeText={setBarcode}
            placeholder="Barcode optional"
            placeholderTextColor="#94a3b8"
            style={INPUT_STYLE}
            value={barcode}
          />
          <View style={{ flexDirection: "row", gap: 10 }}>
            <TextInput
              keyboardType="numeric"
              onChangeText={(value) => updateNumber("servingSize", value)}
              placeholder="Serving size"
              placeholderTextColor="#94a3b8"
              style={{ ...INPUT_STYLE, flex: 1 }}
              value={numbers.servingSize}
            />
            <TextInput
              onChangeText={setServingUnit}
              placeholder="Serving unit"
              placeholderTextColor="#94a3b8"
              style={{ ...INPUT_STYLE, flex: 1 }}
              value={servingUnit}
            />
          </View>

          <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 10 }}>
            {NUMBER_FIELDS.map((field) => (
              <TextInput
                keyboardType="numeric"
                key={field.key}
                onChangeText={(value) => updateNumber(field.key, value)}
                placeholder={field.label}
                placeholderTextColor="#94a3b8"
                style={{ ...INPUT_STYLE, flexGrow: 1, minWidth: "46%" }}
                value={numbers[field.key]}
              />
            ))}
          </View>

          <TextInput
            multiline
            onChangeText={setNotes}
            placeholder="Notes"
            placeholderTextColor="#94a3b8"
            style={{ ...INPUT_STYLE, minHeight: 82, paddingTop: 13 }}
            value={notes}
          />
          <TextInput
            onChangeText={setImageUrl}
            placeholder="Food photo placeholder optional"
            placeholderTextColor="#94a3b8"
            style={INPUT_STYLE}
            value={imageUrl}
          />

          <View
            style={{
              alignItems: "center",
              backgroundColor: "#f8fafc",
              borderRadius: 18,
              flexDirection: "row",
              justifyContent: "space-between",
              padding: 14,
            }}
          >
            <View style={{ flex: 1 }}>
              <Text style={{ color: "#0f172a", fontWeight: "900" }}>
                Share with family
              </Text>
              <Text style={{ color: "#64748b", marginTop: 3 }}>
                Prepared for later permissions.
              </Text>
            </View>
            <Switch
              disabled
              onValueChange={setIsSharedWithFamily}
              value={isSharedWithFamily}
            />
          </View>

          {errorMessage ? (
            <Text style={{ color: "#dc2626", fontWeight: "800" }}>
              {errorMessage}
            </Text>
          ) : null}

          <TouchableOpacity
            activeOpacity={0.85}
            onPress={saveCustomFood}
            style={{
              alignItems: "center",
              backgroundColor: "#f59e0b",
              borderRadius: 18,
              justifyContent: "center",
              minHeight: 52,
            }}
          >
            <Text style={{ color: "#ffffff", fontSize: 16, fontWeight: "900" }}>
              Save Custom Food
            </Text>
          </TouchableOpacity>
        </View>
      </AppCard>
    </ScreenWrapper>
  );

  function updateNumber(key: NumberField, value: string) {
    setNumbers((current) => ({ ...current, [key]: value }));
  }
}

function toInput(value?: number) {
  return value === undefined ? "" : String(value);
}

function optionalNumber(value: string) {
  const parsedValue = Number(value);

  return value.trim() && Number.isFinite(parsedValue) && parsedValue >= 0
    ? parsedValue
    : undefined;
}

function requiredNumber(value: string) {
  const parsedValue = Number(value);

  return Number.isFinite(parsedValue) && parsedValue >= 0 ? parsedValue : 0;
}
