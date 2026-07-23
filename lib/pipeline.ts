import { runAgentStep, runAgentEnvelope } from "./gemini";
import { sanitizeInput } from "./prompts";
import type { AgentEnvelope } from "./schema";

// VISIBLE multi-step agent (EXTRACT → REASON → GUARD → answer). This is the "architectural elegance"
// the pitch round rewards — real agent DEPTH, not a single call. It returns the intermediate `steps`
// so the UI can SHOW the reasoning. Each step is one Gemini call; rewrite the step prompts for your
// challenge on the day.
// ⚠️ This runs FOUR sequential Gemini calls — higher latency + rate-limit risk in a live demo. For most
// briefs, a LEANER variant is safer and looks just as deep: ONE structured-output call returning
// { reasoning_steps, ruled_out, core_data }, rendered as a "reasoning" panel. Use this 3-step version
// only when the brief genuinely needs staged reasoning; skip adversarial multi-persona setups live.

export type PipelineStep = { label: string; output: string };

export async function runExtractReasonGuard(
  userText: string,
  opts?: { domain?: string; targetLanguage?: string },
): Promise<{ steps: PipelineStep[]; envelope: AgentEnvelope }> {
  const input = sanitizeInput(userText);
  const domain = opts?.domain ?? "the user's problem";
  const steps: PipelineStep[] = [];

  // 1) EXTRACT — pull structured facts out of the messy input (no invention).
  const extract = await runAgentStep(
    `EXTRACT step. From the raw input below, list ONLY the concrete facts/entities relevant to ${domain}. Bullet list, invent nothing.\n\nINPUT:\n${input}`,
  );
  steps.push({ label: "EXTRACT", output: extract });

  // 2) REASON — decide the best action/answer from those facts.
  const reason = await runAgentStep(
    `REASON step. Given these extracted facts, reason step-by-step about the best action/answer for ${domain}. Be concise.\n\nFACTS:\n${extract}`,
  );
  steps.push({ label: "REASON", output: reason });

  // 3) GUARD — check for unsupported claims / invented numbers / unsafe advice before answering.
  const guard = await runAgentStep(
    `GUARD step. Review the reasoning for unsupported claims, invented numbers, or unsafe advice. List issues, or reply "OK" if clean.\n\nREASONING:\n${reason}`,
  );
  steps.push({ label: "GUARD", output: guard });

  // Final — a strict-JSON envelope grounded in the vetted reasoning (renders as cards).
  const envelope = await runAgentEnvelope(
    `Using this vetted reasoning, produce the final user-facing answer.\n\nREASONING:\n${reason}\n\nGUARD NOTES:\n${guard}`,
    { targetLanguage: opts?.targetLanguage },
  );
  return { steps, envelope };
}
