"use server";

import { SessionCache } from "@/lib/helpers/Cache";
import type { Man } from "@/types/man";

const MEN_CACHE_KEY = "men";
const menCache = new SessionCache<Man[]>();
const MAX_PERSIST_ATTEMPTS = 3;

async function requestMen(): Promise<Man[]> {
  const host = process.env.SERVER_HOST;
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
  "name" | "email" | "roles" | "unavailableDates" | "photoFile" | "notes"
>;

export type UpdateManInput = Partial<EditableManFields>;

type UpdateManOptions = {
  onPersistError?: (error: Error) => void;
};

export async function updateMan(
  id: string,
  updates: UpdateManInput,
  options?: UpdateManOptions,
): Promise<Man> {
  const men = await fetchMen();
  const index = men.findIndex((man) => man.id === id);

  if (index === -1) {
    throw new Error(`Unable to find man with id "${id}" in cache`);
  }

  const now = Date.now();
  const updatedMan: Man = {
    ...men[index],
    ...updates,
    unavailableDates:
      updates.unavailableDates ?? men[index].unavailableDates ?? [],
    updatedAt: now,
  };

  const nextMen = [...men];
  nextMen[index] = updatedMan;
  menCache.set(MEN_CACHE_KEY, nextMen);

  const payload = sanitizePayload({ ...updates, updatedAt: now });
  if (Object.keys(payload).length > 0) {
    fireAndForgetPersist(id, payload, options?.onPersistError);
  }

  return updatedMan;
}

type PatchPayload = Partial<
  Pick<
    Man,
    "name" | "email" | "roles" | "unavailableDates" | "photoFile" | "notes"
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
  const host = process.env.SERVER_HOST;
  if (!host) {
    console.warn("SERVER_HOST is not defined; skipping remote PATCH.");
    return;
  }

  let lastError: Error | null = null;

  for (let attempt = 1; attempt <= MAX_PERSIST_ATTEMPTS; attempt++) {
    try {
      const res = await fetch(`${host}/api/men/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        throw new Error(`PATCH /api/men/${id} failed with ${res.status}`);
      }

      return;
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));
      const isFinalAttempt = attempt === MAX_PERSIST_ATTEMPTS;
      const logFn = isFinalAttempt ? console.error : console.warn;
      const attemptMessage = isFinalAttempt
        ? `Failed to persist man update after ${MAX_PERSIST_ATTEMPTS} attempts.`
        : `Failed to persist man update (attempt ${attempt}/${MAX_PERSIST_ATTEMPTS}). Retrying...`;

      logFn(attemptMessage, lastError);

      if (isFinalAttempt) {
        throw lastError;
      }
    }
  }
}
