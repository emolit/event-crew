export interface SlidingWindowRateLimiter {
  allow(key: string): boolean;
  clear(): void;
}

interface SlidingWindowRateLimiterOptions {
  limit: number;
  windowMs: number;
  maxKeys?: number;
  now?: () => number;
}

export function createSlidingWindowRateLimiter(
  options: SlidingWindowRateLimiterOptions,
): SlidingWindowRateLimiter {
  const now = options.now ?? Date.now;
  const maxKeys = options.maxKeys ?? 1_000;
  const attemptsByKey = new Map<string, number[]>();

  function pruneExpired(currentTime: number) {
    const cutoff = currentTime - options.windowMs;

    for (const [key, attempts] of attemptsByKey) {
      const activeAttempts = attempts.filter((timestamp) => timestamp > cutoff);

      if (activeAttempts.length === 0) {
        attemptsByKey.delete(key);
      } else if (activeAttempts.length !== attempts.length) {
        attemptsByKey.set(key, activeAttempts);
      }
    }
  }

  return {
    allow(key) {
      const currentTime = now();
      pruneExpired(currentTime);

      const attempts = attemptsByKey.get(key) ?? [];
      if (attempts.length >= options.limit) {
        return false;
      }

      if (!attemptsByKey.has(key) && attemptsByKey.size >= maxKeys) {
        const oldestKey = attemptsByKey.keys().next().value;
        if (oldestKey !== undefined) {
          attemptsByKey.delete(oldestKey);
        }
      }

      attempts.push(currentTime);
      attemptsByKey.delete(key);
      attemptsByKey.set(key, attempts);
      return true;
    },
    clear() {
      attemptsByKey.clear();
    },
  };
}

export const contactRateLimiter = createSlidingWindowRateLimiter({
  limit: 5,
  windowMs: 10 * 60 * 1_000,
  maxKeys: 1_000,
});
