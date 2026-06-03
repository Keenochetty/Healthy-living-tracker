import { useState } from "react";
import { Text, TextInput, TouchableOpacity, View } from "react-native";

import { addChildSleepLog } from "@/lib/childStorage";
import type { BabySleepLog } from "@/types/child";
import { AppCard } from "@/components/ui/AppCard";

type BabySleepLogCardProps = {
  childId: string;
  latestSleep?: BabySleepLog;
  onChange?: () => void;
};

const QUALITY_OPTIONS: Array<NonNullable<BabySleepLog["quality"]>> = [
  "poor",
  "okay",
  "good",
  "great"
];

export function BabySleepLogCard({ childId, latestSleep, onChange }: BabySleepLogCardProps) {
  const [durationMinutes, setDurationMinutes] = useState("45");
  const [quality, setQuality] = useState<NonNullable<BabySleepLog["quality"]>>("good");
  const [notes, setNotes] = useState("");

  async function handleSave() {
    const parsedDuration = Number(durationMinutes);

    if (!Number.isFinite(parsedDuration) || parsedDuration <= 0) return;

    await addChildSleepLog({
      childId,
      durationMinutes: parsedDuration,
      notes,
      quality
    });

    setNotes("");
    onChange?.();
  }

  return (
    <AppCard>
      <View style={{ gap: 12 }}>
        <View>
          <Text style={{ color: "#0f172a", fontSize: 20, fontWeight: "900" }}>
            Sleep log
          </Text>
          <Text style={{ color: "#64748b", marginTop: 4 }}>
            Latest: {latestSleep ? `${latestSleep.durationMinutes} minutes` : "No sleep logs yet"}
          </Text>
        </View>

        <TextInput
          keyboardType="numeric"
          onChangeText={setDurationMinutes}
          placeholder="Duration in minutes"
          placeholderTextColor="#94a3b8"
          style={inputStyle}
          value={durationMinutes}
        />

        <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
          {QUALITY_OPTIONS.map((option) => (
            <Pill
              key={option}
              label={option}
              onPress={() => setQuality(option)}
              selected={quality === option}
            />
          ))}
        </View>

        <TextInput
          onChangeText={setNotes}
          placeholder="Notes, optional"
          placeholderTextColor="#94a3b8"
          style={inputStyle}
          value={notes}
        />

        <TouchableOpacity activeOpacity={0.85} onPress={handleSave} style={buttonStyle}>
          <Text style={{ color: "#ffffff", fontWeight: "900" }}>Save sleep</Text>
        </TouchableOpacity>
      </View>
    </AppCard>
  );
}

function Pill({
  label,
  onPress,
  selected
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
        backgroundColor: selected ? "#e0f2fe" : "#f8fafc",
        borderColor: selected ? "#7dd3fc" : "#e2e8f0",
        borderRadius: 999,
        borderWidth: 1,
        paddingHorizontal: 12,
        paddingVertical: 9
      }}
    >
      <Text style={{ color: selected ? "#0369a1" : "#475569", fontWeight: "800" }}>
        {label}
      </Text>
    </TouchableOpacity>
  );
}

const inputStyle = {
  backgroundColor: "#f8fafc",
  borderColor: "#e2e8f0",
  borderRadius: 18,
  borderWidth: 1,
  color: "#0f172a",
  minHeight: 50,
  paddingHorizontal: 14
};

const buttonStyle = {
  alignItems: "center" as const,
  backgroundColor: "#0284c7",
  borderRadius: 18,
  justifyContent: "center" as const,
  minHeight: 50
};
