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
  compact?: boolean;
  focused: boolean;
  iconName: AppIconName;
  label: string;
  onLongPress?: () => void;
  onPress: () => void;
};

export function FloatingBottomNavItem({
  accessibilityLabel,
  compact = false,
  focused,
  iconName,
  label,
  onLongPress,
  onPress
}: FloatingBottomNavItemProps) {
  const [isPressed, setIsPressed] = useState(false);
  const labelWidth = Math.min(compact ? 58 : 64, Math.max(38, label.length * (compact ? 7 : 7.5) + 2));
  const activeWidth = labelWidth + (compact ? 46 : 50);
  const inactiveWidth = compact ? 38 : 42;
  const progress = useDerivedValue(() =>
    withTiming(focused ? 1 : 0, { duration: appMotion.navTransition })
  );

  const capsuleStyle = useAnimatedStyle(() => ({
    backgroundColor: interpolateColor(progress.value, [0, 1], ["rgba(255,255,255,0)", appColors.navActive]),
    borderColor: interpolateColor(progress.value, [0, 1], ["rgba(255,255,255,0)", "rgba(255,255,255,0.16)"]),
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
  const itemStyle = useAnimatedStyle(() => ({
    width: interpolate(progress.value, [0, 1], [inactiveWidth, activeWidth])
  }));

  const iconColor = focused ? appColors.navActiveText : appColors.navInactive;

  return (
    <Animated.View style={[styles.item, itemStyle]}>
      <Pressable
        accessibilityLabel={accessibilityLabel}
        accessibilityRole="tab"
        accessibilityState={{ selected: focused }}
        hitSlop={6}
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
        style={styles.pressable}
      >
        <Animated.View style={[styles.capsule, capsuleStyle]}>
          <AppIcon color={iconColor} decorative name={iconName} size={20} strokeWidth={2.2} />
          <Animated.Text numberOfLines={1} style={[styles.label, labelStyle]}>
            {label}
          </Animated.Text>
        </Animated.View>
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  capsule: {
    alignItems: "center",
    borderRadius: appRadius.pill,
    borderWidth: 1,
    flexDirection: "row",
    gap: 5,
    height: 46,
    justifyContent: "center",
    overflow: "hidden",
    paddingHorizontal: 10
  },
  label: {
    color: appColors.navActiveText,
    fontSize: 12,
    fontWeight: "800",
    includeFontPadding: false,
    flexShrink: 0
  },
  item: {
    height: 48
  },
  pressable: {
    alignItems: "center",
    height: 48,
    justifyContent: "center",
    minHeight: touchTargets.minimum,
    width: "100%"
  }
});
