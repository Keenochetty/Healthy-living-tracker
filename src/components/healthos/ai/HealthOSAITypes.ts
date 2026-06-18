import type { AiChatSource } from "@/lib/aiBackend";
import type {
  HealthOSAIImportEnvelope,
  HealthOSAIImportTarget,
  HealthOSAIImportType,
} from "@/features/aiImport";

export type HealthOSAIMessageRole = "assistant" | "system" | "user";

export type HealthOSAIMessageStatus = "draft" | "error" | "sent" | "sending";

export type HealthOSAIResultCardType =
  | "calendar"
  | "document"
  | "health_plan"
  | "medication"
  | "nutrition"
  | "recipe"
  | "workout"
  | "general";

export type HealthOSAIConversationContext = {
  attachedDataCategories: string[];
  contextLabel: string;
  dataAccessStatus: "none" | "pending_user_consent" | "limited";
  routeContext?: string;
};

export type HealthOSAIMessage = {
  content: string;
  createdAt: string;
  envelope?: HealthOSAIImportEnvelope | null;
  id: string;
  role: HealthOSAIMessageRole;
  sources?: AiChatSource[];
  status: HealthOSAIMessageStatus;
};

export type HealthOSAIResultCardModel = {
  confidenceLabel?: string;
  envelope: HealthOSAIImportEnvelope;
  id: string;
  importType: HealthOSAIImportType;
  summary: string;
  target: HealthOSAIImportTarget;
  title: string;
  type: HealthOSAIResultCardType;
};

export type HealthOSAIConversationRowItem = {
  id: string;
  subtitle: string;
  title: string;
  updatedAt: string;
};
