import { useState } from "react";
import { Text, TextInput, TouchableOpacity, View } from "react-native";

import { URGENT_PREGNANCY_SYMPTOM_WARNING } from "@/constants/cycleOptions";
import { addPregnancySymptomLog } from "@/lib/cycleStorage";
import type { PregnancySymptomSeverity } from "@/types/cycle";
import { AppCard } from "@/components/ui/AppCard";
import { Chip } from "./CycleLogCard";

type PregnancySymptomCardProps = {
  onChange?: () => void;
  pregnancyProfileId: string;
};

const SEVERITY_OPTIONS: PregnancySymptomSeverity[] = [
  "mild",
  "moderate",
  "strong",
  "urgent"
];

export function PregnancySymptomCard({
  onChange,
  pregnancyProfileId
}: PregnancySymptomCardProps) {
  const [notes, setNotes] = useState("");
  const [severity, setSeverity] = useState<PregnancySymptomSeverity>("mild");
  const [symptom, setSymptom] = useState("");

  async function handleSave() {
    if (!symptom.trim()) return;

    await addPregnancySymptomLog({
      notes,
      pregnancyProfileId,
      severity,
      symptom: symptom.trim()
    });

    setNotes("");
    setSymptom("");
    onChange?.();
  }

  return (
    <AppCard>
      <View style={{ gap: 12 }}>
        <View>
          <Text style={{ color: "#0f172a", fontSize: 20, fontWeight: "900" }}>
            Pregnancy symptoms
          </Text>
          <Text style={{ color: "#64748b", lineHeight: 20, marginTop: 4 }}>
            Log symptoms privately. This app does not assess or diagnose symptoms.
          </Text>
        </View>

        <TextInput
          onChangeText={setSymptom}
          placeholder="Symptom"
          placeholderTextColor="#94a3b8"
          style={inputStyle}
          value={symptom}
        />

        <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
          {SEVERITY_OPTIONS.map((option) => (
            <Chip
              key={option}
              label={option}
              onPress={() => setSeverity(option)}
              selected={severity === option}
            />
          ))}
        </View>

        <TextInput
          multiline
          onChangeText={setNotes}
          placeholder="Private notes, optional"
          placeholderTextColor="#94a3b8"
          style={[inputStyle, { minHeight: 76, textAlignVertical: "top" }]}
          value={notes}
        />

        {severity === "urgent" ? (
          <Text style={{ color: "#9a3412", lineHeight: 21 }}>
            {URGENT_PREGNANCY_SYMPTOM_WARNING}
          </Text>
        ) : null}

        <TouchableOpacity activeOpacity={0.85} onPress={handleSave} style={buttonStyle}>
          <Text style={{ color: "#ffffff", fontWeight: "900" }}>Save symptom</Text>
        </TouchableOpacity>
      </View>
    </AppCard>
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
  backgroundColor: "#db2777",
  borderRadius: 18,
  justifyContent: "center" as const,
  minHeight: 52
};
