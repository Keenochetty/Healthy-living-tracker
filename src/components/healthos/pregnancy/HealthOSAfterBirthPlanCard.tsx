import { ChecklistCard } from "./HealthOSPregnancyChecklistCard";
import type { HealthOSChecklistSection } from "./HealthOSPregnancyTypes";

type Props = {
  checklist: HealthOSChecklistSection;
  onToggle: (id: string) => void;
};

export function HealthOSAfterBirthPlanCard({ checklist, onToggle }: Props) {
  return <ChecklistCard checklist={checklist} onToggle={onToggle} />;
}
