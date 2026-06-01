import type { Database } from "@/types/database";

export type Profile = Database["public"]["Tables"]["profiles"]["Row"];
export type Family = Database["public"]["Tables"]["families"]["Row"];
export type FamilyMember = Database["public"]["Tables"]["family_members"]["Row"];
export type MedicalRecord = Database["public"]["Tables"]["medical_records"]["Row"];
export type MedicalDocument = Database["public"]["Tables"]["medical_documents"]["Row"];
