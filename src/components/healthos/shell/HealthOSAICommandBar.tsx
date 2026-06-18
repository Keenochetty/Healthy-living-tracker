import { Pressable, StyleSheet, Text, TextInput, useColorScheme, View } from "react-native";
import { Search, Sparkles, X } from "lucide-react-native";

import {
  getHealthOSPalette,
  getHealthOSSurfaces,
  healthOSNavSizes,
  healthOSRadius,
  healthOSSpacing,
  healthOSTypography,
  type HealthOSColorMode,
} from "@/theme/healthos";

type HealthOSAICommandBarProps = {
  disabled?: boolean;
  onChangeText?: (value: string) => void;
  onOpen?: () => void;
  onSubmit?: (value: string) => void;
  placeholder?: string;
  routeContext?: string;
  testID?: string;
  value?: string;
};

export function HealthOSAICommandBar({
  disabled = false,
  onChangeText,
  onOpen,
  onSubmit,
  placeholder,
  routeContext,
  testID,
  value = "",
}: HealthOSAICommandBarProps) {
  const mode: HealthOSColorMode = useColorScheme() === "dark" ? "dark" : "light";
  const palette = getHealthOSPalette(mode);
  const surfaces = getHealthOSSurfaces(mode);
  const effectivePlaceholder = placeholder ?? getPlaceholder(routeContext);

  return (
    <Pressable
      accessibilityLabel="Open HealthOS AI command bar"
      accessibilityRole="button"
      accessibilityState={{ disabled }}
      disabled={disabled}
      onPress={onOpen}
      style={({ pressed }) => [
        styles.wrapper,
        surfaces.glassPill,
        pressed && styles.pressed,
        disabled && styles.disabled,
      ]}
      testID={testID}
    >
      <Sparkles color={palette.skyBlue} size={17} strokeWidth={2.2} />
      <View pointerEvents={onOpen ? "none" : "auto"} style={styles.inputWrap}>
        <TextInput
          accessibilityLabel="HealthOS AI command input"
          editable={!disabled && !onOpen}
          onChangeText={onChangeText}
          onSubmitEditing={(event) => onSubmit?.(event.nativeEvent.text)}
          placeholder={effectivePlaceholder}
          placeholderTextColor={palette.softText}
          returnKeyType="search"
          style={[healthOSTypography.bodySmall, styles.input, { color: palette.inkText }]}
          value={value}
        />
      </View>
      {value ? (
        <Pressable
          accessibilityLabel="Clear command"
          accessibilityRole="button"
          hitSlop={8}
          onPress={() => onChangeText?.("")}
        >
          <X color={palette.softText} size={16} />
        </Pressable>
      ) : (
        <Search color={palette.softText} size={16} />
      )}
    </Pressable>
  );
}

function getPlaceholder(routeContext?: string) {
  if (routeContext === "home" || routeContext === "today") return "Ask, scan, or import into your day";
  if (routeContext === "calendar") return "Search events or add with AI";
  if (routeContext === "health") return "Ask about health, meds, food, fitness...";
  if (routeContext === "family" || routeContext === "circle") return "Search family updates or ask AI";
  return "Ask HealthOS";
}

const styles = StyleSheet.create({
  disabled: {
    opacity: 0.48,
  },
  input: {
    height: "100%",
    padding: 0,
  },
  inputWrap: {
    flex: 1,
    height: "100%",
    justifyContent: "center",
  },
  pressed: {
    opacity: 0.82,
  },
  wrapper: {
    alignItems: "center",
    borderRadius: healthOSRadius.pill,
    flexDirection: "row",
    gap: healthOSSpacing.sm,
    height: 44,
    maxWidth: 430,
    minHeight: 44,
    paddingHorizontal: healthOSSpacing.md,
    width: "100%",
  },
});
