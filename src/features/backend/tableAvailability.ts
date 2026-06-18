import { getBackendTableRegistryEntry } from "./tableRegistry";
import type { HealthOSTableGeneratedTypeStatus } from "./backendTypes";

export function isTableGenerated(tableName: string) {
  return getTableAvailability(tableName).generatedTypeStatus === "present";
}

export function getTableAvailability(tableName: string) {
  const entry = getBackendTableRegistryEntry(tableName);
  return {
    entry,
    generatedTypeStatus: (entry?.generatedTypeStatus ?? "unknown") as HealthOSTableGeneratedTypeStatus,
    known: Boolean(entry),
  };
}

export function getMissingTableDeferredReason(tableName: string) {
  const entry = getBackendTableRegistryEntry(tableName);
  if (!entry) return `Table ${tableName} is not in the HealthOS backend registry.`;
  if (entry.generatedTypeStatus !== "present") return `Table ${tableName} is not present in generated Supabase types yet.`;
  return null;
}

export function shouldUseDeferredService(tableName: string) {
  return getMissingTableDeferredReason(tableName) !== null;
}

export function assertKnownFeatureTable(tableName: string) {
  const entry = getBackendTableRegistryEntry(tableName);
  if (!entry) throw new Error(`Unknown HealthOS backend table: ${tableName}`);
  return entry;
}
