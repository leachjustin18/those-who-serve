/**
 * Represents a value stored in the cache along with its expiration timestamp.
 */
type CacheEntry<T> = {
  value: T;
  expiresAt: number;
};

/**
 * Function signature for subscription listeners used to react to cache changes.
 */
type CacheListener = () => void;

/**
 * SessionCache is an in-memory key/value store with time-to-live (TTL) expiration,
 * optional background sweeping, and a subscription system that allows external
 * consumers (e.g., React context) to be notified whenever the cache mutates.
 *
 * This class is designed for client-side usage in applications where:
 * - A lightweight per-session cache is needed.
 * - Entries should expire automatically.
 * - Components should reactively update after cache changes.
 *
 * @typeParam T - The type stored for each cache value.
 */
export class SessionCache<T> {
  /** Internal Map holding cached entries with expiration metadata. */
  private cache = new Map<string, CacheEntry<T>>();

  /** ID of the background sweeper interval. */
  private sweeperId: ReturnType<typeof setInterval> | null = null;

  /** Set of subscribers to notify whenever the cache changes. */
  private listeners = new Set<CacheListener>();

  /** Time-to-live (TTL) duration in milliseconds for all entries. */
  private duration: number;

  /**
   * Creates a new SessionCache.
   *
   * @param duration - Optional TTL override (default: 5 minutes).
   * @param sweepInterval - How often (in ms) to sweep expired entries. Default: 60 seconds.
   */
  constructor(
    duration: number = 5 * 60 * 1000,
    private sweepInterval: number = 60 * 1000,
  ) {
    this.duration = duration;
    this.startSweeper();
  }

  /**
   * Subscribes a listener to cache mutations.
   * The listener fires whenever set/delete/clear/sweeper removes entries.
   *
   * @param listener - Function invoked on any cache-changing event.
   * @returns A cleanup function to unsubscribe the listener.
   */
  public subscribe(listener: CacheListener): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  /**
   * Notifies all registered listeners of a cache change.
   */
  private notify(): void {
    for (const listener of this.listeners) {
      listener();
    }
  }

  /**
   * Retrieves a value from the cache.
   * Automatically removes and notifies if the entry has expired.
   *
   * @param key - The key to retrieve.
   * @returns The stored value, or undefined if not found or expired.
   */
  public get(key: string): T | undefined {
    const entry = this.cache.get(key);
    if (!entry) return undefined;

    if (entry.expiresAt < Date.now()) {
      this.cache.delete(key);
      this.notify();
      return undefined;
    }

    return entry.value;
  }

  /**
   * Stores a value in the cache with a new expiration timestamp.
   * Triggers subscriber notification.
   *
   * @param key - The key to store under.
   * @param value - The value to store.
   */
  public set(key: string, value: T): void {
    const expiry = Date.now() + this.duration;
    this.cache.set(key, { value, expiresAt: expiry });
    this.notify();
  }

  /**
   * Deletes a value from the cache.
   * If the key existed, subscribers are notified.
   *
   * @param key - The key to delete.
   * @returns True if the entry was removed; false otherwise.
   */
  public delete(key: string): boolean {
    const deleted = this.cache.delete(key);
    if (deleted) this.notify();
    return deleted;
  }

  /**
   * Clears all entries from the cache.
   * Notifies subscribers if the cache was not already empty.
   */
  public clear(): void {
    if (this.cache.size === 0) return;
    this.cache.clear();
    this.notify();
  }

  /**
   * Starts an interval that periodically sweeps expired entries.
   * Notifies subscribers only if something was actually removed.
   */
  private startSweeper(): void {
    if (!this.sweeperId) {
      this.sweeperId = setInterval(() => {
        const now = Date.now();
        let changed = false;

        for (const [key, entry] of this.cache) {
          if (entry.expiresAt < now) {
            this.cache.delete(key);
            changed = true;
          }
        }

        if (changed) {
          this.notify();
        }
      }, this.sweepInterval);

      // Allow Node to exit even if the sweeper exists
      if (typeof (this.sweeperId as any).unref === "function") {
        (this.sweeperId as any).unref();
      }
    }
  }

  /**
   * Stops the background sweeper.
   * This should be called if you need to fully tear down the cache.
   */
  public stopSweeper(): void {
    if (this.sweeperId) {
      clearInterval(this.sweeperId);
      this.sweeperId = null;
    }
  }
}
