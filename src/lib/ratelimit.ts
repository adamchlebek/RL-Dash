/**
 * Rate limiter for Ballchasing API
 * Implements a token bucket algorithm with leaky bucket queue
 */

// Diamond patron limits (4 calls/second, 2000/hour)
const MAX_REQUESTS_PER_SECOND = 3; // Using 3 instead of 4 to be safe
const MAX_REQUESTS_PER_HOUR = 1800; // Using 1800 instead of 2000 to be safe

// Debug mode for logging
const DEBUG_MODE = process.env.NODE_ENV !== "production";

// Import axios for type checking
import axios from "axios";

// Queue for pending API calls
interface QueuedRequest<T> {
  ballchasingId: string;
  resolve: (value: T | PromiseLike<T>) => void;
  reject: (reason: unknown) => void;
  executeRequest: () => Promise<T>;
  queuedAt: number;
}

class BallchasingRateLimiter {
  private tokens: number;
  private lastRefill: number;
  private hourlyTokens: number;
  private hourlyLastRefill: number;
  private queue: Array<QueuedRequest<any>>;
  private processing: boolean;
  private totalProcessed: number;
  private totalWaitTime: number;

  constructor() {
    this.tokens = MAX_REQUESTS_PER_SECOND;
    this.lastRefill = Date.now();
    this.hourlyTokens = MAX_REQUESTS_PER_HOUR;
    this.hourlyLastRefill = Date.now();
    this.queue = [];
    this.processing = false;
    this.totalProcessed = 0;
    this.totalWaitTime = 0;

    // Log stats periodically
    if (DEBUG_MODE) {
      setInterval(() => {
        if (this.totalProcessed > 0) {
          const avgWaitTime = this.totalWaitTime / this.totalProcessed;
          console.log(
            `[Ballchasing Rate Limiter] Stats: ${this.totalProcessed} requests processed, ${this.queue.length} in queue, avg wait: ${avgWaitTime.toFixed(2)}ms`,
          );
          // Reset counters
          this.totalProcessed = 0;
          this.totalWaitTime = 0;
        }
      }, 60000); // Log every minute
    }
  }

  private refillTokens(): void {
    const now = Date.now();

    // Refill per-second tokens
    const secsSinceLastRefill = (now - this.lastRefill) / 1000;
    const tokensToAdd = secsSinceLastRefill * MAX_REQUESTS_PER_SECOND;
    this.tokens = Math.min(MAX_REQUESTS_PER_SECOND, this.tokens + tokensToAdd);
    this.lastRefill = now;

    // Refill hourly tokens
    const hoursSinceLastRefill =
      (now - this.hourlyLastRefill) / (1000 * 60 * 60);
    const hourlyTokensToAdd = hoursSinceLastRefill * MAX_REQUESTS_PER_HOUR;
    if (hourlyTokensToAdd >= 1) {
      this.hourlyTokens = Math.min(
        MAX_REQUESTS_PER_HOUR,
        this.hourlyTokens + hourlyTokensToAdd,
      );
      this.hourlyLastRefill = now;
    }

    if (DEBUG_MODE && this.queue.length > 0) {
      console.log(
        `[Ballchasing Rate Limiter] Tokens: ${this.tokens.toFixed(2)}/sec, ${this.hourlyTokens.toFixed(2)}/hour, Queue: ${this.queue.length}`,
      );
    }
  }

  private hasTokens(): boolean {
    this.refillTokens();
    return this.tokens >= 1 && this.hourlyTokens >= 1;
  }

  private consumeToken(): void {
    this.tokens -= 1;
    this.hourlyTokens -= 1;
  }

  private async processQueue(): Promise<void> {
    if (this.processing) return;

    this.processing = true;

    while (this.queue.length > 0) {
      if (!this.hasTokens()) {
        // Calculate wait time until next token available
        const secDelay = (1 / MAX_REQUESTS_PER_SECOND) * 1000;
        if (DEBUG_MODE) {
          console.log(
            `[Ballchasing Rate Limiter] Waiting ${secDelay.toFixed(0)}ms for next token`,
          );
        }
        await new Promise((resolve) => setTimeout(resolve, secDelay));
        continue;
      }

      const request = this.queue.shift();
      if (!request) continue;

      // Calculate wait time for this request
      const waitTime = Date.now() - request.queuedAt;
      this.totalWaitTime += waitTime;
      this.totalProcessed++;

      if (DEBUG_MODE && waitTime > 500) {
        console.log(
          `[Ballchasing Rate Limiter] Request for ${request.ballchasingId} waited ${waitTime}ms in queue`,
        );
      }

      // Execute the request
      this.consumeToken();

      try {
        const result = await request.executeRequest();
        request.resolve(result);
      } catch (error) {
        if (axios.isAxiosError(error) && error.response?.status === 429) {
          // Rate limit error, add back to queue
          console.warn(
            `[Ballchasing Rate Limiter] Rate limit exceeded, re-queuing request for ${request.ballchasingId}`,
          );

          // Add back to queue but with a delay
          setTimeout(() => {
            this.queue.unshift({
              ...request,
              queuedAt: Date.now(),
            });
          }, 2000);
        } else {
          request.reject(error);
        }
      }

      // Add a small delay between requests to smooth out the rate
      await new Promise((resolve) => setTimeout(resolve, 50));
    }

    this.processing = false;
  }

  public async executeWithRateLimit<T>(
    ballchasingId: string,
    requestFn: () => Promise<T>,
  ): Promise<T> {
    return new Promise<T>((resolve, reject) => {
      // Add request to queue
      this.queue.push({
        ballchasingId,
        resolve,
        reject,
        executeRequest: requestFn,
        queuedAt: Date.now(),
      });

      // Start processing the queue if not already
      this.processQueue().catch((err) => {
        console.error(
          "[Ballchasing Rate Limiter] Error processing rate limit queue:",
          err,
        );
      });
    });
  }

  public getQueueLength(): number {
    return this.queue.length;
  }
}

// Singleton instance
export const ballchasingRateLimiter = new BallchasingRateLimiter();

// Provide proper type annotations for functions and parameters
export type RateLimitState = {
  tokensRemaining: number;
  lastRefillTime: number;
};

const rateLimiters: Record<string, RateLimitState> = {};

export function getRateLimit(key: string, tokenLimit: number): RateLimitState {
  // Initialize if not exists
  if (!rateLimiters[key]) {
    rateLimiters[key] = {
      tokensRemaining: tokenLimit,
      lastRefillTime: Date.now(),
    };
  }

  return rateLimiters[key];
}

export function consumeToken(
  key: string,
  tokenLimit: number,
  refillRate: number,
): boolean {
  const limiter = getRateLimit(key, tokenLimit);

  // Check if we need to refill tokens
  const now = Date.now();
  const timeSinceLastRefill = now - limiter.lastRefillTime;
  const tokensToAdd = Math.floor(timeSinceLastRefill * (refillRate / 1000));

  if (tokensToAdd > 0) {
    limiter.tokensRemaining = Math.min(
      tokenLimit,
      limiter.tokensRemaining + tokensToAdd,
    );
    limiter.lastRefillTime = now;
  }

  // Check if we can consume a token
  if (limiter.tokensRemaining > 0) {
    limiter.tokensRemaining--;
    return true;
  }

  return false;
}
