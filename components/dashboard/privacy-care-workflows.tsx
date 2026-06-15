import {
  Baby,
  CalendarDays,
  Camera,
  Check,
  Clock3,
  HeartPulse,
  MessageSquareText,
  Moon,
  Phone,
  ShieldCheck,
  ShieldPlus,
  Siren,
  Utensils,
  X,
} from "lucide-react";
import type * as React from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  calendarEventTypeLabels,
  caregiverActivityLabels,
  notificationUrgencyClasses,
  notificationUrgencyLabels,
  privacyLevelLabels,
} from "@/lib/health/constants";
import type { AppData, CalendarEvent, FamilyMember } from "@/lib/health/types";
import { cn } from "@/lib/utils";

function formatDateTime(value: string) {
  return new Intl.DateTimeFormat("en", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

function getChildren(members: FamilyMember[]) {
  return members.filter((member) =>
    ["baby", "child"].includes(member.profile_type),
  );
}

const panelClass =
  "rounded-2xl border border-white/10 bg-white/[0.045] p-4 shadow-[0_18px_50px_rgba(2,8,23,0.22)]";

export function PrivacyCareWorkflows({
  data,
  compact = false,
}: {
  data: AppData;
  compact?: boolean;
}) {
  const children = getChildren(data.members);
  const childCards = children.length ? children : data.members.slice(0, 2);

  if (compact) {
    return <CareWorkflowSnapshot data={data} childCount={children.length} />;
  }

  return (
    <section className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_360px]">
      <div className="space-y-4">
        <RoleModePanel />
        <div className="grid gap-4 lg:grid-cols-2 2xl:grid-cols-3">
          {childCards.length === 0 ? (
            <EmptyPanel
              title="Child caregiver cards"
              message="Add child or baby profiles to show emergency, care, and quick-log cards."
            />
          ) : (
            childCards.map((child) => (
              <ChildCareCard child={child} data={data} key={child.id} />
            ))
          )}
        </div>
        <CalendarFlow events={data.calendarEvents} />
      </div>
      <div className="space-y-4">
        <PrivacyPanel data={data} />
        <NotificationPanel data={data} />
      </div>
    </section>
  );
}

function CareWorkflowSnapshot({
  data,
  childCount,
}: {
  data: AppData;
  childCount: number;
}) {
  const emergencyCount = data.notifications.filter(
    (notification) => notification.urgency === "emergency",
  ).length;
  const sharedEvents = data.calendarEvents.filter(
    (event) => event.share_with_caregiver,
  ).length;

  const items = [
    {
      label: "Child care cards",
      value: childCount || data.members.length,
      detail: "Allergies, care notes, schedules, contacts",
      icon: Baby,
      tone: "bg-teal-300/10 text-teal-100",
    },
    {
      label: "Caregiver sharing",
      value: data.caregiverAccess.filter((access) => access.status === "active")
        .length,
      detail: "Work mode access grants",
      icon: ShieldCheck,
      tone: "bg-sky-300/10 text-sky-100",
    },
    {
      label: "Calendar handoffs",
      value: sharedEvents,
      detail: "Events visible to caregivers",
      icon: CalendarDays,
      tone: "bg-amber-300/10 text-amber-100",
    },
    {
      label: "Emergency alerts",
      value: emergencyCount,
      detail: "Red-priority parent notifications",
      icon: Siren,
      tone: "bg-red-400/10 text-red-100",
    },
  ];

  return (
    <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
      {items.map((item) => {
        const Icon = item.icon;
        return (
          <div
            className="rounded-2xl border border-white/10 bg-white/[0.045] p-4"
            key={item.label}
          >
            <div className="flex items-start justify-between gap-3">
              <div className={cn("rounded-xl p-3", item.tone)}>
                <Icon className="h-5 w-5" />
              </div>
              <span className="text-2xl font-semibold text-white">
                {item.value}
              </span>
            </div>
            <p className="mt-4 text-sm font-medium text-white">{item.label}</p>
            <p className="mt-1 text-xs leading-5 text-slate-400">
              {item.detail}
            </p>
          </div>
        );
      })}
    </section>
  );
}

function RoleModePanel() {
  const roles = [
    {
      label: "Parent",
      detail: "Family, child records, caregiver access",
      active: true,
    },
    { label: "Caregiver", detail: "Personal and work profile switch" },
    { label: "Woman", detail: "Cycle, symptoms, mood, pregnancy" },
    { label: "Man", detail: "Fitness, stress, medication, visits" },
    { label: "Child", detail: "Guardian managed, age-aware sharing" },
  ];

  return (
    <div
      className={cn(
        panelClass,
        "bg-[linear-gradient(135deg,rgba(20,184,166,0.1),rgba(255,255,255,0.04))]",
      )}
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-white">
            Roles and profile modes
          </h2>
          <p className="mt-1 text-sm text-slate-400">
            Caregivers can keep personal family tracking separate from assigned
            children at work.
          </p>
        </div>
        <div className="flex rounded-xl border border-white/10 bg-slate-950/35 p-1">
          <span className="rounded-lg bg-teal-300 px-3 py-1 text-xs font-medium text-slate-950">
            Personal
          </span>
          <span className="px-3 py-1 text-xs font-medium text-slate-300">
            Work
          </span>
        </div>
      </div>
      <div className="mt-4 grid gap-2 sm:grid-cols-2 xl:grid-cols-5">
        {roles.map((role) => (
          <div
            className={cn(
              "rounded-xl border p-3",
              role.active
                ? "border-teal-300/30 bg-teal-300/10"
                : "border-white/10 bg-slate-950/25",
            )}
            key={role.label}
          >
            <p className="text-sm font-medium text-white">{role.label}</p>
            <p className="mt-1 text-xs leading-5 text-slate-400">
              {role.detail}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

function ChildCareCard({
  child,
  data,
}: {
  child: FamilyMember;
  data: AppData;
}) {
  const contacts = data.emergencyContacts
    .filter(
      (contact) =>
        contact.family_member_id === child.id ||
        contact.family_member_id === null,
    )
    .slice(0, 2);
  const instructions = data.careInstructions
    .filter((item) => item.child_id === child.id)
    .slice(0, 2);
  const todayEvents = data.calendarEvents
    .filter(
      (event) =>
        event.child_id === child.id || event.family_member_id === child.id,
    )
    .slice(0, 2);

  return (
    <div className={cn(panelClass, "flex min-h-[440px] flex-col")}>
      <div className="flex items-start gap-4">
        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-teal-200 to-amber-200 text-lg font-semibold text-slate-950">
          {child.photo_url ? null : child.name.slice(0, 1).toUpperCase()}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="truncate text-lg font-semibold text-white">
              {child.name}
            </h3>
            <Badge>{child.profile_type.replaceAll("_", " ")}</Badge>
          </div>
          <p className="mt-1 text-sm text-slate-400">
            Allergies: {child.allergies || "None recorded"}
          </p>
          <p className="text-sm text-slate-400">
            Conditions: {child.medical_notes || "None recorded"}
          </p>
        </div>
        <Button
          aria-label={`Emergency alert for ${child.name}`}
          className="bg-red-500 text-white hover:bg-red-400"
          size="icon"
          type="button"
        >
          <Siren className="h-4 w-4" />
        </Button>
      </div>

      <div className="mt-4 grid gap-2 text-sm text-slate-300">
        <InfoRow
          icon={HeartPulse}
          label="Medication"
          value={child.medication_notes || "No medication notes"}
        />
        <InfoRow
          icon={Utensils}
          label="Feeding"
          value={child.feeding_instructions || "No feeding instructions"}
        />
        <InfoRow
          icon={CalendarDays}
          label="Today"
          value={todayEvents[0]?.title ?? "No schedule items"}
        />
        <InfoRow
          icon={Phone}
          label="Contacts"
          value={
            contacts[0]
              ? `${contacts[0].name} - ${contacts[0].phone}`
              : "No emergency contact"
          }
        />
      </div>

      {instructions.length ? (
        <div className="mt-4 space-y-2">
          {instructions.map((item) => (
            <div
              className="rounded-2xl border border-teal-300/20 bg-teal-400/10 p-3"
              key={item.id}
            >
              <p className="text-sm font-medium text-teal-100">{item.title}</p>
              <p className="mt-1 line-clamp-2 text-xs leading-5 text-slate-300">
                {item.instructions}
              </p>
            </div>
          ))}
        </div>
      ) : null}

      <div className="mt-auto">
        <QuickLogButtons />
      </div>
    </div>
  );
}

function InfoRow({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
}) {
  return (
    <div className="flex gap-3 rounded-xl border border-white/10 bg-slate-950/25 p-3">
      <Icon className="mt-0.5 h-4 w-4 shrink-0 text-teal-200" />
      <div className="min-w-0">
        <p className="text-xs uppercase text-slate-500">{label}</p>
        <p className="truncate text-sm text-slate-200">{value}</p>
      </div>
    </div>
  );
}

function QuickLogButtons() {
  const actions = [
    { type: "feed", icon: Utensils },
    { type: "nap", icon: Moon },
    { type: "medication_given", icon: HeartPulse },
    { type: "bathroom", icon: Baby },
    { type: "mood", icon: MessageSquareText },
    { type: "activity", icon: Clock3 },
    { type: "incident", icon: Siren },
    { type: "photo_update", icon: Camera },
  ] as const;

  return (
    <div className="mt-4 grid grid-cols-4 gap-2">
      {actions.map((action) => {
        const Icon = action.icon;
        return (
          <Button
            className="h-auto min-h-16 flex-col gap-1 rounded-xl px-2 py-2 text-xs"
            key={action.type}
            variant="outline"
            type="button"
          >
            <Icon className="h-4 w-4" />
            <span className="max-w-full truncate">
              {caregiverActivityLabels[action.type]}
            </span>
          </Button>
        );
      })}
    </div>
  );
}

function PrivacyPanel({ data }: { data: AppData }) {
  const counts = data.members.reduce<Record<string, number>>(
    (acc, member) => {
      const level = member.privacy_level ?? "family_shared";
      acc[level] = (acc[level] ?? 0) + 1;
      return acc;
    },
    { private: 0, family_shared: 0, partner_shared: 0, caregiver_shared: 0 },
  );

  return (
    <div className={panelClass}>
      <div className="flex items-center gap-3">
        <div className="rounded-xl bg-teal-400/10 p-3 text-teal-100">
          <ShieldCheck className="h-5 w-5" />
        </div>
        <div>
          <h2 className="text-lg font-semibold text-white">
            Privacy permissions
          </h2>
          <p className="text-sm text-slate-400">
            Every record is scoped before it is shared.
          </p>
        </div>
      </div>
      <div className="mt-4 grid gap-2">
        {Object.entries(counts).map(([level, count]) => (
          <div
            className="flex items-center justify-between rounded-xl border border-white/10 bg-slate-950/25 p-3"
            key={level}
          >
            <span className="text-sm text-slate-200">
              {privacyLevelLabels[level as keyof typeof privacyLevelLabels]}
            </span>
            <Badge>{count} profiles</Badge>
          </div>
        ))}
      </div>
      <div className="mt-4 rounded-xl border border-orange-300/20 bg-orange-400/10 p-3 text-sm leading-6 text-orange-50">
        Caregiver access exposes only approved basics such as schedules,
        allergies, instructions, medication notes, emergency contacts, and
        shared logs.
      </div>
    </div>
  );
}

function NotificationPanel({ data }: { data: AppData }) {
  const fallback = [
    {
      id: "normal",
      urgency: "normal",
      title: "Normal update",
      message: "Liam finished lunch.",
      created_at: new Date().toISOString(),
    },
    {
      id: "schedule",
      urgency: "schedule",
      title: "Schedule update",
      message: "Soccer practice starts at 15:00.",
      created_at: new Date().toISOString(),
    },
    {
      id: "attention",
      urgency: "attention",
      title: "Needs attention",
      message: "Mia did not eat much today.",
      created_at: new Date().toISOString(),
    },
    {
      id: "important",
      urgency: "important",
      title: "Important care",
      message: "Medication was given.",
      created_at: new Date().toISOString(),
    },
    {
      id: "emergency",
      urgency: "emergency",
      title: "Emergency",
      message: "Emergency alert triggered by caregiver.",
      created_at: new Date().toISOString(),
    },
  ] as const;
  const notifications = data.notifications.length
    ? data.notifications
    : fallback;

  return (
    <div className={panelClass}>
      <h2 className="text-lg font-semibold text-white">Notification urgency</h2>
      <div className="mt-4 space-y-2">
        {notifications.slice(0, 5).map((notification) => (
          <div
            className={cn(
              "rounded-xl border p-3",
              notificationUrgencyClasses[notification.urgency],
            )}
            key={notification.id}
          >
            <div className="flex items-start justify-between gap-3">
              <p className="text-sm font-medium">{notification.title}</p>
              <span className="text-xs">
                {notificationUrgencyLabels[notification.urgency]}
              </span>
            </div>
            <p className="mt-1 text-sm leading-5 opacity-90">
              {notification.message}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

function CalendarFlow({ events }: { events: CalendarEvent[] }) {
  const fallback = [
    {
      id: "fallback-event",
      event_type: "doctor_visit",
      title: "Pediatric check-up",
      starts_at: new Date().toISOString(),
      status: "pending",
      share_with_caregiver: true,
      google_calendar_event_id: null,
      apple_calendar_event_id: null,
    },
  ] as CalendarEvent[];
  const visibleEvents = events.length ? events : fallback;

  return (
    <div className={panelClass}>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-white">Calendar flow</h2>
          <p className="mt-1 text-sm text-slate-400">
            Events support responses, notes, sharing, and external calendar IDs.
          </p>
        </div>
        <Button type="button">
          <ShieldPlus className="h-4 w-4" />
          Add event
        </Button>
      </div>
      <div className="mt-4 grid gap-3 lg:grid-cols-2">
        {visibleEvents.slice(0, 4).map((event) => (
          <div
            className="rounded-xl border border-white/10 bg-slate-950/25 p-4"
            key={event.id}
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="font-medium text-white">{event.title}</p>
                <p className="mt-1 text-sm text-slate-400">
                  {calendarEventTypeLabels[
                    event.event_type as keyof typeof calendarEventTypeLabels
                  ] ?? event.event_type}
                </p>
              </div>
              <Badge>{event.status}</Badge>
            </div>
            <p className="mt-3 text-sm text-slate-300">
              {formatDateTime(event.starts_at)}
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              <Button size="sm" type="button" variant="outline">
                <Check className="h-4 w-4" />
                Approve
              </Button>
              <Button size="sm" type="button" variant="outline">
                <X className="h-4 w-4" />
                Decline
              </Button>
              <Button size="sm" type="button" variant="outline">
                <Clock3 className="h-4 w-4" />
                Postpone
              </Button>
            </div>
            <div className="mt-3 flex flex-wrap gap-2 text-xs text-slate-400">
              <span>
                Family: {event.share_with_family ? "shared" : "private"}
              </span>
              <span>
                Caregiver: {event.share_with_caregiver ? "shared" : "hidden"}
              </span>
              <span>Google sync</span>
              <span>Apple sync</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function EmptyPanel({ title, message }: { title: string; message: string }) {
  return (
    <div className={cn(panelClass, "text-sm text-slate-400")}>
      <p className="font-medium text-white">{title}</p>
      <p className="mt-2 leading-6">{message}</p>
    </div>
  );
}
