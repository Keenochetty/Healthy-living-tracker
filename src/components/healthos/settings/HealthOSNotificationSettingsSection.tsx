import { Bell } from "lucide-react-native";

import type { HealthOSProfileSettingsData } from "./HealthOSSettingsTypes";
import { HealthOSSettingsSection } from "./HealthOSSettingsSection";
import { HealthOSSettingsRow } from "./HealthOSSettingsRow";

type Props = {
  data: HealthOSProfileSettingsData;
  onManage: () => void;
};

export function HealthOSNotificationSettingsSection({ data, onManage }: Props) {
  return (
    <HealthOSSettingsSection title="Notifications" subtitle="Reminder categories stay managed by the existing notification settings route.">
      {data.notificationPreferences.map((item) => (
        <HealthOSSettingsRow key={item.id} chip={item.value} icon={<Bell size={18} />} onPress={onManage} subtitle={item.subtitle} title={item.title} />
      ))}
    </HealthOSSettingsSection>
  );
}
