import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type {
  AiChat,
  AppData,
  AppNotification,
  ActivityLog,
  CalendarEvent,
  CareInstruction,
  CaregiverChildAccess,
  DoctorVisit,
  DocumentRecord,
  EmergencyContact,
  Family,
  FamilyMember,
  HealthLog,
  MedicineLog,
  Reminder,
  TemperatureLog,
} from "@/lib/health/types";

function db(client: Awaited<ReturnType<typeof createClient>>) {
  return client as any;
}

export async function getCurrentUser() {
  const supabase = await createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    redirect("/login");
  }

  return { supabase, user };
}

export async function ensureDefaultFamily() {
  const { supabase, user } = await getCurrentUser();
  const anySupabase = db(supabase);

  const { data: profile } = await anySupabase
    .from("profiles")
    .select("default_family_id, full_name, email")
    .eq("id", user.id)
    .maybeSingle();

  if (profile?.default_family_id) {
    const { data: family } = await anySupabase
      .from("families")
      .select("*")
      .eq("id", profile.default_family_id)
      .maybeSingle();
    if (family) return { supabase, user, family: family as Family };
  }

  const { data: membership } = await anySupabase
    .from("family_memberships")
    .select("family_id, families(*)")
    .eq("user_id", user.id)
    .limit(1)
    .maybeSingle();

  if (membership?.families) {
    await anySupabase
      .from("profiles")
      .update({ default_family_id: membership.family_id })
      .eq("id", user.id);
    return { supabase, user, family: membership.families as Family };
  }

  const fallbackName = profile?.full_name || user.email?.split("@")[0] || "My";
  const { data: family, error: familyError } = await anySupabase
    .from("families")
    .insert({ name: `${fallbackName} Family`, owner_id: user.id })
    .select("*")
    .single();

  if (familyError) throw familyError;

  await anySupabase
    .from("family_memberships")
    .insert({ family_id: family.id, user_id: user.id, role: "owner" });
  await anySupabase.from("profiles").upsert({
    id: user.id,
    email: user.email,
    full_name: profile?.full_name ?? user.user_metadata?.full_name ?? null,
    default_family_id: family.id,
  });
  await anySupabase
    .from("subscriptions")
    .insert({
      family_id: family.id,
      user_id: user.id,
      plan: "free",
      status: "active",
    });

  return { supabase, user, family: family as Family };
}

export async function getAppData(): Promise<AppData> {
  const { supabase, family } = await ensureDefaultFamily();
  const anySupabase = db(supabase);

  const [
    members,
    caregiverAccess,
    careInstructions,
    activityLogs,
    notifications,
    calendarEvents,
    emergencyContacts,
    healthLogs,
    medicineLogs,
    temperatureLogs,
    doctorVisits,
    reminders,
    documents,
    aiChats,
    subscriptions,
  ] = await Promise.all([
    anySupabase
      .from("family_members")
      .select("*")
      .eq("family_id", family.id)
      .order("created_at", { ascending: false }),
    anySupabase
      .from("caregiver_child_access")
      .select("*, family_members:child_id(*)")
      .eq("family_id", family.id)
      .order("created_at", { ascending: false })
      .limit(20),
    anySupabase
      .from("care_instructions")
      .select("*, family_members:child_id(name)")
      .eq("family_id", family.id)
      .order("updated_at", { ascending: false })
      .limit(20),
    anySupabase
      .from("activity_logs")
      .select("*, family_members:child_id(name)")
      .eq("family_id", family.id)
      .order("logged_at", { ascending: false })
      .limit(20),
    anySupabase
      .from("notifications")
      .select("*")
      .eq("family_id", family.id)
      .order("created_at", { ascending: false })
      .limit(20),
    anySupabase
      .from("calendar_events")
      .select("*, family_members:family_member_id(name)")
      .eq("family_id", family.id)
      .order("starts_at", { ascending: true })
      .limit(20),
    anySupabase
      .from("emergency_contacts")
      .select("*")
      .eq("family_id", family.id)
      .order("priority", { ascending: true })
      .limit(20),
    anySupabase
      .from("health_logs")
      .select("*, family_members(name)")
      .eq("family_id", family.id)
      .order("logged_at", { ascending: false })
      .limit(10),
    anySupabase
      .from("medicine_logs")
      .select("*, family_members(name)")
      .eq("family_id", family.id)
      .order("taken_at", { ascending: false })
      .limit(10),
    anySupabase
      .from("temperature_logs")
      .select("*, family_members(name)")
      .eq("family_id", family.id)
      .order("measured_at", { ascending: false })
      .limit(10),
    anySupabase
      .from("doctor_visits")
      .select("*, family_members(name)")
      .eq("family_id", family.id)
      .order("visit_at", { ascending: true })
      .limit(10),
    anySupabase
      .from("reminders")
      .select("*, family_members(name)")
      .eq("family_id", family.id)
      .order("due_at", { ascending: true })
      .limit(10),
    anySupabase
      .from("documents")
      .select("*, family_members(name)")
      .eq("family_id", family.id)
      .order("created_at", { ascending: false })
      .limit(10),
    anySupabase
      .from("ai_chats")
      .select("*")
      .eq("family_id", family.id)
      .order("updated_at", { ascending: false })
      .limit(20),
    anySupabase
      .from("subscriptions")
      .select("plan,status")
      .eq("family_id", family.id)
      .limit(1)
      .maybeSingle(),
  ]);

  return {
    family,
    members: (members.data ?? []) as FamilyMember[],
    caregiverAccess: (caregiverAccess.data ?? []) as CaregiverChildAccess[],
    careInstructions: (careInstructions.data ?? []) as CareInstruction[],
    activityLogs: (activityLogs.data ?? []) as ActivityLog[],
    notifications: (notifications.data ?? []) as AppNotification[],
    calendarEvents: (calendarEvents.data ?? []) as CalendarEvent[],
    emergencyContacts: (emergencyContacts.data ?? []) as EmergencyContact[],
    healthLogs: (healthLogs.data ?? []) as HealthLog[],
    medicineLogs: (medicineLogs.data ?? []) as MedicineLog[],
    temperatureLogs: (temperatureLogs.data ?? []) as TemperatureLog[],
    doctorVisits: (doctorVisits.data ?? []) as DoctorVisit[],
    reminders: (reminders.data ?? []) as Reminder[],
    documents: (documents.data ?? []) as DocumentRecord[],
    aiChats: (aiChats.data ?? []) as AiChat[],
    subscription: subscriptions.data ?? null,
  };
}
