import { Play, Pause, RotateCcw, Gamepad2, Volume2, VolumeX, Music, Settings as SettingsIcon } from 'lucide-react';
import { GameStatus, GameSpeed, GameSettings } from '../types/game';

interface ControlsProps {
  status: GameStatus;
  settings: GameSettings;
  onTogglePlayPause: () => void;
  onRestart: () => void;
  onToggleAutoPlay: () => void;
  onSpeedChange: (speed: GameSpeed) => void;
  onToggleSound: () => void;
  onToggleBgm: () => void;
  onOpenSettings: () => void;
}

export function Controls({
  status,
  settings,
  onTogglePlayPause,
  onRestart,
  onToggleAutoPlay,
  onSpeedChange,
  onToggleSound,
  onToggleBgm,
  onOpenSettings,
}: ControlsProps) {
  const isPlaying = status === 'PLAYING';

  return (
    <div className="w-full max-w-[720px] mx-auto mt-3 p-3.5 bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 shadow-md flex flex-wrap items-center justify-between gap-3">
      {/* Auto-Play Toggle Switch */}
      <div className="flex items-center gap-2">
        <button
          onClick={onToggleAutoPlay}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all shadow-sm ${
            settings.autoPlay
              ? 'bg-gradient-to-r from-emerald-500 to-green-600 text-white ring-2 ring-emerald-400/50 hover:brightness-105'
              : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300 hover:bg-neutral-200'
          }`}
        >
          <Gamepad2 size={18} />
          <span>{settings.autoPlay ? 'Auto-Play: ON' : 'Manual Play'}</span>
        </button>

        {/* Speed Buttons */}
        <div className="hidden sm:flex items-center bg-neutral-100 dark:bg-neutral-800 p-1 rounded-xl gap-0.5 text-xs font-semibold">
          {(['SLOW', 'NORMAL', 'FAST', 'HYPER'] as GameSpeed[]).map((spd) => (
            <button
              key={spd}
              onClick={() => onSpeedChange(spd)}
              className={`px-2.5 py-1 rounded-lg transition-colors ${
                settings.speed === spd
                  ? 'bg-white dark:bg-neutral-700 text-emerald-600 dark:text-emerald-400 font-bold shadow-xs'
                  : 'text-neutral-500 hover:text-neutral-900 dark:text-neutral-400'
              }`}
            >
              {spd.charAt(0) + spd.slice(1).toLowerCase()}
            </button>
          ))}
        </div>
      </div>

      {/* Primary Action Buttons */}
      <div className="flex items-center gap-1.5 sm:gap-2">
        {/* Play/Pause */}
        <button
          onClick={onTogglePlayPause}
          title={isPlaying ? 'Pause Game (Space)' : 'Play Game (Space)'}
          className="flex items-center gap-1 px-3 py-2 rounded-xl bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 text-neutral-800 dark:text-neutral-100 font-semibold text-xs sm:text-sm transition-colors"
        >
          {isPlaying ? <Pause size={16} /> : <Play size={16} />}
          <span>{isPlaying ? 'Pause' : 'Play'}</span>
        </button>

        {/* Restart */}
        <button
          onClick={onRestart}
          title="Restart Run (R)"
          className="flex items-center gap-1 px-3 py-2 rounded-xl bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 text-neutral-800 dark:text-neutral-100 font-semibold text-xs sm:text-sm transition-colors"
        >
          <RotateCcw size={16} />
          <span>Restart</span>
        </button>

        {/* Sound FX */}
        <button
          onClick={onToggleSound}
          title={settings.soundEnabled ? 'Mute Sound FX' : 'Enable Sound FX'}
          className={`p-2 rounded-xl border transition-colors ${
            settings.soundEnabled
              ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-700 text-emerald-600 dark:text-emerald-400'
              : 'bg-neutral-100 dark:bg-neutral-800 border-neutral-200 dark:border-neutral-700 text-neutral-400'
          }`}
        >
          {settings.soundEnabled ? <Volume2 size={16} /> : <VolumeX size={16} />}
        </button>

        {/* Retro BGM */}
        <button
          onClick={onToggleBgm}
          title={settings.bgmEnabled ? 'Disable Chiptune Music' : 'Enable Chiptune Music'}
          className={`p-2 rounded-xl border transition-colors ${
            settings.bgmEnabled
              ? 'bg-indigo-50 dark:bg-indigo-950/40 border-indigo-300 dark:border-indigo-700 text-indigo-600 dark:text-indigo-400'
              : 'bg-neutral-100 dark:bg-neutral-800 border-neutral-200 dark:border-neutral-700 text-neutral-400'
          }`}
        >
          <Music size={16} />
        </button>

        {/* Settings Modal */}
        <button
          onClick={onOpenSettings}
          title="Game & Voice Settings"
          className="p-2 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 text-neutral-600 dark:text-neutral-300 transition-colors"
        >
          <SettingsIcon size={16} />
        </button>
      </div>
    </div>
  );
}
