"use server";

import type { TSchedule } from "@/types";

const host = process.env.SERVER_HOST;

/**
 * Fetches all schedules from the backend.
 */
export async function fetchSchedules(): Promise<TSchedule[]> {
  if (!host) throw new Error("SERVER_HOST is not defined");

  const res = await fetch(`${host}/api/schedules`, { cache: "no-store" });
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

  const res = await fetch(`${host}/api/schedules/${month}`, {
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

  const res = await fetch(`${host}/api/schedules`, {
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

  const res = await fetch(`${host}/api/schedules/${month}`, {
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
 */
export async function updateMenLastServed(
  updates: Array<{ id: string; lastServed: Record<string, number> }>,
): Promise<void> {
  if (!host) throw new Error("SERVER_HOST is not defined");

  await Promise.all(
    updates.map((update) =>
      fetch(`${host}/api/men/${update.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          lastServed: update.lastServed,
          updatedAt: Date.now(),
        }),
      }),
    ),
  );
}
