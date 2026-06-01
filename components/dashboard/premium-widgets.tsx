"use client";

import type * as React from "react";
import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from "recharts";
import {
  Bot,
  CalendarClock,
  ChevronDown,
  Droplets,
  HeartPulse,
  Moon,
  Phone,
  Pill,
  Plus,
  ShieldCheck,
  Sparkles,
  Thermometer,
  Users,
  Venus
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PrivacyCareWorkflows } from "@/components/dashboard/privacy-care-workflows";
import type { AppData, DoctorVisit, FamilyMember, MedicineLog, Reminder } from "@/lib/health/types";
import { cn } from "@/lib/utils";

const cardMotion = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0 }
};

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en", { dateStyle: "medium", timeStyle: "short" }).format(new Date(value));
}

function profileLabel(member?: FamilyMember) {
  return member?.profile_type.replaceAll("_", " ") ?? "Family";
}

export function PremiumDashboard({ data }: { data: AppData }) {
  const [selectedMemberId, setSelectedMemberId] = useState(data.members[0]?.id ?? "family");
  const selectedMember = data.members.find((member) => member.id === selectedMemberId);
  const metrics = useMemo(() => deriveMetrics(data), [data]);

  return (
    <motion.div
      animate="show"
      className="space-y-6"
      initial="hidden"
      variants={{ hidden: {}, show: { transition: { staggerChildren: 0.07 } } }}
    >
      <motion.section className="grid gap-4 xl:grid-cols-[1.45fr_0.9fr]" variants={cardMotion}>
        <div className="relative overflow-hidden rounded-[2rem] border border-sky-300/20 bg-[linear-gradient(135deg,rgba(14,165,233,0.22),rgba(15,23,42,0.86)_45%,rgba(45,212,191,0.12))] p-6 shadow-[0_30px_90px_rgba(2,8,23,0.45)] sm:p-8">
          <div className="absolute right-8 top-8 h-28 w-28 rounded-full bg-sky-300/10 blur-3xl" />
          <div className="relative z-10 grid gap-8 lg:grid-cols-[1fr_240px]">
            <div className="space-y-6">
              <div>
                <Badge>Premium care command center</Badge>
                <h1 className="mt-4 max-w-2xl text-3xl font-semibold tracking-normal text-white sm:text-5xl">
                  {data.family?.name ?? "Family"} health overview
                </h1>
                <p className="mt-4 max-w-xl text-sm leading-6 text-slate-300 sm:text-base">
                  Intelligent health signals, reminders, family context, and AI-ready care notes in one calm workspace.
                </p>
              </div>
              <FamilySwitcher members={data.members} selectedMemberId={selectedMemberId} onSelect={setSelectedMemberId} />
            </div>
            <HealthScoreRing score={metrics.healthScore} label={selectedMember?.name ?? "Family score"} />
          </div>
        </div>
        <AiHealthPanel chats={data.aiChats.length} documents={data.documents.length} />
      </motion.section>

      <motion.section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4" variants={cardMotion}>
        <PremiumMetricCard accent="blue" icon={HeartPulse} label="Health signals" trend="+12% this week" value={metrics.signalCount} />
        <PremiumMetricCard accent="orange" icon={Pill} label="Medication events" trend={`${metrics.upcomingMedicine} upcoming`} value={data.medicineLogs.length} />
        <PremiumMetricCard accent="teal" icon={Users} label="Family profiles" trend={profileLabel(selectedMember)} value={data.members.length} />
        <PremiumMetricCard accent="purple" icon={ShieldCheck} label="Care readiness" trend="Records protected" value={`${metrics.readiness}%`} />
      </motion.section>

      <section className="grid gap-4 xl:grid-cols-[1fr_420px]">
        <motion.div className="grid gap-4 lg:grid-cols-2" variants={cardMotion}>
          <TrendChart data={metrics.trendData} />
          <HydrationWidget />
          <MedicationWidget medicineLogs={data.medicineLogs} reminders={data.reminders} />
          <AppointmentWidget visits={data.doctorVisits} />
          <CycleWidget />
          <SleepWidget />
        </motion.div>
        <motion.div className="space-y-4" variants={cardMotion}>
          <InsightCard title="AI insight" icon={Sparkles}>
            Your recent care activity shows {metrics.signalCount} tracked signals. Review upcoming medication and appointment timing before the next family check-in.
          </InsightCard>
          <WellnessTimeline data={data} />
        </motion.div>
      </section>
      <motion.div variants={cardMotion}>
        <PrivacyCareWorkflows compact data={data} />
      </motion.div>
      <FloatingActionMenu />
    </motion.div>
  );
}

