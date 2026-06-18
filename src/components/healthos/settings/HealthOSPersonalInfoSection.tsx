import { UserRound } from "lucide-react-native";

import type { HealthOSProfileSettingsData } from "./HealthOSSettingsTypes";
import { HealthOSSettingsSection } from "./HealthOSSettingsSection";
import { HealthOSSettingsRow } from "./HealthOSSettingsRow";

type Props = {
  data: HealthOSProfileSettingsData;
  onEditProfile: () => void;
};

export function HealthOSPersonalInfoSection({ data, onEditProfile }: Props) {
  return (
    <HealthOSSettingsSection title="Personal information" subtitle="Only real profile data is shown. Missing fields stay marked as not set.">
      {data.personalInfo.map((item) => (
        <HealthOSSettingsRow key={item.id} icon={<UserRound size={18} />} onPress={item.route ? onEditProfile : undefined} subtitle={item.subtitle} title={item.title} value={item.value} />
      ))}
    </HealthOSSettingsSection>
  );
}
