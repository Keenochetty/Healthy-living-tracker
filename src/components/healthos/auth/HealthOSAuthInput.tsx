import { Eye, EyeOff } from "lucide-react-native";
import { useState } from "react";
import {
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  useColorScheme,
  View,
} from "react-native";
import type { KeyboardTypeOptions, TextInputProps } from "react-native";

import {
  getHealthOSPalette,
  getHealthOSSurfaces,
  healthOSBorderWidth,
  healthOSRadius,
  healthOSSpacing,
  healthOSTypography,
  type HealthOSColorMode,
} from "@/theme/healthos";

type HealthOSAuthInputProps = {
  autoCapitalize?: TextInputProps["autoCapitalize"];
  error?: string;
  keyboardType?: KeyboardTypeOptions;
  label: string;
  onChangeText: (value: string) => void;
  placeholder?: string;
  secureTextEntry?: boolean;
  value: string;
};

export function HealthOSAuthInput({
  autoCapitalize,
  error,
  keyboardType,
  label,
  onChangeText,
  placeholder,
  secureTextEntry = false,
  value,
}: HealthOSAuthInputProps) {
  const [focused, setFocused] = useState(false);
  const [visible, setVisible] = useState(false);
  const mode: HealthOSColorMode = useColorScheme() === "dark" ? "dark" : "light";
  const palette = getHealthOSPalette(mode);
  const surfaces = getHealthOSSurfaces(mode);
  const hidden = secureTextEntry && !visible;

  return (
    <View style={styles.container}>
      <Text style={[healthOSTypography.caption, { color: palette.softText }]}>
        {label}
      </Text>
      <View
        style={[
          styles.inputShell,
          surfaces.compactCard,
          {
            borderColor: error
              ? palette.danger
              : focused
                ? palette.skyBlue
                : palette.borderSubtle,
          },
        ]}
      >
        <TextInput
          accessibilityLabel={label}
          autoCapitalize={autoCapitalize}
          keyboardType={keyboardType}
          onBlur={() => setFocused(false)}
          onChangeText={onChangeText}
          onFocus={() => setFocused(true)}
          placeholder={placeholder}
          placeholderTextColor={palette.softText}
          secureTextEntry={hidden}
          style={[healthOSTypography.body, styles.input, { color: palette.inkText }]}
          value={value}
        />
        {secureTextEntry ? (
          <Pressable
            accessibilityLabel={visible ? "Hide password" : "Show password"}
            accessibilityRole="button"
            hitSlop={8}
            onPress={() => setVisible((current) => !current)}
            style={styles.eyeButton}
          >
            {visible ? (
              <EyeOff color={palette.softText} size={20} />
            ) : (
              <Eye color={palette.softText} size={20} />
            )}
          </Pressable>
        ) : null}
      </View>
      {error ? (
        <Text style={[healthOSTypography.caption, { color: palette.danger }]}>
          {error}
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: healthOSSpacing.xs,
  },
  eyeButton: {
    alignItems: "center",
    height: 44,
    justifyContent: "center",
    width: 44,
  },
  input: {
    flex: 1,
    height: 48,
    padding: 0,
  },
  inputShell: {
    alignItems: "center",
    borderRadius: healthOSRadius.md,
    borderWidth: healthOSBorderWidth.thin,
    flexDirection: "row",
    minHeight: 48,
    paddingHorizontal: healthOSSpacing.md,
    paddingVertical: 0,
  },
});
