import AsyncStorage from "@react-native-async-storage/async-storage";

import {
  createMedicationSupplementNote,
  getMedications,
  getNotesByItem,
  getSchedulesByItem,
  getSupplements,
  updateMedication,
  updateSupplement,
} from "@/lib/medicationSupplementStorage";
import type {
  AllergySensitivityNote,
  FoodTiming,
  Medication,
  MedicationStandardMatch,
  SafetyChecklistItem,
  SafetyNotice,
  SafetyNoticeCategory,
  SafetyNoticeType,
  Supplement,
  SupplementIngredientMatch,
} from "@/types/medication";

const MEDICATION_STANDARD_MATCHES_STORAGE_KEY =
  "family_health_medication_standard_matches";
const SUPPLEMENT_INGREDIENT_MATCHES_STORAGE_KEY =
  "family_health_supplement_ingredient_matches";
const SAFETY_NOTICES_STORAGE_KEY = "family_health_safety_notices";
const SAFETY_CHECKLIST_ITEMS_STORAGE_KEY =
  "family_health_safety_checklist_items";
const ALLERGY_SENSITIVITY_NOTES_STORAGE_KEY =
  "family_health_allergy_sensitivity_notes";
const LOCAL_USER_ID = "local-user";
const LOCAL_PROFILE_ID = "local-profile";

const MEDICATION_CHECKLIST = [
  { key: "checked_name", label: "I checked the medication name" },
  { key: "checked_strength", label: "I checked the strength" },
  { key: "checked_label", label: "I checked the label instructions" },
  { key: "confirmed_food_timing", label: "I confirmed food timing if needed" },
  { key: "asked_professional", label: "I asked a pharmacist/doctor if unsure" },
];

const SUPPLEMENT_CHECKLIST = [
  { key: "checked_label", label: "I checked the supplement label" },
  { key: "checked_serving", label: "I checked the serving size" },
  {
    key: "checked_similar_ingredients",
    label: "I checked other supplements with similar ingredients",
  },
  {
    key: "confirmed_if_unsure",
    label:
      "I confirmed with a healthcare professional if taking medication, pregnant, or unsure",
  },
];

export async function normalizeMedicationName(name: string) {
  return name.trim().replace(/\s+/g, " ");
}

export async function searchMedicationStandardNames(query: string) {
  const normalizedQuery = (await normalizeMedicationName(query)).toLowerCase();

  if (!normalizedQuery) {
    return [] as MedicationStandardMatch[];
  }

  const medications = await getMedications();

  return medications
    .filter((medication) =>
      [medication.name, medication.genericName, medication.brandName].some(
        (value) => value?.toLowerCase().includes(normalizedQuery),
      ),
    )
    .map((medication) => toMedicationMatchCandidate(medication));
}

export async function getMedicationConceptByName(name: string) {
  const [firstMatch] = await searchMedicationStandardNames(name);

  return (
    firstMatch ?? {
      confidence: 0.4,
      confirmedByUser: false,
      displayName: await normalizeMedicationName(name),
      id: createId("medication-match-candidate"),
      matchedAt: new Date().toISOString(),
      medicationId: "",
      source: "manual" as const,
    }
  );
}

export async function saveMedicationStandardMatch(
  medicationId: string,
  match: Partial<MedicationStandardMatch> & { displayName: string },
) {
  const matches = await readJsonArray<MedicationStandardMatch>(
    MEDICATION_STANDARD_MATCHES_STORAGE_KEY,
  );
  const now = new Date().toISOString();
  const savedMatch: MedicationStandardMatch = {
    confidence: match.confidence ?? 0.7,
    confirmedByUser: match.confirmedByUser ?? true,
    displayName: match.displayName.trim(),
    form: match.form,
    id: match.id ?? createId("medication-match"),
    ingredientName: match.ingredientName?.trim() || match.displayName.trim(),
    matchedAt: match.matchedAt ?? now,
    medicationId,
    source: match.source ?? "manual",
    sourceConceptId: match.sourceConceptId,
    strength: match.strength,
  };

  await writeJsonArray(MEDICATION_STANDARD_MATCHES_STORAGE_KEY, [
    savedMatch,
    ...matches.filter((item) => item.medicationId !== medicationId),
  ]);
  await updateMedication(medicationId, {
    safetyStatus: savedMatch.confirmedByUser ? "name_matched" : "needs_review",
    standardMatchId: savedMatch.id,
  });

  return savedMatch;
}

