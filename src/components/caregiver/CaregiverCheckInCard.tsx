import { useEffect, useState } from "react";
import { Text, TextInput, TouchableOpacity, View } from "react-native";

import {
  addCaregiverCheckIn,
  checkInCaregiver,
  checkOutCaregiver,
  getCaregiverCheckIns,
} from "@/lib/caregiverStorage";
import type { CaregiverCheckIn } from "@/types/caregiver";
import { AppCard } from "@/components/ui/AppCard";

type CaregiverCheckInCardProps = { caregiverId: string; onChange?: () => void };

export function CaregiverCheckInCard({
  caregiverId,
  onChange,
}: CaregiverCheckInCardProps) {
  const [logs, setLogs] = useState<CaregiverCheckIn[]>([]);
  const [notes, setNotes] = useState("");

  async function loadLogs() {
    setLogs(await getCaregiverCheckIns(caregiverId));
  }

  useEffect(() => {
    let isActive = true;
    getCaregiverCheckIns(caregiverId).then((nextLogs) => {
      if (isActive) setLogs(nextLogs);
    });
    return () => {
      isActive = false;
    };
  }, [caregiverId]);

  async function handleCheckIn() {
    await checkInCaregiver(caregiverId);
    await loadLogs();
    onChange?.();
  }

  async function handleCheckOut() {
    await checkOutCaregiver(caregiverId);
    await loadLogs();
    onChange?.();
  }

  async function handleNote() {
    if (!notes.trim()) return;
    await addCaregiverCheckIn({ caregiverId, notes, status: "checked_in" });
    setNotes("");
    await loadLogs();
    onChange?.();
  }

  return (
    <AppCard>
      <View style={{ gap: 12 }}>
        <Text style={{ color: "#0f172a", fontSize: 20, fontWeight: "900" }}>
          Check-in/out
        </Text>
        <Text style={{ color: "#64748b", lineHeight: 20 }}>
          Check-ins help families see when care started or ended. They are not
          emergency monitoring.
        </Text>
        <View style={{ flexDirection: "row", gap: 8 }}>
          <ActionButton label="Check in" onPress={handleCheckIn} />
          <ActionButton label="Check out" onPress={handleCheckOut} />
        </View>
        <TextInput
          onChangeText={setNotes}
          placeholder="Notes, optional"
          placeholderTextColor="#94a3b8"
          style={inputStyle}
          value={notes}
        />
        <TouchableOpacity
          activeOpacity={0.85}
          onPress={handleNote}
          style={secondaryButtonStyle}
        >
          <Text style={{ color: "#4f46e5", fontWeight: "900" }}>
            Save note status
          </Text>
        </TouchableOpacity>
        <Text style={{ color: "#64748b" }}>
          Latest: {logs[0]?.status ?? "No check-ins yet"}
        </Text>
      </View>
    </AppCard>
  );
}

function ActionButton({
  label,
  onPress,
}: {
  label: string;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity
      activeOpacity={0.85}
      onPress={onPress}
      style={buttonStyle}
    >
      <Text style={{ color: "#ffffff", fontWeight: "900" }}>{label}</Text>
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
  paddingHorizontal: 14,
};
const buttonStyle = {
  alignItems: "center" as const,
  backgroundColor: "#4f46e5",
  borderRadius: 18,
  flex: 1,
  justifyContent: "center" as const,
  minHeight: 52,
};
const secondaryButtonStyle = {
  alignItems: "center" as const,
  backgroundColor: "#eef2ff",
  borderRadius: 18,
  justifyContent: "center" as const,
  minHeight: 48,
};
