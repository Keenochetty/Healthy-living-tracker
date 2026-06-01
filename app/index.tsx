import { router } from "expo-router";
import { useEffect } from "react";
import { ActivityIndicator, StyleSheet, View } from "react-native";

import { getCurrentSession, hasCompletedOnboarding } from "@/lib/auth";

export default function IndexScreen() {
  useEffect(() => {
    async function routeUser() {
      const session = await getCurrentSession();

      if (!session) {
        router.replace("/auth/sign-in");
        return;
      }

      const onboardingComplete = await hasCompletedOnboarding();
      router.replace(onboardingComplete ? "/tabs/home" : "/auth/onboarding");
    }

    routeUser().catch(() => {
      router.replace("/auth/sign-in");
    });
  }, []);

  return (
    <View style={styles.container}>
      <ActivityIndicator />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    flex: 1,
    justifyContent: "center"
  }
});
