import * as ImagePicker from "expo-image-picker";
import { Href, router } from "expo-router";
import { useState } from "react";
import { Image, Switch, Text, TextInput, TouchableOpacity, View } from "react-native";

import { AppCard } from "@/components/ui/AppCard";
import {
  createHealthDocument,
  createHealthSchedule,
  createMedication,
  createSupplement,
  FOOD_TIMING_OPTIONS,
  MEDICATION_FORM_OPTIONS,
  SCHEDULE_TIMING_OPTIONS,
  SUPPLEMENT_FORM_OPTIONS
} from "@/lib/medicationSupplementStorage";
import type { FoodTiming, MedicationForm, ScheduleTiming, SupplementForm } from "@/types/medication";

type ItemType = "medication" | "supplement";

const INPUT_STYLE = {
  backgroundColor: "#ffffff",
  borderColor: "#e2e8f0",
  borderRadius: 16,
  borderWidth: 1,
  color: "#0f172a",
  minHeight: 50,
  paddingHorizontal: 14
};

export function MedicationSupplementForm({ itemType }: { itemType: ItemType }) {
  const [name, setName] = useState("");
  const [genericName, setGenericName] = useState("");
  const [brandName, setBrandName] = useState("");
  const [mainIngredient, setMainIngredient] = useState("");
  const [strength, setStrength] = useState("");
  const [form, setForm] = useState<MedicationForm | SupplementForm>(itemType === "medication" ? "tablet" : "capsule");
  const [amount, setAmount] = useState("");
  const [unit, setUnit] = useState("");
  const [instructions, setInstructions] = useState("");
  const [prescribedBy, setPrescribedBy] = useState("");
  const [pharmacy, setPharmacy] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [reason, setReason] = useState("");
  const [notes, setNotes] = useState("");
  const [isPrivate, setIsPrivate] = useState(true);
  const [timing, setTiming] = useState<ScheduleTiming>("once_daily");
  const [timesText, setTimesText] = useState("08:00");
  const [foodTiming, setFoodTiming] = useState<FoodTiming>("none");
  const [scheduleInstructions, setScheduleInstructions] = useState("");
  const [imageUri, setImageUri] = useState<string | undefined>();

  async function pickImage() {
    const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ImagePicker.MediaTypeOptions.Images, quality: 0.7 });

    if (!result.canceled) {
      setImageUri(result.assets[0]?.uri);
    }
  }

  async function saveItem() {
    if (!name.trim()) {
      return;
    }

    const savedItem = itemType === "medication"
      ? await createMedication({
          brandName,
          doseAmount: Number(amount) || undefined,
          doseUnit: unit,
          form: form as MedicationForm,
          genericName,
          instructions,
          name,
          notes,
          pharmacy,
          prescribedBy,
          reason,
          startDate,
          endDate,
          strength
        })
      : await createSupplement({
          brand: brandName,
          form: form as SupplementForm,
          instructions,
          mainIngredient,
          name,
          notes,
          reason,
          servingAmount: Number(amount) || undefined,
          servingUnit: unit,
          startDate,
          endDate,
          strength
        });

    await createHealthSchedule({
      customInstructions: scheduleInstructions,
      foodTiming,
      itemId: savedItem.id,
      itemType,
      reminderEnabled: true,
      timing,
      times: timesText.split(",").map((time) => time.trim()).filter(Boolean)
    });

    if (imageUri) {
      await createHealthDocument({
        fileType: "image",
        fileUrl: imageUri,
        relatedId: savedItem.id,
        relatedType: itemType,
        title: itemType === "medication" ? "Prescription or label photo" : "Supplement label photo"
      });
    }

    router.replace(`/${itemType === "medication" ? "medication" : "supplements"}/${savedItem.id}` as Href);
  }

  return (
    <View style={{ gap: 12 }}>
      <View style={{ gap: 4 }}>
        <Text style={{ color: getAccentColor(itemType), fontSize: 14, fontWeight: "800" }}>Health realm</Text>
        <Text style={{ color: "#0f172a", fontSize: 30, fontWeight: "900" }}>
          {itemType === "medication" ? "Add Medication" : "Add Supplement"}
        </Text>
      </View>

      <AppCard backgroundColor="#fff7ed">
        <Text style={{ color: "#9a3412", lineHeight: 21 }}>
          {itemType === "medication"
            ? "Medication tracking helps you remember and record your schedule. Always follow your prescription label or healthcare professional's instructions."
            : "Supplement tracking is for personal organization only. Speak to a healthcare professional if you take medication, are pregnant, have a medical condition, or are unsure about a supplement."}
        </Text>
      </AppCard>

      <AppCard>
        <View style={{ gap: 12 }}>
          <Text style={{ color: "#0f172a", fontSize: 20, fontWeight: "900" }}>{itemType === "medication" ? "Medication details" : "Supplement details"}</Text>
          <TextInput onChangeText={setName} placeholder={itemType === "medication" ? "Medication name" : "Supplement name"} placeholderTextColor="#94a3b8" style={INPUT_STYLE} value={name} />
          {itemType === "medication" ? (
            <TextInput onChangeText={setGenericName} placeholder="Generic name optional" placeholderTextColor="#94a3b8" style={INPUT_STYLE} value={genericName} />
          ) : (
            <TextInput onChangeText={setMainIngredient} placeholder="Main ingredient optional" placeholderTextColor="#94a3b8" style={INPUT_STYLE} value={mainIngredient} />
          )}
          <TextInput onChangeText={setBrandName} placeholder={itemType === "medication" ? "Brand name optional" : "Brand optional"} placeholderTextColor="#94a3b8" style={INPUT_STYLE} value={brandName} />
          <TextInput onChangeText={setStrength} placeholder="Strength, e.g. 500 mg" placeholderTextColor="#94a3b8" style={INPUT_STYLE} value={strength} />
          <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
            {(itemType === "medication" ? MEDICATION_FORM_OPTIONS : SUPPLEMENT_FORM_OPTIONS).map((option) => (
              <Chip key={option.key} label={option.label} selected={form === option.key} onPress={() => setForm(option.key)} />
            ))}
          </View>
          <View style={{ flexDirection: "row", gap: 10 }}>
            <TextInput keyboardType="numeric" onChangeText={setAmount} placeholder={itemType === "medication" ? "Dose amount" : "Serving amount"} placeholderTextColor="#94a3b8" style={{ ...INPUT_STYLE, flex: 1 }} value={amount} />
            <TextInput onChangeText={setUnit} placeholder={itemType === "medication" ? "Dose unit" : "Serving unit"} placeholderTextColor="#94a3b8" style={{ ...INPUT_STYLE, flex: 1 }} value={unit} />
          </View>
          <TextInput multiline onChangeText={setInstructions} placeholder="Instructions from label optional" placeholderTextColor="#94a3b8" style={{ ...INPUT_STYLE, minHeight: 90, paddingTop: 13 }} value={instructions} />
          {itemType === "medication" ? (
            <>
              <TextInput onChangeText={setPrescribedBy} placeholder="Prescribed by optional" placeholderTextColor="#94a3b8" style={INPUT_STYLE} value={prescribedBy} />
              <TextInput onChangeText={setPharmacy} placeholder="Pharmacy optional" placeholderTextColor="#94a3b8" style={INPUT_STYLE} value={pharmacy} />
            </>
          ) : null}
          <View style={{ flexDirection: "row", gap: 10 }}>
            <TextInput onChangeText={setStartDate} placeholder="Start date YYYY-MM-DD" placeholderTextColor="#94a3b8" style={{ ...INPUT_STYLE, flex: 1 }} value={startDate} />
            <TextInput onChangeText={setEndDate} placeholder="End date optional" placeholderTextColor="#94a3b8" style={{ ...INPUT_STYLE, flex: 1 }} value={endDate} />
          </View>
          <TextInput onChangeText={setReason} placeholder={itemType === "medication" ? "Reason / purpose optional" : "Reason / goal optional"} placeholderTextColor="#94a3b8" style={INPUT_STYLE} value={reason} />
          <TextInput multiline onChangeText={setNotes} placeholder="Notes" placeholderTextColor="#94a3b8" style={{ ...INPUT_STYLE, minHeight: 90, paddingTop: 13 }} value={notes} />
          <View style={{ alignItems: "center", backgroundColor: "#f8fafc", borderRadius: 16, flexDirection: "row", justifyContent: "space-between", padding: 12 }}>
            <Text style={{ color: "#0f172a", fontWeight: "900" }}>Private</Text>
            <Switch onValueChange={setIsPrivate} value={isPrivate} />
          </View>
        </View>
      </AppCard>

      <AppCard>
        <View style={{ gap: 12 }}>
          <Text style={{ color: "#0f172a", fontSize: 20, fontWeight: "900" }}>Schedule</Text>
          <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
            {SCHEDULE_TIMING_OPTIONS.map((option) => (
              <Chip key={option.key} label={option.label} selected={timing === option.key} onPress={() => setTiming(option.key)} />
            ))}
          </View>
          <TextInput onChangeText={setTimesText} placeholder="Times, e.g. 08:00, 20:00" placeholderTextColor="#94a3b8" style={INPUT_STYLE} value={timesText} />
          <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
            {FOOD_TIMING_OPTIONS.map((option) => (
              <Chip key={option.key} label={option.label} selected={foodTiming === option.key} onPress={() => setFoodTiming(option.key)} />
            ))}
          </View>
          {foodTiming !== "none" ? (
            <Text style={{ color: "#64748b", lineHeight: 21 }}>
              Food timing notes should follow your label, pharmacist, doctor, or healthcare professional's instructions.
            </Text>
          ) : null}
          <TextInput multiline onChangeText={setScheduleInstructions} placeholder="Schedule instructions optional" placeholderTextColor="#94a3b8" style={{ ...INPUT_STYLE, minHeight: 90, paddingTop: 13 }} value={scheduleInstructions} />
        </View>
      </AppCard>

      <AppCard>
        <View style={{ gap: 12 }}>
          <Text style={{ color: "#0f172a", fontSize: 20, fontWeight: "900" }}>{itemType === "medication" ? "Prescription photo/document optional" : "Label photo optional"}</Text>
          {imageUri ? <Image alt="Selected document" source={{ uri: imageUri }} style={{ backgroundColor: "#f8fafc", borderRadius: 16, height: 160, width: "100%" }} /> : null}
          <SecondaryButton label="Choose image placeholder" onPress={pickImage} />
        </View>
      </AppCard>

      <PrimaryButton disabled={!name.trim()} label={itemType === "medication" ? "Save Medication" : "Save Supplement"} onPress={saveItem} />
    </View>
  );
}

