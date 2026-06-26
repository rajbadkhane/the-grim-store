"use client";

type BrowserCacheEntry<T> = {
  value: T;
  expiresAt: number;
};

const PREFIX = "grim_public_cache:";
const MAX_BYTES = 180_000;

export function readBrowserCache<T>(key: string): T | null {
  if (typeof window === "undefined") return null;

  try {
    const raw = window.localStorage.getItem(PREFIX + key);
    if (!raw) return null;

    const entry = JSON.parse(raw) as BrowserCacheEntry<T>;
    if (!entry || Date.now() > Number(entry.expiresAt)) {
      window.localStorage.removeItem(PREFIX + key);
      return null;
    }

    return entry.value;
  } catch {
    return null;
  }
}

export function writeBrowserCache<T>(key: string, value: T, ttlSeconds: number) {
  if (typeof window === "undefined") return;

  try {
    const entry = JSON.stringify({
      value,
      expiresAt: Date.now() + ttlSeconds * 1000
    } satisfies BrowserCacheEntry<T>);

    if (entry.length > MAX_BYTES) return;
    window.localStorage.setItem(PREFIX + key, entry);
  } catch {
    // Browser storage may be unavailable or full. Network cache still applies.
  }
}

export async function cachedJsonFetch<T>(key: string, url: string, ttlSeconds: number, init?: RequestInit): Promise<T> {
  const cached = readBrowserCache<T>(key);
  if (cached) return cached;

  const response = await fetch(url, init);
  if (!response.ok) throw new Error(`Request failed with ${response.status}`);

  const data = (await response.json()) as T;
  writeBrowserCache(key, data, ttlSeconds);
  return data;
}
