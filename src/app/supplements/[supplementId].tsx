import { useLocalSearchParams } from "expo-router";

import { ScreenWrapper } from "@/components/layout/ScreenWrapper";
import { MedicationSupplementDetail } from "@/components/medication/MedicationSupplementRealm";

export default function SupplementDetailScreen() {
  const params = useLocalSearchParams<{ supplementId?: string | string[] }>();
  const supplementId = Array.isArray(params.supplementId)
    ? params.supplementId[0]
    : params.supplementId;

  return (
    <ScreenWrapper backgroundColor="#f0fdfa">
      <MedicationSupplementDetail
        itemId={supplementId ?? ""}
        itemType="supplement"
      />
    </ScreenWrapper>
  );
}
