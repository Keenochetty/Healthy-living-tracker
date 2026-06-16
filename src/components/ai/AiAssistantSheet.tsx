import { BottomSheet } from "heroui-native";
import { Bot, ExternalLink, MessageSquarePlus, SendHorizontal, X } from "lucide-react-native";
import { Href, router } from "expo-router";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Pressable, View } from "react-native";
import {
  BottomSheetScrollView,
  type BottomSheetScrollViewMethods,
} from "@gorhom/bottom-sheet";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { AiSettingsMenu } from "@/components/ai/AiSettingsMenu";
import {
  AppBadge,
  AppButton,
  AppCard,
  AppInput,
  AppText,
} from "@/components/ui-native";
import { useAuth } from "@/context/AuthContext";
import { askAIWithSources, type AiChatSource } from "@/lib/aiBackend";
import { importAppAIData, SUPPORTED_APP_AI_IMPORT_TARGETS } from "@/lib/appAIImport";
import {
  createAppAIChat,
  getAppAIChats,
  getAppAIMessages,
  logAppAIImport,
  saveAppAIMessage,
} from "@/lib/appAIStorage";
import {
  findAssistantFeature,
  type AssistantFeatureMatch,
} from "@/lib/assistantFeatureRouter";
import { useAppTheme } from "@/theme/ThemeProvider";
import type {
  AppAIChat,
  AppAIImportPayload,
  AppAIImportTarget,
} from "@/types/appAI";

type AiAssistantSheetProps = {
  initialPrompt?: string;
  onClose: () => void;
  visible: boolean;
};

type ChatMessage = {
  feature?: AssistantFeatureMatch;
  id: string;
  importPayload?: AppAIImportPayload | null;
  remoteId?: string;
  role: "assistant" | "user";
  sources?: AiChatSource[];
  text: string;
};

const SUGGESTIONS = [
  "Create a 4 day beginner workout plan.",
  "Build a high protein meal plan for this week.",
  "Turn these lab notes into a health record draft.",
  "Make a medication reminder draft from these instructions.",
] as const;

