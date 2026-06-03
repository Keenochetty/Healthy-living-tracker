import { Text, View } from "react-native";

import type { ChildSummary } from "@/types/child";
import { AppCard } from "@/components/ui/AppCard";

type ChildSummaryCardProps = {
  summary: ChildSummary;
};

export function ChildSummaryCard({ summary }: ChildSummaryCardProps) {
  return (
    <AppCard backgroundColor="#faf5ff">
      <View style={{ gap: 14 }}>
        <View>
          <Text style={{ color: "#0f172a", fontSize: 22, fontWeight: "900" }}>
            {summary.child.displayName}
          </Text>
          <Text style={{ color: "#64748b", lineHeight: 20, marginTop: 4 }}>
            A parent-controlled place for care notes, logs and records.
          </Text>
        </View>

        <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 10 }}>
          <Metric
            label="Feed"
            value={
              summary.latestFeed
                ? `${summary.latestFeed.finishedAmountMl ?? summary.latestFeed.offeredAmountMl ?? 0} ml`
                : "None"
            }
          />
          <Metric
            label="Sleep"
            value={summary.latestSleep ? `${summary.latestSleep.durationMinutes}m` : "None"}
          />
          <Metric label="Milestones" value={`${summary.milestonesCount}`} />
          <Metric label="Records" value={`${summary.vaccinationRecordsCount}`} />
        </View>
      </View>
    </AppCard>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <View style={{ backgroundColor: "#ffffff", borderRadius: 16, minWidth: "30%", padding: 12 }}>
      <Text style={{ color: "#64748b", fontSize: 12, fontWeight: "800" }}>{label}</Text>
      <Text style={{ color: "#0f172a", fontSize: 18, fontWeight: "900", marginTop: 4 }}>
        {value}
      </Text>
    </View>
  );
}
