import { ROLE_OPTIONS } from "@/lib/constants";

/**
 * Returns the label for a given role.
 * @param role The role to get the label for.
 * @returns The label for the role.
 */
export const getRoleLabel = (role: string) =>
  ROLE_OPTIONS.find((option) => option.value === role)?.label ?? role;
