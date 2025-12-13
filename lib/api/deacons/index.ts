"use server";

import type { TDeacons } from "@/types";

const host = process.env.SERVER_HOST;


/**
 * Performs a network request to retrieve men from the backend.
 *
 * @throws If SERVER_HOST is not defined or the request fails.
 * @returns A list of deacons from the backend API.
 */
export async function fetchDeacons(): Promise<TDeacons[]> {
    if (!host) throw new Error("SERVER_HOST is not defined");

    const res = await fetch(`${host}/api/deacons`, { cache: "no-store" });
    if (!res.ok) {
        throw new Error(`Failed to fetch deacons (status ${res.status})`);
    }

    return res.json() as Promise<TDeacons[]>;
}

