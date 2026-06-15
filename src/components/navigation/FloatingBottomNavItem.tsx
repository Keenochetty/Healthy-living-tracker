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
import { appMotion, appRadius, touchTargets } from "@/theme/designSystem";
import { useAppTheme } from "@/theme/ThemeProvider";

type FloatingBottomNavItemProps = {
  accessibilityLabel: string;
  focused: boolean;
  iconName: AppIconName;
  label: string;
  onLongPress?: () => void;
  onPress: () => void;
};

export function FloatingBottomNavItem({
  accessibilityLabel,
  focused,
  iconName,
  label,
  onLongPress,
  onPress
}: FloatingBottomNavItemProps) {
  const [isPressed, setIsPressed] = useState(false);
  const { theme } = useAppTheme();
  const labelWidth = Math.min(66, Math.max(38, label.length * 7.5 + 2));
  const activeWidth = labelWidth + 50;
  const inactiveWidth = 42;
  const activeForeground = isDarkBackground(theme.background) ? theme.background : "#ffffff";
  const progress = useDerivedValue(() =>
    withTiming(focused ? 1 : 0, { duration: appMotion.navTransition })
  );

  const capsuleStyle = useAnimatedStyle(() => ({
    backgroundColor: interpolateColor(progress.value, [0, 1], ["rgba(255,255,255,0)", theme.primary]),
    borderColor: interpolateColor(progress.value, [0, 1], ["rgba(255,255,255,0)", theme.primary]),
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

  const iconColor = focused ? activeForeground : theme.mutedText;

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
          <Animated.Text numberOfLines={1} style={[styles.label, { color: activeForeground }, labelStyle]}>
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

function isDarkBackground(color: string) {
  return color.startsWith("#0") || color.startsWith("#1") || color.includes("rgba(");
}
