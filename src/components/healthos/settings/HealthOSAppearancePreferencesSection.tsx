import { Palette } from "lucide-react-native";

import type { HealthOSProfileSettingsData } from "./HealthOSSettingsTypes";
import { HealthOSSettingsSection } from "./HealthOSSettingsSection";
import { HealthOSSettingsRow } from "./HealthOSSettingsRow";

type Props = {
  data: HealthOSProfileSettingsData;
  onManage: () => void;
};

export function HealthOSAppearancePreferencesSection({ data, onManage }: Props) {
  return (
    <HealthOSSettingsSection title="Appearance and app preferences" subtitle="Theme, units, region, motion, haptics, and start screen preferences.">
      {data.appearancePreferences.map((item) => (
        <HealthOSSettingsRow key={item.id} chip={item.value} icon={<Palette size={18} />} onPress={item.route ? onManage : undefined} subtitle={item.subtitle} title={item.title} />
      ))}
    </HealthOSSettingsSection>
  );
}
