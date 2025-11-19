type CacheEntry<T> = {
  value: T;
  expiresAt: number;
};

/**
 * SessionCache is a simple in-memory cache that expires entries after a given duration.
 * It uses a background sweeper to remove expired entries periodically.
 */
export class SessionCache<T> {
  private cache = new Map<string, CacheEntry<T>>();
  private sweeperId: ReturnType<typeof setInterval> | null = null;

  // Default TTL: 5 minutes
  private readonly duration: number = 5 * 60 * 1000;

  /**
   * @param duration Optional TTL for all entries; overrides the 5‑minute default.
   * @param sweepInterval How often to remove expired entries (ms).
   */
  constructor(
    duration?: number,
    private sweepInterval: number = 60 * 1000,
  ) {
    if (duration !== undefined) {
      this.duration = duration;
    }
    this.startSweeper();
  }

  public get(key: string): T | undefined {
    const entry = this.cache.get(key);
    if (!entry) return undefined;
    if (entry.expiresAt < Date.now()) {
      this.cache.delete(key);
      return undefined;
    }
    return entry.value;
  }

  public set(key: string, value: T): void {
    const expiry = Date.now() + this.duration;
    this.cache.set(key, { value, expiresAt: expiry });
  }

  public delete(key: string): void {
    this.cache.delete(key);
  }

  public clear(): void {
    this.cache.clear();
  }

  private startSweeper() {
    if (!this.sweeperId) {
      this.sweeperId = setInterval(() => {
        const now = Date.now();
        for (const [key, entry] of this.cache) {
          if (entry.expiresAt < now) {
            this.cache.delete(key);
          }
        }
      }, this.sweepInterval);
    }
  }

  public stopSweeper(): void {
    if (this.sweeperId) {
      clearInterval(this.sweeperId);
      this.sweeperId = null;
    }
  }
}