export async function getMedicationStandardMatch(medicationId: string) {
  const matches = await readJsonArray<MedicationStandardMatch>(
    MEDICATION_STANDARD_MATCHES_STORAGE_KEY,
  );

  return matches.find((match) => match.medicationId === medicationId) ?? null;
}

export async function clearMedicationStandardMatch(medicationId: string) {
  const matches = await readJsonArray<MedicationStandardMatch>(
    MEDICATION_STANDARD_MATCHES_STORAGE_KEY,
  );

  await writeJsonArray(
    MEDICATION_STANDARD_MATCHES_STORAGE_KEY,
    matches.filter((match) => match.medicationId !== medicationId),
  );
  await updateMedicationSafetyStatus(medicationId, "not_checked");
}

export async function updateMedicationSafetyStatus(
  medicationId: string,
  safetyStatus: Medication["safetyStatus"],
) {
  const partial: Partial<Medication> =
    safetyStatus === "not_checked"
      ? { safetyStatus, standardMatchId: undefined }
      : { safetyStatus };

  return updateMedication(medicationId, partial);
}

export async function searchSupplementIngredients(query: string) {
  const trimmedQuery = query.trim().toLowerCase();

  if (!trimmedQuery) {
    return [] as SupplementIngredientMatch[];
  }

  const supplements = await getSupplements();

  return supplements
    .filter((supplement) =>
      [supplement.name, supplement.mainIngredient, supplement.brand].some(
        (value) => value?.toLowerCase().includes(trimmedQuery),
      ),
    )
    .map((supplement) => toSupplementMatchCandidate(supplement));
}

export async function getSupplementFactSheet(ingredientName: string) {
  const [firstMatch] = await searchSupplementIngredients(ingredientName);

  return firstMatch ?? null;
}

export async function saveSupplementIngredientMatch(
  supplementId: string,
  match: Partial<SupplementIngredientMatch> & {
    ingredientName: string;
    displayName?: string;
  },
) {
  const matches = await readJsonArray<SupplementIngredientMatch>(
    SUPPLEMENT_INGREDIENT_MATCHES_STORAGE_KEY,
  );
  const now = new Date().toISOString();
  const savedMatch: SupplementIngredientMatch = {
    confidence: match.confidence ?? 0.7,
    confirmedByUser: match.confirmedByUser ?? true,
    displayName: (match.displayName ?? match.ingredientName).trim(),
    id: match.id ?? createId("supplement-match"),
    ingredientName: match.ingredientName.trim(),
    matchedAt: match.matchedAt ?? now,
    source: match.source ?? "manual",
    sourceId: match.sourceId,
    supplementId,
  };

  await writeJsonArray(SUPPLEMENT_INGREDIENT_MATCHES_STORAGE_KEY, [
    savedMatch,
    ...matches.filter((item) => item.supplementId !== supplementId),
  ]);
  await updateSupplement(supplementId, {
    ingredientMatchId: savedMatch.id,
    safetyStatus: savedMatch.confirmedByUser ? "name_matched" : "needs_review",
  });

  return savedMatch;
}

export async function getSupplementIngredientMatch(supplementId: string) {
  const matches = await readJsonArray<SupplementIngredientMatch>(
    SUPPLEMENT_INGREDIENT_MATCHES_STORAGE_KEY,
  );

  return matches.find((match) => match.supplementId === supplementId) ?? null;
}

