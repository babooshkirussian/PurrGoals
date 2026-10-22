import React from 'react';
import { FoodType } from '../types/index';
import { FOOD_INFO } from '../utils/pixelCatData';
import { playClickSound } from '../utils/audio';

interface FoodInventoryTrayProps {
  inventory: Record<FoodType, number>;
  selectedFood: FoodType | null;
  onSelectFood: (food: FoodType) => void;
  onFeedDirectly: (food: FoodType) => void;
  catName: string;
  soundEnabled: boolean;
}

export const FoodInventoryTray: React.FC<FoodInventoryTrayProps> = ({
  inventory,
  selectedFood,
  onSelectFood,
  onFeedDirectly,
  catName,
  soundEnabled,
}) => {
  const foodTypes: FoodType[] = ['fish', 'tuna_can', 'milk', 'biscuit', 'shrimp'];
  const totalFoodCount = Object.values(inventory).reduce((a, b) => a + b, 0);

  return (
    <div className="retro-box bg-[#fffbeb] dark:bg-[#1c1917] p-3 text-stone-900 dark:text-stone-100">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-1.5">
          <span className="text-base">🍱</span>
          <span className="font-pixel text-[11px] text-stone-900 dark:text-amber-200">
            Food Pantry
          </span>
        </div>
        <span className="font-pixel text-[9px] text-stone-500 dark:text-stone-400">
          {totalFoodCount} {totalFoodCount === 1 ? 'treat' : 'treats'} earned
        </span>
      </div>

      {totalFoodCount === 0 ? (
        <div className="retro-box-sm bg-[#faeed8] dark:bg-[#292524] p-3 text-center">
          <p className="font-pixel text-[10px] text-stone-700 dark:text-stone-300">
            Pantry is empty!
          </p>
          <p className="text-xs text-stone-500 mt-1">
            Complete tasks to earn fresh fish, milk, and crunchy treats for {catName}!
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          <div className="grid grid-cols-5 gap-1.5 sm:gap-2">
            {foodTypes.map((type) => {
              const info = FOOD_INFO[type];
              const count = inventory[type] || 0;
              const isSelected = selectedFood === type;
              const hasItems = count > 0;

              return (
                <button
                  key={type}
                  disabled={!hasItems}
                  onClick={() => {
                    if (!hasItems) return;
                    playClickSound(soundEnabled);
                    onSelectFood(type);
                  }}
                  className={`retro-btn relative p-1.5 sm:p-2 flex flex-col items-center justify-center rounded-sm transition-all ${
                    !hasItems
                      ? 'opacity-40 grayscale cursor-not-allowed bg-stone-200 dark:bg-stone-800'
                      : isSelected
                      ? 'bg-amber-300 dark:bg-amber-800 ring-2 ring-stone-900 scale-105'
                      : 'bg-white dark:bg-stone-800 hover:bg-amber-50'
                  }`}
                  aria-label={`${info.name}: ${count} available`}
                >
                  <span className="text-xl sm:text-2xl">{info.icon}</span>
                  <span className="font-pixel text-[8px] text-stone-800 dark:text-stone-200 mt-0.5 truncate max-w-full">
                    {info.name.split(' ')[0]}
                  </span>

                  {/* Quantity badge */}
                  <span
                    className={`absolute -top-1.5 -right-1.5 font-pixel text-[8px] px-1 py-0.2 rounded-xs border border-stone-800 ${
                      hasItems ? 'bg-rose-500 text-white' : 'bg-stone-400 text-white'
                    }`}
                  >
                    {count}
                  </span>
                </button>
              );
            })}
          </div>

          {selectedFood && (
            <div className="flex items-center justify-between bg-amber-100 dark:bg-stone-800 p-2 retro-box-sm">
              <div className="text-xs text-stone-700 dark:text-stone-300">
                Selected: <span className="font-bold">{FOOD_INFO[selectedFood].name}</span>
              </div>
              <button
                onClick={() => onFeedDirectly(selectedFood)}
                className="retro-btn px-3 py-1 bg-emerald-500 text-white font-pixel text-[9px] hover:bg-emerald-600"
              >
                Feed to {catName} 🥣
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
