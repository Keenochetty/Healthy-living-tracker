import { getJobTypeInstruction, getSystemPrompt } from "./prompts.ts";

type CallOpenAiExtractionInput = {
  fileUrl?: string;
  inputType: "text" | "image" | "document";
  jobType: string;
  textInput?: string;
};

export async function callOpenAiExtraction({
  fileUrl,
  inputType,
  jobType,
  textInput,
}: CallOpenAiExtractionInput) {
  const apiKey = Deno.env.get("OPENAI_API_KEY");

  if (!apiKey) {
    throw new Error("OPENAI_API_KEY is not configured.");
  }

  const model = Deno.env.get("OPENAI_MODEL") ?? "gpt-5.4-mini";
  const userInput = [
    getJobTypeInstruction(jobType),
    `Input type: ${inputType}`,
    textInput ? `Text input:\n${textInput}` : "",
    fileUrl ? `File URL for server-side retrieval: ${fileUrl}` : "",
    "Return structured draft JSON only with draftType, title, summary, fields, suggestedActions, remindersDraft, warnings, confidence, and estimateOnly when relevant.",
  ]
    .filter(Boolean)
    .join("\n\n");

  const response = await fetch("https://api.openai.com/v1/responses", {
    body: JSON.stringify({
      input: [
        {
          content: [{ text: getSystemPrompt(), type: "input_text" }],
          role: "system",
        },
        {
          content: [{ text: userInput, type: "input_text" }],
          role: "user",
        },
      ],
      model,
      text: {
        format: {
          type: "json_object",
        },
      },
    }),
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    method: "POST",
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`OpenAI extraction failed: ${errorText}`);
  }

  const data = await response.json();
  const outputText =
    data.output_text ??
    data.output
      ?.flatMap(
        (item: { content?: Array<{ text?: string }> }) => item.content ?? [],
      )
      ?.map((item: { text?: string }) => item.text)
      ?.filter(Boolean)
      ?.join("\n");

  if (!outputText) {
    throw new Error("OpenAI response did not include JSON text output.");
  }

  return JSON.parse(outputText);
}
