import { Text, TouchableOpacity, View } from "react-native";

import { getWorkoutTypeOption } from "@/constants/fitnessOptions";
import type { WorkoutPlan } from "@/types/fitness";

type WorkoutPlanCardProps = {
  onDelete: () => void;
  onEdit?: () => void;
  onStart: () => void;
  plan: WorkoutPlan;
};

export function WorkoutPlanCard({
  onDelete,
  onEdit,
  onStart,
  plan,
}: WorkoutPlanCardProps) {
  const type = getWorkoutTypeOption(plan.workoutType);
  const targets = [
    plan.targetMinutes ? `${plan.targetMinutes} min` : null,
    plan.targetSteps ? `${plan.targetSteps} steps` : null,
    plan.targetDistanceKm ? `${plan.targetDistanceKm} km` : null,
  ].filter(Boolean);

  return (
    <View
      style={{
        backgroundColor: "#ffffff",
        borderRadius: 24,
        gap: 12,
        padding: 15,
      }}
    >
      <View style={{ alignItems: "center", flexDirection: "row", gap: 12 }}>
        <View
          style={{
            alignItems: "center",
            backgroundColor: `${type.colour}18`,
            borderRadius: 18,
            height: 48,
            justifyContent: "center",
            width: 56,
          }}
        >
          <Text style={{ color: type.colour, fontWeight: "900" }}>
            {type.emoji}
          </Text>
        </View>
        <View style={{ flex: 1 }}>
          <Text style={{ color: "#0f172a", fontSize: 16, fontWeight: "900" }}>
            {plan.title}
          </Text>
          <Text style={{ color: "#64748b", marginTop: 3 }}>
            {type.label} - {plan.intensity}
          </Text>
          {targets.length ? (
            <Text style={{ color: "#64748b", marginTop: 3 }}>
              {targets.join(" - ")}
            </Text>
          ) : null}
        </View>
      </View>

      <View style={{ flexDirection: "row", gap: 10 }}>
        <ActionButton label="Start" onPress={onStart} primary />
        {onEdit ? <ActionButton label="Edit" onPress={onEdit} /> : null}
        <ActionButton danger label="Delete" onPress={onDelete} />
      </View>
    </View>
  );
}

function ActionButton({
  danger = false,
  label,
  onPress,
  primary = false,
}: {
  danger?: boolean;
  label: string;
  onPress: () => void;
  primary?: boolean;
}) {
  return (
    <TouchableOpacity
      activeOpacity={0.85}
      onPress={onPress}
      style={{
        alignItems: "center",
        backgroundColor: primary ? "#22c55e" : danger ? "#fee2e2" : "#dcfce7",
        borderRadius: 14,
        flex: 1,
        justifyContent: "center",
        minHeight: 42,
      }}
    >
      <Text
        style={{
          color: primary ? "#ffffff" : danger ? "#dc2626" : "#166534",
          fontWeight: "900",
        }}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );
}
