import { useEffect, useState } from "react";
import { Text, TextInput, TouchableOpacity, View } from "react-native";

import {
  addPregnancyAppointment,
  getPregnancyAppointments,
} from "@/lib/cycleStorage";
import type { PregnancyAppointment } from "@/types/cycle";
import { AppCard } from "@/components/ui/AppCard";

type PregnancyAppointmentCardProps = {
  onChange?: () => void;
  pregnancyProfileId: string;
};

export function PregnancyAppointmentCard({
  onChange,
  pregnancyProfileId,
}: PregnancyAppointmentCardProps) {
  const [appointmentDate, setAppointmentDate] = useState("");
  const [appointments, setAppointments] = useState<PregnancyAppointment[]>([]);
  const [notes, setNotes] = useState("");
  const [title, setTitle] = useState("");

  async function loadAppointments() {
    setAppointments(await getPregnancyAppointments());
  }

  useEffect(() => {
    let isActive = true;

    getPregnancyAppointments().then((nextAppointments) => {
      if (isActive) {
        setAppointments(nextAppointments);
      }
    });

    return () => {
      isActive = false;
    };
  }, []);

  async function handleSave() {
    if (!title.trim() || !appointmentDate.trim()) return;

    await addPregnancyAppointment({
      appointmentDate: appointmentDate.trim(),
      notes,
      pregnancyProfileId,
      title: title.trim(),
      // TODO: Link pregnancy appointments to reminderStorage when reminder sync is designed.
    });

    setAppointmentDate("");
    setNotes("");
    setTitle("");
    await loadAppointments();
    onChange?.();
  }

  return (
    <AppCard>
      <View style={{ gap: 12 }}>
        <View>
          <Text style={{ color: "#0f172a", fontSize: 20, fontWeight: "900" }}>
            Appointments
          </Text>
          <Text style={{ color: "#64748b", lineHeight: 20, marginTop: 4 }}>
            Keep clinic, doctor, midwife or scan appointments organised.
          </Text>
        </View>

        <TextInput
          onChangeText={setTitle}
          placeholder="Appointment title"
          placeholderTextColor="#94a3b8"
          style={inputStyle}
          value={title}
        />
        <TextInput
          onChangeText={setAppointmentDate}
          placeholder="Appointment date"
          placeholderTextColor="#94a3b8"
          style={inputStyle}
          value={appointmentDate}
        />
        <TextInput
          onChangeText={setNotes}
          placeholder="Notes, optional"
          placeholderTextColor="#94a3b8"
          style={inputStyle}
          value={notes}
        />

        <TouchableOpacity
          activeOpacity={0.85}
          onPress={handleSave}
          style={buttonStyle}
        >
          <Text style={{ color: "#ffffff", fontWeight: "900" }}>
            Save appointment
          </Text>
        </TouchableOpacity>

        {appointments
          .filter(
            (appointment) =>
              appointment.pregnancyProfileId === pregnancyProfileId,
          )
          .slice(0, 4)
          .map((appointment) => (
            <View
              key={appointment.id}
              style={{
                backgroundColor: "#f8fafc",
                borderRadius: 16,
                padding: 12,
              }}
            >
              <Text style={{ color: "#0f172a", fontWeight: "900" }}>
                {appointment.title}
              </Text>
              <Text style={{ color: "#64748b", marginTop: 3 }}>
                {appointment.appointmentDate}
              </Text>
            </View>
          ))}
      </View>
    </AppCard>
  );
}

const inputStyle = {
  backgroundColor: "#f8fafc",
  borderColor: "#e2e8f0",
  borderRadius: 18,
  borderWidth: 1,
  color: "#0f172a",
  minHeight: 50,
  paddingHorizontal: 14,
};

const buttonStyle = {
  alignItems: "center" as const,
  backgroundColor: "#7c3aed",
  borderRadius: 18,
  justifyContent: "center" as const,
  minHeight: 52,
};
