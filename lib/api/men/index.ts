"use server";

import type { Man } from "@/types/man";

const host = process.env.SERVER_HOST;

/**
 * Performs a network request to retrieve men from the backend.
 *
 * @throws If SERVER_HOST is not defined or the request fails.
 * @returns A list of men from the backend API.
 */
async function requestMen(): Promise<Man[]> {
  if (!host) throw new Error("SERVER_HOST is not defined");

  const res = await fetch(`${host}/api/men`, { cache: "no-store" });
  if (!res.ok) {
    throw new Error(`Failed to fetch men (status ${res.status})`);
  }

  return res.json() as Promise<Man[]>;
}

/**
 * Retrieves men from the backend via the API abstraction.
 *
 * This does not maintain any server-side in-memory cache; it is intended
 * to be the single place in the application that talks to the men API.
 *
 * @returns A list of men.
 * @throws If the underlying network request fails.
 */
export async function fetchMen(): Promise<Man[]> {
  try {
    const men = await requestMen();
    return men;
  } catch (err) {
    throw new Error(`Unable to fetch men: ${String(err)}`);
  }
}

/**
 * Updates a single man record in the backend and returns a lightweight
 * "updated man" object that callers can use to patch any client-side cache
 * (e.g. React context) without another fetch.
 *
 * No additional GET is performed after the update; instead, this function:
 * - Sends a PUT to the backend.
 * - Returns an object composed from the input `data` plus `id` and `updatedAt`.
 *
 * @param id - ID of the man to update.
 * @param data - Partial payload of fields to update (except `id`).
 * @returns A partial `Man` representation including the `id` and updated fields.
 * @throws If required values are missing or the request fails.
 */
export async function updateMan(
  id: string,
  data: Partial<Omit<Man, "id">>,
): Promise<Partial<Man> & { id: string }> {
  if (!host || !id) {
    throw new Error("Required value is not defined; unable to PATCH");
  }

  const updates: Partial<Omit<Man, "id">> & { updatedAt: number } = {
    ...data,
    updatedAt: Date.now(),
  };

  const res = await fetch(`${host}/api/men/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(updates),
  });

  if (!res.ok) {
    throw new Error(`PUT /api/men/${id} failed with ${res.status}`);
  }

  // Return a minimal updated man representation for client-side patching
  const updatedMan: Partial<Man> & { id: string } = {
    id,
    ...updates,
  };

  return updatedMan;
}
