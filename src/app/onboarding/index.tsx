import { Href, router } from "expo-router";
import { HeartPulse, ShieldCheck, Users } from "lucide-react-native";
import { Text, TouchableOpacity, View } from "react-native";

import { OnboardingProgress } from "@/components/onboarding/OnboardingProgress";
import { ScreenWrapper } from "@/components/layout/ScreenWrapper";
import { AppCard } from "@/components/ui/AppCard";

export default function OnboardingWelcomeScreen() {
  return (
    <ScreenWrapper>
      <OnboardingProgress step={1} totalSteps={5} />

      <View style={{ gap: 8 }}>
        <Text style={{ color: "#0f172a", fontSize: 32, fontWeight: "900" }}>
          Your health and care app, built around your life.
        </Text>
        <Text style={{ color: "#64748b", fontSize: 16, lineHeight: 23 }}>
          Start with yourself, then add family, children, elders, caregivers or close
          friends only when you need them.
        </Text>
      </View>

      <AppCard backgroundColor="#8b5cf6">
        <View style={{ flexDirection: "row", gap: 12, marginBottom: 18 }}>
          <HeroIcon icon={<HeartPulse color="#ffffff" size={22} />} />
          <HeroIcon icon={<Users color="#ffffff" size={22} />} />
          <HeroIcon icon={<ShieldCheck color="#ffffff" size={22} />} />
        </View>
        <Text style={{ color: "#ede9fe", fontWeight: "800" }}>
          What do you want this app to help you with?
        </Text>
        <Text
          style={{
            color: "#ffffff",
            fontSize: 24,
            fontWeight: "900",
            lineHeight: 31,
            marginTop: 8
          }}
        >
          Pick only what fits your life right now. You can change it later.
        </Text>
      </AppCard>

      <TouchableOpacity
        activeOpacity={0.85}
        onPress={() => router.push("/onboarding/profile" as Href)}
        style={{
          alignItems: "center",
          backgroundColor: "#7c3aed",
          borderRadius: 18,
          justifyContent: "center",
          minHeight: 54
        }}
      >
        <Text style={{ color: "#ffffff", fontSize: 16, fontWeight: "900" }}>
          Get started
        </Text>
      </TouchableOpacity>
    </ScreenWrapper>
  );
}

function HeroIcon({ icon }: { icon: React.ReactNode }) {
  return (
    <View
      style={{
        alignItems: "center",
        backgroundColor: "rgba(255,255,255,0.18)",
        borderRadius: 18,
        height: 52,
        justifyContent: "center",
        width: 52
      }}
    >
      {icon}
    </View>
  );
}
