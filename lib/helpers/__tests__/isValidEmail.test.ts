import { isValidEmail } from "../validateFields";

describe("isValidEmail", () => {
  it("returns false for empty/undefined values", () => {
    expect(isValidEmail("")).toBe(false);
    expect(isValidEmail(undefined)).toBe(false);
    expect(isValidEmail(null)).toBe(false);
  });

  it("validates well-formed email addresses", () => {
    expect(isValidEmail("user@example.com")).toBe(true);
    expect(isValidEmail("user.name+tag@sub.domain.co")).toBe(true);
  });

  it("rejects invalid email formats", () => {
    expect(isValidEmail("invalid@")).toBe(false);
    expect(isValidEmail("no-at-symbol.com")).toBe(false);
  });
});
