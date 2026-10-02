/**
 * Native Haptic Feedback utility for mobile touch devices.
 * Uses navigator.vibrate with zero dependencies and graceful fallback on desktop.
 */
export const haptics = {
  /** Subtle tap for buttons, speed pickers, tab switches */
  light: () => {
    if (typeof navigator !== "undefined" && typeof navigator.vibrate === "function") {
      try {
        navigator.vibrate(15);
      } catch {}
    }
  },

  /** Noticeable confirmation for unlocking, bookmarking, timer set */
  medium: () => {
    if (typeof navigator !== "undefined" && typeof navigator.vibrate === "function") {
      try {
        navigator.vibrate(30);
      } catch {}
    }
  },

  /** Rhythmic double-tap for lesson completion or quiz right answer */
  success: () => {
    if (typeof navigator !== "undefined" && typeof navigator.vibrate === "function") {
      try {
        navigator.vibrate([25, 45, 30]);
      } catch {}
    }
  },

  /** Triumphant vibration pattern for test passed or streak milestone */
  celebrate: () => {
    if (typeof navigator !== "undefined" && typeof navigator.vibrate === "function") {
      try {
        navigator.vibrate([40, 50, 40, 50, 80]);
      } catch {}
    }
  },
};
