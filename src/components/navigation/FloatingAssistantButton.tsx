import { Href, router } from "expo-router";
import { Pressable, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { AppIcon } from "@/components/ui";
import { PrivacyBadge } from "@/components/privacy";
import { lightImpact } from "@/lib/haptics";
import { appRadius, zLayers } from "@/theme/designSystem";

type FloatingAssistantButtonProps = {
  hiddenOnFocusedForm?: boolean;
  minimized?: boolean;
  sensitiveProfile?: boolean;
  visible?: boolean;
};

export function FloatingAssistantButton({
  hiddenOnFocusedForm = false,
  minimized = false,
  sensitiveProfile = false,
  visible = true
}: FloatingAssistantButtonProps) {
  const insets = useSafeAreaInsets();

  if (!visible || hiddenOnFocusedForm) {
    return null;
  }

  return (
    <Pressable
      accessibilityLabel="Open health assistant"
      accessibilityRole="button"
      onPress={() => {
        lightImpact();
        router.push({ pathname: "/ai", params: { mode: "quick_logger" } } as unknown as Href);
      }}
      style={({ pressed }) => ({
        alignItems: "center",
        backgroundColor: "rgba(139, 92, 246, 0.92)",
        borderColor: "rgba(255, 255, 255, 0.24)",
        borderWidth: 1,
        borderRadius: appRadius.pill,
        bottom: insets.bottom + 106,
        height: minimized ? 48 : 56,
        justifyContent: "center",
        position: "absolute",
        right: 24,
        transform: [{ scale: pressed ? 0.96 : 1 }],
        width: minimized ? 48 : 56,
        zIndex: zLayers.floatingAction,
        shadowColor: "#8b5cf6",
        shadowOffset: { height: 12, width: 0 },
        shadowOpacity: 0.36,
        shadowRadius: 22,
        elevation: 12
      })}
    >
      <AppIcon color="#ffffff" name="ai_assistant" size={24} />
      {sensitiveProfile ? (
        <View style={{ position: "absolute", right: -10, top: -12 }}>
          <PrivacyBadge label="Private" type="private" />
        </View>
      ) : null}
    </Pressable>
  );
}
