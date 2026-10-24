/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import {
  Task,
  CatConfig,
  FoodType,
  CatAnimationState,
  NotificationSettings,
  Priority,
} from './types/index';
import { PixelRoom } from './components/PixelRoom';
import { HappinessBar } from './components/HappinessBar';
import { FoodInventoryTray } from './components/FoodInventoryTray';
import { TaskList } from './components/TaskList';
import { TaskFormModal } from './components/TaskFormModal';
import { CatPersonalizationModal } from './components/CatPersonalizationModal';
import { SkipTaskModal } from './components/SkipTaskModal';
import { FocusTimerModal } from './components/FocusTimerModal';
import { NotificationsModal } from './components/NotificationsModal';
import { PWAInstallButton } from './components/PWAInstallButton';
import { OfflineIndicator } from './components/OfflineIndicator';
import {
  calculateHappinessPercentage,
  getCatMoodState,
  checkIsOverdue,
  shouldTaskRunOnDate,
  getRandomFoodItem,
  isQuietHours,
  rolloverDailyTasks,
} from './utils/taskRules';
import {
  playCoinSound,
  playMunchSound,
  playCatPurr,
  playFanfareSound,
  playClickSound,
  playTimerDing,
} from './utils/audio';
import { FOOD_INFO } from './utils/pixelCatData';

// Initial Seed Data
const DEFAULT_CAT_CONFIG: CatConfig = {
  name: 'Mochi',
  furColor: 'black',
  eyeColor: 'white',
  accessory: 'none',
  unlockedAccessories: ['none'],
  roomDecorations: ['cozy_plant'],
  unlockedDecorations: ['cozy_plant'],
};

const DEFAULT_SETTINGS: NotificationSettings = {
  enabled: false,
  quietHoursEnabled: true,
  quietHoursStart: '23:00',
  quietHoursEnd: '07:00',
  morningSummary: true,
  eveningCheckin: true,
  inAppToasts: true,
  soundEnabled: true,
};

const INITIAL_TASKS: Task[] = [
  {
    id: 'seed-1',
    title: 'Morning stretch & drink water',
    notes: 'Hydrate before coffee for maximum energy!',
    category: 'health',
    priority: 'medium',
    deadlineTime: '08:30',
    deadlineDate: new Date().toISOString().split('T')[0],
    repeat: 'daily',
    reminders: {
      atDeadline: true,
      minutesBefore: [15],
      nudgesEnabled: true,
      nudgeMinutes: 15,
      nudgesSentCount: 0,
    },
    state: 'pending',
    subtasks: [
      { id: 's1', title: '500ml water', completed: false },
      { id: 's2', title: 'Cat stretch pose', completed: false },
    ],
    hasTimer: false,
    createdAt: new Date().toISOString(),
    order: 1,
  },
  {
    id: 'seed-2',
    title: 'Study / deep work session',
    notes: 'Focus with Pomodoro timer alongside Mochi',
    category: 'study',
    priority: 'high',
    deadlineTime: '15:00',
    deadlineDate: new Date().toISOString().split('T')[0],
    repeat: 'weekdays',
    reminders: {
      atDeadline: true,
      minutesBefore: [30],
      nudgesEnabled: true,
      nudgeMinutes: 15,
      nudgesSentCount: 0,
    },
    state: 'pending',
    subtasks: [
      { id: 's3', title: 'Outline main objectives', completed: false },
      { id: 's4', title: '25 min deep focus', completed: false },
    ],
    hasTimer: true,
    timerDuration: 25,
    createdAt: new Date().toISOString(),
    order: 2,
  },
  {
    id: 'seed-3',
    title: 'Tidy up room & organize desk',
    notes: 'A clear desk leads to a clear mind',
    category: 'home',
    priority: 'low',
    deadlineTime: '19:00',
    deadlineDate: new Date().toISOString().split('T')[0],
    repeat: 'daily',
    reminders: {
      atDeadline: true,
      minutesBefore: [],
      nudgesEnabled: false,
      nudgeMinutes: 15,
      nudgesSentCount: 0,
    },
    state: 'pending',
    subtasks: [],
    hasTimer: false,
    createdAt: new Date().toISOString(),
    order: 3,
  },
];

