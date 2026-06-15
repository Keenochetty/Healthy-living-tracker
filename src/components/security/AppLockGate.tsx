import {
  AppState,
  type AppStateStatus,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { ReactNode, useCallback, useEffect, useRef, useState } from "react";

import { AppCard } from "@/components/ui";
import { getAppLockSettings, verifyDeviceOwner } from "@/lib/securitySettings";
import type { AppLockSettings } from "@/types/security";
import { useAppTheme } from "@/theme/ThemeProvider";

export function AppLockGate({ children }: { children: ReactNode }) {
  const { theme } = useAppTheme();
  const [locked, setLocked] = useState(false);
  const [message, setMessage] = useState("");
  const settingsRef = useRef<AppLockSettings>({
    enabled: false,
    timing: "immediately",
  });
  const backgroundedAtRef = useRef<number | null>(null);

  const unlock = useCallback(async () => {
    setMessage("");
    try {
      await verifyDeviceOwner();
      setLocked(false);
    } catch (error) {
      setMessage(
        error instanceof Error
          ? error.message
          : "Device authentication was not completed.",
      );
    }
  }, []);

  useEffect(() => {
    getAppLockSettings().then((settings) => {
      settingsRef.current = settings;
      if (settings.enabled) {
        setLocked(true);
        void unlock();
      }
    });
  }, [unlock]);

  useEffect(() => {
    async function handleAppState(nextState: AppStateStatus) {
      if (nextState === "background" || nextState === "inactive") {
        backgroundedAtRef.current = Date.now();
        return;
      }
      if (nextState !== "active" || backgroundedAtRef.current === null) return;
      settingsRef.current = await getAppLockSettings();
      if (!settingsRef.current.enabled) {
        backgroundedAtRef.current = null;
        setLocked(false);
        return;
      }
      const elapsed = Date.now() - backgroundedAtRef.current;
      backgroundedAtRef.current = null;
      if (elapsed >= timingMilliseconds(settingsRef.current.timing)) {
        setLocked(true);
        void unlock();
      }
    }
    const subscription = AppState.addEventListener("change", handleAppState);
    return () => subscription.remove();
  }, [unlock]);

  if (!locked) return children;

  return (
    <View style={[styles.screen, { backgroundColor: theme.background }]}>
      <AppCard style={styles.card}>
        <Text style={[styles.title, { color: theme.text }]}>
          HealthSync is locked
        </Text>
        <Text style={[styles.body, { color: theme.mutedText }]}>
          Confirm your device authentication to continue.
        </Text>
        {message ? (
          <Text style={[styles.body, { color: theme.danger }]}>{message}</Text>
        ) : null}
        <Pressable
          accessibilityRole="button"
          onPress={unlock}
          style={[styles.button, { backgroundColor: theme.primary }]}
        >
          <Text style={styles.buttonText}>Unlock</Text>
        </Pressable>
      </AppCard>
    </View>
  );
}

function timingMilliseconds(timing: AppLockSettings["timing"]) {
  if (timing === "after_1_minute") return 60_000;
  if (timing === "after_5_minutes") return 300_000;
  return 0;
}

const styles = StyleSheet.create({
  body: { lineHeight: 21, textAlign: "center" },
  button: {
    alignItems: "center",
    borderRadius: 18,
    minHeight: 52,
    justifyContent: "center",
    marginTop: 8,
  },
  buttonText: { color: "#ffffff", fontWeight: "900" },
  card: { gap: 12, maxWidth: 420, width: "100%" },
  screen: {
    alignItems: "center",
    flex: 1,
    justifyContent: "center",
    padding: 24,
  },
  title: { fontSize: 24, fontWeight: "900", textAlign: "center" },
});
