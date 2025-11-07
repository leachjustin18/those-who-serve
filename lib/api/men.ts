import type { Man } from "@/types/man";

export async function fetchMen(): Promise<Man[]> {
  try {
    const res = await fetch("/api/men");
    if (!res.ok) throw new Error("Failed to fetch men");
    return res.json();
  } catch (err) {
    throw new Error(`Unable to fetch men: ${err}`);
  }
}
