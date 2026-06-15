import { useMemo, useState } from "react";
import { Text, TextInput, TouchableOpacity, View } from "react-native";

import { AppCard } from "@/components/ui/AppCard";
import { NUTRITION_MEAL_GROUP_OPTIONS } from "@/constants/nutritionOptions";
import {
  removeSmartLogSuggestedEntry,
  updateSmartLogSuggestedEntry,
} from "@/services/nutrition/smartLoggingService";
import type { NutritionMealGroup } from "@/types/nutrition";
import type {
  SmartLogSession,
  SmartLogSuggestedEntry,
} from "@/types/smartLogging";

const INPUT_STYLE = {
  backgroundColor: "#ffffff",
  borderColor: "#fde68a",
  borderRadius: 14,
  borderWidth: 1,
  color: "#0f172a",
  minHeight: 46,
  paddingHorizontal: 12,
};

export function SmartLogReviewScreen({
  entries,
  onAddEntry,
  onCancel,
  onConfirm,
  onEntriesChanged,
  saving,
  session,
}: {
  entries: SmartLogSuggestedEntry[];
  onAddEntry: () => void;
  onCancel: () => void;
  onConfirm: () => void;
  onEntriesChanged: (entries: SmartLogSuggestedEntry[]) => void;
  saving?: boolean;
  session: SmartLogSession;
}) {
  const activeEntries = entries.filter((entry) => entry.status === "active");
  const totals = useMemo(
    () =>
      activeEntries.reduce(
        (total, entry) => ({
          calories: total.calories + entry.calories,
          carbsG: total.carbsG + entry.carbsG,
          fatG: total.fatG + entry.fatG,
          proteinG: total.proteinG + entry.proteinG,
        }),
        { calories: 0, carbsG: 0, fatG: 0, proteinG: 0 },
      ),
    [activeEntries],
  );

  async function updateEntry(
    id: string,
    partial: Partial<SmartLogSuggestedEntry>,
  ) {
    const updatedEntry = await updateSmartLogSuggestedEntry(id, partial);

    if (updatedEntry) {
      onEntriesChanged(
        entries.map((entry) => (entry.id === id ? updatedEntry : entry)),
      );
    }
  }

  async function removeEntry(id: string) {
    const removedEntry = await removeSmartLogSuggestedEntry(id);

    if (removedEntry) {
      onEntriesChanged(
        entries.map((entry) => (entry.id === id ? removedEntry : entry)),
      );
    }
  }

  return (
    <View style={{ gap: 12 }}>
      <AppCard backgroundColor="#fffbeb">
        <View style={{ gap: 8 }}>
          <Text style={{ color: "#92400e", fontSize: 20, fontWeight: "900" }}>
            Review before saving
          </Text>
          <Text style={{ color: "#92400e", lineHeight: 21 }}>
            Please confirm the food, quantity, serving, and nutrition values
            before adding anything to your diary.
          </Text>
          {session.message ? (
            <Text style={{ color: "#92400e", lineHeight: 21 }}>
              {session.message}
            </Text>
          ) : null}
        </View>
      </AppCard>

      <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 10 }}>
        <Metric label="Calories" value={`${Math.round(totals.calories)}`} />
        <Metric label="Protein" value={`${Math.round(totals.proteinG)}g`} />
        <Metric label="Carbs" value={`${Math.round(totals.carbsG)}g`} />
        <Metric label="Fat" value={`${Math.round(totals.fatG)}g`} />
      </View>

      {activeEntries.length ? (
        activeEntries.map((entry) => (
          <EditableSuggestionCard
            entry={entry}
            key={entry.id}
            onRemove={() => removeEntry(entry.id)}
            onUpdate={(partial) => updateEntry(entry.id, partial)}
          />
        ))
      ) : (
        <AppCard>
          <Text style={{ color: "#64748b", lineHeight: 21 }}>
            No draft foods yet. Add an item manually before confirming.
          </Text>
        </AppCard>
      )}

      <TouchableOpacity
        activeOpacity={0.85}
        onPress={onAddEntry}
        style={{
          alignItems: "center",
          backgroundColor: "#fffbeb",
          borderRadius: 16,
          minHeight: 50,
          justifyContent: "center",
        }}
      >
        <Text style={{ color: "#92400e", fontWeight: "900" }}>
          Add draft item
        </Text>
      </TouchableOpacity>

      <View style={{ flexDirection: "row", gap: 10 }}>
        <TouchableOpacity
          activeOpacity={0.85}
          onPress={onCancel}
          style={{
            alignItems: "center",
            backgroundColor: "#f1f5f9",
            borderRadius: 18,
            flex: 1,
            minHeight: 52,
            justifyContent: "center",
          }}
        >
          <Text style={{ color: "#475569", fontWeight: "900" }}>Cancel</Text>
        </TouchableOpacity>
        <TouchableOpacity
          activeOpacity={0.85}
          disabled={saving || activeEntries.length === 0}
          onPress={onConfirm}
          style={{
            alignItems: "center",
            backgroundColor: "#f59e0b",
            borderRadius: 18,
            flex: 1,
            justifyContent: "center",
            minHeight: 52,
            opacity: saving || activeEntries.length === 0 ? 0.55 : 1,
          }}
        >
          <Text style={{ color: "#ffffff", fontWeight: "900" }}>
            {saving ? "Saving..." : "Confirm + Save"}
          </Text>
        </TouchableOpacity>
      </View>

      <Text style={{ color: "#64748b", fontSize: 12, lineHeight: 18 }}>
        Smart logging may use photos, voice, or text you provide to create draft
        food entries. Review all suggestions before saving.
      </Text>
    </View>
  );
}

