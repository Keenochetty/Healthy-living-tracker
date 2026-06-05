import AsyncStorage from "@react-native-async-storage/async-storage";

import type {
  HealthContentAuditLog,
  HealthContentDisclaimer,
  HealthContentQualityCheck,
  HealthContentRealm,
  HealthContentRiskLevel,
  HealthContentStatus,
  TrustedHealthContentCard,
  TrustedSource,
  TrustedSourceStatus,
  TrustedSourceTier
} from "@/types/trustedContent";

const SOURCES_KEY = "family_health_phase18_trusted_sources";
const CONTENT_KEY = "family_health_phase18_trusted_content_cards";
const DISCLAIMERS_KEY = "family_health_phase18_content_disclaimers";
const QUALITY_KEY = "family_health_phase18_quality_checks";
const AUDIT_KEY = "family_health_phase18_content_audit_logs";
const LOCAL_USER_ID = "local-user";
const TODAY = "2026-06-05";

const UNSAFE_PHRASES = [
  "you have",
  "you are diagnosed",
  "this cures",
  "this treats",
  "safe day",
  "unsafe day",
  "contraception failed",
  "food cancelled contraception",
  "your baby is delayed",
  "normal result",
  "abnormal result",
  "take this dose",
  "stop taking",
  "start taking",
  "ignore this symptom"
];

export async function createTrustedSource(input: Omit<TrustedSource, "createdAt" | "id" | "updatedAt">) {
  const now = new Date().toISOString();
  const source: TrustedSource = {
    ...input,
    createdAt: now,
    id: createId("trusted-source"),
    updatedAt: now
  };
  const sources = await getTrustedSources(false);

  await writeJsonArray(SOURCES_KEY, [source, ...sources]);
  await createHealthContentAuditLog({ action: "source_created", sourceId: source.id, newValue: { sourceOrganization: source.sourceOrganization } });

  return source;
}

export async function getTrustedSources(includeSeeds = true) {
  const sources = await readJsonArray<TrustedSource>(SOURCES_KEY);
  const byId = new Map<string, TrustedSource>();

  (includeSeeds ? [...seedTrustedSources(), ...sources] : sources).forEach((source) => byId.set(source.id, source));

  return Array.from(byId.values()).sort((left, right) => left.sourceOrganization.localeCompare(right.sourceOrganization));
}

export async function getTrustedSourceById(id: string) {
  return (await getTrustedSources()).find((source) => source.id === id) ?? null;
}

export async function updateTrustedSource(id: string, partial: Partial<TrustedSource>) {
  const sources = await getTrustedSources(false);
  const updated = sources.map((source) =>
    source.id === id ? { ...source, ...partial, updatedAt: new Date().toISOString() } : source
  );

  await writeJsonArray(SOURCES_KEY, updated);
  await createHealthContentAuditLog({ action: "source_updated", sourceId: id, newValue: partial });

  return updated.find((source) => source.id === id) ?? null;
}

export async function blockTrustedSource(id: string) {
  return updateTrustedSource(id, { trustStatus: "blocked" });
}

export async function markSourceNeedsReview(id: string) {
  return updateTrustedSource(id, { trustStatus: "needs_review" });
}

export function validateSourceTrustLevel(source: TrustedSource | null, riskLevel: HealthContentRiskLevel) {
  if (!source || source.trustStatus !== "approved" || source.sourceTier === "disallowed") return false;
  if (riskLevel === "high" || riskLevel === "critical") return source.sourceTier === "tier_1" || source.sourceTier === "tier_2";
  return true;
}

