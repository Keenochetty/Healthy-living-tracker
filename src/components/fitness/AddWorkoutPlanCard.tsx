import { useState } from "react";
import { Text, TextInput, TouchableOpacity, View } from "react-native";

import { AppCard } from "@/components/ui/AppCard";
import {
  INTENSITY_OPTIONS,
  WORKOUT_TYPE_OPTIONS,
} from "@/constants/fitnessOptions";
import { createWorkoutPlan } from "@/lib/fitnessStorage";
import type { WorkoutIntensity, WorkoutType } from "@/types/fitness";

type AddWorkoutPlanCardProps = {
  onSaved: () => void;
};

export function AddWorkoutPlanCard({ onSaved }: AddWorkoutPlanCardProps) {
  const [title, setTitle] = useState("");
  const [workoutType, setWorkoutType] = useState<WorkoutType>("walking");
  const [intensity, setIntensity] = useState<WorkoutIntensity>("easy");
  const [targetMinutes, setTargetMinutes] = useState("");
  const [targetSteps, setTargetSteps] = useState("");
  const [targetDistanceKm, setTargetDistanceKm] = useState("");

  async function savePlan() {
    if (!title.trim()) return;

    await createWorkoutPlan({
      intensity,
      targetDistanceKm: Number(targetDistanceKm) || undefined,
      targetMinutes: Number(targetMinutes) || undefined,
      targetSteps: Number(targetSteps) || undefined,
      title,
      workoutType,
    });
    setTitle("");
    setTargetMinutes("");
    setTargetSteps("");
    setTargetDistanceKm("");
    onSaved();
  }

  return (
    <AppCard>
      <View style={{ gap: 12 }}>
        <View>
          <Text style={{ color: "#0f172a", fontSize: 20, fontWeight: "900" }}>
            Add workout plan
          </Text>
          <Text style={{ color: "#64748b", lineHeight: 20, marginTop: 4 }}>
            Keep it simple. You can start with a walk, stretch, or short gym
            session.
          </Text>
        </View>

        <TextInput
          onChangeText={setTitle}
          placeholder="Plan title"
          placeholderTextColor="#94a3b8"
          style={inputStyle}
          value={title}
        />

        <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
          {WORKOUT_TYPE_OPTIONS.map((option) => (
            <ChoicePill
              key={option.key}
              label={`${option.emoji} ${option.label}`}
              onPress={() => setWorkoutType(option.key)}
              selected={workoutType === option.key}
            />
          ))}
        </View>

        <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
          {INTENSITY_OPTIONS.map((option) => (
            <ChoicePill
              key={option.key}
              label={option.label}
              onPress={() => setIntensity(option.key)}
              selected={intensity === option.key}
            />
          ))}
        </View>

        <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
          <TextInput
            keyboardType="number-pad"
            onChangeText={setTargetMinutes}
            placeholder="Minutes"
            placeholderTextColor="#94a3b8"
            style={{ ...inputStyle, flexGrow: 1, minWidth: "30%" }}
            value={targetMinutes}
          />
          <TextInput
            keyboardType="number-pad"
            onChangeText={setTargetSteps}
            placeholder="Steps"
            placeholderTextColor="#94a3b8"
            style={{ ...inputStyle, flexGrow: 1, minWidth: "30%" }}
            value={targetSteps}
          />
          <TextInput
            keyboardType="numeric"
            onChangeText={setTargetDistanceKm}
            placeholder="Km"
            placeholderTextColor="#94a3b8"
            style={{ ...inputStyle, flexGrow: 1, minWidth: "30%" }}
            value={targetDistanceKm}
          />
        </View>

        <TouchableOpacity
          activeOpacity={0.85}
          disabled={!title.trim()}
          onPress={savePlan}
          style={{
            alignItems: "center",
            backgroundColor: "#22c55e",
            borderRadius: 18,
            justifyContent: "center",
            minHeight: 52,
            opacity: title.trim() ? 1 : 0.55,
          }}
        >
          <Text style={{ color: "#ffffff", fontSize: 16, fontWeight: "900" }}>
            Save workout plan
          </Text>
        </TouchableOpacity>
      </View>
    </AppCard>
  );
}

const inputStyle = {
  backgroundColor: "#f8fafc",
  borderColor: "#f1f5f9",
  borderRadius: 18,
  borderWidth: 1,
  color: "#0f172a",
  minHeight: 50,
  paddingHorizontal: 14,
};

function ChoicePill({
  label,
  onPress,
  selected,
}: {
  label: string;
  onPress: () => void;
  selected: boolean;
}) {
  return (
    <TouchableOpacity
      activeOpacity={0.85}
      onPress={onPress}
      style={{
        backgroundColor: selected ? "#22c55e" : "#f8fafc",
        borderRadius: 999,
        paddingHorizontal: 12,
        paddingVertical: 9,
      }}
    >
      <Text
        style={{ color: selected ? "#ffffff" : "#475569", fontWeight: "900" }}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );
}
