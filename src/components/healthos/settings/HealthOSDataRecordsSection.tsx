import { Database } from "lucide-react-native";

import type { HealthOSProfileSettingsData } from "./HealthOSSettingsTypes";
import { HealthOSSettingsSection } from "./HealthOSSettingsSection";
import { HealthOSSettingsRow } from "./HealthOSSettingsRow";

type Props = {
  data: HealthOSProfileSettingsData;
  onClearCache: () => void;
  onExport: () => void;
  onOpenRecords: () => void;
};

export function HealthOSDataRecordsSection({ data, onClearCache, onExport, onOpenRecords }: Props) {
  return (
    <HealthOSSettingsSection title="Data and records" subtitle="Export and records controls stay review-first and route to existing areas.">
      {data.dataRecordsSummary.map((item) => (
        <HealthOSSettingsRow
          key={item.id}
          chip={item.value}
          icon={<Database size={18} />}
          onPress={item.id === "export" ? onExport : item.id === "records" ? onOpenRecords : item.id === "cache" ? onClearCache : undefined}
          subtitle={item.subtitle}
          title={item.title}
        />
      ))}
    </HealthOSSettingsSection>
  );
}
