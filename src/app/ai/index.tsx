import { Href, router } from "expo-router";
import { Menu, Settings, Sparkles } from "lucide-react-native";
import { useState } from "react";
import { Pressable, ScrollView, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { AiAssistantSheet } from "@/components/ai/AiAssistantSheet";
import { AppButton, AppCard, AppText } from "@/components/ui-native";
import { useAppTheme } from "@/theme/ThemeProvider";

export default function AiAssistantScreen() {
  const { theme } = useAppTheme();
  const [aiOpen, setAiOpen] = useState(true);

  return (
    <SafeAreaView className="flex-1 bg-background" edges={["top", "bottom"]}>
      <View className="flex-row items-center justify-between border-b border-border px-4 py-1">
        <IconButton
          label="Open HealthSync home"
          onPress={() => router.push("/(tabs)/today" as Href)}
        >
          <Menu color={theme.text} size={22} />
        </IconButton>
        <View className="items-center">
          <AppText variant="heading">AI Assistant</AppText>
          <AppText variant="caption">Integrated HealthSync chat</AppText>
        </View>
        <IconButton
          label="Open settings"
          onPress={() => router.push("/settings" as Href)}
        >
          <Settings color={theme.text} size={21} />
        </IconButton>
      </View>

      <ScrollView
        className="flex-1"
        contentContainerClassName="gap-4 px-5 pb-8 pt-3"
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <AppCard className="items-center gap-4" variant="elevated">
          <View
            style={{
              alignItems: "center",
              backgroundColor: theme.primarySoft,
              borderRadius: 999,
              height: 72,
              justifyContent: "center",
              width: 72,
            }}
          >
            <Sparkles color={theme.primary} size={32} />
          </View>
          <View className="gap-2">
            <AppText className="text-center" variant="title">
              HealthSync AI
            </AppText>
            <AppText className="text-center" variant="bodyMuted">
              Ask app questions, search with the secure backend, and import
              detected plans or records only after review.
            </AppText>
          </View>
          <AppButton fullWidth onPress={() => setAiOpen(true)}>
            Open AI chat
          </AppButton>
          <AppText className="text-center" variant="caption">
            The mobile app never stores an OpenAI API key. API calls run through
            the Supabase Edge Function.
          </AppText>
        </AppCard>

        <AppCard className="gap-3" variant="compact">
          <AppText variant="heading">What it can do</AppText>
          <AppText variant="bodyMuted">
            HealthSync AI can answer app questions, search through the secure
            backend, and detect when a response is importable.
          </AppText>
          <AppText variant="caption">
            Examples: workout plans, nutrition plans, recipes, medication
            reminder drafts, calendar events, documents, and health records.
          </AppText>
        </AppCard>

        <AppCard className="gap-3" variant="compact">
          <AppText variant="heading">Review before import</AppText>
          <AppText variant="bodyMuted">
            When AI detects a useful plan or record, the chat shows an import
            button below the response. Nothing is saved until you confirm.
          </AppText>
        </AppCard>
      </ScrollView>

      <AiAssistantSheet
        onClose={() => setAiOpen(false)}
        visible={aiOpen}
      />
    </SafeAreaView>
  );
}

export function ErrorBoundary({ error }: { error: Error }) {
  const { theme } = useAppTheme();

  return (
    <SafeAreaView className="flex-1 bg-background p-5" edges={["top", "bottom"]}>
      <AppCard className="gap-4">
        <AppText variant="heading">AI screen could not load</AppText>
        <AppText variant="caption">{error.message}</AppText>
        <AppButton onPress={() => router.replace("/(tabs)/today" as Href)}>
          Back to HealthSync
        </AppButton>
      </AppCard>
      <View
        pointerEvents="none"
        style={{
          backgroundColor: theme.primary,
          borderRadius: 999,
          height: 160,
          opacity: 0.08,
          position: "absolute",
          right: -60,
          top: -60,
          width: 160,
        }}
      />
    </SafeAreaView>
  );
}

function IconButton({
  children,
  label,
  onPress,
}: {
  children: React.ReactNode;
  label: string;
  onPress: () => void;
}) {
  return (
    <Pressable
      accessibilityLabel={label}
      accessibilityRole="button"
      className="h-11 w-11 items-center justify-center rounded-full"
      onPress={onPress}
    >
      {children}
    </Pressable>
  );
}
