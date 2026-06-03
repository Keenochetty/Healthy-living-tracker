import { useEffect, useState } from "react";
import { Text, TextInput, TouchableOpacity, View } from "react-native";

import { CAREGIVER_RATE_TYPE_LABELS } from "@/constants/caregiverOptions";
import { addCaregiverRate, deleteCaregiverRate, getCaregiverRates } from "@/lib/caregiverStorage";
import type { CaregiverRate, CaregiverRateType } from "@/types/caregiver";
import { AppCard } from "@/components/ui/AppCard";
import { CaregiverChip } from "./CaregiverChip";

type CaregiverRateCardProps = {
  caregiverId: string;
  currency: string;
  onChange?: () => void;
};

export function CaregiverRateCard({ caregiverId, currency, onChange }: CaregiverRateCardProps) {
  const [amount, setAmount] = useState("");
  const [notes, setNotes] = useState("");
  const [rateType, setRateType] = useState<CaregiverRateType>("hourly");
  const [rates, setRates] = useState<CaregiverRate[]>([]);

  async function loadRates() {
    setRates(await getCaregiverRates(caregiverId));
  }

  useEffect(() => {
    let isActive = true;
    getCaregiverRates(caregiverId).then((nextRates) => {
      if (isActive) setRates(nextRates);
    });
    return () => {
      isActive = false;
    };
  }, [caregiverId]);

  async function handleSave() {
    const parsedAmount = Number(amount);
    if (!Number.isFinite(parsedAmount) || parsedAmount <= 0) return;
    await addCaregiverRate({ amount: parsedAmount, caregiverId, currency, notes, rateType });
    setAmount("");
    setNotes("");
    await loadRates();
    onChange?.();
  }

  async function handleDelete(rateId: string) {
    await deleteCaregiverRate(rateId);
    await loadRates();
    onChange?.();
  }

  return (
    <AppCard>
      <View style={{ gap: 12 }}>
        <Text style={{ color: "#0f172a", fontSize: 20, fontWeight: "900" }}>Rates</Text>
        {rates.map((rate) => (
          <View key={rate.id} style={{ backgroundColor: "#f8fafc", borderRadius: 16, padding: 12 }}>
            <Text style={{ color: "#0f172a", fontWeight: "900" }}>
              {rate.currency} {rate.amount}/{rate.rateType}
            </Text>
            <Text style={{ color: "#64748b", marginTop: 3 }}>{rate.notes ?? "No notes"}</Text>
            <TouchableOpacity onPress={() => handleDelete(rate.id)} style={smallButtonStyle}>
              <Text style={{ color: "#4f46e5", fontWeight: "900" }}>Delete</Text>
            </TouchableOpacity>
          </View>
        ))}
        <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
          {(Object.keys(CAREGIVER_RATE_TYPE_LABELS) as CaregiverRateType[]).map((type) => (
            <CaregiverChip key={type} label={type} onPress={() => setRateType(type)} selected={rateType === type} />
          ))}
        </View>
        <TextInput keyboardType="decimal-pad" onChangeText={setAmount} placeholder={`Amount in ${currency}`} placeholderTextColor="#94a3b8" style={inputStyle} value={amount} />
        <TextInput onChangeText={setNotes} placeholder="Notes, optional" placeholderTextColor="#94a3b8" style={inputStyle} value={notes} />
        <TouchableOpacity activeOpacity={0.85} onPress={handleSave} style={buttonStyle}>
          <Text style={{ color: "#ffffff", fontWeight: "900" }}>Add rate</Text>
        </TouchableOpacity>
      </View>
    </AppCard>
  );
}

const inputStyle = { backgroundColor: "#f8fafc", borderColor: "#e2e8f0", borderRadius: 18, borderWidth: 1, color: "#0f172a", minHeight: 50, paddingHorizontal: 14 };
const buttonStyle = { alignItems: "center" as const, backgroundColor: "#4f46e5", borderRadius: 18, justifyContent: "center" as const, minHeight: 52 };
const smallButtonStyle = { alignItems: "center" as const, backgroundColor: "#eef2ff", borderRadius: 12, justifyContent: "center" as const, marginTop: 8, minHeight: 38 };
