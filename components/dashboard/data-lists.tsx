import { Calendar, FileText, HeartPulse, Pill, Thermometer } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/states";
import { documentCategoryLabels, trackingCategoryLabels } from "@/lib/health/constants";
import type { DoctorVisit, DocumentRecord, FamilyMember, HealthLog, MedicineLog, Reminder, TemperatureLog } from "@/lib/health/types";

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en", { dateStyle: "medium", timeStyle: "short" }).format(new Date(value));
}

export function FamilyCards({ members }: { members: FamilyMember[] }) {
  if (members.length === 0) {
    return <EmptyState message="Create a family member profile to start tracking health data." title="No family members yet" />;
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      {members.map((member) => (
        <Card key={member.id}>
          <CardHeader>
            <CardTitle>{member.name}</CardTitle>
            <CardDescription>{member.relationship ?? member.profile_type.replaceAll("_", " ")}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-slate-400">
            <p>Allergies: {member.allergies || "None recorded"}</p>
            <p>Doctor: {member.doctor_details || "Not added"}</p>
            <Badge>{member.profile_type.replaceAll("_", " ")}</Badge>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

export function ReminderList({ reminders }: { reminders: Reminder[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Upcoming reminders</CardTitle>
        <CardDescription>Appointments, medicine, vaccinations, and care tasks.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {reminders.length === 0 ? <p className="text-sm text-slate-400">No reminders scheduled.</p> : null}
        {reminders.map((reminder) => (
          <div className="flex items-start justify-between gap-3 rounded-2xl border border-white/10 bg-white/[0.03] p-3" key={reminder.id}>
            <div>
              <p className="font-medium text-white">{reminder.title}</p>
              <p className="text-sm text-slate-400">{reminder.family_members?.name ?? "Family"} - {reminder.reminder_type}</p>
            </div>
            <Badge>{formatDate(reminder.due_at)}</Badge>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

export function ActivityList({
  healthLogs,
  medicineLogs,
  temperatureLogs,
  doctorVisits,
  documents
}: {
  healthLogs: HealthLog[];
  medicineLogs: MedicineLog[];
  temperatureLogs: TemperatureLog[];
  doctorVisits: DoctorVisit[];
  documents: DocumentRecord[];
}) {
  const items = [
    ...healthLogs.map((log) => ({ id: log.id, icon: HeartPulse, title: log.title, detail: `${trackingCategoryLabels[log.category as keyof typeof trackingCategoryLabels] ?? log.category} - ${log.family_members?.name ?? ""}`, date: log.logged_at })),
    ...medicineLogs.map((log) => ({ id: log.id, icon: Pill, title: log.medicine_name, detail: `${log.dosage ?? "Dose"} - ${log.family_members?.name ?? ""}`, date: log.taken_at })),
    ...temperatureLogs.map((log) => ({ id: log.id, icon: Thermometer, title: `${log.temperature_c} C`, detail: `Temperature - ${log.family_members?.name ?? ""}`, date: log.measured_at })),
    ...doctorVisits.map((visit) => ({ id: visit.id, icon: Calendar, title: visit.reason, detail: `${visit.doctor_name ?? "Doctor visit"} - ${visit.family_members?.name ?? ""}`, date: visit.visit_at })),
    ...documents.map((document) => ({ id: document.id, icon: FileText, title: document.file_name, detail: `${documentCategoryLabels[document.category as keyof typeof documentCategoryLabels] ?? document.category} - ${document.family_members?.name ?? ""}`, date: document.created_at }))
  ]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 12);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent activity</CardTitle>
        <CardDescription>Latest logs, visits, and documents.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {items.length === 0 ? <p className="text-sm text-slate-400">No activity yet.</p> : null}
        {items.map((item) => {
          const Icon = item.icon;
          return (
            <div className="flex items-start gap-3 rounded-2xl border border-white/10 bg-white/[0.03] p-3" key={`${item.id}-${item.title}`}>
              <div className="rounded-2xl bg-sky-400/10 p-2 text-sky-200">
                <Icon className="h-4 w-4" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate font-medium text-white">{item.title}</p>
                <p className="truncate text-sm text-slate-400">{item.detail}</p>
              </div>
              <span className="text-xs text-slate-500">{formatDate(item.date)}</span>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}

export function MedicineAlerts({ medicineLogs }: { medicineLogs: MedicineLog[] }) {
  const alerts = medicineLogs.filter((log) => log.next_dose_at).slice(0, 5);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Medication alerts</CardTitle>
        <CardDescription>Upcoming doses from recent medicine logs.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {alerts.length === 0 ? <p className="text-sm text-slate-400">No upcoming medication alerts.</p> : null}
        {alerts.map((alert) => (
          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-3" key={alert.id}>
            <p className="font-medium text-white">{alert.medicine_name}</p>
            <p className="text-sm text-slate-400">{alert.family_members?.name ?? "Family member"} - next dose {formatDate(alert.next_dose_at!)}</p>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
