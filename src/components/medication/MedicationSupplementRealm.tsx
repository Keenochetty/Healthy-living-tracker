import * as ImagePicker from "expo-image-picker";
import { Href, router } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import { Image, Text, TextInput, TouchableOpacity, View } from "react-native";

import { AppCard } from "@/components/ui/AppCard";
import {
  archiveMedication,
  archiveSupplement,
  calculateTodayMedicationSchedule,
  calculateTodaySupplementSchedule,
  createHealthDocument,
  createHealthSchedule,
  createMedicationSupplementNote,
  deleteHealthDocument,
  deleteHealthSchedule,
  FOOD_TIMING_OPTIONS,
  getHealthDocumentsByItem,
  getMedicationAdherenceSummary,
  getMedicationById,
  getMedications,
  getNotesByDate,
  getNotesByItem,
  getSchedulesByItem,
  getSupplementAdherenceSummary,
  getSupplementById,
  getSupplements,
  getDoseLogsByItem,
  markDoseSkipped,
  markDoseTaken,
  MEDICATION_FORM_OPTIONS,
  SCHEDULE_TIMING_OPTIONS,
  snoozeDoseReminder,
  SUPPLEMENT_FORM_OPTIONS,
  updateHealthSchedule
} from "@/lib/medicationSupplementStorage";
import type {
  AdherenceSummary,
  FoodTiming,
  HealthDocument,
  HealthSchedule,
  HealthScheduleReminder,
  Medication,
  MedicationSupplementNote,
  ScheduleTiming,
  Supplement
} from "@/types/medication";

type ItemType = "medication" | "supplement";
type RealmTab = "today" | "items" | "schedule" | "logs" | "documents" | "notes";

const INPUT_STYLE = {
  backgroundColor: "#ffffff",
  borderColor: "#e2e8f0",
  borderRadius: 16,
  borderWidth: 1,
  color: "#0f172a",
  minHeight: 50,
  paddingHorizontal: 14
};

const MEDICATION_TABS: Array<{ key: RealmTab; label: string }> = [
  { key: "today", label: "Today" },
  { key: "items", label: "My Meds" },
  { key: "schedule", label: "Schedule" },
  { key: "logs", label: "Logs" },
  { key: "documents", label: "Documents" },
  { key: "notes", label: "Notes" }
];

const SUPPLEMENT_TABS: Array<{ key: RealmTab; label: string }> = [
  { key: "today", label: "Today" },
  { key: "items", label: "My Supplements" },
  { key: "schedule", label: "Schedule" },
  { key: "logs", label: "Logs" },
  { key: "documents", label: "Labels" },
  { key: "notes", label: "Notes" }
];

