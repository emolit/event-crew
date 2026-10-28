interface LoginRateLimiterOptions {
  maxAttempts: number;
  windowMs: number;
}

interface AttemptWindow {
  count: number;
  startedAt: number;
}

export class LoginRateLimiter {
  private readonly attempts = new Map<string, AttemptWindow>();

  constructor(private readonly options: LoginRateLimiterOptions) {}

  consume(key: string, now = Date.now()): boolean {
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
}

export const loginRateLimiter = new LoginRateLimiter({ maxAttempts: 5, windowMs: 15 * 60_000 });
