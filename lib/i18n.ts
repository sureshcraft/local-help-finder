import { generate } from "./gemini";

// Multilingual output (Accessibility + Problem-alignment). Nearly every civic/assistant winner shipped
// EN + an Indian language. Two ways to use it:
//   1) Pass `targetLanguage` to `runAgentEnvelope` → the model answers in that language directly (1 call).
//   2) `translateText()` to localise arbitrary text on demand (e.g. a card) via Gemini.
// Plus `googleActions.translateUrl()` for a zero-cost "open in Google Translate" link.

export const SUPPORTED_LANGS: Array<{ code: string; label: string }> = [
  { code: "en", label: "English" },
  { code: "hi", label: "हिन्दी (Hindi)" },
  { code: "ta", label: "தமிழ் (Tamil)" },
  { code: "te", label: "తెలుగు (Telugu)" },
  { code: "ml", label: "മലയാളം (Malayalam)" },
  { code: "kn", label: "ಕನ್ನಡ (Kannada)" },
];

/** Human label for a language code (falls back to the upper-cased code). */
export function languageLabel(code: string): string {
  return SUPPORTED_LANGS.find((l) => l.code === code.toLowerCase())?.label ?? code.toUpperCase();
}

/** On-demand translation of any text via Gemini. Returns the original on error (never throws). */
export async function translateText(text: string, targetLang: string): Promise<string> {
  if (!text.trim() || targetLang.toLowerCase() === "en") return text;
  try {
    const out = await generate([
      { role: "user", parts: [{ text: `Translate the following into ${languageLabel(targetLang)}. Return ONLY the translation, no notes or quotes:\n\n${text}` }] },
    ]);
    return out.trim() || text;
  } catch {
    return text;
  }
}
