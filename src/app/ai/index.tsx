import {
  Href,
  router,
  useFocusEffect,
  useLocalSearchParams,
} from "expo-router";
import { useCallback, useState } from "react";
import {
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

import { AiCreateJobCard } from "@/components/ai/AiCreateJobCard";
import { AiDisclaimerCard } from "@/components/ai/AiDisclaimerCard";
import { AiJobCard } from "@/components/ai/AiJobCard";
import { ScreenWrapper } from "@/components/layout/ScreenWrapper";
import { AppCard } from "@/components/ui/AppCard";
import {
  ASSISTANT_CONSENT_CATEGORIES,
  ASSISTANT_MODES,
  cancelAssistantDraft,
  confirmAssistantDraft,
  getAssistantDrafts,
  getAssistantMessages,
  getAssistantSettings,
  handleAssistantPrompt,
  updateAssistantSettings,
} from "@/lib/assistantStorage";
import { getActiveProfile } from "@/lib/familyPermissionsStorage";
import { getPendingReviewJobs, getRecentAiJobs } from "@/lib/aiStorage";
import { getUserPreferences } from "@/lib/userPreferences";
import type { AiJob } from "@/types/ai";
import type {
  AssistantDraft,
  AssistantMessage,
  AssistantMode,
  AssistantRequestResult,
  AssistantSettings,
} from "@/types/assistant";
import type { HealthProfile } from "@/types/familyPermissions";

const SUGGESTED_PROMPTS = [
  { mode: "food_logger" as const, text: "Log a meal" },
  { mode: "workout_logger" as const, text: "Log a workout" },
  { mode: "calendar_helper" as const, text: "Add a reminder" },
  { mode: "general_health" as const, text: "Summarize today" },
  { mode: "records_helper" as const, text: "Prepare questions for my doctor" },
  { mode: "baby_child" as const, text: "Show my baby's feeding summary" },
  {
    mode: "medication_supplement" as const,
    text: "Show my next medication reminder",
  },
  { mode: "womens_health" as const, text: "Add a period note" },
  {
    mode: "food_logger" as const,
    text: "Create a grocery idea from my protein target",
  },
];

const GENERAL_FOOTER =
  "The assistant helps with tracking, organization, summaries, and education. It is not medical advice and does not replace a doctor, pharmacist, nurse, clinic, pediatrician, midwife, therapist, or healthcare professional.";

export default function AiAssistantScreen() {
  const params = useLocalSearchParams<{ mode?: string; prompt?: string }>();
  const [moduleEnabled, setModuleEnabled] = useState(false);
  const [settings, setSettings] = useState<AssistantSettings | null>(null);
  const [activeProfile, setActiveProfile] = useState<HealthProfile | null>(
    null,
  );
  const [pendingJobs, setPendingJobs] = useState<AiJob[]>([]);
  const [recentJobs, setRecentJobs] = useState<AiJob[]>([]);
  const [messages, setMessages] = useState<AssistantMessage[]>([]);
  const [drafts, setDrafts] = useState<AssistantDraft[]>([]);
  const [mode, setMode] = useState<AssistantMode>(toAssistantMode(params.mode));
  const [prompt, setPrompt] = useState(stringParam(params.prompt));
  const [lastResult, setLastResult] = useState<AssistantRequestResult | null>(
    null,
  );
  const [message, setMessage] = useState("");

  const loadAiScreen = useCallback(async () => {
    const [
      preferences,
      assistantSettings,
      pending,
      recent,
      active,
      nextMessages,
      nextDrafts,
    ] = await Promise.all([
      getUserPreferences(),
      getAssistantSettings(),
      getPendingReviewJobs(),
      getRecentAiJobs(),
      getActiveProfile(),
      getAssistantMessages(),
      getAssistantDrafts(),
    ]);

    setModuleEnabled(preferences.enabledModules.includes("ai_assistant"));
    setSettings(assistantSettings);
    setPendingJobs(pending);
    setRecentJobs(recent);
    setActiveProfile(active);
    setMessages(nextMessages);
    setDrafts(nextDrafts);
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadAiScreen();
    }, [loadAiScreen]),
  );

  async function saveSettings(partial: Partial<AssistantSettings>) {
    const next = await updateAssistantSettings(partial);
    setSettings(next);
    await loadAiScreen();
  }

  async function submitPrompt(nextPrompt = prompt, nextMode = mode) {
    const value = nextPrompt.trim();

    if (!value || !settings?.assistantEnabled) return;

    const result = await handleAssistantPrompt({
      mode: nextMode,
      prompt: value,
    });
    setLastResult(result);
    setPrompt("");
    await loadAiScreen();
  }

  async function confirmDraft(draftId: string) {
    await confirmAssistantDraft(draftId);
    setMessage("Draft saved after confirmation.");
    await loadAiScreen();
  }

  async function cancelDraft(draftId: string) {
    await cancelAssistantDraft(draftId);
    setMessage("Draft cancelled.");
    await loadAiScreen();
  }

  if (!moduleEnabled) {
    return (
      <ScreenWrapper>
        <Text style={styles.hero}>AI Assistant</Text>
        <AppCard>
          <Text style={styles.title}>
            Turn on the assistant to help with logging, summaries, reminders,
            and questions.
          </Text>
          <Text style={styles.muted}>
            Enable AI Assistant in Profile modules only if you want draft help.
          </Text>
        </AppCard>
      </ScreenWrapper>
    );
  }

  const sensitiveOff = settings
    ? ASSISTANT_CONSENT_CATEGORIES.filter(
        (category) =>
          category.sensitive &&
          !settings.sensitiveCategoryConsent[category.key],
      )
    : [];

  return (
    <ScreenWrapper>
      <View style={{ gap: 4 }}>
        <Text style={styles.eyebrow}>Draft-first, private by default</Text>
        <Text style={styles.hero}>AI Assistant</Text>
        <Text style={styles.muted}>
          Log, summarize, organize, search, and prepare questions without
          medical advice.
        </Text>
      </View>

      <AiDisclaimerCard />

      {settings ? (
        <ConsentCard onSave={saveSettings} settings={settings} />
      ) : null}

      {!settings?.assistantEnabled ? (
        <AppCard>
          <Text style={styles.title}>
            Choose what the assistant is allowed to help with.
          </Text>
          <Text style={styles.muted}>
            Sensitive categories default off. The assistant cannot use private
            data until you opt in.
          </Text>
        </AppCard>
      ) : (
        <>
          <AppCard backgroundColor="#eef2ff">
            <Text style={styles.title}>Active profile</Text>
            <Text style={styles.muted}>
              {activeProfile?.displayName ?? "Local profile"} • Private by
              default
            </Text>
            {sensitiveOff.length ? (
              <Text style={styles.small}>
                Sensitive categories still off:{" "}
                {sensitiveOff.map((item) => item.label).join(", ")}
              </Text>
            ) : null}
          </AppCard>

          <AssistantPromptCard
            mode={mode}
            onModeChange={setMode}
            onPromptChange={setPrompt}
            onSubmit={() => submitPrompt()}
            prompt={prompt}
          />

          <SuggestedPromptList
            onSelect={(item) => {
              setMode(item.mode);
              setPrompt(item.text);
              submitPrompt(item.text, item.mode);
            }}
          />

          {lastResult ? <AssistantResultCard result={lastResult} /> : null}

          {message ? (
            <AppCard backgroundColor="#ecfdf5">
              <Text style={{ color: "#047857", fontWeight: "900" }}>
                {message}
              </Text>
            </AppCard>
          ) : null}

          <DraftList
            drafts={drafts}
            onCancel={cancelDraft}
            onConfirm={confirmDraft}
          />
          <HistoryList messages={messages} />
        </>
      )}

      <AiCreateJobCard onCreated={loadAiScreen} />
      <LegacyJobs pendingJobs={pendingJobs} recentJobs={recentJobs} />

      <AppCard backgroundColor="#fff7ed">
        <Text style={styles.warning}>{GENERAL_FOOTER}</Text>
      </AppCard>
    </ScreenWrapper>
  );
}

