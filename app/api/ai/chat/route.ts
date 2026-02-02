import { groq } from "@ai-sdk/groq";
import { streamText } from "ai";
import { createClient } from "@supabase/supabase-js";

export const runtime = "edge";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
);

export async function POST(req: Request) {
  try {
    const { messages, userId } = await req.json();

    // Fetch user's tasks for context
    const { data: tasks, error } = await supabase
      .from("tasks")
      .select("title, description, status, priority, deadline, assigned_to")
      .or(`assigned_to.eq.${userId},created_by.eq.${userId}`)
      .order("created_at", { ascending: false })
      .limit(50);

    if (error) {
      console.error("Error fetching tasks:", error);
    }

    const taskContext = tasks
      ? `Here are the user's recent tasks:\n${tasks
          .map(
            (t, i) =>
              `${i + 1}. ${t.title} - Status: ${t.status}, Priority: ${t.priority}, Deadline: ${t.deadline || "Not set"}`,
          )
          .join("\n")}\n\n`
      : "";

    const systemPrompt = `You are a friendly and helpful AI assistant for a task management system. Your personality is warm, conversational, and supportive - like a helpful colleague or friend.

${taskContext}

IMPORTANT INTERACTION STYLE:
- When greeted (hi, hello, hey, etc.), respond warmly and naturally like a human would
- Use a conversational, friendly tone - not robotic or overly formal
- Show empathy and encouragement when discussing tasks
- Be personable and engaging, not just informative
- After greetings, you can mention tasks if relevant, but don't jump straight to business

When discussing tasks:
- Be concise but friendly
- Reference specific tasks when relevant
- Offer helpful suggestions and encouragement
- Format dates in a readable way (e.g., "January 7" not "2026-01-07")
- Use bullet points for lists when appropriate
- Acknowledge overdue tasks gently and offer to help

Current date: ${new Date().toLocaleDateString()}`;

    const result = await streamText({
      model: groq("llama-3.3-70b-versatile"),
      messages: [{ role: "system", content: systemPrompt }, ...messages],
      temperature: 0.7,
    });

    return result.toTextStreamResponse();
  } catch (error) {
    console.error("Error in chatbot:", error);
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : "An error occurred",
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      },
    );
  }
}
