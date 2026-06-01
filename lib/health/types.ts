export type ActionState = {
  status: "idle" | "success" | "error";
  message: string;
};

export type Family = {
  id: string;
  name: string;
  owner_id: string;
  household_notes: string | null;
};

export type FamilyMember = {
  id: string;
  family_id: string;
  name: string;
  relationship: string | null;
  profile_type: string;
  date_of_birth: string | null;
  gender: string | null;
  allergies: string | null;
  medical_notes: string | null;
  doctor_details: string | null;
  emergency_notes: string | null;
  photo_url?: string | null;
  privacy_level?: PrivacyLevel;
  medication_notes?: string | null;
  feeding_instructions?: string | null;
  created_at: string;
};

export type PrivacyLevel = "private" | "family_shared" | "partner_shared" | "caregiver_shared";
export type NotificationUrgency = "normal" | "schedule" | "attention" | "important" | "emergency";
export type CaregiverActivityType =
  | "feed"
  | "nap"
  | "medication_given"
  | "bathroom"
  | "mood"
  | "activity"
  | "incident"
  | "photo_update"
  | "note_to_parent"
  | "emergency_alert";

export type CareInstruction = {
  id: string;
  family_id: string;
  child_id: string;
  title: string;
  instructions: string;
  category: string;
  privacy_level: PrivacyLevel;
  family_members?: { name: string } | null;
};

export type CaregiverChildAccess = {
  id: string;
  family_id: string;
  child_id: string;
  caregiver_user_id: string;
  status: "pending" | "active" | "paused" | "revoked";
  can_view_schedule: boolean;
  can_view_allergies: boolean;
  can_view_conditions: boolean;
  can_view_medications: boolean;
  can_upload_photos: boolean;
  can_trigger_emergency: boolean;
  starts_at: string | null;
  ends_at: string | null;
  family_members?: FamilyMember | null;
};

export type ActivityLog = {
  id: string;
  family_id: string;
  child_id: string;
  created_by_user_id: string;
  actor_profile_mode: "personal" | "work";
  activity_type: CaregiverActivityType;
  urgency: NotificationUrgency;
  privacy_level: PrivacyLevel;
  title: string;
  notes: string | null;
  share_with_parents: boolean;
  logged_at: string;
  family_members?: { name: string } | null;
};

export type AppNotification = {
  id: string;
  family_id: string;
  recipient_user_id: string;
  actor_user_id: string | null;
  child_id: string | null;
  activity_log_id: string | null;
  urgency: NotificationUrgency;
  title: string;
  message: string;
  read_at: string | null;
  created_at: string;
};

export type CalendarEvent = {
  id: string;
  family_id: string;
  family_member_id: string | null;
  child_id: string | null;
  event_type: string;
  title: string;
  notes: string | null;
  starts_at: string;
  ends_at: string | null;
  status: "pending" | "approved" | "declined" | "postponed";
  privacy_level: PrivacyLevel;
  share_with_family: boolean;
  share_with_caregiver: boolean;
  google_calendar_event_id: string | null;
  apple_calendar_event_id: string | null;
  family_members?: { name: string } | null;
};

export type EmergencyContact = {
  id: string;
  family_id: string;
  family_member_id: string | null;
  name: string;
  relationship: string | null;
  phone: string;
  email: string | null;
  priority: number;
  share_with_caregiver: boolean;
};

export type HealthLog = {
  id: string;
  family_id: string;
  family_member_id: string;
  category: string;
  title: string;
  notes: string | null;
  severity: number | null;
  logged_at: string;
  payload: Record<string, unknown>;
  family_members?: { name: string } | null;
};

export type MedicineLog = {
  id: string;
  family_id: string;
  family_member_id: string;
  medicine_name: string;
  dosage: string | null;
  taken_at: string;
  next_dose_at: string | null;
  notes: string | null;
  family_members?: { name: string } | null;
};

export type TemperatureLog = {
  id: string;
  family_id: string;
  family_member_id: string;
  temperature_c: number;
  measured_at: string;
  method: string | null;
  notes: string | null;
  family_members?: { name: string } | null;
};

export type DoctorVisit = {
  id: string;
  family_id: string;
  family_member_id: string;
  doctor_name: string | null;
  visit_at: string;
  reason: string;
  notes: string | null;
  follow_up_at: string | null;
  family_members?: { name: string } | null;
};

export type Reminder = {
  id: string;
  title: string;
  reminder_type: string;
  due_at: string;
  status: string;
  notes: string | null;
  family_members?: { name: string } | null;
};

export type DocumentRecord = {
  id: string;
  family_id: string;
  family_member_id: string;
  category: string;
  storage_path: string;
  file_name: string;
  content_type: string | null;
  file_size: number | null;
  notes: string | null;
  created_at: string;
  family_members?: { name: string } | null;
};

export type AiChat = {
  id: string;
  title: string;
  family_member_id: string | null;
  created_at: string;
  updated_at: string;
};

export type AiMessage = {
  id: string;
  chat_id: string;
  role: "user" | "assistant" | "system";
  content: string;
  created_at: string;
};

export type AppData = {
  family: Family | null;
  members: FamilyMember[];
  caregiverAccess: CaregiverChildAccess[];
  careInstructions: CareInstruction[];
  activityLogs: ActivityLog[];
  notifications: AppNotification[];
  calendarEvents: CalendarEvent[];
  emergencyContacts: EmergencyContact[];
  healthLogs: HealthLog[];
  medicineLogs: MedicineLog[];
  temperatureLogs: TemperatureLog[];
  doctorVisits: DoctorVisit[];
  reminders: Reminder[];
  documents: DocumentRecord[];
  aiChats: AiChat[];
  subscription: { plan: string; status: string } | null;
};
