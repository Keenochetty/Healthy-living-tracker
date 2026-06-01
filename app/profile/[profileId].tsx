import { useLocalSearchParams } from "expo-router";

import { PlaceholderScreen } from "@/components/shared/placeholder-screen";

export default function ProfileDetailScreen() {
  const { profileId } = useLocalSearchParams<{ profileId: string }>();

  return <PlaceholderScreen title="Profile" description={`Profile ID: ${profileId ?? "pending"}`} />;
}
