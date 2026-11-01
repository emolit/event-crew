interface LoginRateLimiterOptions {
  maxAttempts: number;
  windowMs: number;
  maxKeys?: number;
}

interface AttemptWindow {
  count: number;
  startedAt: number;
}

export class LoginRateLimiter {
  private readonly attempts = new Map<string, AttemptWindow>();

  constructor(private readonly options: LoginRateLimiterOptions) {}

  consume(key: string, now = Date.now()): boolean {
    for (const [candidate, window] of this.attempts) if (now - window.startedAt >= this.options.windowMs) this.attempts.delete(candidate);
    if (!this.attempts.has(key) && this.attempts.size >= (this.options.maxKeys ?? 10_000)) this.attempts.delete(this.attempts.keys().next().value!);
    const current = this.attempts.get(key);
    if (!current || now - current.startedAt >= this.options.windowMs) {
      this.attempts.set(key, { count: 1, startedAt: now });
      return true;
    }
    if (current.count >= this.options.maxAttempts) {
      return false;
    }
    current.count += 1;
    return true;
  }

  reset(key: string): void {
    this.attempts.delete(key);
  }

  get size(): number { return this.attempts.size; }
}

export const loginIpRateLimiter = new LoginRateLimiter({ maxAttempts: 20, windowMs: 15 * 60_000, maxKeys: 10_000 });
export const loginAccountRateLimiter = new LoginRateLimiter({ maxAttempts: 5, windowMs: 15 * 60_000, maxKeys: 2_000 });
export const loginRateLimiter = loginAccountRateLimiter;
