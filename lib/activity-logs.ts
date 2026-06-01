import { supabase } from "@/lib/supabase";

export const activityTypes = [
  "feed",
  "nap",
  "medication",
  "bathroom",
  "mood",
  "activity",
  "incident",
  "photo_update",
  "note",
  "emergency"
] as const;

export type ActivityType = (typeof activityTypes)[number];

export type ActivityLog = {
  id: string;
  child_id: string;
  family_id: string;
  created_by: string;
  activity_type: ActivityType;
  title: string;
  note: string | null;
  privacy_level: string | null;
  notification_type: string | null;
  is_shared_with_parents: boolean | null;
  is_shared_with_caregiver: boolean | null;
  created_at: string;
};

export type ActivityPhoto = {
  id: string;
  activity_log_id: string;
  uploaded_by: string;
  storage_path: string;
  created_at: string;
};

export type CreateActivityLogInput = {
  childId: string;
  familyId: string;
  activityType: ActivityType;
  title: string;
  note?: string;
  privacyLevel?: string;
  notificationType?: string;
  isSharedWithParents?: boolean;
  isSharedWithCaregiver?: boolean;
};

export type CreateActivityPhotoInput = {
  activityLogId: string;
  storagePath: string;
};

function cleanText(value: string) {
  return value.trim();
}

function cleanOptional(value?: string) {
  const nextValue = value?.trim();
  return nextValue ? nextValue : null;
}

function assertActivityType(activityType: ActivityType) {
  if (!activityTypes.includes(activityType)) {
    throw new Error("Unsupported activity type.");
  }
}

export async function createActivityLog(input: CreateActivityLogInput) {
  assertActivityType(input.activityType);

  const {
    data: { user },
    error: userError
  } = await supabase.auth.getUser();

  if (userError) {
    throw userError;
  }

  if (!user) {
    throw new Error("You must be signed in to create activity logs.");
  }

  const title = cleanText(input.title);

  if (!title) {
    throw new Error("Enter an activity title.");
  }

  const { data, error } = await supabase
    .from("activity_logs")
    .insert({
      activity_type: input.activityType,
      child_id: input.childId,
      created_by: user.id,
      family_id: input.familyId,
      is_shared_with_caregiver: input.isSharedWithCaregiver ?? false,
      is_shared_with_parents: input.isSharedWithParents ?? true,
      note: cleanOptional(input.note),
      notification_type: input.notificationType ?? "green_normal_update",
      privacy_level: input.privacyLevel ?? "family_shared",
      title
    })
    .select("*")
    .single();

  if (error) {
    throw error;
  }

  return data as ActivityLog;
}

export async function listActivityLogsForChild(childId: string | null | undefined) {
  if (!childId) {
    return [];
  }

  const { data, error } = await supabase
    .from("activity_logs")
    .select("*")
    .eq("child_id", childId)
    .order("created_at", { ascending: false });

  if (error) {
    throw error;
  }

  return (data ?? []) as ActivityLog[];
}

export async function createActivityPhoto(input: CreateActivityPhotoInput) {
  const {
    data: { user },
    error: userError
  } = await supabase.auth.getUser();

  if (userError) {
    throw userError;
  }

  if (!user) {
    throw new Error("You must be signed in to attach activity photos.");
  }

  const storagePath = cleanText(input.storagePath);

  if (!storagePath) {
    throw new Error("Enter a storage path.");
  }

  const { data, error } = await supabase
    .from("activity_photos")
    .insert({
      activity_log_id: input.activityLogId,
      storage_path: storagePath,
      uploaded_by: user.id
    })
    .select("*")
    .single();

  if (error) {
    throw error;
  }

  return data as ActivityPhoto;
}
