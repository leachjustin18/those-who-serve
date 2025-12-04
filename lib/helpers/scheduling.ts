import type { TMan, TScheduleEntry } from "@/types";
import { ROLE_OPTIONS } from "@/lib/constants";
import { format, getDaysInMonth, parse } from "date-fns";

/**
 * Gets the day of the week for a given ISO date string.
 * @param dateStr ISO date string (YYYY-MM-DD)
 * @returns "Sunday" | "Wednesday" | etc.
 */
function getDayName(dateStr: string): string {
  const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  const date = parse(dateStr, "yyyy-MM-dd", new Date());
  return days[date.getDay()];
}

/**
 * Determines if a servant is available for a specific date.
 */
function isServantAvailable(servant: TMan, dateStr: string): boolean {
  if (!servant.unavailableDates) return true;
  return !servant.unavailableDates.includes(dateStr);
}

/**
 * Checks if assigning a servant to a role on a date conflicts with existing assignments.
 * @param servantId The servant being assigned
 * @param role The role being assigned
 * @param dateStr The date being assigned
 * @param entries Existing schedule entries
 * @returns true if conflict exists, false otherwise
 */
export function hasRoleConflict(
  servantId: string,
  role: string,
  dateStr: string,
  entries: TScheduleEntry[],
): boolean {
  // Get role definition to find conflicts
  const roleObj = ROLE_OPTIONS.find((r) => r.value === role);
  if (!roleObj?.conflictsWith) return false;

  // Check if servant is already assigned to a conflicting role on the same date
  const sameDateEntries = entries.filter((e) => e.date === dateStr && e.servantId === servantId);

  return sameDateEntries.some((e) => roleObj.conflictsWith!.includes(e.role));
}

/**
 * Gets all Wednesdays and Sundays in a given month.
 * @param monthStr Format: "YYYY-MM"
 * @returns Array of ISO date strings sorted chronologically
 */
export function getWednesdaysAndSundaysInMonth(monthStr: string): string[] {
  const dates: string[] = [];
  const [year, month] = monthStr.split("-").map(Number);
  const daysInMonth = getDaysInMonth(new Date(year, month - 1));

  for (let day = 1; day <= daysInMonth; day++) {
    const date = new Date(year, month - 1, day);
    const dayOfWeek = date.getDay();
    // 0 = Sunday, 3 = Wednesday
    if (dayOfWeek === 0 || dayOfWeek === 3) {
      dates.push(format(date, "yyyy-MM-dd"));
    }
  }

  return dates;
}

/**
 * Gets all roles that should be scheduled for a specific day.
 * Excludes monthly roles.
 * Roles without a "day" field are scheduled for all Wed/Sun.
 * Roles with a specific "day" are scheduled only for that day.
 */
function getRolesForDay(dayName: string): typeof ROLE_OPTIONS {
  return ROLE_OPTIONS.filter((role) => {
    // Skip monthly roles from daily scheduling
    if (role.isMonthly) return false;

    if (!role.day) return true; // No specific day = both Wed and Sun
    return role.day === dayName;
  });
}

/**
 * Gets all monthly roles (Announcements, Usher).
 * These are not tied to specific dates.
 */
export function getMonthlyRoles(): typeof ROLE_OPTIONS {
  return ROLE_OPTIONS.filter((role) => role.isMonthly);
}

/**
 * Selects the best servant for a role on a specific date.
 * Strategy:
 * 1. Filter servants who have the role in their roles array
 * 2. Filter available servants (not in unavailableDates)
 * 3. Filter out servants with role conflicts
 * 4. Rank by least recently served (oldest lastServed timestamp for this role)
 * 5. Return servant with lowest rank (least recent service)
 */
