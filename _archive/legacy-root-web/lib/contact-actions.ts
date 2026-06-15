import { Linking } from "react-native";

function cleanPhoneNumber(phoneNumber: string) {
  return phoneNumber.replace(/[^\d+]/g, "");
}

export async function openPhoneCall(phoneNumber: string) {
  const cleaned = cleanPhoneNumber(phoneNumber);

  if (!cleaned) {
    throw new Error("No phone number available.");
  }

  await Linking.openURL(`tel:${cleaned}`);
}

export async function openEmail(email: string, subject?: string) {
  const trimmedEmail = email.trim();

  if (!trimmedEmail) {
    throw new Error("No email address available.");
  }

  const query = subject ? `?subject=${encodeURIComponent(subject)}` : "";
  await Linking.openURL(`mailto:${trimmedEmail}${query}`);
}
