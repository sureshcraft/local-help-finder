import { describe, it, expect } from "vitest";
import { gmailDraftUrl, calendarEventUrl, mapsSearchUrl, googleSearchUrl, translateUrl, youtubeSearchUrl } from "../lib/googleActions";

// "AI → real Google action" deep-links (no OAuth). URLs must be well-formed and encoded.
describe("gmailDraftUrl", () => {
  it("builds a compose URL with subject and body", () => {
    const url = gmailDraftUrl({ subject: "Hi there", body: "line one" });
    expect(url.startsWith("https://mail.google.com/mail/?")).toBe(true);
    const q = new URL(url).searchParams;
    expect(q.get("view")).toBe("cm");
    expect(q.get("su")).toBe("Hi there");
    expect(q.get("body")).toBe("line one");
  });
});

describe("calendarEventUrl", () => {
  it("builds a TEMPLATE event with a title", () => {
    const q = new URL(calendarEventUrl({ title: "Follow-up" })).searchParams;
    expect(q.get("action")).toBe("TEMPLATE");
    expect(q.get("text")).toBe("Follow-up");
    expect(q.get("dates")).toBeNull();
  });

  it("includes dates only when both start and end are given", () => {
    const q = new URL(
      calendarEventUrl({ title: "T", start: "20260725T093000Z", end: "20260725T100000Z" })
    ).searchParams;
    expect(q.get("dates")).toBe("20260725T093000Z/20260725T100000Z");
  });
});

describe("mapsSearchUrl", () => {
  it("encodes the query", () => {
    const url = mapsSearchUrl("auto driver jobs in Chennai");
    expect(url).toContain("query=auto%20driver%20jobs%20in%20Chennai");
  });
});

describe("extra Google-service deep-links", () => {
  it("googleSearchUrl encodes the query", () => {
    expect(googleSearchUrl("best dosa near me")).toContain("search?q=best%20dosa%20near%20me");
  });
  it("translateUrl sets source, target, and text", () => {
    const q = new URL(translateUrl("hello", "ta")).searchParams;
    expect(q.get("sl")).toBe("auto");
    expect(q.get("tl")).toBe("ta");
    expect(q.get("text")).toBe("hello");
  });
  it("youtubeSearchUrl encodes the query", () => {
    expect(youtubeSearchUrl("how to fix ac")).toContain("search_query=how%20to%20fix%20ac");
  });
});
