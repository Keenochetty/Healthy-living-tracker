import { useFocusEffect } from "expo-router";
import { useCallback, useMemo, useState } from "react";
import type { ReactNode } from "react";
import {
  ScrollView,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

import { AppMainLayout } from "@/components/layout/AppMainLayout";
import { RecordsRealmOverview } from "@/components/records/RecordsRealmOverview";
import { AppButton, AppCard, AppSection } from "@/components/ui";
import {
  createDoctorVisit,
  createHealthRecord,
  createHealthRecordFolder,
  createLabResultRecord,
  createPrescriptionRecord,
  createVaccineRecord,
  deleteHealthRecord,
  deleteHealthRecordFile,
  dismissRecordReminder,
  getDoctorVisits,
  getHealthRecordFolders,
  getHealthRecords,
  getLabResultRecords,
  getPrescriptionRecords,
  getRecordsOverviewSummary,
  getUpcomingRecordReminders,
  getVaccineRecords,
  pinHealthRecord,
  prepareHealthRecordUpload,
  searchHealthRecords,
  unpinHealthRecord,
} from "@/lib/healthRecordsStorage";
import {
  getMedications,
  getSupplements,
} from "@/lib/medicationSupplementStorage";
import type {
  DoctorVisit,
  HealthRecord,
  HealthRecordFolder,
  HealthRecordReminder,
  HealthRecordType,
  LabResultRecord,
  PrescriptionRecord,
  RecordsOverviewSummary,
  VaccineRecord,
} from "@/types/healthRecords";
import type { Medication, Supplement } from "@/types/medication";

type RecordsTab =
  | "overview"
  | "documents"
  | "visits"
  | "vaccines"
  | "labs"
  | "prescriptions"
  | "notes"
  | "folders";

const RECORD_TABS: Array<{ key: RecordsTab; label: string }> = [
  { key: "overview", label: "Overview" },
  { key: "documents", label: "Documents" },
  { key: "visits", label: "Visits" },
  { key: "vaccines", label: "Vaccines" },
  { key: "labs", label: "Labs" },
  { key: "prescriptions", label: "Prescriptions" },
  { key: "notes", label: "Notes" },
  { key: "folders", label: "Folders" },
];

const DOCUMENT_TYPES: Array<{ key: HealthRecordType; label: string }> = [
  { key: "prescription", label: "Prescription" },
  { key: "medication_label", label: "Medication label" },
  { key: "supplement_label", label: "Supplement label" },
  { key: "doctor_note", label: "Doctor note" },
  { key: "lab_result", label: "Lab result" },
  { key: "imaging", label: "Scan / imaging" },
  { key: "vaccine_record", label: "Vaccine record" },
  { key: "birth_record", label: "Birth record" },
  { key: "child_clinic_card", label: "Child clinic card" },
  { key: "pregnancy_record", label: "Pregnancy record" },
  { key: "insurance", label: "Insurance / medical aid" },
  { key: "general_document", label: "General health document" },
  { key: "health_note", label: "Health note" },
  { key: "other", label: "Other" },
];

const INPUT_STYLE = {
  backgroundColor: "#ffffff",
  borderColor: "#e2e8f0",
  borderRadius: 16,
  borderWidth: 1,
  color: "#0f172a",
  minHeight: 50,
  paddingHorizontal: 14,
};

export default function RecordsScreen() {
  const [activeTab, setActiveTab] = useState<RecordsTab>("overview");
  const [records, setRecords] = useState<HealthRecord[]>([]);
  const [visits, setVisits] = useState<DoctorVisit[]>([]);
  const [vaccines, setVaccines] = useState<VaccineRecord[]>([]);
  const [labs, setLabs] = useState<LabResultRecord[]>([]);
  const [prescriptions, setPrescriptions] = useState<PrescriptionRecord[]>([]);
  const [folders, setFolders] = useState<HealthRecordFolder[]>([]);
  const [reminders, setReminders] = useState<HealthRecordReminder[]>([]);
  const [summary, setSummary] = useState<RecordsOverviewSummary | null>(null);
  const [medications, setMedications] = useState<Medication[]>([]);
  const [supplements, setSupplements] = useState<Supplement[]>([]);
  const [query, setQuery] = useState("");
  const [aiMessage, setAiMessage] = useState<string | null>(null);

  const loadRecords = useCallback(async () => {
    const [
      nextRecords,
      nextVisits,
      nextVaccines,
      nextLabs,
      nextPrescriptions,
      nextFolders,
      nextReminders,
      nextSummary,
      nextMedications,
      nextSupplements,
    ] = await Promise.all([
      query.trim() ? searchHealthRecords(query) : getHealthRecords(),
      getDoctorVisits(),
      getVaccineRecords(),
      getLabResultRecords(),
      getPrescriptionRecords(),
      getHealthRecordFolders(),
      getUpcomingRecordReminders(8),
      getRecordsOverviewSummary(),
      getMedications(),
      getSupplements(),
    ]);

    setRecords(nextRecords);
    setVisits(nextVisits);
    setVaccines(nextVaccines);
    setLabs(nextLabs);
    setPrescriptions(nextPrescriptions);
    setFolders(nextFolders);
    setReminders(nextReminders);
    setSummary(nextSummary);
    setMedications(nextMedications);
    setSupplements(nextSupplements);
  }, [query]);

  useFocusEffect(
    useCallback(() => {
      Promise.resolve()
        .then(loadRecords)
        .catch(() => undefined);
    }, [loadRecords]),
  );

  const noteRecords = useMemo(
    () => records.filter((record) => record.type === "health_note"),
    [records],
  );
  const documentRecords = useMemo(
    () => records.filter((record) => record.type !== "health_note"),
    [records],
  );

  function openCategory(types: HealthRecordType[]) {
    if (types.includes("vaccine_record")) {
      setActiveTab("vaccines");
    } else if (types.includes("lab_result")) {
      setActiveTab("labs");
    } else if (types.includes("prescription")) {
      setActiveTab("prescriptions");
    } else if (types.includes("health_note")) {
      setActiveTab("notes");
    } else {
      setActiveTab("documents");
    }
  }

  function openFilter(filter: "all" | "labs" | "prescriptions" | "vaccines") {
    setActiveTab(filter === "all" ? "documents" : filter);
  }

  return (
    <AppMainLayout subtitle="Private health documents" title="Records">
      <RecordsRealmOverview
        onCategory={openCategory}
        onFilter={openFilter}
        onQueryChange={setQuery}
        onScan={() => {
          setActiveTab("documents");
          setAiMessage(AI_PLACEHOLDER);
        }}
        onUpload={() => setActiveTab("documents")}
        medications={medications}
        prescriptions={prescriptions}
        query={query}
        records={records}
        summary={summary}
        supplements={supplements}
      />

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={{ marginHorizontal: -4 }}
        contentContainerStyle={{ gap: 8, paddingHorizontal: 4 }}
      >
        {RECORD_TABS.map((tab) => (
          <TouchableOpacity
            activeOpacity={0.85}
            key={tab.key}
            onPress={() => setActiveTab(tab.key)}
            style={{
              backgroundColor: activeTab === tab.key ? "#0f172a" : "#ffffff",
              borderColor: "#e2e8f0",
              borderRadius: 999,
              borderWidth: 1,
              paddingHorizontal: 14,
              paddingVertical: 10,
            }}
          >
            <Text
              style={{
                color: activeTab === tab.key ? "#ffffff" : "#475569",
                fontWeight: "900",
              }}
            >
              {tab.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {activeTab === "overview" ? (
        <OverviewTab
          onAiPlaceholder={() => setAiMessage(AI_PLACEHOLDER)}
          onReload={loadRecords}
          reminders={reminders}
          summary={summary}
        />
      ) : null}
      {activeTab === "documents" ? (
        <DocumentsTab
          folders={folders}
          medications={medications}
          onAiPlaceholder={() => setAiMessage(AI_PLACEHOLDER)}
          onReload={loadRecords}
          records={documentRecords}
          supplements={supplements}
          visits={visits}
        />
      ) : null}
      {activeTab === "visits" ? (
        <VisitsTab onReload={loadRecords} records={records} visits={visits} />
      ) : null}
      {activeTab === "vaccines" ? (
        <VaccinesTab onReload={loadRecords} vaccines={vaccines} />
      ) : null}
      {activeTab === "labs" ? (
        <LabsTab labs={labs} onReload={loadRecords} />
      ) : null}
      {activeTab === "prescriptions" ? (
        <PrescriptionsTab
          medications={medications}
          onReload={loadRecords}
          prescriptions={prescriptions}
        />
      ) : null}
      {activeTab === "notes" ? (
        <NotesTab notes={noteRecords} onReload={loadRecords} />
      ) : null}
      {activeTab === "folders" ? (
        <FoldersTab
          folders={folders}
          onReload={loadRecords}
          records={records}
        />
      ) : null}

      {aiMessage ? (
        <AppCard backgroundColor="#f5f3ff">
          <Text style={{ color: "#6d28d9", fontWeight: "900" }}>
            AI document extraction
          </Text>
          <Text style={{ color: "#64748b", lineHeight: 21, marginTop: 6 }}>
            {aiMessage}
          </Text>
          <Text
            style={{
              color: "#64748b",
              fontSize: 12,
              lineHeight: 18,
              marginTop: 8,
            }}
          >
            AI extraction will create drafts only. You must review and confirm
            information before saving.
          </Text>
        </AppCard>
      ) : null}
    </AppMainLayout>
  );
}

const AI_PLACEHOLDER =
  "AI document extraction will be added later. You can still upload and organize this record manually.";

function OverviewTab({
  onAiPlaceholder,
  onReload,
  reminders,
  summary,
}: {
  onAiPlaceholder: () => void;
  onReload: () => void;
  reminders: HealthRecordReminder[];
  summary: RecordsOverviewSummary | null;
}) {
  return (
    <View style={{ gap: 12 }}>
      <ReminderList onReload={onReload} reminders={reminders} />

      <ListSection
        emptyText="No visits logged yet. Add a doctor visit to keep notes and follow-ups in one place."
        items={summary?.recentVisits ?? []}
        title="Recent doctor visits"
        renderItem={(visit) => <VisitCard key={visit.id} visit={visit} />}
      />

      <AppCard backgroundColor="#f5f3ff">
        <Text style={{ color: "#6d28d9", fontSize: 18, fontWeight: "900" }}>
          AI preparation
        </Text>
        <View
          style={{
            flexDirection: "row",
            flexWrap: "wrap",
            gap: 8,
            marginTop: 10,
          }}
        >
          <MiniAction
            label="Scan document with AI later"
            onPress={onAiPlaceholder}
          />
          <MiniAction
            label="Extract medication info later"
            onPress={onAiPlaceholder}
          />
          <MiniAction
            label="Extract lab values later"
            onPress={onAiPlaceholder}
          />
          <MiniAction
            label="Summarize visit note later"
            onPress={onAiPlaceholder}
          />
        </View>
      </AppCard>
    </View>
  );
}

function DocumentsTab({
  folders,
  medications,
  onAiPlaceholder,
  onReload,
  records,
  supplements,
  visits,
}: {
  folders: HealthRecordFolder[];
  medications: Medication[];
  onAiPlaceholder: () => void;
  onReload: () => void;
  records: HealthRecord[];
  supplements: Supplement[];
  visits: DoctorVisit[];
}) {
  const [title, setTitle] = useState("");
  const [type, setType] = useState<HealthRecordType>("general_document");
  const [folderId, setFolderId] = useState("");
  const [documentDate, setDocumentDate] = useState("");
  const [expiryDate, setExpiryDate] = useState("");
  const [reminderDate, setReminderDate] = useState("");
  const [notes, setNotes] = useState("");
  const [tags, setTags] = useState("");
  const [isPinned, setIsPinned] = useState(false);
  const [relatedMedicationId, setRelatedMedicationId] = useState("");
  const [relatedSupplementId, setRelatedSupplementId] = useState("");
  const [relatedVisitId, setRelatedVisitId] = useState("");
  const [uploadMessage, setUploadMessage] = useState<string | null>(null);

  async function saveDocument() {
    if (!title.trim()) {
      return;
    }

    await createHealthRecord({
      documentDate,
      expiryDate,
      folderId,
      isPinned,
      notes,
      relatedMedicationId,
      relatedSupplementId,
      relatedVisitId,
      reminderDate,
      tags: splitTags(tags),
      title,
      type,
    });
    setTitle("");
    setNotes("");
    setTags("");
    setExpiryDate("");
    setReminderDate("");
    await onReload();
  }

  async function prepareUpload() {
    const upload = await prepareHealthRecordUpload("unknown");

    setUploadMessage(upload.message);
  }

  return (
    <View style={{ gap: 12 }}>
      <AppCard>
        <View style={{ gap: 12 }}>
          <Text style={{ color: "#0f172a", fontSize: 20, fontWeight: "900" }}>
            Add Document
          </Text>
          <TextInput
            onChangeText={setTitle}
            placeholder="Title"
            placeholderTextColor="#94a3b8"
            style={INPUT_STYLE}
            value={title}
          />
          <ChipGroup
            current={type}
            options={DOCUMENT_TYPES}
            onSelect={(nextType) => setType(nextType as HealthRecordType)}
          />
          <ChipGroup
            current={folderId}
            options={folders.map((folder) => ({
              key: folder.id,
              label: folder.name,
            }))}
            onSelect={setFolderId}
          />
          <TextInput
            onChangeText={setDocumentDate}
            placeholder="Document date YYYY-MM-DD"
            placeholderTextColor="#94a3b8"
            style={INPUT_STYLE}
            value={documentDate}
          />
          <TextInput
            onChangeText={setExpiryDate}
            placeholder="Expiry date optional"
            placeholderTextColor="#94a3b8"
            style={INPUT_STYLE}
            value={expiryDate}
          />
          <TextInput
            onChangeText={setReminderDate}
            placeholder="Reminder date optional"
            placeholderTextColor="#94a3b8"
            style={INPUT_STYLE}
            value={reminderDate}
          />
          <RelationSelector
            current={relatedMedicationId}
            label="Related medication optional"
            options={medications.map((item) => ({
              key: item.id,
              label: item.name,
            }))}
            onSelect={setRelatedMedicationId}
          />
          <RelationSelector
            current={relatedSupplementId}
            label="Related supplement optional"
            options={supplements.map((item) => ({
              key: item.id,
              label: item.name,
            }))}
            onSelect={setRelatedSupplementId}
          />
          <RelationSelector
            current={relatedVisitId}
            label="Related visit optional"
            options={visits.map((item) => ({
              key: item.id,
              label: item.title,
            }))}
            onSelect={setRelatedVisitId}
          />
          <TextInput
            multiline
            onChangeText={setNotes}
            placeholder="Notes"
            placeholderTextColor="#94a3b8"
            style={{ ...INPUT_STYLE, minHeight: 88, paddingTop: 13 }}
            value={notes}
          />
          <TextInput
            onChangeText={setTags}
            placeholder="Tags, comma separated"
            placeholderTextColor="#94a3b8"
            style={INPUT_STYLE}
            value={tags}
          />
          <PrivatePinnedRow isPinned={isPinned} onPinnedChange={setIsPinned} />
          <SecondaryButton
            label="File/photo placeholder"
            onPress={prepareUpload}
          />
          <SecondaryButton
            label="Scan document with AI later"
            onPress={onAiPlaceholder}
          />
          {uploadMessage ? (
            <Text style={{ color: "#64748b", lineHeight: 21 }}>
              {uploadMessage}
            </Text>
          ) : null}
          <AppButton onPress={saveDocument} title="Save Document" />
        </View>
      </AppCard>

      <ListSection
        emptyText="No documents yet. Upload a prescription, label, lab result, or health document."
        items={records}
        title="Documents"
        renderItem={(record) => (
          <RecordCard key={record.id} onReload={onReload} record={record} />
        )}
      />
    </View>
  );
}

function VisitsTab({
  onReload,
  records,
  visits,
}: {
  onReload: () => void;
  records: HealthRecord[];
  visits: DoctorVisit[];
}) {
  const [title, setTitle] = useState("");
  const [clinicName, setClinicName] = useState("");
  const [practitionerName, setPractitionerName] = useState("");
  const [specialty, setSpecialty] = useState("");
  const [visitDate, setVisitDate] = useState("");
  const [location, setLocation] = useState("");
  const [reason, setReason] = useState("");
  const [summaryNotes, setSummaryNotes] = useState("");
  const [followUpRequired, setFollowUpRequired] = useState(false);
  const [followUpDate, setFollowUpDate] = useState("");
  const [questionsAsked, setQuestionsAsked] = useState("");
  const [instructions, setInstructions] = useState("");

  async function saveVisit() {
    if (!title.trim()) {
      return;
    }
    await createDoctorVisit({
      clinicName,
      followUpDate,
      followUpRequired,
      instructions,
      location,
      practitionerName,
      questionsAsked,
      reason,
      specialty,
      summaryNotes,
      title,
      visitDate,
    });
    setTitle("");
    setSummaryNotes("");
    await onReload();
  }

  return (
    <View style={{ gap: 12 }}>
      <AppCard>
        <View style={{ gap: 12 }}>
          <Text style={{ color: "#0f172a", fontSize: 20, fontWeight: "900" }}>
            Add Doctor Visit
          </Text>
          <TextInput
            onChangeText={setTitle}
            placeholder="Visit title"
            placeholderTextColor="#94a3b8"
            style={INPUT_STYLE}
            value={title}
          />
          <TextInput
            onChangeText={setClinicName}
            placeholder="Doctor / clinic / hospital"
            placeholderTextColor="#94a3b8"
            style={INPUT_STYLE}
            value={clinicName}
          />
          <TextInput
            onChangeText={setPractitionerName}
            placeholder="Practitioner optional"
            placeholderTextColor="#94a3b8"
            style={INPUT_STYLE}
            value={practitionerName}
          />
          <TextInput
            onChangeText={setSpecialty}
            placeholder="Specialty optional"
            placeholderTextColor="#94a3b8"
            style={INPUT_STYLE}
            value={specialty}
          />
          <TextInput
            onChangeText={setVisitDate}
            placeholder="Visit date/time"
            placeholderTextColor="#94a3b8"
            style={INPUT_STYLE}
            value={visitDate}
          />
          <TextInput
            onChangeText={setLocation}
            placeholder="Location optional"
            placeholderTextColor="#94a3b8"
            style={INPUT_STYLE}
            value={location}
          />
          <TextInput
            onChangeText={setReason}
            placeholder="Reason optional"
            placeholderTextColor="#94a3b8"
            style={INPUT_STYLE}
            value={reason}
          />
          <TextInput
            multiline
            onChangeText={setSummaryNotes}
            placeholder="Summary notes"
            placeholderTextColor="#94a3b8"
            style={{ ...INPUT_STYLE, minHeight: 88, paddingTop: 13 }}
            value={summaryNotes}
          />
          <ToggleRow
            label="Follow-up required"
            onChange={setFollowUpRequired}
            value={followUpRequired}
          />
          <TextInput
            onChangeText={setFollowUpDate}
            placeholder="Follow-up date optional"
            placeholderTextColor="#94a3b8"
            style={INPUT_STYLE}
            value={followUpDate}
          />
          <TextInput
            multiline
            onChangeText={setQuestionsAsked}
            placeholder="Questions asked"
            placeholderTextColor="#94a3b8"
            style={{ ...INPUT_STYLE, minHeight: 70, paddingTop: 13 }}
            value={questionsAsked}
          />
          <TextInput
            multiline
            onChangeText={setInstructions}
            placeholder="Answers / instructions"
            placeholderTextColor="#94a3b8"
            style={{ ...INPUT_STYLE, minHeight: 70, paddingTop: 13 }}
            value={instructions}
          />
          <AppButton onPress={saveVisit} title="Save Visit" />
        </View>
      </AppCard>

      <ListSection
        emptyText="No visits logged yet. Add a doctor visit to keep notes and follow-ups in one place."
        items={visits}
        title="Doctor visits"
        renderItem={(visit) => (
          <VisitCard
            key={visit.id}
            records={records.filter(
              (record) => record.relatedVisitId === visit.id,
            )}
            visit={visit}
          />
        )}
      />
    </View>
  );
}

function VaccinesTab({
  onReload,
  vaccines,
}: {
  onReload: () => void;
  vaccines: VaccineRecord[];
}) {
  const [vaccineName, setVaccineName] = useState("");
  const [doseNumber, setDoseNumber] = useState("");
  const [dateReceived, setDateReceived] = useState("");
  const [location, setLocation] = useState("");
  const [batchNumber, setBatchNumber] = useState("");
  const [nextDoseDate, setNextDoseDate] = useState("");
  const [notes, setNotes] = useState("");

  async function saveVaccine() {
    if (!vaccineName.trim()) {
      return;
    }
    await createVaccineRecord({
      batchNumber,
      dateReceived,
      doseNumber,
      location,
      nextDoseDate,
      notes,
      vaccineName,
    });
    setVaccineName("");
    setNotes("");
    await onReload();
  }

  return (
    <View style={{ gap: 12 }}>
      <AppCard backgroundColor="#fdf2f8">
        <Text style={{ color: "#be185d", lineHeight: 21 }}>
          Use this to record vaccine information from your clinic card or
          healthcare provider.
        </Text>
      </AppCard>
      <SimpleFormCard
        title="Add Vaccine Record"
        onSave={saveVaccine}
        saveLabel="Save Vaccine"
      >
        <TextInput
          onChangeText={setVaccineName}
          placeholder="Vaccine name"
          placeholderTextColor="#94a3b8"
          style={INPUT_STYLE}
          value={vaccineName}
        />
        <TextInput
          onChangeText={setDoseNumber}
          placeholder="Dose number optional"
          placeholderTextColor="#94a3b8"
          style={INPUT_STYLE}
          value={doseNumber}
        />
        <TextInput
          onChangeText={setDateReceived}
          placeholder="Date received YYYY-MM-DD"
          placeholderTextColor="#94a3b8"
          style={INPUT_STYLE}
          value={dateReceived}
        />
        <TextInput
          onChangeText={setLocation}
          placeholder="Location / clinic optional"
          placeholderTextColor="#94a3b8"
          style={INPUT_STYLE}
          value={location}
        />
        <TextInput
          onChangeText={setBatchNumber}
          placeholder="Batch number optional"
          placeholderTextColor="#94a3b8"
          style={INPUT_STYLE}
          value={batchNumber}
        />
        <TextInput
          onChangeText={setNextDoseDate}
          placeholder="Next dose date optional"
          placeholderTextColor="#94a3b8"
          style={INPUT_STYLE}
          value={nextDoseDate}
        />
        <TextInput
          multiline
          onChangeText={setNotes}
          placeholder="Notes"
          placeholderTextColor="#94a3b8"
          style={{ ...INPUT_STYLE, minHeight: 80, paddingTop: 13 }}
          value={notes}
        />
      </SimpleFormCard>
      <ListSection
        emptyText="No vaccine records yet. Add records from your clinic card or healthcare provider."
        items={vaccines}
        title="Vaccine records"
        renderItem={(item) => (
          <BasicCard
            key={item.id}
            title={item.vaccineName}
            subtitle={`${item.dateReceived}${item.nextDoseDate ? ` - next dose ${item.nextDoseDate}` : ""}`}
          />
        )}
      />
    </View>
  );
}

function LabsTab({
  labs,
  onReload,
}: {
  labs: LabResultRecord[];
  onReload: () => void;
}) {
  const [testName, setTestName] = useState("");
  const [provider, setProvider] = useState("");
  const [testDate, setTestDate] = useState("");
  const [resultValue, setResultValue] = useState("");
  const [unit, setUnit] = useState("");
  const [referenceRange, setReferenceRange] = useState("");
  const [followUpDate, setFollowUpDate] = useState("");
  const [notes, setNotes] = useState("");

  async function saveLab() {
    if (!testName.trim()) {
      return;
    }
    await createLabResultRecord({
      followUpDate,
      notes,
      provider,
      referenceRange,
      resultValue,
      testDate,
      testName,
      unit,
    });
    setTestName("");
    setNotes("");
    await onReload();
  }

  return (
    <View style={{ gap: 12 }}>
      <AppCard backgroundColor="#eff6ff">
        <Text style={{ color: "#1d4ed8", lineHeight: 21 }}>
          Lab results should be reviewed with a healthcare professional.
        </Text>
        <Text
          style={{
            color: "#64748b",
            fontSize: 12,
            lineHeight: 18,
            marginTop: 8,
          }}
        >
          Do not use this app to interpret lab results. Speak to a healthcare
          professional for medical interpretation.
        </Text>
      </AppCard>
      <SimpleFormCard
        title="Add Lab Result"
        onSave={saveLab}
        saveLabel="Save Lab Result"
      >
        <TextInput
          onChangeText={setTestName}
          placeholder="Lab test name"
          placeholderTextColor="#94a3b8"
          style={INPUT_STYLE}
          value={testName}
        />
        <TextInput
          onChangeText={setProvider}
          placeholder="Lab / provider optional"
          placeholderTextColor="#94a3b8"
          style={INPUT_STYLE}
          value={provider}
        />
        <TextInput
          onChangeText={setTestDate}
          placeholder="Test date YYYY-MM-DD"
          placeholderTextColor="#94a3b8"
          style={INPUT_STYLE}
          value={testDate}
        />
        <TextInput
          onChangeText={setResultValue}
          placeholder="Result value optional"
          placeholderTextColor="#94a3b8"
          style={INPUT_STYLE}
          value={resultValue}
        />
        <TextInput
          onChangeText={setUnit}
          placeholder="Unit optional"
          placeholderTextColor="#94a3b8"
          style={INPUT_STYLE}
          value={unit}
        />
        <TextInput
          onChangeText={setReferenceRange}
          placeholder="Reference range optional"
          placeholderTextColor="#94a3b8"
          style={INPUT_STYLE}
          value={referenceRange}
        />
        <TextInput
          onChangeText={setFollowUpDate}
          placeholder="Follow-up date optional"
          placeholderTextColor="#94a3b8"
          style={INPUT_STYLE}
          value={followUpDate}
        />
        <TextInput
          multiline
          onChangeText={setNotes}
          placeholder="Notes"
          placeholderTextColor="#94a3b8"
          style={{ ...INPUT_STYLE, minHeight: 80, paddingTop: 13 }}
          value={notes}
        />
      </SimpleFormCard>
      <ListSection
        emptyText="No lab results yet. Upload or record lab results for reference."
        items={labs}
        title="Lab results"
        renderItem={(item) => (
          <BasicCard
            key={item.id}
            title={item.testName}
            subtitle={`${item.testDate}${item.followUpDate ? ` - review ${item.followUpDate}` : ""}`}
          />
        )}
      />
    </View>
  );
}

function PrescriptionsTab({
  medications,
  onReload,
  prescriptions,
}: {
  medications: Medication[];
  onReload: () => void;
  prescriptions: PrescriptionRecord[];
}) {
  const [title, setTitle] = useState("");
  const [provider, setProvider] = useState("");
  const [dateIssued, setDateIssued] = useState("");
  const [expiryDate, setExpiryDate] = useState("");
  const [relatedMedicationId, setRelatedMedicationId] = useState("");
  const [repeatPrescription, setRepeatPrescription] = useState(false);
  const [refillReminderDate, setRefillReminderDate] = useState("");
  const [notes, setNotes] = useState("");
  const [placeholder, setPlaceholder] = useState<string | null>(null);

  async function savePrescription() {
    if (!title.trim()) {
      return;
    }
    await createPrescriptionRecord({
      dateIssued,
      expiryDate,
      notes,
      provider,
      refillReminderDate,
      relatedMedicationId,
      repeatPrescription,
      title,
    });
    setTitle("");
    setNotes("");
    await onReload();
  }

  return (
    <View style={{ gap: 12 }}>
      <SimpleFormCard
        title="Add Prescription"
        onSave={savePrescription}
        saveLabel="Save Prescription"
      >
        <TextInput
          onChangeText={setTitle}
          placeholder="Prescription title"
          placeholderTextColor="#94a3b8"
          style={INPUT_STYLE}
          value={title}
        />
        <TextInput
          onChangeText={setProvider}
          placeholder="Doctor / clinic optional"
          placeholderTextColor="#94a3b8"
          style={INPUT_STYLE}
          value={provider}
        />
        <TextInput
          onChangeText={setDateIssued}
          placeholder="Date issued YYYY-MM-DD"
          placeholderTextColor="#94a3b8"
          style={INPUT_STYLE}
          value={dateIssued}
        />
        <TextInput
          onChangeText={setExpiryDate}
          placeholder="Expiry date optional"
          placeholderTextColor="#94a3b8"
          style={INPUT_STYLE}
          value={expiryDate}
        />
        <RelationSelector
          current={relatedMedicationId}
          label="Related medication optional"
          options={medications.map((item) => ({
            key: item.id,
            label: item.name,
          }))}
          onSelect={setRelatedMedicationId}
        />
        <ToggleRow
          label="Repeat prescription"
          onChange={setRepeatPrescription}
          value={repeatPrescription}
        />
        <TextInput
          onChangeText={setRefillReminderDate}
          placeholder="Refill reminder date optional"
          placeholderTextColor="#94a3b8"
          style={INPUT_STYLE}
          value={refillReminderDate}
        />
        <TextInput
          multiline
          onChangeText={setNotes}
          placeholder="Notes"
          placeholderTextColor="#94a3b8"
          style={{ ...INPUT_STYLE, minHeight: 80, paddingTop: 13 }}
          value={notes}
        />
        <SecondaryButton
          label="Create medication from prescription later"
          onPress={() =>
            setPlaceholder(
              "Medication creation from a prescription will be added later and will require your confirmation before saving.",
            )
          }
        />
        {placeholder ? (
          <Text style={{ color: "#64748b", lineHeight: 21 }}>
            {placeholder}
          </Text>
        ) : null}
      </SimpleFormCard>
      <ListSection
        emptyText="No prescription records yet."
        items={prescriptions}
        title="Prescription records"
        renderItem={(item) => (
          <BasicCard
            key={item.id}
            title={item.title}
            subtitle={`${item.dateIssued ?? "No date"}${item.refillReminderDate ? ` - refill ${item.refillReminderDate}` : ""}`}
          />
        )}
      />
    </View>
  );
}

function NotesTab({
  notes,
  onReload,
}: {
  notes: HealthRecord[];
  onReload: () => void;
}) {
  const [title, setTitle] = useState("");
  const [noteText, setNoteText] = useState("");
  const [category, setCategory] = useState("general");
  const [tags, setTags] = useState("");

  async function saveNote() {
    if (!title.trim() || !noteText.trim()) {
      return;
    }
    await createHealthRecord({
      notes: `${category}: ${noteText}`,
      tags: splitTags(tags),
      title,
      type: "health_note",
    });
    setTitle("");
    setNoteText("");
    await onReload();
  }

  return (
    <View style={{ gap: 12 }}>
      <SimpleFormCard
        title="Add Health Note"
        onSave={saveNote}
        saveLabel="Save Note"
      >
        <TextInput
          onChangeText={setTitle}
          placeholder="Title"
          placeholderTextColor="#94a3b8"
          style={INPUT_STYLE}
          value={title}
        />
        <TextInput
          onChangeText={setCategory}
          placeholder="Category"
          placeholderTextColor="#94a3b8"
          style={INPUT_STYLE}
          value={category}
        />
        <TextInput
          multiline
          onChangeText={setNoteText}
          placeholder="Note text"
          placeholderTextColor="#94a3b8"
          style={{ ...INPUT_STYLE, minHeight: 110, paddingTop: 13 }}
          value={noteText}
        />
        <TextInput
          onChangeText={setTags}
          placeholder="Tags, comma separated"
          placeholderTextColor="#94a3b8"
          style={INPUT_STYLE}
          value={tags}
        />
      </SimpleFormCard>
      <ListSection
        emptyText="No notes yet. Add a health note for reference."
        items={notes}
        title="Health notes"
        renderItem={(record) => (
          <RecordCard key={record.id} onReload={onReload} record={record} />
        )}
      />
    </View>
  );
}

function FoldersTab({
  folders,
  onReload,
  records,
}: {
  folders: HealthRecordFolder[];
  onReload: () => void;
  records: HealthRecord[];
}) {
  const [name, setName] = useState("");

  async function saveFolder() {
    if (!name.trim()) {
      return;
    }
    await createHealthRecordFolder({ name });
    setName("");
    await onReload();
  }

  return (
    <View style={{ gap: 12 }}>
      <SimpleFormCard
        title="Create Folder"
        onSave={saveFolder}
        saveLabel="Save Folder"
      >
        <TextInput
          onChangeText={setName}
          placeholder="Folder name"
          placeholderTextColor="#94a3b8"
          style={INPUT_STYLE}
          value={name}
        />
      </SimpleFormCard>
      <ListSection
        emptyText="No custom folders yet. Create folders to organize records your way."
        items={folders}
        title="Folders"
        renderItem={(folder) => (
          <BasicCard
            key={folder.id}
            title={folder.name}
            subtitle={`${records.filter((record) => record.folderId === folder.id).length} records${folder.isDefault ? " - default" : ""}`}
          />
        )}
      />
    </View>
  );
}

function ReminderList({
  onReload,
  reminders,
}: {
  onReload: () => void;
  reminders: HealthRecordReminder[];
}) {
  return (
    <ListSection
      emptyText="No follow-up reminders yet."
      items={reminders}
      title="Upcoming follow-ups"
      renderItem={(reminder) => (
        <AppCard
          key={reminder.id}
          backgroundColor={reminder.status === "missed" ? "#fff7ed" : "#ffffff"}
        >
          <Text style={{ color: "#0f172a", fontWeight: "900" }}>
            {reminder.title}
          </Text>
          <Text style={{ color: "#64748b", marginTop: 4 }}>
            {reminder.reminderDate} - {formatValue(reminder.type)}
          </Text>
          <SecondaryButton
            label="Dismiss"
            onPress={() => dismissRecordReminder(reminder.id).then(onReload)}
          />
        </AppCard>
      )}
    />
  );
}

function RecordCard({
  onReload,
  record,
}: {
  onReload: () => void;
  record: HealthRecord;
}) {
  return (
    <AppCard>
      <View style={{ gap: 8 }}>
        <View
          style={{
            flexDirection: "row",
            gap: 10,
            justifyContent: "space-between",
          }}
        >
          <View style={{ flex: 1 }}>
            <Text style={{ color: "#0f172a", fontSize: 18, fontWeight: "900" }}>
              {record.title}
            </Text>
            <Text style={{ color: "#64748b", marginTop: 4 }}>
              {formatValue(record.type)} - Private
            </Text>
          </View>
          {record.isPinned ? (
            <Text style={{ color: "#f59e0b", fontWeight: "900" }}>Pinned</Text>
          ) : null}
        </View>
        {record.notes ? (
          <Text style={{ color: "#64748b", lineHeight: 21 }}>
            {record.notes}
          </Text>
        ) : null}
        {record.reminderDate ? (
          <Text style={{ color: "#64748b" }}>
            Reminder {record.reminderDate}
          </Text>
        ) : null}
        {record.tags.length ? (
          <Text style={{ color: "#94a3b8" }}>{record.tags.join(", ")}</Text>
        ) : null}
        <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
          <SecondaryButton
            label={record.isPinned ? "Unpin" : "Pin"}
            onPress={() =>
              (record.isPinned
                ? unpinHealthRecord(record.id)
                : pinHealthRecord(record.id)
              ).then(onReload)
            }
          />
          {record.fileUrl ? (
            <SecondaryButton
              label="Remove uploaded file"
              onPress={() => deleteHealthRecordFile(record.id).then(onReload)}
            />
          ) : null}
          <SecondaryButton
            label="Delete record"
            onPress={() => deleteHealthRecord(record.id).then(onReload)}
          />
        </View>
      </View>
    </AppCard>
  );
}

function VisitCard({
  records = [],
  visit,
}: {
  records?: HealthRecord[];
  visit: DoctorVisit;
}) {
  return (
    <AppCard>
      <Text style={{ color: "#0f172a", fontSize: 18, fontWeight: "900" }}>
        {visit.title}
      </Text>
      <Text style={{ color: "#64748b", marginTop: 4 }}>
        {visit.clinicName ?? "Clinic not entered"} - {visit.visitDate}
      </Text>
      {visit.summaryNotes ? (
        <Text style={{ color: "#64748b", lineHeight: 21, marginTop: 6 }}>
          {visit.summaryNotes}
        </Text>
      ) : null}
      {visit.followUpDate ? (
        <Text style={{ color: "#b45309", marginTop: 6 }}>
          Follow-up {visit.followUpDate}
        </Text>
      ) : null}
      {records.length ? (
        <Text style={{ color: "#94a3b8", marginTop: 6 }}>
          {records.length} related document{records.length === 1 ? "" : "s"}
        </Text>
      ) : null}
    </AppCard>
  );
}

function BasicCard({ subtitle, title }: { subtitle?: string; title: string }) {
  return (
    <AppCard>
      <Text style={{ color: "#0f172a", fontSize: 18, fontWeight: "900" }}>
        {title}
      </Text>
      {subtitle ? (
        <Text style={{ color: "#64748b", lineHeight: 21, marginTop: 4 }}>
          {subtitle}
        </Text>
      ) : null}
    </AppCard>
  );
}

function ListSection<T>({
  emptyText,
  items,
  renderItem,
  title,
}: {
  emptyText: string;
  items: T[];
  renderItem: (item: T) => ReactNode;
  title: string;
}) {
  return (
    <View style={{ gap: 10 }}>
      <Text style={{ color: "#0f172a", fontSize: 22, fontWeight: "900" }}>
        {title}
      </Text>
      {items.length ? (
        items.map(renderItem)
      ) : (
        <AppCard>
          <Text style={{ color: "#64748b", lineHeight: 21 }}>{emptyText}</Text>
        </AppCard>
      )}
    </View>
  );
}

function SimpleFormCard({
  children,
  onSave,
  saveLabel,
  title,
}: {
  children: ReactNode;
  onSave: () => void;
  saveLabel: string;
  title: string;
}) {
  return (
    <AppCard>
      <View style={{ gap: 12 }}>
        <Text style={{ color: "#0f172a", fontSize: 20, fontWeight: "900" }}>
          {title}
        </Text>
        {children}
        <AppButton onPress={onSave} title={saveLabel} />
      </View>
    </AppCard>
  );
}

function ChipGroup({
  current,
  onSelect,
  options,
}: {
  current: string;
  onSelect: (key: string) => void;
  options: Array<{ key: string; label: string }>;
}) {
  return (
    <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
      {options.map((option) => (
        <TouchableOpacity
          key={option.key}
          activeOpacity={0.85}
          onPress={() => onSelect(current === option.key ? "" : option.key)}
          style={{
            backgroundColor: current === option.key ? "#0f172a" : "#f8fafc",
            borderRadius: 999,
            paddingHorizontal: 12,
            paddingVertical: 9,
          }}
        >
          <Text
            style={{
              color: current === option.key ? "#ffffff" : "#475569",
              fontWeight: "900",
            }}
          >
            {option.label}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

function RelationSelector({
  current,
  label,
  onSelect,
  options,
}: {
  current: string;
  label: string;
  onSelect: (key: string) => void;
  options: Array<{ key: string; label: string }>;
}) {
  if (!options.length) {
    return null;
  }

  return (
    <View style={{ gap: 8 }}>
      <Text style={{ color: "#64748b", fontWeight: "900" }}>{label}</Text>
      <ChipGroup current={current} onSelect={onSelect} options={options} />
    </View>
  );
}

function PrivatePinnedRow({
  isPinned,
  onPinnedChange,
}: {
  isPinned: boolean;
  onPinnedChange: (value: boolean) => void;
}) {
  return (
    <View style={{ gap: 10 }}>
      <ToggleRow label="Private" onChange={() => undefined} value />
      <ToggleRow label="Pinned" onChange={onPinnedChange} value={isPinned} />
    </View>
  );
}

function ToggleRow({
  label,
  onChange,
  value,
}: {
  label: string;
  onChange: (value: boolean) => void;
  value: boolean;
}) {
  return (
    <View
      style={{
        alignItems: "center",
        backgroundColor: "#f8fafc",
        borderRadius: 16,
        flexDirection: "row",
        justifyContent: "space-between",
        padding: 12,
      }}
    >
      <Text style={{ color: "#0f172a", fontWeight: "900" }}>{label}</Text>
      <Switch onValueChange={onChange} value={value} />
    </View>
  );
}

function MiniAction({
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
        backgroundColor: "#ffffff",
        borderRadius: 999,
        paddingHorizontal: 12,
        paddingVertical: 9,
      }}
    >
      <Text style={{ color: "#6d28d9", fontWeight: "900" }}>{label}</Text>
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
        backgroundColor: "#f8fafc",
        borderRadius: 16,
        justifyContent: "center",
        minHeight: 46,
        paddingHorizontal: 12,
      }}
    >
      <Text style={{ color: "#475569", fontWeight: "900" }}>{label}</Text>
    </TouchableOpacity>
  );
}

function splitTags(value: string) {
  return value
    .split(",")
    .map((tag) => tag.trim())
    .filter(Boolean);
}

function formatValue(value: string) {
  return value
    .replace(/_/g, " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}
