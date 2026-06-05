import { Text, TouchableOpacity } from "react-native";

import { appColors, appRadius, appSpacing, typography } from "@/theme/designSystem";

type TabPillProps = {
  active?: boolean;
  label: string;
  onPress: () => void;
};

export function TabPill({ active, label, onPress }: TabPillProps) {
  return (
    <TouchableOpacity
      accessibilityRole="button"
      activeOpacity={0.84}
      onPress={onPress}
      style={{
        alignItems: "center",
        backgroundColor: active ? appColors.primarySoft : appColors.surface,
        borderColor: active ? appColors.primary : appColors.border,
        borderRadius: appRadius.pill,
        borderWidth: 1,
        minHeight: 44,
        paddingHorizontal: appSpacing.lg,
        justifyContent: "center"
      }}
    >
      <Text style={[typography.helper, { color: active ? appColors.primary : appColors.textSecondary }]}>{label}</Text>
    </TouchableOpacity>
  );
}
