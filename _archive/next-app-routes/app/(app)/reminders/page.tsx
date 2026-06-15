import { ReminderList } from "@/components/dashboard/data-lists";
import { ReminderForm } from "@/components/forms/log-forms";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getAppData } from "@/lib/health/data";

export default async function RemindersPage() {
  const data = await getAppData();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Reminders</h1>
        <p className="text-sm text-muted-foreground">
          Appointment, medicine, vaccination, document, and health log
          reminders.
        </p>
      </div>
      <div className="grid gap-4 xl:grid-cols-[1fr_420px]">
        <ReminderList reminders={data.reminders} />
        <Card>
          <CardHeader>
            <CardTitle>Create reminder</CardTitle>
          </CardHeader>
          <CardContent>
            <ReminderForm members={data.members} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
