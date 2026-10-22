import React, { useState } from 'react';
import { Task, Subtask } from '../types/index';
import { DEFAULT_CATEGORIES } from './TaskFormModal';
import { checkIsOverdue } from '../utils/taskRules';
import { playClickSound } from '../utils/audio';

interface TaskItemProps {
  task: Task;
  onToggleComplete: (task: Task) => void;
  onToggleSubtask: (taskId: string, subtaskId: string) => void;
  onOpenEdit: (task: Task) => void;
  onOpenSkip: (task: Task) => void;
  onDeleteTask: (taskId: string) => void;
  onOpenTimer: (task: Task) => void;
  onMoveUp?: () => void;
  onMoveDown?: () => void;
  isFirst?: boolean;
  isLast?: boolean;
  soundEnabled: boolean;
}

export const TaskItem: React.FC<TaskItemProps> = ({
  task,
  onToggleComplete,
  onToggleSubtask,
  onOpenEdit,
  onOpenSkip,
  onDeleteTask,
  onOpenTimer,
  onMoveUp,
  onMoveDown,
  isFirst,
  isLast,
  soundEnabled,
}) => {
  const [showSubtasks, setShowSubtasks] = useState(false);
  const [showFloatingBonus, setShowFloatingBonus] = useState(false);

  const isOverdue = checkIsOverdue(task);
  const isDone = task.state === 'done';
  const isSkipped = task.state === 'skipped';

  const categoryMeta =
    DEFAULT_CATEGORIES.find((c) => c.id === task.category) || DEFAULT_CATEGORIES[0];

  const completedSubtasksCount = task.subtasks.filter((s) => s.completed).length;

  const handleCheckboxClick = () => {
    if (!isDone) {
      setShowFloatingBonus(true);
      setTimeout(() => setShowFloatingBonus(false), 1400);
    }
    onToggleComplete(task);
  };

  const getPriorityStyle = () => {
    switch (task.priority) {
      case 'high':
        return 'bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300 border-rose-500';
      case 'medium':
        return 'bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300 border-amber-500';
      case 'low':
        return 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border-emerald-500';
    }
  };

  return (
    <div
      className={`relative retro-box-sm p-3 transition-all ${
        isDone
          ? 'bg-stone-100 dark:bg-stone-900/60 opacity-80 border-stone-400'
          : isOverdue
          ? 'bg-rose-50/90 dark:bg-rose-950/40 border-rose-600 ring-1 ring-rose-400'
          : isSkipped
          ? 'bg-amber-50/80 dark:bg-stone-800/80 border-amber-500'
          : 'bg-white dark:bg-stone-800/95'
      }`}
    >
      {/* Floating Star & Treat Particle Burst */}
      {showFloatingBonus && (
        <div className="absolute top-0 right-12 z-20 pointer-events-none animate-bounce font-pixel text-xs text-amber-500 bg-amber-100 border border-stone-800 px-2 py-1 rounded shadow-md">
          ✨ +1 Treat & 10 🪙!
        </div>
      )}

      <div className="flex items-start gap-3">
        {/* Chunky Pixel Checkbox */}
        <button
          onClick={handleCheckboxClick}
          aria-label={isDone ? `Mark "${task.title}" as undone` : `Complete "${task.title}"`}
          className={`retro-btn w-7 h-7 sm:w-8 sm:h-8 flex-shrink-0 flex items-center justify-center rounded-xs transition-colors ${
            isDone
              ? 'bg-emerald-500 text-white'
              : 'bg-stone-50 dark:bg-stone-700 hover:bg-emerald-100 dark:hover:bg-emerald-950'
          }`}
        >
          {isDone ? (
            <span className="font-pixel text-xs font-bold leading-none">✓</span>
          ) : isSkipped ? (
            <span className="font-pixel text-[10px] text-amber-600">⏸</span>
          ) : null}
        </button>

        {/* Task Details */}
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-1.5 mb-1">
            {/* Category Badge */}
            <span
              className="inline-flex items-center gap-1 px-1.5 py-0.5 border border-stone-800 font-pixel text-[8px]"
              style={{ backgroundColor: categoryMeta.bgColor, color: '#1c1917' }}
            >
              <span>{categoryMeta.icon}</span>
              <span>{categoryMeta.name}</span>
            </span>

            {/* Priority Badge */}
            <span
              className={`px-1.5 py-0.5 border font-pixel text-[8px] uppercase ${getPriorityStyle()}`}
            >
              {task.priority}
            </span>

            {/* Overdue Badge */}
            {isOverdue && (
              <span className="px-1.5 py-0.5 bg-rose-600 text-white font-pixel text-[8px] animate-pulse">
                OVERDUE
              </span>
            )}

            {/* Skipped Badge */}
            {isSkipped && (
              <span className="px-1.5 py-0.5 bg-amber-500 text-stone-900 font-pixel text-[8px]">
                SKIPPED {task.skipReason ? `(${task.skipReason})` : ''}
              </span>
            )}

            {/* Repeat indicator */}
            {task.repeat !== 'once' && (
              <span className="text-[10px] text-stone-500 dark:text-stone-400 font-pixel">
                🔁 {task.repeat}
              </span>
            )}
          </div>

          {/* Title */}
          <h4
            className={`font-pixel text-xs sm:text-sm text-stone-900 dark:text-stone-100 leading-snug break-words ${
              isDone ? 'line-through text-stone-500 dark:text-stone-400' : ''
            }`}
          >
            {task.title}
          </h4>

          {/* Notes */}
          {task.notes && (
            <p className="text-xs text-stone-600 dark:text-stone-300 mt-0.5 line-clamp-2">
              {task.notes}
            </p>
          )}

          {/* Timing & Meta Info */}
          <div className="flex flex-wrap items-center gap-3 mt-1.5 text-xs text-stone-600 dark:text-stone-400">
            {task.deadlineTime && (
              <span className="flex items-center gap-1 font-pixel text-[9px]">
                <span>⏰</span>
                <span>{task.deadlineTime}</span>
              </span>
            )}

            {/* Subtasks Progress Button */}
            {task.subtasks.length > 0 && (
              <button
                type="button"
                onClick={() => {
                  playClickSound(soundEnabled);
                  setShowSubtasks(!showSubtasks);
                }}
                className="flex items-center gap-1 font-pixel text-[9px] text-amber-600 dark:text-amber-400 hover:underline"
              >
                <span>📋</span>
                <span>
                  Checklist ({completedSubtasksCount}/{task.subtasks.length})
                </span>
                <span>{showSubtasks ? '▲' : '▼'}</span>
              </button>
            )}

            {/* Focus Timer Button */}
            {task.hasTimer && !isDone && (
              <button
                type="button"
                onClick={() => onOpenTimer(task)}
                className="retro-btn px-2 py-0.5 bg-amber-200 dark:bg-amber-950 font-pixel text-[8px] text-amber-900 dark:text-amber-200"
              >
                ⏱️ Focus ({task.timerDuration || 25}m)
              </button>
            )}
          </div>

          {/* Subtasks Dropdown List */}
          {showSubtasks && task.subtasks.length > 0 && (
            <div className="mt-2 pl-2 border-l-2 border-amber-400 dark:border-amber-600 space-y-1">
              {task.subtasks.map((sub) => (
                <label
                  key={sub.id}
                  className="flex items-center gap-2 cursor-pointer text-xs text-stone-700 dark:text-stone-300 select-none"
                >
                  <input
                    type="checkbox"
                    checked={sub.completed}
                    onChange={() => onToggleSubtask(task.id, sub.id)}
                    className="w-3.5 h-3.5 accent-emerald-500 rounded-none cursor-pointer"
                  />
                  <span className={sub.completed ? 'line-through text-stone-400' : ''}>
                    {sub.title}
                  </span>
                </label>
              ))}
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col gap-1 items-end flex-shrink-0">
          <div className="flex items-center gap-1">
            {!isDone && !isSkipped && (
              <button
                onClick={() => onOpenSkip(task)}
                aria-label={`Skip ${task.title}`}
                className="retro-btn p-1 bg-amber-100 dark:bg-stone-700 hover:bg-amber-200 text-stone-700 dark:text-stone-300 font-pixel text-[9px]"
                title="Skip today"
              >
                ⏸
              </button>
            )}
            <button
              onClick={() => onOpenEdit(task)}
              aria-label={`Edit ${task.title}`}
              className="retro-btn p-1 bg-stone-100 dark:bg-stone-700 hover:bg-stone-200 text-stone-700 dark:text-stone-300 font-pixel text-[9px]"
              title="Edit"
            >
              ✏️
            </button>
            <button
              onClick={() => onDeleteTask(task.id)}
              aria-label={`Delete ${task.title}`}
              className="retro-btn p-1 bg-rose-100 dark:bg-rose-950 hover:bg-rose-200 text-rose-700 dark:text-rose-300 font-pixel text-[9px]"
              title="Delete"
            >
              🗑️
            </button>
          </div>

          {/* Move Up/Down Order */}
          {(onMoveUp || onMoveDown) && (
            <div className="flex items-center gap-0.5">
              {onMoveUp && !isFirst && (
                <button
                  onClick={onMoveUp}
                  aria-label="Move task up"
                  className="retro-btn px-1 py-0.5 text-[8px] font-pixel bg-stone-100 dark:bg-stone-700 text-stone-700 dark:text-stone-300"
                >
                  ▲
                </button>
              )}
              {onMoveDown && !isLast && (
                <button
                  onClick={onMoveDown}
                  aria-label="Move task down"
                  className="retro-btn px-1 py-0.5 text-[8px] font-pixel bg-stone-100 dark:bg-stone-700 text-stone-700 dark:text-stone-300"
                >
                  ▼
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
