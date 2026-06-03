import * as Haptics from "expo-haptics";

export async function lightFeedback() {
  try {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  } catch {
    // Haptics may be unavailable on some devices or platforms.
  }
}

export async function successFeedback() {
  try {
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  } catch {
    // Haptics may be unavailable on some devices or platforms.
  }
}

export async function warningFeedback() {
  try {
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
  } catch {
    // Haptics may be unavailable on some devices or platforms.
  }
}

export async function playTimerBeep() {
  // expo-audio is installed for future timer sounds. For now we keep this as a
  // no-op placeholder so timer feedback works reliably through haptics first.
}
