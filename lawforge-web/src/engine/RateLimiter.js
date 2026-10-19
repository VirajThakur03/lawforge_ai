// src/engine/RateLimiter.js
/**
 * Client-Side Sliding-Window Rate Limiter & Abuse Prevention Engine.
 * Protects users against accidental quota exhaustion and automated replay attacks.
 */

const STORAGE_KEY = 'lf_ratelimit_records';
const DEFAULT_MAX_REQUESTS = 20; // 20 analyses
const DEFAULT_WINDOW_MS = 10 * 60 * 1000; // 10 minutes

export const RateLimiter = {
  /**
   * Check if a request is permitted under the sliding window.
   * @param {string} actionKey - identifier e.g. 'ai_query'
   * @param {number} maxRequests - allowed calls in the window
   * @param {number} windowMs - time window in milliseconds
   * @returns {{ allowed: boolean, remaining: number, resetInSeconds: number, message?: string }}
   */
  check(actionKey = 'ai_query', maxRequests = DEFAULT_MAX_REQUESTS, windowMs = DEFAULT_WINDOW_MS) {
    const now = Date.now();
    let records = [];

    try {
      const raw = sessionStorage.getItem(`${STORAGE_KEY}_${actionKey}`);
      if (raw) {
        records = JSON.parse(raw);
      }
    } catch {
      records = [];
    }

    // Filter to only events within the current sliding window
    const windowStart = now - windowMs;
    const validRecords = records.filter(ts => ts > windowStart);

    const remaining = Math.max(0, maxRequests - validRecords.length);
    const oldestRecord = validRecords[0] || now;
    const resetInSeconds = Math.ceil((oldestRecord + windowMs - now) / 1000);

    if (validRecords.length >= maxRequests) {
      return {
        allowed: false,
        remaining: 0,
        resetInSeconds: Math.max(1, resetInSeconds),
        message: `Rate limit reached (${maxRequests} queries / 10 min). Please wait ${resetInSeconds}s to protect API quota.`
      };
    }

    return {
      allowed: true,
      remaining,
      resetInSeconds: Math.max(0, resetInSeconds)
    };
  },

  /**
   * Records an action execution in the rate limiter window.
   */
  consume(actionKey = 'ai_query', windowMs = DEFAULT_WINDOW_MS) {
    const now = Date.now();
    let records = [];

    try {
      const raw = sessionStorage.getItem(`${STORAGE_KEY}_${actionKey}`);
      if (raw) {
        records = JSON.parse(raw);
      }
    } catch {
      records = [];
    }

    const windowStart = now - windowMs;
    const validRecords = records.filter(ts => ts > windowStart);
    validRecords.push(now);

    try {
      sessionStorage.setItem(`${STORAGE_KEY}_${actionKey}`, JSON.stringify(validRecords));
    } catch (e) {
      console.warn('Could not store rate limiter records:', e);
    }

    return validRecords.length;
  },

  /**
   * Helper that checks and consumes if allowed, returning result.
   */
  checkAndConsume(actionKey = 'ai_query', maxRequests = DEFAULT_MAX_REQUESTS, windowMs = DEFAULT_WINDOW_MS) {
    const status = RateLimiter.check(actionKey, maxRequests, windowMs);
    if (status.allowed) {
      RateLimiter.consume(actionKey, windowMs);
    }
    return status;
  },

  /**
   * Reset rate limiter for testing or administrative override.
   */
  reset(actionKey = 'ai_query') {
    try {
      sessionStorage.removeItem(`${STORAGE_KEY}_${actionKey}`);
    } catch (_err) {
      // Ignore sessionStorage exceptions in private browsing
    }
  }
};
