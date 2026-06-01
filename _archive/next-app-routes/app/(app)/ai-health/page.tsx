import { AiChatForm } from "@/components/forms/ai-chat-form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getAppData } from "@/lib/health/data";

export default async function AiHealthPage() {
  const data = await getAppData();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">AI Health Search</h1>
        <p className="text-sm text-muted-foreground">Educational guidance with family member context, category filters, previous chats, and document attachments.</p>
      </div>
      <div className="grid gap-4 xl:grid-cols-[420px_1fr]">
        <Card>
          <CardHeader>
            <CardTitle>Ask AI</CardTitle>
            <CardDescription>Requires server-side OPENAI_API_KEY. ChatGPT Free is not an app API backend.</CardDescription>
          </CardHeader>
          <CardContent>
            <AiChatForm chats={data.aiChats} documents={data.documents} members={data.members} />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Previous chats</CardTitle>
            <CardDescription>Stored AI health conversations for this family.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {data.aiChats.length === 0 ? <p className="text-sm text-muted-foreground">No chats yet.</p> : null}
            {data.aiChats.map((chat) => (
              <div className="rounded-md border p-3" key={chat.id}>
                <p className="font-medium">{chat.title}</p>
                <p className="text-sm text-muted-foreground">Updated {new Date(chat.updated_at).toLocaleString()}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
