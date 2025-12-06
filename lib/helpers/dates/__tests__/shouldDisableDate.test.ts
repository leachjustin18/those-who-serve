import { describe, expect, it, beforeAll, afterAll, vi } from "vitest";

import { shouldDisableDate } from "@/lib/helpers/dates";

describe("shouldDisableDate", () => {
  const fixedNow = new Date("2024-01-01T00:00:00.000Z");

  beforeAll(() => {
    vi.useFakeTimers();
    vi.setSystemTime(fixedNow);
  });

  afterAll(() => {
    vi.useRealTimers();
  });

  it("returns false for future Sundays and Wednesdays", () => {
    // January 3rd, 2024 is a Wednesday
    const wednesday = new Date("2024-01-03T12:00:00.000Z");
    expect(shouldDisableDate(wednesday)).toBe(false);

    // January 7th, 2024 is a Sunday
    const sunday = new Date("2024-01-07T12:00:00.000Z");
    expect(shouldDisableDate(sunday)).toBe(false);
  });

  it("disables dates that are not in the future", () => {
    const sameDay = new Date("2024-01-01T15:00:00.000Z");
    expect(shouldDisableDate(sameDay)).toBe(true);
  });

  it("disables future dates that fall on unsupported days", () => {
    // January 4th, 2024 is a Thursday
    const thursday = new Date("2024-01-04T12:00:00.000Z");
    expect(shouldDisableDate(thursday)).toBe(true);
  });

  it("returns false when no date is provided", () => {
    expect(shouldDisableDate(undefined as unknown as Date)).toBe(false);
  });
});
