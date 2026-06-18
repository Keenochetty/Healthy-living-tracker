import { useCallback, useMemo, useState } from "react";

import { askAIWithSources } from "@/lib/aiBackend";
import { normalizeChatResultToEnvelope } from "@/features/aiImport";

import type {
  HealthOSAIConversationContext,
  HealthOSAIMessage,
  HealthOSAIResultCardModel,
  HealthOSAIResultCardType,
} from "./HealthOSAITypes";
import { useHealthOSAIHistory } from "./useHealthOSAIHistory";

const STARTER_MESSAGES: HealthOSAIMessage[] = [
  {
    content:
      "Ask a question, search health content, or request a plan. If I detect something importable, I will create a review-only preview.",
    createdAt: new Date().toISOString(),
    id: "assistant-welcome",
    role: "assistant",
    status: "sent",
  },
];

export function useHealthOSAIChat(context: HealthOSAIConversationContext) {
  const history = useHealthOSAIHistory();
  const [input, setInput] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [messages, setMessages] = useState<HealthOSAIMessage[]>(STARTER_MESSAGES);
  const [resultCards, setResultCards] = useState<HealthOSAIResultCardModel[]>([]);
  const [reviewCardId, setReviewCardId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const activeReviewEnvelope = useMemo(
    () => resultCards.find((card) => card.id === reviewCardId)?.envelope ?? null,
    [resultCards, reviewCardId],
  );

  const sendMessage = useCallback(
    async (text?: string) => {
      const prompt = (text ?? input).trim();
      if (!prompt || isSending) return;

      const userMessage = createMessage(prompt, "user", "sent");
      setInput("");
      setError(null);
      setIsSending(true);
      setMessages((current) => [...current, userMessage]);
      void history.recordMessage(userMessage);

      try {
        const response = await askAIWithSources(
          prompt,
          {
            attachedDataCategories: context.attachedDataCategories,
            contextLabel: context.contextLabel,
            dataAccessStatus: context.dataAccessStatus,
            instruction:
              "Answer inside HealthOS. Return structured importPayload only when the result should be reviewed before importing.",
          },
          "text",
        );

        const envelope = response.importPayload
          ? normalizeChatResultToEnvelope(response.importPayload, {
              sourceName: "HealthOS AI chat",
              sourceType: "ai_chat",
            })
          : null;
        const assistantMessage = createMessage(response.reply, "assistant", "sent", envelope, response.sources);

        setMessages((current) => [...current, assistantMessage]);
        void history.recordMessage(assistantMessage);

        if (envelope) {
          setResultCards((current) => [toResultCard(envelope), ...current].slice(0, 6));
        }
      } catch (sendError) {
        const message =
          sendError instanceof Error
            ? sendError.message
            : "HealthOS AI could not answer right now.";
        setError(message);
        setMessages((current) => [
          ...current,
          createMessage(
            "I could not reach the secure AI backend. You can still use Scan and manual imports.",
            "assistant",
            "error",
          ),
        ]);
      } finally {
        setIsSending(false);
      }
    },
    [context, history, input, isSending],
  );

  return {
    activeReviewEnvelope,
    conversations: history.conversations,
    error,
    input,
    isSending,
    messages,
    openReview: setReviewCardId,
    resultCards,
    sendMessage,
    setInput,
  };
}

function createMessage(
  content: string,
  role: HealthOSAIMessage["role"],
  status: HealthOSAIMessage["status"],
  envelope: HealthOSAIMessage["envelope"] = null,
  sources: HealthOSAIMessage["sources"] = [],
): HealthOSAIMessage {
  return {
    content,
    createdAt: new Date().toISOString(),
    envelope,
    id: `${role}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    role,
    sources,
    status,
  };
}

function toResultCard(envelope: NonNullable<HealthOSAIMessage["envelope"]>): HealthOSAIResultCardModel {
  return {
    confidenceLabel: envelope.confidence.label,
    envelope,
    id: envelope.importId,
    importType: envelope.detectedType,
    summary: envelope.summary ?? "Review this AI result before importing.",
    target: envelope.primaryTarget ?? envelope.suggestedTargets[0] ?? "records",
    title: envelope.title,
    type: mapType(envelope.detectedType),
  };
}

function mapType(type: string): HealthOSAIResultCardType {
  if (type.includes("workout") || type.includes("exercise")) return "workout";
  if (type.includes("meal") || type.includes("food") || type.includes("grocery")) return "nutrition";
  if (type.includes("recipe")) return "recipe";
  if (type.includes("medication") || type.includes("supplement") || type.includes("prescription")) return "medication";
  if (type.includes("record") || type.includes("lab") || type.includes("document")) return "document";
  if (type.includes("calendar")) return "calendar";
  if (type.includes("plan")) return "health_plan";
  return "general";
}
