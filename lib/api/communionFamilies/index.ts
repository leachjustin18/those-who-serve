"use server";

import { assertSafeId } from "@/lib/helpers/validateId";
import type { TCommunionFamily } from "@/types";

const host = process.env.SERVER_HOST;

export async function fetchCommunionFamilies(): Promise<TCommunionFamily[]> {
  if (!host) throw new Error("SERVER_HOST is not defined");
  const response = await fetch(`${host}/api/communion-families`, { cache: "no-store" });
  if (!response.ok) throw new Error(`Failed to fetch communion families (status ${response.status})`);
  return response.json() as Promise<TCommunionFamily[]>;
}

export async function addCommunionFamily(familyName: string): Promise<TCommunionFamily> {
  if (!host) throw new Error("SERVER_HOST is not defined");
  const response = await fetch(`${host}/api/communion-families`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ familyName }),
  });
  if (!response.ok) throw new Error("Failed to add communion family");
  return response.json() as Promise<TCommunionFamily>;
}

export async function updateCommunionFamily(
  id: string,
  updates: Partial<Omit<TCommunionFamily, "id">>,
): Promise<TCommunionFamily> {
  if (!host) throw new Error("SERVER_HOST is not defined");
  assertSafeId(id);
  const response = await fetch(`${host}/api/communion-families/${encodeURIComponent(id)}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(updates),
  });
  if (!response.ok) throw new Error("Failed to update communion family");
  return response.json() as Promise<TCommunionFamily>;
}

export async function deleteCommunionFamily(id: string): Promise<void> {
  if (!host) throw new Error("SERVER_HOST is not defined");
  assertSafeId(id);
  const response = await fetch(`${host}/api/communion-families/${encodeURIComponent(id)}`, {
    method: "DELETE",
  });
  if (!response.ok) throw new Error("Failed to delete communion family");
}
