import { Alert } from "react-native";
import { LogOut } from "lucide-react-native";

import { HealthOSSettingsSection } from "./HealthOSSettingsSection";
import { HealthOSSettingsRow } from "./HealthOSSettingsRow";

type Props = {
  onSignOut: () => Promise<void>;
};

export function HealthOSSignOutSection({ onSignOut }: Props) {
  function confirm() {
    Alert.alert("Sign out", "Sign out of this HealthOS account?", [
      { style: "cancel", text: "Cancel" },
      { onPress: () => void onSignOut(), text: "Sign out" },
    ]);
  }

  return (
    <HealthOSSettingsSection title="Sign out" subtitle="Sign out does not manually delete local health data from this panel.">
      <HealthOSSettingsRow icon={<LogOut size={18} />} onPress={confirm} title="Sign out" subtitle="Use the existing auth sign-out flow." />
    </HealthOSSettingsSection>
  );
}
