"use server";

import OpenAI from "openai";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { caregiverActivityTypes, documentCategories, genders, notificationUrgencies, privacyLevels, profileTypes, trackingCategories } from "@/lib/health/constants";
import { ensureDefaultFamily } from "@/lib/health/data";
import type { ActionState } from "@/lib/health/types";

const ok = (message: string): ActionState => ({ status: "success", message });
const fail = (message: string): ActionState => ({ status: "error", message });

function db(client: Awaited<ReturnType<typeof ensureDefaultFamily>>["supabase"]) {
  return client as any;
}

function nullableText(value: FormDataEntryValue | null) {
  const text = typeof value === "string" ? value.trim() : "";
  return text.length > 0 ? text : null;
}

function revalidateApp() {
  ["/dashboard", "/family", "/my-health", "/track", "/pregnancy", "/baby-child", "/caregiver", "/calendar", "/documents", "/ai-health", "/reminders", "/profile"].forEach(
    (path) => revalidatePath(path)
  );
}

const familyMemberSchema = z.object({
  name: z.string().trim().min(1, "Name is required."),
  relationship: z.string().trim().optional(),
  profile_type: z.enum(profileTypes),
  date_of_birth: z.string().optional(),
  gender: z.enum(genders).optional().or(z.literal("")),
  allergies: z.string().optional(),
  medical_notes: z.string().optional(),
  doctor_details: z.string().optional(),
  emergency_notes: z.string().optional()
});

export async function createFamilyMemberAction(_state: ActionState, formData: FormData): Promise<ActionState> {
  const parsed = familyMemberSchema.safeParse({
    name: formData.get("name"),
    relationship: formData.get("relationship"),
    profile_type: formData.get("profile_type"),
    date_of_birth: formData.get("date_of_birth"),
    gender: formData.get("gender"),
    allergies: formData.get("allergies"),
    medical_notes: formData.get("medical_notes"),
    doctor_details: formData.get("doctor_details"),
    emergency_notes: formData.get("emergency_notes")
  });

  if (!parsed.success) return fail(parsed.error.issues[0]?.message ?? "Check the family member details.");

  const { supabase, family } = await ensureDefaultFamily();
  const { error } = await db(supabase).from("family_members").insert({
    family_id: family.id,
    name: parsed.data.name,
    relationship: nullableText(formData.get("relationship")),
    profile_type: parsed.data.profile_type,
    date_of_birth: nullableText(formData.get("date_of_birth")),
    gender: nullableText(formData.get("gender")),
    allergies: nullableText(formData.get("allergies")),
    medical_notes: nullableText(formData.get("medical_notes")),
    doctor_details: nullableText(formData.get("doctor_details")),
    emergency_notes: nullableText(formData.get("emergency_notes"))
  });

  if (error) return fail(error.message);
  revalidateApp();
  return ok("Family member created.");
}

const healthLogSchema = z.object({
  family_member_id: z.string().uuid("Select a family member."),
  category: z.enum(trackingCategories),
  title: z.string().trim().min(1, "Title is required."),
  notes: z.string().optional(),
  severity: z.coerce.number().min(0).max(10).optional().or(z.literal("")),
  logged_at: z.string().optional(),
  privacy_level: z.enum(privacyLevels).optional()
});

