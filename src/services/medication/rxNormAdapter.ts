export async function searchRxNormMedications(_query: string) {
  return [];
}

export async function getRxNormMedicationDetails(_rxcui: string) {
  return null;
}

export async function getRxNormConceptByName(_name: string) {
  return null;
}

export async function getRxNormSafetyMatchStatus() {
  return {
    available: false,
    source: "rxnorm",
    status: "placeholder"
  };
}
