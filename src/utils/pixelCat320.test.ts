import test from 'node:test';
import assert from 'node:assert/strict';
import {
  CAT_SPRITE_29x32,
  CAT_SLEEPING_SPRITE_29x32,
  CAT_NATIVE_58x64,
  CAT_SLEEPING_NATIVE_58x64,
} from './pixelCat320.ts';

test('CAT_SPRITE_29x32 dimensions and upright tail structure', () => {
  assert.equal(CAT_SPRITE_29x32.length, 32);
  for (let r = 0; r < CAT_SPRITE_29x32.length; r++) {
    assert.equal(CAT_SPRITE_29x32[r].length, 29);
  }

  // Tail is straight upright at columns 6-8 on rows 0-9
  for (let r = 0; r <= 9; r++) {
    const row = CAT_SPRITE_29x32[r];
    assert.equal(row[6], '#');
    assert.equal(row[7], '#');
    assert.equal(row[8], '#');
  }

  // Vertical slit eyes at column 18 and 23 on rows 11-13
  for (let r = 11; r <= 13; r++) {
    assert.equal(CAT_SPRITE_29x32[r][18], 'W');
    assert.equal(CAT_SPRITE_29x32[r][23], 'W');
  }
});

test('CAT_NATIVE_58x64 is scaled to 58x64 for 1px resolution on 320x180 canvas', () => {
  assert.equal(CAT_NATIVE_58x64.length, 64);
  for (let r = 0; r < CAT_NATIVE_58x64.length; r++) {
    assert.equal(CAT_NATIVE_58x64[r].length, 58);
  }
  assert.equal(CAT_SLEEPING_NATIVE_58x64.length, 64);
  assert.equal(CAT_SLEEPING_SPRITE_29x32.length, 32);
});
