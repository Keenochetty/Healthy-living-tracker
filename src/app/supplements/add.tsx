import { ScreenWrapper } from "@/components/layout/ScreenWrapper";
import { MedicationSupplementForm } from "@/components/medication/MedicationSupplementForm";

export default function AddSupplementScreen() {
  return (
    <ScreenWrapper backgroundColor="#f0fdfa">
      <MedicationSupplementForm itemType="supplement" />
    </ScreenWrapper>
  );
}
