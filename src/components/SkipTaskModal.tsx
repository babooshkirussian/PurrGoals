import React, { useState } from 'react';
import { Task } from '../types/index';
import { playClickSound } from '../utils/audio';
import { hapticButtonTap, hapticSelection } from '../utils/haptics';

interface SkipTaskModalProps {
  task: Task;
  catName: string;
  onConfirmSkip: (taskId: string, reason: string) => void;
  onClose: () => void;
  soundEnabled: boolean;
  hapticsEnabled?: boolean;
}

export const SkipTaskModal: React.FC<SkipTaskModalProps> = ({
  task,
  catName,
  onConfirmSkip,
  onClose,
  soundEnabled,
  hapticsEnabled = true,
}) => {
  const [reason, setReason] = useState('Rest day / Rescheduled');
  const suggestions = [
    'Rest day / recharge',
    'Rescheduled for tomorrow',
    'Feeling under the weather',
    'Blocked by other tasks',
    'Already covered earlier',
  ];

  const handleSkip = () => {
    playClickSound(soundEnabled);
    hapticButtonTap(hapticsEnabled);
    onConfirmSkip(task.id, reason);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <div className="retro-box w-full max-w-sm bg-[#fffbeb] dark:bg-[#1c1917] p-4 text-stone-900 dark:text-stone-100">
        <div className="flex items-center justify-between border-b-2 border-stone-800 pb-2 mb-3">
          <div className="flex items-center gap-1.5">
            <span className="text-xl">⏸️</span>
            <h3 className="font-pixel text-xs text-stone-900 dark:text-amber-100">
              Skip Goal For Today?
            </h3>
          </div>
          <button
            onClick={() => {
              playClickSound(soundEnabled);
              hapticButtonTap(hapticsEnabled);
              onClose();
            }}
            aria-label="Close"
            className="retro-btn px-2 py-0.5 bg-stone-300 dark:bg-stone-700 font-pixel text-[10px]"
          >
            ✕
          </button>
        </div>

        <p className="text-xs text-stone-600 dark:text-stone-400 mb-2">
          Skipping is totally okay! Giving a reason lets {catName} know you didn&apos;t just forget,
          so {catName}&apos;s mood won&apos;t drop as much as an overdue task.
        </p>

        <div className="mb-3">
          <label className="block font-pixel text-[9px] mb-1 text-stone-700 dark:text-stone-300">
            Reason for skipping:
          </label>
          <input
            type="text"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            className="w-full retro-box-sm px-2.5 py-1.5 bg-white dark:bg-stone-900 font-pixel text-xs text-stone-900 dark:text-white outline-none mb-2"
          />

          <div className="flex flex-wrap gap-1">
            {suggestions.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => {
                  playClickSound(soundEnabled);
                  hapticSelection(hapticsEnabled);
                  setReason(s);
                }}
                className="retro-btn px-2 py-0.5 bg-stone-100 dark:bg-stone-800 text-[10px] text-stone-700 dark:text-stone-300"
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => {
              playClickSound(soundEnabled);
              hapticButtonTap(hapticsEnabled);
              onClose();
            }}
            className="retro-btn flex-1 py-1.5 bg-stone-200 dark:bg-stone-700 font-pixel text-[10px]"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSkip}
            className="retro-btn flex-1 py-1.5 bg-amber-500 text-white font-pixel text-[10px]"
          >
            Skip Goal
          </button>
        </div>
      </div>
    </div>
  );
};
