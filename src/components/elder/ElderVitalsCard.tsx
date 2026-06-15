import { useState } from "react";
import { Text, TextInput, TouchableOpacity, View } from "react-native";

import { addElderVitals } from "@/lib/elderStorage";
import type { ElderVitalsLog } from "@/types/elder";
import { AppCard } from "@/components/ui/AppCard";

type ElderVitalsCardProps = {
  elderId: string;
  latestVitals?: ElderVitalsLog;
  onChange?: () => void;
};

export function ElderVitalsCard({
  elderId,
  latestVitals,
  onChange,
}: ElderVitalsCardProps) {
  const [bloodPressureDiastolic, setBloodPressureDiastolic] = useState("");
  const [bloodPressureSystolic, setBloodPressureSystolic] = useState("");
  const [bloodSugar, setBloodSugar] = useState("");
  const [heartRate, setHeartRate] = useState("");
  const [notes, setNotes] = useState("");
  const [oxygenSaturation, setOxygenSaturation] = useState("");
  const [temperature, setTemperature] = useState("");

  async function handleSave() {
    await addElderVitals({
      bloodPressureDiastolic: toNumber(bloodPressureDiastolic),
      bloodPressureSystolic: toNumber(bloodPressureSystolic),
      bloodSugar: toNumber(bloodSugar),
      elderId,
      heartRate: toNumber(heartRate),
      notes,
      oxygenSaturation: toNumber(oxygenSaturation),
      temperature: toNumber(temperature),
    });

    setBloodPressureDiastolic("");
    setBloodPressureSystolic("");
    setBloodSugar("");
    setHeartRate("");
    setNotes("");
    setOxygenSaturation("");
    setTemperature("");
    onChange?.();
  }

  return (
    <AppCard>
      <View style={{ gap: 12 }}>
        <View>
          <Text style={{ color: "#0f172a", fontSize: 20, fontWeight: "900" }}>
            Vitals log
          </Text>
          <Text style={{ color: "#64748b", lineHeight: 20, marginTop: 4 }}>
            Store values only. This app does not interpret vitals. Contact a
            healthcare professional if worried.
          </Text>
        </View>

        {latestVitals ? (
          <Text style={{ color: "#64748b" }}>
            Latest: {latestVitals.heartRate ?? "-"} BPM,{" "}
            {latestVitals.temperature ?? "-"} C
          </Text>
        ) : null}

        <TextInput
          keyboardType="numeric"
          onChangeText={setHeartRate}
          placeholder="Heart rate"
          placeholderTextColor="#94a3b8"
          style={inputStyle}
          value={heartRate}
        />
        <TextInput
          keyboardType="decimal-pad"
          onChangeText={setTemperature}
          placeholder="Temperature"
          placeholderTextColor="#94a3b8"
          style={inputStyle}
          value={temperature}
        />
        <TextInput
          keyboardType="numeric"
          onChangeText={setBloodPressureSystolic}
          placeholder="Blood pressure systolic"
          placeholderTextColor="#94a3b8"
          style={inputStyle}
          value={bloodPressureSystolic}
        />
        <TextInput
          keyboardType="numeric"
          onChangeText={setBloodPressureDiastolic}
          placeholder="Blood pressure diastolic"
          placeholderTextColor="#94a3b8"
          style={inputStyle}
          value={bloodPressureDiastolic}
        />
        <TextInput
          keyboardType="numeric"
          onChangeText={setOxygenSaturation}
          placeholder="Oxygen saturation"
          placeholderTextColor="#94a3b8"
          style={inputStyle}
          value={oxygenSaturation}
        />
        <TextInput
          keyboardType="decimal-pad"
          onChangeText={setBloodSugar}
          placeholder="Blood sugar, optional"
          placeholderTextColor="#94a3b8"
          style={inputStyle}
          value={bloodSugar}
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
            Save vitals
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
  backgroundColor: "#0f766e",
  borderRadius: 18,
  justifyContent: "center" as const,
  minHeight: 52,
};