export async function clearSupplementIngredientMatch(supplementId: string) {
  const matches = await readJsonArray<SupplementIngredientMatch>(
    SUPPLEMENT_INGREDIENT_MATCHES_STORAGE_KEY,
  );

  await writeJsonArray(
    SUPPLEMENT_INGREDIENT_MATCHES_STORAGE_KEY,
    matches.filter((match) => match.supplementId !== supplementId),
  );
  await updateSupplementSafetyStatus(supplementId, "not_checked");
}

export async function updateSupplementSafetyStatus(
  supplementId: string,
  safetyStatus: Supplement["safetyStatus"],
) {
  const partial: Partial<Supplement> =
    safetyStatus === "not_checked"
      ? { ingredientMatchId: undefined, safetyStatus }
      : { safetyStatus };

  return updateSupplement(supplementId, partial);
}

export async function generateMedicationSafetyNotices(medicationId?: string) {
  const [
    medications,
    allergyNotices,
    duplicateNotices,
    timingNotices,
    profileNotices,
  ] = await Promise.all([
    getMedications(),
    generateAllergyReviewNotices("medication", medicationId),
    generateDuplicateIngredientNotices("medication", medicationId),
    generateFoodTimingNotices("medication", medicationId),
    generateProfileSpecificCautions("medication"),
  ]);
  const targetMedications = medicationId
    ? medications.filter((medication) => medication.id === medicationId)
    : medications;
  const nameNotices = await Promise.all(
    targetMedications.map(async (medication) => {
      const match = await getMedicationStandardMatch(medication.id);

      return createNotice({
        category: "name_match",
        message: match
          ? "This medication name was matched to a standard medicine record. Confirm it matches your label or healthcare professional's instructions."
          : "This medication has not been matched to a trusted source yet. You can add a manual match and confirm it later.",
        relatedId: medication.id,
        relatedType: "medication",
        title: medication.name,
        type: match ? "info" : "review",
      });
    }),
  );

  return storeGeneratedNotices([
    ...nameNotices,
    ...allergyNotices,
    ...duplicateNotices,
    ...timingNotices,
    ...profileNotices,
  ]);
}

export async function generateSupplementSafetyNotices(supplementId?: string) {
  const [
    supplements,
    allergyNotices,
    duplicateNotices,
    timingNotices,
    profileNotices,
    medications,
  ] = await Promise.all([
    getSupplements(),
    generateAllergyReviewNotices("supplement", supplementId),
    generateDuplicateIngredientNotices("supplement", supplementId),
    generateFoodTimingNotices("supplement", supplementId),
    generateProfileSpecificCautions("supplement"),
    getMedications(),
  ]);
  const targetSupplements = supplementId
    ? supplements.filter((supplement) => supplement.id === supplementId)
    : supplements;
  const sourceNotices = await Promise.all(
    targetSupplements.map(async (supplement) => {
      const match = await getSupplementIngredientMatch(supplement.id);

      return createNotice({
        category: "data_source",
        message: match
          ? "This supplement ingredient has a user-confirmed match. Review the product label if details change."
          : "This supplement has not been matched to a trusted source yet. Review labels and confirm with a healthcare professional if unsure.",
        relatedId: supplement.id,
        relatedType: "supplement",
        title: supplement.name,
        type: match ? "info" : "review",
      });
    }),
  );
  const confirmationNotices = medications.length
    ? targetSupplements.map((supplement) =>
        createNotice({
          category: "general",
          message:
            "This item may need pharmacist confirmation because you also track medication.",
          relatedId: supplement.id,
          relatedType: "supplement",
          title: supplement.name,
          type: "confirm",
        }),
      )
    : [];

  return storeGeneratedNotices([
    ...sourceNotices,
    ...confirmationNotices,
    ...allergyNotices,
    ...duplicateNotices,
    ...timingNotices,
    ...profileNotices,
  ]);
}