function ConsentCard({
  onSave,
  settings,
}: {
  onSave: (partial: Partial<AssistantSettings>) => void;
  settings: AssistantSettings;
}) {
  function toggleCategory(
    category: (typeof ASSISTANT_CONSENT_CATEGORIES)[number],
  ) {
    const allowed = new Set(settings.allowedDataCategories);
    const isEnabled = allowed.has(category.key);

    if (isEnabled) {
      allowed.delete(category.key);
    } else {
      allowed.add(category.key);
    }

    onSave({
      allowedDataCategories: Array.from(allowed),
      sensitiveCategoryConsent: category.sensitive
        ? { ...settings.sensitiveCategoryConsent, [category.key]: !isEnabled }
        : settings.sensitiveCategoryConsent,
    });
  }

  return (
    <AppCard>
      <View style={{ gap: 12 }}>
        <Text style={styles.title}>Assistant consent</Text>
        <Text style={styles.muted}>
          The assistant can help you log, summarize, and organize health
          information. It does not diagnose, treat, prescribe, or replace
          healthcare professionals. You control what data it can use.
        </Text>
        <ToggleRow
          label="Assistant enabled"
          onPress={() =>
            onSave({ assistantEnabled: !settings.assistantEnabled })
          }
          value={settings.assistantEnabled}
        />
        <ToggleRow
          label="Allow assistant for quick logging"
          onPress={() =>
            onSave({ quickLoggingEnabled: !settings.quickLoggingEnabled })
          }
          value={settings.quickLoggingEnabled}
        />
        <ToggleRow
          label="Save assistant history summaries"
          onPress={() =>
            onSave({
              conversationHistoryEnabled: !settings.conversationHistoryEnabled,
            })
          }
          value={settings.conversationHistoryEnabled}
        />
        <Text style={styles.bold}>Data categories</Text>
        {ASSISTANT_CONSENT_CATEGORIES.map((category) => (
          <ToggleRow
            key={category.key}
            label={`${category.label}${category.sensitive ? " (sensitive)" : ""}`}
            onPress={() => toggleCategory(category)}
            value={settings.allowedDataCategories.includes(category.key)}
          />
        ))}
      </View>
    </AppCard>
  );
}

