import { CreditCard } from "lucide-react-native";

import type { HealthOSProfileSettingsData } from "./HealthOSSettingsTypes";
import { HealthOSSettingsSection } from "./HealthOSSettingsSection";
import { HealthOSSettingsRow } from "./HealthOSSettingsRow";

type Props = {
  data: HealthOSProfileSettingsData;
  onManage: () => void;
  onRestore: () => void;
};

export function HealthOSSubscriptionBillingSection({ data, onManage, onRestore }: Props) {
  return (
    <HealthOSSettingsSection title="Subscription and billing" subtitle="Subscription management will appear when billing is connected.">
      {data.subscriptionBilling.map((item) => (
        <HealthOSSettingsRow
          key={item.id}
          chip={item.value}
          icon={<CreditCard size={18} />}
          onPress={item.id === "restore" ? onRestore : onManage}
          subtitle={item.subtitle}
          title={item.title}
        />
      ))}
    </HealthOSSettingsSection>
  );
}
