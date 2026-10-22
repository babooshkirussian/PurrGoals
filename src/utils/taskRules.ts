import { FoodType, Task, CatAnimationState } from '../types/index';

/**
 * Calculates cat happiness percentage based on today's tasks.
 * Skipped tasks with a reason penalize much less (0.5 score) than missed tasks (0 score).
 */
export function calculateHappinessPercentage(tasks: Task[]): number {
  if (tasks.length === 0) {
    return 100; // If no tasks scheduled today, cat is content
  }

  let totalScore = 0;
  for (const t of tasks) {
    if (t.state === 'done') {
      totalScore += 1;
    } else if (t.state === 'skipped') {
      totalScore += 0.5;
    }
  }

  return Math.min(100, Math.max(0, Math.round((totalScore / tasks.length) * 100)));
}

/**
 * Determines cat animation state based on happiness % and overdue tasks.
 * 0 percent: hungry/sad. 1-49 percent: neutral/hungry. 50-99 percent: content/happy. 100 percent: celebrating.
 */
export function getCatMoodState(
  happiness: number,
  totalTasksToday: number,
  hasOverdue: boolean
): CatAnimationState {
  if (totalTasksToday === 0) {
    return 'idle';
  }
  if (happiness === 100) {
    return 'celebrating';
  }
  if (happiness >= 50) {
    return 'happy';
  }
  if (happiness >= 25 && !hasOverdue) {
    return 'idle';
  }
  if (hasOverdue || happiness === 0) {
    return 'hungry';
  }
  return 'sleepy';
}

/**
 * Checks if a task is overdue given current time.
 */
export function checkIsOverdue(task: Task, now: Date = new Date()): boolean {
  if (task.state === 'done' || task.state === 'skipped') {
    return false;
  }
  if (!task.deadlineTime) {
    return false;
  }

  const [hours, minutes] = task.deadlineTime.split(':').map(Number);
  if (isNaN(hours) || isNaN(minutes)) {
    return false;
  }

  const taskDate = task.deadlineDate ? new Date(task.deadlineDate + 'T00:00:00') : new Date(now);
  taskDate.setHours(hours, minutes, 0, 0);

  return now.getTime() > taskDate.getTime();
}

/**
 * Determines if a repeating task is scheduled for a given date.
 */
export function shouldTaskRunOnDate(task: Task, date: Date = new Date()): boolean {
  if (task.repeat === 'daily') {
    return true;
  }

  const dayOfWeek = date.getDay(); // 0 is Sunday, 6 is Saturday

  if (task.repeat === 'weekdays') {
    return dayOfWeek >= 1 && dayOfWeek <= 5;
  }

  if (task.repeat === 'weekends') {
    return dayOfWeek === 0 || dayOfWeek === 6;
  }

  if (task.repeat === 'custom_days' && Array.isArray(task.repeatCustomDays)) {
    return task.repeatCustomDays.includes(dayOfWeek);
  }

  if (task.repeat === 'every_n_days' && task.repeatEveryNDays && task.repeatEveryNDays > 0) {
    const created = new Date(task.createdAt);
    const diffTime = date.getTime() - created.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    return diffDays >= 0 && diffDays % task.repeatEveryNDays === 0;
  }

  if (task.repeat === 'monthly') {
    const created = new Date(task.createdAt);
    return date.getDate() === created.getDate();
  }

  // 'once'
  if (task.deadlineDate) {
    const dateStr = date.toISOString().split('T')[0];
    return task.deadlineDate === dateStr;
  }

  return true;
}

/**
 * Returns a random food treat for completing a task.
 */
export function getRandomFoodItem(): FoodType {
  const items: FoodType[] = ['fish', 'tuna_can', 'milk', 'biscuit', 'shrimp'];
  const randomIndex = Math.floor(Math.random() * items.length);
  return items[randomIndex];
}

/**
 * Evaluates whether a given HH:MM time falls inside quiet hours.
 * Supports crossing midnight, e.g. 23:00 to 07:00.
 */
export function isQuietHours(currentTime: string, start: string, end: string): boolean {
  if (!start || !end) return false;
  const toMinutes = (timeStr: string) => {
    const [h, m] = timeStr.split(':').map(Number);
    return h * 60 + m;
  };

  const current = toMinutes(currentTime);
  const startTime = toMinutes(start);
  const endTime = toMinutes(end);

  if (startTime < endTime) {
    return current >= startTime && current < endTime;
  } else {
    // Crosses midnight (e.g. 23:00 to 07:00)
    return current >= startTime || current < endTime;
  }
}

/**
 * Handles daily rollover at midnight or when app opens on a new day.
 */
export function rolloverDailyTasks(
  tasks: Task[],
  todayStr: string,
  lastDateStr: string
): { updatedTasks: Task[]; rolloverHappened: boolean } {
  if (lastDateStr === todayStr) {
    return { updatedTasks: tasks, rolloverHappened: false };
  }

  const updatedTasks = tasks.map((task) => {
    if (task.repeat !== 'once') {
      // Reset repeating task for the new day
      return {
        ...task,
        state: 'pending' as const,
        completedAt: undefined,
        skipReason: undefined,
        reminders: {
          ...task.reminders,
          nudgesSentCount: 0,
        },
        subtasks: task.subtasks.map((sub) => ({ ...sub, completed: false })),
      };
    }
    return task;
  });

  return { updatedTasks, rolloverHappened: true };
}
