import { useEffect, useState } from 'react';
import { Mic, Volume2, VolumeX, Sparkles } from 'lucide-react';
import { speechEngine } from '../audio/speechEngine';
import { commentaryManager, CommentaryLogEntry } from '../commentary/commentaryManager';
import { CommentatorPersona } from '../types/game';

interface CommentatorBoothProps {
  voiceEnabled: boolean;
  persona: CommentatorPersona;
  onToggleVoice: () => void;
  onPersonaChange: (p: CommentatorPersona) => void;
  onOpenSettings: () => void;
}

export function CommentatorBooth({
  voiceEnabled,
  persona,
  onToggleVoice,
  onPersonaChange,
  onOpenSettings,
}: CommentatorBoothProps) {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [currentText, setCurrentText] = useState('');
  const [logs, setLogs] = useState<CommentaryLogEntry[]>([]);
  const [showLogDrawer, setShowLogDrawer] = useState(false);
  const [needsGesture, setNeedsGesture] = useState(false);

  useEffect(() => {
    const unsubSpeech = speechEngine.subscribe((speaking, text) => {
      setIsSpeaking(speaking);
      if (text) {
        setCurrentText(text);
      }
      setNeedsGesture(speechEngine.getGestureRequired());
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

  const handleUnmuteGesture = () => {
    speechEngine.clearGestureRequired();
    setNeedsGesture(false);
    speechEngine.testVoice("Mic check 1, 2! I'm live in the broadcast booth!");
  };

  const getPersonaBadge = () => {
    switch (persona) {
      case 'HYPE':
        return { label: 'HYPE HOST', color: 'from-amber-500 to-red-500', icon: '🔥' };
      case 'FUNNY':
        return { label: 'COMEDY BANTER', color: 'from-yellow-400 to-amber-500', icon: '😂' };
      case 'ANALYST':
        return { label: 'ESPORTS ANALYST', color: 'from-blue-500 to-indigo-500', icon: '📊' };
    }
  };

  const badge = getPersonaBadge();

  return (
    <div className="w-full max-w-[720px] mx-auto mt-4 bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 shadow-xl overflow-hidden transition-all">
      {/* Browser Autoplay Gesture Alert Banner */}
      {needsGesture && (
        <div className="bg-amber-500 text-white px-4 py-2 text-xs font-semibold flex items-center justify-between">
          <span>🔊 Browser audio paused: Click to enable voice commentary!</span>
          <button
            onClick={handleUnmuteGesture}
            className="px-3 py-1 bg-white text-amber-800 rounded-md font-bold text-xs hover:bg-neutral-100"
          >
            Enable Voice Now
          </button>
        </div>
      )}

      {/* Main Broadcast Header */}
      <div className="p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-neutral-100 dark:border-neutral-800/80 bg-neutral-50/60 dark:bg-neutral-900/60">
        <div className="flex items-center gap-3">
          {/* Animated Host Avatar */}
          <div className="relative">
            <div
              className={`w-12 h-12 rounded-2xl flex items-center justify-center text-xl font-black bg-gradient-to-tr ${badge.color} text-white shadow-md transition-transform ${
                isSpeaking ? 'scale-105 ring-4 ring-emerald-500/30' : ''
              }`}
            >
              🎙️
            </div>

            {/* Speaking Pulse */}
            {isSpeaking && (
              <span className="absolute -top-1 -right-1 flex h-3.5 w-3.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-red-500"></span>
              </span>
            )}
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-neutral-900 dark:text-white text-base tracking-tight">
                Jack Vance
              </h3>
              <span className="text-[10px] uppercase font-extrabold px-2 py-0.5 rounded-full bg-neutral-200 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300">
                Play-By-Play Host
              </span>

              {/* ON AIR Badge */}
              <div
                className={`flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-black tracking-wider uppercase ${
                  isSpeaking
                    ? 'bg-red-500 text-white animate-pulse shadow-sm shadow-red-500/50'
                    : 'bg-neutral-200 dark:bg-neutral-800 text-neutral-400'
                }`}
              >
                <span
                  className={`w-1.5 h-1.5 rounded-full ${
                    isSpeaking ? 'bg-white' : 'bg-neutral-400'
                  }`}
                />
                {isSpeaking ? 'LIVE ON AIR' : 'STUDIO READY'}
              </div>
            </div>

            <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
              Live English Commentary & In-Game Playcalling
            </p>
          </div>
        </div>

        {/* Booth Controls */}
        <div className="flex items-center gap-2 self-end sm:self-auto">
          {/* Persona selector button */}
          <button
            onClick={() => {
              const next: Record<CommentatorPersona, CommentatorPersona> = {
                HYPE: 'FUNNY',
                FUNNY: 'ANALYST',
                ANALYST: 'HYPE',
              };
              onPersonaChange(next[persona]);
            }}
            title="Switch commentary personality style"
            className="flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1.5 rounded-lg bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-800 dark:hover:bg-neutral-700 text-neutral-700 dark:text-neutral-200 transition-colors"
          >
            <span>{badge.icon}</span>
            <span className="hidden sm:inline">{badge.label}</span>
          </button>

          {/* Mute Voice button */}
          <button
            onClick={onToggleVoice}
            title={voiceEnabled ? 'Mute Commentator Voice' : 'Unmute Commentator Voice'}
            className={`p-1.5 rounded-lg border transition-all ${
              voiceEnabled
                ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-700 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-100'
                : 'bg-neutral-100 dark:bg-neutral-800 border-neutral-300 dark:border-neutral-700 text-neutral-400 hover:text-neutral-600'
            }`}
          >
            {voiceEnabled ? <Volume2 size={16} /> : <VolumeX size={16} />}
          </button>

          {/* Test Speech Sample */}
          <button
            onClick={() => speechEngine.testVoice()}
            title="Test voice sample"
            className="p-1.5 rounded-lg border border-neutral-200 dark:border-neutral-700 hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-600 dark:text-neutral-300"
          >
            <Mic size={16} />
          </button>

          {/* Settings modal trigger */}
          <button
            onClick={onOpenSettings}
            title="Voice & commentary settings"
            className="p-1.5 rounded-lg border border-neutral-200 dark:border-neutral-700 hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-600 dark:text-neutral-300"
          >
            <Sparkles size={16} />
          </button>
        </div>
      </div>

      {/* Real-time Subtitle & Audio Waveform Section */}
      <div className="p-4 sm:p-5 bg-gradient-to-b from-white to-neutral-50/50 dark:from-neutral-900 dark:to-neutral-900/80">
        <div className="flex items-start gap-3">
          {/* Animated Waveform equalizer bars */}
          <div className="flex items-end gap-1 h-7 pt-1 shrink-0">
            {[14, 24, 18, 26, 12, 22].map((height, i) => (
              <span
                key={i}
                style={{
                  height: isSpeaking ? `${height}px` : '4px',
                  transition: 'height 0.15s ease',
                  animationDelay: `${i * 80}ms`,
                }}
                className={`w-1 rounded-full ${
                  isSpeaking
                    ? 'bg-emerald-500 animate-pulse'
                    : 'bg-neutral-300 dark:bg-neutral-700'
                }`}
              />
            ))}
          </div>

          {/* Live Subtitle Transcript */}
          <div className="flex-1 min-w-0">
            <div className="text-xs uppercase font-bold text-neutral-400 dark:text-neutral-500 tracking-wider mb-1 flex items-center justify-between">
              <span>Live Commentary Transcript</span>
              {logs.length > 0 && (
                <button
                  onClick={() => setShowLogDrawer(!showLogDrawer)}
                  className="text-[11px] text-emerald-600 dark:text-emerald-400 hover:underline capitalize"
                >
                  {showLogDrawer ? 'Hide History' : `History (${logs.length})`}
                </button>
              )}
            </div>

            <p className="text-sm sm:text-base font-medium text-neutral-800 dark:text-neutral-100 leading-relaxed italic">
              "{currentText || "Let's see what kind of moves this snake pulls off today!"}"
            </p>
          </div>
        </div>

        {/* Collapsible Commentary History Drawer */}
        {showLogDrawer && (
          <div className="mt-4 pt-3 border-t border-neutral-200 dark:border-neutral-800 max-h-48 overflow-y-auto space-y-2 pr-1 text-xs">
            {logs.map((log) => (
              <div
                key={log.id}
                className="flex items-start gap-2 text-neutral-600 dark:text-neutral-300 py-1 border-b border-neutral-100 dark:border-neutral-800/40"
              >
                <span className="text-[10px] font-mono text-neutral-400 shrink-0">
                  {new Date(log.timestamp).toLocaleTimeString([], {
                    minute: '2-digit',
                    second: '2-digit',
                  })}
                </span>
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-neutral-100 dark:bg-neutral-800 text-neutral-500 shrink-0 uppercase">
                  {log.event.replace('_', ' ')}
                </span>
                <span className="flex-1">{log.text}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
