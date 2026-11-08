import type { TCommunionFamily } from "@/types";

export function selectNextCommunionFamily(
  families: TCommunionFamily[],
): TCommunionFamily | null {
  return [...families].sort((a, b) => {
    const serviceDifference = (a.lastServed ?? 0) - (b.lastServed ?? 0);
    if (serviceDifference !== 0) return serviceDifference;
    return a.familyName.localeCompare(b.familyName);
  })[0] ?? null;
}

export function getCommunionFamilyName(
  value: string,
  families: TCommunionFamily[],
): string {
  return families.find((family) => family.id === value)?.familyName ?? value;
}
