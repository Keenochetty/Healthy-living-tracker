import { Href, Redirect } from "expo-router";
import { ActivityIndicator, View } from "react-native";

import { useAuth } from "@/context/AuthContext";

export default function Index() {
  const { initialized, isOnboarded, loading, localMode, session } = useAuth();

  if (!initialized || loading) {
    return (
      <View
        style={{
          alignItems: "center",
          backgroundColor: "#fbf8ff",
          flex: 1,
          justifyContent: "center"
        }}
      >
        <ActivityIndicator color="#7c3aed" />
      </View>
    );
  }

  if (!session && !localMode) {
    return <Redirect href={"/auth" as Href} />;
  }

  return (
    <Redirect
      href={(isOnboarded ? "/(tabs)/today" : "/onboarding") as Href}
    />
  );
}
