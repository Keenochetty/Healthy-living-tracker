import { Text, View } from "react-native";

import { deleteFoodLog } from "@/lib/nutritionStorage";
import type { FoodLog } from "@/types/nutrition";
import { FoodLogCard } from "./FoodLogCard";

type FoodLogListProps = {
  foodLogs: FoodLog[];
  onChange: () => void;
};

export function FoodLogList({ foodLogs, onChange }: FoodLogListProps) {
  async function removeFoodLog(id: string) {
    await deleteFoodLog(id);
    onChange();
  }

  return (
    <View style={{ gap: 10 }}>
      <Text style={{ color: "#0f172a", fontSize: 20, fontWeight: "900" }}>
        Today meals
      </Text>
      {foodLogs.length ? (
        foodLogs.map((foodLog) => (
          <FoodLogCard
            foodLog={foodLog}
            key={foodLog.id}
            onDelete={() => removeFoodLog(foodLog.id)}
          />
        ))
      ) : (
        <View
          style={{ backgroundColor: "#ffffff", borderRadius: 24, padding: 16 }}
        >
          <Text style={{ color: "#64748b", lineHeight: 21 }}>
            No meals logged yet. Add a quick meal when you are ready.
          </Text>
        </View>
      )}
    </View>
  );
}
