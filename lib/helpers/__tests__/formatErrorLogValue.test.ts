import { describe, expect, it } from "vitest";
import { formatErrorLogValue } from "../formatErrorLogValue";

describe("formatErrorLogValue", () => {
  it("formats structured error details as text", () => {
    expect(formatErrorLogValue({ error: "Message rejected" })).toBe(
      '{\n  "error": "Message rejected"\n}',
    );
  });

  it("preserves strings and applies fallbacks to missing values", () => {
    expect(formatErrorLogValue("rejected")).toBe("rejected");
    expect(formatErrorLogValue(null, "Unknown")).toBe("Unknown");
  });
});
