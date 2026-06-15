import { Href, router, useLocalSearchParams } from "expo-router";
import { useEffect } from "react";
import { Text } from "react-native";

import { AppMainLayout } from "@/components/layout/AppMainLayout";
import { AppCard } from "@/components/ui";

export default function ChildDetailCompatibilityScreen() {
  const params = useLocalSearchParams<{ childId?: string }>();
  const childId = Array.isArray(params.childId)
    ? params.childId[0]
    : params.childId;

  useEffect(() => {
    router.replace({
      pathname: "/baby-child",
      params: childId ? { childId } : undefined,
    } as unknown as Href);
  }, [childId]);

  return (
    <AppMainLayout subtitle="Opening Baby / Child" title="Child profile">
      <AppCard>
        <Text style={{ color: "#64748b", lineHeight: 21 }}>
          Opening this child profile in the Baby / Child realm.
        </Text>
      </AppCard>
    </AppMainLayout>
  );
}
