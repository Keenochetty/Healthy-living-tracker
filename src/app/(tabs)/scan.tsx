import { Href, router } from "expo-router";
import { Camera, FileText, ScanBarcode, Sparkles } from "lucide-react-native";
import { Text, View } from "react-native";

import { AppMainLayout } from "@/components/layout/AppMainLayout";
import { AppButton, AppCard, AppSection } from "@/components/ui";
import { useAppTheme } from "@/theme/ThemeProvider";

const SCAN_ACTIONS = [
  {
    description:
      "Scan a food barcode and review product details before logging.",
    href: "/food/barcode-scanner",
    icon: ScanBarcode,
    label: "Food barcode",
  },
  {
    description:
      "Use assisted capture for prescriptions, documents, food, and health records.",
    href: "/ai",
    icon: Sparkles,
    label: "AI-assisted scan",
  },
  {
    description: "Scan a trusted QR code to join a Family Circle.",
    href: "/scan-invite",
    icon: Camera,
    label: "Circle invite",
  },
  {
    description: "Open health records and document capture options.",
    href: "/records",
    icon: FileText,
    label: "Health record",
  },
] as const;

export default function ScanScreen() {
  const { theme } = useAppTheme();

  return (
    <AppMainLayout subtitle="Quick capture" title="Scan">
      <AppCard variant="primary">
        <Text style={{ color: "#ffffff", fontSize: 24, fontWeight: "900" }}>
          Capture health information
        </Text>
        <Text style={{ color: "#ffffff", lineHeight: 21, marginTop: 8 }}>
          Choose what to scan. You will review captured information before
          anything is saved.
        </Text>
      </AppCard>

      <AppSection
        subtitle="Camera and document permissions are requested only when the selected action needs them."
        title="Start a scan"
      >
        <View style={{ gap: 12 }}>
          {SCAN_ACTIONS.map((action) => {
            const Icon = action.icon;

            return (
              <AppCard key={action.label}>
                <View
                  style={{
                    alignItems: "center",
                    flexDirection: "row",
                    gap: 14,
                  }}
                >
                  <Icon color={theme.primary} size={26} />
                  <View style={{ flex: 1 }}>
                    <Text
                      style={{
                        color: theme.text,
                        fontSize: 17,
                        fontWeight: "900",
                      }}
                    >
                      {action.label}
                    </Text>
                    <Text
                      style={{
                        color: theme.mutedText,
                        lineHeight: 20,
                        marginTop: 4,
                      }}
                    >
                      {action.description}
                    </Text>
                  </View>
                </View>
                <AppButton
                  fullWidth
                  onPress={() => router.push(action.href as Href)}
                  style={{ marginTop: 16 }}
                  title={`Open ${action.label}`}
                  variant="secondary"
                />
              </AppCard>
            );
          })}
        </View>
      </AppSection>
    </AppMainLayout>
  );
}
