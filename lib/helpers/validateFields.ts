import validator from "validator";
import {
  NAME_ALLOWED_PATTERN,
  NAME_PATTERN_MESSAGE,
  NOTES_MAX_LENGTH,
} from "@/lib/constants";
import type { TFormInputs } from "@/types";

type TextValidationOptions = {
  min?: number;
  max?: number;
  allowedPattern?: RegExp;
  patternMessage?: string;
};

const sanitizeValue = (value?: string | null) => value?.trim() ?? "";

export const validateRequiredTextField = (
  value: string,
  fieldLabel: string,
  options?: TextValidationOptions,
) => {
  const trimmedValue = sanitizeValue(value);
  const min = options?.min ?? 2;
  const max = options?.max ?? 100;

  if (validator.isEmpty(trimmedValue)) {
    return `${fieldLabel} is required`;
  }

  if (!validator.isLength(trimmedValue, { min, max })) {
    return `${fieldLabel} must be between ${min} and ${max} characters`;
  }

  if (
    options?.allowedPattern &&
    !options.allowedPattern.test(trimmedValue)
  ) {
    return options.patternMessage ?? `${fieldLabel} contains invalid characters`;
  }

  return true;
};

export const validateOptionalTextField = (
  value: string | undefined,
  fieldLabel: string,
  options?: TextValidationOptions,
) => {
  const trimmedValue = sanitizeValue(value);
  const max = options?.max ?? NOTES_MAX_LENGTH;

  if (validator.isEmpty(trimmedValue)) {
    return true;
  }

  const min = options?.min ?? 0;
  if (!validator.isLength(trimmedValue, { min, max })) {
    if (min > 0) {
      return `${fieldLabel} must be between ${min} and ${max} characters`;
    }
    return `${fieldLabel} must be ${max} characters or fewer`;
  }

  if (
    options?.allowedPattern &&
    !options.allowedPattern.test(trimmedValue)
  ) {
    return options.patternMessage ?? `${fieldLabel} contains invalid characters`;
  }

  return true;
};

export const validateEmailField = (value: string, fieldLabel = "Email") => {
  const trimmedValue = sanitizeValue(value);

  if (validator.isEmpty(trimmedValue)) {
    return `${fieldLabel} is required`;
  }

  if (!validator.isEmail(trimmedValue, { allow_utf8_local_part: false })) {
    return `Enter a valid ${fieldLabel.toLowerCase()} address`;
  }

  return true;
};

type IdentityValidationField = Pick<
  TFormInputs,
  "firstName" | "lastName" | "email" | "notes"
>;

export type FieldValidationResult<TField extends keyof IdentityValidationField> =
  {
    field: TField;
    result: true | string;
  };

export const buildIdentityFieldValidations = (
  values: IdentityValidationField,
): FieldValidationResult<keyof IdentityValidationField>[] => [
  {
    field: "firstName",
    result: validateRequiredTextField(values.firstName, "First name", {
      min: 2,
      max: 60,
      allowedPattern: NAME_ALLOWED_PATTERN,
      patternMessage: NAME_PATTERN_MESSAGE,
    }),
  },
  {
    field: "lastName",
    result: validateRequiredTextField(values.lastName, "Last name", {
      min: 2,
      max: 60,
      allowedPattern: NAME_ALLOWED_PATTERN,
      patternMessage: NAME_PATTERN_MESSAGE,
    }),
  },
  {
    field: "email",
    result: validateEmailField(values.email),
  },
  {
    field: "notes",
    result: validateOptionalTextField(values.notes, "Notes", {
      max: NOTES_MAX_LENGTH,
    }),
  },
];
