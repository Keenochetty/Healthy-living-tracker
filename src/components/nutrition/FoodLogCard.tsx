import { Image, Text, TouchableOpacity, View } from "react-native";

import { getMealTypeOption } from "@/constants/nutritionOptions";
import type { FoodLog } from "@/types/nutrition";

type FoodLogCardProps = {
  foodLog: FoodLog;
  onDelete: () => void;
  onEdit?: () => void;
};

export function FoodLogCard({ foodLog, onDelete, onEdit }: FoodLogCardProps) {
  const mealType = getMealTypeOption(foodLog.mealType);

  return (
    <View
      style={{
        backgroundColor: "#ffffff",
        borderColor: "#f1f5f9",
        borderRadius: 24,
        borderWidth: 1,
        gap: 12,
        padding: 14,
      }}
    >
      <View style={{ alignItems: "center", flexDirection: "row", gap: 12 }}>
        {foodLog.imageUri ? (
          <Image
            accessibilityLabel={`${foodLog.name} food photo`}
            alt={`${foodLog.name} food photo`}
            source={{ uri: foodLog.imageUri }}
            style={{ borderRadius: 16, height: 52, width: 52 }}
          />
        ) : (
          <View
            style={{
              alignItems: "center",
              backgroundColor: `${mealType.colour}18`,
              borderRadius: 16,
              height: 52,
              justifyContent: "center",
              width: 52,
            }}
          >
            <Text style={{ color: mealType.colour, fontWeight: "900" }}>
              {mealType.emoji}
            </Text>
          </View>
        )}

        <View style={{ flex: 1 }}>
          <Text style={{ color: "#0f172a", fontSize: 16, fontWeight: "900" }}>
            {foodLog.name}
          </Text>
          <Text style={{ color: "#64748b", marginTop: 3 }}>
            {mealType.label}
            {foodLog.portionDescription
              ? ` - ${foodLog.portionDescription}`
              : ""}
          </Text>
          {foodLog.nutrition.calories ? (
            <Text style={{ color: "#64748b", marginTop: 3 }}>
              {foodLog.nutrition.calories} kcal estimate
            </Text>
          ) : null}
        </View>

        {foodLog.estimateOnly ? (
          <View
            style={{
              backgroundColor: "#fef3c7",
              borderRadius: 999,
              paddingHorizontal: 8,
              paddingVertical: 5,
            }}
          >
            <Text style={{ color: "#92400e", fontSize: 11, fontWeight: "900" }}>
              Estimate
            </Text>
          </View>
        ) : null}
      </View>

      {foodLog.notes ? (
        <Text style={{ color: "#64748b", lineHeight: 20 }}>
          {foodLog.notes}
        </Text>
      ) : null}

      <View style={{ flexDirection: "row", gap: 10 }}>
        {onEdit ? <ActionButton label="Edit" onPress={onEdit} /> : null}
        <ActionButton label="Delete" onPress={onDelete} danger />
      </View>
    </View>
  );
}

function ActionButton({
  danger = false,
  label,
  onPress,
}: {
  danger?: boolean;
  label: string;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity
      activeOpacity={0.85}
      onPress={onPress}
      style={{
        alignItems: "center",
        backgroundColor: danger ? "#fee2e2" : "#ede9fe",
        borderRadius: 14,
        flex: 1,
        justifyContent: "center",
        minHeight: 42,
      }}
    >
      <Text
        style={{ color: danger ? "#dc2626" : "#6d28d9", fontWeight: "900" }}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );
}