export async function createTrustedHealthContentCard(input: Omit<TrustedHealthContentCard, "createdAt" | "id" | "status" | "updatedAt" | "versionNumber"> & {
  status?: HealthContentStatus;
  versionNumber?: number;
}) {
  const now = new Date().toISOString();
  const source = await getTrustedSourceById(input.sourceId);
  const status = source ? input.status ?? "draft" : "source_needed";
  const card: TrustedHealthContentCard = {
    ...input,
    createdAt: now,
    id: createId("trusted-content"),
    status,
    updatedAt: now,
    versionNumber: input.versionNumber ?? 1
  };
  const cards = await getTrustedHealthContentCards(false);

  await writeJsonArray(CONTENT_KEY, [card, ...cards]);
  await createHealthContentAuditLog({ action: "content_created", contentCardId: card.id, newValue: { title: card.title } });
  await runHealthContentQualityCheck(card.id);

  return card;
}

export async function getTrustedHealthContentCards(includeSeeds = true) {
  const cards = await readJsonArray<TrustedHealthContentCard>(CONTENT_KEY);
  const byId = new Map<string, TrustedHealthContentCard>();

  (includeSeeds ? [...seedTrustedContentCards(), ...cards] : cards).forEach((card) => byId.set(card.id, markExpiredIfNeeded(card)));

  return Array.from(byId.values()).sort((left, right) => left.title.localeCompare(right.title));
}

export async function getPublishedContentByRealm(realm: HealthContentRealm) {
  const cards = await getTrustedHealthContentCards();
  const sources = await getTrustedSources();

  return cards.filter((card) => {
    const source = sources.find((item) => item.id === card.sourceId) ?? null;
    const isFreshEnough = card.status === "published" && !isPastReviewDate(card);
    const highRiskAllowed = card.riskLevel !== "high" && card.riskLevel !== "critical"
      ? true
      : !isPastReviewDate(card);

    return card.realm === realm && isFreshEnough && highRiskAllowed && validateSourceTrustLevel(source, card.riskLevel);
  });
}

export async function getContentCardById(id: string) {
  return (await getTrustedHealthContentCards()).find((card) => card.id === id) ?? null;
}

export async function updateTrustedHealthContentCard(id: string, partial: Partial<TrustedHealthContentCard>) {
  const cards = await getTrustedHealthContentCards(false);
  const updated = cards.map((card) =>
    card.id === id
      ? { ...card, ...partial, updatedAt: new Date().toISOString(), versionNumber: partial.versionNumber ?? card.versionNumber + 1 }
      : card
  );

  await writeJsonArray(CONTENT_KEY, updated);
  await createHealthContentAuditLog({ action: "content_updated", contentCardId: id, newValue: partial });
  await runHealthContentQualityCheck(id);

  return updated.find((card) => card.id === id) ?? null;
}

export async function approveContentCard(id: string) {
  const card = await getContentCardById(id);
  const check = card ? await runHealthContentQualityCheck(id) : null;

  if (!card || check?.overallStatus !== "pass") {
    return updateTrustedHealthContentCard(id, { status: check?.overallStatus === "blocked" ? "blocked" : "review_needed" });
  }

  return updateTrustedHealthContentCard(id, { approvedBy: LOCAL_USER_ID, reviewedBy: LOCAL_USER_ID, status: "approved" });
}

export async function publishContentCard(id: string) {
  const card = await getContentCardById(id);
  const check = card ? await runHealthContentQualityCheck(id) : null;

  if (!card || check?.overallStatus !== "pass") {
    return updateTrustedHealthContentCard(id, { status: check?.overallStatus === "blocked" ? "blocked" : "review_needed" });
  }

  return updateTrustedHealthContentCard(id, { status: "published" });
}

export async function expireContentCard(id: string) {
  return updateTrustedHealthContentCard(id, { status: "expired" });
}

export async function archiveContentCard(id: string) {
  return updateTrustedHealthContentCard(id, { status: "archived" });
}

export async function blockContentCard(id: string) {
  return updateTrustedHealthContentCard(id, { status: "blocked" });
}