function selectBestServantForRole(
  role: string,
  dateStr: string,
  availableServants: TMan[],
  entries: TScheduleEntry[],
): TMan | null {
  // Filter servants who have this role assigned
  const roleServants = availableServants.filter((s) => s.roles?.includes(role));

  // Filter servants available on this date
  const availableForDate = roleServants.filter((s) =>
    isServantAvailable(s, dateStr),
  );

  // Filter out servants with role conflicts
  const noConflicts = availableForDate.filter(
    (s) => !hasRoleConflict(s.id, role, dateStr, entries),
  );

  if (noConflicts.length === 0) {
    return null;
  }

  // Sort by last served timestamp for this role (ascending = least recent first)
  // Tiebreaker: use ID for stable sorting when timestamps are equal
  const sorted = noConflicts.sort((a, b) => {
    const aLastServed = a.lastServed?.[role] ?? 0;
    const bLastServed = b.lastServed?.[role] ?? 0;
    if (aLastServed !== bLastServed) {
      return aLastServed - bLastServed;
    }
    // Tiebreaker: compare IDs lexicographically for deterministic ordering
    return (a.id ?? "").localeCompare(b.id ?? "");
  });

  return sorted[0] ?? null;
}

/**
 * Generates a full schedule for a given month by automatically assigning servants to roles.
 * Uses least-recently-served algorithm to balance workload.
 * Respects role conflicts (e.g., Devotional excludes prayer/singing roles same day).
 *
 * @param monthStr Format: "YYYY-MM"
 * @param men Array of available servants
 * @returns Array of TScheduleEntry for the month
 */
export function generateScheduleForMonth(
  monthStr: string,
  men: TMan[],
): TScheduleEntry[] {
  const entries: TScheduleEntry[] = [];
  const dates = getWednesdaysAndSundaysInMonth(monthStr);

  // Generate Wed/Sun role assignments
  for (const dateStr of dates) {
    const dayName = getDayName(dateStr);
    const rolesForDay = getRolesForDay(dayName);

    for (const roleObj of rolesForDay) {
      // For roles with multiple slots (e.g., number: 2), create multiple entries
      const numSlots = roleObj.number ?? 1;

      for (let i = 0; i < numSlots; i++) {
        // Remove already-selected servants for this date/role to avoid duplicates
        // Also exclude servants already assigned to this role elsewhere in the month
        const remainingMen = men.filter(
          (m) =>
            !entries.some(
              (e) =>
                e.role === roleObj.value && e.servantId === m.id,
            ),
        );

        const selected = selectBestServantForRole(
          roleObj.value,
          dateStr,
          remainingMen,
          entries,
        );

        if (selected) {
          entries.push({
            date: dateStr,
            role: roleObj.value,
            servantId: selected.id,
          });
        }
      }
    }
  }

  // Generate monthly role assignments (one per role for the whole month)
  const monthlyRoles = getMonthlyRoles();

  for (const roleObj of monthlyRoles) {
    const numSlots = roleObj.number ?? 1;

    for (let i = 0; i < numSlots; i++) {
      // For monthly roles, use a placeholder date (first day of month)
      const monthlyDate = `${monthStr}-01`;

      // Remove already-selected servants for this monthly role
      // Exclude any servant already assigned this role (anywhere in schedule)
      const remainingMen = men.filter(
        (m) =>
          !entries.some(
            (e) =>
              e.role === roleObj.value &&
              e.servantId === m.id,
          ),
      );

      const selected = selectBestServantForRole(
        roleObj.value,
        monthlyDate,
        remainingMen,
        entries,
      );

      if (selected) {
        entries.push({
          date: monthlyDate,
          role: roleObj.value,
          servantId: selected.id,
        });
      }
    }
  }

  // Deduplicate monthly entries - keep only the expected count per role
  const roleCount = new Map<string, number>();
  const finalEntries: TScheduleEntry[] = [];

  for (const entry of entries) {
    const roleObj = ROLE_OPTIONS.find((r) => r.value === entry.role && r.isMonthly);

    if (!roleObj) {
      // Keep all non-monthly entries
      finalEntries.push(entry);
    } else {
      // For monthly roles, only keep up to the expected number
      const currentCount = roleCount.get(entry.role) ?? 0;
      const maxCount = roleObj.number ?? 1;

      if (currentCount < maxCount) {
        finalEntries.push(entry);
        roleCount.set(entry.role, currentCount + 1);
      }
    }
  }

  return finalEntries;
}

/**
 * Updates a servant's "last served" timestamp for a specific role.
 * Used after finalizing a schedule to track service history.
 */
export function updateLastServed(
  servant: TMan,
  role: string,
  timestamp: number = Date.now(),
): TMan {
  return {
    ...servant,
    lastServed: {
      ...(servant.lastServed ?? {}),
      [role]: timestamp,
    },
  };
}
