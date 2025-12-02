import {
  validateRequiredTextField,
  validateOptionalTextField,
  validateEmailField,
  buildIdentityFieldValidations,
} from "../validateFields";
import { NOTES_MAX_LENGTH } from "@/lib/constants";

describe("validateRequiredTextField", () => {
  it("returns an error when the field is empty", () => {
    const result = validateRequiredTextField("   ", "First name");

    expect(result).toBe("First name is required");
  });

  it("enforces the provided length constraints", () => {
    const result = validateRequiredTextField("A", "Nickname", {
      min: 2,
      max: 4,
    });

    expect(result).toBe("Nickname must be between 2 and 4 characters");
  });

  it("rejects values that do not match the allowed pattern", () => {
    const result = validateRequiredTextField("John!", "First name", {
      allowedPattern: /^[A-Za-z ]+$/,
    });

    expect(result).toBe("First name contains invalid characters");
  });

  it("returns true for a valid value", () => {
    const result = validateRequiredTextField("John", "First name");

    expect(result).toBe(true);
  });
});

describe("validateOptionalTextField", () => {
  it("allows empty optional values", () => {
    const result = validateOptionalTextField("   ", "Notes");

    expect(result).toBe(true);
  });

  it("enforces the maximum length if the field has no minimum", () => {
    const value = "a".repeat(NOTES_MAX_LENGTH + 1);

    const result = validateOptionalTextField(value, "Notes");

    expect(result).toBe(`Notes must be ${NOTES_MAX_LENGTH} characters or fewer`);
  });

  it("honors custom minimum requirements", () => {
    const result = validateOptionalTextField("x", "Notes", {
      min: 2,
      max: 20,
    });

    expect(result).toBe("Notes must be between 2 and 20 characters");
  });
});

describe("validateEmailField", () => {
  it("requires a non-empty value", () => {
    const result = validateEmailField("", "Email");

    expect(result).toBe("Email is required");
  });

  it("returns an error for invalid email addresses", () => {
    const result = validateEmailField("invalid@", "Email");

    expect(result).toBe("Enter a valid email address");
  });

  it("returns true for valid email addresses", () => {
    const result = validateEmailField("user@example.com", "Email");

    expect(result).toBe(true);
  });
});

describe("buildIdentityFieldValidations", () => {
  it("runs validations for the supported fields", () => {
    const values = {
      firstName: "John",
      lastName: "Doe",
      email: "john@example.com",
      notes: "Some notes",
    };

    const result = buildIdentityFieldValidations(values);

    expect(result).toEqual([
      { field: "firstName", result: true },
      { field: "lastName", result: true },
      { field: "email", result: true },
      { field: "notes", result: true },
    ]);
  });
});
