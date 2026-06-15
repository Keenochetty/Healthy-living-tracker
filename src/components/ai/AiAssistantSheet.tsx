import { Href, router } from "expo-router";
import { useState } from "react";
import { Modal, Pressable, Text, TextInput, View } from "react-native";

import { AppChip, AppIcon } from "@/components/ui";
import type { AppIconName } from "@/constants/appIcons";
import { spacing } from "@/theme/tokens";
import { useAppTheme } from "@/theme/ThemeProvider";

type AiAssistantSheetProps = {
  onClose: () => void;
  visible: boolean;
};

type AssistantAction = {
  icon: AppIconName;
  label: string;
  route?: Href;
};

const actions: AssistantAction[] = [
  { icon: "health", label: "Search my health", route: "/health" as Href },
  { icon: "records", label: "Search records", route: "/records" as Href },
  { icon: "ai", label: "Research online" },
  { icon: "food", label: "Scan food", route: "/(tabs)/scan" as Href },
  { icon: "medication", label: "Check medication", route: "/medication" as Href },
  { icon: "fitness", label: "Plan workout", route: "/fitness" as Href },
  { icon: "calendar", label: "Add calendar item", route: "/calendar" as Href },
  { icon: "caregiver", label: "Family update", route: "/circle" as Href },
];

export function AiAssistantSheet({
  onClose,
  visible,
}: AiAssistantSheetProps) {
  const { theme } = useAppTheme();
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<string | null>(null);

  function openAction(action: AssistantAction) {
    if (action.route) {
      onClose();
      router.push(action.route);
      return;
    }
    setStatus(`${action.label} will be connected in a later phase.`);
  }

  return (
    <Modal
      animationType="slide"
      onRequestClose={onClose}
      transparent
      visible={visible}
    >
      <View
        style={{
          backgroundColor: "rgba(0,0,0,0.48)",
          flex: 1,
          justifyContent: "flex-end",
        }}
      >
        <Pressable
          accessibilityLabel="Close AI assistant"
          accessibilityRole="button"
          onPress={onClose}
          style={{ bottom: 0, left: 0, position: "absolute", right: 0, top: 0 }}
        />
        <View
          style={{
            backgroundColor: theme.surface,
            borderColor: theme.border,
            borderTopLeftRadius: 32,
            borderTopRightRadius: 32,
            borderWidth: 1,
            gap: spacing.lg,
            maxHeight: "84%",
            padding: spacing.xl,
          }}
        >
          <View
            style={{
              alignSelf: "center",
              backgroundColor: theme.border,
              borderRadius: 999,
              height: 4,
              width: 42,
            }}
          />
          <View>
            <Text
              style={{
                color: theme.mutedText,
                fontSize: 10,
                fontWeight: "900",
                letterSpacing: 0.9,
                textTransform: "uppercase",
              }}
            >
              HealthOS AI
            </Text>
            <Text style={{ color: theme.text, fontSize: 24, fontWeight: "900" }}>
              Ask anything
            </Text>
          </View>
          <View
            style={{
              alignItems: "center",
              backgroundColor: theme.background,
              borderColor: theme.border,
              borderRadius: 18,
              borderWidth: 1,
              flexDirection: "row",
              gap: spacing.sm,
              paddingHorizontal: spacing.md,
            }}
          >
            <AppIcon color={theme.primary} decorative name="ai" size={18} />
            <TextInput
              onChangeText={setQuery}
              onSubmitEditing={() =>
                query.trim() && setStatus(`Search preview: "${query.trim()}"`)
              }
              placeholder="Search meals, records, meds, workouts..."
              placeholderTextColor={theme.mutedText}
              returnKeyType="search"
              style={{
                color: theme.text,
                flex: 1,
                minHeight: 48,
                paddingVertical: spacing.md,
              }}
              value={query}
            />
          </View>
          <View style={{ flexDirection: "row", flexWrap: "wrap", gap: spacing.sm }}>
            {actions.map((action) => (
              <AppChip
                key={action.label}
                label={action.label}
                onPress={() => openAction(action)}
              />
            ))}
          </View>
          {status ? (
            <Text style={{ color: theme.mutedText, fontSize: 12 }}>{status}</Text>
          ) : null}
        </View>
      </View>
    </Modal>
  );
}
