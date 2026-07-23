# PromptWars — Build Environment (the "arena")

This is a **clean, pre-prepared build environment** for the PromptWars in-person hackathon.
It holds only the *outcomes* of prior research — the stack, the wiring, and the build rules —
so that on the day you build the *solution*, not the plumbing.

> A fresh Claude Code / Antigravity / any-IDE session working in this folder needs no other context.
> Everything required is here: read `AGENTS.md` first, then `SCORING.md` and `DAY-OF-RUNBOOK.md`.

## The day-of workflow (build in Claude Code; Antigravity is backup only)
Full steps in **`DAY-OF-RUNBOOK.md`**. In short:
1. **Confirm the tool rule at check-in.** Any tool → build in **Claude Code** (the plan). Only if
   Antigravity is explicitly mandated do you switch to the **backup** track — the kit works identically either way.
2. **Duplicate this folder** (keep a pristine master).
3. Run `REQUIREMENT-TO-PLAN.md` on the secret challenge → one sharp problem, one core flow, a lean 1-2 call pipeline, what NOT to build.
4. Build the golden flow to the six axes in `SCORING.md`.
5. `npm test`, then `npm run dev` **in your own terminal**, demo locally, pitch.

## What's already wired
| Path | What it is |
|------|-----------|
| `AGENTS.md` | The build rules — narrow scope, rubric, stack, definition of done. Read first. |
| `CLAUDE.md` | Claude Code entry (imports `AGENTS.md` + Claude-specific notes). Same rules, both tools. |
| `SCORING.md` | How PromptWars scores you — the 6 automated axes + how to win each. |
| `DAY-OF-RUNBOOK.md` | The two-track (Antigravity / Claude Code) day-of decision + steps. |
| `.agents/skills/` · `.claude/skills/` | Build-time skills, mirrored so both tools auto-load them. |
| `lib/gemini.ts` | Gemini helper: `runAgentStep`, `runAgentJSON`. Text + vision. |
| `app/api/agent/route.ts` | Server endpoint that hides the key and runs the agent. |
| `app/AgentDemo.tsx` | A working agent panel (proves the pipeline). Reshape into your flow. |
| `app/page.tsx` | The shell. Reshape the hero + panel. |
| `.env.example` | Copy to `.env.local`, add `GEMINI_API_KEY`. |
| `REQUIREMENT-TO-PLAN.md` | The prompt to turn the secret challenge into a build plan. |

## Setup (do once at home, before 25 July)
```
cp .env.example .env.local     # paste your Gemini key
npm run dev                    # http://localhost:3000 — you should see the shell + a working agent
```
Confirm the shell runs and the "Run the agent" button returns a real answer. Then you know the
whole pipeline is good, and the day is only about the flow.

## Stack
Next.js 16 (App Router) · TypeScript · Tailwind · `@google/genai` (Gemini). One framework = frontend
+ backend + AI, so there is no second server to babysit under the clock.
