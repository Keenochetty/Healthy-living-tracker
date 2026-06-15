import { Href, Redirect } from "expo-router";
import { ActivityIndicator, View } from "react-native";

import { useAuth } from "@/context/AuthContext";

type ProtectedRouteProps = {
  children: React.ReactNode;
  fallbackHref?: Href;
};

export function ProtectedRoute({
  children,
  fallbackHref = "/auth" as Href,
}: ProtectedRouteProps) {
  const { initialized, isAuthenticated } = useAuth();

  if (!initialized) {
    return (
      <View
        style={{
          alignItems: "center",
          backgroundColor: "#fbf8ff",
          flex: 1,
          justifyContent: "center",
        }}
      >
        <ActivityIndicator color="#7c3aed" />
      </View>
    );
  }

  if (!isAuthenticated) {
    return <Redirect href={fallbackHref} />;
  }

  return <>{children}</>;
}
