import { searchMedicationNames } from "@/lib/medicationSupplementStorage";

export async function searchMedicationNameSuggestions(query: string) {
  return searchMedicationNames(query);
}
