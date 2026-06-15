import { Text, View } from "react-native";

import { formatReminderDate, formatReminderTime } from "@/lib/reminderStorage";
import type { MedicationTakenLog } from "@/types/medication";

type MedicationTakenHistoryProps = {
  logs: MedicationTakenLog[];
};

export function MedicationTakenHistory({ logs }: MedicationTakenHistoryProps) {
  return (
    <View style={{ gap: 10 }}>
      <Text style={{ color: "#0f172a", fontSize: 20, fontWeight: "900" }}>
        Taken history
      </Text>

      {logs.length ? (
        logs.slice(0, 8).map((log) => (
          <View
            key={log.id}
            style={{
              backgroundColor: "#ffffff",
              borderRadius: 18,
              padding: 14,
            }}
          >
            <Text style={{ color: "#0f172a", fontWeight: "900" }}>
              {formatReminderDate(log.takenAt)} at{" "}
              {formatReminderTime(log.takenAt)}
            </Text>
            {log.note ? (
              <Text style={{ color: "#64748b", lineHeight: 20, marginTop: 4 }}>
                {log.note}
              </Text>
            ) : null}
          </View>
        ))
      ) : (
        <View
          style={{ backgroundColor: "#ffffff", borderRadius: 18, padding: 14 }}
        >
          <Text style={{ color: "#64748b" }}>No taken logs yet.</Text>
        </View>
      )}
    </View>
  );
}
