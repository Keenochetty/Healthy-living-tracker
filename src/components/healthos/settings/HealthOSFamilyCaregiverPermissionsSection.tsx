import { UsersRound } from "lucide-react-native";

import type { HealthOSProfileSettingsData } from "./HealthOSSettingsTypes";
import { HealthOSSettingsSection } from "./HealthOSSettingsSection";
import { HealthOSSettingsRow } from "./HealthOSSettingsRow";

type Props = {
  data: HealthOSProfileSettingsData;
  onManage: () => void;
};

export function HealthOSFamilyCaregiverPermissionsSection({ data, onManage }: Props) {
  return (
    <HealthOSSettingsSection
      title="Family and caregiver permissions"
      subtitle="Family and caregiver access appears here when connected."
      footerNote="Private records, medication details, and sensitive notes are not shown in this summary."
    >
      {data.familyCaregiverSummary.map((item) => (
        <HealthOSSettingsRow key={item.id} chip={item.value} icon={<UsersRound size={18} />} onPress={onManage} subtitle={item.subtitle} title={item.title} />
      ))}
    </HealthOSSettingsSection>
  );
}
