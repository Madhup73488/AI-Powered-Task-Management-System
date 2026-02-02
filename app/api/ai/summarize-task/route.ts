import { groq } from "@ai-sdk/groq";
import { generateText } from "ai";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { description } = await req.json();

    if (!description || description.trim().length === 0) {
      return NextResponse.json(
        { error: "Description is required" },
        { status: 400 },
      );
    }

    const { text } = await generateText({
      model: groq("llama-3.3-70b-versatile"),
      prompt: `Summarize the following task description into a concise summary (max 2-3 sentences). Focus on the key objectives and deliverables:\n\n${description}`,
      temperature: 0.7,
    });

    return NextResponse.json({ summary: text });
  } catch (error) {
    console.error("Error generating summary:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Failed to generate summary",
      },
      { status: 500 },
    );
  }
}
