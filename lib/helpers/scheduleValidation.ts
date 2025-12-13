import type { TSchedule } from "@/types";

/**
 * Validates that the month string is in valid YYYY-MM format with valid month (01-12).
 * @param month The month string to validate
 * @returns true if valid, false otherwise
 */
export function isValidMonth(month: string): boolean {
    if (typeof month !== "string") return false;

    // Check format: YYYY-MM
    if (!/^\d{4}-\d{2}$/.test(month)) return false;

    // Extract and validate month is between 01 and 12
    const monthPart = month.split("-")[1];
    const monthNum = parseInt(monthPart, 10);

    return monthNum >= 1 && monthNum <= 12;
}

/**
 * Validates that schedule data returned from API is complete and well-formed.
 * @param schedule The schedule object to validate
 * @returns true if valid, false otherwise
 */
export function isValidScheduleResponse(schedule: unknown): schedule is TSchedule {
    if (!schedule || typeof schedule !== "object") return false;

    const s = schedule as Record<string, unknown>;

    // Validate required fields
    if (typeof s.id !== "string" || !s.id.trim()) return false;
    if (typeof s.month !== "string" || !s.month.trim()) return false;
    if (!Array.isArray(s.entries)) return false;

    // Validate entries are valid schedule entries
    if (
        !s.entries.every(
            (entry) =>
                entry &&
                typeof entry === "object" &&
                typeof (entry as Record<string, unknown>).date === "string" &&
                typeof (entry as Record<string, unknown>).role === "string" &&
                typeof (entry as Record<string, unknown>).servantId === "string"
        )
    ) {
        return false;
    }

    return true;
}