export async function generateFoodTimingNotices(
  itemType?: "medication" | "supplement",
  itemId?: string,
) {
  const items =
    itemType === "medication"
      ? (await getMedications()).map((item) => ({
          ...item,
          itemType: "medication" as const,
        }))
      : itemType === "supplement"
        ? (await getSupplements()).map((item) => ({
            ...item,
            itemType: "supplement" as const,
          }))
        : [
            ...(await getMedications()).map((item) => ({
              ...item,
              itemType: "medication" as const,
            })),
            ...(await getSupplements()).map((item) => ({
              ...item,
              itemType: "supplement" as const,
            })),
          ];
  const notices: SafetyNotice[] = [];

  for (const item of items) {
    if (itemId && item.id !== itemId) {
      continue;
    }

    const schedules = await getSchedulesByItem(item.itemType, item.id);

    schedules
      .filter((schedule) => schedule.foodTiming !== "none")
      .forEach((schedule) => {
        notices.push(
          createNotice({
            category: "food_timing",
            message: `Food timing note recorded: ${formatFoodTiming(schedule.foodTiming)}. Confirm this matches your label or healthcare professional's instructions.`,
            relatedId: item.id,
            relatedType: schedule.itemType,
            title: item.name,
            type: "review",
          }),
        );
      });
  }

  return notices;
}

export async function generateDuplicateIngredientNotices(
  itemType?: "medication" | "supplement",
  itemId?: string,
) {
  const notices: SafetyNotice[] = [];

  if (!itemType || itemType === "medication") {
    const medications = await getMedications();
    const matches = await readJsonArray<MedicationStandardMatch>(
      MEDICATION_STANDARD_MATCHES_STORAGE_KEY,
    );
    const ingredientMap = groupByIngredient(
      medications.map((medication) => ({
        id: medication.id,
        name: medication.name,
        ingredient:
          matches.find((match) => match.medicationId === medication.id)
            ?.ingredientName ??
          medication.genericName ??
          medication.name,
      })),
    );

    ingredientMap.forEach((items) => {
      if (items.length > 1) {
        items
          .filter((item) => !itemId || item.id === itemId)
          .forEach((item) => {
            notices.push(
              createNotice({
                category: "duplicate_ingredient",
                message:
                  "Two tracked items may contain the same ingredient. Please confirm with a pharmacist or healthcare professional.",
                relatedId: item.id,
                relatedType: "medication",
                title: item.name,
                type: "confirm",
              }),
            );
          });
      }
    });
  }

  if (!itemType || itemType === "supplement") {
    const supplements = await getSupplements();
    const matches = await readJsonArray<SupplementIngredientMatch>(
      SUPPLEMENT_INGREDIENT_MATCHES_STORAGE_KEY,
    );
    const ingredientMap = groupByIngredient(
      supplements.map((supplement) => ({
        id: supplement.id,
        name: supplement.name,
        ingredient:
          matches.find((match) => match.supplementId === supplement.id)
            ?.ingredientName ??
          supplement.mainIngredient ??
          supplement.name,
      })),
    );

    ingredientMap.forEach((items) => {
      if (items.length > 1) {
        items
          .filter((item) => !itemId || item.id === itemId)
          .forEach((item) => {
            notices.push(
              createNotice({
                category: "duplicate_ingredient",
                message:
                  "Multiple supplements may include the same nutrient. Review labels and confirm with a healthcare professional if unsure.",
                relatedId: item.id,
                relatedType: "supplement",
                title: item.name,
                type: "review",
              }),
            );
          });
      }
    });
  }

  return notices;
}

