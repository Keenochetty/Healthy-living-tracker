import { useLocalSearchParams } from "expo-router";

import { ScreenWrapper } from "@/components/layout/ScreenWrapper";
import { MedicationSupplementDetail } from "@/components/medication/MedicationSupplementRealm";

export default function MedicationDetailScreen() {
  const params = useLocalSearchParams<{ medicationId?: string | string[] }>();
  const medicationId = Array.isArray(params.medicationId) ? params.medicationId[0] : params.medicationId;

  return (
    <ScreenWrapper backgroundColor="#fffaf0">
      <MedicationSupplementDetail itemId={medicationId ?? ""} itemType="medication" />
    </ScreenWrapper>
  );
}
