/**
 * Tactile Haptic Vibration Feedback Service for PurrGoals.
 * Supports both native mobile environments (via @capacitor/haptics)
 * and mobile web browsers (via navigator.vibrate), with graceful,
 * error-free fallback on unsupported platforms or when disabled.
 */

import { Capacitor } from '@capacitor/core';
import { Haptics, ImpactStyle, NotificationType } from '@capacitor/haptics';

/**
 * Checks if haptic feedback is supported in the current environment.
 */
export function isHapticsSupported(): boolean {
  try {
    if (Capacitor.isNativePlatform()) return true;
    return (
      typeof navigator !== 'undefined' &&
      'vibrate' in navigator &&
      typeof navigator.vibrate === 'function'
    );
  } catch {
    return false;
  }
}

/**
 * Light tap vibration for petting the cat.
 */
export async function hapticPet(enabled = true): Promise<void> {
  if (!enabled) return;
  try {
    if (Capacitor.isNativePlatform()) {
      await Haptics.impact({ style: ImpactStyle.Light });
      return;
    }
  } catch {
    // Fall back to web vibration below
  }

  try {
    if (typeof navigator !== 'undefined' && typeof navigator.vibrate === 'function') {
      navigator.vibrate(15);
    }
  } catch {
    // Graceful no-op on unsupported platforms
  }
}

/**
 * Distinct medium pulse vibration for feeding a food treat.
 */
export async function hapticFeed(enabled = true): Promise<void> {
  if (!enabled) return;
  try {
    if (Capacitor.isNativePlatform()) {
      await Haptics.impact({ style: ImpactStyle.Medium });
      return;
    }
  } catch {
    // Fall back to web vibration below
  }

  try {
    if (typeof navigator !== 'undefined' && typeof navigator.vibrate === 'function') {
      navigator.vibrate([25, 40, 35]);
    }
  } catch {
    // Graceful no-op on unsupported platforms
  }
}

/**
 * Celebratory double pulse vibration matching the retro coin chime
 * when checking off a goal as completed.
 */
export async function hapticTaskComplete(enabled = true): Promise<void> {
  if (!enabled) return;
  try {
    if (Capacitor.isNativePlatform()) {
      await Haptics.notification({ type: NotificationType.Success });
      return;
    }
  } catch {
    // Fall back to web vibration below
  }

  try {
    if (typeof navigator !== 'undefined' && typeof navigator.vibrate === 'function') {
      navigator.vibrate([40, 60, 60]);
    }
  } catch {
    // Graceful no-op on unsupported platforms
  }
}

/**
 * Crisp tactile feedback for interactive buttons (+ Add, Custom, Quick Add, Modals, Checkboxes).
 */
export async function hapticButtonTap(enabled = true): Promise<void> {
  if (!enabled) return;
  try {
    if (Capacitor.isNativePlatform()) {
      await Haptics.impact({ style: ImpactStyle.Light });
      return;
    }
  } catch {
    // Fall back to web vibration below
  }

  try {
    if (typeof navigator !== 'undefined' && typeof navigator.vibrate === 'function') {
      navigator.vibrate(12);
    }
  } catch {
    // Graceful no-op on unsupported platforms
  }
}

/**
 * Selection tick for tabs switching, category filters, and color pickers.
 */
export async function hapticSelection(enabled = true): Promise<void> {
  if (!enabled) return;
  try {
    if (Capacitor.isNativePlatform()) {
      await Haptics.selectionChanged();
      return;
    }
  } catch {
    // Fall back to web vibration below
  }

  try {
    if (typeof navigator !== 'undefined' && typeof navigator.vibrate === 'function') {
      navigator.vibrate(8);
    }
  } catch {
    // Graceful no-op on unsupported platforms
  }
}