export async function createHealthLogAction(_state: ActionState, formData: FormData): Promise<ActionState> {
  const parsed = healthLogSchema.safeParse({
    family_member_id: formData.get("family_member_id"),
    category: formData.get("category"),
    title: formData.get("title"),
    notes: formData.get("notes"),
    severity: formData.get("severity"),
    logged_at: formData.get("logged_at"),
    privacy_level: formData.get("privacy_level") || "family_shared"
  });

  if (!parsed.success) return fail(parsed.error.issues[0]?.message ?? "Check the log details.");

  const { supabase, user, family } = await ensureDefaultFamily();
  const { error } = await db(supabase).from("health_logs").insert({
    family_id: family.id,
    family_member_id: parsed.data.family_member_id,
    created_by_user_id: user.id,
    category: parsed.data.category,
    title: parsed.data.title,
    notes: nullableText(formData.get("notes")),
    severity: parsed.data.severity === "" ? null : parsed.data.severity,
    privacy_level: parsed.data.privacy_level ?? "family_shared",
    logged_at: nullableText(formData.get("logged_at")) ?? new Date().toISOString(),
    payload: {
      blood_pressure: nullableText(formData.get("blood_pressure")),
      weight: nullableText(formData.get("weight")),
      mood: nullableText(formData.get("mood")),
      pain_level: nullableText(formData.get("pain_level"))
    }
  });

  if (error) return fail(error.message);
  revalidateApp();
  return ok("Health log added.");
}

const caregiverActivitySchema = z.object({
  child_id: z.string().uuid("Select a child."),
  activity_type: z.enum(caregiverActivityTypes),
  urgency: z.enum(notificationUrgencies),
  title: z.string().trim().min(1, "Title is required."),
  notes: z.string().optional(),
  logged_at: z.string().optional(),
  share_with_parents: z.string().optional()
});

export async function createCaregiverActivityAction(_state: ActionState, formData: FormData): Promise<ActionState> {
  const parsed = caregiverActivitySchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return fail(parsed.error.issues[0]?.message ?? "Check the caregiver activity details.");

  const { supabase, user, family } = await ensureDefaultFamily();
  const anySupabase = db(supabase);
  const shareWithParents = formData.get("share_with_parents") !== "off";

  const { data: log, error } = await anySupabase
    .from("activity_logs")
    .insert({
      family_id: family.id,
      child_id: parsed.data.child_id,
      created_by_user_id: user.id,
      actor_profile_mode: "work",
      activity_type: parsed.data.activity_type,
      urgency: parsed.data.urgency,
      privacy_level: "caregiver_shared",
      title: parsed.data.title,
      notes: nullableText(formData.get("notes")),
      share_with_parents: shareWithParents,
      logged_at: nullableText(formData.get("logged_at")) ?? new Date().toISOString()
    })
    .select("id")
    .single();

  if (error) return fail(error.message);

  if (shareWithParents) {
    const { data: recipients } = await anySupabase
      .from("family_memberships")
      .select("user_id")
      .eq("family_id", family.id)
      .in("role", ["owner", "admin"]);

    const notifications = (recipients ?? []).map((recipient: { user_id: string }) => ({
      family_id: family.id,
      recipient_user_id: recipient.user_id,
      actor_user_id: user.id,
      child_id: parsed.data.child_id,
      activity_log_id: log?.id ?? null,
      urgency: parsed.data.urgency,
      title: parsed.data.title,
      message: nullableText(formData.get("notes")) ?? "Caregiver activity update."
    }));

    if (notifications.length > 0) {
      await anySupabase.from("notifications").insert(notifications);
    }
  }

  revalidateApp();
  return ok("Caregiver activity logged.");
}

const medicineSchema = z.object({
  family_member_id: z.string().uuid("Select a family member."),
  medicine_name: z.string().trim().min(1, "Medicine name is required."),
  dosage: z.string().optional(),
  taken_at: z.string().optional(),
  next_dose_at: z.string().optional(),
  notes: z.string().optional()
});

export async function createMedicineLogAction(_state: ActionState, formData: FormData): Promise<ActionState> {
  const parsed = medicineSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return fail(parsed.error.issues[0]?.message ?? "Check the medicine details.");

  const { supabase, user, family } = await ensureDefaultFamily();
  const { error } = await db(supabase).from("medicine_logs").insert({
    family_id: family.id,
    family_member_id: parsed.data.family_member_id,
    created_by_user_id: user.id,
    medicine_name: parsed.data.medicine_name,
    dosage: nullableText(formData.get("dosage")),
    taken_at: nullableText(formData.get("taken_at")) ?? new Date().toISOString(),
    next_dose_at: nullableText(formData.get("next_dose_at")),
    notes: nullableText(formData.get("notes"))
  });

  if (error) return fail(error.message);
  revalidateApp();
  return ok("Medicine log added.");
}

