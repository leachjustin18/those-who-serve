import { parse } from "date-fns";

import { ROLE_OPTIONS } from "@/lib/constants";
import { hasRoleConflict } from "@/lib/helpers/scheduling";
import type { TMan, TSchedule, TScheduleEntry } from "@/types";

export function getDayNameFromDate(dateStr: string): "Wednesday" | "Sunday" {
  const date = parse(dateStr, "yyyy-MM-dd", new Date());
  const dayOfWeek = date.getDay();
  return dayOfWeek === 0 ? "Sunday" : "Wednesday";
}

export function getEntriesForDate(
  schedule: TSchedule | null,
  dateStr: string,
): TScheduleEntry[] {
  if (!schedule) return [];
  return schedule.entries.filter((e) => e.date === dateStr);
}

export function getMonthlyEntries(schedule: TSchedule | null): TScheduleEntry[] {
  if (!schedule) return [];
  return schedule.entries.filter((e) =>
    ROLE_OPTIONS.find((r) => r.value === e.role && r.isMonthly),
  );
}

export function getServantsForRole(allMen: TMan[], roleValue: string) {
  return allMen.filter((m) => m.roles?.includes(roleValue));
}

export function getAvailableServantsForOverride(
  allMen: TMan[],
  roleValue: string,
  dateStr: string,
  entries: TScheduleEntry[],
) {
  return getServantsForRole(allMen, roleValue).filter(
    (m) => !hasRoleConflict(m.id, roleValue, dateStr, entries),
  );
}

export function isPastMonth(viewedMonth: string): boolean {
  const now = new Date();
  const viewed = parse(viewedMonth, "yyyy-MM", new Date());
  const startOfViewed = new Date(viewed.getFullYear(), viewed.getMonth(), 1);
  const startOfCurrent = new Date(now.getFullYear(), now.getMonth(), 1);
  return startOfViewed < startOfCurrent;
}
