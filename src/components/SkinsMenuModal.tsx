import { useState } from 'react';
import { X, Check, Sparkles, Flame, Shield, Star, Zap } from 'lucide-react';
import { SnakeSkinId, SkinRarity } from '../types/game';
import { SNAKE_SKINS, RARITY_CONFIG, SnakeSkinDef } from '../game/skins';

interface SkinsMenuModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentSkin: SnakeSkinId;
  onEquipSkin: (skinId: SnakeSkinId) => void;
}

export function SkinsMenuModal({
  isOpen,
  onClose,
  currentSkin,
  onEquipSkin,
}: SkinsMenuModalProps) {
  const [filterRarity, setFilterRarity] = useState<'ALL' | SkinRarity>('ALL');

  if (!isOpen) return null;

  const allSkins = Object.values(SNAKE_SKINS);
  const filteredSkins = filterRarity === 'ALL'
    ? allSkins
    : allSkins.filter((s) => s.rarity === filterRarity);

  const activeSkinDef = SNAKE_SKINS[currentSkin] || SNAKE_SKINS.CLASSIC_GREEN;

  const handleEquip = (skinId: SnakeSkinId) => {
    onEquipSkin(skinId);
    try {
      localStorage.setItem('snake_equipped_skin', skinId);
    } catch {
      // safe
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-md flex items-center justify-center p-3 sm:p-5 overflow-y-auto animate-fade-in">
      <div className="bg-white dark:bg-neutral-900 rounded-3xl max-w-3xl w-full border border-neutral-200 dark:border-neutral-800 shadow-2xl overflow-hidden my-auto flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-5 border-b border-neutral-100 dark:border-neutral-800 flex items-center justify-between bg-gradient-to-r from-neutral-50 via-emerald-50/20 to-neutral-50 dark:from-neutral-900 dark:via-neutral-800/40 dark:to-neutral-900">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-amber-500/15 text-amber-500 border border-amber-500/30">
              <Sparkles size={24} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-black text-neutral-900 dark:text-white tracking-tight">
                  Snake Skins Vault
                </h2>
                <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-amber-500 text-neutral-950">
                  10 SKINS
                </span>
              </div>
              <p className="text-xs text-neutral-500 dark:text-neutral-400">
                Equip authentic Google Classic, Elemental, and the Legendary Dragon
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Currently Equipped Banner */}
        <div className="px-5 py-3 bg-neutral-100/70 dark:bg-neutral-800/40 border-b border-neutral-200 dark:border-neutral-800 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <span className="text-neutral-500">Currently Equipped:</span>
            <span className="font-bold text-neutral-900 dark:text-white flex items-center gap-1.5">
              <span>{activeSkinDef.icon}</span>
              <span>{activeSkinDef.name}</span>
            </span>
            <span
              className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full border ${
                RARITY_CONFIG[activeSkinDef.rarity].badgeBg
              } ${RARITY_CONFIG[activeSkinDef.rarity].textColor} ${
                RARITY_CONFIG[activeSkinDef.rarity].border
              }`}
            >
              {activeSkinDef.rarity}
            </span>
          </div>

          {/* Rarity Filter Tabs */}
          <div className="flex items-center gap-1 bg-white dark:bg-neutral-900 p-1 rounded-xl border border-neutral-200 dark:border-neutral-800">
            {(['ALL', 'Common', 'Rare', 'Epic', 'Legendary'] as const).map((r) => (
              <button
                key={r}
                onClick={() => setFilterRarity(r)}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all ${
                  filterRarity === r
                    ? 'bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 shadow-xs'
                    : 'text-neutral-500 hover:text-neutral-900 dark:hover:text-white'
                }`}
              >
                {r === 'ALL' ? 'All (10)' : r}
              </button>
            ))}
          </div>
        </div>

        {/* Skins Grid */}
        <div className="p-5 overflow-y-auto grid grid-cols-1 sm:grid-cols-2 gap-3.5 flex-1">
          {filteredSkins.map((skin) => {
            const isEquipped = currentSkin === skin.id;
            const rarityStyle = RARITY_CONFIG[skin.rarity];

            return (
              <div
                key={skin.id}
                className={`relative rounded-2xl p-4 border transition-all duration-200 flex flex-col justify-between ${
                  isEquipped
                    ? 'bg-emerald-500/5 dark:bg-emerald-500/10 border-emerald-500 shadow-md ring-2 ring-emerald-500/30'
                    : 'bg-neutral-50/60 dark:bg-neutral-800/30 border-neutral-200 dark:border-neutral-800 hover:border-neutral-300 dark:hover:border-neutral-700 hover:shadow-sm'
                }`}
              >
                {/* Special Legendary Badge or Glow */}
                {skin.rarity === 'Legendary' && (
                  <div className="absolute top-3 right-3 flex items-center gap-1 text-[10px] font-black tracking-wider uppercase text-amber-500 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/30">
                    <Star size={10} className="fill-amber-500" />
                    <span>Mythic</span>
                  </div>
                )}

                <div>
                  <div className="flex items-start gap-3 mb-2.5">
                    {/* Visual Preview Sphere */}
                    <div
                      style={{
                        background: skin.isRainbow
                          ? 'linear-gradient(135deg, #FF1744, #FFEA00, #00E676, #00B0FF, #D500F9)'
                          : skin.isDragon
                          ? 'radial-gradient(circle at 35% 35%, #FFD700 0%, #D50000 60%, #8B0000 100%)'
                          : `linear-gradient(135deg, ${skin.primaryColor}, ${skin.secondaryColor})`,
                        boxShadow: skin.glowColor ? `0 0 14px ${skin.glowColor}` : 'none',
                      }}
                      className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl shadow-inner shrink-0 relative overflow-hidden"
                    >
                      <span>{skin.icon}</span>
                      {skin.isDragon && (
                        <span className="absolute bottom-0 right-0 text-[10px] leading-none">
                          🔥
                        </span>
                      )}
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-black text-sm text-neutral-900 dark:text-white truncate">
                          {skin.name}
                        </h3>
                      </div>

                      <div className="flex items-center gap-1.5 mt-0.5">
                        <span
                          className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full border ${rarityStyle.badgeBg} ${rarityStyle.textColor} ${rarityStyle.border}`}
                        >
                          {skin.rarity}
                        </span>
                        {skin.isDragon && (
                          <span className="text-[10px] font-bold text-amber-600 dark:text-amber-400 bg-amber-500/15 px-1.5 py-0.5 rounded border border-amber-500/30">
                            Dragon Horns & Fire Trail
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <p className="text-xs text-neutral-500 dark:text-neutral-400 leading-relaxed mb-3">
                    {skin.description}
                  </p>
                </div>

                {/* Footer Action */}
                <div className="pt-2 border-t border-neutral-200/60 dark:border-neutral-800/80 flex items-center justify-between">
                  <div className="text-[10px] font-semibold text-neutral-400">
                    Trail: <span className="capitalize">{skin.trailType.replace('_', ' ').toLowerCase()}</span>
                  </div>

                  {isEquipped ? (
                    <div className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-emerald-500 text-white font-black text-xs shadow-sm">
                      <Check size={14} />
                      <span>EQUIPPED</span>
                    </div>
                  ) : (
                    <button
                      onClick={() => handleEquip(skin.id)}
                      className="px-4 py-1.5 rounded-xl bg-neutral-900 hover:bg-neutral-800 dark:bg-white dark:hover:bg-neutral-100 text-white dark:text-neutral-900 font-bold text-xs transition-transform active:scale-95 shadow-sm"
                    >
                      Equip Skin
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-neutral-100 dark:border-neutral-800 flex items-center justify-between bg-neutral-50/50 dark:bg-neutral-900/50">
          <div className="text-xs text-neutral-500">
            Selected skin is applied instantly in real-time and saved to your device.
          </div>
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md transition-all"
          >
            Ready to Play
          </button>
        </div>
      </div>
    </div>
  );
}
