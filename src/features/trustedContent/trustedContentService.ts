import type { User } from "@supabase/supabase-js";

import { supabase } from "@/lib/supabase";

import {
  defaultContentFeedback,
  defaultReadHistory,
  defaultSavedContentItem,
} from "./trustedContentDefaults";
import {
  mapContentFeedbackRowToFeedback,
  mapContentFeedbackToInsert,
  mapContentReadHistoryRowToHistory,
  mapReadHistoryToInsert,
  mapSavedContentRowToSavedItem,
  mapSavedContentToInsert,
  mapTrustedContentRowToItem,
  mapTrustedContentTargetingRowToTargeting,
  mapTrustedSourceRowToSource,
  toRow,
} from "./trustedContentMappers";
import {
  validateContentFeedback,
  validateExternalUrl,
  validateSavedContent,
} from "./trustedContentValidation";
import type {
  HealthOSContentFeedback,
  HealthOSContentReadHistory,
  HealthOSSavedContentItem,
  HealthOSSourceQuality,
  HealthOSTrustedContentBackendItem,
  HealthOSTrustedContentCategory,
  HealthOSTrustedContentRealm,
  HealthOSTrustedContentServiceResult,
  HealthOSTrustedContentSourceModel,
  HealthOSTrustedContentTargeting,
} from "./trustedContentTypes";

type Mapper<T> = (row: Record<string, unknown>) => T;

const MISSING_TABLE_CODES = new Set(["42P01", "PGRST205", "PGRST204"]);

export async function getCurrentAuthUser(): Promise<HealthOSTrustedContentServiceResult<User>> {
  const { data, error } = await supabase.auth.getUser();
  if (error || !data.user) return result<User>(null, "missingAuth", "Sign in required.");
  return result(data.user, "ready");
}

export function getTrustedContentFeed() {
  return listReference("trusted_content_items", mapTrustedContentRowToItem);
}

export function getTrustedContentForRealm(realm: HealthOSTrustedContentRealm) {
  return listReference("trusted_content_items", mapTrustedContentRowToItem, { primary_realm: realm });
}

export async function getTrustedContentItemById(id: string): Promise<HealthOSTrustedContentServiceResult<HealthOSTrustedContentBackendItem>> {
  const { data, error } = await fromTable("trusted_content_items")
    .select("*")
    .eq("id", id)
    .in("status", ["published", "active"])
    .maybeSingle();
  if (error) return dbError<HealthOSTrustedContentBackendItem>(error, null);
  return result<HealthOSTrustedContentBackendItem>(data ? mapTrustedContentRowToItem(data as Record<string, unknown>) : null, "ready");
}

export function getTrustedContentSources() {
  return listReference("trusted_content_sources", mapTrustedSourceRowToSource);
}

export function getTrustedContentTargeting() {
  return listReference("trusted_content_targeting", mapTrustedContentTargetingRowToTargeting);
}

export async function searchTrustedContent(query: string) {
  const trimmed = query.trim();
  if (!trimmed) return getTrustedContentFeed();
  const { data, error } = await fromTable("trusted_content_items")
    .select("*")
    .in("status", ["published", "active"])
    .or(`title.ilike.%${trimmed}%,summary.ilike.%${trimmed}%`)
    .order("published_at", { ascending: false });
  if (error) return dbError<HealthOSTrustedContentBackendItem[]>(error, []);
  return result((data ?? []).map((row) => mapTrustedContentRowToItem(row as Record<string, unknown>)), "ready");
}

export function getContentByCategory(category: HealthOSTrustedContentCategory) {
  return listReference("trusted_content_items", mapTrustedContentRowToItem, { category });
}

export function getContentBySourceQuality(sourceQuality: HealthOSSourceQuality) {
  return listReference("trusted_content_items", mapTrustedContentRowToItem, { source_quality: sourceQuality });
}

export function getSavedContent() {
  return listOwned("saved_content_items", mapSavedContentRowToSavedItem);
}

export function saveContentItem(contentItemId: string, input: Partial<HealthOSSavedContentItem> = {}) {
  return insertOwned("saved_content_items", { ...defaultSavedContentItem(), ...input, contentItemId }, mapSavedContentRowToSavedItem, validateSavedContent, mapSavedContentToInsert);
}

export function saveExternalContentLink(input: Partial<HealthOSSavedContentItem> & { externalUrl?: string | null }) {
  const validation = validateExternalUrl(input.externalUrl);
  if (!validation.valid) return Promise.resolve(result<HealthOSSavedContentItem>(null, "error", validation.errors[0]));
  return insertOwned("saved_content_items", { ...defaultSavedContentItem(), ...input, saveType: "userLink" }, mapSavedContentRowToSavedItem, validateSavedContent, mapSavedContentToInsert);
}

export function archiveSavedContent(id: string) {
  return updateOwned("saved_content_items", id, { archivedAt: new Date().toISOString() }, mapSavedContentRowToSavedItem);
}

