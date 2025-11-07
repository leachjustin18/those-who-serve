import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { SessionCache } from "../Cache";

describe("SessionCache", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2024-01-01T00:00:00Z"));
  });

  afterEach(() => {
    vi.clearAllTimers();
    vi.useRealTimers();
  });

  it("stores and retrieves values until the entry expires", () => {
    const cache = new SessionCache<string>(2000);

    cache.set("token", "abc");
    expect(cache.get("token")).toBe("abc");

    vi.setSystemTime(new Date("2024-01-01T00:00:03Z"));
    expect(cache.get("token")).toBeUndefined();

    cache.stopSweeper();
  });

  it("automatically sweeps expired entries", () => {
    const cache = new SessionCache<string>(1000, 500);

    cache.set("key", "value");
    vi.setSystemTime(new Date("2024-01-01T00:00:02Z"));
    vi.advanceTimersByTime(500);

    expect(cache.get("key")).toBeUndefined();

    cache.stopSweeper();
  });

  it("honors delete and clear helpers", () => {
    const cache = new SessionCache<string>(5000);

    cache.set("foo", "bar");
    cache.set("baz", "qux");

    cache.delete("foo");
    expect(cache.get("foo")).toBeUndefined();

    cache.clear();
    expect(cache.get("baz")).toBeUndefined();

    cache.stopSweeper();
  });
});
