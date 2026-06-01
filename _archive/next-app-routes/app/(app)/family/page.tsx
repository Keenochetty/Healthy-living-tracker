import { MemberForm } from "@/components/forms/member-form";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { EmptyState } from "@/components/ui/states";
import { getAppData } from "@/lib/health/data";

export default async function FamilyPage() {
  const data = await getAppData();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">Family</h1>
          <p className="text-sm text-muted-foreground">Create and review family member health profiles.</p>
        </div>
        <Sheet>
          <SheetTrigger asChild>
            <Button>Add family member</Button>
          </SheetTrigger>
          <SheetContent>
            <SheetHeader>
              <SheetTitle>Add family member</SheetTitle>
              <SheetDescription>Profiles can be used across tracking, documents, reminders, and AI context.</SheetDescription>
            </SheetHeader>
            <MemberForm />
          </SheetContent>
        </Sheet>
      </div>

      {data.members.length === 0 ? <EmptyState message="Add the first profile to start using the health tracker." title="No profiles yet" /> : null}

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {data.members.map((member) => (
          <Sheet key={member.id}>
            <SheetTrigger asChild>
              <button className="text-left">
                <Card className="h-full transition-colors hover:bg-accent/50">
                  <CardHeader>
                    <CardTitle>{member.name}</CardTitle>
                    <CardDescription>{member.relationship ?? "Family member"}</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-2 text-sm text-muted-foreground">
                    <Badge>{member.profile_type.replaceAll("_", " ")}</Badge>
                    <p>Allergies: {member.allergies || "None recorded"}</p>
                  </CardContent>
                </Card>
              </button>
            </SheetTrigger>
            <SheetContent>
              <SheetHeader>
                <SheetTitle>{member.name}</SheetTitle>
                <SheetDescription>{member.relationship ?? member.profile_type.replaceAll("_", " ")}</SheetDescription>
              </SheetHeader>
              <div className="space-y-4 text-sm">
                <Info label="Date of birth" value={member.date_of_birth} />
                <Info label="Gender" value={member.gender} />
                <Info label="Allergies" value={member.allergies} />
                <Info label="Medical notes" value={member.medical_notes} />
                <Info label="Doctor details" value={member.doctor_details} />
                <Info label="Emergency notes" value={member.emergency_notes} />
              </div>
            </SheetContent>
          </Sheet>
        ))}
      </div>
    </div>
  );
}

function Info({ label, value }: { label: string; value: string | null }) {
  return (
    <div className="rounded-md border p-3">
      <p className="font-medium">{label}</p>
      <p className="mt-1 text-muted-foreground">{value || "Not added"}</p>
    </div>
  );
}