function Chip({ label, onPress, selected }: { label: string; onPress: () => void; selected: boolean }) {
  return (
    <TouchableOpacity activeOpacity={0.85} onPress={onPress} style={{ backgroundColor: selected ? "#0f172a" : "#f8fafc", borderRadius: 999, paddingHorizontal: 12, paddingVertical: 9 }}>
      <Text style={{ color: selected ? "#ffffff" : "#475569", fontWeight: "900" }}>{label}</Text>
    </TouchableOpacity>
  );
}

function PrimaryButton({ disabled = false, label, onPress }: { disabled?: boolean; label: string; onPress: () => void }) {
  return (
    <TouchableOpacity activeOpacity={0.85} disabled={disabled} onPress={onPress} style={{ alignItems: "center", backgroundColor: "#0f172a", borderRadius: 18, justifyContent: "center", minHeight: 52, opacity: disabled ? 0.55 : 1 }}>
      <Text style={{ color: "#ffffff", fontSize: 16, fontWeight: "900" }}>{label}</Text>
    </TouchableOpacity>
  );
}

function SecondaryButton({ label, onPress }: { label: string; onPress: () => void }) {
  return (
    <TouchableOpacity activeOpacity={0.85} onPress={onPress} style={{ alignItems: "center", backgroundColor: "#f8fafc", borderRadius: 18, justifyContent: "center", minHeight: 52 }}>
      <Text style={{ color: "#475569", fontWeight: "900" }}>{label}</Text>
    </TouchableOpacity>
  );
}

function getAccentColor(itemType: ItemType) {
  return itemType === "medication" ? "#ef4444" : "#14b8a6";
}
