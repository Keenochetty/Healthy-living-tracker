import { View } from "react-native";

import { HealthOSCard } from "@/components/healthos/HealthOSCard";
import { HealthOSPill } from "@/components/healthos/HealthOSPill";

import type { HealthOSMedicationCaution } from "./HealthOSMedicationTypes";
import { EmptyState, MedicationText, medicationSharedStyles } from "./HealthOSMedicationShared";

type Props = {
  cautions: HealthOSMedicationCaution[];
};

export function HealthOSMedicationCautionsCard({ cautions }: Props) {
  return (
    <HealthOSCard title="Cautions" subtitle="Review prompts from saved app data.">
      <View style={medicationSharedStyles.row}>
        {cautions.length ? (
          cautions.map((caution) => (
            <View key={caution.id} style={medicationSharedStyles.row}>
              <HealthOSPill label={caution.type} size="sm" variant={caution.severity === "danger" ? "danger" : caution.severity === "warning" ? "warning" : "default"} />
              <MedicationText strong>{caution.title}</MedicationText>
              <MedicationText muted>{caution.description}</MedicationText>
            </View>
          ))
        ) : (
          <EmptyState text="No caution prompts are saved right now. HealthSync does not claim this means there are no interactions or risks." />
        )}
      </View>
    </HealthOSCard>
  );
}
