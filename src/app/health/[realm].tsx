import { Redirect, useLocalSearchParams } from "expo-router";

import { HealthRealmPlaceholderScreen } from "@/components/health/HealthRealmPlaceholderScreen";
import { GeneralHealthScreen } from "@/components/health/GeneralHealthScreen";
import { WomensHealthScreen } from "@/components/health/WomensHealthScreen";
import { getHealthRealm } from "@/lib/healthRealms";

export default function HealthRealmRoute() {
  const { realm: slug } = useLocalSearchParams<{ realm?: string | string[] }>();
  const realm = getHealthRealm(slug);

  if (!realm) {
    return <Redirect href="/health" />;
  }

  if (realm.slug === "general") {
    return <GeneralHealthScreen />;
  }

  if (realm.slug === "womens-health") {
    return <WomensHealthScreen />;
  }

  if (realm.slug === "fitness") {
    return <Redirect href="/(tabs)/fitness" />;
  }

  return <HealthRealmPlaceholderScreen realm={realm} />;
}
