import { useCallback, useEffect, useState } from "react";
import type { ReactNode } from "react";
import { Text, TextInput, TouchableOpacity, View } from "react-native";

import { AppCard } from "@/components/ui/AppCard";
import {
  clearMedicationStandardMatch,
  clearSupplementIngredientMatch,
  completeSafetyChecklistItem,
  createAllergySensitivityNote,
  createProfessionalQuestionNote,
  dismissSafetyNotice,
  generateMedicationSafetyNotices,
  generateSupplementSafetyNotices,
  getAllergySensitivityNotes,
  getMedicationStandardMatch,
  getSafetyChecklist,
  getSafetyNotices,
  getSafetyStatusLabel,
  getSupplementIngredientMatch,
  saveMedicationStandardMatch,
  saveSupplementIngredientMatch,
  searchMedicationStandardNames,
  searchSupplementIngredients
} from "@/lib/medicationSafetyStorage";
import type {
  AllergySensitivityNote,
  Medication,
  MedicationStandardMatch,
  SafetyChecklistItem,
  SafetyNotice,
  Supplement,
  SupplementIngredientMatch
} from "@/types/medication";

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

export function MedicationSupplementSafetyDashboard({
  item,
  itemType,
  onChange
}: {
  item: Medication | Supplement | null;
  itemType: ItemType;
  onChange?: () => void;
}) {
  const [notices, setNotices] = useState<SafetyNotice[]>([]);
  const [checklist, setChecklist] = useState<SafetyChecklistItem[]>([]);
  const [allergies, setAllergies] = useState<AllergySensitivityNote[]>([]);
  const [medicationMatch, setMedicationMatch] = useState<MedicationStandardMatch | null>(null);
  const [supplementMatch, setSupplementMatch] = useState<SupplementIngredientMatch | null>(null);
  const [matchQuery, setMatchQuery] = useState("");
  const [allergyName, setAllergyName] = useState("");
  const [savedMessage, setSavedMessage] = useState<string | null>(null);
  const [exportMessage, setExportMessage] = useState<string | null>(null);

  const loadSafety = useCallback(async () => {
    if (!item) {
      setNotices([]);
      setChecklist([]);
      setAllergies(await getAllergySensitivityNotes());
      setMedicationMatch(null);
      setSupplementMatch(null);
      return;
    }

    if (itemType === "medication") {
      await generateMedicationSafetyNotices(item.id);
      setMedicationMatch(await getMedicationStandardMatch(item.id));
      setSupplementMatch(null);
    } else {
      await generateSupplementSafetyNotices(item.id);
      setSupplementMatch(await getSupplementIngredientMatch(item.id));
      setMedicationMatch(null);
    }

    const [nextNotices, nextChecklist, nextAllergies] = await Promise.all([
      getSafetyNotices(itemType, item.id),
      getSafetyChecklist(itemType, item.id),
      getAllergySensitivityNotes()
    ]);

    setNotices(nextNotices);
    setChecklist(nextChecklist);
    setAllergies(nextAllergies);
    setMatchQuery(itemType === "medication" ? item.name : getSupplementIngredientName(item));
  }, [item, itemType]);

  useEffect(() => {
    Promise.resolve().then(loadSafety).catch(() => undefined);
  }, [loadSafety]);

  async function saveManualMatch() {
    if (!item || !matchQuery.trim()) {
      return;
    }

    if (itemType === "medication") {
      const [candidate] = await searchMedicationStandardNames(matchQuery);
      await saveMedicationStandardMatch(item.id, candidate ?? { displayName: matchQuery, ingredientName: matchQuery, source: "manual" as const });
    } else {
      const [candidate] = await searchSupplementIngredients(matchQuery);
      await saveSupplementIngredientMatch(item.id, candidate ?? { displayName: matchQuery, ingredientName: matchQuery, source: "manual" as const });
    }

    setSavedMessage("Match saved for review. Confirm it matches your label or professional guidance.");
    await loadSafety();
    onChange?.();
  }

  async function clearMatch() {
    if (!item) {
      return;
    }

    if (itemType === "medication") {
      await clearMedicationStandardMatch(item.id);
    } else {
      await clearSupplementIngredientMatch(item.id);
    }

    await loadSafety();
    onChange?.();
  }

  async function saveAllergy() {
    if (!allergyName.trim()) {
      return;
    }

    await createAllergySensitivityNote({
      allergyName,
      allergyType: itemType,
      severity: "unknown"
    });
    setAllergyName("");
    await loadSafety();
  }

  async function askProfessional(professionalType: "pharmacist" | "doctor") {
    if (!item) {
      return;
    }

    await createProfessionalQuestionNote({
      itemName: item.name,
      professionalType,
      relatedId: item.id,
      relatedType: itemType
    });
    setSavedMessage(`Question saved for ${professionalType}.`);
    onChange?.();
  }

  return (
    <View style={{ gap: 12 }}>
      <AppCard backgroundColor="#fff7ed">
        <Text style={{ color: "#9a3412", fontSize: 20, fontWeight: "900" }}>Safety checks</Text>
        <Text style={{ color: "#9a3412", lineHeight: 21, marginTop: 6 }}>
          Safety checks are for organization and awareness only. They are not medical advice and do not replace a doctor, pharmacist, or healthcare professional. Always follow your prescription label, product label, and professional guidance.
        </Text>
      </AppCard>

      <Section title="Review Items">
        <Text style={{ color: "#64748b", lineHeight: 21 }}>
          Status: {getSafetyStatusLabel(item?.safetyStatus)}
        </Text>
        {!item ? <EmptyText text={itemType === "medication" ? "Add a medication to review safety notes." : "Add a supplement to review safety notes."} /> : null}
      </Section>

      <Section title={itemType === "medication" ? "Name Matching" : "Ingredient Matching"}>
        <Text style={{ color: "#64748b", lineHeight: 21 }}>
          {itemType === "medication"
            ? "Match medication name. User confirmation is required."
            : "Match main ingredient. User confirmation is required."}
        </Text>
        <TextInput onChangeText={setMatchQuery} placeholder={itemType === "medication" ? "Medication name" : "Main ingredient"} placeholderTextColor="#94a3b8" style={INPUT_STYLE} value={matchQuery} />
        {medicationMatch ? <MatchLine label="Medication match" value={medicationMatch.displayName} /> : null}
        {supplementMatch ? <MatchLine label="Supplement match" value={supplementMatch.displayName} /> : null}
        <View style={{ flexDirection: "row", gap: 10 }}>
          <ActionButton label="Save Match" onPress={saveManualMatch} />
          <SecondaryButton label="Clear" onPress={clearMatch} />
        </View>
      </Section>

      <Section title="Needs Confirmation">
        {notices.filter((notice) => notice.type === "confirm").length ? (
          notices.filter((notice) => notice.type === "confirm").map((notice) => (
            <NoticeCard key={notice.id} notice={notice} onDismiss={() => dismissSafetyNotice(notice.id).then(loadSafety)} />
          ))
        ) : (
          <EmptyText text="No confirmation prompts right now." />
        )}
      </Section>

      <Section title="Food Timing Notes">
        <NoticeGroup category="food_timing" notices={notices} onDismiss={loadSafety} />
      </Section>

      <Section title="Allergy Notes">
        <Text style={{ color: "#64748b", lineHeight: 21 }}>Check labels and ingredients if you have allergies or sensitivities.</Text>
        <TextInput onChangeText={setAllergyName} placeholder="Allergy or sensitivity note" placeholderTextColor="#94a3b8" style={INPUT_STYLE} value={allergyName} />
        <ActionButton label="Save Allergy Note" onPress={saveAllergy} />
        {allergies.slice(0, 4).map((allergy) => (
          <Text key={allergy.id} style={{ color: "#64748b", lineHeight: 21 }}>{allergy.allergyName} - {allergy.allergyType}</Text>
        ))}
        <NoticeGroup category="allergy" notices={notices} onDismiss={loadSafety} />
      </Section>

      <Section title="Duplicate Ingredient Notes">
        <NoticeGroup category="duplicate_ingredient" notices={notices} onDismiss={loadSafety} />
      </Section>

      <Section title="Profile-Specific Cautions">
        <NoticeGroup category="profile_caution" notices={notices} onDismiss={loadSafety} />
      </Section>

      <Section title="Data Source Status">
        <NoticeGroup category={itemType === "medication" ? "name_match" : "data_source"} notices={notices} onDismiss={loadSafety} />
      </Section>

      <Section title="Safety Checklist">
        {checklist.map((item) => (
          <TouchableOpacity
            activeOpacity={0.85}
            key={item.id}
            onPress={() => completeSafetyChecklistItem(item.id, !item.isCompleted).then(loadSafety)}
            style={{ backgroundColor: item.isCompleted ? "#ecfdf5" : "#f8fafc", borderRadius: 16, padding: 12 }}
          >
            <Text style={{ color: item.isCompleted ? "#047857" : "#475569", fontWeight: "900" }}>
              {item.isCompleted ? "Completed: " : ""}
              {item.label}
            </Text>
          </TouchableOpacity>
        ))}
      </Section>

      <Section title="Ask a Professional">
        <View style={{ flexDirection: "row", gap: 10 }}>
          <ActionButton label="Ask Pharmacist" onPress={() => askProfessional("pharmacist")} />
          <ActionButton label="Ask Doctor" onPress={() => askProfessional("doctor")} />
        </View>
        <SecondaryButton label="Export Medication/Supplement List" onPress={() => setExportMessage("Export will be added in a later phase.")} />
        {savedMessage ? <Text style={{ color: "#047857", lineHeight: 21 }}>{savedMessage}</Text> : null}
        {exportMessage ? <Text style={{ color: "#64748b", lineHeight: 21 }}>{exportMessage}</Text> : null}
      </Section>

      <Text style={{ color: "#64748b", fontSize: 12, lineHeight: 18 }}>
        If you experience severe symptoms or a medical emergency, contact local emergency services immediately.
      </Text>
    </View>
  );
}

