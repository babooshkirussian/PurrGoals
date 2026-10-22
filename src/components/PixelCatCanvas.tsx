import React, { useEffect, useRef, useState } from 'react';
import { CatAnimationState, CatConfig, FoodType } from '../types/index';
import { drawRoom320 } from '../utils/pixelCat320';

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
    });
  }, [catConfig, animationState, frameIndex, activeFeedingItem]);

  return (
    <div
      onClick={onPetCat}
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
    </div>
  );
};
