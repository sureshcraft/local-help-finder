// Typed error hierarchy (Code Quality axis). Throw these anywhere; the API layer maps them to the
// right HTTP status via `isAppError`. Pattern from the PromptWars Bengaluru #1 winning build.

export class AppError extends Error {
  constructor(message: string, public statusCode = 500) {
    super(message);
    this.name = this.constructor.name;
  }
}

/** Bad/malformed input → 400. */
export class ValidationError extends AppError {
  constructor(message: string, public details = "") {
    super(message, 400);
  }
}

/** The model returned something unusable → 502. */
export class GenerationError extends AppError {
  constructor(message: string) {
    super(message, 502);
  }
}

/** Too many requests → 429. */
export class RateLimitError extends AppError {
  constructor(public retryAfterSeconds: number) {
    super("Too many requests", 429);
  }
}

export const isAppError = (e: unknown): e is AppError => e instanceof AppError;
