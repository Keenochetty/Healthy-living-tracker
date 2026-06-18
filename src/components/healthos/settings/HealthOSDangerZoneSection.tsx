import { TriangleAlert } from "lucide-react-native";

import { HealthOSSettingsSection } from "./HealthOSSettingsSection";
import { HealthOSSettingsRow } from "./HealthOSSettingsRow";

type Props = {
  onDeleteAccountRequest: () => void;
};

export function HealthOSDangerZoneSection({ onDeleteAccountRequest }: Props) {
  return (
    <HealthOSSettingsSection
      sensitive
      title="Delete account danger zone"
      subtitle="Destructive actions require verified backend support and confirmation."
      footerNote="Account deletion request flow is not connected yet from this control panel."
    >
      <HealthOSSettingsRow destructive icon={<TriangleAlert size={18} />} onPress={onDeleteAccountRequest} title="Delete account" subtitle="Requires a separate verified deletion flow." />
      <HealthOSSettingsRow destructive disabled icon={<TriangleAlert size={18} />} title="Delete all health data" subtitle="Deferred until a safe backend deletion handler is confirmed." />
      <HealthOSSettingsRow destructive disabled icon={<TriangleAlert size={18} />} title="Request data deletion" subtitle="Foundation row only." />
    </HealthOSSettingsSection>
  );
}
