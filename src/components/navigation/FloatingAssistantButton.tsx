import { Href, router } from "expo-router";
import { Pressable, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { AppIcon } from "@/components/ui";
import { PrivacyBadge } from "@/components/privacy";
import { lightImpact } from "@/lib/haptics";
import { appRadius, zLayers } from "@/theme/designSystem";
import { useAppTheme } from "@/theme/ThemeProvider";

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
  visible = true,
}: FloatingAssistantButtonProps) {
  const insets = useSafeAreaInsets();
  const { theme } = useAppTheme();

  if (!visible || hiddenOnFocusedForm) {
    return null;
  }

  return (
    <Pressable
      accessibilityLabel="Open health assistant"
      accessibilityRole="button"
      onPress={() => {
        lightImpact();
        router.push({
          pathname: "/ai",
          params: { mode: "quick_logger" },
        } as unknown as Href);
      }}
      style={({ pressed }) => ({
        alignItems: "center",
        backgroundColor: theme.primary,
        borderColor: theme.border,
        borderWidth: 1,
        borderRadius: appRadius.pill,
        bottom: insets.bottom + 106,
        height: minimized ? 48 : 56,
        justifyContent: "center",
        position: "absolute",
        right: 16,
        transform: [{ scale: pressed ? 0.96 : 1 }],
        width: minimized ? 48 : 56,
        zIndex: zLayers.floatingAction,
        shadowColor: theme.primary,
        shadowOffset: { height: 12, width: 0 },
        shadowOpacity: 0.36,
        shadowRadius: 22,
        elevation: 12,
      })}
    >
      <AppIcon
        color={
          isDarkBackground(theme.background) ? theme.background : "#ffffff"
        }
        name="ai_assistant"
        size={24}
      />
      {sensitiveProfile ? (
        <View style={{ position: "absolute", right: -10, top: -12 }}>
          <PrivacyBadge label="Private" type="private" />
        </View>
      ) : null}
    </Pressable>
  );
}

function isDarkBackground(color: string) {
  return (
    color.startsWith("#0") || color.startsWith("#1") || color.includes("rgba(")
  );
}
