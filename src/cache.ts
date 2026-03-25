import type { CacheStore } from "./index";

const MAX_ENTRIES = 10_000;

export function createCache(): CacheStore {
  const store = new Map<string, { value: string; expires: number }>();

  function evict() {
    if (store.size <= MAX_ENTRIES) return;
    const oldest = store.keys().next().value!;
    store.delete(oldest);
  }

  return {
    async get(key: string) {
      const entry = store.get(key);
      if (!entry || Date.now() > entry.expires) {
        store.delete(key);
        return null;
      }
      return entry.value;
    },
    async put(key: string, value: string, opts?: { expirationTtl?: number }) {
      const ttl = (opts?.expirationTtl ?? 3600) * 1000;
      store.set(key, { value, expires: Date.now() + ttl });
      evict();
    },
  };
}
