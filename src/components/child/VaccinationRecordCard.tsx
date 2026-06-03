import { useEffect, useState } from "react";
import { Text, TextInput, TouchableOpacity, View } from "react-native";

import {
  VACCINATION_DISCLAIMER,
  VACCINATION_STATUSES
} from "@/constants/childOptions";
import {
  addVaccinationRecord,
  getVaccinationRecords
} from "@/lib/childStorage";
import type { VaccinationRecord, VaccinationStatus } from "@/types/child";
import { AppCard } from "@/components/ui/AppCard";

type VaccinationRecordCardProps = {
  childId: string;
  onChange?: () => void;
};

export function VaccinationRecordCard({ childId, onChange }: VaccinationRecordCardProps) {
  const [completedDate, setCompletedDate] = useState("");
  const [notes, setNotes] = useState("");
  const [records, setRecords] = useState<VaccinationRecord[]>([]);
  const [scheduledDate, setScheduledDate] = useState("");
  const [status, setStatus] = useState<VaccinationStatus>("planned");
  const [vaccineName, setVaccineName] = useState("");

  async function loadRecords() {
    setRecords(await getVaccinationRecords(childId));
  }

  useEffect(() => {
    let isActive = true;

    getVaccinationRecords(childId).then((nextRecords) => {
      if (isActive) {
        setRecords(nextRecords);
      }
    });

    return () => {
      isActive = false;
    };
  }, [childId]);

  async function handleSave() {
    if (!vaccineName.trim()) return;

    await addVaccinationRecord({
      childId,
      completedDate: completedDate.trim() || undefined,
      notes,
      scheduledDate: scheduledDate.trim() || undefined,
      status,
      vaccineName: vaccineName.trim()
    });

    setCompletedDate("");
    setNotes("");
    setScheduledDate("");
    setVaccineName("");
    await loadRecords();
    onChange?.();
  }

  return (
    <AppCard>
      <View style={{ gap: 12 }}>
        <View>
          <Text style={{ color: "#0f172a", fontSize: 20, fontWeight: "900" }}>
            Vaccination records
          </Text>
          <Text style={{ color: "#9a3412", lineHeight: 20, marginTop: 4 }}>
            {VACCINATION_DISCLAIMER}
          </Text>
        </View>

        <TextInput
          onChangeText={setVaccineName}
          placeholder="Vaccine or clinic record name"
          placeholderTextColor="#94a3b8"
          style={inputStyle}
          value={vaccineName}
        />
        <TextInput
          onChangeText={setScheduledDate}
          placeholder="Scheduled date, optional"
          placeholderTextColor="#94a3b8"
          style={inputStyle}
          value={scheduledDate}
        />
        <TextInput
          onChangeText={setCompletedDate}
          placeholder="Completed date, optional"
          placeholderTextColor="#94a3b8"
          style={inputStyle}
          value={completedDate}
        />

        <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
          {VACCINATION_STATUSES.map((option) => {
            const selected = status === option;

            return (
              <TouchableOpacity
                activeOpacity={0.85}
                key={option}
                onPress={() => setStatus(option)}
                style={{
                  backgroundColor: selected ? "#ede9fe" : "#f8fafc",
                  borderColor: selected ? "#c4b5fd" : "#e2e8f0",
                  borderRadius: 999,
                  borderWidth: 1,
                  paddingHorizontal: 12,
                  paddingVertical: 9
                }}
              >
                <Text style={{ color: selected ? "#6d28d9" : "#475569", fontWeight: "800" }}>
                  {option}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        <TextInput
          onChangeText={setNotes}
          placeholder="Notes, optional"
          placeholderTextColor="#94a3b8"
          style={inputStyle}
          value={notes}
        />

        <TouchableOpacity activeOpacity={0.85} onPress={handleSave} style={buttonStyle}>
          <Text style={{ color: "#ffffff", fontWeight: "900" }}>Save record</Text>
        </TouchableOpacity>

        {records.slice(0, 4).map((record) => (
          <View key={record.id} style={{ backgroundColor: "#f8fafc", borderRadius: 16, padding: 12 }}>
            <Text style={{ color: "#0f172a", fontWeight: "900" }}>{record.vaccineName}</Text>
            <Text style={{ color: "#64748b", marginTop: 3 }}>{record.status}</Text>
          </View>
        ))}
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
  backgroundColor: "#7c3aed",
  borderRadius: 18,
  justifyContent: "center" as const,
  minHeight: 50
};
