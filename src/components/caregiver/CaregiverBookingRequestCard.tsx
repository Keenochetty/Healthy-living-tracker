import { useEffect, useState } from "react";
import { Text, TextInput, TouchableOpacity, View } from "react-native";

import {
  approveCaregiverBooking,
  createCaregiverBooking,
  declineCaregiverBooking,
  getCaregiverBookings,
} from "@/lib/caregiverStorage";
import type { CaregiverBooking } from "@/types/caregiver";
import { AppCard } from "@/components/ui/AppCard";

type CaregiverBookingRequestCardProps = {
  caregiverId: string;
  onChange?: () => void;
};

export function CaregiverBookingRequestCard({
  caregiverId,
  onChange,
}: CaregiverBookingRequestCardProps) {
  const [bookingDate, setBookingDate] = useState("");
  const [bookings, setBookings] = useState<CaregiverBooking[]>([]);
  const [endTime, setEndTime] = useState("17:00");
  const [notes, setNotes] = useState("");
  const [startTime, setStartTime] = useState("08:00");
  const [targetName, setTargetName] = useState("");

  async function loadBookings() {
    setBookings(await getCaregiverBookings(caregiverId));
  }

  useEffect(() => {
    let isActive = true;
    getCaregiverBookings(caregiverId).then((nextBookings) => {
      if (isActive) setBookings(nextBookings);
    });
    return () => {
      isActive = false;
    };
  }, [caregiverId]);

  async function handleRequest() {
    if (!bookingDate.trim()) return;
    await createCaregiverBooking({
      bookingDate,
      caregiverId,
      endTime,
      notes,
      requesterName: "Family",
      startTime,
      targetName: targetName.trim() || undefined,
    });
    setBookingDate("");
    setNotes("");
    setTargetName("");
    await loadBookings();
    onChange?.();
  }

  async function updateStatus(
    bookingId: string,
    action: "approve" | "decline",
  ) {
    if (action === "approve") await approveCaregiverBooking(bookingId);
    if (action === "decline") await declineCaregiverBooking(bookingId);
    await loadBookings();
    onChange?.();
  }

  return (
    <AppCard>
      <View style={{ gap: 12 }}>
        <View>
          <Text style={{ color: "#0f172a", fontSize: 20, fontWeight: "900" }}>
            Booking requests
          </Text>
          <Text style={{ color: "#64748b", lineHeight: 20, marginTop: 4 }}>
            Placeholder requests only. This is not payment or a marketplace.
          </Text>
        </View>
        <TextInput
          onChangeText={setTargetName}
          placeholder="Target name, optional"
          placeholderTextColor="#94a3b8"
          style={inputStyle}
          value={targetName}
        />
        <TextInput
          onChangeText={setBookingDate}
          placeholder="Booking date"
          placeholderTextColor="#94a3b8"
          style={inputStyle}
          value={bookingDate}
        />
        <TextInput
          onChangeText={setStartTime}
          placeholder="Start time"
          placeholderTextColor="#94a3b8"
          style={inputStyle}
          value={startTime}
        />
        <TextInput
          onChangeText={setEndTime}
          placeholder="End time"
          placeholderTextColor="#94a3b8"
          style={inputStyle}
          value={endTime}
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
          onPress={handleRequest}
          style={buttonStyle}
        >
          <Text style={{ color: "#ffffff", fontWeight: "900" }}>
            Request booking
          </Text>
        </TouchableOpacity>
        {bookings.slice(0, 4).map((booking) => (
          <View
            key={booking.id}
            style={{
              backgroundColor: "#f8fafc",
              borderRadius: 16,
              padding: 12,
            }}
          >
            <Text style={{ color: "#0f172a", fontWeight: "900" }}>
              {booking.bookingDate} - {booking.status}
            </Text>
            <Text style={{ color: "#64748b", marginTop: 3 }}>
              {booking.startTime}-{booking.endTime}
            </Text>
            <View style={{ flexDirection: "row", gap: 8, marginTop: 8 }}>
              <SmallButton
                label="Approve"
                onPress={() => updateStatus(booking.id, "approve")}
              />
              <SmallButton
                label="Decline"
                onPress={() => updateStatus(booking.id, "decline")}
              />
            </View>
          </View>
        ))}
      </View>
    </AppCard>
  );
}

function SmallButton({
  label,
  onPress,
}: {
  label: string;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity
      onPress={onPress}
      style={{
        alignItems: "center",
        backgroundColor: "#eef2ff",
        borderRadius: 12,
        flex: 1,
        minHeight: 38,
        justifyContent: "center",
      }}
    >
      <Text style={{ color: "#4f46e5", fontWeight: "900" }}>{label}</Text>
    </TouchableOpacity>
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
  backgroundColor: "#4f46e5",
  borderRadius: 18,
  justifyContent: "center" as const,
  minHeight: 52,
};
