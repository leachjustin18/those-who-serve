export function formatErrorLogValue(value: unknown, fallback = ""): string {
  if (value === null || value === undefined || value === "") {
    return fallback;
  }

  if (typeof value === "string") {
    return value;
  }

  if (typeof value === "object") {
    try {
      return JSON.stringify(value, null, 2) || fallback;
    } catch {
      return String(value);
    }
  }

  return String(value);
}