export function hideContentItemForUser(contentItemId: string) {
  return saveContentItem(contentItemId, { saveType: "hidden", archivedAt: new Date().toISOString() });
}

export function recordContentOpened(input: Partial<HealthOSContentReadHistory>) {
  return insertOwned("content_read_history", { ...defaultReadHistory(), ...input }, mapContentReadHistoryRowToHistory, undefined, mapReadHistoryToInsert);
}

export function getContentReadHistory() {
  return listOwned("content_read_history", mapContentReadHistoryRowToHistory, "opened_at");
}

export function createContentFeedback(input: Partial<HealthOSContentFeedback>) {
  const merged = { ...defaultContentFeedback(input.contentItemId ?? ""), ...input };
  return insertOwned("content_feedback", merged, mapContentFeedbackRowToFeedback, validateContentFeedback, mapContentFeedbackToInsert);
}

export function createTrustedContentSourceFromClient() {
  return Promise.resolve(result<HealthOSTrustedContentSourceModel>(null, "adminDeferred", "Content admin writes are deferred until an admin role model exists."));
}

export function createTrustedContentItemFromClient() {
  return Promise.resolve(result<HealthOSTrustedContentBackendItem>(null, "adminDeferred", "Global trusted content writes are deferred until an admin role model exists."));
}

async function listReference<T>(
  table: string,
  mapper: Mapper<T>,
  filters?: Record<string, string>,
): Promise<HealthOSTrustedContentServiceResult<T[]>> {
  let query = fromTable(table).select("*");
  if (table === "trusted_content_items") query = query.in("status", ["published", "active"]);
  if (table === "trusted_content_sources" || table === "trusted_content_targeting") query = query.eq("status", "active");
  for (const [key, value] of Object.entries(filters ?? {})) query = query.eq(key, toRow({ [key]: value })[key] ?? value);
  const { data, error } = await query.order(table === "trusted_content_targeting" ? "priority" : "created_at", { ascending: table === "trusted_content_targeting" });
  if (error) return dbError(error, []);
  return result((data ?? []).map((row) => mapper(row as Record<string, unknown>)), "ready");
}

async function listOwned<T>(
  table: string,
  mapper: Mapper<T>,
  orderColumn = "created_at",
): Promise<HealthOSTrustedContentServiceResult<T[]>> {
  const user = await getCurrentAuthUser();
  if (!user.data) return result<T[]>([], user.status, user.error);
  const { data, error } = await fromTable(table)
    .select("*")
    .eq("owner_user_id", user.data.id)
    .order(orderColumn, { ascending: false });
  if (error) return dbError(error, []);
  return result((data ?? []).map((row) => mapper(row as Record<string, unknown>)), "ready");
}

async function insertOwned<T>(
  table: string,
  input: Record<string, unknown>,
  mapper: Mapper<T>,
  validator?: (input: Record<string, unknown>) => { errors: string[]; valid: boolean },
  rowMapper: (input: Record<string, unknown>) => Record<string, unknown> = toRow,
): Promise<HealthOSTrustedContentServiceResult<T>> {
  const user = await getCurrentAuthUser();
  if (!user.data) return result<T>(null, user.status, user.error);
  const payload = { ...input, ownerUserId: user.data.id };
  const validation = validator?.(payload);
  if (validation && !validation.valid) return result<T>(null, "error", validation.errors[0]);
  const { data, error } = await fromTable(table).insert(rowMapper(payload)).select("*").single();
  if (error) return dbError<T>(error, null);
  return result(mapper(data as Record<string, unknown>), "ready");
}

async function updateOwned<T>(
  table: string,
  id: string,
  input: Record<string, unknown>,
  mapper: Mapper<T>,
): Promise<HealthOSTrustedContentServiceResult<T>> {
  const user = await getCurrentAuthUser();
  if (!user.data) return result<T>(null, user.status, user.error);
  const { data, error } = await fromTable(table)
    .update(toRow(input))
    .eq("id", id)
    .eq("owner_user_id", user.data.id)
    .select("*")
    .single();
  if (error) return dbError<T>(error, null);
  return result(mapper(data as Record<string, unknown>), "ready");
}

function fromTable(name: string) {
  return supabase.from(name as never);
}

function dbError<T>(error: { code?: string; message?: string }, fallback: T | null): HealthOSTrustedContentServiceResult<T> {
  if (error.code && MISSING_TABLE_CODES.has(error.code)) {
    return result(fallback, "missingTable", "Trusted content backend tables are not available yet.", error.message);
  }
  return result(fallback, "error", "Trusted content is not available right now.", error.message);
}

function result<T>(
  data: T | null,
  status: HealthOSTrustedContentServiceResult<T>["status"],
  error: string | null = null,
  deferredReason?: string,
): HealthOSTrustedContentServiceResult<T> {
  return { data, deferredReason, error, status };
}
