import { Href, router } from "expo-router";
import { Text, TouchableOpacity, View } from "react-native";

import { ScreenWrapper } from "@/components/layout/ScreenWrapper";
import { AppCard } from "@/components/ui/AppCard";
import { useAuth } from "@/context/AuthContext";

export default function AuthLandingScreen() {
  const { setLocalMode } = useAuth();

  async function continueLocalMode() {
    await setLocalMode(true);
    router.replace("/" as Href);
  }

  return (
    <ScreenWrapper>
      <View style={{ gap: 6 }}>
        <Text style={{ color: "#64748b", fontSize: 14 }}>Private care space</Text>
        <Text style={{ color: "#0f172a", fontSize: 32, fontWeight: "900" }}>
          Welcome back
        </Text>
        <Text style={{ color: "#64748b", lineHeight: 21 }}>
          Sign in to keep your health and care settings synced.
        </Text>
      </View>

      <AppCard backgroundColor="#f5f3ff">
        <Text style={{ color: "#0f172a", fontSize: 18, fontWeight: "900" }}>
          Local testing mode
        </Text>
        <Text style={{ color: "#64748b", lineHeight: 21, marginTop: 6 }}>
          Local mode is for testing. Your data will stay on this device.
        </Text>
      </AppCard>

      <View style={{ gap: 10 }}>
        <AuthAction
          label="Sign in"
          onPress={() => router.push("/auth/sign-in" as Href)}
          primary
        />
        <AuthAction
          label="Create account"
          onPress={() => router.push("/auth/sign-up" as Href)}
        />
        <AuthAction label="Continue local/testing mode" onPress={continueLocalMode} />
      </View>
    </ScreenWrapper>
  );
}

function AuthAction({
  label,
  onPress,
  primary = false
}: {
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
        backgroundColor: primary ? "#7c3aed" : "#ffffff",
        borderRadius: 18,
        justifyContent: "center",
        minHeight: 54
      }}
    >
      <Text style={{ color: primary ? "#ffffff" : "#7c3aed", fontWeight: "900" }}>
        {label}
      </Text>
    </TouchableOpacity>
  );
}
