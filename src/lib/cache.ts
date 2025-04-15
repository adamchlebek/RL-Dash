type CacheItem<T> = {
  data: T;
  timestamp: number;
};

export class APICache {
  private static cache = new Map<string, CacheItem<unknown>>();
  private static CACHE_DURATION = 5 * 60 * 1000; // 5 minutes in milliseconds

  static get<T>(key: string): T | null {
    const item = this.cache.get(key);
    if (!item) return null;

    const now = Date.now();
    if (now - item.timestamp > this.CACHE_DURATION) {
      this.cache.delete(key);
      return null;
    }

    return item.data as T;
  }

  static set<T>(key: string, data: T): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
    });
  }

  static clear(): void {
    this.cache.clear();
  }
}
