import { useState, useEffect } from 'react';
import { X, Volume2, Mic, Play, RefreshCw, Trash2, Check, Sparkles } from 'lucide-react';
import { GameSettings, GameStats, CommentatorPersona, SnakeSkinId } from '../types/game';
import { speechEngine, VoiceOption } from '../audio/speechEngine';
import { SNAKE_SKINS } from '../game/skins';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: GameSettings;
  onUpdateSettings: (updater: (prev: GameSettings) => GameSettings) => void;
  stats: GameStats;
  onResetStats: () => void;
  onSetHighScore?: (val: number) => void;
}

export function SettingsModal({
  isOpen,
  onClose,
  settings,
  onUpdateSettings,
  stats,
  onResetStats,
  onSetHighScore,
}: SettingsModalProps) {
  const [availableVoices, setAvailableVoices] = useState<VoiceOption[]>([]);
  const [confirmReset, setConfirmReset] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setAvailableVoices(speechEngine.getAvailableVoices());
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto animate-fade-in">
      <div className="bg-white dark:bg-neutral-900 rounded-3xl max-w-lg w-full border border-neutral-200 dark:border-neutral-800 shadow-2xl overflow-hidden my-8">
        {/* Header */}
        <div className="p-5 border-b border-neutral-100 dark:border-neutral-800 flex items-center justify-between bg-neutral-50/50 dark:bg-neutral-900/50">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
              <Mic size={20} />
            </div>
            <div>
              <h2 className="text-lg font-bold text-neutral-900 dark:text-white">
                Game & Commentator Settings
              </h2>
              <p className="text-xs text-neutral-500">
                Configure voice narration, AI auto-play, and audio
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl hover:bg-neutral-200 dark:hover:bg-neutral-800 text-neutral-500 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
          {/* SECTION 1: VOICE SELECTION */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-bold text-neutral-800 dark:text-neutral-200">
                Commentator Voice (Male English Preferred)
              </label>
              <button
                onClick={() => speechEngine.testVoice()}
                className="flex items-center gap-1 text-xs text-emerald-600 dark:text-emerald-400 font-semibold hover:underline"
              >
                <Play size={12} />
                Test Voice
              </button>
            </div>

            <select
              value={settings.selectedVoiceURI}
              onChange={(e) => {
                const uri = e.target.value;
                onUpdateSettings((prev) => ({ ...prev, selectedVoiceURI: uri }));
                speechEngine.setVoiceByURI(uri);
              }}
              className="w-full text-xs sm:text-sm p-2.5 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white focus:outline-emerald-500"
            >
              <option value="">-- Auto-Select Best English Male Voice --</option>
              {availableVoices.map((v) => (
                <option key={v.voice.voiceURI} value={v.voice.voiceURI}>
                  {v.name} ({v.lang}) {v.isLikelyMale ? '👨 [Male]' : ''}{' '}
                  {v.isEnglish ? '⭐' : ''}
                </option>
              ))}
            </select>

            <p className="text-[11px] text-neutral-500 dark:text-neutral-400 mt-1.5 leading-relaxed">
              Voices are provided directly by your browser's Web Speech API. If a male voice isn't
              installed, your device's default English voice is used as a smooth fallback.
            </p>
          </div>

          {/* SECTION 2: COMMENTATOR PERSONALITY */}
          <div>
            <label className="text-sm font-bold text-neutral-800 dark:text-neutral-200 mb-2 block">
              Commentary Persona Style
            </label>
            <div className="grid grid-cols-3 gap-2">
              {(
                [
                  { id: 'HYPE', label: 'Hype Host', icon: '🔥', desc: 'Energetic & wild' },
                  { id: 'FUNNY', label: 'Comedy', icon: '😂', desc: 'Witty roast banter' },
                  { id: 'ANALYST', label: 'Analyst', icon: '📊', desc: 'Esports tactical' },
                ] as { id: CommentatorPersona; label: string; icon: string; desc: string }[]
              ).map((p) => (
                <button
                  key={p.id}
                  onClick={() =>
                    onUpdateSettings((prev) => ({ ...prev, persona: p.id }))
                  }
                  className={`p-3 rounded-2xl border text-left transition-all ${
                    settings.persona === p.id
                      ? 'border-emerald-500 bg-emerald-500/10 text-emerald-900 dark:text-emerald-100 ring-2 ring-emerald-500/30'
                      : 'border-neutral-200 dark:border-neutral-800 hover:bg-neutral-50 dark:hover:bg-neutral-800/50'
                  }`}
                >
                  <div className="text-xl mb-1">{p.icon}</div>
                  <div className="text-xs font-bold">{p.label}</div>
                  <div className="text-[10px] text-neutral-500 dark:text-neutral-400">
                    {p.desc}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* SECTION: PRO SNAKE SKINS */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-bold text-neutral-800 dark:text-neutral-200">
                Custom Pro Snake Skins
              </label>
              <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                {SNAKE_SKINS[settings.skin]?.name}
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {Object.values(SNAKE_SKINS).map((s) => (
                <button
                  key={s.id}
                  onClick={() =>
                    onUpdateSettings((prev) => ({ ...prev, skin: s.id }))
                  }
                  className={`p-2.5 rounded-2xl border text-left flex items-center gap-2.5 transition-all ${
                    settings.skin === s.id
                      ? 'border-emerald-500 bg-emerald-500/10 ring-2 ring-emerald-500/30'
                      : 'border-neutral-200 dark:border-neutral-800 hover:bg-neutral-50 dark:hover:bg-neutral-800/50'
                  }`}
                >
                  <div
                    style={{
                      background: s.isRainbow
                        ? 'linear-gradient(135deg, #FF1744, #FFEA00, #00E676, #00B0FF, #D500F9)'
                        : `linear-gradient(135deg, ${s.primaryColor}, ${s.secondaryColor})`,
                    }}
                    className="w-6 h-6 rounded-full shrink-0 shadow-inner"
                  />
                  <div className="min-w-0 flex-1">
                    <div className="text-xs font-bold truncate text-neutral-800 dark:text-neutral-100">
                      {s.name}
                    </div>
                    <div className="text-[10px] text-neutral-400">{s.rarity}</div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* SECTION 3: VOICE TUNING SLIDERS */}
          <div className="space-y-3.5 bg-neutral-50 dark:bg-neutral-800/40 p-4 rounded-2xl">
            {/* Speed / Rate */}
            <div>
              <div className="flex justify-between text-xs font-semibold mb-1 text-neutral-700 dark:text-neutral-300">
                <span>Speech Speed (Rate)</span>
                <span>{settings.voiceRate.toFixed(2)}x</span>
              </div>
              <input
                type="range"
                min="0.8"
                max="1.5"
                step="0.05"
                value={settings.voiceRate}
                onChange={(e) =>
                  onUpdateSettings((prev) => ({
                    ...prev,
                    voiceRate: parseFloat(e.target.value),
                  }))
                }
                className="w-full accent-emerald-500"
              />
            </div>

            {/* Pitch */}
            <div>
              <div className="flex justify-between text-xs font-semibold mb-1 text-neutral-700 dark:text-neutral-300">
                <span>Pitch (Tone)</span>
                <span>{settings.voicePitch.toFixed(2)}</span>
              </div>
              <input
                type="range"
                min="0.7"
                max="1.3"
                step="0.05"
                value={settings.voicePitch}
                onChange={(e) =>
                  onUpdateSettings((prev) => ({
                    ...prev,
                    voicePitch: parseFloat(e.target.value),
                  }))
                }
                className="w-full accent-emerald-500"
              />
            </div>

            {/* Volume */}
            <div>
              <div className="flex justify-between text-xs font-semibold mb-1 text-neutral-700 dark:text-neutral-300">
                <span>Commentator Volume</span>
                <span>{Math.round(settings.voiceVolume * 100)}%</span>
              </div>
              <input
                type="range"
                min="0.1"
                max="1"
                step="0.05"
                value={settings.voiceVolume}
                onChange={(e) =>
                  onUpdateSettings((prev) => ({
                    ...prev,
                    voiceVolume: parseFloat(e.target.value),
                  }))
                }
                className="w-full accent-emerald-500"
              />
            </div>
          </div>

          {/* SECTION 4: 24/7 CONTINUOUS MODE & RESTART DELAY */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm font-bold text-neutral-800 dark:text-neutral-200">
                  Continuous 24/7 Mode
                </div>
                <div className="text-xs text-neutral-500">
                  Automatically restarts runs indefinitely on game over
                </div>
              </div>
              <input
                type="checkbox"
                checked={settings.continuousMode}
                onChange={(e) =>
                  onUpdateSettings((prev) => ({
                    ...prev,
                    continuousMode: e.target.checked,
                  }))
                }
                className="w-5 h-5 accent-emerald-500 cursor-pointer rounded"
              />
            </div>

            <div>
              <div className="flex justify-between text-xs font-semibold mb-1 text-neutral-700 dark:text-neutral-300">
                <span>Auto-Restart Delay</span>
                <span>{settings.autoRestartDelaySec.toFixed(1)}s</span>
              </div>
              <input
                type="range"
                min="1.0"
                max="5.0"
                step="0.5"
                value={settings.autoRestartDelaySec}
                onChange={(e) =>
                  onUpdateSettings((prev) => ({
                    ...prev,
                    autoRestartDelaySec: parseFloat(e.target.value),
                  }))
                }
                className="w-full accent-emerald-500"
              />
            </div>
          </div>

          {/* SECTION 5: LIFETIME SESSION STATS */}
          <div className="pt-2 border-t border-neutral-100 dark:border-neutral-800">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-neutral-500">
                Lifetime Statistics
              </span>
              {!confirmReset ? (
                <button
                  onClick={() => setConfirmReset(true)}
                  className="flex items-center gap-1 text-[11px] text-red-500 hover:underline"
                >
                  <Trash2 size={12} />
                  Reset Stats
                </button>
              ) : (
                <div className="flex items-center gap-2">
                  <span className="text-[11px] text-red-600 font-semibold">Are you sure?</span>
                  <button
                    onClick={() => {
                      onResetStats();
                      setConfirmReset(false);
                    }}
                    className="px-2 py-0.5 rounded bg-red-600 text-white text-[11px] font-bold"
                  >
                    Yes, Reset
                  </button>
                  <button
                    onClick={() => setConfirmReset(false)}
                    className="text-[11px] text-neutral-400"
                  >
                    Cancel
                  </button>
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center">
              <div className="p-2.5 rounded-xl bg-neutral-100 dark:bg-neutral-800">
                <div className="text-lg font-black text-emerald-600 dark:text-emerald-400">
                  {stats.highScore}
                </div>
                <div className="text-[10px] text-neutral-500 uppercase font-semibold">
                  All-Time Best
                </div>
              </div>
              <div className="p-2.5 rounded-xl bg-neutral-100 dark:bg-neutral-800">
                <div className="text-lg font-black text-neutral-800 dark:text-neutral-100">
                  {stats.totalRuns}
                </div>
                <div className="text-[10px] text-neutral-500 uppercase font-semibold">
                  Runs Played
                </div>
              </div>
              <div className="p-2.5 rounded-xl bg-neutral-100 dark:bg-neutral-800">
                <div className="text-lg font-black text-neutral-800 dark:text-neutral-100">
                  {stats.totalApples}
                </div>
                <div className="text-[10px] text-neutral-500 uppercase font-semibold">
                  Total Apples
                </div>
              </div>
              <div className="p-2.5 rounded-xl bg-neutral-100 dark:bg-neutral-800">
                <div className="text-lg font-black text-neutral-800 dark:text-neutral-100">
                  {Math.floor(stats.totalSecondsPlayed / 60)}m
                </div>
                <div className="text-[10px] text-neutral-500 uppercase font-semibold">
                  Playtime
                </div>
              </div>
            </div>

            {/* HIGH SCORE TARGET PRESETS (100 - 150 RANGE) */}
            {onSetHighScore && (
              <div className="mt-3 p-3 rounded-2xl bg-neutral-100 dark:bg-neutral-800/60 border border-neutral-200 dark:border-neutral-700">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-neutral-800 dark:text-neutral-200">
                    High Score Target (100 - 150):
                  </span>
                  <span className="text-xs font-black text-amber-500 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/30">
                    {stats.highScore} pts
                  </span>
                </div>
                <div className="flex items-center gap-1.5 flex-wrap">
                  {[100, 115, 125, 138, 142, 150].map((preset) => (
                    <button
                      key={preset}
                      onClick={() => onSetHighScore(preset)}
                      className={`px-3 py-1 rounded-xl text-xs font-extrabold transition-all ${
                        stats.highScore === preset
                          ? 'bg-amber-500 text-neutral-950 shadow-sm scale-105 ring-2 ring-amber-500/40'
                          : 'bg-white dark:bg-neutral-700 text-neutral-700 dark:text-neutral-200 hover:bg-neutral-200 dark:hover:bg-neutral-600'
                      }`}
                    >
                      {preset}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-neutral-100 dark:border-neutral-800 flex justify-end bg-neutral-50/50 dark:bg-neutral-900/50">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md transition-all"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
