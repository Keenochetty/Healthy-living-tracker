import { Text, View } from "react-native";

import { getElderCheckInStatusLabel } from "@/constants/elderOptions";
import type { ElderSummary } from "@/types/elder";
import { AppCard } from "@/components/ui/AppCard";

type ElderSummaryCardProps = {
  summary: ElderSummary;
};

export function ElderSummaryCard({ summary }: ElderSummaryCardProps) {
  const scheduleStatus = summary.latestCheckIn
    ? summary.needsAttention
      ? "Needs attention"
      : "Last check-in looked okay"
    : "No check-ins yet";

  return (
    <AppCard backgroundColor="#ecfdf5">
      <View style={{ gap: 12 }}>
        <View>
          <Text style={{ color: "#0f172a", fontSize: 22, fontWeight: "900" }}>
            {summary.elder.displayName}
          </Text>
          <Text style={{ color: "#047857", fontWeight: "900", marginTop: 4 }}>
            {scheduleStatus}
          </Text>
        </View>

        <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 10 }}>
          <Metric
            label="Check-in"
            value={getElderCheckInStatusLabel(summary.latestCheckIn?.status)}
          />
          <Metric
            label="Vitals"
            value={
              summary.latestVitals
                ? `${summary.latestVitals.heartRate ?? "-"} BPM / ${
                    summary.latestVitals.temperature ?? "-"
                  } C`
                : "No log"
            }
          />
          <Metric
            label="Active meds"
            value={`${summary.activeMedicationCount}`}
          />
          <Metric
            label="Next visit"
            value={summary.nextAppointment?.appointmentDate ?? "None"}
          />
        </View>

        <Text style={{ color: "#64748b", lineHeight: 21 }}>
          Latest note: {summary.latestCareNote?.title ?? "No care notes yet"}
        </Text>
      </View>
    </AppCard>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <View
      style={{
        backgroundColor: "#ffffff",
        borderRadius: 16,
        minWidth: "30%",
        padding: 12,
      }}
    >
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
