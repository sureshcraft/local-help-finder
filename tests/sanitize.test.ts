import { describe, it, expect } from "vitest";
import { sanitizeInput } from "../lib/prompts";

// Defence-in-depth: user text is untrusted, sanitise before it enters a prompt (Security axis).
describe("sanitizeInput", () => {
  it("strips script tags and code fences", () => {
    const out = sanitizeInput("hello ```json``` <script>alert(1)</script> world");
    expect(out).not.toContain("<script");
    expect(out).not.toContain("```");
  });
  it("removes control characters", () => {
    const dirty = "a" + String.fromCharCode(0) + "b" + String.fromCharCode(7) + "c";
    expect(sanitizeInput(dirty)).toBe("abc");
  });
  it("caps length", () => {
    expect(sanitizeInput("x".repeat(5000), 100).length).toBe(100);
  });
});
