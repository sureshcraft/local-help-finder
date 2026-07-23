import { describe, it, expect } from "vitest";
import { parseEnvelope } from "../lib/schema";

// The strict-JSON envelope is the backbone of every agent response. It must survive fenced
// output and garbage without ever throwing.
describe("parseEnvelope", () => {
  it("parses clean JSON and applies array defaults", () => {
    const env = parseEnvelope('{"answer":"hello"}');
    expect(env.answer).toBe("hello");
    expect(env.cards).toEqual([]);
    expect(env.actions).toEqual([]);
    expect(env.rejected_alternatives).toEqual([]);
    expect(env.language).toBe("en");
  });

  it("strips ```json fences before parsing", () => {
    const raw = '```json\n{"answer":"fenced","language":"ta"}\n```';
    const env = parseEnvelope(raw);
    expect(env.answer).toBe("fenced");
    expect(env.language).toBe("ta");
  });

  it("keeps cards and actions when present", () => {
    const env = parseEnvelope(
      '{"answer":"a","cards":[{"title":"t","detail":"d"}],"actions":["next"]}'
    );
    expect(env.cards).toHaveLength(1);
    expect(env.cards[0]).toEqual({ title: "t", detail: "d" });
    expect(env.actions).toEqual(["next"]);
  });

  it("falls back safely on non-JSON instead of throwing", () => {
    const env = parseEnvelope("the model just wrote prose");
    expect(env.answer).toBe("the model just wrote prose");
    expect(env.cards).toEqual([]);
    expect(env.language).toBe("en");
  });
});
