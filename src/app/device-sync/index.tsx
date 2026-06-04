import { Href, router } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import { Platform, Text, TouchableOpacity, View } from "react-native";

import { ScreenWrapper } from "@/components/layout/ScreenWrapper";
import { AppCard } from "@/components/ui/AppCard";
import { AppIcon } from "@/components/ui/AppIcon";
import {
  HEALTH_SYNC_DATA_TYPES,
  createHealthSyncConnection,
  disconnectHealthSource,
  getAvailableHealthSources,
  getHealthSyncConnection,
  getHealthSyncErrors,
  getLastSyncStatus,
  getSyncedHealthSamples,
  requestHealthPermissions,
  syncSelectedHealthData
} from "@/services/healthSync/healthSyncService";
import type {
  HealthSyncConnection,
  HealthSyncDataType,
  HealthSyncError,
  HealthSyncSource,
  HealthSyncSourceOption,
  HealthSyncStatus,
  SyncedHealthSample
} from "@/types/healthSync";

export default function DeviceSyncScreen() {
  const [sources, setSources] = useState<HealthSyncSourceOption[]>([]);
  const [connection, setConnection] = useState<HealthSyncConnection | null>(null);
  const [status, setStatus] = useState<HealthSyncStatus | null>(null);
  const [samples, setSamples] = useState<SyncedHealthSample[]>([]);
  const [errors, setErrors] = useState<HealthSyncError[]>([]);
  const [selectedSource, setSelectedSource] = useState<HealthSyncSource>("mock");
  const [selectedTypes, setSelectedTypes] = useState<HealthSyncDataType[]>([]);
  const [message, setMessage] = useState<string | null>(null);
  const [syncing, setSyncing] = useState(false);

  const loadSync = useCallback(async () => {
    const [nextSources, nextConnection, nextStatus, nextSamples, nextErrors] = await Promise.all([
      getAvailableHealthSources(),
      getHealthSyncConnection(),
      getLastSyncStatus(),
      getSyncedHealthSamples(),
      getHealthSyncErrors()
    ]);

    setSources(nextSources);
    setConnection(nextConnection);
    setStatus(nextStatus);
    setSamples(nextSamples);
    setErrors(nextErrors);
    setSelectedSource(nextConnection?.source ?? getDefaultSource(nextSources));
    setSelectedTypes(nextConnection?.enabledDataTypes ?? []);
  }, []);

  useEffect(() => {
    Promise.resolve()
      .then(loadSync)
      .catch(() => undefined);
  }, [loadSync]);

  function toggleDataType(dataType: HealthSyncDataType) {
    setSelectedTypes((current) =>
      current.includes(dataType)
        ? current.filter((item) => item !== dataType)
        : [...current, dataType]
    );
  }

  async function savePermissions() {
    await requestHealthPermissions({ dataTypes: selectedTypes, source: selectedSource });
    setMessage(
      selectedTypes.length
        ? "Some data types are connected. You can update permissions anytime."
        : "Choose at least one data type before syncing."
    );
    await loadSync();
  }

  async function syncNow() {
    setSyncing(true);
    setMessage(null);

    try {
      if (!connection) {
        await createHealthSyncConnection(selectedSource, selectedTypes);
      }

      const result = await syncSelectedHealthData();
      setMessage(result.importedCount ? `${result.importedCount} sample${result.importedCount === 1 ? "" : "s"} imported.` : "No device data found for this period.");
    } catch {
      setMessage("Sync could not complete right now. Your manual logs are still safe.");
    } finally {
      setSyncing(false);
      await loadSync();
    }
  }

  async function disconnect() {
    await disconnectHealthSource();
    setSelectedTypes([]);
    setMessage("Device sync disconnected. Manual logs are still safe.");
    await loadSync();
  }

  const selectedSourceDetails = sources.find((source) => source.source === selectedSource);

  return (
    <ScreenWrapper backgroundColor="#fffaf0">
      <View style={{ gap: 4 }}>
        <Text style={{ color: "#b45309", fontSize: 14, fontWeight: "800" }}>Health realm</Text>
        <Text style={{ color: "#0f172a", fontSize: 30, fontWeight: "900" }}>Device Sync</Text>
        <Text style={{ color: "#64748b", lineHeight: 20 }}>
          Connect your health data safely.
        </Text>
      </View>

      <AppCard backgroundColor="#eff6ff">
        <View style={{ gap: 8 }}>
          <Text style={{ color: "#1d4ed8", fontSize: 18, fontWeight: "900" }}>
            Choose what health data to sync
          </Text>
          <Text style={{ color: "#334155", lineHeight: 21 }}>
            You control what data this app can read. You can change permissions anytime.
          </Text>
          <Text style={{ color: "#334155", lineHeight: 21 }}>
            You control what data is imported. You can disconnect device sync anytime.
          </Text>
        </View>
      </AppCard>

      <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 12 }}>
        {sources.map((source) => (
          <TouchableOpacity
            activeOpacity={0.85}
            key={source.source}
            onPress={() => {
              setSelectedSource(source.source);
              setMessage(source.message ?? null);
            }}
            style={{
              backgroundColor: selectedSource === source.source ? "#fffbeb" : "#ffffff",
              borderColor: selectedSource === source.source ? "#f59e0b" : "#e2e8f0",
              borderRadius: 20,
              borderWidth: 1,
              flexGrow: 1,
              minHeight: 142,
              minWidth: "45%",
              padding: 14
            }}
          >
            <AppIcon color={getSourceColor(source.source)} container containerVariant="white" name={getSourceIcon(source.source)} size={22} />
            <Text style={{ color: "#0f172a", fontSize: 18, fontWeight: "900", marginTop: 10 }}>{source.title}</Text>
            <Text style={{ color: "#64748b", lineHeight: 19, marginTop: 5 }}>{source.description}</Text>
            <Text style={{ color: source.isAvailable ? "#059669" : "#9a3412", fontWeight: "900", marginTop: 8 }}>
              {source.isAvailable ? (source.isComingSoon ? "Prepared" : "Available") : "Unavailable"}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <AppCard>
        <View style={{ gap: 12 }}>
          <Text style={{ color: "#0f172a", fontSize: 20, fontWeight: "900" }}>Sync Status</Text>
          <MetricRow label="Platform" value={Platform.OS} />
          <MetricRow label="Connected source" value={formatSource(status?.source ?? selectedSource)} />
          <MetricRow label="Permission status" value={formatStatus(status?.permissionStatus ?? "not_requested")} />
          <MetricRow label="Last sync" value={status?.lastSyncAt ? new Date(status.lastSyncAt).toLocaleString() : "No sync yet"} />
          <Text style={{ color: "#64748b", lineHeight: 21 }}>
            {message ?? status?.message ?? selectedSourceDetails?.message ?? "Choose data types, then sync when ready."}
          </Text>
        </View>
      </AppCard>

      <AppCard>
        <View style={{ gap: 12 }}>
          <Text style={{ color: "#0f172a", fontSize: 20, fontWeight: "900" }}>Choose Data to Sync</Text>
          <Text style={{ color: "#64748b", lineHeight: 21 }}>
            All data types start off. Select only what you want to import.
          </Text>
          <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
            {HEALTH_SYNC_DATA_TYPES.map((dataType) => {
              const selected = selectedTypes.includes(dataType.key);

              return (
                <TouchableOpacity
                  activeOpacity={0.85}
                  key={dataType.key}
                  onPress={() => toggleDataType(dataType.key)}
                  style={{
                    backgroundColor: selected ? "#f59e0b" : "#f8fafc",
                    borderColor: selected ? "#f59e0b" : "#e2e8f0",
                    borderRadius: 999,
                    borderWidth: 1,
                    paddingHorizontal: 12,
                    paddingVertical: 9
                  }}
                >
                  <Text style={{ color: selected ? "#ffffff" : "#475569", fontWeight: "900" }}>
                    {selected ? "On " : "Off "}
                    {dataType.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
          <View style={{ flexDirection: "row", gap: 10 }}>
            <PrimaryButton label="Save Permissions" onPress={savePermissions} />
            <PrimaryButton disabled={syncing} label={syncing ? "Syncing" : "Sync Now"} onPress={syncNow} />
          </View>
          <TouchableOpacity activeOpacity={0.85} onPress={disconnect}>
            <Text style={{ color: "#dc2626", fontWeight: "900" }}>Disconnect device sync</Text>
          </TouchableOpacity>
        </View>
      </AppCard>

      <AppCard backgroundColor="#f0fdf4">
        <View style={{ gap: 12 }}>
          <Text style={{ color: "#166534", fontSize: 20, fontWeight: "900" }}>Synced Today</Text>
          <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 10 }}>
            <MetricTile label="Samples" value={`${samples.length}`} />
            <MetricTile label="Steps" value={formatSampleTotal(samples, "steps", "steps")} />
            <MetricTile label="Distance" value={formatSampleTotal(samples, "distance", "km")} />
            <MetricTile label="Sleep" value={formatSleep(samples)} />
          </View>
        </View>
      </AppCard>

      <AppCard>
        <View style={{ gap: 12 }}>
          <Text style={{ color: "#0f172a", fontSize: 20, fontWeight: "900" }}>Recent Sync Activity</Text>
          {samples.length ? (
            samples.slice(0, 8).map((sample) => (
              <View key={sample.id} style={{ backgroundColor: "#f8fafc", borderRadius: 16, padding: 12 }}>
                <Text style={{ color: "#0f172a", fontWeight: "900" }}>{formatDataType(sample.dataType)}</Text>
                <Text style={{ color: "#64748b", marginTop: 4 }}>
                  {sample.value} {sample.unit} - {formatSource(sample.source)}
                </Text>
                <Text style={{ color: "#94a3b8", fontSize: 12, marginTop: 4 }}>{new Date(sample.startTime).toLocaleString()}</Text>
              </View>
            ))
          ) : (
            <Text style={{ color: "#64748b", lineHeight: 21 }}>No device data found for this period.</Text>
          )}
        </View>
      </AppCard>

      <AppCard backgroundColor="#fff7ed">
        <View style={{ gap: 12 }}>
          <Text style={{ color: "#9a3412", fontSize: 20, fontWeight: "900" }}>Manual Logging Fallback</Text>
          <Text style={{ color: "#9a3412", lineHeight: 21 }}>
            Device sync is not available on this device yet. You can still log health data manually.
          </Text>
          <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
            <FallbackButton label="Add weight" route="/biometrics?type=weight" />
            <FallbackButton label="Add sleep" route="/biometrics?type=sleep" />
            <FallbackButton label="Add workout" route="/fitness" />
            <FallbackButton label="Add water" route="/food?tab=water" />
            <FallbackButton label="Add heart rate" route="/biometrics?type=heart_rate" />
            <FallbackButton label="Add blood pressure" route="/biometrics?type=blood_pressure" />
            <FallbackButton label="Add glucose" route="/biometrics?type=blood_glucose" />
          </View>
        </View>
      </AppCard>

      <AppCard>
        <View style={{ gap: 10 }}>
          <Text style={{ color: "#0f172a", fontSize: 20, fontWeight: "900" }}>Privacy Controls</Text>
          <Text style={{ color: "#64748b", lineHeight: 21 }}>
            Synced data is not shared with family or caregivers by default. Source labels stay attached to imported samples.
          </Text>
          {errors.length ? (
            <Text style={{ color: "#9a3412", lineHeight: 21 }}>
              Latest issue: {errors[0].errorMessage}
            </Text>
          ) : null}
        </View>
      </AppCard>
    </ScreenWrapper>
  );
}

function MetricRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={{ flexDirection: "row", gap: 10, justifyContent: "space-between" }}>
      <Text style={{ color: "#64748b", flex: 1 }}>{label}</Text>
      <Text style={{ color: "#0f172a", flex: 1, fontWeight: "900", textAlign: "right" }}>{value}</Text>
    </View>
  );
}

function MetricTile({ label, value }: { label: string; value: string }) {
  return (
    <View style={{ backgroundColor: "#ffffff", borderColor: "#bbf7d0", borderRadius: 16, borderWidth: 1, flexGrow: 1, minWidth: "45%", padding: 12 }}>
      <Text style={{ color: "#166534", fontSize: 12, fontWeight: "900" }}>{label}</Text>
      <Text style={{ color: "#0f172a", fontSize: 18, fontWeight: "900", marginTop: 4 }}>{value}</Text>
    </View>
  );
}

function PrimaryButton({ disabled = false, label, onPress }: { disabled?: boolean; label: string; onPress: () => void }) {
  return (
    <TouchableOpacity
      activeOpacity={0.85}
      disabled={disabled}
      onPress={onPress}
      style={{
        alignItems: "center",
        backgroundColor: "#f59e0b",
        borderRadius: 18,
        flex: 1,
        justifyContent: "center",
        minHeight: 50,
        opacity: disabled ? 0.55 : 1,
        paddingHorizontal: 12
      }}
    >
      <Text style={{ color: "#ffffff", fontWeight: "900" }}>{label}</Text>
    </TouchableOpacity>
  );
}

function FallbackButton({ label, route }: { label: string; route: string }) {
  return (
    <TouchableOpacity activeOpacity={0.85} onPress={() => router.push(route as Href)} style={{ backgroundColor: "#ffffff", borderRadius: 999, paddingHorizontal: 12, paddingVertical: 9 }}>
      <Text style={{ color: "#9a3412", fontWeight: "900" }}>{label}</Text>
    </TouchableOpacity>
  );
}

function getDefaultSource(sources: HealthSyncSourceOption[]): HealthSyncSource {
  return sources.find((source) => source.isAvailable && source.source !== "manual")?.source ?? "manual";
}

function getSourceIcon(source: HealthSyncSource) {
  switch (source) {
    case "apple_health":
      return "health";
    case "health_connect":
      return "wearable";
    case "mock":
      return "sync";
    default:
      return "privacy";
  }
}

function getSourceColor(source: HealthSyncSource) {
  switch (source) {
    case "apple_health":
      return "#ef4444";
    case "health_connect":
      return "#22c55e";
    case "mock":
      return "#3b82f6";
    default:
      return "#64748b";
  }
}

function formatSource(source: HealthSyncSource) {
  switch (source) {
    case "apple_health":
      return "Apple Health";
    case "health_connect":
      return "Health Connect";
    case "mock":
      return "Mock Sync";
    case "manual":
      return "Manual only";
    default:
      return "Unknown";
  }
}

function formatStatus(status: string) {
  return status
    .split("_")
    .map((part) => part[0].toUpperCase() + part.slice(1))
    .join(" ");
}

function formatDataType(dataType: HealthSyncDataType) {
  return dataType
    .split("_")
    .map((part) => part[0].toUpperCase() + part.slice(1))
    .join(" ");
}

function formatSampleTotal(samples: SyncedHealthSample[], dataType: HealthSyncDataType, unit: string) {
  const total = samples
    .filter((sample) => sample.dataType === dataType)
    .reduce((sum, sample) => sum + sample.value, 0);

  return total ? `${Math.round(total * 10) / 10} ${unit}` : "No sync";
}

function formatSleep(samples: SyncedHealthSample[]) {
  const minutes = samples
    .filter((sample) => sample.dataType === "sleep")
    .reduce((sum, sample) => sum + sample.value, 0);

  if (!minutes) return "No sync";

  return `${Math.floor(minutes / 60)}h ${Math.round(minutes % 60)}m`;
}
