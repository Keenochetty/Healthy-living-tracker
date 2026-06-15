import { useEffect, useState } from "react";
import { Switch, Text, TextInput, View } from "react-native";

import { getCycleSettings, updateCycleSettings } from "@/lib/cycleStorage";
import type { CycleSettings } from "@/types/cycle";
import { AppCard } from "@/components/ui/AppCard";

type CycleSettingsCardProps = {
  onChange?: () => void;
};

export function CycleSettingsCard({ onChange }: CycleSettingsCardProps) {
  const [settings, setSettings] = useState<CycleSettings | null>(null);

  useEffect(() => {
    let isActive = true;

    getCycleSettings().then((nextSettings) => {
      if (isActive) {
        setSettings(nextSettings);
      }
    });

    return () => {
      isActive = false;
    };
  }, []);

  async function updateField(partial: Partial<CycleSettings>) {
    const saved = await updateCycleSettings(partial);

    setSettings(saved);
    onChange?.();
  }

  if (!settings) return null;

  return (
    <AppCard>
      <View style={{ gap: 12 }}>
        <View>
          <Text style={{ color: "#0f172a", fontSize: 20, fontWeight: "900" }}>
            Cycle settings
          </Text>
          <Text style={{ color: "#64748b", lineHeight: 20, marginTop: 4 }}>
            These settings support estimates only.
          </Text>
        </View>

        <LabelledInput
          label="Average cycle length"
          onBlur={(value) =>
            updateField({ averageCycleLengthDays: toPositiveNumber(value, 28) })
          }
          suffix="days"
          value={`${settings.averageCycleLengthDays}`}
        />
        <LabelledInput
          label="Average period length"
          onBlur={(value) =>
            updateField({ averagePeriodLengthDays: toPositiveNumber(value, 5) })
          }
          suffix="days"
          value={`${settings.averagePeriodLengthDays}`}
        />
        <LabelledInput
          label="Last period start date"
          onBlur={(value) =>
            updateField({ lastPeriodStartDate: value.trim() || undefined })
          }
          placeholder="YYYY-MM-DD"
          value={settings.lastPeriodStartDate ?? ""}
        />

        <ToggleRow
          label="Prediction estimates"
          onChange={(value) => updateField({ predictionEnabled: value })}
          value={settings.predictionEnabled}
        />
        <ToggleRow
          label="Private mode locked on"
          value={settings.privateMode}
        />
        <ToggleRow
          label="Partner sharing off"
          value={settings.partnerSharingEnabled}
        />

        <Text style={{ color: "#94a3b8", lineHeight: 20 }}>
          Sharing controls will come later and are always off by default.
        </Text>
      </View>
    </AppCard>
  );
}

function LabelledInput({
  label,
  onBlur,
  placeholder,
  suffix,
  value,
}: {
  label: string;
  onBlur: (value: string) => void;
  placeholder?: string;
  suffix?: string;
  value: string;
}) {
  return (
    <View style={{ gap: 6 }}>
      <Text style={{ color: "#64748b", fontWeight: "800" }}>
        {label}
        {suffix ? ` (${suffix})` : ""}
      </Text>
      <TextInput
        defaultValue={value}
        onEndEditing={(event) => onBlur(event.nativeEvent.text)}
        placeholder={placeholder}
        placeholderTextColor="#94a3b8"
        style={inputStyle}
      />
    </View>
  );
}

function ToggleRow({
  label,
  onChange,
  value,
}: {
  label: string;
  onChange?: (value: boolean) => void;
  value: boolean;
}) {
  return (
    <View
      style={{
        alignItems: "center",
        flexDirection: "row",
        justifyContent: "space-between",
      }}
    >
      <Text style={{ color: "#0f172a", fontWeight: "800" }}>{label}</Text>
      <Switch disabled={!onChange} onValueChange={onChange} value={value} />
    </View>
  );
}

function toPositiveNumber(value: string, fallback: number) {
  const parsed = Number(value);

  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

const inputStyle = {
  backgroundColor: "#f8fafc",
  borderColor: "#e2e8f0",
  borderRadius: 18,
  borderWidth: 1,
  color: "#0f172a",
  minHeight: 50,
  paddingHorizontal: 14,
};
