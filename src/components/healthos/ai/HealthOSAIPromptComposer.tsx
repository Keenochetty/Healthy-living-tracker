import { Pressable, StyleSheet, TextInput, useColorScheme, View } from "react-native";
import { ArrowUp, Paperclip } from "lucide-react-native";

import {
  getHealthOSPalette,
  getHealthOSSurfaces,
  healthOSRadius,
  healthOSSpacing,
  healthOSTypography,
  type HealthOSColorMode,
} from "@/theme/healthos";

type Props = {
  disabled?: boolean;
  onAttach?: () => void;
  onChangeText: (value: string) => void;
  onSubmit: () => void;
  value: string;
};

export function HealthOSAIPromptComposer({
  disabled = false,
  onAttach,
  onChangeText,
  onSubmit,
  value,
}: Props) {
  const mode: HealthOSColorMode = useColorScheme() === "dark" ? "dark" : "light";
  const palette = getHealthOSPalette(mode);
  const surfaces = getHealthOSSurfaces(mode);
  return (
    <View style={[styles.shell, surfaces.glassPanel]}>
      <Pressable accessibilityLabel="Attach context" accessibilityRole="button" onPress={onAttach} style={styles.iconButton}>
        <Paperclip color={palette.softText} size={18} />
      </Pressable>
      <TextInput
        multiline
        onChangeText={onChangeText}
        onSubmitEditing={onSubmit}
        placeholder="Ask HealthOS AI..."
        placeholderTextColor={palette.softText}
        returnKeyType="send"
        style={[healthOSTypography.body, styles.input, { color: palette.inkText }]}
        value={value}
      />
      <Pressable
        accessibilityLabel="Send message"
        accessibilityRole="button"
        disabled={disabled || !value.trim()}
        onPress={onSubmit}
        style={({ pressed }) => [
          styles.sendButton,
          { backgroundColor: palette.ai },
          (disabled || !value.trim()) && styles.disabled,
          pressed && styles.pressed,
        ]}
      >
        <ArrowUp color={palette.deepNavy} size={18} />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  disabled: {
    opacity: 0.42,
  },
  iconButton: {
    alignItems: "center",
    height: 40,
    justifyContent: "center",
    width: 36,
  },
  input: {
    flex: 1,
    maxHeight: 110,
    minHeight: 40,
    paddingVertical: healthOSSpacing.sm,
  },
  pressed: {
    opacity: 0.76,
  },
  sendButton: {
    alignItems: "center",
    borderRadius: healthOSRadius.pill,
    height: 40,
    justifyContent: "center",
    width: 40,
  },
  shell: {
    alignItems: "flex-end",
    flexDirection: "row",
    gap: healthOSSpacing.sm,
    padding: healthOSSpacing.sm,
  },
});
