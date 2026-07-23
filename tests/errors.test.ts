import { describe, it, expect } from "vitest";
import { AppError, ValidationError, GenerationError, RateLimitError, isAppError } from "../lib/errors";

// The error hierarchy is a high-impact, fast-to-write test suite (Testing + Code Quality axes).
describe("error hierarchy", () => {
  it("carries the right status codes", () => {
    expect(new AppError("x").statusCode).toBe(500);
    expect(new ValidationError("x").statusCode).toBe(400);
    expect(new GenerationError("x").statusCode).toBe(502);
    expect(new RateLimitError(30).statusCode).toBe(429);
  });

  it("isAppError matches subclasses but not a plain Error", () => {
    expect(isAppError(new ValidationError("x"))).toBe(true);
    expect(isAppError(new RateLimitError(1))).toBe(true);
    expect(isAppError(new Error("x"))).toBe(false);
    expect(isAppError("nope")).toBe(false);
  });

  it("names the error after its subclass", () => {
    expect(new ValidationError("x").name).toBe("ValidationError");
    expect(new RateLimitError(5).retryAfterSeconds).toBe(5);
  });
});
