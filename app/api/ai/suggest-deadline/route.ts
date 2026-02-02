import { groq } from "@ai-sdk/groq";
import { generateText } from "ai";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { title, description, priority } = await req.json();

    if (!title || !description) {
      return NextResponse.json(
        { error: "Title and description are required" },
        { status: 400 },
      );
    }

    const { text } = await generateText({
      model: groq("llama-3.3-70b-versatile"),
      prompt: `Based on the following task details, suggest a realistic deadline (return only a number of days from today):

Task Title: ${title}
Description: ${description}
Priority: ${priority || "medium"}

Consider:
- Task complexity and scope
- Priority level (high tasks should be completed sooner)
- Industry standards for similar tasks

Return ONLY a single number representing days from today (e.g., "3" for 3 days, "14" for 2 weeks).`,
      temperature: 0.5,
    });

    // Extract the number from the response
    const days = parseInt(text.trim());

    if (isNaN(days) || days < 1) {
      return NextResponse.json({ days: 7 }); // Default to 7 days
    }

    return NextResponse.json({ days: Math.min(days, 90) }); // Cap at 90 days
  } catch (error) {
    console.error("Error suggesting deadline:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Failed to suggest deadline",
      },
      { status: 500 },
    );
  }
}
