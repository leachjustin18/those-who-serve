import { describe, it, expect } from "vitest";

import { formatReadableDate } from "@/lib/helpers/dates";

describe("formatReadableDate", () => {
  it("formats a Date instance into a readable MMM d, yyyy string", () => {
    const formatted = formatReadableDate(new Date("2024-05-10T12:00:00.000Z"));
    expect(formatted).toMatch(/^[A-Z][a-z]{2} \d{1,2}, \d{4}$/);
  });

  it("normalizes ISO strings to the same formatted value as Date instances", () => {
    const iso = "2024-12-25T12:00:00.000Z";
    expect(formatReadableDate(iso)).toBe(formatReadableDate(new Date(iso)));
  });
});
