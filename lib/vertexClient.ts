import { GoogleGenAI } from "@google/genai";
import type { Needs, Match } from "./types";

const MODEL = "gemini-2.5-flash";

let _ai: GoogleGenAI | null = null;
function client(): GoogleGenAI {
  if (!_ai) {
    _ai = new GoogleGenAI({
      vertexai: true,
      project: process.env.GOOGLE_CLOUD_PROJECT,
      location: process.env.GOOGLE_CLOUD_LOCATION ?? "us-central1",
    });
  }
  return _ai;
}

/** Safe parse: strip fences, JSON.parse, and NEVER throw — return the fallback on bad output. */
function safeParse<T>(text: string | undefined, fallback: T): T {
  try {
    return JSON.parse((text ?? "").replace(/```json|```/g, "").trim()) as T;
  } catch {
    return fallback;
  }
}

/** EXTRACT: pull structured needs out of the messy message. */
export async function extractNeeds(text: string): Promise<Needs> {
  const r = await client().models.generateContent({
    model: MODEL,
    contents:
      `Extract the person's needs from this message as JSON with keys: ` +
      `categories (string[]), area (string or null), budget (number or null), constraints (string[]). ` +
      `Invent nothing not in the message.\n\nMessage:\n${text}`,
    config: { responseMimeType: "application/json" },
  });
  return safeParse<Needs>(r.text, { categories: [], constraints: [] });
}

/** REASON: add a one-line "why" to each candidate without reordering or inventing. */
export async function reason(needs: Needs, matches: Match[]): Promise<Match[]> {
  if (matches.length === 0) return matches;
  const r = await client().models.generateContent({
    model: MODEL,
    contents:
      `Given these needs ${JSON.stringify(needs)} and these candidate services ` +
      `${JSON.stringify(matches.map((m) => ({ id: m.id, name: m.name, category: m.category })))}, ` +
      `return a JSON array of {id, why} with one short reason each. Do not reorder or invent.`,
    config: { responseMimeType: "application/json" },
  });
  const reasons = safeParse<{ id: string; why: string }[]>(r.text, []);
  const byId = new Map(reasons.map((x) => [x.id, x.why]));
  return matches.map((m) => ({ ...m, why: byId.get(m.id) }));
}