const temperatureSchema = z.object({
  family_member_id: z.string().uuid("Select a family member."),
  temperature_c: z.coerce.number().min(30).max(45),
  measured_at: z.string().optional(),
  method: z.string().optional(),
  notes: z.string().optional()
});

export async function createTemperatureLogAction(_state: ActionState, formData: FormData): Promise<ActionState> {
  const parsed = temperatureSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return fail(parsed.error.issues[0]?.message ?? "Check the temperature details.");

  const { supabase, user, family } = await ensureDefaultFamily();
  const { error } = await db(supabase).from("temperature_logs").insert({
    family_id: family.id,
    family_member_id: parsed.data.family_member_id,
    created_by_user_id: user.id,
    temperature_c: parsed.data.temperature_c,
    measured_at: nullableText(formData.get("measured_at")) ?? new Date().toISOString(),
    method: nullableText(formData.get("method")),
    notes: nullableText(formData.get("notes"))
  });

  if (error) return fail(error.message);
  revalidateApp();
  return ok("Temperature logged.");
}

const doctorVisitSchema = z.object({
  family_member_id: z.string().uuid("Select a family member."),
  doctor_name: z.string().optional(),
  visit_at: z.string().min(1, "Visit date is required."),
  reason: z.string().trim().min(1, "Reason is required."),
  notes: z.string().optional(),
  follow_up_at: z.string().optional()
});

export async function createDoctorVisitAction(_state: ActionState, formData: FormData): Promise<ActionState> {
  const parsed = doctorVisitSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return fail(parsed.error.issues[0]?.message ?? "Check the visit details.");

  const { supabase, user, family } = await ensureDefaultFamily();
  const { error } = await db(supabase).from("doctor_visits").insert({
    family_id: family.id,
    family_member_id: parsed.data.family_member_id,
    created_by_user_id: user.id,
    doctor_name: nullableText(formData.get("doctor_name")),
    visit_at: parsed.data.visit_at,
    reason: parsed.data.reason,
    notes: nullableText(formData.get("notes")),
    follow_up_at: nullableText(formData.get("follow_up_at"))
  });

  if (error) return fail(error.message);
  revalidateApp();
  return ok("Doctor visit added.");
}

const reminderSchema = z.object({
  family_member_id: z.string().uuid().optional().or(z.literal("")),
  title: z.string().trim().min(1, "Title is required."),
  reminder_type: z.string().trim().min(1, "Reminder type is required."),
  due_at: z.string().min(1, "Due date is required."),
  notes: z.string().optional()
});

export async function createReminderAction(_state: ActionState, formData: FormData): Promise<ActionState> {
  const parsed = reminderSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return fail(parsed.error.issues[0]?.message ?? "Check the reminder details.");

  const { supabase, user, family } = await ensureDefaultFamily();
  const { error } = await db(supabase).from("reminders").insert({
    family_id: family.id,
    family_member_id: nullableText(formData.get("family_member_id")),
    created_by_user_id: user.id,
    title: parsed.data.title,
    reminder_type: parsed.data.reminder_type,
    due_at: parsed.data.due_at,
    notes: nullableText(formData.get("notes"))
  });

  if (error) return fail(error.message);
  revalidateApp();
  return ok("Reminder created.");
}

