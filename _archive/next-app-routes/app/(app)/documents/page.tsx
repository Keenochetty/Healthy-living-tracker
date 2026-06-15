import { ActivityList } from "@/components/dashboard/data-lists";
import { DocumentUploadForm } from "@/components/forms/log-forms";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { getAppData } from "@/lib/health/data";

export default async function DocumentsPage() {
  const data = await getAppData();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Documents</h1>
        <p className="text-sm text-muted-foreground">
          Private doctor reports, lab results, prescriptions, scans, vaccination
          cards, notes, and documents.
        </p>
      </div>
      <div className="grid gap-4 xl:grid-cols-[1fr_420px]">
        <ActivityList
          doctorVisits={[]}
          documents={data.documents}
          healthLogs={[]}
          medicineLogs={[]}
          temperatureLogs={[]}
        />
        <Card>
          <CardHeader>
            <CardTitle>Upload private document</CardTitle>
            <CardDescription>
              Files are stored in a private Supabase bucket and linked to a
              family member.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <DocumentUploadForm members={data.members} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
