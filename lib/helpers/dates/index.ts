import { type DateValue } from "@/types";
import { format, startOfDay, isAfter } from "date-fns";

/**
 * Ensures any DateValue resolves to a Date object for consistent processing.
 * @private
 * @param value - Either a Date instance or a string/number that can be parsed into one.
 * @returns A Date object representation of the provided value.
 */
const _normalizeDateValue = (value: DateValue) =>
  value instanceof Date ? value : new Date(value);

/**
 * Converts any DateValue into an ISO date string.
 * @private
 * @param value - The date-like value to convert.
 * @returns ISO string (e.g. 2024-01-01T00:00:00.000Z).
 */
const _toIsoDateString = (value: DateValue) =>
  _normalizeDateValue(value).toISOString();

/**
 * Formats a date-like value into a human readable string (e.g. Apr 15, 2024).
 * @param value - Date instance, timestamp, or ISO string to format.
 * @returns Formatted date string.
 */
export const formatReadableDate = (value: DateValue) =>
  format(_normalizeDateValue(value), "MMM d, yyyy");

/**
 * Checks whether two DateValues represent the same calendar day.
 * @param a - First date-like value.
 * @param b - Second date-like value.
 * @returns True when both dates fall on the same yyyy-MM-dd, otherwise false.
 */
export const isSameDay = (a: DateValue, b: DateValue) =>
  format(_normalizeDateValue(a), "yyyy-MM-dd") ===
  format(_normalizeDateValue(b), "yyyy-MM-dd");

/**
 * Converts an optional list of DateValues into ISO strings suitable for payloads.
 * @param dates - Array of date-like values or undefined.
 * @returns Array of ISO date strings; defaults to an empty array.
 */
export const normalizeDatesForPayload = (dates?: DateValue[]) =>
  dates?.map(_toIsoDateString) ?? [];

/**
 * Determines if a given date should be disabled based on specific criteria.
 * @param date - The date to check.
 * @returns True if the date should be disabled, false otherwise.
 */
export const shouldDisableDate = (date: Date) => {
  if (!date) return false;
  const today = startOfDay(new Date());

  const isFuture = isAfter(startOfDay(date), today);

  // date.getDay(): Sunday = 0, Wednesday = 3
  const day = date.getDay();
  const isAllowedDay = day === 0 || day === 3;

  // Disable unless BOTH conditions pass
  return !(isFuture && isAllowedDay);
};
