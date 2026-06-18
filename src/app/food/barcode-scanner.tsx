import { Href, router } from "expo-router";
import {
  CameraView,
  useCameraPermissions,
  type BarcodeScanningResult,
} from "expo-camera";
import { useState } from "react";
import { Text, TextInput, TouchableOpacity, View } from "react-native";

import { ScreenWrapper } from "@/components/layout/ScreenWrapper";
import { AppCard } from "@/components/ui/AppCard";
import { isValidBarcode } from "@/services/nutrition/barcodeLookupService";

const BARCODE_TYPES = ["ean13", "ean8", "upc_a", "upc_e", "code128"];

const INPUT_STYLE = {
  backgroundColor: "#ffffff",
  borderColor: "#fde68a",
  borderRadius: 16,
  borderWidth: 1,
  color: "#0f172a",
  minHeight: 50,
  paddingHorizontal: 14,
};

export default function BarcodeScannerScreen() {
  const [permission, requestPermission] = useCameraPermissions();
  const [scanLocked, setScanLocked] = useState(false);
  const [torchEnabled, setTorchEnabled] = useState(false);
  const [manualBarcode, setManualBarcode] = useState("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  function openProduct(barcode: string, barcodeType?: string) {
    const normalizedBarcode = barcode.trim().replace(/\D/g, "");

    if (!isValidBarcode(normalizedBarcode)) {
      setErrorMessage("Enter a numeric barcode with 8 to 14 digits.");
      return;
    }

    const path = `/food/barcode-product?barcode=${encodeURIComponent(normalizedBarcode)}${barcodeType ? `&barcodeType=${encodeURIComponent(barcodeType)}` : ""}`;

    router.push(path as Href);
  }

  function handleBarcodeScanned(result: BarcodeScanningResult) {
    if (scanLocked || !result.data) {
      return;
    }

    setScanLocked(true);
    openProduct(result.data, result.type);
  }

  if (!permission) {
    return (
      <ScreenWrapper backgroundColor="#fffaf0">
        <AppCard>
          <Text style={{ color: "#64748b", lineHeight: 21 }}>
            Loading camera permission...
          </Text>
        </AppCard>
      </ScreenWrapper>
    );
  }

  if (!permission.granted) {
    return (
      <ScreenWrapper backgroundColor="#fffaf0">
        <AppCard>
          <View style={{ gap: 12 }}>
            <Text style={{ color: "#0f172a", fontSize: 22, fontWeight: "900" }}>
              Scan Barcode
            </Text>
            <Text style={{ color: "#64748b", lineHeight: 21 }}>
              Camera access is needed to scan barcodes. You can still enter the
              barcode manually.
            </Text>
            <PrimaryButton
              label="Allow Camera Access"
              onPress={requestPermission}
            />
            <SecondaryButton
              label="Back to Add"
              onPress={() =>
                router.replace({
                  pathname: "/(tabs)/food",
                  params: { tab: "add" },
                } as Href)
              }
            />
          </View>
        </AppCard>
        <ManualBarcodeEntry
          errorMessage={errorMessage}
          manualBarcode={manualBarcode}
          onBarcodeChange={setManualBarcode}
          onSearch={() => openProduct(manualBarcode)}
        />
      </ScreenWrapper>
    );
  }

  return (
    <View style={{ backgroundColor: "#0f172a", flex: 1 }}>
      <CameraView
        barcodeScannerSettings={{ barcodeTypes: BARCODE_TYPES as never }}
        enableTorch={torchEnabled}
        facing="back"
        onBarcodeScanned={handleBarcodeScanned}
        style={{ flex: 1 }}
      >
        <View
          style={{
            flex: 1,
            justifyContent: "space-between",
            padding: 20,
            paddingTop: 56,
          }}
        >
          <View
            style={{
              alignItems: "center",
              flexDirection: "row",
              justifyContent: "space-between",
            }}
          >
            <TouchableOpacity
              activeOpacity={0.85}
              onPress={() => router.back()}
              style={overlayButtonStyle}
            >
              <Text style={overlayButtonTextStyle}>Back</Text>
            </TouchableOpacity>
            <TouchableOpacity
              activeOpacity={0.85}
              onPress={() => setTorchEnabled((current) => !current)}
              style={overlayButtonStyle}
            >
              <Text style={overlayButtonTextStyle}>
                {torchEnabled ? "Torch On" : "Torch"}
              </Text>
            </TouchableOpacity>
          </View>

          <View style={{ alignItems: "center", gap: 18 }}>
            <View
              style={{
                borderColor: "#f59e0b",
                borderRadius: 28,
                borderWidth: 3,
                height: 220,
                width: "82%",
              }}
            />
            <Text
              style={{
                color: "#ffffff",
                fontSize: 17,
                fontWeight: "900",
                textAlign: "center",
              }}
            >
              Place the barcode inside the frame.
            </Text>
            {scanLocked ? (
              <TouchableOpacity
                activeOpacity={0.85}
                onPress={() => setScanLocked(false)}
                style={overlayButtonStyle}
              >
                <Text style={overlayButtonTextStyle}>Scan again</Text>
              </TouchableOpacity>
            ) : null}
          </View>

          <ManualBarcodeEntry
            dark
            errorMessage={errorMessage}
            manualBarcode={manualBarcode}
            onBarcodeChange={setManualBarcode}
            onSearch={() => openProduct(manualBarcode)}
          />
        </View>
      </CameraView>
    </View>
  );
}

function ManualBarcodeEntry({
  dark = false,
  errorMessage,
  manualBarcode,
  onBarcodeChange,
  onSearch,
}: {
  dark?: boolean;
  errorMessage: string | null;
  manualBarcode: string;
  onBarcodeChange: (value: string) => void;
  onSearch: () => void;
}) {
  return (
    <AppCard backgroundColor={dark ? "rgba(255,255,255,0.92)" : "#ffffff"}>
      <View style={{ gap: 10 }}>
        <Text style={{ color: "#0f172a", fontSize: 18, fontWeight: "900" }}>
          Enter barcode manually
        </Text>
        <TextInput
          keyboardType="numeric"
          onChangeText={(value) => onBarcodeChange(value.replace(/\D/g, ""))}
          placeholder="Barcode number"
          placeholderTextColor="#94a3b8"
          style={INPUT_STYLE}
          value={manualBarcode}
        />
        {errorMessage ? (
          <Text style={{ color: "#dc2626", fontWeight: "800" }}>
            {errorMessage}
          </Text>
        ) : null}
        <PrimaryButton label="Search" onPress={onSearch} />
      </View>
    </AppCard>
  );
}

function PrimaryButton({
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
        backgroundColor: "#f59e0b",
        borderRadius: 18,
        justifyContent: "center",
        minHeight: 50,
      }}
    >
      <Text style={{ color: "#ffffff", fontSize: 16, fontWeight: "900" }}>
        {label}
      </Text>
    </TouchableOpacity>
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
        backgroundColor: "#fffbeb",
        borderRadius: 18,
        justifyContent: "center",
        minHeight: 50,
      }}
    >
      <Text style={{ color: "#92400e", fontSize: 16, fontWeight: "900" }}>
        {label}
      </Text>
    </TouchableOpacity>
  );
}

const overlayButtonStyle = {
  backgroundColor: "rgba(15,23,42,0.72)",
  borderRadius: 999,
  paddingHorizontal: 16,
  paddingVertical: 10,
};

const overlayButtonTextStyle = {
  color: "#ffffff",
  fontWeight: "900" as const,
};
