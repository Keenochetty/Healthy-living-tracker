import {
  Bot,
  Camera,
  ChevronDown,
  History,
  Mic,
  Search,
  X,
} from "lucide-react-native";
import { useEffect, useState } from "react";
import { Keyboard, Pressable, Text, TextInput, View } from "react-native";

import { AppIconButton } from "@/components/ui";
import { radius, spacing } from "@/theme/tokens";
import { useAppTheme } from "@/theme/ThemeProvider";

type AiFloatingQuickBarProps = {
  onScanPress?: () => void;
};

export function AiFloatingQuickBar({ onScanPress }: AiFloatingQuickBarProps) {
  const { theme } = useAppTheme();
  const [open, setOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [keyboardHeight, setKeyboardHeight] = useState(0);

  useEffect(() => {
    const show = Keyboard.addListener("keyboardDidShow", (event) => {
      setKeyboardHeight(event.endCoordinates.height);
    });
    const hide = Keyboard.addListener("keyboardDidHide", () =>
      setKeyboardHeight(0),
    );

    return () => {
      show.remove();
      hide.remove();
    };
  }, []);

  return (
    <View
      pointerEvents="box-none"
      style={{
        bottom: keyboardHeight + 104,
        position: "absolute",
        right: spacing.xl,
        zIndex: 20,
      }}
    >
      {message ? (
        <View
          style={{
            alignSelf: "flex-end",
            backgroundColor: theme.surface,
            borderRadius: radius.lg,
            marginBottom: spacing.sm,
            maxWidth: 260,
            padding: spacing.md,
          }}
        >
          <Text style={{ color: theme.text, fontWeight: "800" }}>
            {message}
          </Text>
        </View>
      ) : null}

      {open ? (
        <View
          style={{
            alignItems: "center",
            backgroundColor: theme.nav ?? theme.surface,
            borderColor: theme.border,
            borderRadius: radius.full,
            borderWidth: 1,
            elevation: 10,
            flexDirection: "row",
            gap: spacing.sm,
            padding: spacing.sm,
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 8 },
            shadowOpacity: 0.24,
            shadowRadius: 18,
          }}
        >
          {searchOpen ? (
            <TextInput
              autoFocus
              placeholder="Ask or search..."
              placeholderTextColor={theme.mutedText}
              style={{
                color: theme.text,
                minWidth: 150,
                paddingHorizontal: spacing.sm,
              }}
            />
          ) : null}
          <AppIconButton
            icon={<Search size={18} />}
            onPress={() => setSearchOpen((value) => !value)}
            size="sm"
            variant="ghost"
          />
          <AppIconButton
            icon={<Mic size={18} />}
            onPress={() => setMessage("Voice assistant coming soon")}
            size="sm"
            variant="ghost"
          />
          <AppIconButton
            icon={<Camera size={18} />}
            onPress={onScanPress ?? (() => setMessage("AI scan placeholder"))}
            size="sm"
            variant="ghost"
          />
          <AppIconButton
            icon={<History size={18} />}
            onPress={() => setMessage("Recent AI activity will appear here")}
            size="sm"
            variant="ghost"
          />
          <AppIconButton
            icon={<X size={18} />}
            onPress={() => setOpen(false)}
            size="sm"
            variant="ghost"
          />
        </View>
      ) : (
        <Pressable
          onPress={() => {
            setMessage(null);
            setOpen(true);
          }}
          style={({ pressed }) => ({
            alignItems: "center",
            backgroundColor: theme.primary,
            borderRadius: radius.full,
            elevation: 10,
            height: 58,
            justifyContent: "center",
            opacity: pressed ? 0.84 : 1,
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 8 },
            shadowOpacity: 0.22,
            shadowRadius: 18,
            width: 58,
          })}
        >
          <Bot color="#171b22" size={24} strokeWidth={2.3} />
        </Pressable>
      )}
    </View>
  );
}
