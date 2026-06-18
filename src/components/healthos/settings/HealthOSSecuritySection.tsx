import { ShieldCheck } from "lucide-react-native";

import type { HealthOSProfileSettingsData } from "./HealthOSSettingsTypes";
import { HealthOSSettingsSection } from "./HealthOSSettingsSection";
import { HealthOSSettingsRow } from "./HealthOSSettingsRow";

type Props = {
  data: HealthOSProfileSettingsData;
  onChangePassword: () => void;
  onTwoStep: () => void;
};

export function HealthOSSecuritySection({ data, onChangePassword, onTwoStep }: Props) {
  return (
    <HealthOSSettingsSection title="Password and security" subtitle="Security actions use existing routes. Tokens and raw auth IDs are never shown.">
      {data.securitySummary.map((item) => (
        <HealthOSSettingsRow
          key={item.id}
          chip={item.value}
          icon={<ShieldCheck size={18} />}
          onPress={item.id === "password" ? onChangePassword : item.id === "2fa" ? onTwoStep : undefined}
          subtitle={item.subtitle}
          title={item.title}
        />
      ))}
    </HealthOSSettingsSection>
  );
}
