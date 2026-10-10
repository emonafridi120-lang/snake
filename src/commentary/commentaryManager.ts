import { CommentaryEvent, CommentaryContext, GameSettings } from '../types/game';
import { COMMENTARY_DATABASE, CommentaryLine } from './commentaryLines';
import { speechEngine } from '../audio/speechEngine';

export interface CommentaryLogEntry {
  id: string;
  timestamp: number;
  text: string;
  event: CommentaryEvent;
}

class CommentaryManager {
  private historyQueue: string[] = []; // stores recent line IDs
  private maxHistorySize: number = 18;
  private lastEventTimes: Map<CommentaryEvent, number> = new Map();
  private commentaryLog: CommentaryLogEntry[] = [];
  private logListeners: Set<(logs: CommentaryLogEntry[]) => void> = new Set();
  private lastAnySpeechTime: number = 0;

  // Minimum cooldowns in milliseconds between same-event commentary
  private cooldowns: Record<CommentaryEvent, number> = {
    RUN_START: 2000,
    FOOD_EAT: 4500,
    COMBO_STREAK: 5000,
    GROWTH_MILESTONE: 8000,
    NEAR_MISS: 9000,
    DANGER_ZONE: 12000,
    SCORE_MILESTONE: 4000,
    NEW_HIGH_SCORE: 3000,
    TIME_SURVIVAL: 15000,
    GAME_OVER_WALL: 2000,
    GAME_OVER_SELF: 2000,
    AUTO_RESTART: 2000,
    IDLE_THOUGHT: 18000,
    AUTOPLAY_TOGGLE: 3000,
    MANUAL_TAKE_OVER: 3000,
  };

  public subscribeLogs(cb: (logs: CommentaryLogEntry[]) => void): () => void {
    this.logListeners.add(cb);
    cb(this.commentaryLog);
    return () => this.logListeners.delete(cb);
  }

  private notifyLogs() {
    this.logListeners.forEach((cb) => cb(this.commentaryLog));
  }

  public getLogs(): CommentaryLogEntry[] {
    return this.commentaryLog;
  }

  public clearLogs() {
    this.commentaryLog = [];
    this.notifyLogs();
  }

  /**
   * Check if an event is on cooldown
   */
  public isCoolingDown(event: CommentaryEvent): boolean {
    const lastTime = this.lastEventTimes.get(event) || 0;
    const cooldown = this.cooldowns[event] || 4000;
    return Date.now() - lastTime < cooldown;
  }

  /**
   * Replace templates with actual context values
   */
  private interpolate(text: string, ctx: CommentaryContext): string {
    return text
      .replace(/{score}/g, String(ctx.score))
      .replace(/{highScore}/g, String(ctx.highScore))
      .replace(/{runCount}/g, String(ctx.runCount))
      .replace(/{length}/g, String(ctx.length))
      .replace(/{time}/g, String(ctx.survivedSeconds))
      .replace(/{streak}/g, String(ctx.comboCount));
  }

  /**
   * Main entry point to react to game events
   */
  public triggerEvent(
    event: CommentaryEvent,
    ctx: CommentaryContext,
    settings: GameSettings,
    overrideForce: boolean = false
  ): boolean {
    if (!settings.voiceEnabled) {
      return false;
    }

    const now = Date.now();

    // Respect cooldowns unless force override is requested
    if (!overrideForce && this.isCoolingDown(event)) {
      return false;
    }

    // High priority events that should interrupt lower priority talk
    const isHighPriority =
      event === 'GAME_OVER_WALL' ||
      event === 'GAME_OVER_SELF' ||
      event === 'NEW_HIGH_SCORE' ||
      event === 'RUN_START' ||
      event === 'AUTO_RESTART';

    // Don't chatter too quickly overall (minimum 2.5s calm gap) unless high priority
    if (!isHighPriority && now - this.lastAnySpeechTime < 2500) {
      return false;
    }

    // Candidate selection based on persona
    let candidates = COMMENTARY_DATABASE.filter((line) => {
      if (line.event !== event) return false;
      if (line.persona && line.persona !== settings.persona) return false;
      return true;
    });

    // If persona specific not found, grab any matching event line
    if (candidates.length === 0) {
      candidates = COMMENTARY_DATABASE.filter((line) => line.event === event);
    }

    if (candidates.length === 0) {
      return false;
    }

    // Filter out recently used lines to prevent repetition
    const freshCandidates = candidates.filter((c) => !this.historyQueue.includes(c.id));
    const pool = freshCandidates.length > 0 ? freshCandidates : candidates;

    const chosen: CommentaryLine = pool[Math.floor(Math.random() * pool.length)];

    // Record in history queue
    this.historyQueue.push(chosen.id);
    if (this.historyQueue.length > this.maxHistorySize) {
      this.historyQueue.shift();
    }

    this.lastEventTimes.set(event, now);
    this.lastAnySpeechTime = now;

    const processedText = this.interpolate(chosen.text, ctx);

    // Append to live commentary log for UI ticker / feed
    const entry: CommentaryLogEntry = {
      id: `${now}-${Math.random().toString(36).substring(2, 7)}`,
      timestamp: now,
      text: processedText,
      event,
    };
    this.commentaryLog = [entry, ...this.commentaryLog].slice(0, 50);
    this.notifyLogs();

    // Speak through synthesis
    speechEngine.speak(processedText, {
      rate: settings.voiceRate,
      pitch: settings.voicePitch,
      volume: settings.voiceVolume,
      force: isHighPriority,
      priority: isHighPriority ? 'HIGH' : 'NORMAL',
    });

    return true;
  }

  public resetSession() {
    this.historyQueue = [];
    this.lastEventTimes.clear();
    this.lastAnySpeechTime = 0;
    speechEngine.cancel();
  }
}

export const commentaryManager = new CommentaryManager();
