import { describe, it, expect } from "vitest";
import { tryDeterministic } from "../lib/deterministic";

// Deterministic-first: answer without the LLM whenever a rule can. Fast, reliable, cheap.
describe("tryDeterministic", () => {
  it("answers 'ping' from the deterministic engine (no LLM)", () => {
    const env = tryDeterministic("ping");
    expect(env).not.toBeNull();
    expect(env?.answer).toContain("pong");
  });

  it("is case-insensitive and trims whitespace", () => {
    expect(tryDeterministic("  PING  ")?.answer).toContain("pong");
  });

  it("returns null to fall through to the LLM for anything else", () => {
    expect(tryDeterministic("plan my week")).toBeNull();
  });
});
