import { describe, it, expect } from "vitest";

import { isSameDay } from "@/lib/helpers/dates";

describe("isSameDay", () => {
  it("returns true when both values fall on the same calendar day", () => {
    const morning = new Date("2024-03-15T12:00:00.000Z");
    const evening = new Date("2024-03-15T18:00:00.000Z");

    expect(isSameDay(morning, evening)).toBe(true);
  });

  it("returns false when values fall on different days", () => {
    const first = new Date("2024-03-15T00:00:00.000Z");
    const second = new Date("2024-03-18T00:00:00.000Z");

    expect(isSameDay(first, second)).toBe(false);
  });
});
