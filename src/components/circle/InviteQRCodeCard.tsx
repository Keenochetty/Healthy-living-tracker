import * as Clipboard from "expo-clipboard";
import { Check, Copy } from "lucide-react-native";
import { useState } from "react";
import { Text, TouchableOpacity, View } from "react-native";
import QRCode from "react-native-qrcode-svg";

import { AppCard } from "@/components/ui/AppCard";
import type { CircleInvite } from "@/types/circle";

type InviteQRCodeCardProps = {
  invite: CircleInvite;
};

export function InviteQRCodeCard({ invite }: InviteQRCodeCardProps) {
  const [copied, setCopied] = useState(false);

  async function copyInviteLink() {
    await Clipboard.setStringAsync(invite.inviteLink);
    setCopied(true);
  }

  return (
    <AppCard backgroundColor="#f5f3ff">
      <View style={{ alignItems: "center", gap: 14 }}>
        <Text style={{ color: "#0f172a", fontSize: 20, fontWeight: "900" }}>
          Invite ready
        </Text>
        <View
          style={{ backgroundColor: "#ffffff", borderRadius: 20, padding: 14 }}
        >
          <QRCode
            backgroundColor="#ffffff"
            color="#4c1d95"
            size={180}
            value={invite.inviteLink}
          />
        </View>
        <Text
          selectable
          style={{ color: "#6d28d9", fontSize: 12, textAlign: "center" }}
        >
          {invite.inviteLink}
        </Text>
        <TouchableOpacity
          activeOpacity={0.85}
          onPress={copyInviteLink}
          style={{
            alignItems: "center",
            backgroundColor: "#7c3aed",
            borderRadius: 16,
            flexDirection: "row",
            gap: 8,
            justifyContent: "center",
            minHeight: 48,
            paddingHorizontal: 16,
            width: "100%",
          }}
        >
          {copied ? (
            <Check color="#ffffff" size={18} />
          ) : (
            <Copy color="#ffffff" size={18} />
          )}
          <Text style={{ color: "#ffffff", fontWeight: "800" }}>
            {copied ? "Invite link copied" : "Copy invite link"}
          </Text>
        </TouchableOpacity>
        <Text style={{ color: "#64748b", fontSize: 12, textAlign: "center" }}>
          Only share this with someone you trust.
        </Text>
      </View>
    </AppCard>
  );
}
