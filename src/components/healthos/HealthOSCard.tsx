import type { ReactNode } from "react";
import {
  Pressable,
  StyleSheet,
  Text,
  useColorScheme,
  View,
  type GestureResponderEvent,
  type StyleProp,
  type ViewStyle,
} from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";

import {
  getHealthOSPalette,
  getHealthOSSurfaces,
  healthOSMotion,
  healthOSOpacity,
  healthOSSpacing,
  healthOSTypography,
  type HealthOSColorMode,
  type HealthOSSurfaceName,
} from "@/theme/healthos";

export type HealthOSCardVariant =
  | "accordion"
  | "ai"
  | "compact"
  | "danger"
  | "darkHero"
  | "elevated"
  | "glass"
  | "list";

type HealthOSCardProps = {
  children?: ReactNode;
  disabled?: boolean;
  icon?: ReactNode;
  onLongPress?: (event: GestureResponderEvent) => void;
  onPress?: (event: GestureResponderEvent) => void;
  rightAccessory?: ReactNode;
  style?: StyleProp<ViewStyle>;
  subtitle?: string;
  testID?: string;
  title?: string;
  variant?: HealthOSCardVariant;
};

const variantSurface: Record<HealthOSCardVariant, HealthOSSurfaceName> = {
  accordion: "accordionSurface",
  ai: "aiSurface",
  compact: "compactCard",
  danger: "dangerSurface",
  darkHero: "darkHeroCard",
  elevated: "elevatedCard",
  glass: "glassPanel",
  list: "listRow",
};

export function HealthOSCard({
  children,
  disabled = false,
  icon,
  onLongPress,
  onPress,
  rightAccessory,
  style,
  subtitle,
  testID,
  title,
  variant = "elevated",
}: HealthOSCardProps) {
  const mode: HealthOSColorMode = useColorScheme() === "dark" ? "dark" : "light";
  const palette = getHealthOSPalette(mode);
  const surfaces = getHealthOSSurfaces(mode);
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const pressable = Boolean(onPress || onLongPress);
  const titleColor = variant === "darkHero" ? "#f8fafc" : palette.inkText;
  const subtitleColor = variant === "darkHero" ? "#cbd5e1" : palette.softText;

  return (
    <Pressable
      accessibilityRole={pressable ? "button" : undefined}
      accessibilityState={{ disabled }}
      disabled={disabled}
      onLongPress={onLongPress}
      onPress={onPress}
      onPressIn={() => {
        if (pressable && !disabled) {
          scale.value = withTiming(healthOSMotion.pressFeedback.scale, {
            duration: healthOSMotion.pressFeedback.duration,
            easing: healthOSMotion.pressFeedback.easing,
          });
        }
      }}
      onPressOut={() => {
        scale.value = withTiming(1, {
          duration: healthOSMotion.pressFeedback.duration,
          easing: healthOSMotion.pressFeedback.easing,
        });
      }}
      testID={testID}
    >
      <Animated.View
        style={[
          surfaces[variantSurface[variant]],
          disabled && { opacity: healthOSOpacity.disabled },
          animatedStyle,
          style,
        ]}
      >
        {title || subtitle || icon || rightAccessory ? (
          <View style={styles.header}>
            {icon ? <View style={styles.icon}>{icon}</View> : null}
            <View style={styles.headerText}>
              {title ? (
                <Text style={[healthOSTypography.cardTitle, { color: titleColor }]}>
                  {title}
                </Text>
              ) : null}
              {subtitle ? (
                <Text style={[healthOSTypography.bodySmall, { color: subtitleColor }]}>
                  {subtitle}
                </Text>
              ) : null}
            </View>
            {rightAccessory ? <View>{rightAccessory}</View> : null}
          </View>
        ) : null}
        {children ? <View style={title || subtitle ? styles.body : undefined}>{children}</View> : null}
      </Animated.View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  body: {
    marginTop: healthOSSpacing.md,
  },
  header: {
    alignItems: "center",
    flexDirection: "row",
    gap: healthOSSpacing.sm,
  },
  headerText: {
    flex: 1,
    gap: healthOSSpacing.xxs,
  },
  icon: {
    alignItems: "center",
    justifyContent: "center",
  },
});
