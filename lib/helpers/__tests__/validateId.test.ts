import { describe, expect, it } from "vitest";

import { assertSafeId, isSafeId } from "../validateId";

describe("validateId helpers", () => {
  it("accepts alphanumeric, dash, and underscore IDs up to 64 chars", () => {
    expect(isSafeId("abcDEF123")).toBe(true);
    expect(isSafeId("man_01")).toBe(true);
    expect(isSafeId("schedule-2024_01")).toBe(true);
    expect(isSafeId("a".repeat(64))).toBe(true);
  });

  it("rejects invalid formats or lengths", () => {
    expect(isSafeId("")).toBe(false);
    expect(isSafeId("with space")).toBe(false);
    expect(isSafeId("../etc/passwd")).toBe(false);
    expect(isSafeId("has/slash")).toBe(false);
    expect(isSafeId("dot.name")).toBe(false);
    expect(isSafeId("a".repeat(65))).toBe(false);
    expect(isSafeId(undefined)).toBe(false);
    expect(isSafeId(null)).toBe(false);
  });

  it("asserts and throws on invalid IDs", () => {
    expect(() => assertSafeId("valid_id")).not.toThrow();
    expect(() => assertSafeId("invalid/id")).toThrow("Invalid ID format");
  });
});
