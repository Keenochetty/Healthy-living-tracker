import type { GeneralHealthActivityEntry, GeneralHealthLogDraft } from "@/lib/generalHealthMockData";

let localActivitySequence = 0;

export function createGeneralHealthActivity(draft: GeneralHealthLogDraft, profileId: string, profileName: string): GeneralHealthActivityEntry {
  localActivitySequence += 1;
  const base = { createdAt: draft.recordedAt, id: `local-health-activity-${draft.recordedAt}-${localActivitySequence}`, profileId, profileName };

  if (draft.logType === "vitals") {
    const readings = [
      draft.heartRate ? `Heart rate ${draft.heartRate} bpm` : "",
      draft.systolic && draft.diastolic ? `Blood pressure ${draft.systolic} / ${draft.diastolic} mmHg` : "",
      draft.oxygen ? `Oxygen ${draft.oxygen}%` : ""
    ].filter(Boolean);
    return {
      ...base,
      details: { diastolic: draft.diastolic, heartRate: draft.heartRate, notes: draft.notes, oxygen: draft.oxygen, systolic: draft.systolic },
      summary: readings.join(" · "),
      title: "Vitals logged",
      type: "vitals"
    };
  }
  if (draft.logType === "weight") {
    return { ...base, details: { notes: draft.notes, weight: draft.weight }, summary: `${draft.weight} kg`, title: "Weight added", type: "weight" };
  }
  if (draft.logType === "temperature") {
    return { ...base, details: { method: draft.method, notes: draft.notes, temperature: draft.temperature }, summary: `${draft.temperature} °C · ${draft.method}`, title: "Temperature logged", type: "temperature" };
  }
  return { ...base, details: { category: draft.category, details: draft.details, noteTitle: draft.noteTitle }, summary: draft.noteTitle || draft.details || "Health note", title: "Health note added", type: "note" };
}