export default function App() {
  // Theme state
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    return (localStorage.getItem('purrgoals_theme') as 'light' | 'dark') || 'light';
  });

  // Cat Personalization & State
  const [catConfig, setCatConfig] = useState<CatConfig>(() => {
    const saved = localStorage.getItem('purrgoals_cat_config');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {}
    }
    return DEFAULT_CAT_CONFIG;
  });

  // Tasks State
  const [tasks, setTasks] = useState<Task[]>(() => {
    const saved = localStorage.getItem('purrgoals_tasks');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {}
    }
    return INITIAL_TASKS;
  });

  // Food Inventory State
  const [inventory, setInventory] = useState<Record<FoodType, number>>(() => {
    const saved = localStorage.getItem('purrgoals_inventory');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {}
    }
    return { fish: 2, tuna_can: 1, milk: 2, biscuit: 3, shrimp: 1 };
  });

  // Coins State
  const [coins, setCoins] = useState<number>(() => {
    const saved = localStorage.getItem('purrgoals_coins');
    return saved ? Number(saved) : 45;
  });

  // Streak State
  const [streak, setStreak] = useState<number>(() => {
    const saved = localStorage.getItem('purrgoals_streak');
    return saved ? Number(saved) : 3;
  });

  // Notification Settings State
  const [settings, setSettings] = useState<NotificationSettings>(() => {
    const saved = localStorage.getItem('purrgoals_settings');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {}
    }
    return DEFAULT_SETTINGS;
  });

  // UI Modals & Interaction States
  const [isCustomizeOpen, setIsCustomizeOpen] = useState(false);
  const [isTaskFormOpen, setIsTaskFormOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [isSkipOpen, setIsSkipOpen] = useState(false);
  const [taskToSkip, setTaskToSkip] = useState<Task | null>(null);
  const [isTimerOpen, setIsTimerOpen] = useState(false);
  const [timerTask, setTimerTask] = useState<Task | null>(null);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [showIOSInstallGuide, setShowIOSInstallGuide] = useState(false);

  // Feeding & Cat Animations
  const [selectedFoodForFeeding, setSelectedFoodForFeeding] = useState<FoodType | null>(null);
  const [catAnimationStateOverride, setCatAnimationStateOverride] =
    useState<CatAnimationState | null>(null);

  // In-app Toast Banner & Undo Stack
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [lastCompletedTask, setLastCompletedTask] = useState<Task | null>(null);
  const [undoTimer, setUndoTimer] = useState<NodeJS.Timeout | null>(null);

  const [permissionState, setPermissionState] = useState<NotificationPermission | 'default'>('default');

  // Check initial notification permission
  useEffect(() => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      setPermissionState(Notification.permission);
    }
  }, []);

  // Update HTML Theme Class
  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('purrgoals_theme', theme);
  }, [theme]);

  // Persist State to localStorage
  useEffect(() => {
    localStorage.setItem('purrgoals_cat_config', JSON.stringify(catConfig));
  }, [catConfig]);

  useEffect(() => {
    localStorage.setItem('purrgoals_tasks', JSON.stringify(tasks));
  }, [tasks]);

  useEffect(() => {
    localStorage.setItem('purrgoals_inventory', JSON.stringify(inventory));
  }, [inventory]);

  useEffect(() => {
    localStorage.setItem('purrgoals_coins', coins.toString());
  }, [coins]);

  useEffect(() => {
    localStorage.setItem('purrgoals_streak', streak.toString());
  }, [streak]);

  useEffect(() => {
    localStorage.setItem('purrgoals_settings', JSON.stringify(settings));
  }, [settings]);

  // Daily Rollover Logic (Check on load and at midnight)
  useEffect(() => {
    const checkRollover = () => {
      const todayStr = new Date().toISOString().split('T')[0];
      const lastDate = localStorage.getItem('purrgoals_last_date');

      if (lastDate && lastDate !== todayStr) {
        const { updatedTasks, rolloverHappened } = rolloverDailyTasks(tasks, todayStr, lastDate);
        if (rolloverHappened) {
          setTasks(updatedTasks);
          // Increment streak if at least 50% tasks were completed yesterday
          setStreak((prev) => prev + 1);
        }
      }
      localStorage.setItem('purrgoals_last_date', todayStr);
    };

    checkRollover();
    const interval = setInterval(checkRollover, 60000);
    return () => clearInterval(interval);
  }, [tasks]);

  // Today's Tasks & Happiness Calculation
  const today = new Date();
  const todayTasks = tasks.filter((t) => shouldTaskRunOnDate(t, today));
  const completedTodayCount = todayTasks.filter((t) => t.state === 'done').length;
  const hasOverdueTasks = todayTasks.some((t) => checkIsOverdue(t));

  const happinessPct = calculateHappinessPercentage(todayTasks);
  const baseCatMood = getCatMoodState(happinessPct, todayTasks.length, hasOverdueTasks);
  const currentCatAnimationState = catAnimationStateOverride || baseCatMood;

  // Reminders & Nudges Engine (Runs every 30 seconds)
  useEffect(() => {
    if (!settings.enabled) return;

    const interval = setInterval(() => {
      const now = new Date();
      const currentHours = now.getHours().toString().padStart(2, '0');
      const currentMinutes = now.getMinutes().toString().padStart(2, '0');
      const currentTimeStr = `${currentHours}:${currentMinutes}`;

      // Check quiet hours
      if (
        settings.quietHoursEnabled &&
        isQuietHours(currentTimeStr, settings.quietHoursStart, settings.quietHoursEnd)
      ) {
        return; // Suppress during quiet hours
      }

      // Check each pending task for reminders
      todayTasks.forEach((task) => {
        if (task.state === 'done' || task.state === 'skipped') return;
        if (!task.deadlineTime) return;

        const [tH, tM] = task.deadlineTime.split(':').map(Number);
        const taskMinutes = tH * 60 + tM;
        const nowMinutes = now.getHours() * 60 + now.getMinutes();

        // 1. Exact deadline alert
        if (task.reminders.atDeadline && taskMinutes === nowMinutes) {
          triggerNotification(
            `${catConfig.name} is waiting...`,
            `Time to finish: "${task.title}"!`
          );
        }

        // 2. Advance reminder
        task.reminders.minutesBefore.forEach((mb) => {
          if (taskMinutes - nowMinutes === mb) {
            triggerNotification(
              `${catConfig.name}'s gentle paw tap 🐾`,
              `"${task.title}" is due in ${mb} minutes!`
            );
          }
        });

        // 3. Overdue nudges (if enabled and max 3)
        if (
          task.reminders.nudgesEnabled &&
          nowMinutes > taskMinutes &&
          task.reminders.nudgesSentCount < 3
        ) {
          const diff = nowMinutes - taskMinutes;
          if (diff > 0 && diff % task.reminders.nudgeMinutes === 0) {
            triggerNotification(
              `${catConfig.name} is getting hungry!`,
              `Don't forget: "${task.title}". Finish it to feed ${catConfig.name}!`
            );
            // Increment nudge count
            setTasks((prev) =>
              prev.map((t) =>
                t.id === task.id
                  ? {
                      ...t,
                      reminders: {
                        ...t.reminders,
                        nudgesSentCount: t.reminders.nudgesSentCount + 1,
                      },
                    }
                  : t
              )
            );
          }
        }
      });
    }, 30000);

    return () => clearInterval(interval);
  }, [settings, todayTasks, catConfig.name]);

  const triggerNotification = (title: string, body: string) => {
    // 1. Play sound
    if (settings.soundEnabled) {
      playTimerDing(true);
    }

    // 2. Browser Web Notification API
    if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
      try {
        new Notification(title, {
          body,
          icon: '/pwa-192x192.png',
          badge: '/pwa-192x192.png',
        });
      } catch {}
    }

    // 3. In-App Toast Banner
    if (settings.inAppToasts) {
      setToastMessage(`${title} ${body}`);
      setTimeout(() => setToastMessage(null), 5000);
    }
  };

  const requestNotificationPermission = async (): Promise<boolean> => {
    if (typeof window === 'undefined' || !('Notification' in window)) {
      return false;
    }
    try {
      const result = await Notification.requestPermission();
      setPermissionState(result);
      return result === 'granted';
    } catch {
      return false;
    }
  };

  // Task Actions
  const handleToggleComplete = (task: Task) => {
    if (task.state === 'done') {
      // Revert to pending
      playClickSound(settings.soundEnabled);
      setTasks(
        tasks.map((t) =>
          t.id === task.id ? { ...t, state: 'pending', completedAt: undefined } : t
        )
      );
    } else {
      // Complete Task!
      playCoinSound(settings.soundEnabled);
      const earnedFood = getRandomFoodItem();

      // Award 10 coins + food item
      setCoins((prev) => prev + 10);
      setInventory((prev) => ({
        ...prev,
        [earnedFood]: (prev[earnedFood] || 0) + 1,
      }));

      // Update task
      setTasks(
        tasks.map((t) =>
          t.id === task.id
            ? { ...t, state: 'done', completedAt: new Date().toISOString() }
            : t
        )
      );

      // Temporary celebratory mood
      setCatAnimationStateOverride('happy');
      setTimeout(() => setCatAnimationStateOverride(null), 3000);

      // Show Undo Toast
      setLastCompletedTask(task);
      setToastMessage(`Goal "${task.title}" completed! Earned +10 🪙 & 1 ${FOOD_INFO[earnedFood].name}!`);

      if (undoTimer) clearTimeout(undoTimer);
      const timer = setTimeout(() => {
        setLastCompletedTask(null);
        setToastMessage(null);
      }, 6000);
      setUndoTimer(timer);
    }
  };

  const handleUndoComplete = () => {
    if (!lastCompletedTask) return;
    playClickSound(settings.soundEnabled);
    setTasks(
      tasks.map((t) =>
        t.id === lastCompletedTask.id
          ? { ...t, state: 'pending', completedAt: undefined }
          : t
      )
    );
    setCoins((prev) => Math.max(0, prev - 10));
    setLastCompletedTask(null);
    setToastMessage(`Undone! Goal returned to pending.`);
    setTimeout(() => setToastMessage(null), 2500);
  };

  const handleToggleSubtask = (taskId: string, subtaskId: string) => {
    playClickSound(settings.soundEnabled);
    setTasks(
      tasks.map((t) => {
        if (t.id === taskId) {
          const updatedSubtasks = t.subtasks.map((s) =>
            s.id === subtaskId ? { ...s, completed: !s.completed } : s
          );
          return { ...t, subtasks: updatedSubtasks };
        }
        return t;
      })
    );
  };

  const handleQuickAdd = (title: string, category: string) => {
    playClickSound(settings.soundEnabled);
    const newTask: Task = {
      id: 'task-' + Date.now(),
      title,
      category,
      priority: 'medium',
      deadlineTime: '20:00',
      deadlineDate: new Date().toISOString().split('T')[0],
      repeat: 'daily',
      reminders: {
        atDeadline: true,
        minutesBefore: [15],
        nudgesEnabled: true,
        nudgeMinutes: 15,
        nudgesSentCount: 0,
      },
      state: 'pending',
      subtasks: [],
      createdAt: new Date().toISOString(),
      order: Date.now(),
    };
    setTasks([newTask, ...tasks]);
  };

  const handleSaveTask = (task: Task) => {
    if (editingTask) {
      setTasks(tasks.map((t) => (t.id === task.id ? task : t)));
    } else {
      setTasks([task, ...tasks]);
    }
  };

  const handleDeleteTask = (taskId: string) => {
    playClickSound(settings.soundEnabled);
    if (confirm('Delete this goal?')) {
      setTasks(tasks.filter((t) => t.id !== taskId));
    }
  };

  const handleConfirmSkip = (taskId: string, reason: string) => {
    setTasks(
      tasks.map((t) =>
        t.id === taskId ? { ...t, state: 'skipped', skipReason: reason } : t
      )
    );
  };

  // Feeding Mechanic
  const handleFeedCat = (food: FoodType) => {
    if (!inventory[food] || inventory[food] <= 0) return;

    // Deduct from inventory
    setInventory((prev) => ({
      ...prev,
      [food]: Math.max(0, prev[food] - 1),
    }));

    // Play munch sound & purr
    playMunchSound(settings.soundEnabled);
    setTimeout(() => {
      playCatPurr(settings.soundEnabled);
    }, 600);

    // Set eating animation state for 2.8 seconds
    setCatAnimationStateOverride('eating');
    setTimeout(() => {
      setCatAnimationStateOverride('happy');
      setTimeout(() => {
        setCatAnimationStateOverride(null);
      }, 2500);
    }, 2800);

    // Bonus 5 coins for caring for cat
    setCoins((prev) => prev + 5);
    setToastMessage(`Fed ${catConfig.name} ${FOOD_INFO[food].name}! +5 🪙`);
    setTimeout(() => setToastMessage(null), 3500);
  };

  return (
    <div className="min-h-screen w-full max-w-full overflow-x-hidden bg-[#fef9f2] dark:bg-[#12111a] text-stone-900 dark:text-stone-100 safe-bottom transition-colors duration-200">
      {/* Offline Status Banner */}
      <OfflineIndicator />

      {/* Retro In-App Toast Banner */}
      {toastMessage && (
        <div className="fixed top-14 left-3 right-3 sm:left-auto sm:right-4 z-50 retro-box bg-amber-300 dark:bg-stone-800 text-stone-900 dark:text-amber-100 p-3 max-w-md flex items-center justify-between gap-3 shadow-xl animate-bounce">
          <div className="font-pixel text-[10px] sm:text-xs">{toastMessage}</div>
          {lastCompletedTask && (
            <button
              onClick={handleUndoComplete}
              className="retro-btn px-2.5 py-1 bg-rose-500 text-white font-pixel text-[9px] flex-shrink-0"
            >
              UNDO
            </button>
          )}
        </div>
      )}

      {/* Top Retro Header Bar (with phone safe-area clearance) */}
      <header className="sticky top-0 z-40 safe-header bg-[#faeed8] dark:bg-[#181524] border-b-4 border-stone-800 dark:border-stone-900 px-2.5 sm:px-6 pb-2 sm:pb-2.5 flex items-center justify-between gap-1.5 sm:gap-2 shadow-md w-full max-w-full overflow-x-hidden">
        <div className="flex items-center gap-1.5 sm:gap-2 min-w-0">
          <span className="text-xl sm:text-2xl drop-shadow-sm flex-shrink-0">🐾</span>
          <div className="min-w-0">
            <h1 className="font-pixel text-xs sm:text-base text-stone-900 dark:text-amber-200 tracking-wide truncate">
              PurrGoals
            </h1>
            <div className="text-[9px] sm:text-[10px] text-stone-600 dark:text-stone-400 font-pixel truncate">
              with {catConfig.name}
            </div>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
          {/* Sound Toggle */}
          <button
            onClick={() => {
              playClickSound(!settings.soundEnabled);
              setSettings({ ...settings, soundEnabled: !settings.soundEnabled });
            }}
            aria-label={settings.soundEnabled ? 'Mute sound' : 'Enable sound'}
            className="retro-btn px-1.5 sm:px-2 py-1 bg-white dark:bg-stone-800 text-stone-800 dark:text-stone-200 font-pixel text-[10px]"
            title="Toggle Sound"
          >
            {settings.soundEnabled ? '🔊' : '🔇'}
          </button>

          {/* Theme Toggle */}
          <button
            onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
            aria-label="Toggle dark mode"
            className="retro-btn px-1.5 sm:px-2 py-1 bg-white dark:bg-stone-800 text-stone-800 dark:text-stone-200 font-pixel text-[10px]"
            title="Toggle Dark Mode"
          >
            {theme === 'light' ? '🌙' : '☀️'}
          </button>

          {/* Reminders / Notifications Button */}
          <button
            onClick={() => {
              playClickSound(settings.soundEnabled);
              setIsNotificationsOpen(true);
            }}
            aria-label="Notification settings"
            className="retro-btn px-1.5 sm:px-2 py-1 bg-white dark:bg-stone-800 text-stone-800 dark:text-stone-200 font-pixel text-[10px] relative"
            title="Notifications & Quiet Hours"
          >
            <span>🔔</span>
            {settings.enabled && (
              <span className="absolute -top-1 -right-1 w-2 h-2 bg-emerald-500 rounded-full" />
            )}
          </button>

          {/* Customize Cat Button */}
          <button
            onClick={() => {
              playClickSound(settings.soundEnabled);
              setIsCustomizeOpen(true);
            }}
            aria-label="Customize cat"
            className="retro-btn px-2 sm:px-2.5 py-1 bg-amber-400 hover:bg-amber-300 text-stone-900 font-pixel text-[9px] flex items-center gap-1"
          >
            <span>🐱</span>
            <span className="hidden sm:inline">Customize</span>
          </button>

          {/* PWA Install Button */}
          <PWAInstallButton onModalClosed={() => setShowIOSInstallGuide(false)} />
        </div>
      </header>

      {/* Main Content Area */}
      <main className="w-full max-w-xl mx-auto px-2.5 sm:px-4 pt-3 sm:pt-4 space-y-3 sm:space-y-4 overflow-x-hidden">
        {/* Pixel Cat Room */}
        <PixelRoom
          catConfig={catConfig}
          animationState={currentCatAnimationState}
          happinessPct={happinessPct}
          onFeedCat={handleFeedCat}
          soundEnabled={settings.soundEnabled}
          selectedFoodForFeeding={selectedFoodForFeeding}
          onClearSelectedFood={() => setSelectedFoodForFeeding(null)}
          onOpenCustomize={() => setIsCustomizeOpen(true)}
        />

        {/* 5-Heart Happiness & Streak Bar */}
        <HappinessBar
          happinessPct={happinessPct}
          streak={streak}
          coins={coins}
          tasksCompleted={completedTodayCount}
          totalTasksToday={todayTasks.length}
          catName={catConfig.name}
        />

        {/* Food Inventory Pantry Tray */}
        <FoodInventoryTray
          inventory={inventory}
          selectedFood={selectedFoodForFeeding}
          onSelectFood={(food) => setSelectedFoodForFeeding(food)}
          onFeedDirectly={handleFeedCat}
          catName={catConfig.name}
          soundEnabled={settings.soundEnabled}
        />

        {/* Task Management List */}
        <TaskList
          tasks={tasks}
          onToggleComplete={handleToggleComplete}
          onToggleSubtask={handleToggleSubtask}
          onOpenCreate={() => {
            setEditingTask(null);
            setIsTaskFormOpen(true);
          }}
          onQuickAdd={handleQuickAdd}
          onOpenEdit={(task) => {
            setEditingTask(task);
            setIsTaskFormOpen(true);
          }}
          onOpenSkip={(task) => {
            setTaskToSkip(task);
            setIsSkipOpen(true);
          }}
          onDeleteTask={handleDeleteTask}
          onOpenTimer={(task) => {
            setTimerTask(task);
            setIsTimerOpen(true);
          }}
          onReorderTasks={(newTasks) => setTasks(newTasks)}
          catName={catConfig.name}
          soundEnabled={settings.soundEnabled}
        />
      </main>

      {/* Modals */}
      {isCustomizeOpen && (
        <CatPersonalizationModal
          catConfig={catConfig}
          coins={coins}
          onSaveConfig={(newConfig) => setCatConfig(newConfig)}
          onSpendCoins={(amount) => setCoins((prev) => Math.max(0, prev - amount))}
          onClose={() => setIsCustomizeOpen(false)}
          soundEnabled={settings.soundEnabled}
        />
      )}

      {isTaskFormOpen && (
        <TaskFormModal
          initialTask={editingTask}
          onSaveTask={handleSaveTask}
          onClose={() => {
            setIsTaskFormOpen(false);
            setEditingTask(null);
          }}
          soundEnabled={settings.soundEnabled}
        />
      )}

      {isSkipOpen && taskToSkip && (
        <SkipTaskModal
          task={taskToSkip}
          catName={catConfig.name}
          onConfirmSkip={handleConfirmSkip}
          onClose={() => {
            setIsSkipOpen(false);
            setTaskToSkip(null);
          }}
          soundEnabled={settings.soundEnabled}
        />
      )}

      {isTimerOpen && timerTask && (
        <FocusTimerModal
          task={timerTask}
          catName={catConfig.name}
          onCompleteTask={(taskId) => {
            const task = tasks.find((t) => t.id === taskId);
            if (task) handleToggleComplete(task);
          }}
          onClose={() => {
            setIsTimerOpen(false);
            setTimerTask(null);
          }}
          soundEnabled={settings.soundEnabled}
        />
      )}

      {isNotificationsOpen && (
        <NotificationsModal
          settings={settings}
          catName={catConfig.name}
          onUpdateSettings={(newSettings) => setSettings(newSettings)}
          onClose={() => setIsNotificationsOpen(false)}
          onTriggerTestNotification={() => {
            triggerNotification(
              `Meow from ${catConfig.name}! 🐾`,
              `You are doing fantastic! Remember to check your goals!`
            );
          }}
          onRequestPermission={requestNotificationPermission}
          permissionState={permissionState}
          soundEnabled={settings.soundEnabled}
          onOpenInstall={() => setShowIOSInstallGuide(true)}
        />
      )}
    </div>
  );
}
