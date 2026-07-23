import { runAgentEnvelope } from "./gemini";
import type { AgentEnvelope } from "./schema";

// Validator-in-the-loop (CookMate, stadium-ops): a DETERMINISTIC check drives a TARGETED
// re-prompt, bounded to a few tries. This is the real "self-correcting loop" — constraint
// satisfaction, not open-ended reflection.
export async function runWithValidator(
  userText: string,
  validate: (env: AgentEnvelope) => string | null, // return an issue string, or null if OK
  opts?: { maxRetries?: number; liveState?: string }
): Promise<AgentEnvelope> {
  const max = opts?.maxRetries ?? 3;
  let env = await runAgentEnvelope(userText, { liveState: opts?.liveState });
  for (let i = 0; i < max; i++) {
    const issue = validate(env);
    if (!issue) return env;
    env = await runAgentEnvelope(
      `${userText}\n\nThe previous answer had this problem: ${issue}\nReturn corrected JSON that fixes it.`,
      { liveState: opts?.liveState }
    );
  }
  return env; // best effort after retries
}
