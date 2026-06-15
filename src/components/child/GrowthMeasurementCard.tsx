import { useState } from "react";
import { Text, TextInput, TouchableOpacity, View } from "react-native";

import { addGrowthMeasurement } from "@/lib/childStorage";
import type { GrowthMeasurement } from "@/types/child";
import { AppCard } from "@/components/ui/AppCard";

type GrowthMeasurementCardProps = {
  childId: string;
  latestGrowth?: GrowthMeasurement;
  onChange?: () => void;
};

export function GrowthMeasurementCard({
  childId,
  latestGrowth,
  onChange,
}: GrowthMeasurementCardProps) {
  const [weight, setWeight] = useState("");
  const [height, setHeight] = useState("");
  const [headCircumference, setHeadCircumference] = useState("");
  const [notes, setNotes] = useState("");

  async function handleSave() {
    await addGrowthMeasurement({
      childId,
      headCircumference: toNumber(headCircumference),
      headCircumferenceUnit: "cm",
      height: toNumber(height),
      heightUnit: "cm",
      notes,
      weight: toNumber(weight),
      weightUnit: "kg",
    });

    setWeight("");
    setHeight("");
    setHeadCircumference("");
    setNotes("");
    onChange?.();
  }

  return (
    <AppCard>
      <View style={{ gap: 12 }}>
        <View>
          <Text style={{ color: "#0f172a", fontSize: 20, fontWeight: "900" }}>
            Growth measurements
          </Text>
          <Text style={{ color: "#64748b", lineHeight: 20, marginTop: 4 }}>
            Store measurements only. This app does not interpret growth or
            diagnose concerns.
          </Text>
        </View>

        {latestGrowth ? (
          <Text style={{ color: "#64748b" }}>
            Latest: {latestGrowth.weight ?? "-"} kg,{" "}
            {latestGrowth.height ?? "-"} cm
          </Text>
        ) : null}

        <TextInput
          keyboardType="decimal-pad"
          onChangeText={setWeight}
          placeholder="Weight kg"
          placeholderTextColor="#94a3b8"
          style={inputStyle}
          value={weight}
        />
        <TextInput
          keyboardType="decimal-pad"
          onChangeText={setHeight}
          placeholder="Height cm"
          placeholderTextColor="#94a3b8"
          style={inputStyle}
          value={height}
        />
        <TextInput
          keyboardType="decimal-pad"
          onChangeText={setHeadCircumference}
          placeholder="Head circumference cm"
          placeholderTextColor="#94a3b8"
          style={inputStyle}
          value={headCircumference}
        />
        <TextInput
          onChangeText={setNotes}
          placeholder="Notes, optional"
          placeholderTextColor="#94a3b8"
          style={inputStyle}
          value={notes}
        />

        <TouchableOpacity
          activeOpacity={0.85}
          onPress={handleSave}
          style={buttonStyle}
        >
          <Text style={{ color: "#ffffff", fontWeight: "900" }}>
            Save measurement
          </Text>
        </TouchableOpacity>
      </View>
    </AppCard>
  );
}

function toNumber(value: string) {
  const parsed = Number(value);

  return Number.isFinite(parsed) && value.trim() ? parsed : undefined;
}

const inputStyle = {
  backgroundColor: "#f8fafc",
  borderColor: "#e2e8f0",
  borderRadius: 18,
  borderWidth: 1,
  color: "#0f172a",
  minHeight: 50,
  paddingHorizontal: 14,
};

const buttonStyle = {
  alignItems: "center" as const,
  backgroundColor: "#7c3aed",
  borderRadius: 18,
  justifyContent: "center" as const,
  minHeight: 50,
};
