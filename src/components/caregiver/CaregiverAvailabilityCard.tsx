import { useEffect, useState } from "react";
import { Switch, Text, TextInput, TouchableOpacity, View } from "react-native";

import { addCaregiverAvailability, getCaregiverAvailability } from "@/lib/caregiverStorage";
import type { CaregiverAvailability } from "@/types/caregiver";
import { AppCard } from "@/components/ui/AppCard";
import { CaregiverChip } from "./CaregiverChip";

type CaregiverAvailabilityCardProps = { caregiverId: string; onChange?: () => void };
const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export function CaregiverAvailabilityCard({ caregiverId, onChange }: CaregiverAvailabilityCardProps) {
  const [available, setAvailable] = useState(true);
  const [dayOfWeek, setDayOfWeek] = useState(1);
  const [endTime, setEndTime] = useState("17:00");
  const [notes, setNotes] = useState("");
  const [rows, setRows] = useState<CaregiverAvailability[]>([]);
  const [startTime, setStartTime] = useState("08:00");

  async function loadRows() { setRows(await getCaregiverAvailability(caregiverId)); }

  useEffect(() => {
    let isActive = true;
    getCaregiverAvailability(caregiverId).then((nextRows) => {
      if (isActive) setRows(nextRows);
    });
    return () => { isActive = false; };
  }, [caregiverId]);

  async function handleSave() {
    await addCaregiverAvailability({ available, caregiverId, dayOfWeek, endTime, notes, startTime });
    setNotes("");
    await loadRows();
    onChange?.();
  }

  return (
    <AppCard>
      <View style={{ gap: 12 }}>
        <Text style={{ color: "#0f172a", fontSize: 20, fontWeight: "900" }}>Availability</Text>
        <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
          {DAYS.map((day, index) => (
            <CaregiverChip key={day} label={day} onPress={() => setDayOfWeek(index)} selected={dayOfWeek === index} />
          ))}
        </View>
        <TextInput onChangeText={setStartTime} placeholder="Start time" placeholderTextColor="#94a3b8" style={inputStyle} value={startTime} />
        <TextInput onChangeText={setEndTime} placeholder="End time" placeholderTextColor="#94a3b8" style={inputStyle} value={endTime} />
        <View style={{ alignItems: "center", flexDirection: "row", justifyContent: "space-between" }}>
          <Text style={{ color: "#0f172a", fontWeight: "800" }}>Available</Text>
          <Switch onValueChange={setAvailable} value={available} />
        </View>
        <TextInput onChangeText={setNotes} placeholder="Notes, optional" placeholderTextColor="#94a3b8" style={inputStyle} value={notes} />
        <TouchableOpacity activeOpacity={0.85} onPress={handleSave} style={buttonStyle}>
          <Text style={{ color: "#ffffff", fontWeight: "900" }}>Save availability</Text>
        </TouchableOpacity>
        {rows.slice(0, 5).map((row) => (
          <Text key={row.id} style={{ color: "#64748b" }}>
            {DAYS[row.dayOfWeek]} {row.startTime}-{row.endTime} {row.available ? "available" : "unavailable"}
          </Text>
        ))}
      </View>
    </AppCard>
  );
}

const inputStyle = { backgroundColor: "#f8fafc", borderColor: "#e2e8f0", borderRadius: 18, borderWidth: 1, color: "#0f172a", minHeight: 50, paddingHorizontal: 14 };
const buttonStyle = { alignItems: "center" as const, backgroundColor: "#4f46e5", borderRadius: 18, justifyContent: "center" as const, minHeight: 52 };
