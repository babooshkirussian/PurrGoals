import test from 'node:test';
import assert from 'node:assert/strict';
import { getCatGifForState, CAT_GIF_PATHS } from './catGifs';

test('getCatGifForState returns matching GIF for all 6 cat GIF animations', () => {
  assert.equal(getCatGifForState({ animationState: 'idle' }), CAT_GIF_PATHS.idle);
  assert.equal(
    getCatGifForState({ animationState: 'idle', idleVariant: 'alternate' }),
    CAT_GIF_PATHS.alternateIdle
  );
  assert.equal(
    getCatGifForState({ animationState: 'idle', idleVariant: 'licking' }),
    CAT_GIF_PATHS.licking
  );
  assert.equal(
    getCatGifForState({ animationState: 'idle', isPetting: true }),
    CAT_GIF_PATHS.petting
  );
  assert.equal(getCatGifForState({ animationState: 'happy' }), CAT_GIF_PATHS.petting);
  assert.equal(getCatGifForState({ animationState: 'sleepy' }), CAT_GIF_PATHS.sleeping);
  assert.equal(getCatGifForState({ animationState: 'hungry' }), CAT_GIF_PATHS.crying);
  assert.equal(getCatGifForState({ animationState: 'eating' }), CAT_GIF_PATHS.licking);
  assert.equal(getCatGifForState({ animationState: 'celebrating' }), CAT_GIF_PATHS.alternateIdle);
});
