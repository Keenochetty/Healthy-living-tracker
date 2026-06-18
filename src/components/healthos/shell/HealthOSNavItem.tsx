import { Pressable, StyleSheet, Text, useColorScheme } from "react-native";
import Animated, {
  interpolate,
  useAnimatedStyle,
  useDerivedValue,
  withSpring,
  withTiming,
} from "react-native-reanimated";

import { AppIcon } from "@/components/ui";
import {
  getHealthOSPalette,
  healthOSMotion,
  healthOSRadius,
  healthOSSpacing,
  healthOSTypography,
  type HealthOSColorMode,
} from "@/theme/healthos";
import type { HealthOSNavItemConfig } from "./healthOSNavConfig";

type HealthOSNavItemProps = {
  active: boolean;
  item: HealthOSNavItemConfig;
  onPress: () => void;
  reducedMotion?: boolean;
  testID?: string;
};

export function HealthOSNavItem({
  active,
  item,
  onPress,
  reducedMotion = false,
  testID,
}: HealthOSNavItemProps) {
  const mode: HealthOSColorMode = useColorScheme() === "dark" ? "dark" : "light";
  const palette = getHealthOSPalette(mode);
  const activeWidth = item.key === "calendar" ? 122 : 108;
  const inactiveWidth = 48;
  const progress = useDerivedValue(() => {
    if (reducedMotion) return active ? 1 : 0;
    return withTiming(active ? 1 : 0, { duration: 280 });
  });

  const itemStyle = useAnimatedStyle(() => ({
    width: interpolate(progress.value, [0, 1], [inactiveWidth, activeWidth]),
  }));

  const capsuleStyle = useAnimatedStyle(() => ({
    backgroundColor: active
      ? mode === "dark"
        ? "rgba(125, 211, 252, 0.22)"
        : "rgba(56, 189, 248, 0.18)"
      : "transparent",
    transform: [
      {
        scale: reducedMotion
          ? 1
          : withSpring(1, {
              damping: healthOSMotion.navMorph.damping,
              mass: healthOSMotion.navMorph.mass,
              stiffness: healthOSMotion.navMorph.stiffness,
            }),
      },
    ],
  }));

  const labelStyle = useAnimatedStyle(() => ({
    opacity: interpolate(progress.value, [0, 1], [0, 1]),
    width: interpolate(progress.value, [0, 1], [0, activeWidth - 48]),
  }));

  const iconColor = active ? palette.skyBlue : palette.softText;

  return (
    <Animated.View style={[styles.item, itemStyle]} testID={testID}>
      <Pressable
        accessibilityLabel={item.accessibilityLabel}
        accessibilityRole="tab"
        accessibilityState={{ selected: active }}
        hitSlop={6}
        onPress={onPress}
        style={({ pressed }) => [styles.pressable, pressed && styles.pressed]}
      >
        <Animated.View style={[styles.capsule, capsuleStyle]}>
          <AppIcon
            color={iconColor}
            decorative
            name={item.iconName}
            size={20}
            strokeWidth={2.25}
          />
          <Animated.View style={[styles.labelWrap, labelStyle]}>
            <Text
              numberOfLines={1}
              style={[healthOSTypography.tabLabel, styles.label, { color: palette.inkText }]}
            >
              {item.label}
            </Text>
          </Animated.View>
        </Animated.View>
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  capsule: {
    alignItems: "center",
    borderRadius: healthOSRadius.pill,
    flexDirection: "row",
    gap: healthOSSpacing.xs,
    height: 48,
    justifyContent: "center",
    overflow: "hidden",
    paddingHorizontal: healthOSSpacing.md,
  },
  item: {
    height: 48,
  },
  label: {
    includeFontPadding: false,
  },
  labelWrap: {
    overflow: "hidden",
  },
  pressable: {
    alignItems: "center",
    height: 48,
    justifyContent: "center",
    width: "100%",
  },
  pressed: {
    opacity: 0.78,
    transform: [{ scale: 0.97 }],
  },
});
