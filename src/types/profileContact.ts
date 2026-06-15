export type PreferredContactMethod = "email" | "phone" | "none";
export type EmergencyContactVisibility =
  | "private"
  | "circle_admins"
  | "emergency_contacts";

export type EmergencyContact = {
  id: string;
  includeInMedicalId: boolean;
  name: string;
  phone: string;
  relationship: string;
  secondaryContact: string;
  visibility: EmergencyContactVisibility;
};

export type ProfileContactDetails = {
  avatarPath: string | null;
  avatarPreviewUri: string | null;
  dateOfBirth: string;
  displayName: string;
  emergencyContacts: EmergencyContact[];
  fullName: string;
  phone: string;
  preferredContactMethod: PreferredContactMethod;
};
