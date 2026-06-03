import AsyncStorage from "@react-native-async-storage/async-storage";

import type { AiExtractedDraft, AiJob, AiJobStatus } from "@/types/ai";

const AI_JOBS_KEY = "family_health_ai_jobs";
const aiListeners = new Set<() => void>();

export function subscribeToAiJobs(listener: () => void) {
  aiListeners.add(listener);
  return () => {
    aiListeners.delete(listener);
  };
}

function notifyAiListeners() {
  aiListeners.forEach((listener) => listener());
}

function id(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

async function readJobs() {
  try {
    const storedValue = await AsyncStorage.getItem(AI_JOBS_KEY);
    if (!storedValue) return [] as AiJob[];
    const parsedValue = JSON.parse(storedValue);
    return Array.isArray(parsedValue) ? (parsedValue as AiJob[]) : [];
  } catch {
    return [] as AiJob[];
  }
}

async function writeJobs(jobs: AiJob[]) {
  await AsyncStorage.setItem(AI_JOBS_KEY, JSON.stringify(jobs));
  notifyAiListeners();
  return jobs;
}

function sortNewest(jobs: AiJob[]) {
  return [...jobs].sort(
    (left, right) => new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime()
  );
}

export async function getAiJobs() {
  return sortNewest(await readJobs());
}

export async function getAiJob(jobId: string) {
  return (await getAiJobs()).find((job) => job.id === jobId) ?? null;
}

export async function createAiJob(
  input: Omit<AiJob, "id" | "createdAt" | "updatedAt" | "warnings" | "confidence" | "safetyLevel">
) {
  const now = new Date().toISOString();
  const job: AiJob = {
    ...input,
    confidence: "low",
    createdAt: now,
    id: id("ai-job"),
    safetyLevel: "normal",
    updatedAt: now,
    warnings: ["Review everything before saving. AI can make mistakes."]
  };
  await writeJobs([job, ...(await readJobs())]);
  return job;
}

export async function updateAiJob(jobId: string, partial: Partial<AiJob>) {
  const jobs = await readJobs();
  const updated = jobs.map((job) =>
    job.id === jobId ? { ...job, ...partial, updatedAt: new Date().toISOString() } : job
  );
  await writeJobs(updated);
  return updated.find((job) => job.id === jobId) ?? null;
}

export async function deleteAiJob(jobId: string) {
  await writeJobs((await readJobs()).filter((job) => job.id !== jobId));
}

export async function discardAiJob(jobId: string) {
  return updateAiJob(jobId, {
    discardedAt: new Date().toISOString(),
    status: "discarded"
  });
}

export async function approveAiJob(jobId: string) {
  return updateAiJob(jobId, {
    approvedAt: new Date().toISOString(),
    reviewedAt: new Date().toISOString(),
    status: "approved"
  });
}

export async function getJobsByStatus(status: AiJobStatus) {
  return (await getAiJobs()).filter((job) => job.status === status);
}

export async function getPendingReviewJobs() {
  return getJobsByStatus("needs_review");
}

export async function getRecentAiJobs() {
  return (await getAiJobs()).slice(0, 8);
}

export async function attachDraftToJob(jobId: string, draft: AiExtractedDraft) {
  return updateAiJob(jobId, {
    confidence: draft.confidence,
    extractedDraft: draft,
    reviewedAt: new Date().toISOString(),
    safetyLevel: draft.warnings.length > 1 ? "caution" : "normal",
    status: "needs_review",
    warnings: draft.warnings
  });
}
