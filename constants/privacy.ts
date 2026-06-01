export const PRIVACY_LEVELS = {
  private: "private",
  familyShared: "family_shared",
  partnerShared: "partner_shared",
  caregiverShared: "caregiver_shared",
  emergencyOnly: "emergency_only"
} as const;

export type PrivacyLevel = (typeof PRIVACY_LEVELS)[keyof typeof PRIVACY_LEVELS];
