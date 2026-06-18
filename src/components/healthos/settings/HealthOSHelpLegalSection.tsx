import { CircleHelp } from "lucide-react-native";

import type { HealthOSProfileSettingsData } from "./HealthOSSettingsTypes";
import { HealthOSSettingsSection } from "./HealthOSSettingsSection";
import { HealthOSSettingsRow } from "./HealthOSSettingsRow";

type Props = {
  data: HealthOSProfileSettingsData;
  onContactSupport: () => void;
  onHelp: () => void;
  onLegal: (route?: string) => void;
};

export function HealthOSHelpLegalSection({ data, onContactSupport, onHelp, onLegal }: Props) {
  return (
    <HealthOSSettingsSection title="Help, support, and legal" subtitle={`App version ${data.appVersion}`}>
      {data.helpLegalLinks.map((item) => (
        <HealthOSSettingsRow
          key={item.id}
          chip={item.value}
          icon={<CircleHelp size={18} />}
          onPress={item.id === "help" ? onHelp : item.id === "support" ? onContactSupport : () => onLegal(item.route)}
          subtitle={item.subtitle}
          title={item.title}
        />
      ))}
    </HealthOSSettingsSection>
  );
}
