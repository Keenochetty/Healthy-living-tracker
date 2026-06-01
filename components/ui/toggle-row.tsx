import { Switch } from "react-native";
import type { ReactNode } from "react";

import { colors } from "@/constants/theme";
import { SettingsRow } from "@/components/ui/settings-row";

type ToggleRowProps = {
  disabled?: boolean;
  icon?: ReactNode;
  label: string;
  onValueChange: (value: boolean) => void;
  subtitle?: string;
  value: boolean;
};

export function ToggleRow({ disabled, icon, label, onValueChange, subtitle, value }: ToggleRowProps) {
  return (
    <SettingsRow
      accessory={
        <Switch
          disabled={disabled}
          ios_backgroundColor={colors.border.strong}
          onValueChange={onValueChange}
          thumbColor={colors.card.background}
          trackColor={{ false: colors.border.strong, true: colors.brand.primary }}
          value={value}
        />
      }
      icon={icon}
      label={label}
      subtitle={subtitle}
    />
  );
}
