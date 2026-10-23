export type FurColor = 'orange' | 'black' | 'white' | 'grey' | 'calico' | 'siamese';
export type EyeColor = 'white' | 'amber' | 'emerald' | 'blue' | 'ruby' | 'hetero';

export type AccessoryId =
  | 'none'
  | 'red_ribbon'
  | 'pink_bow'
  | 'cool_shades'
  | 'round_glasses'
  | 'wizard_hat'
  | 'cowboy_hat'
  | 'party_hat'
  | 'chef_hat'
  | 'knit_scarf'
  | 'crown';

export type RoomDecorationId =
  | 'cozy_plant'
  | 'yarn_basket'
  | 'scratching_post'
  | 'neon_fish'
  | 'fairy_lights'
  | 'loft_cushion';

export interface AccessoryMeta {
  id: AccessoryId;
  name: string;
  price: number;
  type: 'hat' | 'bow' | 'glasses' | 'scarf' | 'crown';
}

export interface DecorationMeta {
  id: RoomDecorationId;
  name: string;
  price: number;
  description: string;
}

export interface CatConfig {
  name: string;
  furColor: FurColor;
  eyeColor: EyeColor;
  accessory: AccessoryId;
  unlockedAccessories: AccessoryId[];
  roomDecorations: RoomDecorationId[];
  unlockedDecorations: RoomDecorationId[];
}

export type FoodType = 'fish' | 'tuna_can' | 'milk' | 'biscuit' | 'shrimp';

export interface FoodInventoryItem {
  type: FoodType;
  name: string;
  count: number;
  description: string;
}

export type Priority = 'low' | 'medium' | 'high';

export interface CategoryMeta {
  id: string;
  name: string;
  icon: string;
  color: string;
  bgColor: string;
}

export type RepeatSchedule =
  | 'once'
  | 'daily'
  | 'weekdays'
  | 'weekends'
  | 'custom_days'
  | 'every_n_days'
  | 'monthly';

export type TaskState = 'pending' | 'done' | 'overdue' | 'skipped';

export interface Subtask {
  id: string;
  title: string;
  completed: boolean;
}

export interface TaskReminders {
  atDeadline: boolean;
  minutesBefore: number[]; // e.g. [5, 15, 30, 60]
  nudgesEnabled: boolean;
  nudgeMinutes: number; // 10, 15, or 30
  nudgesSentCount: number;
}

export interface Task {
  id: string;
  title: string;
  notes?: string;
  category: string;
  priority: Priority;
  deadlineTime?: string; // "HH:MM" e.g. "14:30"
  deadlineDate?: string; // "YYYY-MM-DD" e.g. "2026-10-21"
  repeat: RepeatSchedule;
  repeatCustomDays?: number[]; // [0, 1, 2, 3, 4, 5, 6]
  repeatEveryNDays?: number;
  reminders: TaskReminders;
  state: TaskState;
  skipReason?: string;
  subtasks: Subtask[];
  hasTimer?: boolean;
  timerDuration?: number; // minutes
  completedAt?: string;
  createdAt: string;
  order: number;
}

export type CatAnimationState =
  | 'idle'
  | 'happy'
  | 'eating'
  | 'hungry'
  | 'sleepy'
  | 'celebrating';

export interface NotificationSettings {
  enabled: boolean;
  quietHoursEnabled: boolean;
  quietHoursStart: string; // "23:00"
  quietHoursEnd: string;   // "07:00"
  morningSummary: boolean;
  eveningCheckin: boolean;
  inAppToasts: boolean;
  soundEnabled: boolean;
  hapticsEnabled?: boolean;
}

export interface DayHistoryRecord {
  date: string;
  completedTasks: number;
  totalTasks: number;
  streak: number;
  moodPct: number;
}
