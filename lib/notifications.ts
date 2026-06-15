import {
  getNotificationColorToken,
  notificationTypes as notificationTypeTokens,
  type NotificationType,
} from "@/constants/notification-colors";
import { supabase } from "@/lib/supabase";

export const notificationTypes = [
  notificationTypeTokens.greenNormalUpdate,
  notificationTypeTokens.blueCalendarActivity,
  notificationTypeTokens.yellowAttention,
  notificationTypeTokens.orangeImportantHealth,
  notificationTypeTokens.redEmergency,
  notificationTypeTokens.purpleAiSuggestion,
  notificationTypeTokens.greySystem,
] as const;

export type AppNotification = {
  id: string;
  recipient_profile_id: string;
  sender_profile_id: string | null;
  family_id: string | null;
  child_id: string | null;
  type: NotificationType;
  title: string;
  safe_preview: string;
  full_message: string | null;
  is_sensitive: boolean | null;
  requires_action: boolean | null;
  action_type: string | null;
  is_read: boolean | null;
  created_at: string;
};

export type CreateNotificationInput = {
  recipientProfileId: string;
  type: NotificationType;
  title: string;
  safePreview: string;
  fullMessage?: string;
  isSensitive?: boolean;
  requiresAction?: boolean;
  actionType?: string;
  familyId?: string;
  childId?: string;
  senderProfileId?: string;
};

function cleanText(value: string) {
  return value.trim();
}

function cleanOptionalText(value?: string) {
  const nextValue = value?.trim();
  return nextValue ? nextValue : null;
}

function assertNotificationType(type: NotificationType) {
  if (!notificationTypes.includes(type)) {
    throw new Error("Unsupported notification type.");
  }
}

export function getNotificationColour(type: NotificationType) {
  return getNotificationColorToken(type);
}

export function getSafePreview(
  notification: Pick<AppNotification, "safe_preview" | "title">,
) {
  const preview = notification.safe_preview?.trim();
  return preview || notification.title;
}

export async function createNotification(input: CreateNotificationInput) {
  assertNotificationType(input.type);

  const title = cleanText(input.title);
  const safePreview = cleanText(input.safePreview);

  if (!title || !safePreview) {
    throw new Error("Notifications need a title and safe preview.");
  }

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError) {
    throw userError;
  }

  if (!user) {
    throw new Error("You must be signed in to create notifications.");
  }

  const { data, error } = await supabase
    .from("notifications")
    .insert({
      action_type: cleanOptionalText(input.actionType),
      child_id: input.childId ?? null,
      family_id: input.familyId ?? null,
      full_message: cleanOptionalText(input.fullMessage),
      is_sensitive: input.isSensitive ?? false,
      recipient_profile_id: input.recipientProfileId,
      requires_action: input.requiresAction ?? false,
      safe_preview: safePreview,
      sender_profile_id: input.senderProfileId ?? user.id,
      title,
      type: input.type,
    })
    .select("*")
    .single();

  if (error) {
    throw error;
  }

  return data as AppNotification;
}

export async function markNotificationRead(notificationId: string) {
  const { data, error } = await supabase
    .from("notifications")
    .update({
      is_read: true,
    })
    .eq("id", notificationId)
    .select("*")
    .single();

  if (error) {
    throw error;
  }

  return data as AppNotification;
}

export async function listNotificationsForProfile(
  profileId: string | null | undefined,
) {
  if (!profileId) {
    return [];
  }

  const { data, error } = await supabase
    .from("notifications")
    .select("*")
    .eq("recipient_profile_id", profileId)
    .order("created_at", { ascending: false });

  if (error) {
    throw error;
  }

  return (data ?? []) as AppNotification[];
}
