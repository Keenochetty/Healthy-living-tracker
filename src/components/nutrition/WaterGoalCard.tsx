import { useState } from "react";
import { Text, TextInput, TouchableOpacity, View } from "react-native";

import { AppCard } from "@/components/ui/AppCard";
import { QUICK_WATER_AMOUNTS } from "@/constants/nutritionOptions";
import { addWaterFromNutrition, setWaterGoal } from "@/lib/nutritionStorage";
import type { WaterGoal } from "@/types/nutrition";

type WaterGoalCardProps = {
  onChange: () => void;
  waterGoal: WaterGoal;
};

export function WaterGoalCard({ onChange, waterGoal }: WaterGoalCardProps) {
  const [targetMl, setTargetMl] = useState(String(waterGoal.targetMl));
  const progress = waterGoal.targetMl
    ? Math.min(100, (waterGoal.currentMl / waterGoal.targetMl) * 100)
    : 0;

  async function saveTarget() {
    await setWaterGoal(Number(targetMl) || 0);
    onChange();
  }

  async function addWater(amountMl: number) {
    await addWaterFromNutrition(amountMl);
    onChange();
  }

  return (
    <AppCard backgroundColor="#eff6ff">
      <View style={{ gap: 12 }}>
        <View>
          <Text style={{ color: "#0f172a", fontSize: 20, fontWeight: "900" }}>
            Water goal
          </Text>
          <Text style={{ color: "#64748b", marginTop: 3 }}>
            {waterGoal.currentMl}ml of {waterGoal.targetMl}ml
          </Text>
        </View>

        <View
          style={{
            backgroundColor: "#dbeafe",
            borderRadius: 999,
            height: 12,
            overflow: "hidden",
          }}
        >
          <View
            style={{
              backgroundColor: "#3b82f6",
              borderRadius: 999,
              height: "100%",
              width: `${progress}%` as `${number}%`,
            }}
          />
        </View>

        <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
          {QUICK_WATER_AMOUNTS.slice(0, 3).map((amount) => (
            <TouchableOpacity
              activeOpacity={0.85}
              key={amount}
              onPress={() => addWater(amount)}
              style={{
                backgroundColor: "#ffffff",
                borderRadius: 999,
                paddingHorizontal: 12,
                paddingVertical: 9,
              }}
            >
              <Text style={{ color: "#2563eb", fontWeight: "900" }}>
                +{amount}ml
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={{ alignItems: "center", flexDirection: "row", gap: 10 }}>
          <TextInput
            keyboardType="number-pad"
            onChangeText={setTargetMl}
            placeholder="Target ml"
            placeholderTextColor="#94a3b8"
            style={{
              backgroundColor: "#ffffff",
              borderRadius: 16,
              color: "#0f172a",
              flex: 1,
              minHeight: 46,
              paddingHorizontal: 12,
            }}
            value={targetMl}
          />
          <TouchableOpacity
            activeOpacity={0.85}
            onPress={saveTarget}
            style={{
              backgroundColor: "#3b82f6",
              borderRadius: 16,
              paddingHorizontal: 14,
              paddingVertical: 13,
            }}
          >
            <Text style={{ color: "#ffffff", fontWeight: "900" }}>Save</Text>
          </TouchableOpacity>
        </View>
      </View>
    </AppCard>
  );
}
