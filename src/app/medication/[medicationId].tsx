import { Href, router, useLocalSearchParams } from "expo-router";
import { Check, Power } from "lucide-react-native";
import { useCallback, useEffect, useState } from "react";
import { ActivityIndicator, Text, TouchableOpacity, View } from "react-native";

import { MedicationScheduleCard } from "@/components/medication/MedicationScheduleCard";
import { MedicationTakenHistory } from "@/components/medication/MedicationTakenHistory";
import { ScreenWrapper } from "@/components/layout/ScreenWrapper";
import { AppCard } from "@/components/ui/AppCard";
import {
  getMedicationDetail,
  markMedicationTaken,
  saveMedicationSchedule,
  updateMedication
} from "@/lib/medicationStorage";
import type { MedicationDetail } from "@/types/medication";

export default function MedicationDetailScreen() {
  const { medicationId: medicationIdParam } = useLocalSearchParams<{
    medicationId?: string | string[];
  }>();
  const medicationId = Array.isArray(medicationIdParam)
    ? medicationIdParam[0]
    : medicationIdParam;
  const [detail, setDetail] = useState<MedicationDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const loadDetail = useCallback(async () => {
    if (!medicationId) {
      setDetail(null);
      setIsLoading(false);
      return;
    }

    setDetail(await getMedicationDetail(medicationId));
    setIsLoading(false);
  }, [medicationId]);

  useEffect(() => {
    let isActive = true;
    const detailRequest = medicationId
      ? getMedicationDetail(medicationId)
      : Promise.resolve(null);

    detailRequest
      .then((nextDetail) => {
        if (isActive) {
          setDetail(nextDetail);
        }
      })
      .finally(() => {
        if (isActive) {
          setIsLoading(false);
        }
      });

    return () => {
      isActive = false;
    };
  }, [medicationId]);

  async function handleMarkTaken() {
    if (!detail) return;

    await markMedicationTaken(detail.medication.id);
    await loadDetail();
  }

  async function handleDeactivate() {
    if (!detail) return;

    await updateMedication(detail.medication.id, { active: false });
    if (detail.schedule) {
      await saveMedicationSchedule({ ...detail.schedule, active: false });
    }
    router.replace("/health" as Href);
  }

  if (isLoading) {
    return (
      <ScreenWrapper>
        <ActivityIndicator color="#7c3aed" />
      </ScreenWrapper>
    );
  }

  if (!detail) {
    return (
      <ScreenWrapper>
        <Text style={{ color: "#0f172a", fontSize: 28, fontWeight: "900" }}>
          Medication not found
        </Text>
        <AppCard>
          <Text style={{ color: "#64748b", lineHeight: 21 }}>
            This medication may have been removed.
          </Text>
        </AppCard>
        <SecondaryButton label="Back to Health" onPress={() => router.replace("/health" as Href)} />
      </ScreenWrapper>
    );
  }

  return (
    <ScreenWrapper>
      <View style={{ gap: 4 }}>
        <Text style={{ color: "#64748b", fontSize: 14 }}>Medication detail</Text>
        <Text style={{ color: "#0f172a", fontSize: 30, fontWeight: "900" }}>
          {detail.medication.name}
        </Text>
      </View>

      <AppCard backgroundColor="#fff7ed">
        <Text style={{ color: "#9a3412", fontWeight: "900" }}>Safety note</Text>
        <Text style={{ color: "#9a3412", lineHeight: 21, marginTop: 6 }}>
          This app helps you organise medication reminders. It does not replace
          advice from a doctor, pharmacist or healthcare professional.
        </Text>
      </AppCard>

      <AppCard>
        <InfoRow label="Dosage" value={detail.medication.dosage || "Not entered"} />
        <InfoRow
          label="Instructions"
          value={detail.medication.instructions || "Not entered"}
        />
        <InfoRow label="Status" value={detail.medication.active ? "Active" : "Inactive"} />
        <Text style={{ color: "#64748b", lineHeight: 21, marginTop: 12 }}>
          Follow your healthcare professional instructions.
        </Text>
      </AppCard>

      <TouchableOpacity
        activeOpacity={0.85}
        onPress={handleMarkTaken}
        style={{
          alignItems: "center",
          backgroundColor: "#7c3aed",
          borderRadius: 18,
          flexDirection: "row",
          gap: 8,
          justifyContent: "center",
          minHeight: 52
        }}
      >
        <Check color="#ffffff" size={18} />
        <Text style={{ color: "#ffffff", fontSize: 16, fontWeight: "900" }}>
          Mark taken
        </Text>
      </TouchableOpacity>

      <MedicationScheduleCard
        medication={detail.medication}
        onSaved={loadDetail}
        schedule={detail.schedule}
      />

      <MedicationTakenHistory logs={detail.takenLogs} />

      <TouchableOpacity
        activeOpacity={0.85}
        onPress={handleDeactivate}
        style={{
          alignItems: "center",
          backgroundColor: "#fee2e2",
          borderRadius: 18,
          flexDirection: "row",
          gap: 8,
          justifyContent: "center",
          minHeight: 50
        }}
      >
        <Power color="#dc2626" size={18} />
        <Text style={{ color: "#dc2626", fontWeight: "900" }}>
          Deactivate medication
        </Text>
      </TouchableOpacity>

      <SecondaryButton label="Back to Health" onPress={() => router.replace("/health" as Href)} />
    </ScreenWrapper>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <View
      style={{
        flexDirection: "row",
        gap: 12,
        justifyContent: "space-between",
        marginTop: 10
      }}
    >
      <Text style={{ color: "#64748b" }}>{label}</Text>
      <Text style={{ color: "#0f172a", flex: 1, fontWeight: "900", textAlign: "right" }}>
        {value}
      </Text>
    </View>
  );
}

function SecondaryButton({ label, onPress }: { label: string; onPress: () => void }) {
  return (
    <TouchableOpacity
      activeOpacity={0.85}
      onPress={onPress}
      style={{
        alignItems: "center",
        backgroundColor: "#ffffff",
        borderRadius: 18,
        justifyContent: "center",
        minHeight: 50
      }}
    >
      <Text style={{ color: "#7c3aed", fontWeight: "800" }}>{label}</Text>
    </TouchableOpacity>
  );
}
