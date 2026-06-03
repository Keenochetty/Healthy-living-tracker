import { useEffect, useState } from "react";
import { Switch, Text, TextInput, TouchableOpacity, View } from "react-native";

import { CAREGIVER_SERVICE_OPTIONS } from "@/constants/caregiverOptions";
import { createCaregiverProfile } from "@/lib/caregiverStorage";
import { getUserPreferences } from "@/lib/userPreferences";
import type { CaregiverProfile, CaregiverServiceType } from "@/types/caregiver";
import { AppCard } from "@/components/ui/AppCard";
import { CaregiverChip } from "./CaregiverChip";

type AddCaregiverProfileCardProps = {
  onCreated?: (profile: CaregiverProfile) => void;
};

export function AddCaregiverProfileCard({ onCreated }: AddCaregiverProfileCardProps) {
  const [bio, setBio] = useState("");
  const [catersForAdults, setCatersForAdults] = useState(false);
  const [catersForBabies, setCatersForBabies] = useState(false);
  const [catersForChildren, setCatersForChildren] = useState(false);
  const [catersForSpecialNeeds, setCatersForSpecialNeeds] = useState(false);
  const [country, setCountry] = useState("South Africa");
  const [currency, setCurrency] = useState("ZAR");
  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [experienceYears, setExperienceYears] = useState("");
  const [phone, setPhone] = useState("");
  const [schoolOrAgencyName, setSchoolOrAgencyName] = useState("");
  const [services, setServices] = useState<CaregiverServiceType[]>([]);

  useEffect(() => {
    let isActive = true;

    getUserPreferences().then((preferences) => {
      if (isActive) {
        setCountry(preferences.country);
        setCurrency(preferences.currency);
      }
    });

    return () => {
      isActive = false;
    };
  }, []);

  function toggleService(service: CaregiverServiceType) {
    setServices((current) =>
      current.includes(service) ? current.filter((item) => item !== service) : [...current, service]
    );
  }

  async function handleSave() {
    if (!displayName.trim()) return;

    const profile = await createCaregiverProfile({
      bio,
      catersForAdults,
      catersForBabies,
      catersForChildren,
      catersForSpecialNeeds,
      country,
      currency,
      displayName,
      email: email.trim() || undefined,
      experienceYears: Number(experienceYears) || undefined,
      phone: phone.trim() || undefined,
      photoUri: "placeholder-caregiver-photo",
      schoolOrAgencyName: schoolOrAgencyName.trim() || undefined,
      services
    });

    setDisplayName("");
    setBio("");
    onCreated?.(profile);
  }

  return (
    <AppCard>
      <View style={{ gap: 12 }}>
        <Text style={{ color: "#0f172a", fontSize: 20, fontWeight: "900" }}>
          Add caregiver profile
        </Text>
        <View style={{ alignItems: "center", backgroundColor: "#eef2ff", borderRadius: 24, height: 90, justifyContent: "center" }}>
          <Text style={{ color: "#4f46e5", fontWeight: "900" }}>Photo placeholder</Text>
        </View>
        <TextInput onChangeText={setDisplayName} placeholder="Display name" placeholderTextColor="#94a3b8" style={inputStyle} value={displayName} />
        <TextInput onChangeText={setEmail} placeholder="Email, optional" placeholderTextColor="#94a3b8" style={inputStyle} value={email} />
        <TextInput onChangeText={setPhone} placeholder="Phone, optional" placeholderTextColor="#94a3b8" style={inputStyle} value={phone} />
        <TextInput onChangeText={setCountry} placeholder="Country" placeholderTextColor="#94a3b8" style={inputStyle} value={country} />
        <TextInput onChangeText={setCurrency} placeholder="Currency" placeholderTextColor="#94a3b8" style={inputStyle} value={currency} />
        <TextInput multiline onChangeText={setBio} placeholder="Bio" placeholderTextColor="#94a3b8" style={[inputStyle, { minHeight: 76, textAlignVertical: "top" }]} value={bio} />
        <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
          {CAREGIVER_SERVICE_OPTIONS.map((option) => (
            <CaregiverChip
              key={option.key}
              label={option.label}
              onPress={() => toggleService(option.key)}
              selected={services.includes(option.key)}
            />
          ))}
        </View>
        <ToggleRow label="Caters for adults" onValueChange={setCatersForAdults} value={catersForAdults} />
        <ToggleRow label="Caters for children" onValueChange={setCatersForChildren} value={catersForChildren} />
        <ToggleRow label="Caters for babies" onValueChange={setCatersForBabies} value={catersForBabies} />
        <ToggleRow label="Special needs support" onValueChange={setCatersForSpecialNeeds} value={catersForSpecialNeeds} />
        <TextInput keyboardType="numeric" onChangeText={setExperienceYears} placeholder="Experience years" placeholderTextColor="#94a3b8" style={inputStyle} value={experienceYears} />
        <TextInput onChangeText={setSchoolOrAgencyName} placeholder="School or agency name" placeholderTextColor="#94a3b8" style={inputStyle} value={schoolOrAgencyName} />
        <TouchableOpacity activeOpacity={0.85} onPress={handleSave} style={buttonStyle}>
          <Text style={{ color: "#ffffff", fontWeight: "900" }}>Save caregiver profile</Text>
        </TouchableOpacity>
      </View>
    </AppCard>
  );
}

function ToggleRow({ label, onValueChange, value }: { label: string; onValueChange: (value: boolean) => void; value: boolean }) {
  return (
    <View style={{ alignItems: "center", flexDirection: "row", justifyContent: "space-between" }}>
      <Text style={{ color: "#0f172a", fontWeight: "800" }}>{label}</Text>
      <Switch onValueChange={onValueChange} value={value} />
    </View>
  );
}

const inputStyle = {
  backgroundColor: "#f8fafc",
  borderColor: "#e2e8f0",
  borderRadius: 18,
  borderWidth: 1,
  color: "#0f172a",
  minHeight: 50,
  paddingHorizontal: 14
};

const buttonStyle = {
  alignItems: "center" as const,
  backgroundColor: "#4f46e5",
  borderRadius: 18,
  justifyContent: "center" as const,
  minHeight: 52
};