function AssistantPromptCard({
  mode,
  onModeChange,
  onPromptChange,
  onSubmit,
  prompt,
}: {
  mode: AssistantMode;
  onModeChange: (mode: AssistantMode) => void;
  onPromptChange: (value: string) => void;
  onSubmit: () => void;
  prompt: string;
}) {
  return (
    <AppCard>
      <View style={{ gap: 12 }}>
        <Text style={styles.title}>Ask or log</Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ gap: 8 }}
        >
          {ASSISTANT_MODES.map((item) => (
            <Chip
              key={item.key}
              label={item.label}
              onPress={() => onModeChange(item.key)}
              selected={mode === item.key}
            />
          ))}
        </ScrollView>
        <TextInput
          multiline
          onChangeText={onPromptChange}
          placeholder="Example: Log 2 eggs and toast for breakfast"
          placeholderTextColor="#94a3b8"
          style={styles.input}
          value={prompt}
        />
        <TouchableOpacity
          activeOpacity={0.85}
          onPress={onSubmit}
          style={styles.primaryButton}
        >
          <Text style={styles.primaryButtonText}>Create response or draft</Text>
        </TouchableOpacity>
      </View>
    </AppCard>
  );
}

function SuggestedPromptList({
  onSelect,
}: {
  onSelect: (item: (typeof SUGGESTED_PROMPTS)[number]) => void;
}) {
  return (
    <AppCard>
      <Text style={styles.title}>Suggested prompts</Text>
      <View
        style={{
          flexDirection: "row",
          flexWrap: "wrap",
          gap: 8,
          marginTop: 12,
        }}
      >
        {SUGGESTED_PROMPTS.map((item) => (
          <Chip
            key={`${item.mode}-${item.text}`}
            label={item.text}
            onPress={() => onSelect(item)}
            selected={false}
          />
        ))}
      </View>
    </AppCard>
  );
}