export function MedicationSupplementRealm({ itemType }: { itemType: ItemType }) {
  const [activeTab, setActiveTab] = useState<RealmTab>("today");
  const [items, setItems] = useState<Array<Medication | Supplement>>([]);
  const [schedules, setSchedules] = useState<HealthSchedule[]>([]);
  const [notes, setNotes] = useState<MedicationSupplementNote[]>([]);
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);

  const tabs = itemType === "medication" ? MEDICATION_TABS : SUPPLEMENT_TABS;
  const selectedItem = items.find((item) => item.id === selectedItemId) ?? items[0] ?? null;

  const loadRealm = useCallback(async () => {
    const [nextItems, nextNotes] = await Promise.all([
      itemType === "medication" ? getMedications() : getSupplements(),
      getNotesByDate(new Date(), itemType)
    ]);
    const nextSchedules = (
      await Promise.all(nextItems.map((item) => getSchedulesByItem(itemType, item.id)))
    ).flat();

    setItems(nextItems);
    setSchedules(nextSchedules);
    setNotes(nextNotes);
    setSelectedItemId((current) => current ?? nextItems[0]?.id ?? null);
  }, [itemType]);

  useEffect(() => {
    Promise.resolve().then(loadRealm).catch(() => undefined);
  }, [loadRealm]);

  return (
    <View style={{ gap: 14 }}>
      <Header itemType={itemType} />
      <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
        {tabs.map((tab) => (
          <TouchableOpacity
            activeOpacity={0.85}
            key={tab.key}
            onPress={() => setActiveTab(tab.key)}
            style={{
              backgroundColor: activeTab === tab.key ? getAccentColor(itemType) : "#ffffff",
              borderColor: "#e2e8f0",
              borderRadius: 999,
              borderWidth: 1,
              paddingHorizontal: 14,
              paddingVertical: 10
            }}
          >
            <Text style={{ color: activeTab === tab.key ? "#ffffff" : "#475569", fontWeight: "900" }}>
              {tab.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {activeTab === "today" ? (
        <TodayTab itemType={itemType} items={items} notes={notes} onChange={loadRealm} schedules={schedules} />
      ) : null}
      {activeTab === "items" ? (
        <ItemsTab itemType={itemType} items={items} onChange={loadRealm} schedules={schedules} />
      ) : null}
      {activeTab === "schedule" ? (
        <ScheduleTab item={selectedItem} itemType={itemType} onChange={loadRealm} schedules={schedules} onSelectItem={setSelectedItemId} items={items} />
      ) : null}
      {activeTab === "logs" ? (
        <LogsTab itemType={itemType} items={items} />
      ) : null}
      {activeTab === "documents" ? (
        <DocumentsTab item={selectedItem} itemType={itemType} onChange={loadRealm} />
      ) : null}
      {activeTab === "notes" ? (
        <NotesTab item={selectedItem} itemType={itemType} onChange={loadRealm} />
      ) : null}

      <SafetyFooter itemType={itemType} />
    </View>
  );
}

export function MedicationSupplementDetail({ itemId, itemType }: { itemId: string; itemType: ItemType }) {
  const [item, setItem] = useState<Medication | Supplement | null>(null);
  const [schedules, setSchedules] = useState<HealthSchedule[]>([]);
  const [documents, setDocuments] = useState<HealthDocument[]>([]);
  const [notes, setNotes] = useState<MedicationSupplementNote[]>([]);
  const [adherence, setAdherence] = useState<AdherenceSummary>({ missed: 0, skipped: 0, taken: 0, total: 0 });

  const loadDetail = useCallback(async () => {
    const nextItem = itemType === "medication" ? await getMedicationById(itemId) : await getSupplementById(itemId);
    const [nextSchedules, nextDocuments, nextNotes, nextAdherence] = await Promise.all([
      getSchedulesByItem(itemType, itemId),
      getHealthDocumentsByItem(itemType, itemId),
      getNotesByItem(itemType, itemId),
      itemType === "medication" ? getMedicationAdherenceSummary(itemId) : getSupplementAdherenceSummary(itemId)
    ]);

    setItem(nextItem);
    setSchedules(nextSchedules);
    setDocuments(nextDocuments);
    setNotes(nextNotes);
    setAdherence(nextAdherence);
  }, [itemId, itemType]);

  useEffect(() => {
    Promise.resolve().then(loadDetail).catch(() => undefined);
  }, [loadDetail]);

  if (!item) {
    return (
      <View style={{ gap: 12 }}>
        <AppCard>
          <Text style={{ color: "#64748b", lineHeight: 21 }}>This item may have been removed.</Text>
        </AppCard>
      </View>
    );
  }

  const activeSchedule = schedules[0];

  return (
    <View style={{ gap: 12 }}>
      <View style={{ gap: 4 }}>
        <Text style={{ color: getAccentColor(itemType), fontSize: 14, fontWeight: "800" }}>
          {itemType === "medication" ? "Medication detail" : "Supplement detail"}
        </Text>
        <Text style={{ color: "#0f172a", fontSize: 30, fontWeight: "900" }}>{item.name}</Text>
      </View>

      <SafetyCard itemType={itemType} />

      <AppCard>
        <View style={{ gap: 10 }}>
          <InfoRow label="Form" value={formatValue(item.form)} />
          <InfoRow label={itemType === "medication" ? "Strength" : "Strength"} value={item.strength ?? "Not entered"} />
          <InfoRow label="Schedule" value={activeSchedule ? formatTiming(activeSchedule.timing) : "No schedule set"} />
          <InfoRow label="Food timing" value={activeSchedule ? formatFoodTiming(activeSchedule.foodTiming) : "No timing note"} />
          <InfoRow label="Adherence" value={`${adherence.taken} taken, ${adherence.skipped} skipped, ${adherence.missed} missed`} />
          <InfoRow label="Status" value={item.isActive ? "Active" : "Archived"} />
        </View>
      </AppCard>

      <ScheduleTab item={item} items={[item]} itemType={itemType} onChange={loadDetail} onSelectItem={() => undefined} schedules={schedules} />
      <DocumentsTab item={item} itemType={itemType} onChange={loadDetail} />
      <NotesTab item={item} itemType={itemType} onChange={loadDetail} />

      <TouchableOpacity
        activeOpacity={0.85}
        onPress={async () => {
          if (itemType === "medication") {
            await archiveMedication(item.id);
          } else {
            await archiveSupplement(item.id);
          }
          router.replace(`/${itemType === "medication" ? "medication" : "supplements"}` as Href);
        }}
        style={{ alignItems: "center", backgroundColor: "#fee2e2", borderRadius: 18, justifyContent: "center", minHeight: 52 }}
      >
        <Text style={{ color: "#dc2626", fontWeight: "900" }}>Pause / Archive</Text>
      </TouchableOpacity>
    </View>
  );
}

function TodayTab({
  itemType,
  notes,
  onChange,
  schedules
}: {
  itemType: ItemType;
  items: Array<Medication | Supplement>;
  notes: MedicationSupplementNote[];
  onChange: () => void;
  schedules: HealthSchedule[];
}) {
  const [calculatedReminders, setCalculatedReminders] = useState<HealthScheduleReminder[]>([]);
  const reminders = calculatedReminders.length ? calculatedReminders : schedules.flatMap((schedule) => buildPreviewReminders(schedule, items));
  const nextReminder = reminders.find((reminder) => reminder.status === "upcoming" || reminder.status === "due");

  useEffect(() => {
    Promise.resolve()
      .then(() => itemType === "medication" ? calculateTodayMedicationSchedule() : calculateTodaySupplementSchedule())
      .then((summary) => setCalculatedReminders(summary.reminders))
      .catch(() => setCalculatedReminders([]));
  }, [itemType, schedules]);

  return (
    <View style={{ gap: 12 }}>
      <SafetyCard itemType={itemType} />
      <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 10 }}>
        <Metric label="Due today" value={`${reminders.filter((reminder) => reminder.status === "due").length}`} />
        <Metric label="Taken" value={`${reminders.filter((reminder) => reminder.status === "taken").length}`} />
        <Metric label="Missed" value={`${reminders.filter((reminder) => reminder.status === "missed").length}`} />
        <Metric label="Next" value={nextReminder?.itemName ?? "None"} />
      </View>

      {reminders.length ? (
        reminders.map((reminder) => (
          <ReminderCard key={`${reminder.scheduleId}-${reminder.scheduledAt ?? reminder.itemId}`} onChange={onChange} reminder={reminder} />
        ))
      ) : (
        <AppCard>
          <Text style={{ color: "#64748b", lineHeight: 21 }}>
            {itemType === "medication"
              ? "No medications added yet. Add a medication to track schedules and reminders."
              : "No supplements added yet. Add a supplement to track servings and notes."}
          </Text>
        </AppCard>
      )}

      <AppCard>
        <Text style={{ color: "#0f172a", fontSize: 20, fontWeight: "900" }}>Recent notes</Text>
        {notes.length ? (
          notes.slice(0, 3).map((note) => (
            <Text key={note.id} style={{ color: "#64748b", lineHeight: 21, marginTop: 8 }}>{note.note}</Text>
          ))
        ) : (
          <Text style={{ color: "#64748b", lineHeight: 21, marginTop: 8 }}>No notes yet.</Text>
        )}
      </AppCard>
    </View>
  );
}

function ItemsTab({
  itemType,
  items,
  schedules
}: {
  itemType: ItemType;
  items: Array<Medication | Supplement>;
  onChange: () => void;
  schedules: HealthSchedule[];
}) {
  return (
    <View style={{ gap: 12 }}>
      <TouchableOpacity
        activeOpacity={0.85}
        onPress={() => router.push(`/${itemType === "medication" ? "medication" : "supplements"}/add` as Href)}
        style={{ alignItems: "center", backgroundColor: getAccentColor(itemType), borderRadius: 18, justifyContent: "center", minHeight: 52 }}
      >
        <Text style={{ color: "#ffffff", fontWeight: "900" }}>{itemType === "medication" ? "Add Medication" : "Add Supplement"}</Text>
      </TouchableOpacity>

      {items.length ? (
        items.map((item) => (
          <TouchableOpacity
            activeOpacity={0.85}
            key={item.id}
            onPress={() => router.push(`/${itemType === "medication" ? "medication" : "supplements"}/${item.id}` as Href)}
            style={{ backgroundColor: "#ffffff", borderColor: "#e2e8f0", borderRadius: 20, borderWidth: 1, padding: 14 }}
          >
            <Text style={{ color: "#0f172a", fontSize: 18, fontWeight: "900" }}>{item.name}</Text>
            <Text style={{ color: "#64748b", marginTop: 4 }}>
              {item.strength ?? "Strength not entered"} - {item.isActive ? "Active" : "Archived"}
            </Text>
            <Text style={{ color: "#64748b", marginTop: 4 }}>
              {schedules.filter((schedule) => schedule.itemId === item.id).length ? "Schedule set" : "No schedule set. Add times if you want reminders."}
            </Text>
          </TouchableOpacity>
        ))
      ) : (
        <AppCard>
          <Text style={{ color: "#64748b", lineHeight: 21 }}>
            {itemType === "medication"
              ? "No medications added yet. Add a medication to track schedules and reminders."
              : "No supplements added yet. Add a supplement to track servings and notes."}
          </Text>
        </AppCard>
      )}
    </View>
  );
}

function ScheduleTab({
  item,
  items,
  itemType,
  onChange,
  onSelectItem,
  schedules
}: {
  item: Medication | Supplement | null;
  items: Array<Medication | Supplement>;
  itemType: ItemType;
  onChange: () => void;
  onSelectItem: (id: string) => void;
  schedules: HealthSchedule[];
}) {
  const existingSchedule = item ? schedules.find((schedule) => schedule.itemId === item.id) : null;
  const [timing, setTiming] = useState<ScheduleTiming>(existingSchedule?.timing ?? "once_daily");
  const [timesText, setTimesText] = useState(existingSchedule?.times.join(", ") ?? "08:00");
  const [everyXHours, setEveryXHours] = useState(String(existingSchedule?.everyXHours ?? ""));
  const [foodTiming, setFoodTiming] = useState<FoodTiming>(existingSchedule?.foodTiming ?? "none");
  const [customInstructions, setCustomInstructions] = useState(existingSchedule?.customInstructions ?? "");

  useEffect(() => {
    setTiming(existingSchedule?.timing ?? "once_daily");
    setTimesText(existingSchedule?.times.join(", ") ?? "08:00");
    setEveryXHours(String(existingSchedule?.everyXHours ?? ""));
    setFoodTiming(existingSchedule?.foodTiming ?? "none");
    setCustomInstructions(existingSchedule?.customInstructions ?? "");
  }, [existingSchedule?.id, existingSchedule?.updatedAt]);

  async function saveSchedule() {
    if (!item) {
      return;
    }
    const payload = {
      customInstructions,
      everyXHours: Number(everyXHours) || undefined,
      foodTiming,
      itemId: item.id,
      itemType,
      reminderEnabled: true,
      timing,
      times: timesText.split(",").map((time) => time.trim()).filter(Boolean)
    };

    if (existingSchedule) {
      await updateHealthSchedule(existingSchedule.id, payload);
    } else {
      await createHealthSchedule(payload);
    }

    await onChange();
  }

  if (!item) {
    return (
      <AppCard>
        <Text style={{ color: "#64748b", lineHeight: 21 }}>No schedule set. Add times if you want reminders.</Text>
      </AppCard>
    );
  }

  return (
    <AppCard>
      <View style={{ gap: 12 }}>
        <Text style={{ color: "#0f172a", fontSize: 20, fontWeight: "900" }}>Schedule builder</Text>
        {items.length > 1 ? (
          <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
            {items.map((choice) => (
              <Chip key={choice.id} label={choice.name} selected={choice.id === item.id} onPress={() => onSelectItem(choice.id)} />
            ))}
          </View>
        ) : null}
        <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
          {SCHEDULE_TIMING_OPTIONS.map((option) => (
            <Chip key={option.key} label={option.label} selected={timing === option.key} onPress={() => setTiming(option.key)} />
          ))}
        </View>
        <TextInput onChangeText={setTimesText} placeholder="Times, e.g. 08:00, 20:00" placeholderTextColor="#94a3b8" style={INPUT_STYLE} value={timesText} />
        {timing === "every_x_hours" ? (
          <TextInput keyboardType="numeric" onChangeText={setEveryXHours} placeholder="Every X hours" placeholderTextColor="#94a3b8" style={INPUT_STYLE} value={everyXHours} />
        ) : null}
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
        <TextInput multiline onChangeText={setCustomInstructions} placeholder="Custom instructions from label or professional, optional" placeholderTextColor="#94a3b8" style={{ ...INPUT_STYLE, minHeight: 90, paddingTop: 13 }} value={customInstructions} />
        <PrimaryButton color={getAccentColor(itemType)} label="Save schedule" onPress={saveSchedule} />
        {existingSchedule ? <SecondaryAction label="Delete schedule" onPress={() => deleteHealthSchedule(existingSchedule.id).then(onChange)} /> : null}
      </View>
    </AppCard>
  );
}

function LogsTab({ itemType, items }: { itemType: ItemType; items: Array<Medication | Supplement> }) {
  const [logsByItem, setLogsByItem] = useState<Record<string, DoseLogPreview[]>>({});

  useEffect(() => {
    Promise.resolve()
      .then(async () => {
        const entries = await Promise.all(
          items.map(async (item) => [item.id, await getDoseLogsByItem(itemType, item.id)] as const)
        );

        setLogsByItem(Object.fromEntries(entries));
      })
      .catch(() => setLogsByItem({}));
  }, [itemType, items]);

  return (
    <View style={{ gap: 12 }}>
      {items.length ? (
        items.map((item) => {
          const logs = logsByItem[item.id] ?? [];

          return (
            <AppCard key={item.id}>
              <Text style={{ color: "#0f172a", fontSize: 18, fontWeight: "900" }}>{item.name}</Text>
              {logs.length ? (
                logs.slice(0, 6).map((log) => (
                  <View key={log.id} style={{ backgroundColor: "#f8fafc", borderRadius: 14, marginTop: 10, padding: 10 }}>
                    <Text style={{ color: "#0f172a", fontWeight: "900" }}>{formatValue(log.status)}</Text>
                    <Text style={{ color: "#64748b", marginTop: 4 }}>{new Date(log.takenAt ?? log.scheduledAt ?? log.createdAt).toLocaleString()}</Text>
                    {log.notes ? <Text style={{ color: "#64748b", lineHeight: 20, marginTop: 4 }}>{log.notes}</Text> : null}
                  </View>
                ))
              ) : (
                <Text style={{ color: "#64748b", lineHeight: 21, marginTop: 6 }}>
                  No logs yet. Mark items as taken, skipped, or missed to build history.
                </Text>
              )}
            </AppCard>
          );
        })
      ) : (
        <AppCard>
          <Text style={{ color: "#64748b", lineHeight: 21 }}>No logs yet. Mark items as taken, skipped, or missed to build history.</Text>
        </AppCard>
      )}
    </View>
  );
}

type DoseLogPreview = Awaited<ReturnType<typeof getDoseLogsByItem>>[number];

function DocumentsTab({ item, itemType, onChange }: { item: Medication | Supplement | null; itemType: ItemType; onChange: () => void }) {
  const [documents, setDocuments] = useState<HealthDocument[]>([]);
  const [title, setTitle] = useState("");
  const [noteText, setNoteText] = useState("");
  const [imageUri, setImageUri] = useState<string | undefined>();

  useEffect(() => {
    if (!item) {
      setDocuments([]);
      return;
    }
    Promise.resolve()
      .then(() => getHealthDocumentsByItem(itemType, item.id))
      .then(setDocuments)
      .catch(() => setDocuments([]));
  }, [item, itemType]);

  async function pickImage() {
    const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ImagePicker.MediaTypeOptions.Images, quality: 0.7 });

    if (!result.canceled) {
      setImageUri(result.assets[0]?.uri);
    }
  }

  async function saveDocument() {
    if (!item || !title.trim()) {
      return;
    }

    await createHealthDocument({
      fileType: imageUri ? "image" : "note",
      fileUrl: imageUri,
      noteText,
      relatedId: item.id,
      relatedType: itemType,
      title
    });
    setTitle("");
    setNoteText("");
    setImageUri(undefined);
    setDocuments(await getHealthDocumentsByItem(itemType, item.id));
    onChange();
  }

  return (
    <AppCard>
      <View style={{ gap: 12 }}>
        <Text style={{ color: "#0f172a", fontSize: 20, fontWeight: "900" }}>{itemType === "medication" ? "Documents" : "Labels"}</Text>
        {item ? (
          <>
            <TextInput onChangeText={setTitle} placeholder={itemType === "medication" ? "Prescription, label, doctor note..." : "Supplement label, bottle note..."} placeholderTextColor="#94a3b8" style={INPUT_STYLE} value={title} />
            <TextInput multiline onChangeText={setNoteText} placeholder="Reference note optional" placeholderTextColor="#94a3b8" style={{ ...INPUT_STYLE, minHeight: 86, paddingTop: 13 }} value={noteText} />
            {imageUri ? <Image alt="Selected document" source={{ uri: imageUri }} style={{ backgroundColor: "#f8fafc", borderRadius: 16, height: 140, width: "100%" }} /> : null}
            <SecondaryAction label="Choose image placeholder" onPress={pickImage} />
            <PrimaryButton color={getAccentColor(itemType)} label="Save document" onPress={saveDocument} />
          </>
        ) : null}
        {documents.length ? (
          documents.map((document) => (
            <View key={document.id} style={{ backgroundColor: "#f8fafc", borderRadius: 16, padding: 12 }}>
              <Text style={{ color: "#0f172a", fontWeight: "900" }}>{document.title}</Text>
              <Text style={{ color: "#64748b", marginTop: 4 }}>{document.noteText ?? "Private reference"}</Text>
              <SecondaryAction label="Delete" onPress={() => deleteHealthDocument(document.id).then(onChange)} />
            </View>
          ))
        ) : (
          <Text style={{ color: "#64748b", lineHeight: 21 }}>No documents yet. Add a prescription, label, or note for reference.</Text>
        )}
      </View>
    </AppCard>
  );
}

