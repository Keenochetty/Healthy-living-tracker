import * as Clipboard from "expo-clipboard";
import { useMemo, useState } from "react";
import { Text, TouchableOpacity, View } from "react-native";
import QRCode from "react-native-qrcode-svg";

import { createCaregiverQrPayload } from "@/lib/caregiverInvites";
import { AppCard } from "@/components/ui/AppCard";

type CaregiverInviteQRCardProps = { caregiverId: string };

export function CaregiverInviteQRCard({
  caregiverId,
}: CaregiverInviteQRCardProps) {
  const [copied, setCopied] = useState(false);
  const payload = useMemo(
    () => createCaregiverQrPayload(caregiverId),
    [caregiverId],
  );

  async function copyLink() {
    await Clipboard.setStringAsync(payload.link);
    setCopied(true);
  }

  return (
    <AppCard>
      <View style={{ alignItems: "center", gap: 14 }}>
        <Text
          style={{
            color: "#0f172a",
            fontSize: 20,
            fontWeight: "900",
            alignSelf: "stretch",
          }}
        >
          Invite QR
        </Text>
        <QRCode size={170} value={payload.link} />
        <Text style={{ color: "#64748b", lineHeight: 20, textAlign: "center" }}>
          {payload.link}
        </Text>
        <TouchableOpacity
          activeOpacity={0.85}
          onPress={copyLink}
          style={buttonStyle}
        >
          <Text style={{ color: "#ffffff", fontWeight: "900" }}>
            {copied ? "Copied" : "Copy invite link"}
          </Text>
        </TouchableOpacity>
        <Text style={{ color: "#9a3412", lineHeight: 20, textAlign: "center" }}>
          Only share this with families or caregivers you trust.
        </Text>
      </View>
    </AppCard>
  );
}

const buttonStyle = {
  alignItems: "center" as const,
  backgroundColor: "#4f46e5",
  borderRadius: 18,
  justifyContent: "center" as const,
  minHeight: 52,
  paddingHorizontal: 18,
  width: "100%" as const,
};
