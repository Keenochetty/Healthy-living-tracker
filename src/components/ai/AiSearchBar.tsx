import { Pressable, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { AppIcon } from "@/components/ui";
import { spacing } from "@/theme/tokens";
import { useAppTheme } from "@/theme/ThemeProvider";

export function AiSearchBar({ onPress }: { onPress: () => void }) {
  const insets = useSafeAreaInsets();
  const { theme } = useAppTheme();

  return (
    <View
      pointerEvents="box-none"
      style={{
        bottom: insets.bottom + 92,
        left: 16,
        position: "absolute",
        right: 16,
        zIndex: 30,
      }}
    >
      <Pressable
        accessibilityLabel="Open HealthOS AI search"
        accessibilityRole="button"
        onPress={onPress}
        style={({ pressed }) => ({
          alignItems: "center",
          backgroundColor: theme.nav ?? theme.surface,
          borderColor: theme.border,
          borderRadius: 22,
          borderWidth: 1,
          elevation: 8,
          flexDirection: "row",
          gap: spacing.md,
          height: 50,
          opacity: pressed ? 0.86 : 1,
          paddingHorizontal: spacing.md,
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 12 },
          shadowOpacity: 0.2,
          shadowRadius: 24,
        })}
      >
        <View
          style={{
            alignItems: "center",
            backgroundColor: theme.primary,
            borderRadius: 12,
            height: 28,
            justifyContent: "center",
            width: 28,
          }}
        >
          <AppIcon color={theme.background} decorative name="ai" size={15} />
        </View>
        <Text
          numberOfLines={1}
          style={{
            color: theme.mutedText,
            flex: 1,
            fontSize: 12,
            fontWeight: "800",
          }}
        >
          Search your health or research online...
        </Text>
        <AppIcon color={theme.mutedText} decorative name="search" size={16} />
      </Pressable>
    </View>
  );
}
