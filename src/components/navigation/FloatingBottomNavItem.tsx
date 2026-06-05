import { useState } from "react";
import { Pressable, StyleSheet } from "react-native";
import Animated, {
  interpolate,
  interpolateColor,
  useAnimatedStyle,
  useDerivedValue,
  withSpring,
  withTiming
} from "react-native-reanimated";

import { AppIcon } from "@/components/ui";
import type { AppIconName } from "@/constants/appIcons";
import { lightImpact } from "@/lib/haptics";
import { appColors, appMotion, appRadius, touchTargets } from "@/theme/designSystem";

type FloatingBottomNavItemProps = {
  accessibilityLabel: string;
  focused: boolean;
  iconName: AppIconName;
  label: string;
  offsetY?: number;
  onLongPress?: () => void;
  onPress: () => void;
};

export function FloatingBottomNavItem({
  accessibilityLabel,
  focused,
  iconName,
  label,
  offsetY = 0,
  onLongPress,
  onPress
}: FloatingBottomNavItemProps) {
  const [isPressed, setIsPressed] = useState(false);
  const labelWidth = Math.min(58, Math.max(34, label.length * 7.6));
  const activeWidth = labelWidth + 52;
  const inactiveWidth = 48;
  const progress = useDerivedValue(() =>
    withTiming(focused ? 1 : 0, { duration: appMotion.navTransition })
  );

  const capsuleStyle = useAnimatedStyle(() => ({
    backgroundColor: interpolateColor(progress.value, [0, 1], ["rgba(255,255,255,0)", appColors.navActive]),
    borderColor: interpolateColor(progress.value, [0, 1], ["rgba(255,255,255,0)", "rgba(110, 231, 200, 0.20)"]),
    transform: [
      {
        scale: withSpring(isPressed ? 0.95 : 1, appMotion.spring)
      }
    ],
    width: interpolate(progress.value, [0, 1], [inactiveWidth, activeWidth])
  }));

  const labelStyle = useAnimatedStyle(() => ({
    opacity: progress.value,
    transform: [{ translateX: interpolate(progress.value, [0, 1], [-6, 0]) }],
    width: interpolate(progress.value, [0, 1], [0, labelWidth])
  }));

  const iconColor = focused ? appColors.navActiveText : appColors.navInactive;

  return (
    <Pressable
      accessibilityLabel={accessibilityLabel}
      accessibilityRole="tab"
      accessibilityState={{ selected: focused }}
      hitSlop={8}
      onLongPress={onLongPress}
      onPress={() => {
        lightImpact();
        onPress();
      }}
      onPressIn={() => {
        setIsPressed(true);
      }}
      onPressOut={() => {
        setIsPressed(false);
      }}
      style={[
        styles.pressable,
        { width: focused ? activeWidth : inactiveWidth },
        offsetY ? { transform: [{ translateY: offsetY }] } : null
      ]}
    >
      <Animated.View style={[styles.capsule, capsuleStyle]}>
        <AppIcon color={iconColor} decorative name={iconName} size={22} strokeWidth={2.35} />
        <Animated.Text numberOfLines={1} style={[styles.label, labelStyle]}>
          {label}
        </Animated.Text>
      </Animated.View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  capsule: {
    alignItems: "center",
    borderRadius: appRadius.pill,
    borderWidth: 1,
    flexDirection: "row",
    gap: 6,
    height: 50,
    justifyContent: "center",
    overflow: "hidden",
    paddingHorizontal: 12
  },
  label: {
    color: appColors.navActiveText,
    fontSize: 13,
    fontWeight: "800",
    includeFontPadding: false
  },
  pressable: {
    alignItems: "center",
    height: 52,
    justifyContent: "center",
    minHeight: touchTargets.minimum
  }
});
