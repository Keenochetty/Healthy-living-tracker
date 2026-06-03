import { Href, router } from "expo-router";
import { useState } from "react";
import { Text, TouchableOpacity, View } from "react-native";

import { AppCard } from "@/components/ui/AppCard";
import { useAuth } from "@/context/AuthContext";
import {
  syncLocalPreferencesToCloud,
  syncRemotePreferencesToLocal
} from "@/lib/profileSync";

type AuthStatusCardProps = {
  onSynced?: () => void;
};

export function AuthStatusCard({ onSynced }: AuthStatusCardProps) {
  const { initialized, isAuthenticated, localMode, logout: signOut, user } = useAuth();
  const [message, setMessage] = useState("");

  async function syncToCloud() {
    setMessage("");
    if (!user) return;

    const result = await syncLocalPreferencesToCloud(user.id);

    if (result.error) {
      setMessage("Could not sync right now. Your local settings are still saved.");
      return;
    }

    setMessage("Synced just now.");
    onSynced?.();
  }

  async function syncFromCloud() {
    setMessage("");
    try {
      await syncRemotePreferencesToLocal();
      setMessage("Cloud settings pulled.");
    } catch {
      setMessage("Could not sync right now. Your local settings are still saved.");
    }
    onSynced?.();
  }

  async function handleLogout() {
    await signOut();
    onSynced?.();
  }

  if (!initialized) {
    return null;
  }

  if (!isAuthenticated) {
    return (
      <AppCard backgroundColor="#f5f3ff">
        <View style={{ gap: 12 }}>
          <Text style={{ color: "#0f172a", fontSize: 18, fontWeight: "900" }}>
            {localMode ? "Local testing mode" : "Not signed in"}
          </Text>
          <Text style={{ color: "#64748b", lineHeight: 21 }}>
            You can keep testing locally. Log in when you want to sync profile setup,
            modules, widgets, theme, country and units.
          </Text>
          <View style={{ flexDirection: "row", gap: 10 }}>
            <AuthButton
              label="Sign in to sync"
              onPress={() => router.push("/auth/sign-in" as Href)}
              primary
            />
            <AuthButton
              label="Create account"
              onPress={() => router.push("/auth/sign-up" as Href)}
            />
          </View>
        </View>
      </AppCard>
    );
  }

  return (
    <AppCard backgroundColor="#ecfdf5">
      <View style={{ gap: 12 }}>
        <Text style={{ color: "#0f172a", fontSize: 18, fontWeight: "900" }}>
          Signed in
        </Text>
        <Text style={{ color: "#64748b", lineHeight: 21 }}>
          {user?.email}. Setup sync is enabled. Health, child, caregiver, cycle, food
          and elder records are not synced in this step.
        </Text>
        {message ? <Text style={{ color: "#475569", lineHeight: 20 }}>{message}</Text> : null}
        <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 10 }}>
          <AuthButton label="Sync to cloud" onPress={syncToCloud} primary />
          <AuthButton label="Pull cloud" onPress={syncFromCloud} />
          <AuthButton label="Sign out" onPress={handleLogout} danger />
        </View>
      </View>
    </AppCard>
  );
}

function AuthButton({
  danger = false,
  label,
  onPress,
  primary = false
}: {
  danger?: boolean;
  label: string;
  onPress: () => void;
  primary?: boolean;
}) {
  return (
    <TouchableOpacity
      activeOpacity={0.85}
      onPress={onPress}
      style={{
        alignItems: "center",
        backgroundColor: danger ? "#fee2e2" : primary ? "#7c3aed" : "#ffffff",
        borderRadius: 16,
        flexGrow: 1,
        justifyContent: "center",
        minHeight: 46,
        paddingHorizontal: 12
      }}
    >
      <Text
        style={{
          color: danger ? "#dc2626" : primary ? "#ffffff" : "#7c3aed",
          fontWeight: "900"
        }}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );
}
