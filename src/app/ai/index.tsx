import * as Clipboard from "expo-clipboard";
import { type Href, router } from "expo-router";
import {
  ArrowUp,
  Bot,
  Menu,
  Paperclip,
  Settings,
  ShieldCheck,
  Sparkles,
} from "lucide-react-native";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { AiHistoryCard } from "@/components/ai/AiHistoryCard";
import { AiImportPreview } from "@/components/ai/AiImportPreview";
import { PasteChatGptResultSheet } from "@/components/ai/PasteChatGptResultSheet";
import { useActiveProfile } from "@/context/ActiveProfileContext";
import {
  createAiImport,
  createAiSession,
  deleteAiSession,
  listAiSessions,
  updateAiSessionStatus,
} from "@/features/ai/aiHistoryService";
import {
  getAiImportRoute,
  getAiImportTargetLabel,
} from "@/features/ai/aiImportRouting";
import { CHATGPT_BRIDGE_CONFIG } from "@/features/ai/chatGptBridgeConfig";
import { openChatGpt } from "@/features/ai/openChatGpt";
import type { PastedResultType } from "@/features/ai/parsePastedChatGptResult";
import type {
  AiStructuredResult,
  HealthSyncAiSession,
} from "@/features/ai/types";
import { useAppTheme } from "@/theme/ThemeProvider";

const ROUTED_IMPORT_MESSAGE =
  "Imported draft routed. Final save will be connected in the target section.";

const SUGGESTIONS = [
  {
    helper: "for this week",
    prompt: "Create a balanced family meal plan for the week.",
    title: "Plan meals",
  },
  {
    helper: "from pasted notes",
    prompt: "Summarize these health notes into clear next steps.",
    title: "Summarize health info",
  },
  {
    helper: "safe draft only",
    prompt: "Turn this medication instruction into a reminder draft.",
    title: "Prepare reminder",
  },
] as const;

