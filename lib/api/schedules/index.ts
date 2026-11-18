"use server";

import { assertValidMonth } from "@/lib/helpers/scheduleValidation";
import { assertSafeId } from "@/lib/helpers/validateId";
import { authenticatedFetch } from "@/lib/api/authenticatedFetch";
import type { TSchedule } from "@/types";

const host = process.env.SERVER_HOST;

/**
 * Fetches all schedules from the backend.
 */
export async function fetchSchedules(): Promise<TSchedule[]> {
  if (!host) throw new Error("SERVER_HOST is not defined");

  const res = await authenticatedFetch(`${host}/api/schedules`, { cache: "no-store" });
  if (!res.ok) {
    throw new Error(`Failed to fetch schedules (status ${res.status})`);
  }

  return res.json() as Promise<TSchedule[]>;
}

/**
 * Fetches a specific schedule by month.
 * @param month Format: "YYYY-MM"
 */
export async function fetchSchedule(month: string): Promise<TSchedule | null> {
  if (!host) throw new Error("SERVER_HOST is not defined");
  assertValidMonth(month);
  const safeMonth = encodeURIComponent(month).trim();;

  if (!/^\d{4}-(0[1-9]|1[0-2])$/.test(safeMonth)) {
    throw new Error("Invalid month format. Expected YYYY-MM.");
  }

  const res = await authenticatedFetch(`${host}/api/schedules/${safeMonth}`, {
    cache: "no-store",
  });

  if (res.status === 404) {
    return null;
  }

  if (!res.ok) {
    throw new Error(`Failed to fetch schedule for ${month} (status ${res.status})`);
  }

  return res.json() as Promise<TSchedule>;
}

/**
 * Creates a new schedule for a month.
 */
export async function createSchedule(schedule: Partial<TSchedule>): Promise<TSchedule> {
  if (!host) throw new Error("SERVER_HOST is not defined");

  const res = await authenticatedFetch(`${host}/api/schedules`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(schedule),
  });

  if (!res.ok) {
    throw new Error(`Failed to create schedule (status ${res.status})`);
  }

  return res.json() as Promise<TSchedule>;
}

/**
 * Updates an existing schedule's entries.
 * @param month Format: "YYYY-MM"
 */
export async function updateSchedule(
  month: string,
  schedule: Partial<TSchedule>,
): Promise<TSchedule> {
  if (!host) throw new Error("SERVER_HOST is not defined");
  assertValidMonth(month);
  const safeMonth = encodeURIComponent(month).trim();;

  if (!/^\d{4}-(0[1-9]|1[0-2])$/.test(safeMonth)) {
    throw new Error("Invalid month format. Expected YYYY-MM.");
  }

  const res = await authenticatedFetch(`${host}/api/schedules/${safeMonth}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(schedule),
  });

  if (!res.ok) {
    throw new Error(`Failed to update schedule (status ${res.status})`);
  }

  return res.json() as Promise<TSchedule>;
}

/**
 * Updates a man's lastServed timestamps after finalizing a schedule.
 * Validates that all updates succeed before completing.
 * @param updates Array of updates with man ID and lastServed timestamps
 * @throws If any update fails or returns invalid data
 */
export async function updateMenLastServed(
  updates: Array<{ id: string; lastServed: Record<string, number> }>,
): Promise<void> {
  if (!host) throw new Error("SERVER_HOST is not defined");

  if (!Array.isArray(updates) || updates.length === 0) {
    return; // No updates needed
  }

  const updatePromises = updates.map((update) => {
    if (!update.id) {
      throw new Error("Invalid man ID in update");
    }
    assertSafeId(update.id);
    if (!update.lastServed || typeof update.lastServed !== "object") {
      throw new Error("Invalid lastServed data in update");
    }

    const encodedId = encodeURIComponent(update.id);
    return authenticatedFetch(`${host}/api/men/${encodedId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        lastServed: update.lastServed,
        updatedAt: Date.now(),
      }),
    }).then(async (res) => {
      if (!res.ok) {
        throw new Error(`Failed to update man ${update.id} (status ${res.status})`);
      }
      return res.json();
    });
  });

  const results = await Promise.all(updatePromises);

  // Validate all updates succeeded and returned valid data
  for (const result of results) {
    if (!result || typeof result !== "object" || !("id" in result)) {
      throw new Error("One or more man update responses were invalid");
    }
  }
}
