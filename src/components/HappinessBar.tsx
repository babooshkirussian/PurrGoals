import React from 'react';

interface HappinessBarProps {
  happinessPct: number;
  streak: number;
  coins: number;
  tasksCompleted: number;
  totalTasksToday: number;
  catName: string;
}

export const HappinessBar: React.FC<HappinessBarProps> = ({
  happinessPct,
  streak,
  coins,
  tasksCompleted,
  totalTasksToday,
  catName,
}) => {
  // 5 hearts system: each heart represents 20%
  const fullHearts = Math.min(5, Math.floor(happinessPct / 20));
  const hasHalfHeart = happinessPct % 20 >= 10 && fullHearts < 5;

  let moodLabel = 'Hungry & Sad';
  let moodColor = 'text-rose-500';

  if (totalTasksToday === 0) {
    moodLabel = 'Cozy & Ready';
    moodColor = 'text-amber-500';
  } else if (happinessPct === 100) {
    moodLabel = 'Ecstatic & Joyful! ✨';
    moodColor = 'text-emerald-500';
  } else if (happinessPct >= 50) {
    moodLabel = 'Content & Purring';
    moodColor = 'text-teal-500';
  } else if (happinessPct > 0) {
    moodLabel = 'Waiting for Food';
    moodColor = 'text-amber-600';
  }

  return (
    <div className="retro-box bg-[#fffbeb] dark:bg-[#18181b] p-3 text-stone-900 dark:text-stone-100">
      <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
        {/* Cat Name & Mood */}
        <div className="flex items-center gap-2">
          <span className="font-pixel text-xs text-stone-900 dark:text-amber-200">
            {catName}:
          </span>
          <span className={`font-pixel text-[10px] ${moodColor}`}>
            {moodLabel}
          </span>
        </div>

        {/* Coins & Streak */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1 retro-box-sm bg-amber-100 dark:bg-stone-800 px-2 py-0.5">
            <span className="text-xs">🔥</span>
            <span className="font-pixel text-[9px] text-amber-800 dark:text-amber-300">
              {streak}d
            </span>
          </div>
          <div className="flex items-center gap-1 retro-box-sm bg-amber-200 dark:bg-amber-950 px-2 py-0.5">
            <span className="text-xs">🪙</span>
            <span className="font-pixel text-[9px] text-amber-900 dark:text-amber-200">
              {coins}
            </span>
          </div>
        </div>
      </div>

      {/* 5-Heart Pixel Happiness Bar */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5" aria-label={`Happiness ${happinessPct}%`}>
          {[0, 1, 2, 3, 4].map((i) => {
            const isFull = i < fullHearts;
            const isHalf = !isFull && i === fullHearts && hasHalfHeart;

            return (
              <div
                key={i}
                className="w-6 h-6 flex items-center justify-center text-sm transition-transform hover:scale-110"
              >
                {isFull ? (
                  <span className="text-rose-500 drop-shadow-sm animate-pulse">❤️</span>
                ) : isHalf ? (
                  <span className="text-rose-400">💔</span>
                ) : (
                  <span className="text-stone-400 dark:text-stone-600 grayscale opacity-40">🤍</span>
                )}
              </div>
            );
          })}
        </div>

        {/* Task progress info */}
        <div className="font-pixel text-[9px] text-stone-600 dark:text-stone-400">
          {totalTasksToday === 0
            ? 'No goals yet'
            : `${tasksCompleted}/${totalTasksToday} done (${happinessPct}%)`}
        </div>
      </div>

      {/* Chunky Progress meter line */}
      <div className="w-full h-2.5 bg-stone-300 dark:bg-stone-700 border border-stone-800 mt-2 overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-amber-400 via-rose-400 to-emerald-400 transition-all duration-500"
          style={{ width: `${happinessPct}%` }}
        />
      </div>
    </div>
  );
};