function AssistantResultCard({ result }: { result: AssistantRequestResult }) {
  return (
    <AppCard
      backgroundColor={result.actionType === "blocked" ? "#fff7ed" : "#f8fafc"}
    >
      <View style={{ gap: 10 }}>
        <Text style={styles.title}>
          {result.actionType === "blocked"
            ? "Assistant blocked this request"
            : "Assistant response"}
        </Text>
        <Text style={styles.muted}>{result.message}</Text>
        <Text style={styles.small}>
          Risk: {formatValue(result.riskCategory)}
        </Text>
        {result.sourceCards.length ? (
          <View style={{ gap: 8 }}>
            <Text style={styles.bold}>Sources</Text>
            {result.sourceCards.map((source) => (
              <View key={source.id} style={styles.sourceCard}>
                <Text style={styles.bold}>{source.title}</Text>
                <Text style={styles.small}>
                  {source.sourceOrganization} • Last checked{" "}
                  {source.lastCheckedDate ?? "Not set"}
                </Text>
                <Text style={styles.small}>{source.sourceUrl}</Text>
              </View>
            ))}
          </View>
        ) : result.actionType !== "blocked" ? (
          <Text style={styles.small}>
            No trusted source saved for this topic yet.
          </Text>
        ) : null}
        <Text style={styles.warning}>{result.safetyFooter}</Text>
      </View>
    </AppCard>
  );
}

function DraftList({
  drafts,
  onCancel,
  onConfirm,
}: {
  drafts: AssistantDraft[];
  onCancel: (id: string) => void;
  onConfirm: (id: string) => void;
}) {
  const activeDrafts = drafts.filter(
    (draft) => draft.status === "draft" || draft.status === "edited",
  );

  return (
    <View style={{ gap: 12 }}>
      <Text style={styles.sectionTitle}>Drafts pending review</Text>
      {activeDrafts.length ? (
        activeDrafts.map((draft) => (
          <AppCard key={draft.id}>
            <View style={{ gap: 10 }}>
              <Text style={styles.title}>Review before saving</Text>
              <Text style={styles.muted}>
                {formatValue(draft.targetRealm)} •{" "}
                {formatValue(draft.actionType)}
              </Text>
              {Object.entries(draft.draftPayload).map(([key, value]) => (
                <View key={key} style={styles.fieldRow}>
                  <Text style={styles.small}>{key}</Text>
                  <Text style={styles.muted}>{String(value)}</Text>
                </View>
              ))}
              <Text style={styles.warning}>
                Review and confirm before saving. AI suggestions may be
                incomplete or incorrect.
              </Text>
              <View style={{ flexDirection: "row", gap: 8 }}>
                <TouchableOpacity
                  activeOpacity={0.85}
                  onPress={() => onConfirm(draft.id)}
                  style={[styles.smallButton, { backgroundColor: "#7c3aed" }]}
                >
                  <Text style={{ color: "#ffffff", fontWeight: "900" }}>
                    Save
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  activeOpacity={0.85}
                  style={[styles.smallButton, { backgroundColor: "#f5f3ff" }]}
                >
                  <Text style={{ color: "#7c3aed", fontWeight: "900" }}>
                    Edit
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  activeOpacity={0.85}
                  onPress={() => onCancel(draft.id)}
                  style={[styles.smallButton, { backgroundColor: "#fff7ed" }]}
                >
                  <Text style={{ color: "#9a3412", fontWeight: "900" }}>
                    Cancel
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </AppCard>
        ))
      ) : (
        <AppCard>
          <Text style={styles.muted}>No assistant drafts yet.</Text>
        </AppCard>
      )}
    </View>
  );
}

function HistoryList({ messages }: { messages: AssistantMessage[] }) {
  return (
    <View style={{ gap: 12 }}>
      <Text style={styles.sectionTitle}>Assistant history</Text>
      {messages.length ? (
        messages.slice(0, 5).map((item) => (
          <AppCard key={item.id}>
            <Text style={styles.bold}>
              {formatValue(item.role)} • {formatValue(item.mode)}
            </Text>
            <Text style={styles.muted}>
              {item.contentSummary ?? "Saved summary"}
            </Text>
          </AppCard>
        ))
      ) : (
        <AppCard>
          <Text style={styles.muted}>Your assistant history is empty.</Text>
        </AppCard>
      )}
    </View>
  );
}

