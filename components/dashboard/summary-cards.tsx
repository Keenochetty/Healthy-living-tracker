import { Baby, Bell, FileText, HeartPulse, Pill, Users } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function SummaryCards({
  members,
  logs,
  reminders,
  medicines,
  documents,
  babyProfiles
}: {
  members: number;
  logs: number;
  reminders: number;
  medicines: number;
  documents: number;
  babyProfiles: number;
}) {
  const cards = [
    { title: "Family members", value: members, icon: Users },
    { title: "Health logs", value: logs, icon: HeartPulse },
    { title: "Reminders", value: reminders, icon: Bell },
    { title: "Medicine logs", value: medicines, icon: Pill },
    { title: "Documents", value: documents, icon: FileText },
    { title: "Baby/child profiles", value: babyProfiles, icon: Baby }
  ];

  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-6">
      {cards.map((card) => {
        const Icon = card.icon;
        return (
          <Card className="overflow-hidden" key={card.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-slate-300">{card.title}</CardTitle>
              <div className="rounded-2xl bg-sky-400/10 p-2 text-sky-200">
                <Icon className="h-4 w-4" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-semibold text-white">{card.value}</div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