export async function runHealthContentQualityCheck(contentCardId: string) {
  const card = await getContentCardById(contentCardId);
  const source = card ? await getTrustedSourceById(card.sourceId) : null;
  const unsafeWordingFound = card ? checkUnsafeWording(`${card.title} ${card.shortSummary} ${card.fullText}`).length > 0 : true;
  const medicalClaimFound = card ? checkMedicalClaims(card.fullText).length > 0 : true;
  const plainLanguagePassed = card ? checkPlainLanguage(card.fullText) : false;
  const hasTrustedSource = Boolean(card?.sourceId && source);
  const sourceApproved = validateSourceTrustLevel(source, card?.riskLevel ?? "critical");
  const nextReviewDateExists = Boolean(card?.nextReviewDate);
  const disclaimerAssigned = Boolean(card?.disclaimerKey);
  const riskLevelAssigned = Boolean(card?.riskLevel);
  const riskRulesValid = card ? validateContentRiskRules(card, source) : false;
  const freshnessValid = card ? validateContentFreshness(card) : false;
  const overallStatus: HealthContentQualityCheck["overallStatus"] =
    unsafeWordingFound || medicalClaimFound || !riskRulesValid
      ? "blocked"
      : hasTrustedSource && sourceApproved && riskLevelAssigned && disclaimerAssigned && plainLanguagePassed && nextReviewDateExists && freshnessValid
        ? "pass"
        : "needs_review";
  const check: HealthContentQualityCheck = {
    checkedAt: new Date().toISOString(),
    contentCardId,
    disclaimerAssigned,
    hasTrustedSource,
    id: createId("content-check"),
    medicalClaimFound,
    nextReviewDateExists,
    notes: buildQualityNote({ freshnessValid, riskRulesValid, sourceApproved, unsafeWordingFound }),
    overallStatus,
    plainLanguagePassed,
    riskLevelAssigned,
    sourceApproved,
    unsafeWordingFound
  };
  const checks = await readJsonArray<HealthContentQualityCheck>(QUALITY_KEY);

  await writeJsonArray(QUALITY_KEY, [check, ...checks.filter((item) => item.contentCardId !== contentCardId)]);

  return check;
}

export function checkUnsafeWording(text: string) {
  const lower = text.toLowerCase();
  return UNSAFE_PHRASES.filter((phrase) => lower.includes(phrase));
}

export function checkMedicalClaims(text: string) {
  return checkUnsafeWording(text).filter((phrase) =>
    ["this cures", "this treats", "you are diagnosed", "normal result", "abnormal result", "take this dose"].includes(phrase)
  );
}

export function checkPlainLanguage(text: string) {
  return estimateReadingLevel(text) <= 10 && text.split(/[.!?]/).filter((sentence) => sentence.trim().split(/\s+/).length > 28).length === 0;
}

export function estimateReadingLevel(text: string) {
  const words = text.trim().split(/\s+/).filter(Boolean);
  const longWords = words.filter((word) => word.length > 8).length;
  return Math.min(14, Math.max(4, Math.round(6 + longWords / Math.max(1, words.length) * 20)));
}

export function checkForUnsafeWords(text: string) {
  return checkUnsafeWording(text);
}

export function checkForMedicalClaims(text: string) {
  return checkMedicalClaims(text);
}

export function checkForForbiddenPhrases(text: string) {
  return checkUnsafeWording(text);
}

export async function validateContentHasSource(card: TrustedHealthContentCard) {
  const source = await getTrustedSourceById(card.sourceId);
  return validateSourceTrustLevel(source, card.riskLevel);
}

export function validateContentRiskRules(card: TrustedHealthContentCard, source: TrustedSource | null) {
  if ((card.riskLevel === "high" || card.riskLevel === "critical") && !validateSourceTrustLevel(source, card.riskLevel)) return false;
  if (card.riskLevel === "critical" && !card.emergencyRelevant) return false;
  return true;
}

export function validateContentFreshness(card: TrustedHealthContentCard) {
  return !isPastReviewDate(card);
}

