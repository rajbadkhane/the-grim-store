import { env } from "../config/env.js";

class ApiCache {
  private cache = new Map<string, { value: any; expiresAt: number }>();
  private readonly keySet = "grim-store:cache-keys";

  async get<T>(key: string): Promise<T | null> {
    const memory = this.cache.get(key);
    if (memory) {
      if (Date.now() <= memory.expiresAt) return memory.value as T;
      this.cache.delete(key);
    }

    if (!this.redisEnabled()) return null;
    const value = await this.redis(["GET", this.redisKey(key)]);
    if (!value) return null;
    try {
      const parsed = JSON.parse(String(value)) as T;
      this.cache.set(key, { value: parsed, expiresAt: Date.now() + 30_000 });
      return parsed;
    } catch {
      return null;
    }
  }

  async set<T>(key: string, value: T, ttlSeconds: number = 300): Promise<void> {
    this.cache.set(key, {
      value,
      expiresAt: Date.now() + ttlSeconds * 1000
    });

    if (!this.redisEnabled()) return;
    const cacheKey = this.redisKey(key);
    await Promise.all([
      this.redis(["SET", cacheKey, JSON.stringify(value), "EX", String(ttlSeconds)]),
      this.redis(["SADD", this.keySet, cacheKey])
    ]);
  }

  async delete(key: string): Promise<void> {
    this.cache.delete(key);
    if (this.redisEnabled()) await this.redis(["DEL", this.redisKey(key)]);
  }

  async clear(): Promise<void> {
    this.cache.clear();
    if (!this.redisEnabled()) return;
    const keys = await this.redis(["SMEMBERS", this.keySet]);
    const cacheKeys = Array.isArray(keys) ? keys.map(String) : [];
    if (cacheKeys.length) await this.redis(["DEL", ...cacheKeys]);
    await this.redis(["DEL", this.keySet]);
  }

  private redisEnabled() {
    return Boolean(env.redisRestUrl && env.redisRestToken);
  }

  private redisKey(key: string) {
    return `grim-store:cache:${key}`;
  }

  private async redis(command: string[]) {
    try {
      const response = await fetch(env.redisRestUrl, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${env.redisRestToken}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify(command)
      });
      if (!response.ok) return null;
      const data = await response.json() as { result?: unknown };
      return data.result ?? null;
    } catch {
      return null;
    }
  }
}

export const apiCache = new ApiCache();
