import { ROLE_OPTIONS } from "@/lib/constants";

const servantSelectableOptions = ROLE_OPTIONS.filter(
  (role) => !role.hiddenFromServantSelection,
);

export const getServantRoleOptions = () => servantSelectableOptions;

export const getServantRoleValues = () =>
  servantSelectableOptions.map((role) => role.value);
