import { useState, useEffect, useRef } from 'react';
import { useSnakeGame } from './game/useSnakeGame';
import { GameBoard } from './components/GameBoard';
import { HeaderBar } from './components/HeaderBar';
import { Controls } from './components/Controls';
import { CommentatorBooth } from './components/CommentatorBooth';
import { MobileDpad } from './components/MobileDpad';
import { SettingsModal } from './components/SettingsModal';
import { StreamerSidePanel } from './components/StreamerMode';
import { SkinSelector } from './components/SkinSelector';
import { SkinsMenuModal } from './components/SkinsMenuModal';
import { speechEngine } from './audio/speechEngine';
import { soundManager } from './audio/soundEffects';

export default function App() {
  const {
    status,
    score,
    snake,
    direction,
    food,
    cols,
    rows,
    settings,
    setSettings,
    stats,
    restartCountdown,
    startNewRun,
    togglePlayPause,
    toggleAutoPlay,
    changeDirection,
    resetStats,
    setCustomHighScore,
  } = useSnakeGame();

  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isSkinsVaultOpen, setIsSkinsVaultOpen] = useState(false);
  const appContainerRef = useRef<HTMLDivElement | null>(null);

  // Prime audio & speech on first user interaction anywhere
  useEffect(() => {
    const handleFirstInteraction = () => {
      speechEngine.loadVoices();
    };
    window.addEventListener('click', handleFirstInteraction, { once: true });
    window.addEventListener('keydown', handleFirstInteraction, { once: true });
    return () => {
      window.removeEventListener('click', handleFirstInteraction);
      window.removeEventListener('keydown', handleFirstInteraction);
    };
  }, []);

  // Quick keyboard shortcuts for common actions
  useEffect(() => {
    const handleShortcuts = (e: KeyboardEvent) => {
      // Don't trigger if user is typing in an input
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLSelectElement) {
        return;
      }
      if (e.code === 'KeyA') {
        toggleAutoPlay();
      } else if (e.code === 'KeyM') {
        setSettings((prev) => ({ ...prev, voiceEnabled: !prev.voiceEnabled }));
      }
    };
    window.addEventListener('keydown', handleShortcuts);
    return () => window.removeEventListener('keydown', handleShortcuts);
  }, [toggleAutoPlay, setSettings]);

  // Fullscreen toggle handler
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      if (appContainerRef.current) {
        appContainerRef.current.requestFullscreen?.().catch(() => {});
      } else {
        document.documentElement.requestFullscreen?.().catch(() => {});
      }
    } else {
      document.exitFullscreen?.().catch(() => {});
    }
  };

  return (
    <div
      ref={appContainerRef}
      className="min-h-screen bg-neutral-100 dark:bg-neutral-950 text-neutral-900 dark:text-neutral-100 flex flex-col items-center justify-between p-3 sm:p-6 transition-colors font-sans selection:bg-emerald-500 selection:text-white"
    >
      {/* Top Brand / Title Banner */}
      <header className="w-full max-w-[720px] mb-2 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-emerald-600 flex items-center justify-center text-white text-base shadow">
            🐍
          </div>
          <div>
            <h1 className="font-black text-lg tracking-tight text-neutral-900 dark:text-white leading-none">
              Classic Snake
            </h1>
            <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">
              Live Gameplay & Commentator
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs">
          <button
            onClick={() => setIsSkinsVaultOpen(true)}
            className="flex items-center gap-1 px-3 py-1 rounded-full bg-gradient-to-r from-amber-500 via-orange-500 to-red-500 text-white font-black text-xs shadow-md hover:scale-105 active:scale-95 transition-all ring-1 ring-amber-400/50"
          >
            <span>🐉</span>
            <span>Skins Vault</span>
          </button>

          <span className="px-2.5 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 font-bold border border-emerald-300 dark:border-emerald-800/80">
            {settings.autoPlay ? 'Auto-Play Active' : 'Manual Controls'}
          </span>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="w-full max-w-[1080px] flex-1 flex flex-col items-center justify-center my-auto">
        {!settings.streamerLayout ? (
          /* STANDARD CLASSIC LAYOUT */
          <div className="w-full max-w-[720px] flex flex-col items-center">
            <HeaderBar
              score={score}
              stats={stats}
              streamerLayout={settings.streamerLayout}
              onToggleStreamer={() =>
                setSettings((prev) => ({
                  ...prev,
                  streamerLayout: !prev.streamerLayout,
                }))
              }
              onToggleFullscreen={toggleFullscreen}
            />

            <GameBoard
              snake={snake}
              food={food}
              direction={direction}
              cols={cols}
              rows={rows}
              status={status}
              restartCountdown={restartCountdown}
              onRestartClick={startNewRun}
              autoPlay={settings.autoPlay}
              score={score}
              skin={settings.skin}
            />

            <Controls
              status={status}
              settings={settings}
              onTogglePlayPause={togglePlayPause}
              onRestart={startNewRun}
              onToggleAutoPlay={toggleAutoPlay}
              onSpeedChange={(spd) => setSettings((prev) => ({ ...prev, speed: spd }))}
              onToggleSound={() =>
                setSettings((prev) => ({
                  ...prev,
                  soundEnabled: !prev.soundEnabled,
                }))
              }
              onToggleBgm={() =>
                setSettings((prev) => ({
                  ...prev,
                  bgmEnabled: !prev.bgmEnabled,
                }))
              }
              onOpenSettings={() => setIsSettingsOpen(true)}
            />

            {/* Custom Pro Snake Skins Selector */}
            <SkinSelector
              currentSkin={settings.skin}
              onSelectSkin={(s) => setSettings((prev) => ({ ...prev, skin: s }))}
              onOpenVault={() => setIsSkinsVaultOpen(true)}
            />

            {/* Mobile Touch D-Pad */}
            <MobileDpad onDirection={changeDirection} autoPlay={settings.autoPlay} />

            {/* Commentator Booth */}
            <CommentatorBooth
              voiceEnabled={settings.voiceEnabled}
              persona={settings.persona}
              onToggleVoice={() =>
                setSettings((prev) => ({
                  ...prev,
                  voiceEnabled: !prev.voiceEnabled,
                }))
              }
              onPersonaChange={(p) =>
                setSettings((prev) => ({ ...prev, persona: p }))
              }
              onOpenSettings={() => setIsSettingsOpen(true)}
            />
          </div>
        ) : (
          /* STREAMER / BROADCAST WIDE LAYOUT */
          <div className="w-full flex flex-col lg:flex-row items-center lg:items-start justify-center gap-6">
            <div className="flex-1 max-w-[720px] w-full flex flex-col items-center">
              <HeaderBar
                score={score}
                stats={stats}
                streamerLayout={settings.streamerLayout}
                onToggleStreamer={() =>
                  setSettings((prev) => ({
                    ...prev,
                    streamerLayout: !prev.streamerLayout,
                  }))
                }
                onToggleFullscreen={toggleFullscreen}
              />

              <GameBoard
                snake={snake}
                food={food}
                direction={direction}
                cols={cols}
                rows={rows}
                status={status}
                restartCountdown={restartCountdown}
                onRestartClick={startNewRun}
                autoPlay={settings.autoPlay}
                score={score}
                skin={settings.skin}
              />

              <Controls
                status={status}
                settings={settings}
                onTogglePlayPause={togglePlayPause}
                onRestart={startNewRun}
                onToggleAutoPlay={toggleAutoPlay}
                onSpeedChange={(spd) => setSettings((prev) => ({ ...prev, speed: spd }))}
                onToggleSound={() =>
                  setSettings((prev) => ({
                    ...prev,
                    soundEnabled: !prev.soundEnabled,
                  }))
                }
                onToggleBgm={() =>
                  setSettings((prev) => ({
                    ...prev,
                    bgmEnabled: !prev.bgmEnabled,
                  }))
                }
                onOpenSettings={() => setIsSettingsOpen(true)}
              />

              <SkinSelector
                currentSkin={settings.skin}
                onSelectSkin={(s) => setSettings((prev) => ({ ...prev, skin: s }))}
                onOpenVault={() => setIsSkinsVaultOpen(true)}
              />

              <MobileDpad onDirection={changeDirection} autoPlay={settings.autoPlay} />
            </div>

            {/* Streamer Broadcast Side Desk */}
            <StreamerSidePanel
              score={score}
              stats={stats}
              settings={settings}
              onToggleAutoPlay={toggleAutoPlay}
              onOpenSettings={() => setIsSettingsOpen(true)}
            />
          </div>
        )}
      </main>

      {/* Footer & Shortcut Info */}
      <footer className="w-full max-w-[720px] mt-4 pt-3 border-t border-neutral-200 dark:border-neutral-800 text-center text-xs text-neutral-500 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-3">
          <span className="font-semibold text-neutral-700 dark:text-neutral-300">
            Shortcuts:
          </span>
          <span><kbd className="px-1.5 py-0.5 rounded bg-neutral-200 dark:bg-neutral-800 text-[10px] font-mono">WASD / Arrows</kbd> Steer</span>
          <span><kbd className="px-1.5 py-0.5 rounded bg-neutral-200 dark:bg-neutral-800 text-[10px] font-mono">Space</kbd> Pause</span>
          <span><kbd className="px-1.5 py-0.5 rounded bg-neutral-200 dark:bg-neutral-800 text-[10px] font-mono">A</kbd> Auto-Play</span>
          <span><kbd className="px-1.5 py-0.5 rounded bg-neutral-200 dark:bg-neutral-800 text-[10px] font-mono">R</kbd> Restart</span>
        </div>

        <div className="text-[11px] text-neutral-400">
          Continuous Live Mode &bull; Offline Ready
        </div>
      </footer>

      {/* Settings Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        settings={settings}
        onUpdateSettings={setSettings}
        stats={stats}
        onResetStats={resetStats}
        onSetHighScore={setCustomHighScore}
      />

      {/* Full Skins Vault Modal */}
      <SkinsMenuModal
        isOpen={isSkinsVaultOpen}
        onClose={() => setIsSkinsVaultOpen(false)}
        currentSkin={settings.skin}
        onEquipSkin={(s) => setSettings((prev) => ({ ...prev, skin: s }))}
      />
    </div>
  );
}