export default function AiAssistantScreen() {
  const { activeProfile } = useActiveProfile();
  const { theme } = useAppTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const [pasteVisible, setPasteVisible] = useState(false);
  const [pastedText, setPastedText] = useState("");
  const [promptText, setPromptText] = useState("");
  const [resultType, setResultType] = useState<PastedResultType>("meal_plan");
  const [previewResult, setPreviewResult] = useState<AiStructuredResult | null>(
    null,
  );
  const [savedSession, setSavedSession] =
    useState<HealthSyncAiSession | null>(null);
  const [sessions, setSessions] = useState<HealthSyncAiSession[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState<string | null>(null);

  const loadHistory = useCallback(async () => {
    setHistoryLoading(true);
    try {
      const history = await listAiSessions({
        activeProfileId: activeProfile?.id,
        limit: 25,
      });
      setSessions(history);
    } catch (error) {
      setSessions([]);
      setStatus(
        error instanceof Error ? error.message : "Could not load AI history.",
      );
    } finally {
      setHistoryLoading(false);
    }
  }, [activeProfile?.id]);

  useEffect(() => {
    void loadHistory();
  }, [loadHistory]);

  function handleParsed(result: AiStructuredResult) {
    setPreviewResult(result);
    setSavedSession(null);
    setPasteVisible(false);
    setStatus(
      "Import preview created locally. Save or import it to add it to HealthSync history.",
    );
  }

  async function openPromptInChatGpt(nextPrompt = promptText) {
    const prompt = nextPrompt.trim();

    if (prompt) {
      await Clipboard.setStringAsync(prompt);
      setStatus("Prompt copied. Open ChatGPT and paste it there.");
    }

    await openChatGpt();
  }

  async function savePreviewSession(result: AiStructuredResult) {
    if (savedSession) return savedSession;

    setSaving(true);
    try {
      const session = await createAiSession({
        activeProfileId: activeProfile?.id ?? null,
        result,
        status: "draft",
      });
      setSavedSession(session);
      await loadHistory();
      setStatus("Saved to HealthSync AI history.");
      return session;
    } catch (error) {
      setStatus(
        error instanceof Error ? error.message : "Could not save AI history.",
      );
      return null;
    } finally {
      setSaving(false);
    }
  }

  async function importResult(
    result: AiStructuredResult,
    existingSession?: HealthSyncAiSession,
  ) {
    const target = result.import_targets[0];
    if (!target) {
      setStatus("Choose at least one import target before importing.");
      return;
    }

    setSaving(true);
    try {
      const session =
        existingSession ??
        savedSession ??
        (await createAiSession({
          activeProfileId: activeProfile?.id ?? null,
          result,
          status: "draft",
        }));

      for (const importTarget of result.import_targets) {
        const route = getAiImportRoute(importTarget);
        await createAiImport({
          sessionId: session.id,
          status: "routed",
          target: importTarget,
          targetRoute: String(route),
        });
      }

      await updateAiSessionStatus({
        sessionId: session.id,
        status: "imported",
      });

      setSavedSession({ ...session, status: "imported" });
      setStatus(ROUTED_IMPORT_MESSAGE);
      await loadHistory();
      router.push(getAiImportRoute(target) as Href);
    } catch (error) {
      setStatus(
        error instanceof Error ? error.message : "Could not import AI draft.",
      );
    } finally {
      setSaving(false);
    }
  }

  async function dismissSession(session: HealthSyncAiSession) {
    try {
      await updateAiSessionStatus({
        sessionId: session.id,
        status: "dismissed",
      });
      if (savedSession?.id === session.id) setSavedSession(null);
      setStatus("AI draft dismissed. No health record was changed.");
      await loadHistory();
    } catch (error) {
      setStatus(
        error instanceof Error ? error.message : "Could not dismiss AI draft.",
      );
    }
  }

  async function deleteSession(session: HealthSyncAiSession) {
    try {
      await deleteAiSession(session.id);
      if (savedSession?.id === session.id) {
        setSavedSession(null);
        setPreviewResult(null);
      }
      setStatus("Deleted from HealthSync AI history.");
      await loadHistory();
    } catch (error) {
      setStatus(
        error instanceof Error
          ? error.message
          : "Could not delete AI history item.",
      );
    }
  }

  return (
    <SafeAreaView edges={["top", "bottom"]} style={styles.screen}>
      <View style={styles.header}>
        <IconButton
          label="Open HealthSync pages"
          onPress={() => router.push("/(tabs)/today" as Href)}
          styles={styles}
        >
          <Menu color={theme.text} size={22} />
        </IconButton>
        <View style={styles.headerTitleWrap}>
          <Text style={styles.headerTitle}>AI Assistant</Text>
          <Text style={styles.bridgeBadge}>Bridge</Text>
        </View>
        <IconButton
          label="Open settings"
          onPress={() => router.push("/settings" as Href)}
          styles={styles}
        >
          <Settings color={theme.text} size={21} />
        </IconButton>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        style={styles.scroll}
      >
        <View style={styles.hero}>
          <View style={styles.heroIcon}>
            <Sparkles color={theme.primary} size={42} />
          </View>
          <Text style={styles.heroTitle}>How can I help you today?</Text>
          <Text style={styles.heroSubtitle}>
            Ask in your own ChatGPT account, then paste selected results back
            into HealthSync.
          </Text>
        </View>

        <View style={styles.messageStack}>
          <View style={styles.assistantRow}>
            <View style={styles.avatar}>
              <Bot color={theme.primary} size={20} />
            </View>
            <View style={styles.assistantBubbleWrap}>
              <Text style={styles.messageLabel}>HealthSync AI</Text>
              <View style={styles.assistantBubble}>
                <Text style={styles.bodyText}>
                  I can help you move useful ChatGPT results into HealthSync.
                </Text>
                <Text style={styles.mutedText}>
                  HealthSync does not read ChatGPT, request credentials, or save
                  your full ChatGPT history.
                </Text>
              </View>
            </View>
          </View>

          <View style={styles.userBubbleWrap}>
            <Text style={[styles.messageLabel, styles.rightText]}>You</Text>
            <View style={styles.userBubble}>
              <Text style={styles.bodyText}>
                Open ChatGPT, ask my question, then paste only the result I
                choose to use.
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick starts</Text>
          {SUGGESTIONS.map((suggestion) => (
            <Pressable
              accessibilityRole="button"
              key={suggestion.title}
              onPress={() => {
                setPromptText(suggestion.prompt);
                void openPromptInChatGpt(suggestion.prompt);
              }}
              style={styles.suggestionCard}
            >
              <Text style={styles.cardTitle}>{suggestion.title}</Text>
              <Text style={styles.mutedText}>{suggestion.helper}</Text>
            </Pressable>
          ))}
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Use your own ChatGPT</Text>
          <Text style={styles.mutedText}>
            Open ChatGPT, ask your question, then bring the useful result back
            into HealthSync.
          </Text>
          <Pressable
            accessibilityRole="button"
            onPress={() => {
              openChatGpt().catch(() =>
                setStatus("Could not open ChatGPT from this device."),
              );
            }}
            style={styles.primaryButton}
          >
            <Text style={styles.primaryButtonText}>Open ChatGPT</Text>
          </Pressable>
          <Pressable
            accessibilityRole="button"
            onPress={() => setPasteVisible(true)}
            style={styles.secondaryButton}
          >
            <Text style={styles.secondaryButtonText}>Paste result</Text>
          </Pressable>
          <Text style={styles.captionText}>
            Only results you paste or save here are stored in HealthSync.
          </Text>
        </View>

        <View style={styles.card}>
          <View style={styles.inlineTitle}>
            <ShieldCheck color={theme.primary} size={18} />
            <Text style={styles.cardTitle}>Privacy and safety</Text>
          </View>
          <Text style={styles.captionText}>
            {CHATGPT_BRIDGE_CONFIG.privacyNote}
          </Text>
          <Text style={styles.captionText}>
            {CHATGPT_BRIDGE_CONFIG.safetyNote}
          </Text>
        </View>

        {previewResult ? (
          <AiImportPreview
            onDismiss={() => {
              if (savedSession) {
                void dismissSession(savedSession);
              } else {
                setPreviewResult(null);
                setStatus("Draft dismissed. Nothing was saved to app data.");
              }
            }}
            onEdit={() => {
              setPastedText(previewResult.raw_text ?? "");
              setResultType(previewResult.type);
              setPasteVisible(true);
            }}
            onImport={() => {
              void importResult(previewResult);
            }}
            onSave={() => {
              void savePreviewSession(previewResult);
            }}
            result={previewResult}
            saveDisabled={Boolean(savedSession) || saving}
            saveLabel={
              savedSession
                ? "Saved to HealthSync history"
                : "Save to HealthSync history"
            }
          />
        ) : null}

        {status ? (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Status</Text>
            <Text style={styles.captionText}>{status}</Text>
          </View>
        ) : null}

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>HealthSync AI history</Text>
          <Text style={styles.captionText}>
            {CHATGPT_BRIDGE_CONFIG.privacyNote}
          </Text>

          {historyLoading ? (
            <View style={styles.card}>
              <Text style={styles.cardTitle}>Loading AI history...</Text>
            </View>
          ) : sessions.length ? (
            sessions.map((session) => (
              <AiHistoryCard
                key={session.id}
                onDelete={() => {
                  void deleteSession(session);
                }}
                onDismiss={() => {
                  void dismissSession(session);
                }}
                onImport={() => {
                  setPreviewResult(session.structured_result);
                  setSavedSession(session);
                  void importResult(session.structured_result, session);
                }}
                onView={() => {
                  setPreviewResult(session.structured_result);
                  setSavedSession(session);
                  setStatus(
                    `Viewing saved ${getAiImportTargetLabel(
                      session.import_targets[0] ?? "general_health",
                    )} draft.`,
                  );
                }}
                session={session}
              />
            ))
          ) : (
            <View style={styles.card}>
              <Text style={styles.cardTitle}>No HealthSync AI history yet.</Text>
              <Text style={styles.captionText}>
                Paste a useful ChatGPT result, then save or import it to sync it
                with HealthSync history.
              </Text>
            </View>
          )}
        </View>
      </ScrollView>

      <View style={styles.inputDock}>
        <View style={styles.inputShell}>
          <TextInput
            multiline
            onChangeText={setPromptText}
            placeholder="Message AI Assistant..."
            placeholderTextColor={theme.mutedText}
            style={styles.input}
            textAlignVertical="top"
            value={promptText}
          />
          <View style={styles.inputActions}>
            <IconButton
              label="Paste ChatGPT result"
              onPress={() => setPasteVisible(true)}
              styles={styles}
            >
              <Paperclip color={theme.mutedText} size={19} />
            </IconButton>
            <Pressable
              accessibilityLabel="Open prompt in ChatGPT"
              accessibilityRole="button"
              disabled={!promptText.trim()}
              onPress={() => {
                openPromptInChatGpt().catch(() =>
                  setStatus("Could not open ChatGPT from this device."),
                );
              }}
              style={[
                styles.sendButton,
                !promptText.trim() && styles.disabledButton,
              ]}
            >
              <ArrowUp color={theme.background} size={18} />
            </Pressable>
          </View>
        </View>
        <Text style={styles.footerNote}>
          AI can make mistakes. Verify important information.
        </Text>
      </View>

      <PasteChatGptResultSheet
        onClose={() => setPasteVisible(false)}
        onParsed={handleParsed}
        pastedText={pastedText}
        resultType={resultType}
        setPastedText={setPastedText}
        setResultType={setResultType}
        visible={pasteVisible}
      />
    </SafeAreaView>
  );
}

export function ErrorBoundary({ error }: { error: Error }) {
  const { theme } = useAppTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);

  return (
    <SafeAreaView edges={["top", "bottom"]} style={styles.screen}>
      <View style={[styles.card, styles.errorCard]}>
        <Text style={styles.heroTitle}>AI screen could not load</Text>
        <Text style={styles.captionText}>{error.message}</Text>
        <Pressable
          accessibilityRole="button"
          onPress={() => router.replace("/(tabs)/today" as Href)}
          style={styles.primaryButton}
        >
          <Text style={styles.primaryButtonText}>Back to HealthSync</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

function IconButton({
  children,
  label,
  onPress,
  styles,
}: {
  children: React.ReactNode;
  label: string;
  onPress: () => void;
  styles: ReturnType<typeof createStyles>;
}) {
  return (
    <Pressable
      accessibilityLabel={label}
      accessibilityRole="button"
      onPress={onPress}
      style={styles.iconButton}
    >
      {children}
    </Pressable>
  );
}

function createStyles(theme: ReturnType<typeof useAppTheme>["theme"]) {
  return StyleSheet.create({
    assistantBubble: {
      backgroundColor: theme.surface,
      borderColor: theme.border,
      borderRadius: 18,
      gap: 8,
      padding: 14,
    },
    assistantBubbleWrap: {
      flex: 1,
      gap: 5,
      maxWidth: "86%",
    },
    assistantRow: {
      alignItems: "flex-start",
      flexDirection: "row",
      gap: 12,
    },
    avatar: {
      alignItems: "center",
      backgroundColor: theme.surface,
      borderColor: theme.border,
      borderRadius: 18,
      borderWidth: 1,
      height: 36,
      justifyContent: "center",
      width: 36,
    },
    bodyText: {
      color: theme.text,
      fontSize: 15,
      lineHeight: 22,
    },
    bridgeBadge: {
      backgroundColor: theme.primarySoft,
      borderColor: theme.border,
      borderRadius: 999,
      borderWidth: 1,
      color: theme.primary,
      fontSize: 12,
      fontWeight: "700",
      overflow: "hidden",
      paddingHorizontal: 9,
      paddingVertical: 4,
    },
    captionText: {
      color: theme.mutedText,
      fontSize: 13,
      lineHeight: 19,
    },
    card: {
      backgroundColor: theme.surface,
      borderColor: theme.border,
      borderRadius: 22,
      borderWidth: 1,
      gap: 12,
      padding: 16,
      width: "100%",
    },
    cardTitle: {
      color: theme.text,
      fontSize: 15,
      fontWeight: "800",
    },
    disabledButton: {
      opacity: 0.4,
    },
    errorCard: {
      margin: 20,
      marginTop: 48,
    },
    footerNote: {
      color: theme.mutedText,
      fontSize: 12,
      textAlign: "center",
    },
    header: {
      alignItems: "center",
      backgroundColor: theme.background,
      borderBottomColor: theme.border,
      borderBottomWidth: 1,
      flexDirection: "row",
      justifyContent: "space-between",
      paddingHorizontal: 16,
      paddingVertical: 10,
    },
    headerTitle: {
      color: theme.text,
      fontSize: 21,
      fontWeight: "800",
    },
    headerTitleWrap: {
      alignItems: "center",
      flexDirection: "row",
      gap: 8,
    },
    hero: {
      alignItems: "center",
      gap: 12,
      paddingVertical: 18,
    },
    heroIcon: {
      alignItems: "center",
      backgroundColor: theme.surface,
      borderColor: theme.border,
      borderRadius: 48,
      borderWidth: 1,
      height: 96,
      justifyContent: "center",
      width: 96,
    },
    heroSubtitle: {
      color: theme.mutedText,
      fontSize: 15,
      lineHeight: 22,
      maxWidth: 620,
      textAlign: "center",
    },
    heroTitle: {
      color: theme.text,
      fontSize: 30,
      fontWeight: "900",
      letterSpacing: -0.7,
      textAlign: "center",
    },
    iconButton: {
      alignItems: "center",
      borderRadius: 22,
      height: 44,
      justifyContent: "center",
      width: 44,
    },
    inlineTitle: {
      alignItems: "center",
      flexDirection: "row",
      gap: 8,
    },
    input: {
      color: theme.text,
      fontSize: 15,
      lineHeight: 22,
      maxHeight: 110,
      minHeight: 48,
      paddingHorizontal: 8,
      paddingVertical: 8,
    },
    inputActions: {
      alignItems: "center",
      flexDirection: "row",
      justifyContent: "space-between",
    },
    inputDock: {
      backgroundColor: theme.background,
      borderTopColor: theme.border,
      borderTopWidth: 1,
      gap: 8,
      paddingHorizontal: 16,
      paddingVertical: 12,
    },
    inputShell: {
      backgroundColor: theme.surface,
      borderColor: theme.border,
      borderRadius: 24,
      borderWidth: 1,
      padding: 6,
    },
    messageLabel: {
      color: theme.mutedText,
      fontSize: 12,
      fontWeight: "700",
    },
    messageStack: {
      gap: 18,
    },
    mutedText: {
      color: theme.mutedText,
      fontSize: 14,
      lineHeight: 21,
    },
    primaryButton: {
      alignItems: "center",
      backgroundColor: theme.primary,
      borderRadius: 16,
      minHeight: 48,
      justifyContent: "center",
      paddingHorizontal: 16,
    },
    primaryButtonText: {
      color: theme.background,
      fontSize: 15,
      fontWeight: "900",
    },
    rightText: {
      textAlign: "right",
    },
    screen: {
      backgroundColor: theme.background,
      flex: 1,
    },
    scroll: {
      flex: 1,
    },
    scrollContent: {
      alignSelf: "center",
      gap: 18,
      maxWidth: 800,
      paddingBottom: 28,
      paddingHorizontal: 20,
      paddingTop: 18,
      width: "100%",
    },
    secondaryButton: {
      alignItems: "center",
      borderColor: theme.border,
      borderRadius: 16,
      borderWidth: 1,
      minHeight: 48,
      justifyContent: "center",
      paddingHorizontal: 16,
    },
    secondaryButtonText: {
      color: theme.text,
      fontSize: 15,
      fontWeight: "800",
    },
    section: {
      gap: 12,
      width: "100%",
    },
    sectionTitle: {
      color: theme.text,
      fontSize: 20,
      fontWeight: "900",
    },
    sendButton: {
      alignItems: "center",
      backgroundColor: theme.primary,
      borderRadius: 14,
      height: 40,
      justifyContent: "center",
      width: 40,
    },
    suggestionCard: {
      backgroundColor: theme.surface,
      borderColor: theme.border,
      borderRadius: 18,
      borderWidth: 1,
      gap: 4,
      padding: 14,
    },
    userBubble: {
      backgroundColor: theme.surface,
      borderColor: theme.border,
      borderRadius: 18,
      borderTopRightRadius: 5,
      borderWidth: 1,
      padding: 14,
    },
    userBubbleWrap: {
      alignSelf: "flex-end",
      gap: 5,
      maxWidth: "86%",
    },
  });
}
