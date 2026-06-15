import { useEffect, useState } from "react";
import { Text, View } from "react-native";

import { getCycleLogs, subscribeToCycle } from "@/lib/cycleStorage";
import type { CycleLog } from "@/types/cycle";
import { AppCard } from "@/components/ui/AppCard";

export function CycleCalendarCard() {
  const [logs, setLogs] = useState<CycleLog[]>([]);

  async function loadLogs() {
    setLogs(await getCycleLogs());
  }

  useEffect(() => {
    let isActive = true;

    getCycleLogs().then((nextLogs) => {
      if (isActive) {
        setLogs(nextLogs);
      }
    });

    const unsubscribe = subscribeToCycle(() => {
      loadLogs();
    });

    return () => {
      isActive = false;
      unsubscribe();
    };
  }, []);

  return (
    <AppCard>
      <View style={{ gap: 12 }}>
        <View>
          <Text style={{ color: "#0f172a", fontSize: 20, fontWeight: "900" }}>
            Recent private logs
          </Text>
          <Text style={{ color: "#64748b", lineHeight: 20, marginTop: 4 }}>
            A simple list for now. A richer calendar can come later.
          </Text>
        </View>

        {logs.length ? (
          logs.slice(0, 8).map((log) => (
            <View
              key={log.id}
              style={{
                backgroundColor: "#f8fafc",
                borderRadius: 16,
                padding: 12,
              }}
            >
              <Text style={{ color: "#0f172a", fontWeight: "900" }}>
                {log.date}
              </Text>
              <Text style={{ color: "#64748b", marginTop: 3 }}>
                Flow: {log.flowLevel} {log.mood ? `- Mood: ${log.mood}` : ""}
              </Text>
            </View>
          ))
        ) : (
          <Text style={{ color: "#64748b", lineHeight: 21 }}>
            No cycle logs yet.
          </Text>
        )}
      </View>
    </AppCard>
  );
}
