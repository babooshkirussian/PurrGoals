import test from 'node:test';
import assert from 'node:assert/strict';
import { getCatGifForState, CAT_GIF_PATHS } from './catGifs';

test('getCatGifForState returns matching GIF for all 6 cat GIF animations and coat models', () => {
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

  // White cat model
  assert.equal(
    getCatGifForState({ animationState: 'idle', furColor: 'white' }),
    '/assets/cats/white/idle.gif'
  );
  assert.equal(
    getCatGifForState({ animationState: 'hungry', furColor: 'white' }),
    '/assets/cats/white/crying.gif'
  );

  // Black cat model
  assert.equal(
    getCatGifForState({ animationState: 'idle', furColor: 'black' }),
    '/assets/cats/black/idle.gif'
  );
  assert.equal(
    getCatGifForState({ animationState: 'sleepy', furColor: 'black' }),
    '/assets/cats/black/sleeping.gif'
  );
});
