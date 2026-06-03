import { Text, View } from "react-native";

import { AppCard } from "@/components/ui/AppCard";
import type { DailyNutritionSummary } from "@/types/nutrition";

type DailyNutritionSummaryCardProps = {
  summary: DailyNutritionSummary;
};

export function DailyNutritionSummaryCard({ summary }: DailyNutritionSummaryCardProps) {
  return (
    <AppCard>
      <View style={{ gap: 12 }}>
        <View style={{ alignItems: "center", flexDirection: "row", justifyContent: "space-between" }}>
          <View>
            <Text style={{ color: "#0f172a", fontSize: 20, fontWeight: "900" }}>
              Daily nutrition
            </Text>
            <Text style={{ color: "#64748b", marginTop: 3 }}>
              {summary.foodLogCount} food log{summary.foodLogCount === 1 ? "" : "s"} today
            </Text>
          </View>
          {summary.estimateOnly ? (
            <View style={{ backgroundColor: "#fef3c7", borderRadius: 999, paddingHorizontal: 10, paddingVertical: 6 }}>
              <Text style={{ color: "#92400e", fontSize: 12, fontWeight: "900" }}>
                Estimate
              </Text>
            </View>
          ) : null}
        </View>

        <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 10 }}>
          <Metric label="Calories" value={`${Math.round(summary.calories)}`} />
          <Metric label="Protein" value={`${Math.round(summary.proteinGrams)}g`} />
          <Metric label="Carbs" value={`${Math.round(summary.carbsGrams)}g`} />
          <Metric label="Fat" value={`${Math.round(summary.fatGrams)}g`} />
          <Metric label="Water" value={`${Math.round(summary.waterMl)}ml`} />
        </View>
      </View>
    </AppCard>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <View style={{ backgroundColor: "#f8fafc", borderRadius: 16, minWidth: "30%", padding: 12 }}>
      <Text style={{ color: "#64748b", fontSize: 12, fontWeight: "800" }}>{label}</Text>
      <Text style={{ color: "#0f172a", fontSize: 18, fontWeight: "900", marginTop: 4 }}>
        {value}
      </Text>
    </View>
  );
}
