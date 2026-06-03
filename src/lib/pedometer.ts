import { Pedometer } from "expo-sensors";

export async function isPedometerAvailable() {
  try {
    return Pedometer.isAvailableAsync();
  } catch {
    return false;
  }
}

export async function getTodayStepCount() {
  try {
    const available = await isPedometerAvailable();

    if (!available) {
      return 0;
    }

    const permission = await Pedometer.getPermissionsAsync();

    if (!permission.granted) {
      const requested = await Pedometer.requestPermissionsAsync();

      if (!requested.granted) {
        return 0;
      }
    }

    const start = new Date();
    const end = new Date();

    start.setHours(0, 0, 0, 0);

    const result = await Pedometer.getStepCountAsync(start, end);

    return result.steps ?? 0;
  } catch {
    return 0;
  }
}

export async function subscribeToStepUpdates(callback: (steps: number) => void) {
  const available = await isPedometerAvailable();

  if (!available) {
    callback(0);
    return {
      remove: () => undefined
    };
  }

  return Pedometer.watchStepCount((result) => callback(result.steps ?? 0));
}