export async function uploadDocumentAction(_state: ActionState, formData: FormData): Promise<ActionState> {
  const familyMemberId = String(formData.get("family_member_id") ?? "");
  const category = String(formData.get("category") ?? "");
  const file = formData.get("file");

  if (!z.string().uuid().safeParse(familyMemberId).success) return fail("Select a family member.");
  if (!z.enum(documentCategories).safeParse(category).success) return fail("Select a document category.");
  if (!(file instanceof File) || file.size === 0) return fail("Choose a file to upload.");

  const { supabase, user, family } = await ensureDefaultFamily();
  const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "-");
  const storagePath = `${family.id}/${familyMemberId}/${crypto.randomUUID()}-${safeName}`;

  const upload = await supabase.storage.from("medical-documents").upload(storagePath, file, {
    contentType: file.type || "application/octet-stream",
    upsert: false
  });

  if (upload.error) return fail(upload.error.message);

  const { error } = await db(supabase).from("documents").insert({
    family_id: family.id,
    family_member_id: familyMemberId,
    created_by_user_id: user.id,
    uploaded_by_user_id: user.id,
    category,
    storage_path: storagePath,
    file_name: file.name,
    content_type: file.type || null,
    file_size: file.size,
    notes: nullableText(formData.get("notes"))
  });

  if (error) return fail(error.message);
  revalidateApp();
  return ok("Document uploaded.");
}

const aiPromptSchema = z.object({
  family_member_id: z.string().uuid().optional().or(z.literal("")),
  chat_id: z.string().uuid().optional().or(z.literal("")),
  message: z.string().trim().min(1, "Enter a question."),
  category_filter: z.string().optional(),
  attachment_document_id: z.string().uuid().optional().or(z.literal(""))
});

const medicalDisclaimer =
  "Medical disclaimer: This is educational information only and is not a diagnosis, prescription, or substitute for professional medical care. Seek urgent medical help for emergency symptoms.";

export async function askAiHealthAction(_state: ActionState, formData: FormData): Promise<ActionState> {
  const parsed = aiPromptSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return fail(parsed.error.issues[0]?.message ?? "Check your question.");

  if (!process.env.OPENAI_API_KEY) {
    return fail("OPENAI_API_KEY is not configured. ChatGPT Free cannot be used as an app API backend.");
  }

  const { supabase, user, family } = await ensureDefaultFamily();
  const anySupabase = db(supabase);
  let chatId = parsed.data.chat_id || null;

  if (!chatId) {
    const { data: chat, error } = await anySupabase
      .from("ai_chats")
      .insert({
        family_id: family.id,
        family_member_id: nullableText(formData.get("family_member_id")),
        created_by_user_id: user.id,
        title: parsed.data.message.slice(0, 60),
        category_filters: parsed.data.category_filter ? [parsed.data.category_filter] : []
      })
      .select("id")
      .single();
    if (error) return fail(error.message);
    chatId = chat.id;
  }

  await anySupabase.from("ai_messages").insert({
    chat_id: chatId,
    family_id: family.id,
    family_member_id: nullableText(formData.get("family_member_id")),
    created_by_user_id: user.id,
    role: "user",
    content: parsed.data.message,
    attachment_document_id: nullableText(formData.get("attachment_document_id"))
  });

  const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  const response = await openai.responses.create({
    model: process.env.OPENAI_MODEL ?? "gpt-4o-mini",
    instructions:
      "You are an educational family health assistant. Never diagnose, prescribe medication, replace a doctor, or minimize emergency symptoms. Always advise professional medical care for worrying or emergency symptoms. Always include the required medical disclaimer.",
    input: `Family context: ${family.name}. User question: ${parsed.data.message}\n\nRequired disclaimer: ${medicalDisclaimer}`
  });

  const answer = `${response.output_text.trim()}\n\n${medicalDisclaimer}`;

  const { error } = await anySupabase.from("ai_messages").insert({
    chat_id: chatId,
    family_id: family.id,
    family_member_id: nullableText(formData.get("family_member_id")),
    created_by_user_id: user.id,
    role: "assistant",
    content: answer
  });

  if (error) return fail(error.message);
  revalidatePath("/ai-health");
  return ok("AI response added.");
}
