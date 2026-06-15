import {
  Bot,
  FileUp,
  HeartPulse,
  Pill,
  Plus,
  Stethoscope,
  Thermometer,
} from "lucide-react";
import { AiChatForm } from "@/components/forms/ai-chat-form";
import {
  DoctorVisitForm,
  DocumentUploadForm,
  HealthLogForm,
  MedicineLogForm,
  TemperatureLogForm,
} from "@/components/forms/log-forms";
import { MemberForm } from "@/components/forms/member-form";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import type { AiChat, DocumentRecord, FamilyMember } from "@/lib/health/types";

const actions = [
  {
    label: "Add family member",
    icon: Plus,
    title: "Add family member",
    form: "member",
  },
  {
    label: "Log symptom",
    icon: HeartPulse,
    title: "Log symptom",
    form: "symptom",
  },
  {
    label: "Log medicine",
    icon: Pill,
    title: "Log medicine",
    form: "medicine",
  },
  {
    label: "Log temperature",
    icon: Thermometer,
    title: "Log temperature",
    form: "temperature",
  },
  {
    label: "Add doctor visit",
    icon: Stethoscope,
    title: "Add doctor visit",
    form: "doctor",
  },
  {
    label: "Upload document",
    icon: FileUp,
    title: "Upload document",
    form: "document",
  },
  { label: "Ask AI", icon: Bot, title: "Ask AI Health", form: "ai" },
] as const;

export function QuickActions({
  members,
  chats = [],
  documents = [],
}: {
  members: FamilyMember[];
  chats?: AiChat[];
  documents?: DocumentRecord[];
}) {
  return (
    <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-7">
      {actions.map((action) => {
        const Icon = action.icon;
        return (
          <Sheet key={action.label}>
            <SheetTrigger asChild>
              <Button
                className="justify-start rounded-2xl border-white/10 bg-white/[0.04] text-slate-200 hover:bg-sky-400/10 hover:text-white"
                variant="outline"
              >
                <Icon className="h-4 w-4" />
                {action.label}
              </Button>
            </SheetTrigger>
            <SheetContent>
              <SheetHeader>
                <SheetTitle>{action.title}</SheetTitle>
                <SheetDescription>
                  Save the update without leaving the dashboard.
                </SheetDescription>
              </SheetHeader>
              {action.form === "member" ? <MemberForm /> : null}
              {action.form === "symptom" ? (
                <HealthLogForm category="symptom" members={members} />
              ) : null}
              {action.form === "medicine" ? (
                <MedicineLogForm members={members} />
              ) : null}
              {action.form === "temperature" ? (
                <TemperatureLogForm members={members} />
              ) : null}
              {action.form === "doctor" ? (
                <DoctorVisitForm members={members} />
              ) : null}
              {action.form === "document" ? (
                <DocumentUploadForm members={members} />
              ) : null}
              {action.form === "ai" ? (
                <AiChatForm
                  chats={chats}
                  documents={documents}
                  members={members}
                />
              ) : null}
            </SheetContent>
          </Sheet>
        );
      })}
    </div>
  );
}
