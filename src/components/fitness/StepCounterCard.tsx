import { useEffect, useState } from "react";
import { Text, TouchableOpacity, View } from "react-native";

import { AppCard } from "@/components/ui/AppCard";
import { getTodayStepCount, isPedometerAvailable } from "@/lib/pedometer";

type StepCounterCardProps = {
  onRefresh?: () => void;
};

export function StepCounterCard({ onRefresh }: StepCounterCardProps) {
  const [available, setAvailable] = useState<boolean | null>(null);
  const [steps, setSteps] = useState(0);

  async function refreshSteps() {
    const [nextAvailable, nextSteps] = await Promise.all([
      isPedometerAvailable(),
      getTodayStepCount()
    ]);

    setAvailable(nextAvailable);
    setSteps(nextSteps);
    onRefresh?.();
  }

  useEffect(() => {
    let isActive = true;

    Promise.all([isPedometerAvailable(), getTodayStepCount()]).then(
      ([nextAvailable, nextSteps]) => {
        if (isActive) {
          setAvailable(nextAvailable);
          setSteps(nextSteps);
        }
      }
    );

    return () => {
      isActive = false;
    };
  }, []);

  return (
    <AppCard backgroundColor="#f0fdf4">
      <View style={{ gap: 12 }}>
        <View>
          <Text style={{ color: "#0f172a", fontSize: 20, fontWeight: "900" }}>
            Steps today
          </Text>
          <Text style={{ color: "#166534", fontSize: 30, fontWeight: "900", marginTop: 5 }}>
            {steps}
          </Text>
        </View>

        <Text style={{ color: "#64748b", lineHeight: 20 }}>
          {available
            ? "Step tracking is available on this device."
            : "Step tracking is not available on this device. You can still log workouts manually."}
        </Text>

        <TouchableOpacity
          activeOpacity={0.85}
          onPress={refreshSteps}
          style={{
            alignItems: "center",
            backgroundColor: "#22c55e",
            borderRadius: 16,
            justifyContent: "center",
            minHeight: 46
          }}
        >
          <Text style={{ color: "#ffffff", fontWeight: "900" }}>Refresh steps</Text>
        </TouchableOpacity>
      </View>
    </AppCard>
  );
}
