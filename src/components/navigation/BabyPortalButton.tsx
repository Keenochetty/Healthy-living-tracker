import { Href, router } from "expo-router";
import { useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import Animated, {
  useAnimatedStyle,
  withSpring,
} from "react-native-reanimated";

import { AppIcon } from "@/components/ui";
import { lightImpact } from "@/lib/haptics";
import { appMotion, zLayers } from "@/theme/designSystem";

type BabyPortalButtonProps = {
  active?: boolean;
  hasDueReminder?: boolean;
  multipleProfiles?: boolean;
  visible: boolean;
};

export function BabyPortalButton({
  active = false,
  hasDueReminder = false,
  multipleProfiles = false,
  visible,
}: BabyPortalButtonProps) {
  const [isPressed, setIsPressed] = useState(false);

  const buttonStyle = useAnimatedStyle(() => ({
    transform: [{ scale: withSpring(isPressed ? 0.95 : 1, appMotion.spring) }],
  }));

  if (!visible) {
    return null;
  }

  return (
    <Pressable
      accessibilityHint={[
        hasDueReminder ? "Baby care tasks are due." : undefined,
        multipleProfiles ? "Long press to choose a child profile." : undefined,
      ]
        .filter(Boolean)
        .join(" ")}
      accessibilityLabel="Open Baby / Child"
      accessibilityRole="button"
      hitSlop={10}
      onLongPress={() => {
        if (multipleProfiles) {
          lightImpact();
          router.push({
            pathname: "/baby-child",
            params: { tab: "settings" },
          } as unknown as Href);
        }
      }}
      onPress={() => {
        lightImpact();
        router.push("/baby-child" as Href);
      }}
      onPressIn={() => {
        setIsPressed(true);
      }}
      onPressOut={() => {
        setIsPressed(false);
      }}
    >
      <Animated.View
        style={[
          styles.babyButton,
          active ? styles.babyButtonActive : styles.babyButtonInactive,
          buttonStyle,
        ]}
      >
        <AppIcon
          color={active ? "#087866" : "rgba(196, 255, 236, 0.92)"}
          decorative
          name="baby_child"
          size={28}
          strokeWidth={2.4}
        />
        {hasDueReminder ? (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>1</Text>
          </View>
        ) : null}
      </Animated.View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  babyButton: {
    alignItems: "center",
    borderRadius: 29,
    height: 58,
    justifyContent: "center",
    width: 58,
    zIndex: zLayers.floatingAction,
  },
  babyButtonActive: {
    backgroundColor: "rgba(196, 255, 236, 0.96)",
    borderColor: "rgba(255,255,255,0.55)",
    borderWidth: 1,
    elevation: 8,
    shadowColor: "#7cffd9",
    shadowOffset: { height: 8, width: 0 },
    shadowOpacity: 0.24,
    shadowRadius: 14,
  },
  babyButtonInactive: {
    backgroundColor: "transparent",
    borderWidth: 0,
    elevation: 0,
    shadowOpacity: 0,
  },
  badge: {
    alignItems: "center",
    backgroundColor: "#ff6f7d",
    borderColor: "#10201d",
    borderRadius: 999,
    borderWidth: 2,
    height: 20,
    justifyContent: "center",
    minWidth: 20,
    position: "absolute",
    right: -2,
    top: -2,
  },
  badgeText: {
    color: "#ffffff",
    fontSize: 11,
    fontWeight: "900",
    lineHeight: 14,
  },
});
