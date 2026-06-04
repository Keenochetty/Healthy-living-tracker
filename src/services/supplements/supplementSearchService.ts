import { searchSupplementNames } from "@/lib/medicationSupplementStorage";

export async function searchSupplementNameSuggestions(query: string) {
  return searchSupplementNames(query);
}
