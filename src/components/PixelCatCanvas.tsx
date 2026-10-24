import React, { useEffect, useRef, useState } from 'react';
import { CatAnimationState, CatConfig, FoodType } from '../types/index';
import { drawRoom320 } from '../utils/pixelCat320';
import { getCatGifForState } from '../utils/catGifs';

interface PixelCatCanvasProps {
  catConfig: CatConfig;
  animationState: CatAnimationState;
  onPetCat?: () => void;
  activeFeedingItem?: FoodType | null;
}

export const PixelCatCanvas: React.FC<PixelCatCanvasProps> = ({
  catConfig,
  animationState,
  onPetCat,
  activeFeedingItem = null,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [frameIndex, setFrameIndex] = useState(0);
  const [isPetting, setIsPetting] = useState(false);
  const [gifLoadError, setGifLoadError] = useState(false);
  const petTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Smooth animation ticker
  useEffect(() => {
    const timer = setInterval(() => {
      setFrameIndex((prev) => (prev + 1) % 4);
    }, 280);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    drawRoom320(ctx, {
      catConfig,
      animationState,
      frameIndex,
      selectedFood: activeFeedingItem,
      bowlHasFood: false,
      isNight: false,
      hideCanvasCat: !gifLoadError,
    });
  }, [catConfig, animationState, frameIndex, activeFeedingItem, gifLoadError]);

  const activeGifSrc = getCatGifForState({
    animationState,
    isPetting,
  });

  const handleClick = () => {
    if (petTimerRef.current) clearTimeout(petTimerRef.current);
    setIsPetting(true);
    petTimerRef.current = setTimeout(() => setIsPetting(false), 2800);
    onPetCat?.();
  };

  return (
    <div
      onClick={handleClick}
      role="button"
      tabIndex={0}
      aria-label={`Pet ${catConfig.name}`}
      className="relative w-full max-w-[320px] aspect-[16/9] cursor-pointer transition-transform hover:scale-[1.02] active:scale-95 select-none mx-auto overflow-hidden border-2 border-stone-800"
    >
      <canvas
        ref={canvasRef}
        width={320}
        height={180}
        className="pixelated w-full h-full block"
        style={{ imageRendering: 'pixelated' }}
      />
      {!gifLoadError && (
        <img
          src={activeGifSrc}
          alt={`${catConfig.name} (${isPetting ? 'petting' : animationState})`}
          onError={() => setGifLoadError(true)}
          className="pixelated absolute left-1/2 -translate-x-1/2 bottom-[9%] h-[54%] w-auto pointer-events-none select-none object-contain"
          style={{ imageRendering: 'pixelated' }}
        />
      )}
    </div>
  );
};