export function PremiumMetricCard({
  label,
  value,
  trend,
  icon: Icon,
  accent
}: {
  label: string;
  value: number | string;
  trend: string;
  icon: React.ComponentType<{ className?: string }>;
  accent: "blue" | "orange" | "teal" | "purple";
}) {
  const accentClass = {
    blue: "from-sky-400/25 to-blue-600/10 text-sky-200",
    orange: "from-orange-300/25 to-amber-600/10 text-orange-100",
    teal: "from-teal-300/25 to-cyan-600/10 text-teal-100",
    purple: "from-violet-300/25 to-fuchsia-600/10 text-violet-100"
  }[accent];

  return (
    <motion.div
      className="gradient-border rounded-3xl border border-white/10 bg-slate-900/55 p-5 shadow-[0_20px_60px_rgba(2,8,23,0.34)] backdrop-blur-2xl"
      whileHover={{ scale: 1.02, y: -4 }}
      transition={{ duration: 0.22 }}
    >
      <div className="flex items-start justify-between">
        <div className={cn("rounded-2xl bg-gradient-to-br p-3", accentClass)}>
          <Icon className="h-5 w-5" />
        </div>
        <span className="text-xs text-slate-400">{trend}</span>
      </div>
      <p className="mt-6 text-sm text-slate-400">{label}</p>
      <p className="mt-2 text-3xl font-semibold tracking-normal text-white">{value}</p>
    </motion.div>
  );
}

