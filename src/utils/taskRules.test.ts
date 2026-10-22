import test from 'node:test';
import assert from 'node:assert/strict';
import {
  calculateHappinessPercentage,
  getCatMoodState,
  checkIsOverdue,
  shouldTaskRunOnDate,
  isQuietHours,
  rolloverDailyTasks,
} from './taskRules';
import { Task } from '../types/index';

function makeMockTask(partial: Partial<Task>): Task {
  return {
    id: 'test-1',
    title: 'Test Task',
    category: 'health',
    priority: 'medium',
    repeat: 'daily',
    reminders: {
      atDeadline: true,
      minutesBefore: [15],
      nudgesEnabled: true,
      nudgeMinutes: 10,
      nudgesSentCount: 0,
    },
    state: 'pending',
    subtasks: [],
    createdAt: '2026-10-21T00:00:00.000Z',
    order: 0,
    ...partial,
  };
}

test('calculateHappinessPercentage returns 100 when no tasks exist today', () => {
  assert.equal(calculateHappinessPercentage([]), 100);
});

test('calculateHappinessPercentage handles done, pending, and skipped tasks correctly', () => {
  const tasks: Task[] = [
    makeMockTask({ state: 'done' }),
    makeMockTask({ state: 'pending' }),
  ];
  assert.equal(calculateHappinessPercentage(tasks), 50);

  const tasksWithSkip: Task[] = [
    makeMockTask({ state: 'done' }),
    makeMockTask({ state: 'skipped', skipReason: 'Rest day' }),
  ];
  // 1 + 0.5 = 1.5 / 2 = 75%
  assert.equal(calculateHappinessPercentage(tasksWithSkip), 75);
});

test('getCatMoodState maps happiness levels to correct sprite states', () => {
  assert.equal(getCatMoodState(100, 2, false), 'celebrating');
  assert.equal(getCatMoodState(80, 2, false), 'happy');
  assert.equal(getCatMoodState(40, 2, false), 'idle');
  assert.equal(getCatMoodState(20, 2, false), 'sleepy');
  assert.equal(getCatMoodState(20, 2, true), 'hungry');
  assert.equal(getCatMoodState(0, 2, false), 'hungry');
  assert.equal(getCatMoodState(100, 0, false), 'idle');
});

test('checkIsOverdue correctly detects overdue tasks', () => {
  const now = new Date('2026-10-21T15:00:00');
  const pastTask = makeMockTask({
    deadlineDate: '2026-10-21',
    deadlineTime: '14:00',
    state: 'pending',
  });
  const futureTask = makeMockTask({
    deadlineDate: '2026-10-21',
    deadlineTime: '16:00',
    state: 'pending',
  });
  const doneTask = makeMockTask({
    deadlineDate: '2026-10-21',
    deadlineTime: '14:00',
    state: 'done',
  });

  assert.equal(checkIsOverdue(pastTask, now), true);
  assert.equal(checkIsOverdue(futureTask, now), false);
  assert.equal(checkIsOverdue(doneTask, now), false);
});

test('shouldTaskRunOnDate filters weekdays and weekends properly', () => {
  // 2026-10-21 is Wednesday (day 3)
  const wednesday = new Date('2026-10-21T12:00:00');
  // 2026-10-24 is Saturday (day 6)
  const saturday = new Date('2026-10-24T12:00:00');

  const weekdayTask = makeMockTask({ repeat: 'weekdays' });
  const weekendTask = makeMockTask({ repeat: 'weekends' });

  assert.equal(shouldTaskRunOnDate(weekdayTask, wednesday), true);
  assert.equal(shouldTaskRunOnDate(weekdayTask, saturday), false);

  assert.equal(shouldTaskRunOnDate(weekendTask, wednesday), false);
  assert.equal(shouldTaskRunOnDate(weekendTask, saturday), true);
});

test('isQuietHours handles midnight span correctly', () => {
  assert.equal(isQuietHours('23:30', '23:00', '07:00'), true);
  assert.equal(isQuietHours('02:15', '23:00', '07:00'), true);
  assert.equal(isQuietHours('06:59', '23:00', '07:00'), true);
  assert.equal(isQuietHours('07:01', '23:00', '07:00'), false);
  assert.equal(isQuietHours('14:00', '23:00', '07:00'), false);
});

test('rolloverDailyTasks resets repeating tasks on date change', () => {
  const tasks: Task[] = [
    makeMockTask({
      repeat: 'daily',
      state: 'done',
      completedAt: '2026-10-20T10:00:00Z',
      subtasks: [{ id: 's1', title: 'sub 1', completed: true }],
    }),
    makeMockTask({
      repeat: 'once',
      state: 'done',
      completedAt: '2026-10-20T10:00:00Z',
    }),
  ];

  const { updatedTasks, rolloverHappened } = rolloverDailyTasks(
    tasks,
    '2026-10-21',
    '2026-10-20'
  );

  assert.equal(rolloverHappened, true);
  assert.equal(updatedTasks[0].state, 'pending');
  assert.equal(updatedTasks[0].subtasks[0].completed, false);
  assert.equal(updatedTasks[1].state, 'done'); // Once task stays done
});