function Section({ children, title }: { children: ReactNode; title: string }) {
  return (
    <AppCard>
      <View style={{ gap: 10 }}>
        <Text style={{ color: "#0f172a", fontSize: 20, fontWeight: "900" }}>{title}</Text>
        {children}
      </View>
    </AppCard>
  );
}

function NoticeGroup({
  category,
  notices,
  onDismiss
}: {
  category: SafetyNotice["category"];
  notices: SafetyNotice[];
  onDismiss: () => void;
}) {
  const matchingNotices = notices.filter((notice) => notice.category === category);

  if (!matchingNotices.length) {
    return <EmptyText text="No notes in this section right now." />;
  }

  return (
    <View style={{ gap: 8 }}>
      {matchingNotices.map((notice) => (
        <NoticeCard key={notice.id} notice={notice} onDismiss={() => dismissSafetyNotice(notice.id).then(onDismiss)} />
      ))}
    </View>
  );
}

function NoticeCard({ notice, onDismiss }: { notice: SafetyNotice; onDismiss: () => void }) {
  return (
    <View style={{ backgroundColor: getNoticeBackground(notice.type), borderRadius: 16, padding: 12 }}>
      <Text style={{ color: "#0f172a", fontWeight: "900" }}>{notice.title}</Text>
      <Text style={{ color: "#64748b", lineHeight: 20, marginTop: 4 }}>{notice.message}</Text>
      <TouchableOpacity activeOpacity={0.85} onPress={onDismiss} style={{ marginTop: 8 }}>
        <Text style={{ color: "#475569", fontWeight: "900" }}>Dismiss</Text>
      </TouchableOpacity>
    </View>
  );
}

