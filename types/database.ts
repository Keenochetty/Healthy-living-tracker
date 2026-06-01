export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type Database = {
  public: {
    Tables: {
      users: GenericTable;
      profiles: {
        Row: {
          id: string;
          email: string | null;
          phone: string | null;
          full_name: string | null;
          app_role: string;
          active_profile_mode: string;
          avatar_url: string | null;
          default_family_id: string | null;
          personal_family_member_id: string | null;
          linked_partner_family_member_id: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["profiles"]["Row"]> & { id: string };
        Update: Partial<Database["public"]["Tables"]["profiles"]["Row"]>;
        Relationships: [];
      };
      families: {
        Row: {
          id: string;
          owner_id: string;
          name: string;
          household_notes: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["families"]["Row"]> & { owner_id: string; name: string };
        Update: Partial<Database["public"]["Tables"]["families"]["Row"]>;
        Relationships: [];
      };
      family_members: {
        Row: {
          id: string;
          family_id: string;
          name: string;
          relationship: string | null;
          profile_type: Database["public"]["Enums"]["family_member_profile_type"];
          date_of_birth: string | null;
          gender: Database["public"]["Enums"]["gender_type"] | null;
          allergies: string | null;
          blood_type: string | null;
          medical_notes: string | null;
          doctor_details: string | null;
          emergency_notes: string | null;
          photo_url: string | null;
          privacy_level: Database["public"]["Enums"]["privacy_level"];
          managed_by_user_id: string | null;
          partner_user_id: string | null;
          linked_user_id: string | null;
          medication_notes: string | null;
          feeding_instructions: string | null;
          access_stage: Database["public"]["Enums"]["family_member_access_stage"];
          self_managed_by_user_id: string | null;
          adult_private: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["family_members"]["Row"]> & { family_id: string; name: string };
        Update: Partial<Database["public"]["Tables"]["family_members"]["Row"]>;
        Relationships: [];
      };
      family_memberships: {
        Row: {
          id: string;
          family_id: string;
          user_id: string;
          role: Database["public"]["Enums"]["family_role"];
          relationship: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["family_memberships"]["Row"]> & { family_id: string; user_id: string };
        Update: Partial<Database["public"]["Tables"]["family_memberships"]["Row"]>;
        Relationships: [];
      };
      health_records: GenericTable;
      ai_chat_sessions: GenericTable;
      ai_actions: GenericTable;
      device_tokens: GenericTable;
      user_settings: GenericTable;
      family_invites: GenericTable;
      health_logs: GenericTable;
      medicine_logs: GenericTable;
      temperature_logs: GenericTable;
      doctor_visits: GenericTable;
      documents: GenericTable;
      reminders: GenericTable;
      ai_chats: GenericTable;
      ai_messages: GenericTable;
      subscriptions: GenericTable;
      medical_records: GenericTable;
      medical_documents: GenericTable;
    };
    Views: Record<string, never>;
    Functions: {
      current_user_belongs_to_family: {
        Args: { target_family_id: string };
        Returns: boolean;
      };
      current_user_can_manage_family: {
        Args: { target_family_id: string };
        Returns: boolean;
      };
      current_user_can_view_care_profile: {
        Args: { target_family_member_id: string };
        Returns: boolean;
      };
      current_user_has_assigned_care_access: {
        Args: { target_family_member_id: string };
        Returns: boolean;
      };
      current_user_is_family_admin: {
        Args: { target_family_id: string };
        Returns: boolean;
      };
      current_user_is_family_member: {
        Args: { target_family_id: string };
        Returns: boolean;
      };
      current_user_owns_family: {
        Args: { target_family_id: string };
        Returns: boolean;
      };
    };
    Enums: {
      family_role: "owner" | "admin" | "member" | "caregiver";
      family_member_access_stage: "child_0_12" | "teen_13_17" | "adult_18_plus";
      family_invite_status: "pending" | "accepted" | "revoked" | "expired";
      family_member_profile_type:
        | "parent_guardian"
        | "caregiver"
        | "woman"
        | "man"
        | "child"
        | "baby"
        | "elderly_dependent"
        | "adult_male"
        | "adult_female"
        | "pregnant_mother"
        | "postpartum_mother"
        | "elderly_family_member";
      gender_type: "male" | "female" | "other" | "prefer_not_to_say";
      privacy_level: "private" | "family_shared" | "partner_shared" | "caregiver_shared";
      notification_urgency: "normal" | "schedule" | "attention" | "important" | "emergency";
      caregiver_access_status: "pending" | "active" | "paused" | "revoked";
      care_activity_type: "feed" | "nap" | "medication_given" | "bathroom" | "mood" | "activity" | "incident" | "photo_update" | "note_to_parent" | "emergency_alert";
      calendar_event_type:
        | "family_event"
        | "doctor_visit"
        | "medication_reminder"
        | "school_event"
        | "sports_day"
        | "caregiver_schedule"
        | "feeding_schedule"
        | "baby_routine"
        | "parent_appointment"
        | "child_submitted";
      event_response_status: "pending" | "approved" | "declined" | "postponed";
      ai_action_status: "pending" | "running" | "completed" | "failed" | "cancelled";
      ai_action_type:
        | "summarize_health_records"
        | "draft_care_plan"
        | "extract_document_data"
        | "risk_triage"
        | "generate_reminders"
        | "caregiver_handoff"
        | "general_assistant_action";
      device_platform: "ios" | "android" | "web";
      tracking_category:
        | "symptom"
        | "medicine"
        | "temperature"
        | "blood_pressure"
        | "weight"
        | "mood"
        | "pain"
        | "sleep"
        | "feeding"
        | "diaper"
        | "vaccination"
        | "doctor_visit";
      document_category:
        | "doctor_report"
        | "lab_result"
        | "prescription"
        | "scan_image"
        | "vaccination_card"
        | "medical_note"
        | "general_document";
      reminder_status: "pending" | "completed" | "dismissed" | "cancelled";
    };
    CompositeTypes: Record<string, never>;
  };
};

type GenericTable = {
  Row: Record<string, unknown>;
  Insert: Record<string, unknown>;
  Update: Record<string, unknown>;
  Relationships: [];
};
