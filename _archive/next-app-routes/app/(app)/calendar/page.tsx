import { CalendarDays, Check, Clock3, Share2, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { calendarEventTypeLabels, privacyLevelLabels } from "@/lib/health/constants";
import { getAppData } from "@/lib/health/data";

function formatDateTime(value: string) {
  return new Intl.DateTimeFormat("en", { dateStyle: "medium", timeStyle: "short" }).format(new Date(value));
}

export default async function CalendarPage() {
  const data = await getAppData();
  const events = data.calendarEvents;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Calendar</h1>
        <p className="text-sm text-muted-foreground">Family events, care schedules, routines, approvals, postpones, notes, and calendar sync metadata.</p>
      </div>
      <div className="grid gap-4 xl:grid-cols-[1fr_360px]">
        <Card>
          <CardHeader>
            <CardTitle>Upcoming events</CardTitle>
            <CardDescription>Approve, decline, postpone, share, or sync events with external calendars.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {events.length === 0 ? <p className="text-sm text-slate-400">No calendar events yet.</p> : null}
            {events.map((event) => (
              <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4" key={event.id}>
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="font-medium text-white">{event.title}</p>
                    <p className="mt-1 text-sm text-slate-400">{calendarEventTypeLabels[event.event_type as keyof typeof calendarEventTypeLabels] ?? event.event_type}</p>
                  </div>
                  <Badge>{event.status}</Badge>
                </div>
                <div className="mt-3 flex flex-wrap gap-3 text-sm text-slate-300">
                  <span>{formatDateTime(event.starts_at)}</span>
                  <span>{privacyLevelLabels[event.privacy_level]}</span>
                  <span>{event.family_members?.name ?? "Family"}</span>
                </div>
                <div className="mt-3 flex flex-wrap gap-2">
                  <Button size="sm" type="button" variant="outline"><Check className="h-4 w-4" />Approve</Button>
                  <Button size="sm" type="button" variant="outline"><X className="h-4 w-4" />Decline</Button>
                  <Button size="sm" type="button" variant="outline"><Clock3 className="h-4 w-4" />Postpone</Button>
                  <Button size="sm" type="button" variant="outline"><Share2 className="h-4 w-4" />Share</Button>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Sync readiness</CardTitle>
            <CardDescription>Google and Apple Calendar IDs are stored per event after sync.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-slate-300">
            <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-3">
              <CalendarDays className="mb-3 h-5 w-5 text-sky-200" />
              <p>Google Calendar sync: {events.some((event) => event.google_calendar_event_id) ? "connected" : "not connected"}</p>
              <p className="mt-1">Apple Calendar sync: {events.some((event) => event.apple_calendar_event_id) ? "connected" : "not connected"}</p>
            </div>
            <p className="leading-6 text-slate-400">Calendar actions are modeled in `calendar_events` and `event_responses`; provider sync can be wired to OAuth or ICS export next.</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
