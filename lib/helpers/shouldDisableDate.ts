import { startOfDay, isAfter } from "date-fns";

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