export function HealthScoreRing({ score, label }: { score: number; label: string }) {
  const circumference = 2 * Math.PI * 52;
  const offset = circumference - (score / 100) * circumference;

  return (
    <div className="rounded-3xl border border-white/10 bg-white/[0.05] p-5 text-center backdrop-blur">
      <div className="relative mx-auto h-36 w-36">
        <svg className="h-full w-full -rotate-90" viewBox="0 0 120 120">
          <circle cx="60" cy="60" fill="none" r="52" stroke="rgba(148,163,184,0.18)" strokeWidth="10" />
          <motion.circle
            animate={{ strokeDashoffset: offset }}
            cx="60"
            cy="60"
            fill="none"
            initial={{ strokeDashoffset: circumference }}
            r="52"
            stroke="#38BDF8"
            strokeDasharray={circumference}
            strokeLinecap="round"
            strokeWidth="10"
            transition={{ duration: 1, ease: "easeOut" }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-4xl font-semibold text-white">{score}</span>
          <span className="text-xs text-slate-400">score</span>
        </div>
      </div>
      <p className="mt-3 text-sm font-medium text-white">{label}</p>
      <p className="mt-1 text-xs text-slate-400">Balanced care rhythm</p>
    </div>
  );
}

export function FamilySwitcher({
  members,
  selectedMemberId,
  onSelect
}: {
  members: FamilyMember[];
  selectedMemberId: string;
  onSelect: (value: string) => void;
}) {
  if (members.length === 0) {
    return <p className="text-sm text-slate-400">Add family members to unlock personalized views.</p>;
  }

  return (
    <div className="flex gap-2 overflow-x-auto pb-1">
      {members.slice(0, 6).map((member) => {
        const active = selectedMemberId === member.id;
        return (
          <button
            className={cn(
              "flex shrink-0 items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.04] px-3 py-2 text-left transition hover:bg-white/10",
              active && "border-sky-300/40 bg-sky-400/15"
            )}
            key={member.id}
            onClick={() => onSelect(member.id)}
            type="button"
          >
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-sky-300 to-cyan-500 text-sm font-semibold text-slate-950">
              {member.name.slice(0, 1).toUpperCase()}
            </span>
            <span>
              <span className="block whitespace-nowrap text-sm font-medium text-white">{member.name}</span>
              <span className="block whitespace-nowrap text-xs capitalize text-slate-400">{profileLabel(member)}</span>
            </span>
          </button>
        );
      })}
    </div>
  );
}

export function AiHealthPanel({ chats, documents }: { chats: number; documents: number }) {
  return (
    <motion.div
      className="relative overflow-hidden rounded-[2rem] border border-teal-300/20 bg-[linear-gradient(145deg,rgba(20,184,166,0.18),rgba(15,23,42,0.82))] p-6 shadow-[0_24px_80px_rgba(20,184,166,0.1)]"
      whileHover={{ y: -4 }}
    >
      <Bot className="h-7 w-7 text-teal-200" />
      <h2 className="mt-5 text-xl font-semibold text-white">AI health assistant</h2>
      <p className="mt-3 text-sm leading-6 text-slate-300">
        Ask educational questions with family, category, and document context.
      </p>
      <div className="mt-6 grid grid-cols-2 gap-3">
        <div className="rounded-2xl bg-white/[0.06] p-3">
          <p className="text-2xl font-semibold text-white">{chats}</p>
          <p className="text-xs text-slate-400">conversations</p>
        </div>
        <div className="rounded-2xl bg-white/[0.06] p-3">
          <p className="text-2xl font-semibold text-white">{documents}</p>
          <p className="text-xs text-slate-400">documents</p>
        </div>
      </div>
    </motion.div>
  );
}

export function TrendChart({ data }: { data: Array<{ day: string; wellness: number; activity: number }> }) {
  return (
    <div className="rounded-3xl border border-white/10 bg-slate-900/55 p-5 backdrop-blur-2xl lg:col-span-2">
      <div className="mb-5 flex items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-white">Health trends</h2>
          <p className="text-sm text-slate-400">Wellness and tracking activity</p>
        </div>
        <Badge>7 day signal</Badge>
      </div>
      <div className="h-72">
        <ResponsiveContainer height="100%" width="100%">
          <AreaChart data={data}>
            <defs>
              <linearGradient id="wellness" x1="0" x2="0" y1="0" y2="1">
                <stop offset="5%" stopColor="#38BDF8" stopOpacity={0.45} />
                <stop offset="95%" stopColor="#38BDF8" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="activity" x1="0" x2="0" y1="0" y2="1">
                <stop offset="5%" stopColor="#2DD4BF" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#2DD4BF" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid stroke="rgba(148,163,184,0.12)" vertical={false} />
            <XAxis axisLine={false} dataKey="day" tick={{ fill: "#94A3B8", fontSize: 12 }} tickLine={false} />
            <YAxis axisLine={false} domain={[0, 100]} tick={{ fill: "#94A3B8", fontSize: 12 }} tickLine={false} width={32} />
            <Tooltip contentStyle={{ background: "#020817", border: "1px solid rgba(148,163,184,0.2)", borderRadius: 16, color: "#fff" }} />
            <Area dataKey="wellness" fill="url(#wellness)" stroke="#38BDF8" strokeWidth={3} type="monotone" />
            <Area dataKey="activity" fill="url(#activity)" stroke="#2DD4BF" strokeWidth={2} type="monotone" />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export function MedicationWidget({ medicineLogs, reminders }: { medicineLogs: MedicineLog[]; reminders: Reminder[] }) {
  const next = medicineLogs.find((log) => log.next_dose_at) ?? null;
  const medicineReminder = reminders.find((reminder) => reminder.reminder_type.includes("medicine"));

  return (
    <InsightCard title="Medication" icon={Pill} tone="orange">
      {next ? `${next.medicine_name} next dose ${formatDate(next.next_dose_at!)}` : medicineReminder ? `${medicineReminder.title} due ${formatDate(medicineReminder.due_at)}` : "No upcoming medication alerts recorded."}
    </InsightCard>
  );
}

export function AppointmentWidget({ visits }: { visits: DoctorVisit[] }) {
  const next = visits[0];

  return (
    <InsightCard title="Appointments" icon={CalendarClock}>
      {next ? `${next.reason} with ${next.doctor_name ?? "doctor"} on ${formatDate(next.visit_at)}` : "No upcoming doctor visits scheduled."}
    </InsightCard>
  );
}

export function HydrationWidget() {
  return (
    <InsightCard title="Hydration" icon={Droplets} tone="teal">
      6 of 8 glasses logged. Keep the pace steady through the afternoon.
    </InsightCard>
  );
}

export function CycleWidget() {
  return (
    <InsightCard title="Cycle tracking" icon={Venus} tone="purple">
      Cycle insights are ready for symptom, mood, and appointment context.
    </InsightCard>
  );
}

export function SleepWidget() {
  return (
    <InsightCard title="Sleep recovery" icon={Moon}>
      Sleep trend is stable. Add sleep logs to unlock personalized recovery scoring.
    </InsightCard>
  );
}

export function InsightCard({
  title,
  children,
  icon: Icon,
  tone = "blue"
}: {
  title: string;
  children: React.ReactNode;
  icon: React.ComponentType<{ className?: string }>;
  tone?: "blue" | "orange" | "teal" | "purple";
}) {
  const toneClass = {
    blue: "from-sky-400/20 text-sky-200",
    orange: "from-orange-300/20 text-orange-100",
    teal: "from-teal-300/20 text-teal-100",
    purple: "from-violet-300/20 text-violet-100"
  }[tone];
  const [expanded, setExpanded] = useState(false);

  return (
    <motion.div className="rounded-3xl border border-white/10 bg-slate-900/55 p-5 backdrop-blur-2xl" layout whileHover={{ y: -3 }}>
      <button className="flex w-full items-start justify-between gap-3 text-left" onClick={() => setExpanded((value) => !value)} type="button">
        <span className="flex items-center gap-3">
          <span className={cn("rounded-2xl bg-gradient-to-br to-white/[0.03] p-3", toneClass)}>
            <Icon className="h-5 w-5" />
          </span>
          <span>
            <span className="block text-base font-semibold text-white">{title}</span>
            <span className="block text-xs text-slate-400">Tap to expand</span>
          </span>
        </span>
        <ChevronDown className={cn("h-4 w-4 text-slate-400 transition", expanded && "rotate-180")} />
      </button>
      <motion.p animate={{ height: expanded ? "auto" : 48 }} className="mt-4 overflow-hidden text-sm leading-6 text-slate-300">
        {children}
      </motion.p>
    </motion.div>
  );
}

export function WellnessTimeline({ data }: { data: AppData }) {
  const items = [
    ...data.healthLogs.map((log) => ({ id: log.id, title: log.title, detail: log.family_members?.name ?? "Health log", date: log.logged_at, icon: HeartPulse })),
    ...data.temperatureLogs.map((log) => ({ id: log.id, title: `${log.temperature_c} C`, detail: log.family_members?.name ?? "Temperature", date: log.measured_at, icon: Thermometer })),
    ...data.documents.map((document) => ({ id: document.id, title: document.file_name, detail: "Medical record", date: document.created_at, icon: ShieldCheck }))
  ]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 6);

  return (
    <div className="rounded-3xl border border-white/10 bg-slate-900/55 p-5 backdrop-blur-2xl">
      <h2 className="text-lg font-semibold text-white">Recent medical records</h2>
      <div className="mt-5 space-y-4">
        {items.length === 0 ? <p className="text-sm text-slate-400">No recent records yet.</p> : null}
        {items.map((item) => {
          const Icon = item.icon;
          return (
            <div className="flex gap-3" key={`${item.id}-${item.title}`}>
              <div className="mt-1 flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl bg-white/[0.06] text-sky-200">
                <Icon className="h-4 w-4" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-white">{item.title}</p>
                <p className="truncate text-xs text-slate-400">{item.detail}</p>
              </div>
              <span className="text-xs text-slate-500">{new Date(item.date).toLocaleDateString()}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function FloatingActionMenu() {
  return (
    <div className="fixed bottom-28 right-5 z-30 flex flex-col gap-3 lg:bottom-8">
      <Button aria-label="Emergency phone shortcut" className="h-12 w-12 rounded-full bg-orange-400 text-slate-950 hover:bg-orange-300" size="icon" type="button">
        <Phone className="h-5 w-5" />
      </Button>
      <Button aria-label="Add care event" className="h-12 w-12 rounded-full" size="icon" type="button">
        <Plus className="h-5 w-5" />
      </Button>
    </div>
  );
}

function deriveMetrics(data: AppData) {
  const signalCount = data.healthLogs.length + data.temperatureLogs.length + data.medicineLogs.length + data.doctorVisits.length;
  const upcomingMedicine = data.medicineLogs.filter((log) => log.next_dose_at).length;
  const readiness = Math.min(98, 54 + data.members.length * 8 + data.documents.length * 4 + data.reminders.length * 3);
  const healthScore = Math.min(96, 70 + Math.min(signalCount, 12) + Math.min(data.documents.length, 6));
  const trendData = Array.from({ length: 7 }, (_, index) => {
    const day = new Date();
    day.setDate(day.getDate() - (6 - index));
    return {
      day: day.toLocaleDateString("en", { weekday: "short" }),
      wellness: Math.min(96, 64 + index * 4 + data.members.length),
      activity: Math.min(92, 42 + index * 5 + signalCount)
    };
  });

  return { healthScore, signalCount, upcomingMedicine, readiness, trendData };
}
