import { Trophy, Maximize2, LayoutTemplate } from 'lucide-react';
import { GameStats } from '../types/game';

interface HeaderBarProps {
  score: number;
  stats: GameStats;
  streamerLayout: boolean;
  onToggleStreamer: () => void;
  onToggleFullscreen: () => void;
}

export function HeaderBar({
  score,
  stats,
  streamerLayout,
  onToggleStreamer,
  onToggleFullscreen,
}: HeaderBarProps) {
  return (
    <div className="w-full max-w-[720px] mx-auto mb-3 flex items-center justify-between px-4 py-3 bg-emerald-700 dark:bg-emerald-800 text-white rounded-2xl shadow-lg">
      {/* Current Score & Apple */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 bg-emerald-800/60 dark:bg-emerald-900/60 px-3.5 py-1.5 rounded-xl border border-emerald-600/40 shadow-inner">
          <span className="text-xl leading-none">🍎</span>
          <span className="text-2xl font-black tracking-tight">{score}</span>
        </div>

        {/* High Score */}
        <div className="flex items-center gap-2 bg-emerald-800/40 dark:bg-emerald-900/40 px-3 py-1.5 rounded-xl text-emerald-100">
          <Trophy size={18} className="text-amber-300" />
          <div className="flex flex-col">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-emerald-200/80 leading-none">
              Best
            </span>
            <span className="text-sm font-bold leading-tight">
              {Math.max(score, stats.highScore)}
            </span>
          </div>
        </div>
      </div>

      {/* Meta Stats: Run Count & View Modes */}
      <div className="flex items-center gap-2">
        <div className="hidden sm:flex items-center gap-1.5 bg-emerald-800/40 px-2.5 py-1.5 rounded-xl text-xs font-semibold text-emerald-100">
          <span>Run #{stats.totalRuns}</span>
        </div>

        {/* Streamer Layout Switch */}
        <button
          onClick={onToggleStreamer}
          title={streamerLayout ? 'Standard View' : 'Streamer Broadcast View'}
          className={`p-2 rounded-xl transition-all ${
            streamerLayout
              ? 'bg-amber-400 text-neutral-900 font-bold shadow-md'
              : 'hover:bg-emerald-600/60 text-emerald-100'
          }`}
        >
          <LayoutTemplate size={18} />
        </button>

        {/* Fullscreen Button */}
        <button
          onClick={onToggleFullscreen}
          title="Toggle Fullscreen"
          className="p-2 rounded-xl hover:bg-emerald-600/60 text-emerald-100 transition-colors"
        >
          <Maximize2 size={18} />
        </button>
      </div>
    </div>
  );
}
