import { LockKeyhole } from "lucide-react-native";

import type { HealthOSProfileSettingsData } from "./HealthOSSettingsTypes";
import { HealthOSSettingsSection } from "./HealthOSSettingsSection";
import { HealthOSSettingsRow } from "./HealthOSSettingsRow";

type Props = {
  data: HealthOSProfileSettingsData;
  onManageFamily: () => void;
  onManagePrivacy: () => void;
};

export function HealthOSPrivacySharingSection({ data, onManageFamily, onManagePrivacy }: Props) {
  return (
    <HealthOSSettingsSection title="Privacy and sharing" subtitle="You choose what family or caregivers can see.">
      {data.privacySharing.map((item) => (
        <HealthOSSettingsRow
          key={item.id}
          chip={item.value}
          icon={<LockKeyhole size={18} />}
          onPress={item.id === "family" || item.id === "caregiver" ? onManageFamily : onManagePrivacy}
          subtitle={item.subtitle}
          title={item.title}
        />
      ))}
    </HealthOSSettingsSection>
  );
}
