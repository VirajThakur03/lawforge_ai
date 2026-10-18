// src/engine/SessionManager.js
/**
 * LAWFORGE AI — Sovereign Session Timeout & Auto-Lock Manager
 * Implements automatic session locking after a configurable idle period (default: 15 minutes).
 * On lock: clears sensitive in-memory data, triggers a re-auth UI, and emits a lock event.
 */

const IDLE_TIMEOUT_KEY = 'lf_session_timeout_minutes';
const DEFAULT_TIMEOUT_MINUTES = 15;
const LAST_ACTIVITY_KEY = 'lf_last_activity_ts';

export const SessionManager = {
  _timer: null,
  _lockCallback: null,
  _activityEvents: ['mousemove', 'keydown', 'click', 'touchstart', 'scroll'],

  /**
   * Gets configured idle timeout (minutes) from localStorage
   */
  getTimeoutMinutes() {
    const stored = localStorage.getItem(IDLE_TIMEOUT_KEY);
    const val = stored ? parseInt(stored, 10) : DEFAULT_TIMEOUT_MINUTES;
    return isNaN(val) || val < 1 ? DEFAULT_TIMEOUT_MINUTES : val;
  },

  /**
   * Sets custom timeout duration
   */
  setTimeoutMinutes(minutes) {
    const val = Math.max(1, parseInt(minutes, 10) || DEFAULT_TIMEOUT_MINUTES);
    localStorage.setItem(IDLE_TIMEOUT_KEY, val.toString());
    // Restart with new timeout
    if (this._lockCallback) {
      this.stop();
      this.start(this._lockCallback);
    }
  },

  /**
   * Records the current timestamp as the last user activity
   */
  recordActivity() {
    localStorage.setItem(LAST_ACTIVITY_KEY, Date.now().toString());
  },

  /**
   * Checks if the session has timed out based on last activity
   */
  isSessionExpired() {
    const lastTs = localStorage.getItem(LAST_ACTIVITY_KEY);
    if (!lastTs) return false;
    const elapsed = Date.now() - parseInt(lastTs, 10);
    const timeoutMs = this.getTimeoutMinutes() * 60 * 1000;
    return elapsed >= timeoutMs;
  },

  /**
   * Starts session monitoring. Calls onLock when the session expires due to inactivity.
   */
  start(onLock) {
    if (typeof window === 'undefined') return;
    this._lockCallback = onLock;
    this.recordActivity();

    // Bind activity event listeners
    const boundActivity = this.recordActivity.bind(this);
    this._boundActivity = boundActivity;
    this._activityEvents.forEach(event => window.addEventListener(event, boundActivity, { passive: true }));

    // Check every 60 seconds
    this._timer = setInterval(() => {
      if (this.isSessionExpired()) {
        this.lock();
      }
    }, 60 * 1000);
  },

  /**
   * Locks the session: stops monitoring, removes activity listeners, fires onLock
   */
  lock() {
    this.stop();
    if (this._lockCallback) {
      try {
        this._lockCallback();
      } catch (err) {
        console.error("SessionManager lock callback error:", err);
      }
    }
  },

  /**
   * Stops session monitoring (e.g. user manually unlocks)
   */
  stop() {
    if (this._timer) {
      clearInterval(this._timer);
      this._timer = null;
    }
    if (this._boundActivity && typeof window !== 'undefined') {
      this._activityEvents.forEach(event => window.removeEventListener(event, this._boundActivity));
      this._boundActivity = null;
    }
  },

  /**
   * Restarts the session after user re-authenticates
   */
  resume(onLock) {
    this.recordActivity();
    this.start(onLock);
  }
};