export async function generateAllergyReviewNotices(
  itemType?: "medication" | "supplement",
  itemId?: string,
) {
  const [allergies, medications, supplements] = await Promise.all([
    getAllergySensitivityNotes(),
    getMedications(),
    getSupplements(),
  ]);
  const notices: SafetyNotice[] = [];
  const allItems = [
    ...medications.map((medication) => ({
      ...medication,
      relatedType: "medication" as const,
    })),
    ...supplements.map((supplement) => ({
      ...supplement,
      relatedType: "supplement" as const,
    })),
  ].filter(
    (item) =>
      (!itemType || item.relatedType === itemType) &&
      (!itemId || item.id === itemId),
  );

  allItems.forEach((item) => {
    allergies.forEach((allergy) => {
      const haystack = [
        item.name,
        "genericName" in item ? item.genericName : undefined,
        "brandName" in item ? item.brandName : undefined,
        "mainIngredient" in item ? item.mainIngredient : undefined,
        item.notes,
        item.instructions,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      if (
        allergy.allergyName &&
        haystack.includes(allergy.allergyName.toLowerCase())
      ) {
        notices.push(
          createNotice({
            category: "allergy",
            message:
              "This item may mention an ingredient related to your allergy note. Please review the label and confirm with a healthcare professional if needed.",
            relatedId: item.id,
            relatedType: item.relatedType,
            title: item.name,
            type: "review",
          }),
        );
      }
    });
  });

  return notices;
}

export async function generateProfileSpecificCautions(
  relatedType: "medication" | "supplement" | "profile" = "profile",
) {
  return [
    createNotice({
      category: "profile_caution",
      message:
        "For children, medication and supplement use should follow healthcare professional guidance.",
      relatedType,
      title: "Child profile caution",
      type: "info",
    }),
    createNotice({
      category: "profile_caution",
      message:
        "During pregnancy, confirm medication and supplement choices with a healthcare professional.",
      relatedType,
      title: "Pregnancy caution",
      type: "info",
    }),
    createNotice({
      category: "profile_caution",
      message:
        "For older adults or multiple medications, pharmacist review may be helpful.",
      relatedType,
      title: "Older adult caution",
      type: "info",
    }),
  ];
}

export async function getSafetyNotices(
  relatedType?: SafetyNotice["relatedType"],
  relatedId?: string,
) {
  const notices = await readJsonArray<SafetyNotice>(SAFETY_NOTICES_STORAGE_KEY);

  return notices
    .filter((notice) => !notice.isDismissed)
    .filter(
      (notice) =>
        (!relatedType || notice.relatedType === relatedType) &&
        (!relatedId || notice.relatedId === relatedId),
    )
    .sort(
      (left, right) =>
        new Date(right.createdAt).getTime() -
        new Date(left.createdAt).getTime(),
    );
}

export async function dismissSafetyNotice(id: string) {
  const notices = await readJsonArray<SafetyNotice>(SAFETY_NOTICES_STORAGE_KEY);
  const updatedNotices = notices.map((notice) =>
    notice.id === id
      ? { ...notice, isDismissed: true, updatedAt: new Date().toISOString() }
      : notice,
  );

  await writeJsonArray(SAFETY_NOTICES_STORAGE_KEY, updatedNotices);
}

export async function getSafetyChecklist(
  relatedType: "medication" | "supplement",
  relatedId: string,
) {
  const storedItems = await readJsonArray<SafetyChecklistItem>(
    SAFETY_CHECKLIST_ITEMS_STORAGE_KEY,
  );
  const existingItems = storedItems.filter(
    (item) => item.relatedType === relatedType && item.relatedId === relatedId,
  );

  if (existingItems.length) {
    return existingItems;
  }

  const now = new Date().toISOString();
  const checklist = (
    relatedType === "medication" ? MEDICATION_CHECKLIST : SUPPLEMENT_CHECKLIST
  ).map((item) => ({
    checklistKey: item.key,
    createdAt: now,
    id: createId("safety-checklist"),
    isCompleted: false,
    label: item.label,
    profileId: LOCAL_PROFILE_ID,
    relatedId,
    relatedType,
    updatedAt: now,
    userId: LOCAL_USER_ID,
  }));

  await writeJsonArray(SAFETY_CHECKLIST_ITEMS_STORAGE_KEY, [
    ...checklist,
    ...storedItems,
  ]);

  return checklist;
}

export async function completeSafetyChecklistItem(
  id: string,
  isCompleted = true,
) {
  const items = await readJsonArray<SafetyChecklistItem>(
    SAFETY_CHECKLIST_ITEMS_STORAGE_KEY,
  );
  const now = new Date().toISOString();
  const updatedItems = items.map((item) =>
    item.id === id
      ? {
          ...item,
          completedAt: isCompleted ? now : undefined,
          isCompleted,
          updatedAt: now,
        }
      : item,
  );

  await writeJsonArray(SAFETY_CHECKLIST_ITEMS_STORAGE_KEY, updatedItems);
}

export async function resetSafetyChecklist(
  relatedType: "medication" | "supplement",
  relatedId: string,
) {
  const items = await readJsonArray<SafetyChecklistItem>(
    SAFETY_CHECKLIST_ITEMS_STORAGE_KEY,
  );

  await writeJsonArray(
    SAFETY_CHECKLIST_ITEMS_STORAGE_KEY,
    items.filter(
      (item) =>
        !(item.relatedType === relatedType && item.relatedId === relatedId),
    ),
  );

  return getSafetyChecklist(relatedType, relatedId);
}

export async function createAllergySensitivityNote(
  input: Partial<AllergySensitivityNote> & {
    allergyName: string;
    allergyType: AllergySensitivityNote["allergyType"];
  },
) {
  const now = new Date().toISOString();
  const note: AllergySensitivityNote = {
    allergyName: input.allergyName.trim(),
    allergyType: input.allergyType,
    confirmedByProfessional: input.confirmedByProfessional,
    createdAt: now,
    id: createId("allergy-note"),
    lockedPrivate: true,
    notes: input.notes?.trim() || undefined,
    profileId: LOCAL_PROFILE_ID,
    severity: input.severity ?? "unknown",
    sharedWithCaregiver: false,
    sharedWithFamily: false,
    sharedWithPartner: false,
    updatedAt: now,
    userId: LOCAL_USER_ID,
    visibility: "private",
  };
  const notes = await getAllergySensitivityNotes();

  await writeJsonArray(ALLERGY_SENSITIVITY_NOTES_STORAGE_KEY, [note, ...notes]);

  return note;
}

export async function getAllergySensitivityNotes() {
  return readJsonArray<AllergySensitivityNote>(
    ALLERGY_SENSITIVITY_NOTES_STORAGE_KEY,
  );
}

export async function updateAllergySensitivityNote(
  id: string,
  partial: Partial<
    Omit<AllergySensitivityNote, "id" | "userId" | "profileId" | "createdAt">
  >,
) {
  const notes = await getAllergySensitivityNotes();
  const updatedNotes = notes.map((note) =>
    note.id === id
      ? { ...note, ...partial, updatedAt: new Date().toISOString() }
      : note,
  );

  await writeJsonArray(ALLERGY_SENSITIVITY_NOTES_STORAGE_KEY, updatedNotes);

  return updatedNotes.find((note) => note.id === id) ?? null;
}

export async function deleteAllergySensitivityNote(id: string) {
  const notes = await getAllergySensitivityNotes();

  await writeJsonArray(
    ALLERGY_SENSITIVITY_NOTES_STORAGE_KEY,
    notes.filter((note) => note.id !== id),
  );
}

export async function createProfessionalQuestionNote({
  itemName,
  professionalType,
  question,
  relatedId,
  relatedType,
}: {
  itemName: string;
  professionalType: "pharmacist" | "doctor";
  question?: string;
  relatedId?: string;
  relatedType: "medication" | "supplement" | "general";
}) {
  const savedQuestion =
    question?.trim() ||
    `Can you please confirm if I should take ${itemName} with food?`;

  return createMedicationSupplementNote({
    note: `Ask ${professionalType}: ${savedQuestion}`,
    relatedId,
    relatedType,
    loggedAt: new Date().toISOString(),
  });
}

export async function getProfessionalQuestionNotes() {
  const medicationNotes = await getNotesByItem("general");

  return medicationNotes.filter((note) => note.note.startsWith("Ask "));
}

async function storeGeneratedNotices(nextNotices: SafetyNotice[]) {
  const existingNotices = await readJsonArray<SafetyNotice>(
    SAFETY_NOTICES_STORAGE_KEY,
  );
  const nextKeys = new Set(nextNotices.map((notice) => noticeKey(notice)));
  const preservedNotices = existingNotices.filter(
    (notice) => !nextKeys.has(noticeKey(notice)),
  );

  await writeJsonArray(SAFETY_NOTICES_STORAGE_KEY, [
    ...nextNotices,
    ...preservedNotices,
  ]);

  return nextNotices;
}

function toMedicationMatchCandidate(
  medication: Medication,
): MedicationStandardMatch {
  return {
    confidence: 0.65,
    confirmedByUser: false,
    displayName: medication.genericName ?? medication.name,
    form: medication.form,
    id: createId("medication-match-candidate"),
    ingredientName: medication.genericName ?? medication.name,
    matchedAt: new Date().toISOString(),
    medicationId: medication.id,
    source: "manual",
    strength: medication.strength,
  };
}

function toSupplementMatchCandidate(
  supplement: Supplement,
): SupplementIngredientMatch {
  return {
    confidence: 0.65,
    confirmedByUser: false,
    displayName: supplement.mainIngredient ?? supplement.name,
    id: createId("supplement-match-candidate"),
    ingredientName: supplement.mainIngredient ?? supplement.name,
    matchedAt: new Date().toISOString(),
    source: "manual",
    supplementId: supplement.id,
  };
}

function createNotice({
  category,
  message,
  relatedId,
  relatedType,
  title,
  type,
}: {
  category: SafetyNoticeCategory;
  message: string;
  relatedId?: string;
  relatedType: SafetyNotice["relatedType"];
  title: string;
  type: SafetyNoticeType;
}): SafetyNotice {
  const now = new Date().toISOString();

  return {
    category,
    createdAt: now,
    id: createId("safety-notice"),
    isDismissed: false,
    message,
    profileId: LOCAL_PROFILE_ID,
    relatedId,
    relatedType,
    title,
    type,
    updatedAt: now,
    userId: LOCAL_USER_ID,
  };
}

function groupByIngredient(
  items: Array<{ id: string; ingredient: string; name: string }>,
) {
  const map = new Map<string, Array<{ id: string; name: string }>>();

  items.forEach((item) => {
    const key = item.ingredient.trim().toLowerCase();

    if (!key) {
      return;
    }

    map.set(key, [...(map.get(key) ?? []), { id: item.id, name: item.name }]);
  });

  return map;
}

function formatFoodTiming(foodTiming: FoodTiming) {
  return foodTiming.replace(/_/g, " ");
}

function noticeKey(notice: SafetyNotice) {
  return `${notice.relatedType}-${notice.relatedId ?? "all"}-${notice.category}-${notice.title}-${notice.message}`;
}

function createId(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

async function readJsonArray<T>(key: string) {
  try {
    const storedValue = await AsyncStorage.getItem(key);

    if (!storedValue) {
      return [] as T[];
    }

    const parsedValue = JSON.parse(storedValue);

    return Array.isArray(parsedValue) ? (parsedValue as T[]) : [];
  } catch {
    return [] as T[];
  }
}

async function writeJsonArray<T>(key: string, value: T[]) {
  await AsyncStorage.setItem(key, JSON.stringify(value));

  return value;
}

export function getSafetyStatusLabel(
  status?: Medication["safetyStatus"] | Supplement["safetyStatus"],
) {
  switch (status) {
    case "name_matched":
      return "Name matched";
    case "needs_review":
      return "Needs review";
    case "professional_confirmation_recommended":
      return "Professional confirmation recommended";
    case "user_confirmed_label":
      return "User confirmed label";
    default:
      return "Not checked";
  }
}
