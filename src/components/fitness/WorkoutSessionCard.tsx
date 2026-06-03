import { Text, View } from "react-native";

import { getWorkoutTypeOption } from "@/constants/fitnessOptions";
import type { WorkoutSession } from "@/types/fitness";

type WorkoutSessionCardProps = {
  session: WorkoutSession;
};

export function WorkoutSessionCard({ session }: WorkoutSessionCardProps) {
  const type = getWorkoutTypeOption(session.workoutType);
  const minutes = Math.round(session.durationSeconds / 60);

  return (
    <View style={{ backgroundColor: "#ffffff", borderRadius: 22, gap: 8, padding: 14 }}>
      <View style={{ alignItems: "center", flexDirection: "row", gap: 12 }}>
        <View
          style={{
            alignItems: "center",
            backgroundColor: `${type.colour}18`,
            borderRadius: 16,
            height: 44,
            justifyContent: "center",
            width: 50
          }}
        >
          <Text style={{ color: type.colour, fontWeight: "900" }}>{type.emoji}</Text>
        </View>
        <View style={{ flex: 1 }}>
          <Text style={{ color: "#0f172a", fontSize: 16, fontWeight: "900" }}>
            {session.title}
          </Text>
          <Text style={{ color: "#64748b", marginTop: 3 }}>
            {minutes} min - {type.label} - {session.intensity}
          </Text>
        </View>
        <Text style={{ color: session.completed ? "#16a34a" : "#64748b", fontWeight: "900" }}>
          {session.completed ? "Done" : "Open"}
        </Text>
      </View>
      {session.notes ? (
        <Text style={{ color: "#64748b", lineHeight: 20 }}>{session.notes}</Text>
      ) : null}
    </View>
  );
}