function LegacyJobs({
  pendingJobs,
  recentJobs,
}: {
  pendingJobs: AiJob[];
  recentJobs: AiJob[];
}) {
  return (
    <View style={{ gap: 12 }}>
      <Text style={styles.sectionTitle}>Document extraction drafts</Text>
      {pendingJobs.length ? (
        pendingJobs.map((job) => <AiJobCard key={job.id} job={job} />)
      ) : (
        <AppCard>
          <Text style={styles.muted}>
            No AI drafts yet. Start with a report, label, food photo or note.
          </Text>
        </AppCard>
      )}
      {recentJobs.length ? (
        <TouchableOpacity
          activeOpacity={0.85}
          onPress={() => router.push("/ai" as Href)}
          style={styles.secondaryButton}
        >
          <Text style={{ color: "#7c3aed", fontWeight: "900" }}>
            Recent jobs: {recentJobs.length}
          </Text>
        </TouchableOpacity>
      ) : null}
    </View>
  );
}

function ToggleRow({
  label,
  onPress,
  value,
}: {
  label: string;
  onPress: () => void;
  value: boolean;
}) {
  return (
    <TouchableOpacity
      activeOpacity={0.85}
      onPress={onPress}
      style={styles.toggle}
    >
      <Text style={styles.bold}>{label}</Text>
      <Text style={styles.small}>{value ? "On" : "Off"}</Text>
    </TouchableOpacity>
  );
}

function Chip({
  label,
  onPress,
  selected,
}: {
  label: string;
  onPress: () => void;
  selected: boolean;
}) {
  return (
    <TouchableOpacity
      activeOpacity={0.85}
      onPress={onPress}
      style={[styles.chip, selected ? styles.chipSelected : null]}
    >
      <Text
        style={{ color: selected ? "#ffffff" : "#475569", fontWeight: "900" }}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );
}

function toAssistantMode(value?: string | string[]): AssistantMode {
  const mode = Array.isArray(value) ? value[0] : value;
  return ASSISTANT_MODES.some((item) => item.key === mode)
    ? (mode as AssistantMode)
    : "general_health";
}

function stringParam(value?: string | string[]) {
  return Array.isArray(value) ? (value[0] ?? "") : (value ?? "");
}

function formatValue(value: string) {
  return value
    .replace(/_/g, " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

const styles = {
  bold: { color: "#0f172a", fontWeight: "900" as const },
  chip: {
    backgroundColor: "#ffffff",
    borderColor: "#e2e8f0",
    borderRadius: 999,
    borderWidth: 1,
    paddingHorizontal: 13,
    paddingVertical: 9,
  },
  chipSelected: { backgroundColor: "#7c3aed", borderColor: "#7c3aed" },
  eyebrow: { color: "#64748b", fontSize: 14, fontWeight: "800" as const },
  fieldRow: { backgroundColor: "#f8fafc", borderRadius: 14, padding: 10 },
  hero: { color: "#0f172a", fontSize: 30, fontWeight: "900" as const },
  input: {
    backgroundColor: "#f8fafc",
    borderColor: "#e2e8f0",
    borderRadius: 18,
    borderWidth: 1,
    color: "#0f172a",
    minHeight: 96,
    paddingHorizontal: 14,
    paddingTop: 13,
  },
  muted: { color: "#64748b", lineHeight: 21 },
  primaryButton: {
    alignItems: "center" as const,
    backgroundColor: "#7c3aed",
    borderRadius: 18,
    justifyContent: "center" as const,
    minHeight: 52,
  },
  primaryButtonText: { color: "#ffffff", fontWeight: "900" as const },
  secondaryButton: {
    alignItems: "center" as const,
    backgroundColor: "#f5f3ff",
    borderRadius: 18,
    justifyContent: "center" as const,
    minHeight: 48,
  },
  sectionTitle: { color: "#0f172a", fontSize: 22, fontWeight: "900" as const },
  small: { color: "#64748b", fontSize: 12, lineHeight: 18 },
  smallButton: {
    alignItems: "center" as const,
    borderRadius: 14,
    flex: 1,
    justifyContent: "center" as const,
    minHeight: 44,
  },
  sourceCard: { backgroundColor: "#ffffff", borderRadius: 14, padding: 10 },
  title: { color: "#0f172a", fontSize: 20, fontWeight: "900" as const },
  toggle: { backgroundColor: "#f8fafc", borderRadius: 16, padding: 12 },
  warning: { color: "#9a3412", lineHeight: 20 },
};
