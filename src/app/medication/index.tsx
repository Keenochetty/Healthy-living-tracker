import { ScreenWrapper } from "@/components/layout/ScreenWrapper";
import { MedicationSupplementRealm } from "@/components/medication/MedicationSupplementRealm";

export default function MedicationScreen() {
  return (
    <ScreenWrapper backgroundColor="#fffaf0">
      <MedicationSupplementRealm itemType="medication" />
    </ScreenWrapper>
  );
}
