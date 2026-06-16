import { Href, router } from "expo-router";
import { Mic, ScanLine } from "lucide-react-native";
import { Pressable, StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { AppIcon } from "@/components/ui";
import { AppIconButton, AppText } from "@/components/ui-native";
import { useAppTheme } from "@/theme/ThemeProvider";

export function AiSearchBar({ onPress }: { onPress?: () => void }) {
  const insets = useSafeAreaInsets();
  const { theme } = useAppTheme();

  function openAssistant() {
    if (onPress) {
      onPress();
      return;
    }
    router.push("/ai" as Href);
  }

  return (
    <View
      pointerEvents="box-none"
      style={[styles.overlay, { bottom: insets.bottom + 92 }]}
    >
      <Pressable
        accessibilityHint="Opens the full HealthSync AI page"
        accessibilityLabel="Ask HealthSync"
        accessibilityRole="button"
        onPress={openAssistant}
        style={({ pressed }) => [
          styles.bar,
          {
            backgroundColor: theme.surface,
            borderColor: theme.border,
            opacity: pressed ? 0.88 : 1,
            shadowColor: theme.background,
          },
        ]}
      >
        <View
          style={[
            styles.logo,
            {
              backgroundColor: theme.text,
              borderColor: theme.border,
            },
          ]}
        >
          <AppIcon backgroundColor={theme.text} decorative name="ai" size={20} />
        </View>
        <AppText className="flex-1" numberOfLines={1} variant="bodyMuted">
          Ask HealthSync
        </AppText>
        <View pointerEvents="none" style={styles.actions}>
          <AppIconButton
            accessibilityLabel="Voice input placeholder"
            icon={<Mic color={theme.mutedText} size={17} />}
            size="sm"
            variant="ghost"
          />
          <AppIconButton
            accessibilityLabel="Scan or import placeholder"
            icon={<ScanLine color={theme.mutedText} size={17} />}
            size="sm"
            variant="ghost"
          />
        </View>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  actions: {
    alignItems: "center",
    flexDirection: "row",
  },
  bar: {
    alignItems: "center",
    borderRadius: 999,
    borderWidth: 1,
    elevation: 10,
    flexDirection: "row",
    gap: 10,
    minHeight: 58,
    paddingHorizontal: 10,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.18,
    shadowRadius: 24,
    width: "100%",
  },
  logo: {
    alignItems: "center",
    borderRadius: 999,
    borderWidth: 1,
    height: 38,
    justifyContent: "center",
    width: 38,
  },
  overlay: {
    alignSelf: "center",
    left: 16,
    maxWidth: 430,
    position: "absolute",
    right: 16,
    zIndex: 45,
  },
});