function NotesTab({ item, itemType, onChange }: { item: Medication | Supplement | null; itemType: ItemType; onChange: () => void }) {
  const [note, setNote] = useState("");
  const [notes, setNotes] = useState<MedicationSupplementNote[]>([]);

  useEffect(() => {
    if (!item) {
      setNotes([]);
      return;
    }
    Promise.resolve()
      .then(() => getNotesByItem(itemType, item.id))
      .then(setNotes)
      .catch(() => setNotes([]));
  }, [item, itemType]);

  async function saveNote() {
    if (!item || !note.trim()) {
      return;
    }
    await createMedicationSupplementNote({ note, relatedId: item.id, relatedType: itemType });
    setNote("");
    setNotes(await getNotesByItem(itemType, item.id));
    onChange();
  }

  return (
    <AppCard>
      <View style={{ gap: 12 }}>
        <Text style={{ color: "#0f172a", fontSize: 20, fontWeight: "900" }}>Notes</Text>
        <TextInput multiline onChangeText={setNote} placeholder="Took after breakfast, forgot morning dose, started new bottle..." placeholderTextColor="#94a3b8" style={{ ...INPUT_STYLE, minHeight: 120, paddingTop: 13 }} value={note} />
        <PrimaryButton color={getAccentColor(itemType)} label="Save note" onPress={saveNote} />
        {notes.length ? (
          notes.map((itemNote) => (
            <View key={itemNote.id} style={{ backgroundColor: "#f8fafc", borderRadius: 16, padding: 12 }}>
              <Text style={{ color: "#64748b", lineHeight: 21 }}>{itemNote.note}</Text>
              <Text style={{ color: "#94a3b8", fontSize: 12, marginTop: 5 }}>{new Date(itemNote.loggedAt).toLocaleString()}</Text>
            </View>
          ))
        ) : (
          <Text style={{ color: "#64748b", lineHeight: 21 }}>Add notes when something feels different.</Text>
        )}
      </View>
    </AppCard>
  );
}

