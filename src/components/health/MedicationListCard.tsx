import { Href, router } from "expo-router";
import { Plus } from "lucide-react-native";
import { useCallback, useEffect, useState } from "react";
import { Text, View } from "react-native";

import { AppButton, AppCard, AppFormInput } from "@/components/ui";
import { MedicationCard } from "@/components/medication/MedicationCard";
import {
  createMedication,
  getMedicationScheduleByMedicationId,
  getMedications,
  markMedicationTaken,
  subscribeToMedications,
} from "@/lib/medicationStorage";
import type { MedicationItem, MedicationSchedule } from "@/types/medication";

export function MedicationListCard() {
  const [medications, setMedications] = useState<MedicationItem[]>([]);
  const [schedules, setSchedules] = useState<
    Record<string, MedicationSchedule | null>
  >({});
  const [name, setName] = useState("");
  const [dosage, setDosage] = useState("");
  const [instructions, setInstructions] = useState("");

  const loadMedications = useCallback(async () => {
    const storedMedications = await getMedications();
    const scheduleEntries = await Promise.all(
      storedMedications.map(
        async (medication) =>
          [
            medication.id,
            await getMedicationScheduleByMedicationId(medication.id),
          ] as const,
      ),
    );

    setMedications(storedMedications);
    setSchedules(Object.fromEntries(scheduleEntries));
  }, []);

  useEffect(() => {
    let isActive = true;

    getMedications().then(async (storedMedications) => {
      const scheduleEntries = await Promise.all(
        storedMedications.map(
          async (medication) =>
            [
              medication.id,
              await getMedicationScheduleByMedicationId(medication.id),
            ] as const,
        ),
      );

      if (isActive) {
        setMedications(storedMedications);
        setSchedules(Object.fromEntries(scheduleEntries));
      }
    });

    const unsubscribe = subscribeToMedications(() => {
      loadMedications();
    });

    return () => {
      isActive = false;
      unsubscribe();
    };
  }, [loadMedications]);

  async function addMedication() {
    if (!name.trim()) {
      return;
    }

    await createMedication({
      dosage,
      instructions,
      name,
    });
    setName("");
    setDosage("");
    setInstructions("");
    await loadMedications();
  }

  return (
    <View style={{ gap: 14 }}>
      <AppCard>
        <View style={{ gap: 10 }}>
          <Text style={{ color: "#0f172a", fontSize: 20, fontWeight: "900" }}>
            Medication
          </Text>
          <Text style={{ color: "#64748b", lineHeight: 21 }}>
            Add only what you entered. This app does not suggest dosage or
            medical changes.
          </Text>

          <AppFormInput
            onChangeText={setName}
            placeholder="Medication name"
            value={name}
          />
          <AppFormInput
            onChangeText={setDosage}
            placeholder="Dosage optional"
            value={dosage}
          />
          <AppFormInput
            multiline
            onChangeText={setInstructions}
            placeholder="Instructions optional"
            value={instructions}
          />

          <AppButton
            disabled={!name.trim()}
            iconLeft={<Plus color="#ffffff" size={18} />}
            onPress={addMedication}
            title="Add medication"
          />
        </View>
      </AppCard>

      {medications
        .filter((medication) => medication.active)
        .map((medication) => (
          <MedicationCard
            key={medication.id}
            medication={medication}
            onMarkTaken={() =>
              markMedicationTaken(medication.id).then(loadMedications)
            }
            onOpen={() => router.push(`/medication/${medication.id}` as Href)}
            onSchedule={() =>
              router.push(`/medication/${medication.id}` as Href)
            }
            schedule={schedules[medication.id]}
          />
        ))}
    </View>
  );
}
