import * as Linking from "expo-linking";

import { getCaregiverProfile } from "@/lib/caregiverStorage";

export function createCaregiverToken(caregiverId: string) {
  return `${caregiverId}.${Date.now().toString(36)}`;
}

export function buildCaregiverInviteLink(token: string) {
  return Linking.createURL(`/caregiver/join/${token}`, { scheme: "familyhealth" });
}

export async function getCaregiverFromToken(token: string) {
  const [caregiverId] = token.split(".");
  return getCaregiverProfile(caregiverId);
}

export function createCaregiverQrPayload(caregiverId: string) {
  const token = createCaregiverToken(caregiverId);

  return {
    link: buildCaregiverInviteLink(token),
    token
  };
}
