import { createSlidingWindowRateLimiter } from "@/lib/rate-limit";

describe("sliding-window rate limiter", () => {
  it("allows five attempts in ten minutes and accepts the next attempt after the window", () => {
    let now = 1_000;
    const limiter = createSlidingWindowRateLimiter({
      limit: 5,
      windowMs: 10 * 60 * 1_000,
      now: () => now,
    });

    expect(Array.from({ length: 5 }, () => limiter.allow("203.0.113.8"))).toEqual([
      true,
      true,
      true,
      true,
      true,
    ]);
    expect(limiter.allow("203.0.113.8")).toBe(false);

    now += 10 * 60 * 1_000;
    expect(limiter.allow("203.0.113.8")).toBe(true);
  });

  it("evicts the oldest key when its configured key bound is reached", () => {
    let now = 1_000;
    const limiter = createSlidingWindowRateLimiter({
      limit: 1,
      windowMs: 10 * 60 * 1_000,
      maxKeys: 2,
      now: () => now,
    });

    expect(limiter.allow("198.51.100.1")).toBe(true);
    now += 1;
    expect(limiter.allow("198.51.100.2")).toBe(true);
    now += 1;
    expect(limiter.allow("198.51.100.3")).toBe(true);
    expect(limiter.allow("198.51.100.1")).toBe(true);
  });
});