function EditableSuggestionCard({
  entry,
  onRemove,
  onUpdate,
}: {
  entry: SmartLogSuggestedEntry;
  onRemove: () => void;
  onUpdate: (partial: Partial<SmartLogSuggestedEntry>) => void;
}) {
  const [foodName, setFoodName] = useState(entry.foodName);
  const [quantity, setQuantity] = useState(String(entry.quantity));
  const [unit, setUnit] = useState(entry.unit);
  const [calories, setCalories] = useState(String(entry.calories));
  const [proteinG, setProteinG] = useState(String(entry.proteinG));
  const [carbsG, setCarbsG] = useState(String(entry.carbsG));
  const [fatG, setFatG] = useState(String(entry.fatG));

  function commit() {
    onUpdate({
      calories: Number(calories) || 0,
      carbsG: Number(carbsG) || 0,
      fatG: Number(fatG) || 0,
      foodName,
      proteinG: Number(proteinG) || 0,
      quantity: Number(quantity) || 1,
      unit,
    });
  }

  return (
    <AppCard>
      <View style={{ gap: 10 }}>
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            gap: 10,
          }}
        >
          <View style={{ flex: 1 }}>
            <Text style={{ color: "#0f172a", fontSize: 18, fontWeight: "900" }}>
              {entry.foodName || "Draft food"}
            </Text>
            <Text style={{ color: "#64748b", marginTop: 3 }}>
              Confidence {Math.round(entry.confidence * 100)}%
            </Text>
          </View>
          <TouchableOpacity activeOpacity={0.85} onPress={onRemove}>
            <Text style={{ color: "#dc2626", fontWeight: "900" }}>Remove</Text>
          </TouchableOpacity>
        </View>

        <TextInput
          onBlur={commit}
          onChangeText={setFoodName}
          placeholder="Food name"
          placeholderTextColor="#94a3b8"
          style={INPUT_STYLE}
          value={foodName}
        />

        <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
          {NUTRITION_MEAL_GROUP_OPTIONS.filter(
            (option) => option.key !== "notes",
          ).map((option) => (
            <TouchableOpacity
              activeOpacity={0.85}
              key={option.key}
              onPress={() =>
                onUpdate({ mealGroup: option.key as NutritionMealGroup })
              }
              style={{
                backgroundColor:
                  entry.mealGroup === option.key ? "#f59e0b" : "#fffbeb",
                borderRadius: 999,
                paddingHorizontal: 12,
                paddingVertical: 9,
              }}
            >
              <Text
                style={{
                  color: entry.mealGroup === option.key ? "#ffffff" : "#92400e",
                  fontWeight: "900",
                }}
              >
                {option.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={{ flexDirection: "row", gap: 10 }}>
          <TextInput
            keyboardType="numeric"
            onBlur={commit}
            onChangeText={setQuantity}
            placeholder="Quantity"
            placeholderTextColor="#94a3b8"
            style={{ ...INPUT_STYLE, flex: 1 }}
            value={quantity}
          />
          <TextInput
            onBlur={commit}
            onChangeText={setUnit}
            placeholder="Unit"
            placeholderTextColor="#94a3b8"
            style={{ ...INPUT_STYLE, flex: 1 }}
            value={unit}
          />
        </View>

        <View style={{ flexDirection: "row", gap: 10 }}>
          <TextInput
            keyboardType="numeric"
            onBlur={commit}
            onChangeText={setCalories}
            placeholder="Calories"
            placeholderTextColor="#94a3b8"
            style={{ ...INPUT_STYLE, flex: 1 }}
            value={calories}
          />
          <TextInput
            keyboardType="numeric"
            onBlur={commit}
            onChangeText={setProteinG}
            placeholder="Protein g"
            placeholderTextColor="#94a3b8"
            style={{ ...INPUT_STYLE, flex: 1 }}
            value={proteinG}
          />
        </View>

        <View style={{ flexDirection: "row", gap: 10 }}>
          <TextInput
            keyboardType="numeric"
            onBlur={commit}
            onChangeText={setCarbsG}
            placeholder="Carbs g"
            placeholderTextColor="#94a3b8"
            style={{ ...INPUT_STYLE, flex: 1 }}
            value={carbsG}
          />
          <TextInput
            keyboardType="numeric"
            onBlur={commit}
            onChangeText={setFatG}
            placeholder="Fat g"
            placeholderTextColor="#94a3b8"
            style={{ ...INPUT_STYLE, flex: 1 }}
            value={fatG}
          />
        </View>
      </View>
    </AppCard>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <View
      style={{
        backgroundColor: "#ffffff",
        borderColor: "#fde68a",
        borderRadius: 18,
        borderWidth: 1,
        flexGrow: 1,
        minWidth: "45%",
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
