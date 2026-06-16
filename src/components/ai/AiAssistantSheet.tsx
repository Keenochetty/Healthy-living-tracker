import { Href, router } from "expo-router";
import { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Linking,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { AppButton, AppChip, AppIcon } from "@/components/ui";
import { useAuth } from "@/context/AuthContext";
import { importAppAIData, SUPPORTED_APP_AI_IMPORT_TARGETS } from "@/lib/appAIImport";
import {
  createAppAIChat,
  getAppAIChats,
  getAppAIImports,
  getAppAIMessages,
  logAppAIImport,
  saveAppAIMessage,
} from "@/lib/appAIStorage";
import { askAIWithSources, type AiChatSource } from "@/lib/aiBackend";
import { getAssistantSettings } from "@/lib/assistantStorage";
import {
  findAssistantFeature,
  type AssistantFeatureMatch,
} from "@/lib/assistantFeatureRouter";
import { radius, spacing } from "@/theme/tokens";
import { useAppTheme } from "@/theme/ThemeProvider";
import type {
  AppAIChat,
  AppAIImport,
  AppAIImportPayload,
  AppAIImportTarget,
  AppAIInputType,
} from "@/types/appAI";

type AiAssistantSheetProps = {
  initialPrompt?: string;
  onClose: () => void;
  visible: boolean;
};

type CompanionMessage = {
  feature?: AssistantFeatureMatch;
  id: string;
  importPayload?: AppAIImportPayload | null;
  remoteId?: string;
  role: "assistant" | "user";
  sources?: AiChatSource[];
  text: string;
};

const SUGGESTED_ACTIONS = [
  "Plan meal",
  "Scan product",
  "Create workout",
  "Check medication",
  "Add reminder",
  "Import to calendar",
];

export function AiAssistantSheet({ initialPrompt, onClose, visible }: AiAssistantSheetProps) {
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const { theme } = useAppTheme();
  const scrollRef = useRef<ScrollView>(null);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [assistantEnabled, setAssistantEnabled] = useState(false);
  const [chats, setChats] = useState<AppAIChat[]>([]);
  const [imports, setImports] = useState<AppAIImport[]>([]);
  const [chatId, setChatId] = useState<string | null>(null);
  const [messages, setMessages] = useState<CompanionMessage[]>([]);
  const [status, setStatus] = useState<string | null>(null);
  const [offline, setOffline] = useState(false);
  const [pendingImport, setPendingImport] = useState<{
    message: CompanionMessage;
    target: AppAIImportTarget;
  } | null>(null);

  useEffect(() => {
    if (!visible) return;
    if (initialPrompt) setQuery(initialPrompt);
    getAssistantSettings().then((settings) =>
      setAssistantEnabled(settings.assistantEnabled),
    );
    if (user) {
      Promise.all([getAppAIChats(), getAppAIImports()])
        .then(([nextChats, nextImports]) => {
          setChats(nextChats);
          setImports(nextImports);
        })
        .catch(() => setStatus("App-only chat history is temporarily unavailable."));
    }
  }, [initialPrompt, user, visible]);

  async function ensureChat(title: string) {
    if (chatId || !user) return chatId;
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
      setMessages([
        ...rows.map((row) => ({
          id: String(row.id),
          importPayload: row.import_payload as AppAIImportPayload | null,
          remoteId: String(row.id),
          role: row.role === "user" ? ("user" as const) : ("assistant" as const),
          sources: (row.sources ?? []) as AiChatSource[],
          text: String(row.content),
        })),
      ]);
      setStatus(null);
    } catch {
      setStatus("Could not load that app-only chat.");
    } finally {
      setLoading(false);
    }
  }

  async function submit(nextQuery = query, inputType: AppAIInputType = "text") {
    const text = nextQuery.trim();
    if (!text || loading) return;
    const userMessage: CompanionMessage = {
      id: `user-${Date.now()}`,
      role: "user",
      text,
    };
    const feature = findAssistantFeature(text);
    setMessages((current) => [...current, userMessage]);
    setQuery("");
    setStatus(null);
    setOffline(false);

    if (feature) {
      setMessages((current) => [
        ...current,
        {
          feature,
          id: `feature-${Date.now()}`,
          role: "assistant",
          text: `HealthSync already has this feature. ${feature.description}`,
        },
      ]);
      return;
    }
    if (!assistantEnabled) {
      setMessages((current) => [
        ...current,
        {
          feature: {
            description: "Review assistant consent before using internet AI.",
            label: "Review AI settings",
            route: "/ai",
          },
          id: `consent-${Date.now()}`,
          role: "assistant",
          text: "Internet AI is off. App feature routing still works, but AI search requires your assistant consent.",
        },
      ]);
      return;
    }
    if (!user) {
      setStatus("Sign in to use AI and keep app-only chat history.");
      return;
    }

    setLoading(true);
    try {
      const activeChatId = await ensureChat(text);
      if (!activeChatId) throw new Error("Could not create an app-only chat.");
      await saveAppAIMessage({
        chatId: activeChatId,
        content: text,
        role: "user",
        userId: user.id,
      });
      const context = messages.slice(-6).map(({ role, text: content }) => ({
        role,
        text: content,
      }));
      const response = await askAIWithSources(text, { conversation: context }, inputType);
      const assistantMessage: CompanionMessage = {
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
        userId: user.id,
      });
      setMessages((current) => [...current, assistantMessage]);
      setChats(await getAppAIChats());
    } catch (error) {
      const text =
        error instanceof Error ? error.message : "The assistant request failed.";
      setOffline(/network|fetch|offline/i.test(text));
      setStatus(text);
    } finally {
      setLoading(false);
    }
  }

  async function confirmImport() {
    if (!pendingImport || !user) return;
    setLoading(true);
    try {
      const isDirectImport = SUPPORTED_APP_AI_IMPORT_TARGETS.includes(pendingImport.target);
      if (isDirectImport) {
        await importAppAIData(pendingImport.message.importPayload!, pendingImport.target);
      }
      await logAppAIImport({
        chatId: chatId ?? undefined,
        messageId: pendingImport.message.remoteId,
        payload: pendingImport.message.importPayload!,
        target: pendingImport.target,
        userId: user.id,
      });
      setImports(await getAppAIImports());
      if (!isDirectImport) {
        const route = routeForImportTarget(pendingImport.target);
        setPendingImport(null);
        onClose();
        router.push(route as Href);
        return;
      }
      const route = routeForImportTarget(pendingImport.target);
      setPendingImport(null);
      onClose();
      router.push(route as Href);
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Import failed.");
    } finally {
      setLoading(false);
    }
  }

  function openFeature(feature: AssistantFeatureMatch) {
    onClose();
    router.push(feature.route as Href);
  }

  return (
    <Modal animationType="slide" onRequestClose={onClose} presentationStyle="fullScreen" visible={visible}>
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} style={{ backgroundColor: theme.background, flex: 1 }}>
        <View style={{ alignItems: "center", borderBottomColor: theme.border, borderBottomWidth: 1, flexDirection: "row", justifyContent: "space-between", paddingBottom: spacing.md, paddingHorizontal: spacing.lg, paddingTop: spacing.md + insets.top }}>
          <View style={{ alignItems: "center", flexDirection: "row", gap: spacing.sm }}>
            <AppIcon decorative name="ai" size={24} />
            <View>
              <Text style={{ color: theme.text, fontSize: 17, fontWeight: "700" }}>HealthSync AI</Text>
              <Text style={{ color: theme.mutedText, fontSize: 12 }}>App companion</Text>
            </View>
          </View>
          <View style={{ flexDirection: "row", gap: spacing.sm }}>
            <Pressable accessibilityLabel="Start new app AI chat" onPress={() => { setChatId(null); setMessages([]); setStatus(null); }} style={{ padding: spacing.sm }}>
              <AppIcon decorative name="edit" size={20} />
            </Pressable>
            <Pressable accessibilityLabel="Close AI companion" onPress={onClose} style={{ padding: spacing.sm }}>
              <Text style={{ color: theme.text, fontSize: 20 }}>X</Text>
            </Pressable>
          </View>
        </View>

        <ScrollView contentContainerStyle={{ gap: spacing.md, padding: spacing.lg, paddingBottom: spacing.xl }} onContentSizeChange={() => scrollRef.current?.scrollToEnd({ animated: true })} ref={scrollRef}>
          {messages.length === 0 ? (
            <AssistantEmptyState
              chats={chats}
              imports={imports}
              onOpenChat={openChat}
              onOpenFeature={openFeature}
              onSubmit={submit}
            />
          ) : null}
          {messages.map((message) => (
            <MessageBubble
              key={message.id}
              message={message}
              onEditImport={(target) => {
                setQuery(`Edit the ${labelTarget(target)} draft before importing: `);
                setStatus("Describe the changes you want, then send the message.");
              }}
              onImport={(target) => setPendingImport({ message, target })}
              onOpenFeature={openFeature}
            />
          ))}
          {loading ? <ActivityIndicator color={theme.primary} /> : null}
          {pendingImport ? (
            <View style={{ backgroundColor: theme.surface, borderColor: theme.warning, borderRadius: radius.lg, borderWidth: 1, gap: spacing.sm, padding: spacing.md }}>
              <Text style={{ color: theme.text, fontWeight: "900" }}>Confirm import to {labelTarget(pendingImport.target)}</Text>
              <Text style={{ color: theme.mutedText }}>Review the AI draft and warnings first. Nothing is saved until you confirm.</Text>
              <View style={{ flexDirection: "row", gap: spacing.sm }}>
                <AppChip label="Confirm import" onPress={confirmImport} selected />
                <AppChip label="Cancel" onPress={() => setPendingImport(null)} />
              </View>
            </View>
          ) : null}
          {status ? <Text style={{ color: offline ? theme.warning : theme.mutedText }}>{offline ? "Offline: " : ""}{status}</Text> : null}
        </ScrollView>

        <View style={{ alignItems: "flex-end", backgroundColor: theme.background, borderTopColor: theme.border, borderTopWidth: 1, flexDirection: "row", gap: spacing.sm, paddingBottom: spacing.md + insets.bottom, paddingHorizontal: spacing.lg, paddingTop: spacing.md }}>
          <TextInput accessibilityLabel="Message HealthSync AI" editable={!loading} multiline onChangeText={setQuery} onSubmitEditing={() => submit()} placeholder="Ask, search, plan, or prepare an import..." placeholderTextColor={theme.mutedText} returnKeyType="send" style={{ backgroundColor: theme.surface, borderColor: theme.border, borderRadius: radius.lg, borderWidth: 1, color: theme.text, flex: 1, maxHeight: 120, minHeight: 48, paddingHorizontal: spacing.md, paddingVertical: spacing.sm }} value={query} />
          <Pressable accessibilityLabel="Send message" disabled={!query.trim() || loading} onPress={() => submit()} style={({ pressed }) => ({ alignItems: "center", backgroundColor: theme.text, borderRadius: 999, height: 46, justifyContent: "center", opacity: !query.trim() || loading ? 0.35 : pressed ? 0.75 : 1, width: 46 })}>
            <Text style={{ color: theme.background, fontSize: 20, fontWeight: "700" }}>↑</Text>
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

