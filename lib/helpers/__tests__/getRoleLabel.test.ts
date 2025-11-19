import { describe, expect, it } from "vitest";
import { getRoleLabel } from "../getRoleLabel";

describe("getRoleLabel", () => {
  it("should return the correct label for a given role", () => {
    expect(getRoleLabel("morning_singing")).toBe("Morning Singing");
    expect(getRoleLabel("evening_prayers")).toBe("Evening Prayers");
    expect(getRoleLabel("devotional")).toBe("Devotional");
  });

  it("should return the role given if it is not found", () => {
    expect(getRoleLabel("prayer")).toBe("prayer");
    expect(getRoleLabel("singing")).toBe("singing");
  });

  it("should not return the role given if it is not found", () => {
    expect(getRoleLabel("prayer")).not.toBe("Morning Prary");
    expect(getRoleLabel("singing")).not.toBe("Evening Singing");
  });
});
