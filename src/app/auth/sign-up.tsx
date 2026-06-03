import { Href, router } from "expo-router";
import { Text, TouchableOpacity, View } from "react-native";

import { AuthForm } from "@/components/auth/AuthForm";
import { ScreenWrapper } from "@/components/layout/ScreenWrapper";

export default function SignUpScreen() {
  return (
    <ScreenWrapper>
      <View style={{ gap: 4 }}>
        <Text style={{ color: "#64748b", fontSize: 14 }}>Supabase account</Text>
        <Text style={{ color: "#0f172a", fontSize: 30, fontWeight: "900" }}>
          Create your private care space.
        </Text>
        <Text style={{ color: "#64748b", lineHeight: 20 }}>
          Create an account to sync setup data. Health module records stay local
          until their privacy rules are built.
        </Text>
      </View>

      <AuthForm mode="signup" onSuccess={() => router.replace("/" as Href)} />

      <TouchableOpacity
        activeOpacity={0.85}
        onPress={() => router.push("/auth/sign-in" as Href)}
        style={{
          alignItems: "center",
          backgroundColor: "#ffffff",
          borderRadius: 18,
          justifyContent: "center",
          minHeight: 52
        }}
      >
        <Text style={{ color: "#7c3aed", fontWeight: "900" }}>
          I already have an account
        </Text>
      </TouchableOpacity>
    </ScreenWrapper>
  );
}
