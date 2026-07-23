import { describe, it, expect } from "vitest";
import { SUPPORTED_LANGS, languageLabel } from "../lib/i18n";

describe("languageLabel", () => {
  it("returns the human label for a known code (case-insensitive)", () => {
    expect(languageLabel("ta")).toContain("Tamil");
    expect(languageLabel("HI")).toContain("Hindi");
  });
  it("falls back to the upper-cased code for an unknown language", () => {
    expect(languageLabel("xx")).toBe("XX");
  });
  it("ships the core Indian languages + English", () => {
    const codes = SUPPORTED_LANGS.map((l) => l.code);
    expect(codes).toEqual(expect.arrayContaining(["en", "hi", "ta"]));
  });
});
