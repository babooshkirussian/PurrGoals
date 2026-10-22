import React, { useEffect, useState } from 'react';

export const OfflineIndicator: React.FC = () => {
  const [isOnline, setIsOnline] = useState(
    typeof navigator !== 'undefined' ? navigator.onLine : true
  );

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (isOnline) return null;

  return (
    <div className="fixed bottom-3 left-3 right-3 sm:left-auto sm:right-3 z-50 retro-box-sm bg-amber-400 text-stone-900 px-3 py-1.5 flex items-center gap-2 font-pixel text-[9px] shadow-lg">
      <span className="w-2 h-2 rounded-full bg-rose-600 animate-ping" />
      <span>Offline Mode — All tasks and pet data are safely stored in localStorage.</span>
    </div>
  );
};
