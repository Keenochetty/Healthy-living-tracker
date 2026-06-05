import * as Haptics from "expo-haptics";

async function runHaptic(effect: () => Promise<void>) {
  try {
    await effect();
  } catch {
    // Haptics are optional feedback. Unsupported platforms should never block UI.
  }
}

export function lightImpact() {
  void runHaptic(() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light));
}

export function successImpact() {
  void runHaptic(() => Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success));
}
