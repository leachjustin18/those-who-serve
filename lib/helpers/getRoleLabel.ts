import { ROLE_OPTIONS } from "@/lib/constants/roles";

export const useRoleLabel = (role: string) =>
  ROLE_OPTIONS.find((option) => option.value === role)?.label ?? role;
