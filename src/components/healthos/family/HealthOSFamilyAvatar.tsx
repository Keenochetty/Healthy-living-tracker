import { StyleSheet, Text, useColorScheme, View } from "react-native";

import {
  getHealthOSPalette,
  healthOSBorderWidth,
  healthOSRadius,
  healthOSTypography,
  type HealthOSColorMode,
} from "@/theme/healthos";

type HealthOSFamilyAvatarProps = {
  initials: string;
  size?: number;
};

export function HealthOSFamilyAvatar({ initials, size = 46 }: HealthOSFamilyAvatarProps) {
  const mode: HealthOSColorMode = useColorScheme() === "dark" ? "dark" : "light";
  const palette = getHealthOSPalette(mode);

  return (
    <View
      style={[
        styles.avatar,
        {
          backgroundColor: `${palette.family}24`,
          borderColor: `${palette.family}66`,
          borderRadius: size / 2,
          height: size,
          width: size,
        },
      ]}
    >
      <Text style={[healthOSTypography.buttonLabel, { color: palette.family }]}>
        {initials || "?"}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  avatar: {
    alignItems: "center",
    borderWidth: healthOSBorderWidth.thin,
    justifyContent: "center",
  },
});

