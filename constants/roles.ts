export const USER_ROLES = {
  parentGuardian: "parent_guardian",
  caregiver: "caregiver",
  woman: "woman",
  man: "man",
  child: "child",
  baby: "baby",
  elderlyDependent: "elderly_dependent",
} as const;

export type UserRole = (typeof USER_ROLES)[keyof typeof USER_ROLES];
