import React, { useState, useEffect } from 'react';
import { Task } from '../types/index';
import { playClickSound, playTimerDing, playFanfareSound } from '../utils/audio';

interface FocusTimerModalProps {
  task: Task;
  catName: string;
  onCompleteTask: (taskId: string) => void;
  onClose: () => void;
  soundEnabled: boolean;
}

export const FocusTimerModal: React.FC<FocusTimerModalProps> = ({
  task,
  catName,
  onCompleteTask,
  onClose,
  soundEnabled,
}) => {
  const defaultMinutes = task.timerDuration || 25;
  const [secondsLeft, setSecondsLeft] = useState(defaultMinutes * 60);
  const [isActive, setIsActive] = useState(false);
  const [isFinished, setIsFinished] = useState(false);

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (isActive && secondsLeft > 0) {
      interval = setInterval(() => {
        setSecondsLeft((prev) => prev - 1);
      }, 1000);
    } else if (isActive && secondsLeft === 0) {
      setIsActive(false);
      setIsFinished(true);
      playTimerDing(soundEnabled);
      playFanfareSound(soundEnabled);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isActive, secondsLeft, soundEnabled]);

  const toggleTimer = () => {
    playClickSound(soundEnabled);
    setIsActive(!isActive);
  };

  const resetTimer = () => {
    playClickSound(soundEnabled);
    setIsActive(false);
    setSecondsLeft(defaultMinutes * 60);
    setIsFinished(false);
  };

  const handleFinishAndComplete = () => {
    playClickSound(soundEnabled);
    onCompleteTask(task.id);
    onClose();
  };

  const mins = Math.floor(secondsLeft / 60);
  const secs = secondsLeft % 60;
  const timeFormatted = `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  const progressPct = ((defaultMinutes * 60 - secondsLeft) / (defaultMinutes * 60)) * 100;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <div className="retro-box w-full max-w-sm bg-[#fffbeb] dark:bg-[#1c1917] p-5 text-stone-900 dark:text-stone-100 text-center">
        {/* Header */}
        <div className="flex items-center justify-between border-b-2 border-stone-800 pb-2 mb-4">
          <div className="flex items-center gap-1.5">
            <span>⏱️</span>
            <span className="font-pixel text-xs text-stone-900 dark:text-amber-100">
              Focus Session
            </span>
          </div>
          <button
            onClick={onClose}
            aria-label="Close focus timer"
            className="retro-btn px-2 py-0.5 bg-rose-500 text-white font-pixel text-[10px]"
          >
            ✕
          </button>
        </div>

        {/* Task Title */}
        <div className="mb-4">
          <div className="text-xs text-stone-500 font-pixel">Working on:</div>
          <h3 className="font-pixel text-sm text-stone-900 dark:text-amber-200 mt-0.5 line-clamp-2">
            {task.title}
          </h3>
        </div>

        {/* Digital Pixel Clock Display */}
        <div className="retro-box bg-[#faeed8] dark:bg-[#292524] p-5 mb-4">
          <div className="font-pixel text-3xl sm:text-4xl tracking-wider text-stone-900 dark:text-amber-400">
            {timeFormatted}
          </div>

          {/* Progress bar */}
          <div className="w-full h-3 bg-stone-300 dark:bg-stone-700 border border-stone-800 mt-3 overflow-hidden">
            <div
              className="h-full bg-emerald-500 transition-all duration-300"
              style={{ width: `${progressPct}%` }}
            />
          </div>

          <div className="text-xs text-stone-600 dark:text-stone-400 mt-2 font-pixel text-[9px]">
            {isFinished
              ? '🎉 Focus time completed!'
              : isActive
              ? `🐾 ${catName} is sitting quietly watching you focus!`
              : `Ready to focus with ${catName}?`}
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex gap-2 justify-center mb-3">
          {!isFinished ? (
            <>
              <button
                onClick={toggleTimer}
                className={`retro-btn flex-1 py-2 font-pixel text-xs text-white ${
                  isActive ? 'bg-amber-500' : 'bg-emerald-600'
                }`}
              >
                {isActive ? 'Pause' : 'Start Focus'}
              </button>
              <button
                onClick={resetTimer}
                className="retro-btn px-4 py-2 bg-stone-200 dark:bg-stone-700 text-stone-800 dark:text-stone-200 font-pixel text-xs"
              >
                Reset
              </button>
            </>
          ) : (
            <button
              onClick={handleFinishAndComplete}
              className="retro-btn w-full py-2.5 bg-emerald-500 text-white font-pixel text-xs animate-bounce"
            >
              Complete Goal & Claim Reward! 🪙
            </button>
          )}
        </div>

        {!isFinished && (
          <button
            onClick={handleFinishAndComplete}
            className="text-[11px] text-stone-500 dark:text-stone-400 underline hover:text-stone-800 dark:hover:text-stone-200"
          >
            Finished early? Mark goal complete now
          </button>
        )}
      </div>
    </div>
  );
};
