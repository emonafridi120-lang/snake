import { useEffect, useState } from 'react';
import { Trophy, Gamepad2, Mic, Volume2, Sparkles, Activity } from 'lucide-react';
import { GameStats, GameSettings } from '../types/game';
import { speechEngine } from '../audio/speechEngine';
import { commentaryManager, CommentaryLogEntry } from '../commentary/commentaryManager';

interface StreamerSidePanelProps {
  score: number;
  stats: GameStats;
  settings: GameSettings;
  onToggleAutoPlay: () => void;
  onOpenSettings: () => void;
}

export function StreamerSidePanel({
  score,
  stats,
  settings,
  onToggleAutoPlay,
  onOpenSettings,
}: StreamerSidePanelProps) {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [currentText, setCurrentText] = useState('');
  const [logs, setLogs] = useState<CommentaryLogEntry[]>([]);

  useEffect(() => {
    const unsubSpeech = speechEngine.subscribe((speaking, text) => {
      setIsSpeaking(speaking);
      if (text) setCurrentText(text);
    });

    const unsubLogs = commentaryManager.subscribeLogs((newLogs) => {
      setLogs(newLogs);
      if (newLogs.length > 0 && !currentText) {
        setCurrentText(newLogs[0].text);
      }
    });

    return () => {
      unsubSpeech();
      unsubLogs();
    };
  }, [currentText]);

  return (
    <div className="w-full lg:w-80 flex flex-col gap-3">
      {/* GIANT SCORE CARD */}
      <div className="bg-gradient-to-br from-emerald-600 to-green-700 text-white rounded-2xl p-5 shadow-xl border border-emerald-500/40 relative overflow-hidden">
        <div className="absolute top-0 right-0 translate-x-4 -translate-y-4 opacity-10 text-9xl font-black select-none pointer-events-none">
          🍎
        </div>

        <div className="text-[11px] font-black uppercase tracking-widest text-emerald-200 mb-1 flex items-center justify-between">
          <span>CURRENT RUN</span>
          <span className="flex items-center gap-1 bg-black/25 px-2 py-0.5 rounded-full text-[10px]">
            <Activity size={12} className="text-emerald-300 animate-pulse" />
            LIVE FEED
          </span>
        </div>

        <div className="flex items-baseline gap-2">
          <span className="text-5xl font-black tracking-tight">{score}</span>
          <span className="text-emerald-200 text-sm font-semibold">apples</span>
        </div>

        <div className="mt-3 pt-3 border-t border-emerald-500/40 flex items-center justify-between text-xs font-semibold text-emerald-100">
          <div className="flex items-center gap-1.5">
            <Trophy size={14} className="text-amber-300" />
            <span>Best: {Math.max(score, stats.highScore)}</span>
          </div>
          <div>Run #{stats.totalRuns}</div>
        </div>
      </div>

      {/* COMMENTATOR DESK CARD */}
      <div className="bg-white dark:bg-neutral-900 rounded-2xl p-4 border border-neutral-200 dark:border-neutral-800 shadow-md">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-red-500/10 text-red-600 dark:text-red-400 flex items-center justify-center font-bold text-sm">
              🎙️
            </div>
            <div>
              <div className="text-xs font-bold text-neutral-900 dark:text-white">Jack Vance</div>
              <div className="text-[10px] text-neutral-400">Play-by-play Caster</div>
            </div>
          </div>

          <div
            className={`px-2 py-0.5 rounded text-[9px] font-black tracking-wider uppercase ${
              isSpeaking
                ? 'bg-red-500 text-white animate-pulse'
                : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-400'
            }`}
          >
            {isSpeaking ? 'ON AIR' : 'IDLE'}
          </div>
        </div>

        {/* Live speech quote bubble */}
        <div className="p-3 rounded-xl bg-neutral-50 dark:bg-neutral-800/60 border border-neutral-100 dark:border-neutral-700/60 text-xs italic text-neutral-700 dark:text-neutral-200 leading-relaxed min-h-[4rem] flex items-center">
          "{currentText || 'Welcome viewers! The snake is on the hunt!'}"
        </div>

        {/* Quick controls */}
        <div className="mt-3 flex items-center gap-2 pt-2 border-t border-neutral-100 dark:border-neutral-800">
          <button
            onClick={onToggleAutoPlay}
            className={`flex-1 text-[11px] font-bold py-1.5 rounded-lg transition-colors flex items-center justify-center gap-1.5 ${
              settings.autoPlay
                ? 'bg-emerald-500 text-white'
                : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300'
            }`}
          >
            <Gamepad2 size={14} />
            {settings.autoPlay ? 'Auto Play' : 'Manual'}
          </button>
          <button
            onClick={onOpenSettings}
            className="p-1.5 rounded-lg border border-neutral-200 dark:border-neutral-700 hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-600 dark:text-neutral-300"
          >
            <Sparkles size={14} />
          </button>
        </div>
      </div>

      {/* LIVE EVENT LOG FEED */}
      <div className="bg-white dark:bg-neutral-900 rounded-2xl p-4 border border-neutral-200 dark:border-neutral-800 shadow-md flex-1 max-h-56 overflow-hidden flex flex-col">
        <div className="text-[11px] font-bold uppercase tracking-wider text-neutral-400 mb-2">
          Broadcast Activity Log
        </div>
        <div className="overflow-y-auto space-y-1.5 flex-1 pr-1 text-xs">
          {logs.slice(0, 15).map((log) => (
            <div
              key={log.id}
              className="p-1.5 rounded-lg bg-neutral-50 dark:bg-neutral-800/40 border border-neutral-100 dark:border-neutral-800 text-neutral-600 dark:text-neutral-300 flex items-start gap-1.5"
            >
              <span className="text-[9px] font-bold px-1 py-0.5 rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 uppercase shrink-0">
                {log.event.replace('_', ' ')}
              </span>
              <span className="text-[11px] line-clamp-2">{log.text}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
