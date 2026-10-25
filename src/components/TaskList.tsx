import React, { useState } from 'react';
import { Task, CategoryMeta } from '../types/index';
import { TaskItem } from './TaskItem';
import { DEFAULT_CATEGORIES } from './TaskFormModal';
import { shouldTaskRunOnDate } from '../utils/taskRules';
import { playClickSound } from '../utils/audio';
import { hapticButtonTap, hapticSelection } from '../utils/haptics';

interface TaskListProps {
  tasks: Task[];
  onToggleComplete: (task: Task) => void;
  onToggleSubtask: (taskId: string, subtaskId: string) => void;
  onOpenCreate: () => void;
  onQuickAdd: (title: string, category: string) => void;
  onOpenEdit: (task: Task) => void;
  onOpenSkip: (task: Task) => void;
  onDeleteTask: (taskId: string) => void;
  onOpenTimer: (task: Task) => void;
  onReorderTasks: (newTasks: Task[]) => void;
  catName: string;
  soundEnabled: boolean;
  hapticsEnabled?: boolean;
}

export const TaskList: React.FC<TaskListProps> = ({
  tasks,
  onToggleComplete,
  onToggleSubtask,
  onOpenCreate,
  onQuickAdd,
  onOpenEdit,
  onOpenSkip,
  onDeleteTask,
  onOpenTimer,
  onReorderTasks,
  catName,
  soundEnabled,
  hapticsEnabled = true,
}) => {
  const [activeTab, setActiveTab] = useState<'today' | 'upcoming' | 'completed' | 'all'>('today');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [quickTitle, setQuickTitle] = useState('');
  const [quickCat, setQuickCat] = useState('health');

  const today = new Date();

  // Filter tasks
  const filteredTasks = tasks.filter((task) => {
    // Category filter
    if (selectedCategory !== 'all' && task.category !== selectedCategory) {
      return false;
    }

    if (activeTab === 'today') {
      return shouldTaskRunOnDate(task, today) && task.state !== 'done';
    }
    if (activeTab === 'completed') {
      return task.state === 'done';
    }
    if (activeTab === 'upcoming') {
      return task.repeat !== 'once' || (task.deadlineDate && task.deadlineDate > today.toISOString().split('T')[0]);
    }
    return true; // 'all'
  });

  // Sort today view by deadline time
  const sortedTasks = [...filteredTasks].sort((a, b) => {
    if (a.state === 'done' && b.state !== 'done') return 1;
    if (a.state !== 'done' && b.state === 'done') return -1;
    if (a.deadlineTime && b.deadlineTime) {
      return a.deadlineTime.localeCompare(b.deadlineTime);
    }
    return a.order - b.order;
  });

  const handleQuickAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickTitle.trim()) {
      playClickSound(soundEnabled);
      hapticButtonTap(hapticsEnabled);
      onOpenCreate();
      return;
    }
    hapticButtonTap(hapticsEnabled);
    onQuickAdd(quickTitle.trim(), quickCat);
    setQuickTitle('');
    if (activeTab === 'completed') {
      setActiveTab('today');
    }
  };

  const handleMove = (index: number, direction: 'up' | 'down') => {
    const newIdx = direction === 'up' ? index - 1 : index + 1;
    if (newIdx < 0 || newIdx >= sortedTasks.length) return;

    hapticButtonTap(hapticsEnabled);
    const copy = [...sortedTasks];
    const temp = copy[index];
    copy[index] = copy[newIdx];
    copy[newIdx] = temp;

    // Update order
    const updated = copy.map((t, idx) => ({ ...t, order: idx }));
    onReorderTasks(updated);
  };

  return (
    <div className="space-y-3 w-full max-w-full min-w-0">
      {/* Quick Add Bar */}
      <form onSubmit={handleQuickAddSubmit} className="retro-box bg-[#fffbeb] dark:bg-[#1c1917] p-2 w-full max-w-full">
        <div className="flex gap-1.5 items-center w-full min-w-0">
          <input
            type="text"
            value={quickTitle}
            onChange={(e) => setQuickTitle(e.target.value)}
            placeholder="Quick add: e.g. Drink water..."
            className="flex-1 min-w-0 h-9 retro-box-sm px-2.5 bg-white dark:bg-stone-900 font-pixel text-[10px] text-stone-900 dark:text-white outline-none focus:ring-2 focus:ring-amber-500"
          />

          <select
            value={quickCat}
            onChange={(e) => {
              hapticSelection(hapticsEnabled);
              setQuickCat(e.target.value);
            }}
            aria-label="Select category"
            className="w-20 sm:w-auto h-9 retro-box-sm px-1.5 bg-white dark:bg-stone-900 font-pixel text-[9px] sm:text-[10px] text-stone-900 dark:text-white outline-none cursor-pointer flex-shrink-0"
          >
            {DEFAULT_CATEGORIES.map((c) => (
              <option key={c.id} value={c.id}>
                {c.icon} {c.name}
              </option>
            ))}
          </select>

          <button
            type="submit"
            className="retro-btn h-9 px-3 bg-amber-400 dark:bg-amber-500 text-stone-900 font-pixel text-[10px] whitespace-nowrap flex items-center justify-center hover:bg-amber-300 flex-shrink-0"
            title="Add goal"
          >
            <span>+ Add</span>
          </button>
        </div>
      </form>

      {/* Tabs & Category Filters */}
      <div className="space-y-2">
        <div className="flex flex-wrap gap-1.5">
          {[
            { id: 'today', label: 'Today' },
            { id: 'all', label: 'All Goals' },
            { id: 'completed', label: 'Completed' },
            { id: 'upcoming', label: 'Upcoming' },
          ].map((tab) => {
            const isSel = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => {
                  playClickSound(soundEnabled);
                  hapticSelection(hapticsEnabled);
                  setActiveTab(tab.id as any);
                }}
                className={`retro-btn px-2.5 py-1 font-pixel text-[9px] whitespace-nowrap ${
                  isSel
                    ? 'bg-amber-400 text-stone-900'
                    : 'bg-white dark:bg-stone-800 text-stone-600 dark:text-stone-300'
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Category Pill Filters */}
        <div className="flex flex-wrap items-center gap-1.5">
          <button
            onClick={() => {
              playClickSound(soundEnabled);
              hapticSelection(hapticsEnabled);
              setSelectedCategory('all');
            }}
            className={`retro-btn px-2 py-0.5 font-pixel text-[8px] whitespace-nowrap ${
              selectedCategory === 'all'
                ? 'bg-stone-800 text-white dark:bg-amber-300 dark:text-stone-900'
                : 'bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300'
            }`}
          >
            All Categories
          </button>
          {DEFAULT_CATEGORIES.map((c) => {
            const isCatSel = selectedCategory === c.id;
            return (
              <button
                key={c.id}
                onClick={() => {
                  playClickSound(soundEnabled);
                  hapticSelection(hapticsEnabled);
                  setSelectedCategory(c.id);
                }}
                className={`retro-btn px-2 py-0.5 font-pixel text-[8px] whitespace-nowrap flex items-center gap-1 ${
                  isCatSel
                    ? 'bg-amber-300 text-stone-900'
                    : 'bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300'
                }`}
              >
                <span>{c.icon}</span>
                <span>{c.name}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Task List Items */}
      {sortedTasks.length === 0 ? (
        <div className="retro-box bg-[#fffbeb] dark:bg-[#1c1917] p-8 text-center">
          <div className="text-3xl mb-2">🐾</div>
          <h4 className="font-pixel text-xs text-stone-800 dark:text-amber-200">
            {activeTab === 'completed'
              ? 'No completed goals yet!'
              : activeTab === 'today'
              ? `All clear for today! ${catName} is purring!`
              : 'No goals found!'}
          </h4>
          <p className="text-xs text-stone-500 mt-1 max-w-xs mx-auto">
            {activeTab === 'today'
              ? `Add a goal above or tap "+ Add" to feed ${catName} with treats!`
              : 'Add your habits and daily routines to build streaks together.'}
          </p>
          {activeTab !== 'today' && (
            <button
              onClick={() => {
                playClickSound(soundEnabled);
                hapticButtonTap(hapticsEnabled);
                setActiveTab('today');
              }}
              className="retro-btn mt-3 px-3 py-1 bg-amber-400 font-pixel text-[9px] text-stone-900"
            >
              Back to Today&apos;s View
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-2">
          {sortedTasks.map((task, index) => (
            <TaskItem
              key={task.id}
              task={task}
              onToggleComplete={onToggleComplete}
              onToggleSubtask={onToggleSubtask}
              onOpenEdit={onOpenEdit}
              onOpenSkip={onOpenSkip}
              onDeleteTask={onDeleteTask}
              onOpenTimer={onOpenTimer}
              onMoveUp={activeTab === 'today' ? () => handleMove(index, 'up') : undefined}
              onMoveDown={activeTab === 'today' ? () => handleMove(index, 'down') : undefined}
              isFirst={index === 0}
              isLast={index === sortedTasks.length - 1}
              soundEnabled={soundEnabled}
              hapticsEnabled={hapticsEnabled}
            />
          ))}
        </div>
      )}
    </div>
  );
};
