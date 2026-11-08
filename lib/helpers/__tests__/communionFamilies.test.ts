import { describe, expect, it } from "vitest";
import {
  getCommunionFamilyName,
  selectNextCommunionFamily,
} from "@/lib/helpers/communionFamilies";

const families = [
  { id: "smith", familyName: "Smith Family", lastServed: 200 },
  { id: "jones", familyName: "Jones Family", lastServed: 100 },
  { id: "adams", familyName: "Adams Family" },
];

describe("communion family scheduling", () => {
  it("selects a family that has never served before the others", () => {
    expect(selectNextCommunionFamily(families)?.id).toBe("adams");
  });

  it("selects the least recently served family", () => {
    expect(selectNextCommunionFamily(families.slice(0, 2))?.id).toBe("jones");
  });

  it("resolves IDs while preserving legacy schedule text", () => {
    expect(getCommunionFamilyName("smith", families)).toBe("Smith Family");
    expect(getCommunionFamilyName("Legacy Family", families)).toBe("Legacy Family");
  });
});
