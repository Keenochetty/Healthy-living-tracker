import { useEffect, useState } from "react";
import { Text, TextInput, TouchableOpacity, View } from "react-native";

import { addElderAppointment, getElderAppointments } from "@/lib/elderStorage";
import type { ElderAppointment } from "@/types/elder";
import { AppCard } from "@/components/ui/AppCard";

type ElderAppointmentsCardProps = {
  elderId: string;
  onChange?: () => void;
};

export function ElderAppointmentsCard({ elderId, onChange }: ElderAppointmentsCardProps) {
  const [appointmentDate, setAppointmentDate] = useState("");
  const [appointments, setAppointments] = useState<ElderAppointment[]>([]);
  const [location, setLocation] = useState("");
  const [notes, setNotes] = useState("");
  const [title, setTitle] = useState("");

  async function loadAppointments() {
    setAppointments(await getElderAppointments(elderId));
  }

  useEffect(() => {
    let isActive = true;

    getElderAppointments(elderId).then((nextAppointments) => {
      if (isActive) {
        setAppointments(nextAppointments);
      }
    });

    return () => {
      isActive = false;
    };
  }, [elderId]);

  async function handleSave() {
    if (!title.trim() || !appointmentDate.trim()) return;

    await addElderAppointment({
      appointmentDate: appointmentDate.trim(),
      elderId,
      location: location.trim() || undefined,
      notes,
      title: title.trim()
      // TODO: Connect elder appointments to reminderStorage when reminder sync is designed.
    });

    setAppointmentDate("");
    setLocation("");
    setNotes("");
    setTitle("");
    await loadAppointments();
    onChange?.();
  }

  return (
    <AppCard>
      <View style={{ gap: 12 }}>
        <Text style={{ color: "#0f172a", fontSize: 20, fontWeight: "900" }}>
          Appointments
        </Text>
        <TextInput onChangeText={setTitle} placeholder="Appointment title" placeholderTextColor="#94a3b8" style={inputStyle} value={title} />
        <TextInput onChangeText={setAppointmentDate} placeholder="Date/time" placeholderTextColor="#94a3b8" style={inputStyle} value={appointmentDate} />
        <TextInput onChangeText={setLocation} placeholder="Location, optional" placeholderTextColor="#94a3b8" style={inputStyle} value={location} />
        <TextInput onChangeText={setNotes} placeholder="Notes, optional" placeholderTextColor="#94a3b8" style={inputStyle} value={notes} />

        <TouchableOpacity activeOpacity={0.85} onPress={handleSave} style={buttonStyle}>
          <Text style={{ color: "#ffffff", fontWeight: "900" }}>Save appointment</Text>
        </TouchableOpacity>

        {appointments.slice(0, 4).map((appointment) => (
          <View key={appointment.id} style={{ backgroundColor: "#f8fafc", borderRadius: 16, padding: 12 }}>
            <Text style={{ color: "#0f172a", fontWeight: "900" }}>{appointment.title}</Text>
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
  paddingHorizontal: 14
};

const buttonStyle = {
  alignItems: "center" as const,
  backgroundColor: "#059669",
  borderRadius: 18,
  justifyContent: "center" as const,
  minHeight: 52
};