export async function getContentReviewQueue() {
  return (await getTrustedHealthContentCards()).filter((card) => card.status === "draft" || card.status === "review_needed" || card.status === "source_needed");
}

export async function getExpiringContent(withinDays = 30) {
  const now = Date.now();
  const windowMs = withinDays * 24 * 60 * 60 * 1000;
  return (await getTrustedHealthContentCards()).filter((card) => {
    const nextReview = new Date(card.nextReviewDate).getTime();
    return nextReview >= now && nextReview <= now + windowMs;
  });
}

export async function getDisclaimerByKey(key: string) {
  return (await getDisclaimers()).find((disclaimer) => disclaimer.key === key) ?? null;
}

export async function getHealthContentDisclaimers() {
  return getDisclaimers();
}

export async function getDisclaimerForContent(card: TrustedHealthContentCard) {
  return getDisclaimerByKey(card.disclaimerKey);
}

export async function createHealthContentDisclaimer(input: Omit<HealthContentDisclaimer, "createdAt" | "id" | "updatedAt">) {
  const now = new Date().toISOString();
  const disclaimer: HealthContentDisclaimer = {
    ...input,
    createdAt: now,
    id: createId("content-disclaimer"),
    updatedAt: now
  };
  const disclaimers = await getDisclaimers(false);

  await writeJsonArray(DISCLAIMERS_KEY, [disclaimer, ...disclaimers]);
  await createHealthContentAuditLog({ action: "disclaimer_created", newValue: { key: disclaimer.key } });

  return disclaimer;
}

export async function updateHealthContentDisclaimer(id: string, partial: Partial<HealthContentDisclaimer>) {
  const disclaimers = await getDisclaimers(false);
  const updated = disclaimers.map((disclaimer) =>
    disclaimer.id === id ? { ...disclaimer, ...partial, updatedAt: new Date().toISOString() } : disclaimer
  );

  await writeJsonArray(DISCLAIMERS_KEY, updated);
  await createHealthContentAuditLog({ action: "disclaimer_updated", newValue: partial });

  return updated.find((disclaimer) => disclaimer.id === id) ?? null;
}

export async function getApprovedSourceBackedAnswer(topic: string, realm?: HealthContentRealm) {
  const cards = await getSourceCardsForTopic(topic, realm);

  if (!cards.length) {
    return {
      cards,
      message: "I do not have a trusted source saved for this topic yet. Please speak to a healthcare professional or check an official health source."
    };
  }

  return {
    cards,
    message: cards[0].shortSummary
  };
}

export async function getSourceCardsForTopic(topic: string, realm?: HealthContentRealm) {
  const tokens = topic.toLowerCase().split(/\W+/).filter((token) => token.length > 2);
  const cards = realm ? await getPublishedContentByRealm(realm) : (await getTrustedHealthContentCards()).filter((card) => card.status === "published" && !isPastReviewDate(card));
  const sources = await getTrustedSources();

  return cards.filter((card) => {
    const source = sources.find((item) => item.id === card.sourceId) ?? null;
    const haystack = `${card.title} ${card.shortSummary} ${card.topicTags.join(" ")}`.toLowerCase();
    return validateSourceTrustLevel(source, card.riskLevel) && (tokens.length === 0 || tokens.some((token) => haystack.includes(token)));
  });
}

export async function requireTrustedSourceForHighRiskTopic(topic: string, realm?: HealthContentRealm) {
  const cards = await getSourceCardsForTopic(topic, realm);

  return cards.some((card) => card.riskLevel === "high" || card.riskLevel === "critical")
    ? cards
    : cards.filter((card) => card.riskLevel === "low" || card.riskLevel === "medium");
}

export async function logAiContentUsage(contentCardIds: string[]) {
  await Promise.all(contentCardIds.map((contentCardId) =>
    createHealthContentAuditLog({ action: "ai_used_content_card", contentCardId })
  ));
}

