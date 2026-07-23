// Structured JSON logging — Google Cloud Run auto-ingests `severity` + fields (Code Quality /
// observability). Use instead of bare console.log so logs are queryable in production.

type Level = "INFO" | "WARN" | "ERROR";

function log(level: Level, message: string, data?: Record<string, unknown>) {
  console.log(JSON.stringify({ severity: level, message, timestamp: new Date().toISOString(), ...data }));
}

export const logInfo = (message: string, data?: Record<string, unknown>) => log("INFO", message, data);
export const logWarn = (message: string, data?: Record<string, unknown>) => log("WARN", message, data);
export const logError = (message: string, data?: Record<string, unknown>) => log("ERROR", message, data);
