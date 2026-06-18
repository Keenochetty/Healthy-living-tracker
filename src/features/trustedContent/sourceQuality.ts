import type { HealthOSSourceQuality } from "./types";

export const HEALTHOS_SOURCE_QUALITY_LABELS: Record<
  HealthOSSourceQuality,
  string
> = {
  clinicalInstitution: "Clinical institution",
  community: "Community",
  aiGenerated: "AI-generated, needs review",
  manufacturer: "Manufacturer / label",
  officialHealthAuthority: "Official health authority",
  peerReviewed: "Peer reviewed",
  registeredProfessional: "Professional reviewed",
  trustedPublisher: "Trusted publisher",
  unknown: "Unknown source",
  userSaved: "User saved",
};

export function sourceQualityTone(quality: HealthOSSourceQuality) {
  switch (quality) {
    case "officialHealthAuthority":
    case "clinicalInstitution":
    case "peerReviewed":
    case "registeredProfessional":
      return "success" as const;
    case "manufacturer":
    case "trustedPublisher":
    case "userSaved":
    case "aiGenerated":
      return "warning" as const;
    case "unknown":
    case "community":
    default:
      return "danger" as const;
  }
}

export function isSourceQualityTrusted(quality: HealthOSSourceQuality) {
  return (
    quality === "officialHealthAuthority" ||
    quality === "clinicalInstitution" ||
    quality === "peerReviewed" ||
    quality === "registeredProfessional" ||
      quality === "trustedPublisher"
  );
}

export function getSourceQualityLabel(quality: HealthOSSourceQuality) {
  return HEALTHOS_SOURCE_QUALITY_LABELS[quality] ?? HEALTHOS_SOURCE_QUALITY_LABELS.unknown;
}

export function getSourceQualityDescription(quality: HealthOSSourceQuality) {
  switch (quality) {
    case "officialHealthAuthority":
      return "Government or official public health source.";
    case "clinicalInstitution":
      return "Clinical institution or hospital education source.";
    case "peerReviewed":
      return "Peer-reviewed or journal source.";
    case "registeredProfessional":
      return "Registered professional or professional organization source.";
    case "trustedPublisher":
      return "Health publisher with source review expectations.";
    case "manufacturer":
      return "Manufacturer or product-label information; review context carefully.";
    case "community":
      return "Community content; not medical guidance.";
    case "userSaved":
      return "Private user-saved link; not globally trusted.";
    case "aiGenerated":
      return "AI-generated or AI-summarized content; requires review.";
    case "unknown":
    default:
      return "Source has not been verified.";
  }
}

export const isSourceOfficial = (quality: HealthOSSourceQuality) => quality === "officialHealthAuthority";
export const isSourceClinical = (quality: HealthOSSourceQuality) =>
  quality === "clinicalInstitution" || quality === "peerReviewed" || quality === "registeredProfessional";
export const isSourceUserSaved = (quality: HealthOSSourceQuality) => quality === "userSaved";
export const isSourceAIGenerated = (quality: HealthOSSourceQuality) => quality === "aiGenerated";
export const isContentTrustedForHealthEducation = isSourceQualityTrusted;
export const getSourceQualityBadgeTone = sourceQualityTone;

export function getSourceMissingWarning(sourceUrl?: string | null) {
  return sourceUrl ? null : "Source details are missing. Review before trusting this content.";
}