export async function createHealthContentAuditLog(input: Omit<HealthContentAuditLog, "createdAt" | "id">) {
  const log: HealthContentAuditLog = {
    ...input,
    actorUserId: input.actorUserId ?? LOCAL_USER_ID,
    createdAt: new Date().toISOString(),
    id: createId("content-audit")
  };
  const logs = await readJsonArray<HealthContentAuditLog>(AUDIT_KEY);

  await writeJsonArray(AUDIT_KEY, [log, ...logs].slice(0, 500));

  return log;
}

export async function getHealthContentAuditLogs() {
  return readJsonArray<HealthContentAuditLog>(AUDIT_KEY);
}

async function getDisclaimers(includeSeeds = true) {
  const stored = await readJsonArray<HealthContentDisclaimer>(DISCLAIMERS_KEY);
  const byKey = new Map<string, HealthContentDisclaimer>();

  (includeSeeds ? [...seedDisclaimers(), ...stored] : stored).forEach((disclaimer) => byKey.set(disclaimer.key, disclaimer));

  return Array.from(byKey.values());
}

function markExpiredIfNeeded(card: TrustedHealthContentCard) {
  if (card.status === "published" && isPastReviewDate(card) && (card.riskLevel === "high" || card.riskLevel === "critical")) {
    return { ...card, status: "expired" as const };
  }

  return card;
}

function isPastReviewDate(card: TrustedHealthContentCard) {
  return new Date(card.nextReviewDate).getTime() < Date.now();
}

function reviewDateFrom(riskLevel: HealthContentRiskLevel, fromDate = TODAY) {
  const date = new Date(`${fromDate}T12:00:00`);
  const months = riskLevel === "low" ? 24 : riskLevel === "medium" ? 12 : riskLevel === "high" ? 6 : 3;
  date.setMonth(date.getMonth() + months);
  return date.toISOString().slice(0, 10);
}

function buildQualityNote(input: { freshnessValid: boolean; riskRulesValid: boolean; sourceApproved: boolean; unsafeWordingFound: boolean }) {
  return [
    input.sourceApproved ? null : "Source is not approved for this risk level.",
    input.riskRulesValid ? null : "Risk/source rules need review.",
    input.freshnessValid ? null : "Content is past review date.",
    input.unsafeWordingFound ? "Unsafe wording found." : null
  ].filter(Boolean).join(" ") || undefined;
}

function seedTrustedSources(): TrustedSource[] {
  const now = `${TODAY}T00:00:00.000Z`;
  return [
    seedSource("source-who", "WHO", "WHO", "https://www.who.int/", "tier_1", "public_health_agency", "Global", "Public health"),
    seedSource("source-cdc", "CDC", "CDC", "https://www.cdc.gov/", "tier_1", "public_health_agency", "US", "Public health"),
    seedSource("source-nhs", "NHS", "NHS", "https://www.nhs.uk/", "tier_1", "public_health_agency", "UK", "Patient education"),
    seedSource("source-acog", "ACOG", "ACOG", "https://www.acog.org/womens-health", "tier_1", "medical_association", "US", "Pregnancy and gynecology"),
    seedSource("source-aap", "AAP / HealthyChildren", "AAP / HealthyChildren", "https://www.healthychildren.org/", "tier_1", "medical_association", "US", "Child health"),
    seedSource("source-nichd", "NICHD", "NICHD", "https://www.nichd.nih.gov/", "tier_1", "government", "US", "Pregnancy and child health"),
    seedSource("source-owh", "Office on Women’s Health", "Office on Women’s Health", "https://www.womenshealth.gov/", "tier_1", "government", "US", "Women’s health"),
    seedSource("source-mayo", "Mayo Clinic", "Mayo Clinic", "https://www.mayoclinic.org/", "tier_2", "hospital_clinic", "US", "Patient education"),
    seedSource("source-cleveland", "Cleveland Clinic", "Cleveland Clinic", "https://my.clevelandclinic.org/", "tier_2", "hospital_clinic", "US", "Patient education"),
    {
      clinicalReviewAvailable: true,
      country: "Global",
      createdAt: now,
      id: "source-official-label",
      lastSourceCheckedAt: TODAY,
      sourceName: "Official medicine/product labels",
      sourceOrganization: "Official labels",
      sourceReviewCycleMonths: 6,
      sourceTier: "tier_1",
      sourceType: "official_label",
      sourceUrl: "https://www.accessdata.fda.gov/scripts/cder/daf/",
      specialty: "Medication labels",
      trustStatus: "approved",
      updatedAt: now
    }
  ];
}

