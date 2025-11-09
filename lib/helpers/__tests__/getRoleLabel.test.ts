import { describe, expect, it } from "vitest";
import { useRoleLabel } from "../getRoleLabel";

describe("useRoleLabel", () => {
  it("should return the correct label for a given role", () => {
    expect(useRoleLabel("morning_singing")).toBe("Morning Singing");
    expect(useRoleLabel("evening_prayers")).toBe("Evening Prayers");
    expect(useRoleLabel("devotional")).toBe("Devotional");
  });

  it("should return the role given if it is not found", () => {
    expect(useRoleLabel("prayer")).toBe("prayer");
    expect(useRoleLabel("singing")).toBe("singing");
  });

  it("should not return the role given if it is not found", () => {
    expect(useRoleLabel("prayer")).not.toBe("Morning Prary");
    expect(useRoleLabel("singing")).not.toBe("Evening Singing");
  });
});
