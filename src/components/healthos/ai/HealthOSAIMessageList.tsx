import { ScrollView, StyleSheet, View } from "react-native";

import { healthOSSpacing } from "@/theme/healthos";

import type { HealthOSAIMessage } from "./HealthOSAITypes";
import { HealthOSAIEmptyState } from "./HealthOSAIEmptyState";
import { HealthOSAILoadingIndicator } from "./HealthOSAILoadingIndicator";
import { HealthOSAIMessageBubble } from "./HealthOSAIMessageBubble";

type Props = {
  isSending?: boolean;
  messages: HealthOSAIMessage[];
  onPrompt: (prompt: string) => void;
};

export function HealthOSAIMessageList({ isSending = false, messages, onPrompt }: Props) {
  return (
    <ScrollView
      contentContainerStyle={styles.content}
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
    >
      {messages.length ? (
        messages.map((message) => <HealthOSAIMessageBubble key={message.id} message={message} />)
      ) : (
        <HealthOSAIEmptyState onPrompt={onPrompt} />
      )}
      {isSending ? <HealthOSAILoadingIndicator /> : null}
      <View style={styles.tail} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: {
    gap: healthOSSpacing.md,
    paddingBottom: healthOSSpacing.xl,
  },
  tail: {
    height: healthOSSpacing.sm,
  },
});
