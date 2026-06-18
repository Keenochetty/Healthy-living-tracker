export function getMedicationDisclaimer() {
  return "HealthOS organizes medication information only. Follow your prescription label and healthcare professional's guidance.";
}

export function getSupplementDisclaimer() {
  return "Supplements can still have risks. Review supplement use with a healthcare professional, especially with medication, pregnancy, or child care.";
}

export function getMissedDoseSafeCopy() {
  return "For missed doses, check your medication instructions or ask a pharmacist, doctor, or healthcare professional.";
}

export function getSideEffectSafeCopy(severity?: string | null) {
  if (severity === "severe") {
    return "For severe or urgent symptoms, seek urgent medical help.";
  }
  return "This is a possible side-effect or symptom note, not a diagnosis. Review concerns with a healthcare professional.";
}

export function getProfessionalReviewCopy() {
  return "Review this with a healthcare professional before making medication or supplement decisions.";
}

export function getInteractionDeferredCopy() {
  return "Interaction checking is not connected yet. Use this as a review prompt, not a clinical conclusion.";
}

export function getPregnancyMedicationReviewCopy() {
  return "Review medication and supplement use during pregnancy with a qualified healthcare professional.";
}

export function getChildMedicationReviewCopy() {
  return "Review child medication or supplement use with a pediatrician, pharmacist, nurse, doctor, or qualified healthcare professional.";
}
