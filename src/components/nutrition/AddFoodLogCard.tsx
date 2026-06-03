import * as ImagePicker from "expo-image-picker";
import { useState } from "react";
import { Image, Switch, Text, TextInput, TouchableOpacity, View } from "react-native";

import { AppCard } from "@/components/ui/AppCard";
import { MEAL_TYPE_OPTIONS, QUICK_FOOD_EXAMPLES } from "@/constants/nutritionOptions";
import { addFoodLog } from "@/lib/nutritionStorage";
import type { MealType, NutritionEstimate, NutritionMealGroup } from "@/types/nutrition";

type AddFoodLogCardProps = {
  onSaved: () => void;
};

type NutritionField = keyof Pick<
  NutritionEstimate,
  | "calories"
  | "proteinGrams"
  | "carbsGrams"
  | "fatGrams"
  | "fibreGrams"
  | "sugarGrams"
  | "ironMg"
  | "vitaminCMg"
>;

const NUTRITION_FIELDS: Array<{ key: NutritionField; label: string }> = [
  { key: "calories", label: "Calories" },
  { key: "proteinGrams", label: "Protein g" },
  { key: "carbsGrams", label: "Carbs g" },
  { key: "fatGrams", label: "Fat g" },
  { key: "fibreGrams", label: "Fibre g" },
  { key: "sugarGrams", label: "Sugar g" },
  { key: "ironMg", label: "Iron mg" },
  { key: "vitaminCMg", label: "Vitamin C mg" }
];

