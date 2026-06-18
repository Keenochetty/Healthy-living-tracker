import { useCallback, useEffect, useState } from "react";

import {
  createAssistantConversation,
  createAssistantMessage,
  getAssistantMessages,
} from "@/lib/assistantStorage";
import type { AssistantConversation, AssistantMode } from "@/types/assistant";

import type { HealthOSAIConversationRowItem, HealthOSAIMessage } from "./HealthOSAITypes";

export function useHealthOSAIHistory(mode: AssistantMode = "general_health") {
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  const [conversations, setConversations] = useState<HealthOSAIConversationRowItem[]>([]);
  const [storedMessages, setStoredMessages] = useState<HealthOSAIMessage[]>([]);

  const refresh = useCallback(async () => {
    const messages = await getAssistantMessages();
    const rows = buildRows(messages);
    setConversations(rows);
    setStoredMessages(
      messages.slice(-20).map((message) => ({
        content: message.contentSummary ?? message.contentEncrypted ?? "",
        createdAt: message.createdAt,
        id: message.id,
        role: message.role,
        status: "sent",
      })),
    );
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const ensureConversation = useCallback(
    async (title: string) => {
      if (activeConversationId) return activeConversationId;
      const conversation: AssistantConversation = await createAssistantConversation({
        mode,
        title: title.slice(0, 72) || "HealthOS AI chat",
      });
      setActiveConversationId(conversation.id);
      await refresh();
      return conversation.id;
    },
    [activeConversationId, mode, refresh],
  );

  const recordMessage = useCallback(
    async (message: HealthOSAIMessage) => {
      const conversationId = await ensureConversation(message.content);
      await createAssistantMessage({
        contentSummary: message.content.slice(0, 500),
        conversationId,
        mode,
        riskCategory: "low_risk",
        role: message.role === "system" ? "system" : message.role,
      });
      await refresh();
    },
    [ensureConversation, mode, refresh],
  );

  return {
    activeConversationId,
    conversations,
    recordMessage,
    refreshHistory: refresh,
    storedMessages,
  };
}

function buildRows(
  messages: Awaited<ReturnType<typeof getAssistantMessages>>,
): HealthOSAIConversationRowItem[] {
  const grouped = new Map<string, typeof messages>();
  messages.forEach((message) => {
    const list = grouped.get(message.conversationId) ?? [];
    list.push(message);
    grouped.set(message.conversationId, list);
  });

  return Array.from(grouped.entries())
    .map(([id, list]) => {
      const latest = list[list.length - 1];
      const firstUser = list.find((message) => message.role === "user");
      return {
        id,
        subtitle: latest?.contentSummary ?? "Recent HealthOS AI conversation",
        title: firstUser?.contentSummary?.slice(0, 60) || "HealthOS AI chat",
        updatedAt: latest?.createdAt ?? new Date().toISOString(),
      };
    })
    .sort((left, right) => new Date(right.updatedAt).getTime() - new Date(left.updatedAt).getTime())
    .slice(0, 6);
}
