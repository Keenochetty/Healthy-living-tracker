import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, View } from "react-native";
import { router } from "expo-router";

import { HealthOSAIImportReviewSheet } from "@/components/healthos/aiImport";
import { HealthOSAppShell } from "@/components/healthos/shell/HealthOSAppShell";
import {
  healthOSLayout,
  healthOSSafeArea,
  healthOSSpacing,
} from "@/theme/healthos";

import { HealthOSAIContextChips } from "./HealthOSAIContextChips";
import { HealthOSAIErrorState } from "./HealthOSAIErrorState";
import { HealthOSAIHeader } from "./HealthOSAIHeader";
import { HealthOSAIHistoryPanel } from "./HealthOSAIHistoryPanel";
import { HealthOSAIMessageList } from "./HealthOSAIMessageList";
import { HealthOSAIPromptComposer } from "./HealthOSAIPromptComposer";
import { HealthOSAIResultCard } from "./HealthOSAIResultCard";
import { HealthOSAISafetyNotice } from "./HealthOSAISafetyNotice";
import { HealthOSAISuggestionChips } from "./HealthOSAISuggestionChips";
import { useHealthOSAIChat } from "./useHealthOSAIChat";
import { useHealthOSAIContext } from "./useHealthOSAIContext";

export function HealthOSAIPage() {
  const aiContext = useHealthOSAIContext({ contextLabel: "AI Assistant", routeContext: "ai" });
  const chat = useHealthOSAIChat(aiContext.context);

  return (
    <HealthOSAppShell
      aiPlaceholder="Ask HealthOS AI"
      showAICommandBar={false}
      showBottomNav={false}
      showHeader={false}
      withBottomNavSpace={false}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={styles.keyboard}
      >
        <View style={styles.container}>
          <ScrollView
            contentContainerStyle={styles.content}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            <HealthOSAIHeader
              onHistoryPress={() => undefined}
              onSettingsPress={() => router.push("/settings")}
            />
            <HealthOSAIContextChips
              attachNotice={aiContext.attachNotice}
              contextLabel={aiContext.context.contextLabel}
              onAttachData={aiContext.requestAttachData}
            />
            <HealthOSAISuggestionChips
              onSelect={(prompt) => {
                chat.setInput(prompt);
                void chat.sendMessage(prompt);
              }}
            />
            {chat.error ? <HealthOSAIErrorState message={chat.error} /> : null}
            {chat.resultCards.map((card) => (
              <HealthOSAIResultCard key={card.id} card={card} onReview={chat.openReview} />
            ))}
            <View style={styles.messages}>
              <HealthOSAIMessageList
                isSending={chat.isSending}
                messages={chat.messages}
                onPrompt={(prompt) => void chat.sendMessage(prompt)}
              />
            </View>
            <HealthOSAIHistoryPanel conversations={chat.conversations} />
            <HealthOSAISafetyNotice />
          </ScrollView>
          <View style={styles.composer}>
            <HealthOSAIPromptComposer
              disabled={chat.isSending}
              onAttach={aiContext.requestAttachData}
              onChangeText={chat.setInput}
              onSubmit={() => void chat.sendMessage()}
              value={chat.input}
            />
          </View>
        </View>
        <HealthOSAIImportReviewSheet
          envelope={chat.activeReviewEnvelope}
          onClose={() => chat.openReview(null)}
          visible={Boolean(chat.activeReviewEnvelope)}
        />
      </KeyboardAvoidingView>
    </HealthOSAppShell>
  );
}

const styles = StyleSheet.create({
  composer: {
    paddingBottom: healthOSSafeArea.screenBottom,
    paddingHorizontal: healthOSSafeArea.screenHorizontal,
    paddingTop: healthOSSpacing.sm,
  },
  container: {
    alignSelf: "center",
    flex: 1,
    maxWidth: healthOSLayout.screenMaxWidth,
    width: "100%",
  },
  content: {
    gap: healthOSSpacing.lg,
    paddingBottom: healthOSSpacing.lg,
    paddingHorizontal: healthOSSafeArea.screenHorizontal,
    paddingTop: healthOSSafeArea.screenTop,
  },
  keyboard: {
    flex: 1,
  },
  messages: {
    minHeight: 320,
  },
});
