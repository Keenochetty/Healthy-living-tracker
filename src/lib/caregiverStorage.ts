import AsyncStorage from "@react-native-async-storage/async-storage";

import { DEFAULT_CAREGIVER_PERMISSION_LABELS } from "@/constants/caregiverOptions";
import type {
  CaregiverAvailability,
  CaregiverBooking,
  CaregiverCheckIn,
  CaregiverConnection,
  CaregiverConnectionStatus,
  CaregiverProfile,
  CaregiverRate,
  CaregiverSummary,
  CaregiverUpdateNote,
} from "@/types/caregiver";

const PROFILES_KEY = "family_health_caregiver_profiles";
const RATES_KEY = "family_health_caregiver_rates";
const AVAILABILITY_KEY = "family_health_caregiver_availability";
const CONNECTIONS_KEY = "family_health_caregiver_connections";
const BOOKINGS_KEY = "family_health_caregiver_bookings";
const CHECK_INS_KEY = "family_health_caregiver_check_ins";
const UPDATES_KEY = "family_health_caregiver_updates";

const caregiverListeners = new Set<() => void>();

export function subscribeToCaregivers(listener: () => void) {
  caregiverListeners.add(listener);

  return () => {
    caregiverListeners.delete(listener);
  };
}

function notifyCaregivers() {
  caregiverListeners.forEach((listener) => listener());
}

