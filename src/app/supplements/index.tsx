import { ScreenWrapper } from "@/components/layout/ScreenWrapper";
import { MedicationSupplementRealm } from "@/components/medication/MedicationSupplementRealm";

export default function SupplementsScreen() {
  return (
    <ScreenWrapper backgroundColor="#f0fdfa">
      <MedicationSupplementRealm itemType="supplement" />
    </ScreenWrapper>
  );
}
