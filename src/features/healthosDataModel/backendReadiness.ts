import { healthOSRealmDataContracts } from "./realmDataContracts";
import {
  getBackendReadinessLabel,
  isBackendReleaseBlocker,
  type HealthOSBackendReadiness,
} from "./tablePrivacyClasses";

export function getRealmBackendReadiness(realmKey: string) {
  return healthOSRealmDataContracts.find((realm) => realm.realmKey === realmKey)
    ?.backendReadiness;
}

export function getBackendReadinessSummary() {
  const summary: Record<HealthOSBackendReadiness, number> = {
    handlerMissing: 0,
    partial: 0,
    ready: 0,
    rlsMissing: 0,
    schemaMissing: 0,
    storageMissing: 0,
    uiOnly: 0,
    unknown: 0,
  };
  for (const realm of healthOSRealmDataContracts) {
    summary[realm.backendReadiness] += 1;
  }
  return Object.entries(summary).map(([readiness, count]) => ({
    count,
    label: getBackendReadinessLabel(readiness as HealthOSBackendReadiness),
    readiness: readiness as HealthOSBackendReadiness,
  }));
}

export function getReleaseBlockingBackendGaps() {
  return healthOSRealmDataContracts.filter((realm) =>
    isBackendReleaseBlocker(realm.backendReadiness),
  );
}

export function getUiOnlyRealms() {
  return healthOSRealmDataContracts.filter(
    (realm) => realm.backendReadiness === "uiOnly",
  );
}

export function getSchemaMissingRealms() {
  return healthOSRealmDataContracts.filter(
    (realm) => realm.backendReadiness === "schemaMissing",
  );
}
