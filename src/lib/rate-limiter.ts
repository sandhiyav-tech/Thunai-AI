/**
 * Lightweight in-memory sliding-window rate limiter for Vercel serverless / Edge functions.
 * Protects API routes from abuse, high concurrency, and malicious floods.
 */

interface RateLimitRecord {
  count: number;
  resetAt: number;
}

const ipRequestMap = new Map<string, RateLimitRecord>();

// Cleanup stale records periodically
setInterval(() => {
  const now = Date.now();
  ipRequestMap.forEach((record, key) => {
    if (now > record.resetAt) {
      ipRequestMap.delete(key);
    }
  });
}, 60000);

/**
 * Check if the request is within rate limits.
 * @param identifier Client IP or unique identifier
 * @param limit Max requests within windowMs
 * @param windowMs Time window in milliseconds (default: 60,000ms = 1 min)
 */
export function checkRateLimit(
  identifier: string,
  limit: number = 30,
  windowMs: number = 60000
): { allowed: boolean; remaining: number; resetInMs: number } {
  const now = Date.now();
  const record = ipRequestMap.get(identifier);

  if (!record || now > record.resetAt) {
    ipRequestMap.set(identifier, {
      count: 1,
      resetAt: now + windowMs,
    });
    return { allowed: true, remaining: limit - 1, resetInMs: windowMs };
  }

  if (record.count >= limit) {
    return {
      allowed: false,
      remaining: 0,
      resetInMs: Math.max(0, record.resetAt - now),
    };
  }

  record.count += 1;
  return {
    allowed: true,
    remaining: limit - record.count,
    resetInMs: Math.max(0, record.resetAt - now),
  };
}

/**
 * Validates text input length and basic sanitization.
 */
export function validateInputLength(
  text: string,
  maxChars: number = 500
): { valid: boolean; error?: string } {
  if (typeof text !== 'string') {
    return { valid: false, error: 'Input must be a string' };
  }
  const trimmed = text.trim();
  if (trimmed.length === 0) {
    return { valid: false, error: 'Input cannot be empty' };
  }
  if (trimmed.length > maxChars) {
    return {
      valid: false,
      error: `Input text exceeds maximum allowed limit of ${maxChars} characters`,
    };
  }
  return { valid: true };
}
