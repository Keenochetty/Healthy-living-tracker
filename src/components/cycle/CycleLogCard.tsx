import { useState } from "react";
import { Text, TextInput, TouchableOpacity, View } from "react-native";

import {
  FLOW_OPTIONS,
  MOOD_OPTIONS,
  SYMPTOM_OPTIONS,
} from "@/constants/cycleOptions";
import { addCycleLog } from "@/lib/cycleStorage";
import type {
  CycleFlowLevel,
  CycleMood,
  CycleSymptomType,
} from "@/types/cycle";
import { AppCard } from "@/components/ui/AppCard";

type CycleLogCardProps = {
  onChange?: () => void;
};

export function CycleLogCard({ onChange }: CycleLogCardProps) {
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [energyLevel, setEnergyLevel] = useState("3");
  const [flowLevel, setFlowLevel] = useState<CycleFlowLevel>("none");
  const [mood, setMood] = useState<CycleMood | undefined>();
  const [notes, setNotes] = useState("");
  const [painLevel, setPainLevel] = useState("0");
  const [symptoms, setSymptoms] = useState<CycleSymptomType[]>([]);

  async function handleSave() {
    await addCycleLog({
      date,
      energyLevel: clamp(Number(energyLevel), 1, 5),
      flowLevel,
      mood,
      notes,
      painLevel: clamp(Number(painLevel), 0, 10),
      symptoms,
    });

    setNotes("");
    onChange?.();
  }

  function toggleSymptom(symptom: CycleSymptomType) {
    setSymptoms((currentSymptoms) =>
      currentSymptoms.includes(symptom)
        ? currentSymptoms.filter((item) => item !== symptom)
        : [...currentSymptoms, symptom],
    );
  }

  return (
    <AppCard>
      <View style={{ gap: 12 }}>
        <View>
          <Text style={{ color: "#0f172a", fontSize: 20, fontWeight: "900" }}>
            Daily cycle log
          </Text>
          <Text style={{ color: "#64748b", lineHeight: 20, marginTop: 4 }}>
            Track patterns privately. This does not diagnose any condition.
          </Text>
        </View>

        <TextInput
          onChangeText={setDate}
          placeholder="YYYY-MM-DD"
          placeholderTextColor="#94a3b8"
          style={inputStyle}
          value={date}
        />

        <Text style={sectionLabelStyle}>Flow</Text>
        <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
          <Chip
            label="None"
            onPress={() => setFlowLevel("none")}
            selected={flowLevel === "none"}
          />
          {FLOW_OPTIONS.map((option) => (
            <Chip
              key={option.key}
              label={option.label}
              onPress={() => setFlowLevel(option.key)}
              selected={flowLevel === option.key}
            />
          ))}
        </View>

        <Text style={sectionLabelStyle}>Symptoms</Text>
        <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
          {SYMPTOM_OPTIONS.map((option) => (
            <Chip
              key={option.key}
              label={option.label}
              onPress={() => toggleSymptom(option.key)}
              selected={symptoms.includes(option.key)}
            />
          ))}
        </View>

        <Text style={sectionLabelStyle}>Mood</Text>
        <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
          {MOOD_OPTIONS.map((option) => (
            <Chip
              key={option.key}
              label={option.label}
              onPress={() => setMood(option.key)}
              selected={mood === option.key}
            />
          ))}
        </View>

        <TextInput
          keyboardType="numeric"
          onChangeText={setPainLevel}
          placeholder="Pain level 0 to 10"
          placeholderTextColor="#94a3b8"
          style={inputStyle}
          value={painLevel}
        />
        <TextInput
          keyboardType="numeric"
          onChangeText={setEnergyLevel}
          placeholder="Energy level 1 to 5"
          placeholderTextColor="#94a3b8"
          style={inputStyle}
          value={energyLevel}
        />
        <TextInput
          multiline
          onChangeText={setNotes}
          placeholder="Private notes, optional"
          placeholderTextColor="#94a3b8"
          style={[inputStyle, { minHeight: 76, textAlignVertical: "top" }]}
          value={notes}
        />

        <TouchableOpacity
          activeOpacity={0.85}
          onPress={handleSave}
          style={buttonStyle}
        >
          <Text style={{ color: "#ffffff", fontWeight: "900" }}>
            Save private log
          </Text>
        </TouchableOpacity>
      </View>
    </AppCard>
  );
}

export function Chip({
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
        backgroundColor: selected ? "#fdf2f8" : "#f8fafc",
        borderColor: selected ? "#f9a8d4" : "#e2e8f0",
        borderRadius: 999,
        borderWidth: 1,
        paddingHorizontal: 12,
        paddingVertical: 9,
      }}
    >
      <Text
        style={{ color: selected ? "#be185d" : "#475569", fontWeight: "800" }}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );
}

function clamp(value: number, min: number, max: number) {
  if (!Number.isFinite(value)) return undefined;

  return Math.min(Math.max(value, min), max);
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

const sectionLabelStyle = {
  color: "#64748b",
  fontWeight: "900" as const,
};

const buttonStyle = {
  alignItems: "center" as const,
  backgroundColor: "#db2777",
  borderRadius: 18,
  justifyContent: "center" as const,
  minHeight: 52,
};
