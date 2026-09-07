import { headers } from "next/headers";

export async function checkOrigin(): Promise<boolean> {
  const h = await headers();
  const origin = h.get("origin");
  const host = h.get("host");
  if (!origin || !host) return true; // same-origin server action calls may omit origin
  try {
    return new URL(origin).host === host;
  } catch {
    return false;
  }
}

export async function clientKey(): Promise<string> {
  const h = await headers();
  return h.get("x-forwarded-for")?.split(",")[0]?.trim() || h.get("x-real-ip") || "local";
}
