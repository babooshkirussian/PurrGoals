import test from 'node:test';
import assert from 'node:assert/strict';
import {
  isHapticsSupported,
  hapticPet,
  hapticFeed,
  hapticTaskComplete,
  hapticButtonTap,
  hapticSelection,
} from './haptics';

test('isHapticsSupported returns boolean without crashing in test environment', () => {
  const supported = isHapticsSupported();
  assert.equal(typeof supported, 'boolean');
});

test('haptic functions resolve without error when disabled (enabled = false)', async () => {
  await assert.doesNotReject(async () => {
    await hapticPet(false);
    await hapticFeed(false);
    await hapticTaskComplete(false);
    await hapticButtonTap(false);
    await hapticSelection(false);
  });
});

test('haptic functions resolve safely without error in environment without vibration hardware', async () => {
  await assert.doesNotReject(async () => {
    await hapticPet(true);
    await hapticFeed(true);
    await hapticTaskComplete(true);
    await hapticButtonTap(true);
    await hapticSelection(true);
  });
});

test('haptic functions invoke navigator.vibrate with expected patterns in browser-like environment', async () => {
  const calls: Array<number | number[]> = [];

  const originalVibrate = Object.getOwnPropertyDescriptor(globalThis.navigator, 'vibrate');
  try {
    Object.defineProperty(globalThis.navigator, 'vibrate', {
      value: (pattern: number | number[]) => {
        calls.push(pattern);
        return true;
      },
      configurable: true,
      writable: true,
    });

    assert.equal(isHapticsSupported(), true);

    await hapticPet(true);
    assert.deepEqual(calls[calls.length - 1], 15);

    await hapticFeed(true);
    assert.deepEqual(calls[calls.length - 1], [25, 40, 35]);

    await hapticTaskComplete(true);
    assert.deepEqual(calls[calls.length - 1], [40, 60, 60]);

    await hapticButtonTap(true);
    assert.deepEqual(calls[calls.length - 1], 12);

    await hapticSelection(true);
    assert.deepEqual(calls[calls.length - 1], 8);
  } finally {
    if (originalVibrate) {
      Object.defineProperty(globalThis.navigator, 'vibrate', originalVibrate);
    } else {
      delete (globalThis.navigator as any).vibrate;
    }
  }
});

test('haptic functions catch and suppress any runtime errors from vibration API', async () => {
  const originalVibrate = Object.getOwnPropertyDescriptor(globalThis.navigator, 'vibrate');
  try {
    Object.defineProperty(globalThis.navigator, 'vibrate', {
      value: () => {
        throw new Error('Hardware error');
      },
      configurable: true,
      writable: true,
    });

    await assert.doesNotReject(async () => {
      await hapticPet(true);
      await hapticFeed(true);
      await hapticTaskComplete(true);
      await hapticButtonTap(true);
      await hapticSelection(true);
    });
  } finally {
    if (originalVibrate) {
      Object.defineProperty(globalThis.navigator, 'vibrate', originalVibrate);
    } else {
      delete (globalThis.navigator as any).vibrate;
    }
  }
});