export function AiAssistantSheet({
  initialPrompt,
  onClose,
  visible,
}: AiAssistantSheetProps) {
  const insets = useSafeAreaInsets();
  const { theme } = useAppTheme();
  const { user } = useAuth();
  const scrollRef = useRef<BottomSheetScrollViewMethods>(null);
  const snapPoints = useMemo(() => ["88%", "96%"], []);
  const [chatId, setChatId] = useState<string | null>(null);
  const [chats, setChats] = useState<AppAIChat[]>([]);
  const [input, setInput] = useState(initialPrompt ?? "");
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [notice, setNotice] = useState<string | null>(null);

  const refreshChats = useCallback(async () => {
    if (!user) {
      setChats([]);
      return;
    }

    try {
      setChats(await getAppAIChats());
    } catch (error) {
      setNotice(
        error instanceof Error ? error.message : "Could not load chat history.",
      );
    }
  }, [user]);

  useEffect(() => {
    if (!visible) return;
    refreshChats();
  }, [refreshChats, visible]);

  useEffect(() => {
    if (visible && initialPrompt) setInput(initialPrompt);
  }, [initialPrompt, visible]);

  useEffect(() => {
    if (!visible) return;
    scrollRef.current?.scrollToEnd?.({ animated: true });
  }, [messages.length, visible]);

  function startNewChat() {
    setChatId(null);
    setInput("");
    setMessages([]);
    setNotice("Started a new HealthSync AI chat.");
  }

  async function ensureChat(title: string) {
    if (chatId) return chatId;
    if (!user) throw new Error("Sign in to use HealthSync AI chat history.");

    const chat = await createAppAIChat(user.id, title);
    setChatId(chat.id);
    setChats((current) => [chat, ...current]);
    return chat.id;
  }

  async function openChat(chat: AppAIChat) {
    setLoading(true);
    try {
      const rows = await getAppAIMessages(chat.id);
      setChatId(chat.id);
      setMessages(
        rows.map((row) => ({
          id: String(row.id),
          importPayload: row.import_payload as AppAIImportPayload | null,
          remoteId: String(row.id),
          role: row.role === "user" ? "user" : "assistant",
          sources: (row.sources ?? []) as AiChatSource[],
          text: String(row.content),
        })),
      );
      setNotice(`Opened ${chat.title}`);
    } catch (error) {
      setNotice(error instanceof Error ? error.message : "Could not open chat.");
    } finally {
      setLoading(false);
    }
  }

  async function submit(nextInput = input) {
    const text = nextInput.trim();
    if (!text || loading) return;

    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      role: "user",
      text,
    };

    setMessages((current) => [...current, userMessage]);
    setInput("");
    setLoading(true);
    setNotice(null);

    try {
      const activeChatId = await ensureChat(text);
      await saveAppAIMessage({
        chatId: activeChatId,
        content: text,
        role: "user",
        userId: user!.id,
      });

      const feature = findAssistantFeature(text);
      if (feature) {
        const assistantMessage: ChatMessage = {
          feature,
          id: `feature-${Date.now()}`,
          role: "assistant",
          text: `This looks like an app task. ${feature.description}`,
        };
        assistantMessage.remoteId = await saveAppAIMessage({
          chatId: activeChatId,
          content: assistantMessage.text,
          role: "assistant",
          userId: user!.id,
        });
        setMessages((current) => [...current, assistantMessage]);
        await refreshChats();
        return;
      }

      const context = messages.slice(-8).map((message) => ({
        role: message.role,
        text: message.text,
      }));
      const response = await askAIWithSources(text, { messages: context });
      const assistantMessage: ChatMessage = {
        id: `assistant-${Date.now()}`,
        importPayload: response.importPayload,
        role: "assistant",
        sources: response.sources,
        text: response.reply,
      };
      assistantMessage.remoteId = await saveAppAIMessage({
        chatId: activeChatId,
        content: response.reply,
        importPayload: response.importPayload ?? undefined,
        role: "assistant",
        sources: response.sources,
        userId: user!.id,
      });
      setMessages((current) => [...current, assistantMessage]);
      await refreshChats();
    } catch (error) {
      setNotice(error instanceof Error ? error.message : "AI chat failed.");
    } finally {
      setLoading(false);
    }
  }

  async function importPayload(
    message: ChatMessage,
    target: AppAIImportTarget,
  ) {
    if (!message.importPayload || !user) return;

    setLoading(true);
    setNotice(null);
    try {
      if (SUPPORTED_APP_AI_IMPORT_TARGETS.includes(target)) {
        await importAppAIData(message.importPayload, target);
      }

      await logAppAIImport({
        chatId: chatId ?? undefined,
        messageId: message.remoteId,
        payload: message.importPayload,
        target,
        userId: user.id,
      });

      const route = routeForTarget(target);
      setNotice(`Imported ${labelTarget(target)} draft. Review it in the target section.`);
      onClose();
      router.push(route as Href);
    } catch (error) {
      setNotice(error instanceof Error ? error.message : "Import failed.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <BottomSheet
      isOpen={visible}
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
    >
      <BottomSheet.Portal>
        <BottomSheet.Overlay />
        <BottomSheet.Content
          backgroundClassName="rounded-[32px]"
          bottomInset={insets.bottom + 12}
          className="mx-4"
          contentContainerProps={{
            style: {
              flex: 1,
              minHeight: 0,
              overflow: "hidden",
            },
          }}
          detached
          enableDynamicSizing={false}
          enableContentPanningGesture={false}
          keyboardBehavior="extend"
          snapPoints={snapPoints}
        >
          <View
            style={{
              borderBottomColor: theme.border,
              borderBottomWidth: 1,
              gap: 4,
              paddingBottom: 6,
              paddingHorizontal: 14,
              paddingTop: 2,
            }}
          >
            <View className="gap-0.5">
              <View className="flex-row items-start gap-2">
                <View className="min-w-0 flex-1 pr-1">
                  <View className="flex-row flex-wrap items-center gap-2">
                    <AppText variant="subtitle">HealthSync AI</AppText>
                    <AppBadge variant="ai">Integrated chat</AppBadge>
                  </View>
                </View>
                <View className="flex-row items-start gap-1.5 pt-0">
                  <AiSettingsMenu
                    onBackendInfo={() =>
                      setNotice("This chat uses the secure Supabase ai-chat backend when a web answer or generated plan is needed.")
                    }
                    onClearDraft={startNewChat}
                    onHistory={() => setNotice("Recent chat history is shown below.")}
                    onImportSettings={() =>
                      setNotice("Imports stay draft-only and require your confirmation.")
                    }
                    onPrivacyNote={() =>
                      setNotice("OpenAI is called only from the secure backend. The mobile app never stores an OpenAI API key.")
                    }
                  />
                  <Pressable
                    accessibilityLabel="Start new HealthSync AI chat"
                    accessibilityRole="button"
                    onPress={startNewChat}
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
                    <MessageSquarePlus color={theme.text} size={16} />
                  </Pressable>
                  <Pressable
                    accessibilityLabel="Close HealthSync AI"
                    accessibilityRole="button"
                    onPress={onClose}
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
                    <X color={theme.text} size={17} />
                  </Pressable>
                </View>
              </View>
              <View className="w-full">
                <AppText className="w-full" variant="caption">
                  Ask questions, route app tasks, and import AI-detected health
                  drafts after review.
                </AppText>
              </View>
            </View>
          </View>

          <View style={{ flex: 1, minHeight: 0 }}>
            <BottomSheetScrollView
              contentContainerStyle={{
                flexGrow: 1,
                gap: 14,
                padding: 14,
                paddingBottom: 24,
              }}
              keyboardShouldPersistTaps="handled"
              nestedScrollEnabled
              ref={scrollRef}
              scrollEnabled
              showsVerticalScrollIndicator
              style={{ flex: 1 }}
            >
              {messages.length === 0 ? (
                <EmptyChat
                  chats={chats}
                  onOpenChat={openChat}
                  onSubmit={submit}
                />
              ) : (
                <View className="gap-4">
                  {messages.map((message) => (
                    <MessageBubble
                      key={message.id}
                      message={message}
                      onImport={(target) => importPayload(message, target)}
                      onOpenFeature={(feature) => {
                        onClose();
                        router.push(feature.route as Href);
                      }}
                    />
                  ))}
                </View>
              )}

              {notice ? (
                <AppCard className="gap-1" variant="compact">
                  <AppText variant="label">Note</AppText>
                  <AppText variant="caption">{notice}</AppText>
                </AppCard>
              ) : null}

              {loading ? (
                <AppCard className="gap-2" variant="compact">
                  <AppText variant="label">HealthSync AI is thinking...</AppText>
                  <AppText variant="caption">
                    App navigation questions are handled locally. Search and plan
                    generation use the backend AI function.
                  </AppText>
                </AppCard>
              ) : null}
            </BottomSheetScrollView>
          </View>

          <View
            style={{
              borderTopColor: theme.border,
              borderTopWidth: 1,
              gap: 6,
              paddingBottom: 10,
              paddingHorizontal: 14,
              paddingTop: 8,
            }}
          >
            <AppInput
              className="max-h-24 min-h-11 rounded-3xl"
              multiline
              onChangeText={setInput}
              placeholder="Ask, search, or create a draft..."
              textAlignVertical="top"
              value={input}
            />
            <View className="flex-row items-center justify-between gap-3">
              <AppText className="flex-1" variant="caption">
                AI can make mistakes. Review before importing.
              </AppText>
              <AppButton
                disabled={!input.trim() || loading}
                leftIcon={<SendHorizontal color={theme.background} size={16} />}
                onPress={() => submit()}
                size="sm"
                className="min-h-10"
              >
                Send
              </AppButton>
            </View>
          </View>
        </BottomSheet.Content>
      </BottomSheet.Portal>
    </BottomSheet>
  );
}

function EmptyChat({
  chats,
  onOpenChat,
  onSubmit,
}: {
  chats: AppAIChat[];
  onOpenChat: (chat: AppAIChat) => void;
  onSubmit: (input: string) => void;
}) {
  const { theme } = useAppTheme();

  return (
    <View className="gap-3">
      <AppCard className="items-center gap-3" variant="elevated">
        <View
          style={{
            alignItems: "center",
            backgroundColor: theme.primarySoft,
            borderRadius: 999,
            height: 54,
            justifyContent: "center",
            width: 54,
          }}
        >
          <Bot color={theme.primary} size={25} />
        </View>
        <AppText className="text-center" variant="heading">
          How can I help?
        </AppText>
        <AppText className="text-center" variant="bodyMuted">
          I can answer health organization questions, create draft plans, and
          detect when a response can be imported into HealthSync.
        </AppText>
      </AppCard>

      <View className="gap-2">
        <AppText variant="label">Try asking</AppText>
        {SUGGESTIONS.map((suggestion) => (
          <AppCard
            className="gap-1"
            key={suggestion}
            onPress={() => onSubmit(suggestion)}
            variant="compact"
          >
            <AppText variant="label">{suggestion}</AppText>
            <AppText variant="caption">
              Generates a chat response and import button when structured data
              is detected.
            </AppText>
          </AppCard>
        ))}
      </View>

      {chats.length ? (
        <View className="gap-2">
          <AppText variant="label">Chat history</AppText>
          {chats.slice(0, 5).map((chat) => (
            <AppCard
              className="gap-1"
              key={chat.id}
              onPress={() => onOpenChat(chat)}
              variant="compact"
            >
              <AppText variant="label">{chat.title}</AppText>
              <AppText numberOfLines={1} variant="caption">
                {chat.last_message_preview ?? "Open chat"}
              </AppText>
            </AppCard>
          ))}
        </View>
      ) : null}
    </View>
  );
}

function MessageBubble({
  message,
  onImport,
  onOpenFeature,
}: {
  message: ChatMessage;
  onImport: (target: AppAIImportTarget) => void;
  onOpenFeature: (feature: AssistantFeatureMatch) => void;
}) {
  const { theme } = useAppTheme();
  const isUser = message.role === "user";
  const targets =
    message.importPayload?.actions.can_import === true
      ? message.importPayload.import_targets
      : [];

  return (
    <View
      className={isUser ? "items-end gap-2" : "items-start gap-2"}
      style={{ width: "100%" }}
    >
      <View
        style={{
          backgroundColor: isUser ? theme.primary : theme.surface,
          borderColor: isUser ? theme.primary : theme.border,
          borderRadius: 20,
          borderTopRightRadius: isUser ? 6 : 20,
          borderTopLeftRadius: isUser ? 20 : 6,
          borderWidth: 1,
          maxWidth: "88%",
          padding: 14,
        }}
      >
        <AppText
          style={{ color: isUser ? theme.background : theme.text }}
          variant="body"
        >
          {message.text}
        </AppText>
      </View>

      {message.feature ? (
        <AppButton
          onPress={() => onOpenFeature(message.feature!)}
          rightIcon={<ExternalLink color={theme.background} size={15} />}
          size="sm"
        >
          {message.feature.label}
        </AppButton>
      ) : null}

      {targets.length ? (
        <AppCard className="max-w-[88%] gap-3" variant="compact">
          <View className="gap-1">
            <AppText variant="label">
              {message.importPayload?.summary.title ?? "Importable draft"}
            </AppText>
            <AppText variant="caption">
              {message.importPayload?.summary.short_description}
            </AppText>
          </View>
          {message.importPayload?.health_flags.warnings.length ? (
            <View className="gap-1">
              <AppText variant="danger">Review warnings</AppText>
              {message.importPayload.health_flags.warnings
                .slice(0, 3)
                .map((warning) => (
                  <AppText key={warning} variant="caption">
                    - {warning}
                  </AppText>
                ))}
            </View>
          ) : null}
          <View className="gap-2">
            {targets.map((target) => (
              <AppButton key={target} onPress={() => onImport(target)} size="sm">
                Import this as {labelTarget(target)}
              </AppButton>
            ))}
          </View>
        </AppCard>
      ) : null}

      {message.sources?.length ? (
        <AppCard className="max-w-[88%] gap-2" variant="compact">
          <AppText variant="label">Sources</AppText>
          {message.sources.map((source) => (
            <AppText key={source.url} variant="caption">
              {source.title}
            </AppText>
          ))}
        </AppCard>
      ) : null}
    </View>
  );
}

function labelTarget(target: AppAIImportTarget) {
  return target
    .replaceAll("_", " ")
    .replace(/\b\w/g, (character) => character.toUpperCase());
}

function routeForTarget(target: AppAIImportTarget) {
  const routes: Record<AppAIImportTarget, Href> = {
    baby_child: "/baby-child",
    calendar: "/calendar",
    cycle: "/cycle",
    family: "/circle",
    fitness: "/fitness",
    medication: "/medication",
    nutrition: "/food",
    pregnancy: "/pregnancy",
    records: "/records",
    shopping_list: "/food",
    supplements: "/supplements",
  };

  return routes[target];
}
