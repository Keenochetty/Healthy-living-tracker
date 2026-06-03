import { useEffect, useState } from "react";
import { Text, TextInput, TouchableOpacity, View } from "react-native";

import { ELDER_MEDICATION_DISCLAIMER } from "@/constants/elderOptions";
import {
  addElderMedication,
  getElderMedicationTakenLogs,
  getElderMedications,
  logElderMedicationTaken
} from "@/lib/elderStorage";
import type { ElderMedicationItem, ElderMedicationTakenLog } from "@/types/elder";
import { AppCard } from "@/components/ui/AppCard";

type ElderMedicationCardProps = {
  elderId: string;
  onChange?: () => void;
};

export function ElderMedicationCard({ elderId, onChange }: ElderMedicationCardProps) {
  const [dosage, setDosage] = useState("");
  const [instructions, setInstructions] = useState("");
  const [medications, setMedications] = useState<ElderMedicationItem[]>([]);
  const [name, setName] = useState("");
  const [takenLogs, setTakenLogs] = useState<ElderMedicationTakenLog[]>([]);

  async function loadMedications() {
    const [nextMedications, nextTakenLogs] = await Promise.all([
      getElderMedications(elderId),
      getElderMedicationTakenLogs(elderId)
    ]);

    setMedications(nextMedications);
    setTakenLogs(nextTakenLogs);
  }

  useEffect(() => {
    let isActive = true;

    Promise.all([getElderMedications(elderId), getElderMedicationTakenLogs(elderId)]).then(
      ([nextMedications, nextTakenLogs]) => {
        if (isActive) {
          setMedications(nextMedications);
          setTakenLogs(nextTakenLogs);
        }
      }
    );

    return () => {
      isActive = false;
    };
  }, [elderId]);

  async function handleAddMedication() {
    if (!name.trim()) return;

    await addElderMedication({
      dosage: dosage.trim() || undefined,
      elderId,
      instructions: instructions.trim() || undefined,
      name: name.trim()
    });

    setDosage("");
    setInstructions("");
    setName("");
    await loadMedications();
    onChange?.();
  }

  async function handleTaken(medicationId: string) {
    await logElderMedicationTaken({ elderId, medicationId });
    await loadMedications();
    onChange?.();
  }

  const activeMedications = medications.filter((medication) => medication.active);

  return (
    <AppCard>
      <View style={{ gap: 12 }}>
        <View>
          <Text style={{ color: "#0f172a", fontSize: 20, fontWeight: "900" }}>
            Medications
          </Text>
          <Text style={{ color: "#9a3412", lineHeight: 20, marginTop: 4 }}>
            {ELDER_MEDICATION_DISCLAIMER}
          </Text>
        </View>

        {activeMedications.map((medication) => (
          <View key={medication.id} style={{ backgroundColor: "#f8fafc", borderRadius: 16, padding: 12 }}>
            <Text style={{ color: "#0f172a", fontWeight: "900" }}>{medication.name}</Text>
            <Text style={{ color: "#64748b", marginTop: 3 }}>
              {medication.dosage ?? "Dosage not recorded"}
            </Text>
            <TouchableOpacity
              activeOpacity={0.85}
              onPress={() => handleTaken(medication.id)}
              style={smallButtonStyle}
            >
              <Text style={{ color: "#ffffff", fontWeight: "900" }}>Mark taken</Text>
            </TouchableOpacity>
          </View>
        ))}

        <TextInput onChangeText={setName} placeholder="Medication name" placeholderTextColor="#94a3b8" style={inputStyle} value={name} />
        <TextInput onChangeText={setDosage} placeholder="Dosage, optional" placeholderTextColor="#94a3b8" style={inputStyle} value={dosage} />
        <TextInput onChangeText={setInstructions} placeholder="Instructions, optional" placeholderTextColor="#94a3b8" style={inputStyle} value={instructions} />

        <TouchableOpacity activeOpacity={0.85} onPress={handleAddMedication} style={buttonStyle}>
          <Text style={{ color: "#ffffff", fontWeight: "900" }}>Add medication</Text>
        </TouchableOpacity>

        {takenLogs.slice(0, 3).map((log) => {
          const medication = medications.find((item) => item.id === log.medicationId);

          return (
            <Text key={log.id} style={{ color: "#64748b" }}>
              Taken: {medication?.name ?? "Medication"} at {new Date(log.takenAt).toLocaleTimeString()}
            </Text>
          );
        })}
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
  backgroundColor: "#059669",
  borderRadius: 18,
  justifyContent: "center" as const,
  minHeight: 52
};

const smallButtonStyle = {
  alignItems: "center" as const,
  backgroundColor: "#059669",
  borderRadius: 14,
  justifyContent: "center" as const,
  marginTop: 10,
  minHeight: 42
};
