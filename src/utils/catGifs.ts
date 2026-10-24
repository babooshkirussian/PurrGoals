import { CatAnimationState } from '../types/index';

export const CAT_GIF_PATHS = {
  idle: '/assets/cats/idle.gif',
  alternateIdle: '/assets/cats/alternate%20idle.gif',
  petting: '/assets/cats/Petting%20cat.gif',
  sleeping: '/assets/cats/sleeping.gif',
  crying: '/assets/cats/crying.gif',
  licking: '/assets/cats/licking.gif',
} as const;

export type IdleVariant = 'default' | 'alternate' | 'licking';

export interface CatGifSelectionOptions {
  animationState: CatAnimationState;
  isPetting?: boolean;
  useAlternateIdle?: boolean;
  idleVariant?: IdleVariant;
}

/**
 * Resolves the appropriate animated cat GIF path for the current state.
 */
export function getCatGifForState({
  animationState,
  isPetting = false,
  useAlternateIdle = false,
  idleVariant,
}: CatGifSelectionOptions): string {
  if (isPetting) {
    return CAT_GIF_PATHS.petting;
  }

  switch (animationState) {
    case 'happy':
      return CAT_GIF_PATHS.petting;
    case 'sleepy':
      return CAT_GIF_PATHS.sleeping;
    case 'hungry':
      return CAT_GIF_PATHS.crying;
    case 'eating':
      return CAT_GIF_PATHS.licking;
    case 'celebrating':
      return CAT_GIF_PATHS.alternateIdle;
    case 'idle':
    default: {
      if (idleVariant === 'licking') return CAT_GIF_PATHS.licking;
      if (idleVariant === 'alternate' || useAlternateIdle) return CAT_GIF_PATHS.alternateIdle;
      return CAT_GIF_PATHS.idle;
    }
  }
}
