import React, { useState, useEffect, useRef } from 'react';
import { CatAnimationState, CatConfig, FoodType } from '../types/index';
import { CAT_QUOTES, FOOD_INFO } from '../utils/pixelCatData';
import { playCatMeow, playCatPurr, playClickSound } from '../utils/audio';
import { drawRoom320 } from '../utils/pixelCat320';
import { getCatGifForState, IdleVariant } from '../utils/catGifs';
import { hapticPet, hapticFeed, hapticButtonTap, hapticSelection } from '../utils/haptics';

interface PixelRoomProps {
  catConfig: CatConfig;
  animationState: CatAnimationState;
  happinessPct: number;
  onFeedCat: (food: FoodType) => void;
  soundEnabled: boolean;
  hapticsEnabled?: boolean;
  selectedFoodForFeeding: FoodType | null;
  onClearSelectedFood: () => void;
  onOpenCustomize?: () => void;
}

export const PixelRoom: React.FC<PixelRoomProps> = ({
  catConfig,
  animationState,
  happinessPct,
  onFeedCat,
  soundEnabled,
  hapticsEnabled = true,
  selectedFoodForFeeding,
  onClearSelectedFood,
  onOpenCustomize,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [frameIndex, setFrameIndex] = useState(0);
  const [speechText, setSpeechText] = useState<string>('');
  const [speechTimer, setSpeechTimer] = useState<NodeJS.Timeout | null>(null);
  const [isNight, setIsNight] = useState<boolean>(false);
  const [bowlHasFood, setBowlHasFood] = useState<boolean>(false);
  const [isPetting, setIsPetting] = useState<boolean>(false);
  const [idleVariant, setIdleVariant] = useState<IdleVariant>('default');
  const [gifLoadError, setGifLoadError] = useState<boolean>(false);
  const petTimerRef = useRef<NodeJS.Timeout | null>(null);
  const idleCycleCountRef = useRef<number>(0);

  // Check day/night on load
  useEffect(() => {
    const hours = new Date().getHours();
    setIsNight(hours < 6 || hours >= 19);
  }, []);

  // Frame ticker: 260ms per frame for smooth 320x180 pixel animation
  useEffect(() => {
    const timer = setInterval(() => {
      setFrameIndex((prev) => (prev + 1) % 4);
    }, 260);
    return () => clearInterval(timer);
  }, []);

  // Periodically cycle idle.gif with alternate idle.gif and licking.gif when idle
  useEffect(() => {
    if (animationState !== 'idle') {
      setIdleVariant('default');
      return;
    }
    const interval = setInterval(() => {
      idleCycleCountRef.current += 1;
      const nextVariant: IdleVariant =
        idleCycleCountRef.current % 2 === 1 ? 'alternate' : 'licking';
      setIdleVariant(nextVariant);
      setTimeout(() => setIdleVariant('default'), 3200);
    }, 11000);
    return () => clearInterval(interval);
  }, [animationState]);

  const activeGifSrc = getCatGifForState({
    animationState,
    isPetting,
    idleVariant,
  });

  // Update speech bubble based on animation state changes
  useEffect(() => {
    if (animationState === 'hungry') {
      triggerSpeech("Meow... tummy is grumbling! Any tasks ready?", 5000);
    } else if (animationState === 'celebrating') {
      triggerSpeech("YAY!! All daily goals done! Best hooman ever! ✨", 6000);
    } else if (animationState === 'eating') {
      triggerSpeech("*munch munch crunch* So tasty!!", 3000);
    } else if (animationState === 'sleepy') {
      triggerSpeech("zzz... curling up for a quick cozy snooze...", 4000);
    }
  }, [animationState]);

  const triggerSpeech = (msg: string, duration = 4000) => {
    if (speechTimer) clearTimeout(speechTimer);
    setSpeechText(msg);
    const timer = setTimeout(() => {
      setSpeechText('');
    }, duration);
    setSpeechTimer(timer);
  };

  const handlePet = () => {
    const randomQuote = CAT_QUOTES[Math.floor(Math.random() * CAT_QUOTES.length)];
    triggerSpeech(randomQuote, 4000);

    // Trigger Petting cat.gif animation for one full cycle (~2.8s)
    if (petTimerRef.current) clearTimeout(petTimerRef.current);
    setIsPetting(true);
    petTimerRef.current = setTimeout(() => {
      setIsPetting(false);
    }, 2800);

    // Light tap haptic pulse for petting
    hapticPet(hapticsEnabled);

    // Alternate between new user audio files
    if (Math.random() > 0.4) {
      playCatPurr(soundEnabled);
    } else {
      playCatMeow(soundEnabled);
    }
  };

  const handleFeedAction = () => {
    if (selectedFoodForFeeding) {
      setBowlHasFood(true);
      // Distinct medium haptic pulse for feeding
      hapticFeed(hapticsEnabled);
      onFeedCat(selectedFoodForFeeding);
      onClearSelectedFood();
      setTimeout(() => setBowlHasFood(false), 2500);
    } else {
      hapticButtonTap(hapticsEnabled);
      triggerSpeech("Select a treat from your food pantry below to feed me!", 3500);
    }
  };

  // Render 320x180 Canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    drawRoom320(ctx, {
      catConfig,
      animationState,
      frameIndex,
      selectedFood: selectedFoodForFeeding,
      bowlHasFood,
      isNight,
      speechText,
      hideCanvasCat: !gifLoadError,
    });
  }, [
    catConfig,
    animationState,
    frameIndex,
    selectedFoodForFeeding,
    bowlHasFood,
    isNight,
    speechText,
    gifLoadError,
  ]);

  // Canvas Click Handler (Interactive coordinates on 320x180)
  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const scaleX = 320 / rect.width;
    const scaleY = 180 / rect.height;
    const x = (e.clientX - rect.left) * scaleX;
    const y = (e.clientY - rect.top) * scaleY;

    // Cat bounding box: ~ (120..190, 60..140)
    if (x >= 115 && x <= 195 && y >= 60 && y <= 145) {
      handlePet();
      return;
    }

    // Food bowl bounding box: ~ (200..235, 130..155)
    if (x >= 198 && x <= 236 && y >= 126 && y <= 156) {
      handleFeedAction();
      return;
    }

    // Window click: toggles day / night view
    if (x >= 20 && x <= 92 && y >= 10 && y <= 82) {
      setIsNight(!isNight);
      playClickSound(soundEnabled);
      hapticSelection(hapticsEnabled);
      triggerSpeech(isNight ? "The sun is coming up! ☀️" : "The stars are out! 🌙", 3000);
      return;
    }

    // Generic tap in room
    handlePet();
  };

  return (
    <div className="relative w-full overflow-hidden retro-box bg-[#faeed8] dark:bg-[#1e1b2e] rounded-sm transition-colors duration-200">
      {/* 320x180 Resolution Retro Pixel Room Canvas */}
      <div className="relative w-full aspect-[16/9] bg-[#090d16]">
        <canvas
          ref={canvasRef}
          width={320}
          height={180}
          onClick={handleCanvasClick}
          aria-label={`Interactive 320x180 room with ${catConfig.name}`}
          className="pixelated w-full h-full block cursor-pointer select-none"
          style={{ imageRendering: 'pixelated' }}
        />

        {/* Animated Pixel Cat GIF Overlay positioned on the cozy rug */}
        {!gifLoadError && (
          <img
            src={activeGifSrc}
            alt={`${catConfig.name} (${isPetting ? 'petting' : animationState})`}
            onError={() => setGifLoadError(true)}
            className="pixelated absolute left-1/2 -translate-x-1/2 bottom-[9%] h-[54%] w-auto pointer-events-none select-none object-contain"
            style={{ imageRendering: 'pixelated' }}
          />
        )}

        {/* Feeding hint overlay */}
        {selectedFoodForFeeding && (
          <div className="absolute top-2 left-1/2 -translate-x-1/2 bg-amber-400 text-stone-900 border-2 border-stone-800 px-3 py-1 font-pixel text-[9px] shadow-md animate-pulse pointer-events-none">
            Tap bowl or FEED button to feed {FOOD_INFO[selectedFoodForFeeding].name}!
          </div>
        )}
      </div>

      {/* Floor Control Strip */}
      <div className="border-t-4 border-stone-800 dark:border-stone-700 py-1.5 px-2 sm:px-3 flex items-center justify-between gap-1 sm:gap-2 bg-[#ecd9bc] dark:bg-[#181524]">
        {/* Left: Pet / Interaction hint */}
        <button
          onClick={handlePet}
          aria-label={`Pet ${catConfig.name}`}
          className="retro-btn px-2 sm:px-2.5 py-1 bg-white dark:bg-stone-800 text-stone-800 dark:text-stone-200 font-pixel text-[9px] flex items-center gap-1 sm:gap-1.5"
        >
          <span>🐾</span>
          <span>Pet {catConfig.name}</span>
        </button>

        <div className="flex items-center gap-1 sm:gap-1.5">
          {/* Day/Night Toggle */}
          <button
            onClick={() => {
              playClickSound(soundEnabled);
              hapticSelection(hapticsEnabled);
              setIsNight(!isNight);
              triggerSpeech(isNight ? "The sun is coming up! ☀️" : "The stars are out! 🌙", 3000);
            }}
            title="Toggle Room Day/Night"
            className="retro-btn px-2 py-1 bg-stone-100 dark:bg-stone-700 font-pixel text-[9px] flex items-center gap-1 text-stone-800 dark:text-stone-200"
          >
            <span>{isNight ? '🌙' : '☀️'}</span>
            <span className="hidden xs:inline sm:inline">{isNight ? 'Night' : 'Day'}</span>
          </button>

          {/* In-Room Customize Cat Button (especially accessible on mobile) */}
          {onOpenCustomize && (
            <button
              onClick={() => {
                playClickSound(soundEnabled);
                hapticButtonTap(hapticsEnabled);
                onOpenCustomize();
              }}
              title={`Customize ${catConfig.name}`}
              className="retro-btn px-2 py-1 bg-amber-400 hover:bg-amber-300 text-stone-900 font-pixel text-[9px] flex items-center gap-1"
            >
              <span>🐱</span>
              <span className="hidden xs:inline sm:inline">Style</span>
            </button>
          )}

          {/* Right: Interactive Bowl Button */}
          <button
            onClick={handleFeedAction}
            aria-label="Feed cat at food bowl"
            className={`retro-btn px-2 sm:px-2.5 py-1 rounded-sm flex items-center gap-1 sm:gap-1.5 transition-all ${
              selectedFoodForFeeding
                ? 'bg-amber-400 text-stone-900 ring-2 ring-emerald-500 scale-105'
                : 'bg-white dark:bg-stone-800 text-stone-800 dark:text-stone-200'
            }`}
          >
            <span className="text-sm">
              {bowlHasFood || animationState === 'eating'
                ? '🐟'
                : animationState === 'hungry'
                ? '🥣'
                : '🍲'}
            </span>
            <span className="font-pixel text-[9px]">
              {selectedFoodForFeeding ? 'FEED' : 'BOWL'}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};
