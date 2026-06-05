import { Text, TouchableOpacity } from "react-native";

import { AppIcon } from "@/components/ui/AppIcon";
import type { AppIconName } from "@/constants/appIcons";
import { appColors, appRadius, appSpacing, typography } from "@/theme/designSystem";

type QuickActionButtonProps = {
  icon: AppIconName;
  label: string;
  onPress: () => void;
};

export function QuickActionButton({ icon, label, onPress }: QuickActionButtonProps) {
  return (
    <TouchableOpacity
      accessibilityLabel={label}
      accessibilityRole="button"
      activeOpacity={0.84}
      onPress={onPress}
      style={{
        alignItems: "center",
        backgroundColor: appColors.surface,
        borderColor: appColors.border,
        borderRadius: appRadius.lg,
        borderWidth: 1,
        flexDirection: "row",
        gap: appSpacing.sm,
        minHeight: 48,
        paddingHorizontal: appSpacing.md
      }}
    >
      <AppIcon name={icon} size={18} variant="primary" />
      <Text style={[typography.helper, { color: appColors.text }]}>{label}</Text>
    </TouchableOpacity>
  );
}
