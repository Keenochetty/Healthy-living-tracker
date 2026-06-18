import { Href, router, useLocalSearchParams } from "expo-router";
import { CheckCircle2, ShieldCheck } from "lucide-react-native";
import { useEffect, useState } from "react";
import { ActivityIndicator, Text, TouchableOpacity, View } from "react-native";

import { InvitePreviewCard } from "@/components/circle/InvitePreviewCard";
import { ScreenWrapper } from "@/components/layout/ScreenWrapper";
import { AppCard } from "@/components/ui/AppCard";
import { acceptInvite, getInviteByToken } from "@/lib/circleInvites";
import type { CircleInvite } from "@/types/circle";

export default function JoinCircleScreen() {
  const { token: tokenParam } = useLocalSearchParams<{
    token?: string | string[];
  }>();
  const token = Array.isArray(tokenParam) ? tokenParam[0] : tokenParam;
  const [invite, setInvite] = useState<CircleInvite | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [requestSent, setRequestSent] = useState(false);

  useEffect(() => {
    let isActive = true;
    const inviteRequest = token
      ? getInviteByToken(token)
      : Promise.resolve(null);

    inviteRequest
      .then((storedInvite) => {
        if (isActive) {
          setInvite(storedInvite);
          setRequestSent(storedInvite?.status === "join_requested");
        }
      })
      .finally(() => {
        if (isActive) {
          setIsLoading(false);
        }
      });

    return () => {
      isActive = false;
    };
  }, [token]);

  async function requestToJoin() {
    if (!token) {
      return;
    }

    setIsSubmitting(true);

    try {
      const updatedInvite = await acceptInvite(token);

      if (updatedInvite) {
        setInvite(updatedInvite);
        setRequestSent(true);
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  if (isLoading) {
    return (
      <ScreenWrapper>
        <ActivityIndicator color="#7c3aed" />
      </ScreenWrapper>
    );
  }

  if (!invite) {
    return (
      <ScreenWrapper>
        <Text style={{ color: "#0f172a", fontSize: 28, fontWeight: "900" }}>
          Invite not found
        </Text>
        <AppCard>
          <Text style={{ color: "#64748b", lineHeight: 21 }}>
            This invite may be invalid or unavailable. Ask the circle admin to
            create a new link.
          </Text>
        </AppCard>
        <SecondaryButton
          label="Not now"
          onPress={() => router.replace("/(tabs)/circle" as Href)}
        />
      </ScreenWrapper>
    );
  }

  return (
    <ScreenWrapper>
      <View style={{ gap: 4 }}>
        <Text style={{ color: "#64748b", fontSize: 14 }}>
          Trusted circle invite
        </Text>
        <Text style={{ color: "#0f172a", fontSize: 30, fontWeight: "900" }}>
          Review before joining
        </Text>
      </View>

      <InvitePreviewCard invite={invite} />

      <AppCard backgroundColor="#f8fafc">
        <View
          style={{ alignItems: "flex-start", flexDirection: "row", gap: 10 }}
        >
          <ShieldCheck color="#7c3aed" size={20} />
          <Text style={{ color: "#475569", flex: 1, lineHeight: 21 }}>
            Requesting to join does not automatically give access to private
            health records, medication, allergies, child profiles, pregnancy or
            cycle data, or elder-care details.
          </Text>
        </View>
      </AppCard>

      {requestSent ? (
        <AppCard backgroundColor="#ecfdf5">
          <View
            style={{ alignItems: "flex-start", flexDirection: "row", gap: 10 }}
          >
            <CheckCircle2 color="#059669" size={22} />
            <Text
              style={{
                color: "#065f46",
                flex: 1,
                fontWeight: "800",
                lineHeight: 21,
              }}
            >
              Request sent. The circle admin can approve your access.
            </Text>
          </View>
        </AppCard>
      ) : (
        <TouchableOpacity
          activeOpacity={0.85}
          disabled={isSubmitting}
          onPress={requestToJoin}
          style={{
            alignItems: "center",
            backgroundColor: "#7c3aed",
            borderRadius: 18,
            justifyContent: "center",
            minHeight: 54,
            opacity: isSubmitting ? 0.65 : 1,
          }}
        >
          <Text style={{ color: "#ffffff", fontSize: 16, fontWeight: "900" }}>
            {isSubmitting ? "Sending request..." : "Request to join"}
          </Text>
        </TouchableOpacity>
      )}

      <SecondaryButton
        label="Not now"
        onPress={() => router.replace("/(tabs)/circle" as Href)}
      />
    </ScreenWrapper>
  );
}

function SecondaryButton({
  label,
  onPress,
}: {
  label: string;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity
      activeOpacity={0.85}
      onPress={onPress}
      style={{
        alignItems: "center",
        backgroundColor: "#ffffff",
        borderRadius: 18,
        justifyContent: "center",
        minHeight: 50,
      }}
    >
      <Text style={{ color: "#7c3aed", fontWeight: "800" }}>{label}</Text>
    </TouchableOpacity>
  );
}
