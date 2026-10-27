import { CatAnimationState, FurColor } from '../types/index';

export const CAT_GIF_FILES = {
  idle: 'idle.gif',
  alternateIdle: 'alternate%20idle.gif',
  petting: 'Petting%20cat.gif',
  sleeping: 'sleeping.gif',
  crying: 'crying.gif',
  licking: 'licking.gif',
} as const;

export const CAT_GIF_PATHS = {
  idle: `/assets/cats/${CAT_GIF_FILES.idle}`,
  alternateIdle: `/assets/cats/${CAT_GIF_FILES.alternateIdle}`,
  petting: `/assets/cats/${CAT_GIF_FILES.petting}`,
  sleeping: `/assets/cats/${CAT_GIF_FILES.sleeping}`,
  crying: `/assets/cats/${CAT_GIF_FILES.crying}`,
  licking: `/assets/cats/${CAT_GIF_FILES.licking}`,
} as const;

export type IdleVariant = 'default' | 'alternate' | 'licking';

export interface CatGifSelectionOptions {
  animationState: CatAnimationState;
  furColor?: FurColor;
  isPetting?: boolean;
  useAlternateIdle?: boolean;
  idleVariant?: IdleVariant;
}

function getCoatPrefix(furColor?: FurColor): string {
  if (furColor === 'white') return '/assets/cats/white';
  if (furColor === 'black') return '/assets/cats/black';
  return '/assets/cats';
}

/**
 * Resolves the appropriate animated cat GIF path for the current state and coat model (orange, white, black).
 */
export function getCatGifForState({
  animationState,
  furColor,
  isPetting = false,
  useAlternateIdle = false,
  idleVariant,
}: CatGifSelectionOptions): string {
  const prefix = getCoatPrefix(furColor);

  if (isPetting) {
    return `${prefix}/${CAT_GIF_FILES.petting}`;
  }

  switch (animationState) {
    case 'happy':
      return `${prefix}/${CAT_GIF_FILES.petting}`;
    case 'sleepy':
      return `${prefix}/${CAT_GIF_FILES.sleeping}`;
    case 'hungry':
      return `${prefix}/${CAT_GIF_FILES.crying}`;
    case 'eating':
      return `${prefix}/${CAT_GIF_FILES.licking}`;
    case 'celebrating':
      return `${prefix}/${CAT_GIF_FILES.alternateIdle}`;
    case 'idle':
    default: {
      if (idleVariant === 'licking') return `${prefix}/${CAT_GIF_FILES.licking}`;
      if (idleVariant === 'alternate' || useAlternateIdle) {
        return `${prefix}/${CAT_GIF_FILES.alternateIdle}`;
      }
      return `${prefix}/${CAT_GIF_FILES.idle}`;
    }
  }
}
