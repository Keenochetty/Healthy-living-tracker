import { Href, router } from "expo-router";
import { useEffect } from "react";
import { Text } from "react-native";

import { AppMainLayout } from "@/components/layout/AppMainLayout";
import { AppCard } from "@/components/ui";

export default function ChildCompatibilityScreen() {
  useEffect(() => {
    router.replace("/baby-child" as Href);
  }, []);

  return (
    <AppMainLayout subtitle="Opening Baby / Child" title="Child & Baby">
      <AppCard>
        <Text style={{ color: "#64748b", lineHeight: 21 }}>
          Opening the Baby / Child realm.
        </Text>
      </AppCard>
    </AppMainLayout>
  );
}
