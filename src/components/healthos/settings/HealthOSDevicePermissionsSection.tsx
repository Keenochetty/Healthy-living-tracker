import { Smartphone } from "lucide-react-native";

import type { HealthOSProfileSettingsData } from "./HealthOSSettingsTypes";
import { HealthOSSettingsSection } from "./HealthOSSettingsSection";
import { HealthOSSettingsRow } from "./HealthOSSettingsRow";

type Props = {
  data: HealthOSProfileSettingsData;
  onOpenSettings: () => void;
  onRequestPermission: () => void;
};

export function HealthOSDevicePermissionsSection({ data, onOpenSettings, onRequestPermission }: Props) {
  return (
    <HealthOSSettingsSection title="Device permissions" subtitle="Permissions are requested only when you start a feature that needs them.">
      {data.devicePermissions.map((permission) => (
        <HealthOSSettingsRow
          key={permission.key}
          chip={permission.status}
          icon={<Smartphone size={18} />}
          onPress={permission.status === "denied" ? onOpenSettings : onRequestPermission}
          subtitle={permission.description}
          title={permission.title}
        />
      ))}
    </HealthOSSettingsSection>
  );
}
