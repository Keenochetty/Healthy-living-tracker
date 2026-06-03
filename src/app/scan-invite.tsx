import { CameraView, type BarcodeScanningResult, useCameraPermissions } from "expo-camera";
import { Href, router } from "expo-router";
import { ScanLine } from "lucide-react-native";
import { useState } from "react";
import { Text, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

function getInviteToken(data: string) {
  const match = data.match(/\/join\/([^/?#]+)/);

  return match?.[1] ? decodeURIComponent(match[1]) : null;
}

export default function ScanInviteScreen() {
  const insets = useSafeAreaInsets();
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);

  function handleBarcodeScanned(result: BarcodeScanningResult) {
    const token = getInviteToken(result.data);

    if (!token || scanned) {
      return;
    }

    setScanned(true);
    router.replace(`/join/${token}` as Href);
  }

  if (!permission) {
    return <View style={{ backgroundColor: "#0f172a", flex: 1 }} />;
  }

  if (!permission.granted) {
    return (
      <View
        style={{
          backgroundColor: "#fbf8ff",
          flex: 1,
          gap: 18,
          justifyContent: "center",
          paddingHorizontal: 24
        }}
      >
        <View style={{ alignItems: "center", gap: 12 }}>
          <ScanLine color="#7c3aed" size={42} />
          <Text style={{ color: "#0f172a", fontSize: 25, fontWeight: "900", textAlign: "center" }}>
            Scan a Circle invite
          </Text>
          <Text style={{ color: "#64748b", lineHeight: 21, textAlign: "center" }}>
            QR scanning will open the camera and read family invite codes.
          </Text>
        </View>
        <PrimaryButton label="Allow camera access" onPress={requestPermission} />
        <SecondaryButton label="Not now" onPress={() => router.back()} />
      </View>
    );
  }

  return (
    <View style={{ backgroundColor: "#0f172a", flex: 1 }}>
      <CameraView
        barcodeScannerSettings={{ barcodeTypes: ["qr"] }}
        onBarcodeScanned={scanned ? undefined : handleBarcodeScanned}
        style={{ flex: 1 }}
      />
      <View
        style={{
          bottom: insets.bottom + 22,
          gap: 12,
          left: 20,
          position: "absolute",
          right: 20
        }}
      >
        <View
          style={{
            backgroundColor: "rgba(15, 23, 42, 0.82)",
            borderRadius: 20,
            gap: 4,
            padding: 16
          }}
        >
          <Text style={{ color: "#ffffff", fontSize: 18, fontWeight: "900" }}>
            Scan a trusted invite QR
          </Text>
          <Text style={{ color: "#cbd5e1", lineHeight: 19 }}>
            Only scan codes shared by someone you trust.
          </Text>
        </View>
        <SecondaryButton label="Cancel" onPress={() => router.back()} />
      </View>
    </View>
  );
}

function PrimaryButton({ label, onPress }: { label: string; onPress: () => void }) {
  return (
    <TouchableOpacity
      activeOpacity={0.85}
      onPress={onPress}
      style={{
        alignItems: "center",
        backgroundColor: "#7c3aed",
        borderRadius: 18,
        justifyContent: "center",
        minHeight: 52
      }}
    >
      <Text style={{ color: "#ffffff", fontWeight: "900" }}>{label}</Text>
    </TouchableOpacity>
  );
}

function SecondaryButton({ label, onPress }: { label: string; onPress: () => void }) {
  return (
    <TouchableOpacity
      activeOpacity={0.85}
      onPress={onPress}
      style={{
        alignItems: "center",
        backgroundColor: "#ffffff",
        borderRadius: 18,
        justifyContent: "center",
        minHeight: 50
      }}
    >
      <Text style={{ color: "#7c3aed", fontWeight: "900" }}>{label}</Text>
    </TouchableOpacity>
  );
}
