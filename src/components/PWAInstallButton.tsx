import React, { useState } from 'react';
import { usePWAInstall } from './usePWAInstall';

interface PWAInstallButtonProps {
  customTriggerModalOnly?: boolean;
  onModalClosed?: () => void;
}

export const PWAInstallButton: React.FC<PWAInstallButtonProps> = ({
  customTriggerModalOnly = false,
  onModalClosed,
}) => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showIOSGuide, setShowIOSGuide] = useState(false);

  // If already running in standalone mode, hide unless modal specifically requested
  if (isInstalled && !customTriggerModalOnly) {
    return null;
  }

  const handleInstallClick = async () => {
    if (isInstallable) {
      await install();
    } else {
      setShowIOSGuide(true);
    }
  };

  const closeGuide = () => {
    setShowIOSGuide(false);
    if (onModalClosed) onModalClosed();
  };

  return (
    <>
      {!customTriggerModalOnly && (
        <button
          onClick={handleInstallClick}
          aria-label="Install PurrGoals App"
          className="retro-btn px-2 sm:px-2.5 py-1 bg-amber-400 hover:bg-amber-300 text-stone-900 font-pixel text-[9px] flex items-center gap-1"
        >
          <span>📲</span>
          <span className="hidden sm:inline">Install</span>
        </button>
      )}

      {showIOSGuide && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="retro-box w-full max-w-sm bg-[#fffbeb] dark:bg-[#1c1917] p-5 text-stone-900 dark:text-stone-100">
            <div className="flex items-center justify-between border-b-2 border-stone-800 pb-2 mb-3">
              <div className="flex items-center gap-1.5">
                <span>📲</span>
                <h3 className="font-pixel text-xs text-stone-900 dark:text-amber-100">
                  Install PurrGoals
                </h3>
              </div>
              <button
                onClick={closeGuide}
                className="retro-btn px-2 py-0.5 bg-rose-500 text-white font-pixel text-[10px]"
              >
                ✕
              </button>
            </div>

            <div className="text-xs space-y-2 mb-4 text-stone-700 dark:text-stone-300">
              <p className="font-pixel text-[10px] text-amber-700 dark:text-amber-400">
                To install on iPhone / iPad / Android:
              </p>
              <div className="p-2.5 bg-amber-50 dark:bg-stone-800 retro-box-sm space-y-1.5">
                <p>1. Tap the <strong>Share</strong> button (or browser menu ⋮).</p>
                <p>2. Scroll down and tap <strong>&ldquo;Add to Home Screen&rdquo;</strong>.</p>
                <p>3. Tap <strong>Add</strong> at the top right.</p>
              </div>
              <p className="text-[11px] text-stone-500">
                Once added, PurrGoals runs full-screen with offline support and instant notifications!
              </p>
            </div>

            <button
              onClick={closeGuide}
              className="retro-btn w-full py-2 bg-emerald-500 text-white font-pixel text-xs"
            >
              Got it!
            </button>
          </div>
        </div>
      )}
    </>
  );
};