function AssistantEmptyState({
  chats,
  imports,
  onOpenChat,
  onOpenFeature,
  onSubmit,
}: {
  chats: AppAIChat[];
  imports: AppAIImport[];
  onOpenChat: (chat: AppAIChat) => void;
  onOpenFeature: (feature: AssistantFeatureMatch) => void;
  onSubmit: (prompt: string) => void;
}) {
  const { theme } = useAppTheme();
  return (
    <View style={{ alignSelf: "center", gap: spacing.xl, maxWidth: 720, width: "100%" }}>
      <View style={{ alignItems: "center", gap: spacing.sm, paddingTop: spacing.xl }}>
        <View style={{ alignItems: "center", backgroundColor: theme.text, borderRadius: 999, height: 58, justifyContent: "center", width: 58 }}>
          <AppIcon backgroundColor={theme.text} decorative name="ai" size={30} />
        </View>
        <Text style={{ color: theme.text, fontSize: 24, fontWeight: "700" }}>How can I help?</Text>
        <Text style={{ color: theme.mutedText, lineHeight: 21, maxWidth: 460, textAlign: "center" }}>
          Search current information, use HealthSync features, or prepare structured data for review and import.
        </Text>
        <Text style={{ color: theme.mutedText, fontSize: 12 }}>Only chats created inside this app are shown here.</Text>
      </View>

      <View style={{ flexDirection: "row", flexWrap: "wrap", gap: spacing.sm }}>
        {SUGGESTED_ACTIONS.map((prompt) => (
          <Pressable
            key={prompt}
            onPress={() => onSubmit(prompt)}
            style={({ pressed }) => ({
              backgroundColor: theme.surface,
              borderColor: theme.border,
              borderRadius: radius.lg,
              borderWidth: 1,
              minHeight: 72,
              opacity: pressed ? 0.78 : 1,
              padding: spacing.md,
              width: "48%",
            })}
          >
            <Text style={{ color: theme.text, fontWeight: "700" }}>{prompt}</Text>
            <Text style={{ color: theme.mutedText, fontSize: 12, marginTop: spacing.xs }}>Ask HealthSync AI</Text>
          </Pressable>
        ))}
      </View>

      <View style={{ flexDirection: "row", flexWrap: "wrap", gap: spacing.sm }}>
        <AppChip icon={<AppIcon decorative name="scan" size={14} />} label="Camera" onPress={() => onOpenFeature({ description: "", label: "", route: "/scan" })} />
        <AppChip icon={<AppIcon decorative name="scan_barcode" size={14} />} label="Barcode" onPress={() => onOpenFeature({ description: "", label: "", route: "/food/barcode-scanner" })} />
        <AppChip icon={<AppIcon decorative name="voice" size={14} />} label="Voice" onPress={() => onSubmit("Start a voice-assisted health note")} />
      </View>

      {chats.length ? (
        <View style={{ gap: spacing.sm }}>
          <Text style={{ color: theme.text, fontSize: 16, fontWeight: "700" }}>Recent app-only chats</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: spacing.sm }}>
            {chats.map((chat) => <AppChip key={chat.id} label={chat.title} onPress={() => onOpenChat(chat)} />)}
          </ScrollView>
        </View>
      ) : null}

      {imports.length ? (
        <View style={{ gap: spacing.sm }}>
          <Text style={{ color: theme.text, fontSize: 16, fontWeight: "700" }}>Import history</Text>
          {imports.slice(0, 4).map((item) => (
            <View key={item.id} style={{ backgroundColor: theme.surface, borderColor: theme.border, borderRadius: radius.md, borderWidth: 1, padding: spacing.md }}>
              <Text style={{ color: theme.text, fontWeight: "700" }}>{item.payload.summary.title}</Text>
              <Text style={{ color: theme.mutedText, fontSize: 12 }}>{labelTarget(item.target)} · {item.status}</Text>
            </View>
          ))}
        </View>
      ) : null}
    </View>
  );
}

