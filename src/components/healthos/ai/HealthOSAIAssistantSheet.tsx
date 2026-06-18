import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  useColorScheme,
  View,
} from "react-native";
import { Maximize2, X } from "lucide-react-native";
import { router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { HealthOSAIImportReviewSheet } from "@/components/healthos/aiImport";
import {
  getHealthOSPalette,
  getHealthOSSurfaces,
  healthOSRadius,
  healthOSSpacing,
  healthOSTypography,
  healthOSZIndex,
  type HealthOSColorMode,
} from "@/theme/healthos";

import { HealthOSAIContextChips } from "./HealthOSAIContextChips";
import { HealthOSAIErrorState } from "./HealthOSAIErrorState";
import { HealthOSAIMessageList } from "./HealthOSAIMessageList";
import { HealthOSAIPromptComposer } from "./HealthOSAIPromptComposer";
import { HealthOSAIResultCard } from "./HealthOSAIResultCard";
import { HealthOSAISafetyNotice } from "./HealthOSAISafetyNotice";
import { HealthOSAISuggestionChips } from "./HealthOSAISuggestionChips";
import { useHealthOSAIChat } from "./useHealthOSAIChat";
import { useHealthOSAIContext } from "./useHealthOSAIContext";

type Props = {
  initialQuery?: string;
  onClose: () => void;
  routeContext?: string;
  visible: boolean;
};

export function HealthOSAIAssistantSheet({
  initialQuery,
  onClose,
  routeContext,
  visible,
}: Props) {
  const insets = useSafeAreaInsets();
  const mode: HealthOSColorMode = useColorScheme() === "dark" ? "dark" : "light";
  const palette = getHealthOSPalette(mode);
  const surfaces = getHealthOSSurfaces(mode);
  const aiContext = useHealthOSAIContext({ routeContext });
  const chat = useHealthOSAIChat(aiContext.context);

  function expand() {
    onClose();
    router.push("/ai");
  }

  return (
    <Modal animationType="fade" onRequestClose={onClose} transparent visible={visible}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={styles.overlay}
      >
        <Pressable style={styles.backdrop} onPress={onClose} />
        <View
          style={[
            styles.sheet,
            surfaces.glassMenu,
            { paddingBottom: insets.bottom + healthOSSpacing.md },
          ]}
        >
          <View style={styles.handle} />
          <View style={styles.header}>
            <View style={styles.titleWrap}>
              <Text style={[healthOSTypography.sectionTitle, { color: palette.inkText }]}>
                Ask HealthOS AI
              </Text>
              <Text style={[healthOSTypography.caption, { color: palette.softText }]}>
                Search, chat, and create review-only imports.
              </Text>
            </View>
            <Pressable accessibilityLabel="Open full AI page" accessibilityRole="button" onPress={expand} style={styles.iconButton}>
              <Maximize2 color={palette.inkText} size={18} />
            </Pressable>
            <Pressable accessibilityLabel="Close AI assistant" accessibilityRole="button" onPress={onClose} style={styles.iconButton}>
              <X color={palette.inkText} size={20} />
            </Pressable>
          </View>
          <ScrollView
            contentContainerStyle={styles.content}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
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
            <View style={styles.messageList}>
              <HealthOSAIMessageList
                isSending={chat.isSending}
                messages={chat.messages}
                onPrompt={(prompt) => void chat.sendMessage(prompt)}
              />
            </View>
            <HealthOSAISafetyNotice />
          </ScrollView>
          <HealthOSAIPromptComposer
            disabled={chat.isSending}
            onAttach={aiContext.requestAttachData}
            onChangeText={chat.setInput}
            onSubmit={() => void chat.sendMessage()}
            value={chat.input}
          />
        </View>
        <HealthOSAIImportReviewSheet
          envelope={chat.activeReviewEnvelope}
          onClose={() => chat.openReview(null)}
          visible={Boolean(chat.activeReviewEnvelope)}
        />
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    ...StyleSheet.absoluteFill,
    backgroundColor: "rgba(2, 6, 23, 0.38)",
  },
  content: {
    gap: healthOSSpacing.md,
    paddingBottom: healthOSSpacing.md,
  },
  handle: {
    alignSelf: "center",
    backgroundColor: "rgba(148, 163, 184, 0.55)",
    borderRadius: healthOSRadius.pill,
    height: 4,
    marginBottom: healthOSSpacing.md,
    width: 42,
  },
  header: {
    alignItems: "center",
    flexDirection: "row",
    gap: healthOSSpacing.sm,
    marginBottom: healthOSSpacing.md,
  },
  iconButton: {
    alignItems: "center",
    height: 40,
    justifyContent: "center",
    width: 40,
  },
  messageList: {
    minHeight: 220,
  },
  overlay: {
    flex: 1,
    justifyContent: "flex-end",
    zIndex: healthOSZIndex.sheet,
  },
  sheet: {
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
    borderRadius: healthOSRadius["2xl"],
    gap: healthOSSpacing.sm,
    maxHeight: "88%",
    padding: healthOSSpacing.lg,
  },
  titleWrap: {
    flex: 1,
    gap: healthOSSpacing.xxs,
  },
});
