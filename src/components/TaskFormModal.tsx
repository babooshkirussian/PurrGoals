import React, { useState } from 'react';
import { Task, CategoryMeta, Priority, RepeatSchedule, Subtask } from '../types/index';
import { playClickSound } from '../utils/audio';
import { hapticButtonTap, hapticSelection } from '../utils/haptics';

export const DEFAULT_CATEGORIES: CategoryMeta[] = [
  { id: 'health', name: 'Health', icon: '❤️', color: '#ef4444', bgColor: '#fee2e2' },
  { id: 'study', name: 'Study', icon: '📚', color: '#3b82f6', bgColor: '#dbeafe' },
  { id: 'work', name: 'Work', icon: '💼', color: '#8b5cf6', bgColor: '#ede9fe' },
  { id: 'home', name: 'Home', icon: '🏠', color: '#10b981', bgColor: '#d1fae5' },
  { id: 'personal', name: 'Personal', icon: '⭐', color: '#f59e0b', bgColor: '#fef3c7' },
];

interface TaskFormModalProps {
  initialTask?: Task | null;
  onSaveTask: (task: Task) => void;
  onClose: () => void;
  soundEnabled: boolean;
  hapticsEnabled?: boolean;
}

export const TaskFormModal: React.FC<TaskFormModalProps> = ({
  initialTask,
  onSaveTask,
  onClose,
  soundEnabled,
  hapticsEnabled = true,
}) => {
  const isEditing = !!initialTask;

  const todayStr = new Date().toISOString().split('T')[0];

  const [title, setTitle] = useState(initialTask?.title || '');
  const [notes, setNotes] = useState(initialTask?.notes || '');
  const [category, setCategory] = useState(initialTask?.category || 'health');
  const [priority, setPriority] = useState<Priority>(initialTask?.priority || 'medium');
  const [deadlineTime, setDeadlineTime] = useState(initialTask?.deadlineTime || '18:00');
  const [deadlineDate, setDeadlineDate] = useState(initialTask?.deadlineDate || todayStr);
  const [repeat, setRepeat] = useState<RepeatSchedule>(initialTask?.repeat || 'daily');
  const [repeatCustomDays, setRepeatCustomDays] = useState<number[]>(
    initialTask?.repeatCustomDays || [1, 2, 3, 4, 5]
  );
  const [repeatEveryNDays, setRepeatEveryNDays] = useState<number>(
    initialTask?.repeatEveryNDays || 2
  );

  // Reminders
  const [remindAtDeadline, setRemindAtDeadline] = useState(
    initialTask?.reminders.atDeadline ?? true
  );
  const [minutesBefore, setMinutesBefore] = useState<number[]>(
    initialTask?.reminders.minutesBefore || [15]
  );
  const [nudgesEnabled, setNudgesEnabled] = useState(
    initialTask?.reminders.nudgesEnabled ?? true
  );
  const [nudgeMinutes, setNudgeMinutes] = useState(
    initialTask?.reminders.nudgeMinutes || 15
  );

  // Focus timer
  const [hasTimer, setHasTimer] = useState(initialTask?.hasTimer ?? false);
  const [timerDuration, setTimerDuration] = useState(
    initialTask?.timerDuration || 25
  );

  // Subtasks
  const [subtasks, setSubtasks] = useState<Subtask[]>(initialTask?.subtasks || []);
  const [newSubtaskTitle, setNewSubtaskTitle] = useState('');

  const [error, setError] = useState('');

  const handleAddSubtask = () => {
    if (!newSubtaskTitle.trim()) return;
    playClickSound(soundEnabled);
    hapticButtonTap(hapticsEnabled);
    const newSub: Subtask = {
      id: 'sub-' + Date.now() + Math.random().toString(36).substring(2, 6),
      title: newSubtaskTitle.trim(),
      completed: false,
    };
    setSubtasks([...subtasks, newSub]);
    setNewSubtaskTitle('');
  };

  const handleRemoveSubtask = (id: string) => {
    playClickSound(soundEnabled);
    hapticButtonTap(hapticsEnabled);
    setSubtasks(subtasks.filter((s) => s.id !== id));
  };

  const toggleMinutesBefore = (mins: number) => {
    playClickSound(soundEnabled);
    hapticSelection(hapticsEnabled);
    if (minutesBefore.includes(mins)) {
      setMinutesBefore(minutesBefore.filter((m) => m !== mins));
    } else {
      setMinutesBefore([...minutesBefore, mins]);
    }
  };

  const toggleDayOfWeek = (day: number) => {
    playClickSound(soundEnabled);
    hapticSelection(hapticsEnabled);
    if (repeatCustomDays.includes(day)) {
      setRepeatCustomDays(repeatCustomDays.filter((d) => d !== day));
    } else {
      setRepeatCustomDays([...repeatCustomDays, day].sort());
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError('Please give your goal a title!');
      return;
    }

    const taskToSave: Task = {
      id: initialTask?.id || 'task-' + Date.now(),
      title: title.trim(),
      notes: notes.trim() || undefined,
      category,
      priority,
      deadlineTime: deadlineTime || undefined,
      deadlineDate: deadlineDate || undefined,
      repeat,
      repeatCustomDays: repeat === 'custom_days' ? repeatCustomDays : undefined,
      repeatEveryNDays: repeat === 'every_n_days' ? repeatEveryNDays : undefined,
      reminders: {
        atDeadline: remindAtDeadline,
        minutesBefore,
        nudgesEnabled,
        nudgeMinutes,
        nudgesSentCount: initialTask?.reminders.nudgesSentCount || 0,
      },
      state: initialTask?.state || 'pending',
      skipReason: initialTask?.skipReason,
      subtasks,
      hasTimer,
      timerDuration: hasTimer ? timerDuration : undefined,
      createdAt: initialTask?.createdAt || new Date().toISOString(),
      completedAt: initialTask?.completedAt,
      order: initialTask?.order || Date.now(),
    };

    playClickSound(soundEnabled);
    hapticButtonTap(hapticsEnabled);
    onSaveTask(taskToSave);
    onClose();
  };

  const dayLabels = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-3 safe-modal overflow-y-auto">
      <div className="retro-box w-full max-w-lg bg-[#fffbeb] dark:bg-[#1c1917] p-4 sm:p-5 max-h-[86dvh] flex flex-col justify-between text-stone-900 dark:text-stone-100">
        {/* Header */}
        <div className="flex items-center justify-between border-b-2 border-stone-800 pb-3 mb-3">
          <div className="flex items-center gap-2">
            <span className="text-xl">🎯</span>
            <h2 className="font-pixel text-sm text-stone-900 dark:text-amber-100">
              {isEditing ? 'Edit Goal' : 'New Goal'}
            </h2>
          </div>
          <button
            onClick={() => {
              playClickSound(soundEnabled);
              hapticButtonTap(hapticsEnabled);
              onClose();
            }}
            aria-label="Close modal"
            className="retro-btn px-2.5 py-1 bg-rose-500 text-white font-pixel text-xs"
          >
            ✕
          </button>
        </div>

        {/* Scrollable Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto pr-1 space-y-4">
          {error && (
            <div className="bg-rose-100 border border-rose-500 text-rose-800 p-2 font-pixel text-[10px]">
              ⚠️ {error}
            </div>
          )}

          {/* Title */}
          <div>
            <label className="block font-pixel text-[11px] mb-1 text-stone-800 dark:text-amber-200">
              Goal Title *
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => {
                setTitle(e.target.value);
                if (error) setError('');
              }}
              placeholder="e.g. Study 45 min, Drink 2L water, Gym session"
              className="w-full retro-box-sm px-3 py-2 bg-white dark:bg-stone-900 font-pixel text-xs text-stone-900 dark:text-white outline-none focus:ring-2 focus:ring-amber-500"
            />
          </div>

          {/* Notes */}
          <div>
            <label className="block font-pixel text-[10px] mb-1 text-stone-700 dark:text-stone-300">
              Notes (Optional)
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add details, links, or instructions..."
              className="w-full retro-box-sm px-3 py-1.5 bg-white dark:bg-stone-900 text-sm text-stone-900 dark:text-white outline-none focus:ring-2 focus:ring-amber-500"
            />
          </div>

          {/* Category & Priority in Two Columns */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Category */}
            <div>
              <label className="block font-pixel text-[10px] mb-1 text-stone-700 dark:text-stone-300">
                Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full retro-box-sm px-2 py-2 bg-white dark:bg-stone-900 font-pixel text-[10px] text-stone-900 dark:text-white outline-none"
              >
                {DEFAULT_CATEGORIES.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.icon} {c.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Priority */}
            <div>
              <label className="block font-pixel text-[10px] mb-1 text-stone-700 dark:text-stone-300">
                Priority
              </label>
              <div className="flex gap-1">
                {(['low', 'medium', 'high'] as Priority[]).map((p) => {
                  const isSel = priority === p;
                  return (
                    <button
                      key={p}
                      type="button"
                      onClick={() => setPriority(p)}
                      className={`retro-btn flex-1 py-1.5 font-pixel text-[9px] uppercase ${
                        isSel
                          ? p === 'high'
                            ? 'bg-rose-500 text-white'
                            : p === 'medium'
                            ? 'bg-amber-400 text-stone-900'
                            : 'bg-emerald-500 text-white'
                          : 'bg-stone-200 dark:bg-stone-800 text-stone-700 dark:text-stone-300'
                      }`}
                    >
                      {p}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Deadline Time & Date */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-pixel text-[10px] mb-1 text-stone-700 dark:text-stone-300">
                Target Time
              </label>
              <input
                type="time"
                value={deadlineTime}
                onChange={(e) => setDeadlineTime(e.target.value)}
                className="w-full retro-box-sm px-3 py-1.5 bg-white dark:bg-stone-900 font-pixel text-xs text-stone-900 dark:text-white outline-none"
              />
            </div>
            <div>
              <label className="block font-pixel text-[10px] mb-1 text-stone-700 dark:text-stone-300">
                Target Date
              </label>
              <input
                type="date"
                value={deadlineDate}
                onChange={(e) => setDeadlineDate(e.target.value)}
                className="w-full retro-box-sm px-3 py-1.5 bg-white dark:bg-stone-900 font-pixel text-xs text-stone-900 dark:text-white outline-none"
              />
            </div>
          </div>

          {/* Repeat Schedule */}
          <div>
            <label className="block font-pixel text-[10px] mb-1 text-stone-700 dark:text-stone-300">
              Repeat Schedule
            </label>
            <select
              value={repeat}
              onChange={(e) => setRepeat(e.target.value as RepeatSchedule)}
              className="w-full retro-box-sm px-2 py-2 bg-white dark:bg-stone-900 font-pixel text-[10px] text-stone-900 dark:text-white outline-none mb-2"
            >
              <option value="once">Once (No repeat)</option>
              <option value="daily">Daily (Every day)</option>
              <option value="weekdays">Weekdays (Mon - Fri)</option>
              <option value="weekends">Weekends (Sat - Sun)</option>
              <option value="custom_days">Specific Days of Week</option>
              <option value="every_n_days">Every N Days</option>
              <option value="monthly">Monthly</option>
            </select>

            {/* Custom Days Checkbox Row */}
            {repeat === 'custom_days' && (
              <div className="flex gap-1 justify-between p-2 bg-amber-100 dark:bg-stone-800 retro-box-sm">
                {dayLabels.map((lbl, idx) => {
                  const isChecked = repeatCustomDays.includes(idx);
                  return (
                    <button
                      key={lbl}
                      type="button"
                      onClick={() => toggleDayOfWeek(idx)}
                      className={`retro-btn px-2 py-1 font-pixel text-[8px] ${
                        isChecked
                          ? 'bg-amber-400 text-stone-900'
                          : 'bg-white dark:bg-stone-700 text-stone-600 dark:text-stone-300'
                      }`}
                    >
                      {lbl}
                    </button>
                  );
                })}
              </div>
            )}

            {repeat === 'every_n_days' && (
              <div className="flex items-center gap-2 p-2 bg-amber-100 dark:bg-stone-800 retro-box-sm">
                <span className="font-pixel text-[9px]">Repeat every:</span>
                <input
                  type="number"
                  min={1}
                  max={30}
                  value={repeatEveryNDays}
                  onChange={(e) => setRepeatEveryNDays(Math.max(1, Number(e.target.value)))}
                  className="w-16 retro-box-sm px-2 py-1 bg-white dark:bg-stone-900 font-pixel text-xs text-center"
                />
                <span className="font-pixel text-[9px]">days</span>
              </div>
            )}
          </div>

          {/* Subtasks / Checklist */}
          <div>
            <label className="block font-pixel text-[10px] mb-1 text-stone-700 dark:text-stone-300">
              Checklist / Subtasks ({subtasks.length})
            </label>
            <div className="space-y-1.5 mb-2">
              {subtasks.map((sub) => (
                <div
                  key={sub.id}
                  className="flex items-center justify-between p-1.5 bg-stone-100 dark:bg-stone-800 retro-box-sm"
                >
                  <span className="text-xs truncate text-stone-800 dark:text-stone-200">
                    • {sub.title}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleRemoveSubtask(sub.id)}
                    className="text-rose-500 font-bold px-1 hover:text-rose-700"
                    aria-label={`Remove subtask ${sub.title}`}
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>

            <div className="flex gap-1.5">
              <input
                type="text"
                value={newSubtaskTitle}
                onChange={(e) => setNewSubtaskTitle(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddSubtask();
                  }
                }}
                placeholder="Add subtask item..."
                className="flex-1 retro-box-sm px-2.5 py-1.5 bg-white dark:bg-stone-900 text-xs text-stone-900 dark:text-white outline-none"
              />
              <button
                type="button"
                onClick={handleAddSubtask}
                className="retro-btn px-3 py-1.5 bg-amber-400 font-pixel text-[9px] text-stone-900"
              >
                + Add
              </button>
            </div>
          </div>

          {/* Focus Timer Option */}
          <div className="p-2.5 bg-amber-50 dark:bg-stone-800 retro-box-sm">
            <div className="flex items-center justify-between mb-1.5">
              <div className="flex items-center gap-1.5">
                <span>⏱️</span>
                <span className="font-pixel text-[10px] text-stone-800 dark:text-amber-200">
                  Attach Pomodoro Focus Timer
                </span>
              </div>
              <input
                type="checkbox"
                checked={hasTimer}
                onChange={(e) => setHasTimer(e.target.checked)}
                className="w-4 h-4 cursor-pointer accent-amber-500"
              />
            </div>
            {hasTimer && (
              <div className="flex items-center gap-2 mt-2">
                <span className="text-xs text-stone-600 dark:text-stone-300">Duration:</span>
                {[15, 25, 50].map((m) => (
                  <button
                    key={m}
                    type="button"
                    onClick={() => setTimerDuration(m)}
                    className={`retro-btn px-2.5 py-1 font-pixel text-[8px] ${
                      timerDuration === m
                        ? 'bg-amber-400 text-stone-900'
                        : 'bg-white dark:bg-stone-700 text-stone-700 dark:text-stone-300'
                    }`}
                  >
                    {m} min
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Reminders & Nudges Settings */}
          <div className="p-2.5 bg-amber-50 dark:bg-stone-800 retro-box-sm space-y-2">
            <div className="flex items-center gap-1.5 mb-1">
              <span>🔔</span>
              <span className="font-pixel text-[10px] text-stone-800 dark:text-amber-200">
                Reminders & Cat Nudges
              </span>
            </div>

            <div className="flex items-center justify-between text-xs">
              <span>Notify at deadline time:</span>
              <input
                type="checkbox"
                checked={remindAtDeadline}
                onChange={(e) => setRemindAtDeadline(e.target.checked)}
                className="w-4 h-4 cursor-pointer accent-amber-500"
              />
            </div>

            <div>
              <span className="text-xs block mb-1">Advance reminders:</span>
              <div className="flex gap-1.5">
                {[5, 15, 30, 60].map((mins) => {
                  const isChecked = minutesBefore.includes(mins);
                  return (
                    <button
                      key={mins}
                      type="button"
                      onClick={() => toggleMinutesBefore(mins)}
                      className={`retro-btn px-2 py-1 font-pixel text-[8px] ${
                        isChecked
                          ? 'bg-amber-400 text-stone-900'
                          : 'bg-white dark:bg-stone-700 text-stone-600 dark:text-stone-300'
                      }`}
                    >
                      {mins}m
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="flex items-center justify-between text-xs pt-1 border-t border-stone-300 dark:border-stone-700">
              <div>
                <span className="block font-medium">Follow-up nudges if undone</span>
                <span className="text-[10px] text-stone-500">Every {nudgeMinutes} min (max 3)</span>
              </div>
              <input
                type="checkbox"
                checked={nudgesEnabled}
                onChange={(e) => setNudgesEnabled(e.target.checked)}
                className="w-4 h-4 cursor-pointer accent-amber-500"
              />
            </div>
          </div>
        </form>

        {/* Footer Actions */}
        <div className="flex gap-2 pt-3 border-t-2 border-stone-800">
          <button
            type="button"
            onClick={() => {
              playClickSound(soundEnabled);
              hapticButtonTap(hapticsEnabled);
              onClose();
            }}
            className="retro-btn flex-1 py-2 bg-stone-200 dark:bg-stone-700 font-pixel text-xs text-stone-800 dark:text-stone-200"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            className="retro-btn flex-1 py-2 bg-emerald-500 text-white font-pixel text-xs hover:bg-emerald-600"
          >
            {isEditing ? 'Save Changes' : 'Create Goal'}
          </button>
        </div>
      </div>
    </div>
  );
};
