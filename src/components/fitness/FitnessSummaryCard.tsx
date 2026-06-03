import { Text, View } from "react-native";

import { AppCard } from "@/components/ui/AppCard";
import type { FitnessSummary } from "@/types/fitness";

type FitnessSummaryCardProps = {
  summary: FitnessSummary;
};

export function FitnessSummaryCard({ summary }: FitnessSummaryCardProps) {
  return (
    <AppCard>
      <View style={{ gap: 12 }}>
        <View>
          <Text style={{ color: "#0f172a", fontSize: 20, fontWeight: "900" }}>
            Fitness summary
          </Text>
          <Text style={{ color: "#64748b", marginTop: 3 }}>
            {summary.latestWorkout
              ? `Latest: ${summary.latestWorkout.title}`
              : "Start with a short walk or stretch when you are ready."}
          </Text>
        </View>

        <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 10 }}>
          <Metric label="Steps" value={`${summary.stepsToday}`} />
          <Metric label="Minutes" value={`${summary.activeMinutesToday}`} />
          <Metric label="This week" value={`${summary.workoutsThisWeek}`} />
          <Metric label="Streak" value={`${summary.currentStreakDays}d`} />
        </View>

        <View style={{ backgroundColor: "#e2e8f0", borderRadius: 999, height: 10, overflow: "hidden" }}>
          <View
            style={{
              backgroundColor: "#22c55e",
              borderRadius: 999,
              height: "100%",
              width: `${summary.weeklyGoalProgress}%` as `${number}%`
            }}
          />
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
