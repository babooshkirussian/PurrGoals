import React, { useState } from 'react';
import { NotificationSettings } from '../types/index';
import { playClickSound, playCatMeow } from '../utils/audio';

interface NotificationsModalProps {
  settings: NotificationSettings;
  catName: string;
  onUpdateSettings: (newSettings: NotificationSettings) => void;
  onClose: () => void;
  onTriggerTestNotification: () => void;
  onRequestPermission: () => Promise<boolean>;
  permissionState: NotificationPermission | 'default';
  soundEnabled: boolean;
  onOpenInstall?: () => void;
}

export const NotificationsModal: React.FC<NotificationsModalProps> = ({
  settings,
  catName,
  onUpdateSettings,
  onClose,
  onTriggerTestNotification,
  onRequestPermission,
  permissionState,
  soundEnabled,
  onOpenInstall,
}) => {
  const [localSettings, setLocalSettings] = useState<NotificationSettings>(settings);
  const [statusMessage, setStatusMessage] = useState('');

  const handleToggleGlobal = async (checked: boolean) => {
    if (checked && permissionState !== 'granted') {
      const granted = await onRequestPermission();
      if (!granted) {
        setStatusMessage('Notification permission was not granted by your browser.');
        return;
      }
    }
    const updated = { ...localSettings, enabled: checked };
    setLocalSettings(updated);
    onUpdateSettings(updated);
  };

  const handleSave = () => {
    playClickSound(soundEnabled);
    onUpdateSettings(localSettings);
    onClose();
  };

  const handleTest = () => {
    playCatMeow(soundEnabled);
    onTriggerTestNotification();
    setStatusMessage(`Test notification sent in ${catName}'s voice! Check your system notifications or app banner.`);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 overflow-y-auto">
      <div className="retro-box w-full max-w-md bg-[#fffbeb] dark:bg-[#1c1917] p-5 max-h-[90vh] flex flex-col justify-between text-stone-900 dark:text-stone-100">
        {/* Header */}
        <div className="flex items-center justify-between border-b-2 border-stone-800 pb-2 mb-3">
          <div className="flex items-center gap-2">
            <span className="text-xl">🔔</span>
            <h2 className="font-pixel text-xs sm:text-sm text-stone-900 dark:text-amber-100">
              {catName}&apos;s Reminders
            </h2>
          </div>
          <button
            onClick={onClose}
            aria-label="Close"
            className="retro-btn px-2 py-0.5 bg-rose-500 text-white font-pixel text-xs"
          >
            ✕
          </button>
        </div>

        {/* Cat message intro */}
        <div className="retro-box-sm bg-[#faeed8] dark:bg-[#292524] p-3 mb-3 flex items-start gap-3">
          <span className="text-2xl flex-shrink-0">🐾</span>
          <p className="text-xs text-stone-700 dark:text-stone-300">
            &ldquo;Mrow! I want to keep you company and remind you gently so we never miss our cozy
            daily goals! I promise not to wake you during quiet hours!&rdquo;
          </p>
        </div>

        {statusMessage && (
          <div className="bg-amber-100 border border-amber-600 text-amber-900 p-2 font-pixel text-[9px] mb-3">
            {statusMessage}
          </div>
        )}

        {/* Scrollable options */}
        <div className="flex-1 overflow-y-auto pr-1 space-y-3 mb-3">
          {/* Main Global Notification Switch */}
          <div className="retro-box-sm p-3 bg-white dark:bg-stone-800 flex items-center justify-between">
            <div>
              <div className="font-pixel text-[11px] text-stone-900 dark:text-amber-200">
                Cat Reminders
              </div>
              <div className="text-[11px] text-stone-500">
                Permission status: <span className="font-bold uppercase">{permissionState}</span>
              </div>
            </div>
            <input
              type="checkbox"
              checked={localSettings.enabled}
              onChange={(e) => handleToggleGlobal(e.target.checked)}
              className="w-5 h-5 accent-emerald-500 cursor-pointer"
            />
          </div>

          {/* Sound & In-app Banners */}
          <div className="retro-box-sm p-3 bg-white dark:bg-stone-800 space-y-2">
            <div className="font-pixel text-[10px] text-stone-900 dark:text-amber-200 mb-1">
              Alert Preferences
            </div>

            <label className="flex items-center justify-between text-xs cursor-pointer">
              <span>8-Bit Sounds & Meows</span>
              <input
                type="checkbox"
                checked={localSettings.soundEnabled}
                onChange={(e) =>
                  setLocalSettings({ ...localSettings, soundEnabled: e.target.checked })
                }
                className="w-4 h-4 accent-amber-500"
              />
            </label>

            <label className="flex items-center justify-between text-xs cursor-pointer">
              <span>In-App Toast Banners (while open)</span>
              <input
                type="checkbox"
                checked={localSettings.inAppToasts}
                onChange={(e) =>
                  setLocalSettings({ ...localSettings, inAppToasts: e.target.checked })
                }
                className="w-4 h-4 accent-amber-500"
              />
            </label>
          </div>

          {/* Quiet Hours */}
          <div className="retro-box-sm p-3 bg-white dark:bg-stone-800 space-y-2">
            <div className="flex items-center justify-between">
              <div className="font-pixel text-[10px] text-stone-900 dark:text-amber-200">
                🌙 Quiet Hours
              </div>
              <input
                type="checkbox"
                checked={localSettings.quietHoursEnabled}
                onChange={(e) =>
                  setLocalSettings({ ...localSettings, quietHoursEnabled: e.target.checked })
                }
                className="w-4 h-4 accent-amber-500"
              />
            </div>
            <p className="text-[10px] text-stone-500">
              No sounds or notifications will bother you while {catName} is fast asleep!
            </p>

            {localSettings.quietHoursEnabled && (
              <div className="flex items-center gap-2 pt-1">
                <div className="flex-1">
                  <span className="text-[10px] block text-stone-500">From:</span>
                  <input
                    type="time"
                    value={localSettings.quietHoursStart}
                    onChange={(e) =>
                      setLocalSettings({ ...localSettings, quietHoursStart: e.target.value })
                    }
                    className="w-full retro-box-sm px-2 py-1 bg-white dark:bg-stone-900 text-xs text-center"
                  />
                </div>
                <span className="text-xs pt-3">to</span>
                <div className="flex-1">
                  <span className="text-[10px] block text-stone-500">Until:</span>
                  <input
                    type="time"
                    value={localSettings.quietHoursEnd}
                    onChange={(e) =>
                      setLocalSettings({ ...localSettings, quietHoursEnd: e.target.value })
                    }
                    className="w-full retro-box-sm px-2 py-1 bg-white dark:bg-stone-900 text-xs text-center"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Daily Summaries */}
          <div className="retro-box-sm p-3 bg-white dark:bg-stone-800 space-y-2">
            <div className="font-pixel text-[10px] text-stone-900 dark:text-amber-200 mb-1">
              Cat Check-ins
            </div>

            <label className="flex items-center justify-between text-xs cursor-pointer">
              <div>
                <span className="block font-medium">Morning Habit Kickoff</span>
                <span className="text-[10px] text-stone-500">
                  &ldquo;Good morning! You have goals today&rdquo;
                </span>
              </div>
              <input
                type="checkbox"
                checked={localSettings.morningSummary}
                onChange={(e) =>
                  setLocalSettings({ ...localSettings, morningSummary: e.target.checked })
                }
                className="w-4 h-4 accent-amber-500"
              />
            </label>

            <label className="flex items-center justify-between text-xs cursor-pointer pt-1 border-t border-stone-200 dark:border-stone-700">
              <div>
                <span className="block font-medium">Evening Cozy Check-in</span>
                <span className="text-[10px] text-stone-500">
                  &ldquo;Almost bedtime, {catName} is counting on you&rdquo;
                </span>
              </div>
              <input
                type="checkbox"
                checked={localSettings.eveningCheckin}
                onChange={(e) =>
                  setLocalSettings({ ...localSettings, eveningCheckin: e.target.checked })
                }
                className="w-4 h-4 accent-amber-500"
              />
            </label>
          </div>

          {/* Home screen install note */}
          <div className="p-2.5 bg-amber-50 dark:bg-stone-900 border border-dashed border-amber-600 rounded-xs">
            <div className="font-pixel text-[9px] text-amber-800 dark:text-amber-300 mb-1">
              💡 PWA Notification Tip:
            </div>
            <p className="text-[11px] text-stone-600 dark:text-stone-300">
              Web reminders and background badges work best when PurrGoals is installed to your home screen!
            </p>
            {onOpenInstall && (
              <button
                type="button"
                onClick={onOpenInstall}
                className="retro-btn mt-2 px-3 py-1 bg-amber-400 font-pixel text-[8px] text-stone-900"
              >
                Install App Now 📲
              </button>
            )}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="space-y-2 pt-2 border-t-2 border-stone-800">
          <button
            type="button"
            onClick={handleTest}
            className="retro-btn w-full py-2 bg-amber-400 text-stone-900 font-pixel text-[10px]"
          >
            🔔 Send Test Notification From {catName}
          </button>

          <div className="flex gap-2">
            <button
              type="button"
              onClick={onClose}
              className="retro-btn flex-1 py-1.5 bg-stone-200 dark:bg-stone-700 font-pixel text-xs text-stone-800 dark:text-stone-200"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="retro-btn flex-1 py-1.5 bg-emerald-500 text-white font-pixel text-xs hover:bg-emerald-600"
            >
              Save Settings
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