function MatchLine({ label, value }: { label: string; value: string }) {
  return (
    <View style={{ backgroundColor: "#f8fafc", borderRadius: 16, padding: 12 }}>
      <Text style={{ color: "#64748b", fontSize: 12, fontWeight: "900" }}>{label}</Text>
      <Text style={{ color: "#0f172a", fontWeight: "900", marginTop: 4 }}>{value}</Text>
    </View>
  );
}

function ActionButton({ label, onPress }: { label: string; onPress: () => void }) {
  return (
    <TouchableOpacity activeOpacity={0.85} onPress={onPress} style={{ alignItems: "center", backgroundColor: "#0f172a", borderRadius: 16, flex: 1, justifyContent: "center", minHeight: 48 }}>
      <Text style={{ color: "#ffffff", fontWeight: "900" }}>{label}</Text>
    </TouchableOpacity>
  );
}

function SecondaryButton({ label, onPress }: { label: string; onPress: () => void }) {
  return (
    <TouchableOpacity activeOpacity={0.85} onPress={onPress} style={{ alignItems: "center", backgroundColor: "#f8fafc", borderRadius: 16, justifyContent: "center", minHeight: 48 }}>
      <Text style={{ color: "#475569", fontWeight: "900" }}>{label}</Text>
    </TouchableOpacity>
  );
}

function EmptyText({ text }: { text: string }) {
  return <Text style={{ color: "#64748b", lineHeight: 21 }}>{text}</Text>;
}

function getNoticeBackground(type: SafetyNotice["type"]) {
  switch (type) {
    case "confirm":
      return "#fffbeb";
    case "review":
      return "#f8fafc";
    case "urgent_professional_help":
      return "#fff7ed";
    default:
      return "#f0fdf4";
  }
}

function getSupplementIngredientName(item: Medication | Supplement) {
  return "mainIngredient" in item ? item.mainIngredient ?? item.name : item.name;
}
