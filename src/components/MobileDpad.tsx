import { ArrowUp, ArrowDown, ArrowLeft, ArrowRight } from 'lucide-react';
import { Direction } from '../types/game';

interface MobileDpadProps {
  onDirection: (dir: Direction) => void;
  autoPlay: boolean;
}

export function MobileDpad({ onDirection, autoPlay }: MobileDpadProps) {
  if (autoPlay) return null;

  return (
    <div className="flex md:hidden flex-col items-center justify-center my-4 select-none touch-manipulation">
      <div className="text-xs font-semibold text-neutral-400 mb-2">Touch D-Pad</div>
      <div className="grid grid-cols-3 gap-2 w-48 h-48">
        <div />
        <button
          onClick={() => onDirection('UP')}
          className="bg-neutral-800 active:bg-emerald-600 text-white rounded-2xl flex items-center justify-center shadow-lg active:scale-95 transition-all"
        >
          <ArrowUp size={28} />
        </button>
        <div />

        <button
          onClick={() => onDirection('LEFT')}
          className="bg-neutral-800 active:bg-emerald-600 text-white rounded-2xl flex items-center justify-center shadow-lg active:scale-95 transition-all"
        >
          <ArrowLeft size={28} />
        </button>
        <div className="rounded-2xl bg-neutral-900/40 flex items-center justify-center text-xs text-neutral-500 font-bold">
          PAD
        </div>
        <button
          onClick={() => onDirection('RIGHT')}
          className="bg-neutral-800 active:bg-emerald-600 text-white rounded-2xl flex items-center justify-center shadow-lg active:scale-95 transition-all"
        >
          <ArrowRight size={28} />
        </button>

        <div />
        <button
          onClick={() => onDirection('DOWN')}
          className="bg-neutral-800 active:bg-emerald-600 text-white rounded-2xl flex items-center justify-center shadow-lg active:scale-95 transition-all"
        >
          <ArrowDown size={28} />
        </button>
        <div />
      </div>
    </div>
  );
}
