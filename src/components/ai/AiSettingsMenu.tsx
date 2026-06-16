import { Menu } from "heroui-native";
import {
  Database,
  History,
  Info,
  RotateCcw,
  Settings,
  Shield,
  SlidersHorizontal,
} from "lucide-react-native";
import { Pressable, ScrollView, View } from "react-native";

import { useAppTheme } from "@/theme/ThemeProvider";

type AiSettingsMenuProps = {
  onBackendInfo: () => void;
  onClearDraft: () => void;
  onHistory: () => void;
  onImportSettings: () => void;
  onPrivacyNote: () => void;
};

export function AiSettingsMenu({
  onBackendInfo,
  onClearDraft,
  onHistory,
  onImportSettings,
  onPrivacyNote,
}: AiSettingsMenuProps) {
  const { theme } = useAppTheme();

  return (
    <Menu>
      <Menu.Trigger asChild>
        <Pressable
          accessibilityLabel="Open HealthSync AI settings"
          accessibilityRole="button"
          style={({ pressed }) => ({
            alignItems: "center",
            backgroundColor: theme.surface,
            borderColor: theme.border,
            borderRadius: 999,
            borderWidth: 1,
            height: 34,
            justifyContent: "center",
            opacity: pressed ? 0.72 : 1,
            width: 34,
          })}
        >
          <Settings color={theme.text} size={16} />
        </Pressable>
      </Menu.Trigger>
      <Menu.Portal>
        <Menu.Overlay />
        <Menu.Content
          align="end"
          className="rounded-3xl border border-border bg-surface p-2"
          placement="bottom"
          presentation="popover"
          width={300}
        >
          <ScrollView
            contentContainerStyle={{ gap: 4, paddingBottom: 4 }}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
            style={{ maxHeight: 360 }}
          >
            <View className="px-3 pb-2 pt-1">
              <Menu.Label>AI settings</Menu.Label>
            </View>
            <Menu.Item onPress={onBackendInfo}>
              <Info color={theme.primary} size={17} />
              <View className="flex-1">
                <Menu.ItemTitle>AI backend info</Menu.ItemTitle>
                <Menu.ItemDescription>
                  Secure Supabase function, no client API key.
                </Menu.ItemDescription>
              </View>
            </Menu.Item>
            <Menu.Item onPress={onHistory}>
              <History color={theme.primary} size={17} />
              <View className="flex-1">
                <Menu.ItemTitle>Chat history</Menu.ItemTitle>
                <Menu.ItemDescription>
                  Open recent HealthSync AI conversations.
                </Menu.ItemDescription>
              </View>
            </Menu.Item>
            <Menu.Item onPress={onPrivacyNote}>
              <Shield color={theme.primary} size={17} />
              <View className="flex-1">
                <Menu.ItemTitle>Privacy note</Menu.ItemTitle>
                <Menu.ItemDescription>
                  Review what is sent to the backend.
                </Menu.ItemDescription>
              </View>
            </Menu.Item>
            <Menu.Item onPress={onImportSettings}>
              <SlidersHorizontal color={theme.primary} size={17} />
              <View className="flex-1">
                <Menu.ItemTitle>Import settings</Menu.ItemTitle>
                <Menu.ItemDescription>
                  Imports stay as reviewed drafts.
                </Menu.ItemDescription>
              </View>
            </Menu.Item>
            <Menu.Item onPress={onImportSettings}>
              <Database color={theme.primary} size={17} />
              <View className="flex-1">
                <Menu.ItemTitle>Data used by AI</Menu.ItemTitle>
                <Menu.ItemDescription>
                  Only chat context and user-entered prompts.
                </Menu.ItemDescription>
              </View>
            </Menu.Item>
            <Menu.Item onPress={onClearDraft}>
              <RotateCcw color={theme.danger} size={17} />
              <View className="flex-1">
                <Menu.ItemTitle>New chat</Menu.ItemTitle>
                <Menu.ItemDescription>
                  Clears this draft and starts fresh.
                </Menu.ItemDescription>
              </View>
            </Menu.Item>
          </ScrollView>
        </Menu.Content>
      </Menu.Portal>
    </Menu>
  );
}
