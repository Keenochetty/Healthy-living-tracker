import { SearchField } from "heroui-native";
import { Sparkles } from "lucide-react-native";
import { useEffect, useRef } from "react";
import { Animated, Pressable, StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useAppChrome } from "@/context/AppChromeContext";
import { useAppTheme } from "@/theme/ThemeProvider";

type AiSearchBarProps = {
  onPress: () => void;
};

export function AiSearchBar({ onPress }: AiSearchBarProps) {
  const insets = useSafeAreaInsets();
  const { aiSearchVisible } = useAppChrome();
  const { theme } = useAppTheme();
  const progress = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.timing(progress, {
      duration: 180,
      toValue: aiSearchVisible ? 1 : 0,
      useNativeDriver: true,
    }).start();
  }, [aiSearchVisible, progress]);

  const translateY = progress.interpolate({
    inputRange: [0, 1],
    outputRange: [18, 0],
  });
  const scale = progress.interpolate({
    inputRange: [0, 1],
    outputRange: [0.98, 1],
  });

  return (
    <Animated.View
      pointerEvents={aiSearchVisible ? "box-none" : "none"}
      style={[
        styles.overlay,
        {
          bottom: insets.bottom + 96,
          opacity: progress,
          transform: [{ translateY }, { scale }],
        },
      ]}
    >
      <Pressable
        accessibilityHint="Opens the HealthSync AI assistant panel"
        accessibilityLabel="Open HealthSync AI"
        accessibilityRole="button"
        onPress={onPress}
        style={({ pressed }) => [
          styles.pressable,
          {
            opacity: pressed ? 0.9 : 1,
            shadowColor: theme.text,
          },
        ]}
      >
        <View pointerEvents="none">
          <SearchField value="" onChange={() => undefined}>
            <SearchField.Group
              className="h-[42px] min-h-[42px] rounded-full border px-3"
              style={{
                backgroundColor: theme.surface,
                borderColor: theme.border,
              }}
            >
              <SearchField.SearchIcon>
                <Sparkles color={theme.primary} size={17} strokeWidth={2} />
              </SearchField.SearchIcon>
              <SearchField.Input
                accessibilityElementsHidden
                editable={false}
                placeholder="Ask HealthSync"
                placeholderTextColor={theme.mutedText}
                showSoftInputOnFocus={false}
                className="h-[42px] min-h-[42px] bg-transparent text-sm"
                style={{ color: theme.text }}
              />
            </SearchField.Group>
          </SearchField>
        </View>
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    alignSelf: "center",
    left: 16,
    maxWidth: 430,
    position: "absolute",
    right: 16,
    zIndex: 45,
  },
  pressable: {
    borderRadius: 999,
    elevation: 5,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.08,
    shadowRadius: 18,
    width: "100%",
  },
});