function seedSource(id: string, sourceName: string, sourceOrganization: string, sourceUrl: string, tier: TrustedSourceTier, sourceType: TrustedSource["sourceType"], country: string, specialty: string): TrustedSource {
  const now = `${TODAY}T00:00:00.000Z`;
  return {
    clinicalReviewAvailable: true,
    country,
    createdAt: now,
    id,
    lastSourceCheckedAt: TODAY,
    sourceName,
    sourceOrganization,
    sourceReviewCycleMonths: tier === "tier_1" ? 6 : 12,
    sourceTier: tier,
    sourceType,
    sourceUrl,
    specialty,
    trustStatus: "approved",
    updatedAt: now
  };
}

function seedTrustedContentCards(): TrustedHealthContentCard[] {
  return [
    seedCard("content-nutrition-food-diary", "Food diary basics", "Food logs help you track patterns based on what you enter.", "A food diary records meals, snacks, water, and notes. It supports tracking and conversation preparation. It is not a diet prescription.", "nutrition", ["food diary", "nutrition"], "low", "source-who", "WHO", "https://www.who.int/", "general"),
    seedCard("content-med-label", "Medication label tracking", "Medication tracking should follow labels and professional instructions.", "Use this app to organize medication names, schedules, and questions. Always follow your prescription label, product label, pharmacist, doctor, nurse, clinic, or healthcare professional's instructions.", "medication", ["label", "medication", "pharmacist"], "high", "source-official-label", "Official labels", "https://www.accessdata.fda.gov/scripts/cder/daf/", "medication"),
    seedCard("content-pregnancy-appointments", "Pregnancy appointment preparation", "Pregnancy logs can help you prepare questions for your clinic.", "Pregnancy information is for education and organization only. Appointment timing and concerns should be confirmed with your doctor, midwife, nurse, clinic, or healthcare professional.", "pregnancy", ["pregnancy", "appointment", "midwife"], "high", "source-nhs", "NHS", "https://www.nhs.uk/pregnancy/your-pregnancy-care/", "pregnancy", { ageGroup: "pregnancy", pregnancyRelevant: true }),
    seedCard("content-baby-safe-sleep", "Baby sleep notes", "Baby sleep tracking is for logs and discussion only.", "Baby and child information is for education and tracking only. Every child is different. If you are concerned, speak to a pediatrician, clinic, nurse, doctor, or healthcare professional.", "baby_child", ["baby", "sleep", "pediatrician"], "high", "source-aap", "AAP / HealthyChildren", "https://www.healthychildren.org/", "baby_child", { ageGroup: "baby", childRelevant: true }),
    seedCard("content-mens-testicular", "Testicular self-check education", "Checking can help you notice changes to discuss with a professional.", "This content supports noticing changes and preparing questions. It does not diagnose symptoms or rule out health conditions.", "mens_health", ["testicular", "self-check", "doctor"], "high", "source-nhs", "NHS", "https://www.nhs.uk/tests-and-treatments/how-to-check-your-testicles/", "general"),
    seedCard("content-womens-contraception", "Contraception tracking notes", "Tracking is for organization and education only.", "Contraception tracking is for organization and education only. Always follow your product leaflet, prescription label, clinic guidance, or healthcare professional's advice.", "womens_health", ["contraception", "period", "clinic"], "high", "source-owh", "Office on Women’s Health", "https://www.womenshealth.gov/", "contraception")
  ];
}

