import { SNAKE_SKINS, SnakeSkinDef, RARITY_CONFIG } from '../game/skins';
import { SnakeSkinId } from '../types/game';
import { Sparkles, Check, ChevronRight } from 'lucide-react';

interface SkinSelectorProps {
  currentSkin: SnakeSkinId;
  onSelectSkin: (skinId: SnakeSkinId) => void;
  onOpenVault: () => void;
}

export function SkinSelector({ currentSkin, onSelectSkin, onOpenVault }: SkinSelectorProps) {
  const skins = Object.values(SNAKE_SKINS);

  return (
    <div className="w-full max-w-[720px] mx-auto mt-3 bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 p-3.5 shadow-md">
      <div className="flex items-center justify-between mb-2.5">
        <div className="flex items-center gap-1.5 text-xs font-bold text-neutral-800 dark:text-neutral-200 uppercase tracking-wider">
          <Sparkles size={14} className="text-amber-500" />
          <span>Equipped Skin:</span>
          <span className="text-emerald-600 dark:text-emerald-400 capitalize">
            {SNAKE_SKINS[currentSkin]?.name}
          </span>
        </div>

        <button
          onClick={onOpenVault}
          className="flex items-center gap-1 text-[11px] font-bold text-amber-600 dark:text-amber-400 hover:underline bg-amber-500/10 px-2 py-0.5 rounded-lg border border-amber-500/25 transition-colors"
        >
          <span>Skins Vault (10)</span>
          <ChevronRight size={12} />
        </button>
      </div>

      <div className="grid grid-cols-5 sm:grid-cols-10 gap-1.5 sm:gap-2">
        {skins.map((s: SnakeSkinDef) => {
          const isActive = currentSkin === s.id;
          const rarityStyle = RARITY_CONFIG[s.rarity];

          return (
            <button
              key={s.id}
              onClick={() => onSelectSkin(s.id)}
              title={`${s.name} (${s.rarity})`}
              className={`relative group flex flex-col items-center justify-center p-1.5 sm:p-2 rounded-xl border transition-all duration-150 ${
                isActive
                  ? 'border-emerald-500 bg-emerald-500/15 shadow-sm scale-105 ring-2 ring-emerald-500/40 z-10'
                  : 'border-neutral-200 dark:border-neutral-800 bg-neutral-50/70 dark:bg-neutral-800/40 hover:bg-neutral-100 dark:hover:bg-neutral-800'
              }`}
            >
              {/* Mini Color Preview Ball */}
              <div
                style={{
                  background: s.isRainbow
                    ? 'linear-gradient(135deg, #FF1744, #FFEA00, #00E676, #00B0FF, #D500F9)'
                    : s.isDragon
                    ? 'radial-gradient(circle at 30% 30%, #FFD700 0%, #D50000 70%, #8B0000 100%)'
                    : `linear-gradient(135deg, ${s.primaryColor}, ${s.secondaryColor})`,
                  boxShadow: s.glowColor ? `0 0 10px ${s.glowColor}` : 'none',
                }}
                className="w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-xs shadow-inner transition-transform group-hover:scale-110 relative"
              >
                <span>{s.icon}</span>
                {isActive && (
                  <div className="absolute inset-0 bg-black/30 rounded-full flex items-center justify-center">
                    <Check size={14} className="text-white drop-shadow" />
                  </div>
                )}
              </div>

              <span className="text-[9px] font-bold text-neutral-700 dark:text-neutral-300 mt-1 truncate max-w-full">
                {s.name.split(' ')[0]}
              </span>

              {/* Rarity dot indicator */}
              <span
                className={`w-1.5 h-1.5 rounded-full mt-0.5 ${
                  s.rarity === 'Legendary'
                    ? 'bg-amber-500 animate-pulse'
                    : s.rarity === 'Epic'
                    ? 'bg-purple-500'
                    : s.rarity === 'Rare'
                    ? 'bg-blue-500'
                    : 'bg-neutral-400'
                }`}
              />
            </button>
          );
        })}
      </div>
    </div>
  );
}
