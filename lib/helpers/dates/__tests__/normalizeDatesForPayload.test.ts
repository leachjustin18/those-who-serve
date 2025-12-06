import { describe, it, expect } from "vitest";

import { normalizeDatesForPayload } from "@/lib/helpers/dates";

describe("normalizeDatesForPayload", () => {
  it("returns an empty array when no dates are provided", () => {
    expect(normalizeDatesForPayload()).toEqual([]);
  });

  it("converts Date instances and ISO strings to ISO strings", () => {
    const isoString = "2024-02-01T00:00:00.000Z";
    const normalized = normalizeDatesForPayload([
      new Date("2024-01-31T18:30:00.000Z"),
      isoString,
      new Date("2024-02-05T00:00:00.000Z").toISOString(),
    ]);

    expect(normalized).toEqual([
      "2024-01-31T18:30:00.000Z",
      "2024-02-01T00:00:00.000Z",
      "2024-02-05T00:00:00.000Z",
    ]);
  });
});