function MessageBubble({ message, onEditImport, onImport, onOpenFeature }: { message: CompanionMessage; onEditImport: (target: AppAIImportTarget) => void; onImport: (target: AppAIImportTarget) => void; onOpenFeature: (feature: AssistantFeatureMatch) => void }) {
  const { theme } = useAppTheme();
  const isUser = message.role === "user";
  const warnings = message.importPayload ? getWarnings(message.importPayload) : [];
  const targets = message.importPayload?.import_targets ?? [];
  const target = targets[0];
  return (
    <View style={{ alignSelf: isUser ? "flex-end" : "stretch", gap: spacing.sm, maxWidth: isUser ? "88%" : "100%" }}>
      <View style={{ alignItems: "flex-start", flexDirection: isUser ? "row-reverse" : "row", gap: spacing.sm }}>
        {!isUser ? (
          <View style={{ alignItems: "center", backgroundColor: theme.surface, borderRadius: 999, height: 30, justifyContent: "center", width: 30 }}>
            <AppIcon backgroundColor={theme.surface} decorative name="ai" size={17} />
          </View>
        ) : null}
        <View style={{ backgroundColor: isUser ? theme.text : (theme.surfaceSoft ?? theme.surface), borderRadius: radius.lg, gap: spacing.sm, maxWidth: "88%", padding: spacing.md }}>
          <Text style={{ color: isUser ? theme.background : theme.text, fontSize: 15, lineHeight: 22 }}>{message.text}</Text>
          {message.feature ? <AppChip label={message.feature.label} onPress={() => onOpenFeature(message.feature!)} /> : null}
        </View>
      </View>
      {message.importPayload && target ? (
        <View style={{ backgroundColor: theme.surface, borderColor: theme.border, borderRadius: radius.lg, borderWidth: 1, gap: spacing.md, padding: spacing.md }}>
          <View style={{ gap: spacing.xs }}>
            <Text style={{ color: theme.text, fontSize: 16, fontWeight: "700" }}>Import found data</Text>
            <Text style={{ color: theme.mutedText, fontSize: 12 }}>Route to {labelTarget(target)}</Text>
          </View>
          <View style={{ backgroundColor: theme.surfaceSoft ?? theme.background, borderRadius: radius.md, gap: spacing.xs, padding: spacing.md }}>
            <Text style={{ color: theme.text, fontWeight: "700" }}>{message.importPayload.summary.title}</Text>
            <Text style={{ color: theme.mutedText, fontSize: 13, lineHeight: 19 }}>{message.importPayload.summary.short_description}</Text>
          </View>
          {warnings.length ? (
            <View style={{ gap: spacing.xs }}>
              <Text style={{ color: theme.warning, fontWeight: "700" }}>Review warnings before import</Text>
              {warnings.slice(0, 4).map((warning) => <Text key={warning} style={{ color: theme.warning, fontSize: 12 }}>- {warning}</Text>)}
            </View>
          ) : null}
          <View style={{ flexDirection: "row", flexWrap: "wrap", gap: spacing.sm }}>
            <AppButton label="Import to App" onPress={() => onImport(target)} size="sm" style={{ flex: 1 }} />
            <AppButton label="Edit before import" onPress={() => onEditImport(target)} size="sm" style={{ flex: 1 }} variant="outline" />
          </View>
        </View>
      ) : null}
      {message.sources?.length ? (
        <View style={{ gap: spacing.xs }}>
          <Text style={{ color: theme.mutedText, fontSize: 11, fontWeight: "900" }}>Sources</Text>
          {message.sources.map((source) => <Pressable key={source.url} onPress={() => Linking.openURL(source.url)}><Text style={{ color: theme.primary, fontSize: 12 }}>{source.title}</Text></Pressable>)}
        </View>
      ) : null}
    </View>
  );
}

function getWarnings(payload: AppAIImportPayload) {
  const flags = payload.health_flags;
  return [
    ...(payload.summary.medical_disclaimer_required
      ? ["Medical review is recommended before using this draft"]
      : []),
    ...flags.allergy_flags,
    ...flags.warnings,
    ...(flags.diabetic_warning ? ["Diabetes-related warning"] : []),
    ...(flags.pregnancy_warning ? ["Pregnancy-related warning"] : []),
    ...(flags.medication_interaction_warning ? ["Possible medication interaction"] : []),
    ...(flags.contraceptive_interaction_warning ? ["Possible contraceptive interaction"] : []),
    ...(flags.child_safety_warning ? ["Child safety warning"] : []),
    ...(flags.high_risk_warning ? ["High-risk health warning"] : []),
  ];
}

function labelTarget(target: AppAIImportTarget) {
  return target.replaceAll("_", " ").replace(/\b\w/g, (character) => character.toUpperCase());
}

function routeForImportTarget(target: AppAIImportTarget) {
  const routes: Record<AppAIImportTarget, string> = {
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
