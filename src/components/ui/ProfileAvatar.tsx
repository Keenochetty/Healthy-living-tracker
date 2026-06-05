import { Text, View } from "react-native";

import { appColors, appRadius, typography } from "@/theme/designSystem";

type ProfileAvatarProps = {
  label: string;
  size?: number;
};

export function ProfileAvatar({ label, size = 42 }: ProfileAvatarProps) {
  return (
    <View
      accessibilityLabel={`${label} profile avatar`}
      style={{
        alignItems: "center",
        backgroundColor: appColors.primarySoft,
        borderRadius: appRadius.pill,
        height: size,
        justifyContent: "center",
        width: size
      }}
    >
      <Text style={[typography.helper, { color: appColors.primary }]}>{label.slice(0, 1).toUpperCase()}</Text>
    </View>
  );
}
