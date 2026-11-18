import { headers } from "next/headers";

export async function authenticatedFetch(
  input: string | URL | Request,
  init: RequestInit = {},
) {
  const requestHeaders = await headers();
  const cookie = requestHeaders.get("cookie");
  const forwardedHeaders = new Headers(init.headers);

  if (cookie) forwardedHeaders.set("cookie", cookie);

  return fetch(input, {
    ...init,
    headers: forwardedHeaders,
  });
}
