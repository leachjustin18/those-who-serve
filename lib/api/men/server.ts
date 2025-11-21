"use server";

import { SessionCache } from "@/lib/helpers/Cache";
import type { Man } from "@/types/man";

const MEN_CACHE_KEY = "men";
const menCache = new SessionCache<Man[]>();
const MAX_PERSIST_ATTEMPTS = 3;
const host = process.env.SERVER_HOST;

async function requestMen(): Promise<Man[]> {
  if (!host) throw new Error("SERVER_HOST is not defined");

  const res = await fetch(`${host}/api/men`, { cache: "no-store" });
  if (!res.ok) throw new Error("Failed to fetch men");

  return res.json();
}

export async function fetchMen(forceRefresh = false): Promise<Man[]> {
  if (!forceRefresh) {
    const cached = menCache.get(MEN_CACHE_KEY);
    if (cached) return cached;
  }

  try {
    const men = await requestMen();
    menCache.set(MEN_CACHE_KEY, men);
    return men;
  } catch (err) {
    throw new Error(`Unable to fetch men: ${err}`);
  }
}

type EditableManFields = Pick<
  Man,
  | "firstName"
  | "lastName"
  | "email"
  | "roles"
  | "unavailableDates"
  | "photoFile"
  | "notes"
>;

export type UpdateManInput = Partial<EditableManFields>;

type UpdateManOptions = {
  onPersistError?: (error: Error) => void;
};

export async function updateMan(
  id: string,
  data: Partial<Omit<Man, "id">>,
): Promise<unknown> {
  if (!host || !id) {
    throw new Error("Required value is not defined; unable to PATCH");
  }

  try {
    const res = await fetch(`${host}/api/men/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...data, updatedAt: Date.now() }),
    });

    if (!res.ok) {
      throw new Error(`PUT /api/men/${id} failed with ${res.status}`);
    }

    const response = await res.json();

    return response;
  } catch (error) {
    throw new Error(`Error updating man: ${error}`);
  }

  // const index = cachedMen.findIndex((man) => man.id === id);

  // if (index === -1) {
  //   throw new Error(`Unable to find man with id "${id}" in cache`);
  // }

  // console.log("updates", updates);
  // debugger;

  // const now = Date.now();
  // const updatedMan: Man = {
  //   ...cachedMen[index],
  //   ...updates,
  //   unavailableDates:
  //     updates.unavailableDates ?? cachedMen[index].unavailableDates ?? [],
  //   updatedAt: now,
  // };

  // const nextMen = [...cachedMen];
  // nextMen[index] = updatedMan;
  // menCache.set(MEN_CACHE_KEY, nextMen);

  // const payload = sanitizePayload({ ...updates, updatedAt: now });

  // return updatedMan;
  //

  return true;
}

type PatchPayload = Partial<
  Pick<
    Man,
    | "firstName"
    | "lastName"
    | "email"
    | "roles"
    | "unavailableDates"
    | "photoFile"
    | "notes"
  > & { updatedAt: number }
>;

function fireAndForgetPersist(
  id: string,
  payload: PatchPayload,
  onError?: (error: Error) => void,
) {
  void persistManUpdate(id, payload).catch((error) => {
    if (onError) {
      onError(error instanceof Error ? error : new Error(String(error)));
    }
  });
}

function sanitizePayload(payload: PatchPayload): PatchPayload {
  const filteredEntries = Object.entries(payload).filter(([, value]) => {
    return value !== undefined;
  });

  return Object.fromEntries(filteredEntries) as PatchPayload;
}

async function persistManUpdate(id: string, payload: PatchPayload) {
  let lastError: Error | null = null;

  for (let attempt = 1; attempt <= MAX_PERSIST_ATTEMPTS; attempt++) {}
}
