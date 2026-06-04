import { ScreenWrapper } from "@/components/layout/ScreenWrapper";
import { MedicationSupplementForm } from "@/components/medication/MedicationSupplementForm";

export default function AddMedicationScreen() {
  return (
    <ScreenWrapper backgroundColor="#fffaf0">
      <MedicationSupplementForm itemType="medication" />
    </ScreenWrapper>
  );
}
