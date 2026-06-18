import { Watch } from "lucide-react-native";

import type { HealthOSProfileSettingsData } from "./HealthOSSettingsTypes";
import { HealthOSSettingsSection } from "./HealthOSSettingsSection";
import { HealthOSSettingsRow } from "./HealthOSSettingsRow";

type Props = {
  data: HealthOSProfileSettingsData;
  onManage: () => void;
};

export function HealthOSConnectedDevicesSection({ data, onManage }: Props) {
  return (
    <HealthOSSettingsSection title="Connected devices and integrations" subtitle="Device and health integrations are foundation-only unless already connected.">
      {data.connectedDevices.map((item) => (
        <HealthOSSettingsRow key={item.id} chip={item.value} icon={<Watch size={18} />} onPress={item.route ? onManage : undefined} subtitle={item.subtitle} title={item.title} />
      ))}
    </HealthOSSettingsSection>
  );
}