function seedCard(
  id: string,
  title: string,
  shortSummary: string,
  fullText: string,
  realm: HealthContentRealm,
  topicTags: string[],
  riskLevel: HealthContentRiskLevel,
  sourceId: string,
  sourceOrganization: string,
  sourceUrl: string,
  disclaimerKey: string,
  partial: Partial<TrustedHealthContentCard> = {}
): TrustedHealthContentCard {
  const now = `${TODAY}T00:00:00.000Z`;
  return {
    ageGroup: partial.ageGroup ?? "all",
    approvedBy: "system",
    childRelevant: partial.childRelevant ?? false,
    countryCodes: ["GLOBAL"],
    createdAt: now,
    createdBy: "system",
    disclaimerKey,
    emergencyRelevant: riskLevel === "critical",
    fullText,
    id,
    lastCheckedDate: TODAY,
    nextReviewDate: reviewDateFrom(riskLevel),
    pregnancyRelevant: partial.pregnancyRelevant ?? false,
    publishedDate: TODAY,
    realm,
    reviewedBy: "system",
    reviewedDate: TODAY,
    riskLevel,
    shortSummary,
    sourceId,
    sourceOrganization,
    sourceUrl,
    status: "published",
    title,
    topicTags,
    updatedAt: now,
    versionNumber: 1
  };
}

function seedDisclaimers(): HealthContentDisclaimer[] {
  const now = `${TODAY}T00:00:00.000Z`;
  const make = (key: string, title: string, text: string, appliesToRealms: HealthContentRealm[], riskLevels: HealthContentRiskLevel[]): HealthContentDisclaimer => ({
    appliesToRealms,
    createdAt: now,
    id: `disclaimer-${key}`,
    key,
    riskLevels,
    text,
    title,
    updatedAt: now
  });

  return [
    make("general", "General education", "This information is for general education and tracking only. It is not medical advice.", ["general", "nutrition", "workout", "biometrics", "records", "calendar", "ai_assistant"], ["low", "medium"]),
    make("medication", "Medication", "Always follow your prescription label, product label, pharmacist, doctor, nurse, clinic, or healthcare professional's instructions.", ["medication", "supplements"], ["high", "critical"]),
    make("pregnancy", "Pregnancy", "Pregnancy information is for education and organization only. Confirm concerns with your doctor, midwife, nurse, clinic, or healthcare professional.", ["pregnancy"], ["high", "critical"]),
    make("baby_child", "Baby / Child", "Baby and child information is for education and tracking only. Every child is different. If you are concerned, speak to a pediatrician, clinic, nurse, doctor, or healthcare professional.", ["baby_child"], ["high", "critical"]),
    make("emergency", "Emergency", "If this feels urgent or severe, contact local emergency services or a healthcare professional immediately.", ["general", "pregnancy", "baby_child", "biometrics", "medication"], ["critical"]),
    make("contraception", "Contraception", "Contraception tracking is for organization and education only. Always follow your product leaflet, prescription label, clinic guidance, or healthcare professional's advice.", ["womens_health"], ["high"]),
    make("ai", "AI", "AI suggestions may be incomplete or incorrect. Review and confirm before saving.", ["ai_assistant"], ["low", "medium", "high", "critical"])
  ];
}

function createId(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

async function readJsonArray<T>(key: string) {
  try {
    const stored = await AsyncStorage.getItem(key);
    const parsed = stored ? JSON.parse(stored) : [];
    return Array.isArray(parsed) ? (parsed as T[]) : [];
  } catch {
    return [];
  }
}

async function writeJsonArray<T>(key: string, value: T[]) {
  await AsyncStorage.setItem(key, JSON.stringify(value));
  return value;
}
