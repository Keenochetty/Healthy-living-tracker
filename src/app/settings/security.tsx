import { ShieldCheck } from "lucide-react-native";
import { useCallback, useState } from "react";
import { StyleSheet, Switch, Text, View } from "react-native";
import { SvgXml } from "react-native-svg";
import { useFocusEffect } from "expo-router";

import { AppMainLayout } from "@/components/layout/AppMainLayout";
import {
  AppAlertCard,
  AppButton,
  AppCard,
  AppChip,
  AppFormInput,
  AppSection,
} from "@/components/ui";
import { useAuth } from "@/context/AuthContext";
import {
  changePassword,
  disableTotp,
  getAppLockSettings,
  getAssuranceLevel,
  getBiometricAvailability,
  getSecurityActivity,
  listTotpFactors,
  saveAppLockSettings,
  startTotpEnrollment,
  verifyDeviceOwner,
  verifyTotpEnrollment,
} from "@/lib/securitySettings";
import type {
  AppLockSettings,
  AppLockTiming,
  SecurityActivity,
  TotpEnrollment,
} from "@/types/security";
import { useAppTheme } from "@/theme/ThemeProvider";

export default function SecuritySettingsScreen() {
  const { session, user } = useAuth();
  const { theme } = useAppTheme();
  const [appLock, setAppLock] = useState<AppLockSettings>({
    enabled: false,
    timing: "immediately",
  });
  const [biometricAvailable, setBiometricAvailable] = useState(false);
  const [factors, setFactors] = useState<
    Awaited<ReturnType<typeof listTotpFactors>>
  >([]);
  const [aal, setAal] = useState<string | null>(null);
  const [activities, setActivities] = useState<SecurityActivity[]>([]);
  const [enrollment, setEnrollment] = useState<TotpEnrollment | null>(null);
  const [code, setCode] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [disablePassword, setDisablePassword] = useState("");
  const [disableCode, setDisableCode] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [working, setWorking] = useState(false);

  const load = useCallback(async () => {
    const [nextFactors, nextAal, nextLock, availability, nextActivities] =
      await Promise.all([
        user ? listTotpFactors() : Promise.resolve([]),
        user ? getAssuranceLevel() : Promise.resolve(null),
        getAppLockSettings(),
        getBiometricAvailability(),
        getSecurityActivity(),
      ]);
    setFactors(nextFactors);
    setAal(nextAal);
    setAppLock(nextLock);
    setBiometricAvailable(availability.available);
    setActivities(nextActivities);
  }, [user]);
  useFocusEffect(
    useCallback(() => {
      void load();
    }, [load]),
  );

  async function run(action: () => Promise<void>, success: string) {
    setWorking(true);
    setError("");
    setMessage("");
    try {
      await action();
      setMessage(success);
      await load();
    } catch (nextError) {
      setError(
        nextError instanceof Error
          ? nextError.message
          : "Security action failed.",
      );
    } finally {
      setWorking(false);
    }
  }

  async function handlePasswordChange() {
    if (newPassword.length < 10) {
      setError("Use at least 10 characters for the new password.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setError("New passwords do not match.");
      return;
    }
    await run(async () => {
      await changePassword(currentPassword, newPassword);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    }, "Password changed.");
  }

  async function handleAppLock(enabled: boolean) {
    await run(
      async () => {
        if (!biometricAvailable)
          throw new Error("No enrolled device authentication is available.");
        await verifyDeviceOwner();
        setAppLock(await saveAppLockSettings({ ...appLock, enabled }));
      },
      enabled ? "App lock enabled." : "App lock disabled.",
    );
  }

  const verifiedFactor = factors[0] ?? null;
  return (
    <AppMainLayout subtitle="Settings" title="Security">
      {!user ? (
        <AppAlertCard
          message="Sign in to change passwords or use authenticator-based two-step verification. App lock can still be configured locally."
          title="Local mode"
          variant="warning"
        />
      ) : null}
      {error ? (
        <AppAlertCard
          message={error}
          title="Security action failed"
          variant="danger"
        />
      ) : null}
      {message ? (
        <AppAlertCard
          message={message}
          title="Security updated"
          variant="success"
        />
      ) : null}

      <AppSection title="Security status">
        <AppCard style={styles.form}>
          <StatusRow label="Signed in" value={user ? "Yes" : "Local mode"} />
          <StatusRow
            label="Two-step verification"
            value={verifiedFactor ? "On" : "Off"}
          />
          <StatusRow
            label="Current assurance level"
            value={aal?.toUpperCase() ?? "Not available"}
          />
          <StatusRow label="App lock" value={appLock.enabled ? "On" : "Off"} />
        </AppCard>
      </AppSection>

      <AppSection
        title="Change password"
        subtitle="High-risk action: enter your current password to re-authenticate."
      >
        <AppCard style={styles.form}>
          <AppFormInput
            label="Current password"
            onChangeText={setCurrentPassword}
            placeholder="Current password"
            secureTextEntry
            value={currentPassword}
          />
          <AppFormInput
            helperText="Use 10 or more characters. A password manager is recommended."
            label="New password"
            onChangeText={setNewPassword}
            placeholder="New password"
            secureTextEntry
            value={newPassword}
          />
          <AppFormInput
            label="Confirm new password"
            onChangeText={setConfirmPassword}
            placeholder="Confirm new password"
            secureTextEntry
            value={confirmPassword}
          />
          <AppButton
            disabled={!user}
            loading={working}
            onPress={handlePasswordChange}
            title="Change password"
          />
        </AppCard>
      </AppSection>

      <AppSection
        title="Two-step verification"
        subtitle="Use a TOTP authenticator app. Setup secrets are never logged."
      >
        <AppCard style={styles.form}>
          {verifiedFactor ? (
            <>
              <StatusRow label="Authenticator" value="Verified and enabled" />
              <Text style={[styles.body, { color: theme.mutedText }]}>
                Disabling requires your current password and a fresh
                authenticator code.
              </Text>
              <AppFormInput
                label="Current password"
                onChangeText={setDisablePassword}
                placeholder="Current password"
                secureTextEntry
                value={disablePassword}
              />
              <AppFormInput
                keyboardType="number-pad"
                label="Authenticator code"
                onChangeText={setDisableCode}
                placeholder="123456"
                value={disableCode}
              />
              <AppButton
                loading={working}
                onPress={() =>
                  run(async () => {
                    await disableTotp(
                      verifiedFactor.id,
                      disablePassword,
                      disableCode,
                    );
                    setDisablePassword("");
                    setDisableCode("");
                  }, "Two-step verification disabled.")
                }
                title="Disable two-step verification"
                variant="danger"
              />
            </>
          ) : enrollment ? (
            <>
              <Text style={[styles.body, { color: theme.text }]}>
                Scan this QR code in your authenticator app, or enter the manual
                setup key.
              </Text>
              <View style={styles.qr}>
                <SvgXml height={190} width={190} xml={enrollment.qrCode} />
              </View>
              <Text
                selectable
                style={[
                  styles.secret,
                  { backgroundColor: theme.primarySoft, color: theme.text },
                ]}
              >
                {enrollment.secret}
              </Text>
              <AppFormInput
                keyboardType="number-pad"
                label="Authenticator code"
                onChangeText={setCode}
                placeholder="123456"
                value={code}
              />
              <AppButton
                loading={working}
                onPress={() =>
                  run(async () => {
                    await verifyTotpEnrollment(enrollment.factorId, code);
                    setEnrollment(null);
                    setCode("");
                  }, "Two-step verification enabled.")
                }
                title="Verify and enable"
              />
            </>
          ) : (
            <AppButton
              disabled={!user}
              loading={working}
              onPress={() =>
                run(
                  async () => setEnrollment(await startTotpEnrollment()),
                  "Authenticator setup started.",
                )
              }
              title="Start authenticator setup"
            />
          )}
        </AppCard>
      </AppSection>

      <AppSection
        title="Biometrics and app lock"
        subtitle="Uses enrolled device authentication. No biometric data is stored by the app."
      >
        <AppCard style={styles.form}>
          <View style={styles.between}>
            <View style={styles.flex}>
              <Text style={[styles.title, { color: theme.text }]}>
                Require app lock
              </Text>
              <Text style={[styles.body, { color: theme.mutedText }]}>
                {biometricAvailable
                  ? "Device authentication is available."
                  : "No enrolled device authentication found."}
              </Text>
            </View>
            <Switch
              disabled={!biometricAvailable}
              onValueChange={handleAppLock}
              value={appLock.enabled}
            />
          </View>
          <Text style={[styles.title, { color: theme.text }]}>
            Require lock
          </Text>
          <View style={styles.chips}>
            {(
              [
                "immediately",
                "after_1_minute",
                "after_5_minutes",
              ] as AppLockTiming[]
            ).map((timing) => (
              <AppChip
                key={timing}
                label={format(timing)}
                onPress={() =>
                  run(
                    async () =>
                      setAppLock(
                        await saveAppLockSettings({ ...appLock, timing }),
                      ),
                    "App lock timing updated.",
                  )
                }
                selected={appLock.timing === timing}
              />
            ))}
          </View>
        </AppCard>
      </AppSection>

      <AppSection
        title="Active session"
        subtitle="Supabase exposes the current session here. Cross-device session listing is not currently supported in this client."
      >
        <AppCard style={styles.form}>
          <StatusRow label="Current device" value="This device" />
          <StatusRow
            label="Session expires"
            value={
              session?.expires_at
                ? new Date(session.expires_at * 1000).toLocaleString()
                : "Not available"
            }
          />
          <AppChip label="Other sessions coming later" variant="muted" />
        </AppCard>
      </AppSection>

      <AppSection title="Security activity">
        {activities.length ? (
          activities.map((activity) => (
            <AppCard key={activity.id}>
              <View style={styles.activity}>
                <ShieldCheck color={theme.primary} size={20} />
                <View>
                  <Text style={[styles.title, { color: theme.text }]}>
                    {activity.title}
                  </Text>
                  <Text style={[styles.body, { color: theme.mutedText }]}>
                    {new Date(activity.createdAt).toLocaleString()}
                  </Text>
                </View>
              </View>
            </AppCard>
          ))
        ) : (
          <AppCard>
            <Text style={{ color: theme.mutedText }}>
              No local security activity recorded yet.
            </Text>
          </AppCard>
        )}
      </AppSection>
    </AppMainLayout>
  );
}

function StatusRow({ label, value }: { label: string; value: string }) {
  const { theme } = useAppTheme();
  return (
    <View style={styles.between}>
      <Text style={[styles.body, { color: theme.mutedText }]}>{label}</Text>
      <Text style={[styles.title, { color: theme.text }]}>{value}</Text>
    </View>
  );
}
function format(value: string) {
  return value
    .replaceAll("_", " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}
const styles = StyleSheet.create({
  activity: { alignItems: "center", flexDirection: "row", gap: 12 },
  between: {
    alignItems: "center",
    flexDirection: "row",
    gap: 12,
    justifyContent: "space-between",
  },
  body: { fontSize: 13, lineHeight: 19 },
  chips: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  flex: { flex: 1 },
  form: { gap: 14 },
  qr: {
    alignItems: "center",
    backgroundColor: "#ffffff",
    borderRadius: 18,
    padding: 12,
  },
  secret: { borderRadius: 14, fontFamily: "monospace", padding: 12 },
  title: { fontSize: 15, fontWeight: "900" },
});
