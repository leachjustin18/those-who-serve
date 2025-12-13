const SAFE_ID_REGEX = /^[A-Za-z0-9_-]{1,64}$/;

export function isSafeId(value: unknown): value is string {
  if (typeof value !== "string") {
    return false;
  }
  return SAFE_ID_REGEX.test(value);
}

export function assertSafeId(value: unknown): asserts value is string {
  if (!isSafeId(value)) {
    throw new Error("Invalid ID format");
  }
}