function id(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

async function readJsonArray<T>(key: string) {
  try {
    const storedValue = await AsyncStorage.getItem(key);
    if (!storedValue) return [] as T[];
    const parsedValue = JSON.parse(storedValue);
    return Array.isArray(parsedValue) ? (parsedValue as T[]) : [];
  } catch {
    return [] as T[];
  }
}

async function writeJsonArray<T>(key: string, value: T[]) {
  await AsyncStorage.setItem(key, JSON.stringify(value));
  notifyCaregivers();
  return value;
}

function sortNewest<T extends { createdAt: string }>(items: T[]) {
  return [...items].sort(
    (left, right) =>
      new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime(),
  );
}

export async function getCaregiverProfiles() {
  return sortNewest(await readJsonArray<CaregiverProfile>(PROFILES_KEY));
}

export async function getCaregiverProfile(caregiverId: string) {
  return (
    (await getCaregiverProfiles()).find(
      (profile) => profile.id === caregiverId,
    ) ?? null
  );
}

export async function createCaregiverProfile(
  input: Omit<CaregiverProfile, "id" | "verified" | "createdAt" | "updatedAt">,
) {
  const now = new Date().toISOString();
  const profile: CaregiverProfile = {
    ...input,
    bio: input.bio?.trim() || undefined,
    createdAt: now,
    displayName: input.displayName.trim(),
    id: id("caregiver"),
    photoUri: input.photoUri || "placeholder-caregiver-photo",
    updatedAt: now,
    verified: false,
  };
  const profiles = await getCaregiverProfiles();
  await writeJsonArray(PROFILES_KEY, [profile, ...profiles]);
  return profile;
}

export async function updateCaregiverProfile(
  caregiverId: string,
  partial: Partial<Omit<CaregiverProfile, "id" | "createdAt">>,
) {
  const profiles = await getCaregiverProfiles();
  const updated = profiles.map((profile) =>
    profile.id === caregiverId
      ? { ...profile, ...partial, updatedAt: new Date().toISOString() }
      : profile,
  );
  await writeJsonArray(PROFILES_KEY, updated);
  return updated.find((profile) => profile.id === caregiverId) ?? null;
}

export async function deleteCaregiverProfile(caregiverId: string) {
  const profiles = await getCaregiverProfiles();
  await writeJsonArray(
    PROFILES_KEY,
    profiles.filter((profile) => profile.id !== caregiverId),
  );
}

export async function getCaregiverRates(caregiverId: string) {
  return (await readJsonArray<CaregiverRate>(RATES_KEY)).filter(
    (rate) => rate.caregiverId === caregiverId,
  );
}

export async function addCaregiverRate(
  input: Omit<CaregiverRate, "id" | "active" | "createdAt" | "updatedAt">,
) {
  const now = new Date().toISOString();
  const rate: CaregiverRate = {
    ...input,
    active: true,
    createdAt: now,
    id: id("caregiver-rate"),
    updatedAt: now,
  };
  await writeJsonArray(RATES_KEY, [
    rate,
    ...(await readJsonArray<CaregiverRate>(RATES_KEY)),
  ]);
  return rate;
}

export async function updateCaregiverRate(
  rateId: string,
  partial: Partial<Omit<CaregiverRate, "id" | "caregiverId" | "createdAt">>,
) {
  const rates = await readJsonArray<CaregiverRate>(RATES_KEY);
  const updated = rates.map((rate) =>
    rate.id === rateId
      ? { ...rate, ...partial, updatedAt: new Date().toISOString() }
      : rate,
  );
  await writeJsonArray(RATES_KEY, updated);
  return updated.find((rate) => rate.id === rateId) ?? null;
}

export async function deleteCaregiverRate(rateId: string) {
  const rates = await readJsonArray<CaregiverRate>(RATES_KEY);
  await writeJsonArray(
    RATES_KEY,
    rates.filter((rate) => rate.id !== rateId),
  );
}

export async function getCaregiverAvailability(caregiverId: string) {
  return (await readJsonArray<CaregiverAvailability>(AVAILABILITY_KEY)).filter(
    (item) => item.caregiverId === caregiverId,
  );
}

export async function addCaregiverAvailability(
  input: Omit<CaregiverAvailability, "id" | "createdAt" | "updatedAt">,
) {
  const now = new Date().toISOString();
  const item: CaregiverAvailability = {
    ...input,
    createdAt: now,
    id: id("caregiver-availability"),
    updatedAt: now,
  };
  await writeJsonArray(AVAILABILITY_KEY, [
    item,
    ...(await readJsonArray<CaregiverAvailability>(AVAILABILITY_KEY)),
  ]);
  return item;
}

export async function updateCaregiverAvailability(
  availabilityId: string,
  partial: Partial<
    Omit<CaregiverAvailability, "id" | "caregiverId" | "createdAt">
  >,
) {
  const rows = await readJsonArray<CaregiverAvailability>(AVAILABILITY_KEY);
  const updated = rows.map((row) =>
    row.id === availabilityId
      ? { ...row, ...partial, updatedAt: new Date().toISOString() }
      : row,
  );
  await writeJsonArray(AVAILABILITY_KEY, updated);
  return updated.find((row) => row.id === availabilityId) ?? null;
}

export async function deleteCaregiverAvailability(availabilityId: string) {
  const rows = await readJsonArray<CaregiverAvailability>(AVAILABILITY_KEY);
  await writeJsonArray(
    AVAILABILITY_KEY,
    rows.filter((row) => row.id !== availabilityId),
  );
}

export async function getCaregiverConnections(caregiverId?: string) {
  const connections = await readJsonArray<CaregiverConnection>(CONNECTIONS_KEY);
  return caregiverId
    ? connections.filter((connection) => connection.caregiverId === caregiverId)
    : connections;
}

export async function createCaregiverConnectionRequest(
  input: Omit<
    CaregiverConnection,
    "id" | "requestedAt" | "status" | "permissions"
  >,
) {
  const request: CaregiverConnection = {
    ...input,
    id: id("caregiver-connection"),
    permissions: DEFAULT_CAREGIVER_PERMISSION_LABELS,
    requestedAt: new Date().toISOString(),
    status: "pending",
  };
  await writeJsonArray(CONNECTIONS_KEY, [
    request,
    ...(await readJsonArray<CaregiverConnection>(CONNECTIONS_KEY)),
  ]);
  return request;
}

async function updateConnectionStatus(
  connectionId: string,
  status: CaregiverConnectionStatus,
) {
  const connections = await readJsonArray<CaregiverConnection>(CONNECTIONS_KEY);
  const updated = connections.map((connection) =>
    connection.id === connectionId
      ? {
          ...connection,
          approvedAt:
            status === "approved"
              ? new Date().toISOString()
              : connection.approvedAt,
          status,
        }
      : connection,
  );
  await writeJsonArray(CONNECTIONS_KEY, updated);
  return updated.find((connection) => connection.id === connectionId) ?? null;
}

export const approveCaregiverConnection = (connectionId: string) =>
  updateConnectionStatus(connectionId, "approved");
export const declineCaregiverConnection = (connectionId: string) =>
  updateConnectionStatus(connectionId, "declined");
export const pauseCaregiverConnection = (connectionId: string) =>
  updateConnectionStatus(connectionId, "paused");
export const removeCaregiverConnection = (connectionId: string) =>
  updateConnectionStatus(connectionId, "removed");

export async function getCaregiverBookings(caregiverId?: string) {
  const bookings = sortNewest(
    await readJsonArray<CaregiverBooking>(BOOKINGS_KEY),
  );
  return caregiverId
    ? bookings.filter((booking) => booking.caregiverId === caregiverId)
    : bookings;
}

export async function createCaregiverBooking(
  input: Omit<CaregiverBooking, "id" | "status" | "createdAt" | "updatedAt">,
) {
  const now = new Date().toISOString();
  const booking: CaregiverBooking = {
    ...input,
    createdAt: now,
    id: id("caregiver-booking"),
    status: "requested",
    updatedAt: now,
  };
  await writeJsonArray(BOOKINGS_KEY, [
    booking,
    ...(await readJsonArray<CaregiverBooking>(BOOKINGS_KEY)),
  ]);
  return booking;
}

async function updateBookingStatus(
  bookingId: string,
  status: CaregiverBooking["status"],
) {
  const bookings = await readJsonArray<CaregiverBooking>(BOOKINGS_KEY);
  const updated = bookings.map((booking) =>
    booking.id === bookingId
      ? { ...booking, status, updatedAt: new Date().toISOString() }
      : booking,
  );
  await writeJsonArray(BOOKINGS_KEY, updated);
  return updated.find((booking) => booking.id === bookingId) ?? null;
}

export const approveCaregiverBooking = (bookingId: string) =>
  updateBookingStatus(bookingId, "approved");
export const declineCaregiverBooking = (bookingId: string) =>
  updateBookingStatus(bookingId, "declined");
export const cancelCaregiverBooking = (bookingId: string) =>
  updateBookingStatus(bookingId, "cancelled");
export const completeCaregiverBooking = (bookingId: string) =>
  updateBookingStatus(bookingId, "completed");

export async function getCaregiverCheckIns(caregiverId: string) {
  return sortNewest(
    (await readJsonArray<CaregiverCheckIn>(CHECK_INS_KEY)).filter(
      (item) => item.caregiverId === caregiverId,
    ),
  );
}

export async function addCaregiverCheckIn(
  input: Omit<CaregiverCheckIn, "id" | "createdAt">,
) {
  const checkIn: CaregiverCheckIn = {
    ...input,
    createdAt: new Date().toISOString(),
    id: id("caregiver-check-in"),
  };
  await writeJsonArray(CHECK_INS_KEY, [
    checkIn,
    ...(await readJsonArray<CaregiverCheckIn>(CHECK_INS_KEY)),
  ]);
  return checkIn;
}

export async function checkInCaregiver(
  caregiverId: string,
  bookingId?: string,
) {
  return addCaregiverCheckIn({
    bookingId,
    caregiverId,
    checkedInAt: new Date().toISOString(),
    status: "checked_in",
  });
}

export async function checkOutCaregiver(
  caregiverId: string,
  bookingId?: string,
) {
  return addCaregiverCheckIn({
    bookingId,
    caregiverId,
    checkedOutAt: new Date().toISOString(),
    status: "checked_out",
  });
}

export async function getCaregiverUpdateNotes(caregiverId: string) {
  return sortNewest(
    (await readJsonArray<CaregiverUpdateNote>(UPDATES_KEY)).filter(
      (note) => note.caregiverId === caregiverId,
    ),
  );
}

export async function addCaregiverUpdateNote(
  input: Omit<CaregiverUpdateNote, "id" | "createdAt" | "updatedAt">,
) {
  const now = new Date().toISOString();
  const note: CaregiverUpdateNote = {
    ...input,
    createdAt: now,
    id: id("caregiver-update"),
    note: input.note.trim(),
    title: input.title.trim(),
    updatedAt: now,
  };
  await writeJsonArray(UPDATES_KEY, [
    note,
    ...(await readJsonArray<CaregiverUpdateNote>(UPDATES_KEY)),
  ]);
  return note;
}

export async function updateCaregiverUpdateNote(
  noteId: string,
  partial: Partial<
    Omit<CaregiverUpdateNote, "id" | "caregiverId" | "createdAt">
  >,
) {
  const notes = await readJsonArray<CaregiverUpdateNote>(UPDATES_KEY);
  const updated = notes.map((note) =>
    note.id === noteId
      ? { ...note, ...partial, updatedAt: new Date().toISOString() }
      : note,
  );
  await writeJsonArray(UPDATES_KEY, updated);
  return updated.find((note) => note.id === noteId) ?? null;
}

export async function deleteCaregiverUpdateNote(noteId: string) {
  const notes = await readJsonArray<CaregiverUpdateNote>(UPDATES_KEY);
  await writeJsonArray(
    UPDATES_KEY,
    notes.filter((note) => note.id !== noteId),
  );
}

export async function getCaregiverSummary(
  caregiverId: string,
): Promise<CaregiverSummary | null> {
  const caregiver = await getCaregiverProfile(caregiverId);
  if (!caregiver) return null;
  const [rates, availability, bookings, checkIns, updates, connections] =
    await Promise.all([
      getCaregiverRates(caregiverId),
      getCaregiverAvailability(caregiverId),
      getCaregiverBookings(caregiverId),
      getCaregiverCheckIns(caregiverId),
      getCaregiverUpdateNotes(caregiverId),
      getCaregiverConnections(caregiverId),
    ]);
  return {
    availability,
    caregiver,
    connectionStatus: connections[0]?.status,
    latestBooking: bookings[0],
    latestCheckIn: checkIns[0],
    latestUpdate: updates[0],
    rates,
  };
}

export async function getAllCaregiverSummaries() {
  const profiles = await getCaregiverProfiles();
  const summaries = await Promise.all(
    profiles.map((profile) => getCaregiverSummary(profile.id)),
  );
  return summaries.filter((summary): summary is CaregiverSummary =>
    Boolean(summary),
  );
}