export function AddFoodLogCard({ onSaved }: AddFoodLogCardProps) {
  const [mealType, setMealType] = useState<MealType | NutritionMealGroup>("breakfast");
  const [name, setName] = useState("");
  const [portionDescription, setPortionDescription] = useState("");
  const [notes, setNotes] = useState("");
  const [imageUri, setImageUri] = useState<string | undefined>();
  const [estimateOnly, setEstimateOnly] = useState(true);
  const [nutrition, setNutrition] = useState<Record<string, string>>({});
  const [placeholderMessage, setPlaceholderMessage] = useState<string | null>(null);

  async function pickPhoto() {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permission.granted) {
      setPlaceholderMessage("Photo permission was not granted. You can still log food manually.");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      allowsEditing: true,
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.7
    });

    if (!result.canceled) {
      setImageUri(result.assets[0]?.uri);
    }
  }

  async function saveFoodLog() {
    if (!name.trim()) {
      return;
    }

    const parsedNutritionEntries = Object.entries(nutrition)
      .map(([key, value]) => [key, Number(value)] as const)
      .filter((entry): entry is readonly [string, number] => {
        const value = entry[1];

        return Number.isFinite(value) && value >= 0;
      });
    const parsedNutrition = Object.fromEntries(parsedNutritionEntries) as NutritionEstimate;

    await addFoodLog({
      estimateOnly,
      imageUri,
      mealType,
      name,
      notes,
      nutrition: parsedNutrition,
      portionDescription,
      source: imageUri ? "photo_placeholder" : "manual"
    });

    setName("");
    setPortionDescription("");
    setNotes("");
    setImageUri(undefined);
    setEstimateOnly(true);
    setNutrition({});
    setPlaceholderMessage(null);
    onSaved();
  }

  return (
    <AppCard>
      <View style={{ gap: 12 }}>
        <View>
          <Text style={{ color: "#0f172a", fontSize: 20, fontWeight: "900" }}>
            Add food log
          </Text>
          <Text style={{ color: "#64748b", lineHeight: 20, marginTop: 4 }}>
            Manual entries for now. Photo, barcode and AI estimates stay placeholders.
          </Text>
        </View>

        <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
          {MEAL_TYPE_OPTIONS.map((option) => (
            <ChoicePill
              key={option.key}
              label={`${option.emoji} ${option.label}`}
              onPress={() => setMealType(option.key)}
              selected={mealType === option.key}
            />
          ))}
        </View>

        <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
          {QUICK_FOOD_EXAMPLES.slice(0, 6).map((example) => (
            <ChoicePill
              key={example}
              label={example}
              onPress={() => setName(example)}
              selected={name === example}
            />
          ))}
        </View>

        <TextInput
          onChangeText={setName}
          placeholder="Food name"
          placeholderTextColor="#94a3b8"
          style={inputStyle}
          value={name}
        />
        <TextInput
          onChangeText={setPortionDescription}
          placeholder="Portion description"
          placeholderTextColor="#94a3b8"
          style={inputStyle}
          value={portionDescription}
        />
        <TextInput
          multiline
          onChangeText={setNotes}
          placeholder="Notes optional"
          placeholderTextColor="#94a3b8"
          style={{ ...inputStyle, minHeight: 76, paddingTop: 13 }}
          value={notes}
        />

        <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
          {NUTRITION_FIELDS.map((field) => (
            <TextInput
              keyboardType="numeric"
              key={field.key}
              onChangeText={(value) =>
                setNutrition((current) => ({ ...current, [field.key]: value }))
              }
              placeholder={field.label}
              placeholderTextColor="#94a3b8"
              style={{ ...inputStyle, flexGrow: 1, minWidth: "46%" }}
              value={nutrition[field.key] ?? ""}
            />
          ))}
        </View>

        {imageUri ? (
          <Image
            accessibilityLabel="Selected food photo"
            alt="Selected food photo"
            source={{ uri: imageUri }}
            style={{ borderRadius: 18, height: 140, width: "100%" }}
          />
        ) : null}

        <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
          <ToolButton label="Add photo" onPress={pickPhoto} />
          <ToolButton
            label="Scan barcode"
            onPress={() => setPlaceholderMessage("Barcode scanning will connect later.")}
          />
          <ToolButton
            disabled
            label="AI estimate later"
            onPress={() => setPlaceholderMessage("AI food estimates will require approval later.")}
          />
        </View>

        <View style={{ alignItems: "center", backgroundColor: "#f8fafc", borderRadius: 18, flexDirection: "row", justifyContent: "space-between", padding: 14 }}>
          <Text style={{ color: "#0f172a", fontWeight: "900" }}>Estimate only</Text>
          <Switch onValueChange={setEstimateOnly} value={estimateOnly} />
        </View>

        {placeholderMessage ? (
          <Text style={{ color: "#64748b", lineHeight: 20 }}>{placeholderMessage}</Text>
        ) : null}

        <TouchableOpacity
          activeOpacity={0.85}
          disabled={!name.trim()}
          onPress={saveFoodLog}
          style={{
            alignItems: "center",
            backgroundColor: "#7c3aed",
            borderRadius: 18,
            justifyContent: "center",
            minHeight: 52,
            opacity: name.trim() ? 1 : 0.55
          }}
        >
          <Text style={{ color: "#ffffff", fontSize: 16, fontWeight: "900" }}>
            Save food log
          </Text>
        </TouchableOpacity>
      </View>
    </AppCard>
  );
}

const inputStyle = {
  backgroundColor: "#f8fafc",
  borderColor: "#f1f5f9",
  borderRadius: 18,
  borderWidth: 1,
  color: "#0f172a",
  minHeight: 50,
  paddingHorizontal: 14
};

function ChoicePill({
  label,
  onPress,
  selected
}: {
  label: string;
  onPress: () => void;
  selected: boolean;
}) {
  return (
    <TouchableOpacity
      activeOpacity={0.85}
      onPress={onPress}
      style={{
        backgroundColor: selected ? "#7c3aed" : "#f8fafc",
        borderRadius: 999,
        paddingHorizontal: 12,
        paddingVertical: 9
      }}
    >
      <Text style={{ color: selected ? "#ffffff" : "#475569", fontWeight: "900" }}>
        {label}
      </Text>
    </TouchableOpacity>
  );
}

function ToolButton({
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
        backgroundColor: disabled ? "#e2e8f0" : "#ede9fe",
        borderRadius: 14,
        paddingHorizontal: 12,
        paddingVertical: 10
      }}
    >
      <Text style={{ color: disabled ? "#94a3b8" : "#6d28d9", fontWeight: "900" }}>
        {label}
      </Text>
    </TouchableOpacity>
  );
}
