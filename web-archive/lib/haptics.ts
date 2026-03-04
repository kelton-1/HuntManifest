/** Haptic feedback utility using the Vibration API.
 *  Falls back silently on unsupported browsers (iOS Safari). */

export function hapticLight() {
  if (typeof navigator !== "undefined" && navigator.vibrate) {
    navigator.vibrate(10);
  }
}

export function hapticMedium() {
  if (typeof navigator !== "undefined" && navigator.vibrate) {
    navigator.vibrate(25);
  }
}

export function hapticHeavy() {
  if (typeof navigator !== "undefined" && navigator.vibrate) {
    navigator.vibrate([30, 20, 30]);
  }
}
