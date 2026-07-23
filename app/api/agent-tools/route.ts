import { NextRequest, NextResponse } from "next/server";
import { runAgentWithTools } from "@/lib/gemini";

// Demonstrates tool-calling: the model calls functions (see lib/tools.ts) instead of guessing.
// Returns the final text PLUS a trace of which tools were called (show the trace in the UI = visible
// elegance). This is the reference the /promptwars-brief "tool-use" suggestion lands on.
export async function POST(req: NextRequest) {
  try {
    const { prompt } = (await req.json()) as { prompt?: string };
    if (!prompt) return NextResponse.json({ error: "prompt is required" }, { status: 400 });
    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json({ error: "Add GEMINI_API_KEY to .env.local." }, { status: 500 });
    }
    const { text, trace } = await runAgentWithTools(prompt);
    return NextResponse.json({ text, trace, source: "tools" });
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : "tool run failed" }, { status: 500 });
  }
}
