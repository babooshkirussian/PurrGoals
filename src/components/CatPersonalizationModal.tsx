import React, { useState } from 'react';
import { CatConfig, FurColor, EyeColor, AccessoryId, RoomDecorationId } from '../types/index';
import { ACCESSORIES_CATALOG, DECORATIONS_CATALOG, getCatColors } from '../utils/pixelCatData';
import { PixelCatCanvas } from './PixelCatCanvas';
import { playClickSound, playCoinSound } from '../utils/audio';

interface CatPersonalizationModalProps {
  catConfig: CatConfig;
  coins: number;
  onSaveConfig: (newConfig: CatConfig) => void;
  onSpendCoins: (amount: number) => void;
  onClose: () => void;
  soundEnabled: boolean;
}

export const CatPersonalizationModal: React.FC<CatPersonalizationModalProps> = ({
  catConfig,
  coins,
  onSaveConfig,
  onSpendCoins,
  onClose,
  soundEnabled,
}) => {
  const [activeTab, setActiveTab] = useState<'look' | 'wardrobe' | 'decor'>('look');
  const [name, setName] = useState(catConfig.name);
  const [furColor, setFurColor] = useState<FurColor>(catConfig.furColor);
  const [eyeColor, setEyeColor] = useState<EyeColor>(catConfig.eyeColor);
  const [accessory, setAccessory] = useState<AccessoryId>(catConfig.accessory);
  const [unlockedAccessories, setUnlockedAccessories] = useState<AccessoryId[]>(
    catConfig.unlockedAccessories || ['none']
  );
  const [roomDecorations, setRoomDecorations] = useState<RoomDecorationId[]>(
    catConfig.roomDecorations || []
  );
  const [unlockedDecorations, setUnlockedDecorations] = useState<RoomDecorationId[]>(
    catConfig.unlockedDecorations || []
  );

  const furColors: { id: FurColor; name: string; preview: string }[] = [
    { id: 'orange', name: 'Ginger Tabby', preview: '#ea580c' },
    { id: 'black', name: 'Tuxedo Black', preview: '#27272a' },
    { id: 'white', name: 'Snow White', preview: '#f8fafc' },
    { id: 'grey', name: 'Smokey Grey', preview: '#64748b' },
    { id: 'calico', name: 'Calico Patch', preview: '#f97316' },
    { id: 'siamese', name: 'Siamese Point', preview: '#451a03' },
  ];

  const eyeColors: { id: EyeColor; name: string; preview: string }[] = [
    { id: 'white', name: 'White Slit (Ref)', preview: '#ffffff' },
    { id: 'amber', name: 'Golden Amber', preview: '#facc15' },
    { id: 'emerald', name: 'Emerald Green', preview: '#10b981' },
    { id: 'blue', name: 'Sky Blue', preview: '#38bdf8' },
    { id: 'ruby', name: 'Ruby Pink', preview: '#f43f5e' },
    { id: 'hetero', name: 'Dichromatic', preview: 'linear-gradient(90deg, #ffffff 50%, #38bdf8 50%)' },
  ];

  // Temporary config for live preview in modal
  const previewConfig: CatConfig = {
    name: name || 'Mochi',
    furColor,
    eyeColor,
    accessory,
    unlockedAccessories,
    roomDecorations,
    unlockedDecorations,
  };

  const handleSave = () => {
    playClickSound(soundEnabled);
    onSaveConfig(previewConfig);
    onClose();
  };

  const handleBuyAccessory = (acc: typeof ACCESSORIES_CATALOG[0]) => {
    if (coins < acc.price) {
      alert("Not enough coins! Check off more tasks to earn coins!");
      return;
    }
    onSpendCoins(acc.price);
    playCoinSound(soundEnabled);
    const newUnlocked = [...unlockedAccessories, acc.id];
    setUnlockedAccessories(newUnlocked);
    setAccessory(acc.id);
  };

  const handleBuyDecoration = (dec: typeof DECORATIONS_CATALOG[0]) => {
    if (coins < dec.price) {
      alert("Not enough coins! Check off more tasks to earn coins!");
      return;
    }
    onSpendCoins(dec.price);
    playCoinSound(soundEnabled);
    const newUnlocked = [...unlockedDecorations, dec.id];
    setUnlockedDecorations(newUnlocked);
    setRoomDecorations([...roomDecorations, dec.id]);
  };

  const toggleDecoration = (decId: RoomDecorationId) => {
    playClickSound(soundEnabled);
    if (roomDecorations.includes(decId)) {
      setRoomDecorations(roomDecorations.filter((id) => id !== decId));
    } else {
      setRoomDecorations([...roomDecorations, decId]);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-3 safe-modal overflow-y-auto">
      <div className="retro-box w-full max-w-lg bg-[#fffbeb] dark:bg-[#1c1917] p-4 sm:p-5 max-h-[86dvh] flex flex-col justify-between">
        {/* Header */}
        <div className="flex items-center justify-between border-b-2 border-stone-800 pb-3 mb-3">
          <div className="flex items-center gap-2">
            <span className="text-2xl">🐱</span>
            <div>
              <h2 className="font-pixel text-sm text-stone-900 dark:text-amber-100">
                Customize Cat
              </h2>
              <div className="text-xs text-stone-600 dark:text-stone-400 font-pixel mt-0.5">
                Coins: <span className="text-amber-500 font-bold">{coins} 🪙</span>
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Close customization modal"
            className="retro-btn px-2.5 py-1 bg-rose-500 text-white font-pixel text-xs"
          >
            ✕
          </button>
        </div>

        {/* Live Preview Box */}
        <div className="retro-box-sm bg-[#faeed8] dark:bg-[#292524] p-3 flex flex-col items-center justify-center mb-3">
          <PixelCatCanvas catConfig={previewConfig} animationState="happy" />
          <div className="font-pixel text-xs text-stone-800 dark:text-amber-200 mt-1">
            {previewConfig.name}
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex gap-1 mb-3">
          <button
            onClick={() => setActiveTab('look')}
            className={`retro-btn flex-1 py-1.5 font-pixel text-[10px] ${
              activeTab === 'look'
                ? 'bg-amber-400 text-stone-900'
                : 'bg-stone-200 dark:bg-stone-800 text-stone-700 dark:text-stone-300'
            }`}
          >
            Appearance
          </button>
          <button
            onClick={() => setActiveTab('wardrobe')}
            className={`retro-btn flex-1 py-1.5 font-pixel text-[10px] ${
              activeTab === 'wardrobe'
                ? 'bg-amber-400 text-stone-900'
                : 'bg-stone-200 dark:bg-stone-800 text-stone-700 dark:text-stone-300'
            }`}
          >
            Wardrobe
          </button>
          <button
            onClick={() => setActiveTab('decor')}
            className={`retro-btn flex-1 py-1.5 font-pixel text-[10px] ${
              activeTab === 'decor'
                ? 'bg-amber-400 text-stone-900'
                : 'bg-stone-200 dark:bg-stone-800 text-stone-700 dark:text-stone-300'
            }`}
          >
            Decor Shop
          </button>
        </div>

        {/* Tab Content */}
        <div className="flex-1 overflow-y-auto pr-1 space-y-4 mb-4 text-stone-900 dark:text-stone-100">
          {activeTab === 'look' && (
            <div className="space-y-4">
              {/* Cat Name Input */}
              <div>
                <label className="block font-pixel text-[11px] text-stone-800 dark:text-amber-200 mb-1">
                  Cat Name:
                </label>
                <input
                  type="text"
                  maxLength={16}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Mochi, Luna, Boba"
                  className="w-full retro-box-sm px-3 py-1.5 bg-white dark:bg-stone-900 font-pixel text-xs text-stone-900 dark:text-white outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              {/* Fur Color Selector */}
              <div>
                <label className="block font-pixel text-[11px] text-stone-800 dark:text-amber-200 mb-2">
                  Fur Coat:
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {furColors.map((color) => {
                    const isSelected = furColor === color.id;
                    return (
                      <button
                        key={color.id}
                        onClick={() => {
                          playClickSound(soundEnabled);
                          setFurColor(color.id);
                        }}
                        className={`retro-btn p-2 flex items-center gap-2 text-left ${
                          isSelected
                            ? 'bg-amber-300 dark:bg-amber-800 text-stone-900 dark:text-white ring-2 ring-stone-900'
                            : 'bg-white dark:bg-stone-800 text-stone-800 dark:text-stone-200'
                        }`}
                      >
                        <span
                          className="w-4 h-4 rounded-xs border border-stone-800 flex-shrink-0"
                          style={{ backgroundColor: color.preview }}
                        />
                        <span className="font-pixel text-[9px] truncate">{color.name}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Eye Color Selector */}
              <div>
                <label className="block font-pixel text-[11px] text-stone-800 dark:text-amber-200 mb-2">
                  Eye Color:
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {eyeColors.map((eye) => {
                    const isSelected = eyeColor === eye.id;
                    return (
                      <button
                        key={eye.id}
                        onClick={() => {
                          playClickSound(soundEnabled);
                          setEyeColor(eye.id);
                        }}
                        className={`retro-btn p-2 flex items-center gap-2 text-left ${
                          isSelected
                            ? 'bg-amber-300 dark:bg-amber-800 text-stone-900 dark:text-white ring-2 ring-stone-900'
                            : 'bg-white dark:bg-stone-800 text-stone-800 dark:text-stone-200'
                        }`}
                      >
                        <span
                          className="w-4 h-4 rounded-xs border border-stone-800 flex-shrink-0"
                          style={{ background: eye.preview }}
                        />
                        <span className="font-pixel text-[9px] truncate">{eye.name}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'wardrobe' && (
            <div className="space-y-3">
              <p className="text-xs text-stone-600 dark:text-stone-400">
                Unlock stylish accessories with coins earned from finishing goals!
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {ACCESSORIES_CATALOG.map((item) => {
                  const isUnlocked = unlockedAccessories.includes(item.id);
                  const isEquipped = accessory === item.id;

                  return (
                    <div
                      key={item.id}
                      className={`retro-box-sm p-2 flex items-center justify-between ${
                        isEquipped
                          ? 'bg-emerald-100 dark:bg-emerald-950 border-emerald-600'
                          : 'bg-white dark:bg-stone-800'
                      }`}
                    >
                      <div>
                        <div className="font-pixel text-[10px] text-stone-900 dark:text-amber-100">
                          {item.name}
                        </div>
                        <div className="text-[10px] text-stone-500 font-pixel">
                          {item.price === 0 ? 'Free' : `${item.price} 🪙`}
                        </div>
                      </div>

                      {isUnlocked ? (
                        <button
                          onClick={() => {
                            playClickSound(soundEnabled);
                            setAccessory(item.id);
                          }}
                          className={`retro-btn px-2.5 py-1 font-pixel text-[9px] ${
                            isEquipped
                              ? 'bg-emerald-500 text-white'
                              : 'bg-amber-300 text-stone-900'
                          }`}
                        >
                          {isEquipped ? 'Worn' : 'Equip'}
                        </button>
                      ) : (
                        <button
                          onClick={() => handleBuyAccessory(item)}
                          className="retro-btn px-2.5 py-1 bg-amber-500 text-white font-pixel text-[9px]"
                        >
                          Buy 🪙
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {activeTab === 'decor' && (
            <div className="space-y-3">
              <p className="text-xs text-stone-600 dark:text-stone-400">
                Cozy decorations for {previewConfig.name}&apos;s room!
              </p>
              <div className="grid grid-cols-1 gap-2">
                {DECORATIONS_CATALOG.map((item) => {
                  const isUnlocked = unlockedDecorations.includes(item.id);
                  const isActive = roomDecorations.includes(item.id);

                  return (
                    <div
                      key={item.id}
                      className={`retro-box-sm p-2.5 flex items-center justify-between ${
                        isActive
                          ? 'bg-amber-100 dark:bg-stone-800 border-amber-500'
                          : 'bg-white dark:bg-stone-900'
                      }`}
                    >
                      <div>
                        <div className="font-pixel text-[10px] text-stone-900 dark:text-amber-100">
                          {item.name}
                        </div>
                        <div className="text-xs text-stone-600 dark:text-stone-400">
                          {item.description}
                        </div>
                        <div className="text-[10px] text-stone-500 font-pixel mt-0.5">
                          {item.price} 🪙
                        </div>
                      </div>

                      {isUnlocked ? (
                        <button
                          onClick={() => toggleDecoration(item.id)}
                          className={`retro-btn px-2.5 py-1 font-pixel text-[9px] ${
                            isActive
                              ? 'bg-emerald-500 text-white'
                              : 'bg-stone-300 dark:bg-stone-700 text-stone-800 dark:text-stone-200'
                          }`}
                        >
                          {isActive ? 'Placed' : 'Place'}
                        </button>
                      ) : (
                        <button
                          onClick={() => handleBuyDecoration(item)}
                          className="retro-btn px-2.5 py-1 bg-amber-500 text-white font-pixel text-[9px]"
                        >
                          Buy 🪙
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="flex gap-2 pt-2 border-t-2 border-stone-800">
          <button
            onClick={onClose}
            className="retro-btn flex-1 py-2 bg-stone-200 dark:bg-stone-700 font-pixel text-xs text-stone-800 dark:text-stone-200"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="retro-btn flex-1 py-2 bg-emerald-500 text-white font-pixel text-xs hover:bg-emerald-600"
          >
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
};
