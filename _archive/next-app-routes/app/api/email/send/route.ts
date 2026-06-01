import { NextResponse } from "next/server";
import { z } from "zod";
import { sendEmail } from "@/lib/email/email-service";
import { createClient } from "@/lib/supabase/server";

const emailSchema = z.object({
  to: z.string().email(),
  subject: z.string().min(1),
  html: z.string().min(1)
});

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const parsed = emailSchema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid email payload" }, { status: 400 });
  }

  const result = await sendEmail(parsed.data);
  return NextResponse.json(result, { status: result.ok ? 200 : 501 });
}