function ReminderCard({ onChange, reminder }: { onChange: () => void; reminder: HealthScheduleReminder }) {
  const actionInput = {
    itemId: reminder.itemId,
    itemType: reminder.itemType,
    scheduleId: reminder.scheduleId,
    scheduledAt: reminder.scheduledAt
  };

  return (
    <AppCard>
      <View style={{ gap: 10 }}>
        <Text style={{ color: "#0f172a", fontSize: 18, fontWeight: "900" }}>{reminder.itemName}</Text>
        <Text style={{ color: "#64748b" }}>
          {reminder.scheduledAt ? new Date(reminder.scheduledAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "As needed"} - {formatValue(reminder.status)}
        </Text>
        {reminder.subtitle ? <Text style={{ color: "#64748b", lineHeight: 21 }}>{reminder.subtitle}</Text> : null}
        <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
          <MiniAction label="Mark Taken" onPress={() => markDoseTaken(actionInput).then(onChange)} />
          <MiniAction label="Skip" onPress={() => markDoseSkipped(actionInput).then(onChange)} />
          <MiniAction label="Snooze" onPress={() => snoozeDoseReminder(actionInput).then(onChange)} />
        </View>
      </View>
    </AppCard>
  );
}

function Header({ itemType }: { itemType: ItemType }) {
  return (
    <View style={{ gap: 4 }}>
      <Text style={{ color: getAccentColor(itemType), fontSize: 14, fontWeight: "800" }}>Health realm</Text>
      <Text style={{ color: "#0f172a", fontSize: 30, fontWeight: "900" }}>{itemType === "medication" ? "Medication" : "Supplements"}</Text>
      <Text style={{ color: "#64748b", lineHeight: 20 }}>
        {itemType === "medication" ? "Track schedules, dose logs, notes and documents." : "Track supplement servings, labels, notes and schedules."}
      </Text>
    </View>
  );
}

function SafetyCard({ itemType }: { itemType: ItemType }) {
  return (
    <AppCard backgroundColor="#fff7ed">
      <Text style={{ color: "#9a3412", fontWeight: "900" }}>Safety reminder</Text>
      <Text style={{ color: "#9a3412", lineHeight: 21, marginTop: 6 }}>
        {itemType === "medication"
          ? "Medication tracking helps you remember and record your schedule. Always follow your prescription label or healthcare professional's instructions."
          : "Supplement tracking is for personal organization only. Speak to a healthcare professional if you take medication, are pregnant, have a medical condition, or are unsure about a supplement."}
      </Text>
    </AppCard>
  );
}

function SafetyFooter({ itemType }: { itemType: ItemType }) {
  return (
    <Text style={{ color: "#64748b", fontSize: 12, lineHeight: 18 }}>
      {itemType === "medication"
        ? "Medication tracking is for organization only and is not medical advice. Always follow your prescription label or healthcare professional's instructions."
        : "Supplement tracking is for personal organization only. Speak to a healthcare professional if you take medication, are pregnant, have a medical condition, or are unsure about a supplement."}
    </Text>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <View style={{ backgroundColor: "#ffffff", borderColor: "#e2e8f0", borderRadius: 18, borderWidth: 1, flexGrow: 1, minWidth: "45%", padding: 14 }}>
      <Text style={{ color: "#64748b", fontSize: 12, fontWeight: "900" }}>{label}</Text>
      <Text style={{ color: "#0f172a", fontSize: 20, fontWeight: "900", marginTop: 4 }}>{value}</Text>
    </View>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={{ flexDirection: "row", gap: 12, justifyContent: "space-between" }}>
      <Text style={{ color: "#64748b" }}>{label}</Text>
      <Text style={{ color: "#0f172a", flex: 1, fontWeight: "900", textAlign: "right" }}>{value}</Text>
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

function PrimaryButton({ color, label, onPress }: { color: string; label: string; onPress: () => void }) {
  return (
    <TouchableOpacity activeOpacity={0.85} onPress={onPress} style={{ alignItems: "center", backgroundColor: color, borderRadius: 18, justifyContent: "center", minHeight: 52 }}>
      <Text style={{ color: "#ffffff", fontSize: 16, fontWeight: "900" }}>{label}</Text>
    </TouchableOpacity>
  );
}

function SecondaryAction({ label, onPress }: { label: string; onPress: () => void }) {
  return (
    <TouchableOpacity activeOpacity={0.85} onPress={onPress} style={{ alignItems: "center", backgroundColor: "#f8fafc", borderRadius: 16, justifyContent: "center", minHeight: 46 }}>
      <Text style={{ color: "#475569", fontWeight: "900" }}>{label}</Text>
    </TouchableOpacity>
  );
}

function MiniAction({ label, onPress }: { label: string; onPress: () => void }) {
  return (
    <TouchableOpacity activeOpacity={0.85} onPress={onPress} style={{ backgroundColor: "#f8fafc", borderRadius: 999, paddingHorizontal: 12, paddingVertical: 9 }}>
      <Text style={{ color: "#475569", fontWeight: "900" }}>{label}</Text>
    </TouchableOpacity>
  );
}

function buildPreviewReminders(schedule: HealthSchedule, items: Array<Medication | Supplement>): HealthScheduleReminder[] {
  const item = items.find((candidate) => candidate.id === schedule.itemId);
  const itemName = item?.name ?? (schedule.itemType === "medication" ? "Medication" : "Supplement");

  if (schedule.timing === "as_needed") {
    return [{ itemId: schedule.itemId, itemName, itemType: schedule.itemType, scheduleId: schedule.id, status: "upcoming", subtitle: "As needed" }];
  }

  return schedule.times.map((time) => {
    const scheduledAt = toScheduledAt(new Date(), time);

    return {
      itemId: schedule.itemId,
      itemName,
      itemType: schedule.itemType,
      scheduleId: schedule.id,
      scheduledAt,
      status: inferReminderStatus(scheduledAt),
      subtitle: schedule.customInstructions
    };
  });
}

function toScheduledAt(date: Date, time: string) {
  const [hour, minute] = time.split(":").map(Number);
  const nextDate = new Date(date);

  nextDate.setHours(hour || 0, minute || 0, 0, 0);

  return nextDate.toISOString();
}

function inferReminderStatus(scheduledAt: string) {
  const scheduledTime = new Date(scheduledAt).getTime();
  const now = Date.now();

  if (scheduledTime > now) {
    return "upcoming" as const;
  }

  if (now - scheduledTime < 60 * 60 * 1000) {
    return "due" as const;
  }

  return "missed" as const;
}

function formatTiming(timing: ScheduleTiming) {
  return SCHEDULE_TIMING_OPTIONS.find((option) => option.key === timing)?.label ?? formatValue(timing);
}

function formatFoodTiming(foodTiming: FoodTiming) {
  return FOOD_TIMING_OPTIONS.find((option) => option.key === foodTiming)?.label ?? formatValue(foodTiming);
}

function formatValue(value: string) {
  return value.replace(/_/g, " ").replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function getAccentColor(itemType: ItemType) {
  return itemType === "medication" ? "#ef4444" : "#14b8a6";
}

export function getFormOptions(itemType: ItemType) {
  return itemType === "medication" ? MEDICATION_FORM_OPTIONS : SUPPLEMENT_FORM_OPTIONS;
}
