import { ActivityList, MedicineAlerts } from "@/components/dashboard/data-lists";
import { QuickActions } from "@/components/dashboard/quick-actions";
import { SummaryCards } from "@/components/dashboard/summary-cards";
import { DocumentUploadForm, DoctorVisitForm, HealthLogForm, MedicineLogForm } from "@/components/forms/log-forms";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getAppData } from "@/lib/health/data";

export default async function MyHealthPage() {
  const data = await getAppData();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">My Health</h1>
        <p className="text-sm text-muted-foreground">Track symptoms, medicine, vitals, doctors, documents, and trends.</p>
      </div>
      <QuickActions chats={data.aiChats} documents={data.documents} members={data.members} />
      <Tabs defaultValue="overview">
        <TabsList className="flex flex-wrap">
          {["overview", "logs", "medicine", "doctors", "documents", "trends"].map((tab) => (
            <TabsTrigger key={tab} value={tab}>{tab[0].toUpperCase() + tab.slice(1)}</TabsTrigger>
          ))}
        </TabsList>
        <TabsContent value="overview">
          <SummaryCards babyProfiles={0} documents={data.documents.length} logs={data.healthLogs.length} medicines={data.medicineLogs.length} members={data.members.length} reminders={data.reminders.length} />
        </TabsContent>
        <TabsContent value="logs">
          <div className="grid gap-4 xl:grid-cols-[1fr_380px]">
            <ActivityList doctorVisits={[]} documents={[]} healthLogs={data.healthLogs} medicineLogs={[]} temperatureLogs={data.temperatureLogs} />
            <Card><CardHeader><CardTitle>Add log</CardTitle></CardHeader><CardContent><HealthLogForm members={data.members} /></CardContent></Card>
          </div>
        </TabsContent>
        <TabsContent value="medicine">
          <div className="grid gap-4 xl:grid-cols-[1fr_380px]">
            <MedicineAlerts medicineLogs={data.medicineLogs} />
            <Card><CardHeader><CardTitle>Log medicine</CardTitle></CardHeader><CardContent><MedicineLogForm members={data.members} /></CardContent></Card>
          </div>
        </TabsContent>
        <TabsContent value="doctors">
          <div className="grid gap-4 xl:grid-cols-[1fr_380px]">
            <ActivityList doctorVisits={data.doctorVisits} documents={[]} healthLogs={[]} medicineLogs={[]} temperatureLogs={[]} />
            <Card><CardHeader><CardTitle>Add doctor visit</CardTitle></CardHeader><CardContent><DoctorVisitForm members={data.members} /></CardContent></Card>
          </div>
        </TabsContent>
        <TabsContent value="documents">
          <div className="grid gap-4 xl:grid-cols-[1fr_380px]">
            <ActivityList doctorVisits={[]} documents={data.documents} healthLogs={[]} medicineLogs={[]} temperatureLogs={[]} />
            <Card><CardHeader><CardTitle>Upload document</CardTitle></CardHeader><CardContent><DocumentUploadForm members={data.members} /></CardContent></Card>
          </div>
        </TabsContent>
        <TabsContent value="trends">
          <Card>
            <CardHeader>
              <CardTitle>Trends</CardTitle>
              <CardDescription>Trend charts will summarize logged vitals, mood, pain, medicine, and visits as data grows.</CardDescription>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">Add health logs to populate this section.</CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
