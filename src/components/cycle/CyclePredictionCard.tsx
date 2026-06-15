import { useEffect, useState } from "react";
import { Text, View } from "react-native";

import {
  calculateCyclePrediction,
  getPossiblePregnancyHint,
  subscribeToCycle,
} from "@/lib/cycleStorage";
import type { CyclePrediction } from "@/types/cycle";
import { AppCard } from "@/components/ui/AppCard";

export function CyclePredictionCard() {
  const [hint, setHint] = useState<string | null>(null);
  const [prediction, setPrediction] = useState<CyclePrediction | null>(null);

  async function loadPrediction() {
    const [nextPrediction, nextHint] = await Promise.all([
      calculateCyclePrediction(),
      getPossiblePregnancyHint(),
    ]);

    setPrediction(nextPrediction);
    setHint(nextHint);
  }

  useEffect(() => {
    let isActive = true;

    Promise.all([calculateCyclePrediction(), getPossiblePregnancyHint()]).then(
      ([nextPrediction, nextHint]) => {
        if (isActive) {
          setPrediction(nextPrediction);
          setHint(nextHint);
        }
      },
    );

    const unsubscribe = subscribeToCycle(() => {
      loadPrediction();
    });

    return () => {
      isActive = false;
      unsubscribe();
    };
  }, []);

  return (
    <AppCard backgroundColor="#fdf2f8">
      <View style={{ gap: 12 }}>
        <View>
          <Text style={{ color: "#0f172a", fontSize: 20, fontWeight: "900" }}>
            Private estimates
          </Text>
          <Text style={{ color: "#64748b", lineHeight: 20, marginTop: 4 }}>
            Estimates may shift as you add more private logs.
          </Text>
        </View>

        {prediction?.nextPeriodStart ? (
          <View style={{ gap: 8 }}>
            <Metric
              label="Estimated next period"
              value={prediction.nextPeriodStart}
            />
            <Metric
              label="Estimated period end"
              value={prediction.nextPeriodEnd ?? "Not enough data"}
            />
            <Metric
              label="Estimated ovulation"
              value={prediction.estimatedOvulationDate ?? "Not enough data"}
            />
            <Metric
              label="Estimated fertile window"
              value={
                prediction.fertileWindowStart && prediction.fertileWindowEnd
                  ? `${prediction.fertileWindowStart} to ${prediction.fertileWindowEnd}`
                  : "Not enough data"
              }
            />
            <Text style={{ color: "#be185d", fontWeight: "900" }}>
              Estimate only - confidence {prediction.confidence}
            </Text>
          </View>
        ) : (
          <Text style={{ color: "#64748b", lineHeight: 21 }}>
            Add your last period date to see estimates.
          </Text>
        )}

        {hint ? (
          <Text style={{ color: "#9a3412", lineHeight: 21 }}>{hint}</Text>
        ) : null}
      </View>
    </AppCard>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <View style={{ backgroundColor: "#ffffff", borderRadius: 16, padding: 12 }}>
      <Text style={{ color: "#64748b", fontSize: 12, fontWeight: "800" }}>
        {label}
      </Text>
      <Text
        style={{
          color: "#0f172a",
          fontSize: 16,
          fontWeight: "900",
          marginTop: 4,
        }}
      >
        {value}
      </Text>
    </View>
  );
}
