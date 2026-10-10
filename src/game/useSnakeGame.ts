import { useState, useEffect, useRef, useCallback } from 'react';
import confetti from 'canvas-confetti';
import {
  Point,
  Direction,
  GameStatus,
  GameSettings,
  GameStats,
  CommentaryContext,
} from '../types/game';
import {
  getSmartNextMove,
  isNearMiss,
  OPPOSITE_DIRECTIONS,
} from './pathfinding';
import { soundManager } from '../audio/soundEffects';
import { commentaryManager } from '../commentary/commentaryManager';
import { speechEngine } from '../audio/speechEngine';

const DEFAULT_COLS = 17;
const DEFAULT_ROWS = 15;

const SPEED_MS: Record<string, number> = {
  SLOW: 180,
  NORMAL: 125, // Authentic Google Snake Normal speed (~8 tiles/second)
  FAST: 85,
  HYPER: 50,
};

const STATS_KEY = 'google_snake_stats_v1';
const SETTINGS_KEY = 'google_snake_settings_v1';

export function useSnakeGame() {
  // Settings with defaults
  const [settings, setSettings] = useState<GameSettings>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem(SETTINGS_KEY);
        if (saved) {
          const parsed = JSON.parse(saved);
          return {
            autoPlay: true,
            speed: 'NORMAL',
            soundEnabled: true,
            bgmEnabled: false,
            voiceEnabled: true,
            voiceVolume: 1.0,
            voiceRate: 1.08,
            voicePitch: 1.0,
            selectedVoiceURI: '',
            persona: 'HYPE',
            autoRestartDelaySec: 2.5,
            continuousMode: true,
            streamerLayout: false,
            skin: (localStorage.getItem('snake_equipped_skin') as any) || parsed.skin || 'CLASSIC_GREEN',
            ...parsed,
          };
        }
      } catch {
        // fallback
      }
    }
    const localSkin = typeof window !== 'undefined' ? (localStorage.getItem('snake_equipped_skin') as any) : null;
    return {
      autoPlay: true,
      speed: 'NORMAL',
      soundEnabled: true,
      bgmEnabled: false,
      voiceEnabled: true,
      voiceVolume: 1.0,
      voiceRate: 1.08,
      voicePitch: 1.0,
      selectedVoiceURI: '',
      persona: 'HYPE',
      autoRestartDelaySec: 2.5,
      continuousMode: true,
      streamerLayout: false,
      gridSize: { cols: DEFAULT_COLS, rows: DEFAULT_ROWS },
      skin: localSkin || 'CLASSIC_GREEN',
    };
  });

  // Persistent Stats (Target benchmark in 100-150 range: 142)
  const [stats, setStats] = useState<GameStats>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem(STATS_KEY);
        if (saved) {
          const parsed = JSON.parse(saved);
          return {
            ...parsed,
            highScore: parsed.highScore && parsed.highScore >= 100 ? parsed.highScore : 142,
          };
        }
      } catch {
        // fallback
      }
    }
    return {
      highScore: 142, // Target high score in 100-150 range
      totalRuns: 3,
      totalApples: 285,
      totalSecondsPlayed: 450,
      longestLength: 145,
      currentStreak: 0,
    };
  });

  // Save settings on update
  useEffect(() => {
    try {
      localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
      if (settings.skin) {
        localStorage.setItem('snake_equipped_skin', settings.skin);
      }
    } catch {
      // storage unavailable
    }
    soundManager.setMuted(!settings.soundEnabled);
    soundManager.setBgmMuted(!settings.bgmEnabled);
    speechEngine.setMuted(!settings.voiceEnabled);
    if (settings.selectedVoiceURI) {
      speechEngine.setVoiceByURI(settings.selectedVoiceURI);
    }
  }, [settings]);

  // Save stats on update
  useEffect(() => {
    try {
      localStorage.setItem(STATS_KEY, JSON.stringify(stats));
    } catch {
      // safe
    }
  }, [stats]);

  // Game board & state
  const cols = settings.gridSize.cols;
  const rows = settings.gridSize.rows;

  const [status, setStatus] = useState<GameStatus>('IDLE');
  const [score, setScore] = useState(0);
  const [snake, setSnake] = useState<Point[]>([
    { x: 5, y: 7 },
    { x: 4, y: 7 },
    { x: 3, y: 7 },
  ]);
  const [direction, setDirection] = useState<Direction>('RIGHT');
  const [food, setFood] = useState<Point>({ x: 12, y: 7 });
  const [restartCountdown, setRestartCountdown] = useState<number | null>(null);

  // References for reliable loop execution without stale closures
  const stateRef = useRef({
    status: 'IDLE' as GameStatus,
    snake: [
      { x: 5, y: 7 },
      { x: 4, y: 7 },
      { x: 3, y: 7 },
    ],
    direction: 'RIGHT' as Direction,
    nextDirection: 'RIGHT' as Direction,
    food: { x: 12, y: 7 },
    score: 0,
    settings,
    stats,
    lastEatTime: 0,
    comboCount: 0,
    runStartTime: 0,
    lastIdleCommentaryTime: 0,
    milestonesAnnounced: new Set<number>(),
    newHighAnnounced: false,
  });

  // Sync stateRef
  stateRef.current.status = status;
  stateRef.current.snake = snake;
  stateRef.current.direction = direction;
  stateRef.current.food = food;
  stateRef.current.score = score;
  stateRef.current.settings = settings;
  stateRef.current.stats = stats;

  /**
   * Helper to spawn food at random unoccupied position
   */
  const spawnFood = useCallback((currentSnake: Point[]): Point => {
    const occupied = new Set(currentSnake.map((p) => `${p.x},${p.y}`));
    const emptyCells: Point[] = [];

    for (let x = 0; x < cols; x++) {
      for (let y = 0; y < rows; y++) {
        if (!occupied.has(`${x},${y}`)) {
          emptyCells.push({ x, y });
        }
      }
    }

    if (emptyCells.length === 0) {
      return { x: 0, y: 0 }; // Board full, rare win
    }

    const randomIndex = Math.floor(Math.random() * emptyCells.length);
    return emptyCells[randomIndex];
  }, [cols, rows]);

  /**
   * Builds context for commentary
   */
  const buildCommentaryContext = useCallback((): CommentaryContext => {
    const currentScore = stateRef.current.score;
    const currentHigh = stateRef.current.stats.highScore;
    const elapsed = stateRef.current.runStartTime > 0
      ? Math.floor((Date.now() - stateRef.current.runStartTime) / 1000)
      : 0;

    const occupancy = stateRef.current.snake.length / (cols * rows);
    const dangerLevel = occupancy > 0.6 ? 'HIGH' : occupancy > 0.35 ? 'MEDIUM' : 'LOW';

    return {
      score: currentScore,
      highScore: currentHigh,
      isNewHigh: currentScore > currentHigh && currentHigh > 0,
      length: stateRef.current.snake.length,
      comboCount: stateRef.current.comboCount,
      survivedSeconds: elapsed,
      runCount: stateRef.current.stats.totalRuns,
      autoPlay: stateRef.current.settings.autoPlay,
      dangerLevel,
    };
  }, [cols, rows]);

  /**
   * Start a new run
   */
  const startNewRun = useCallback(() => {
    const initialSnake: Point[] = [
      { x: 5, y: Math.floor(rows / 2) },
      { x: 4, y: Math.floor(rows / 2) },
      { x: 3, y: Math.floor(rows / 2) },
    ];
    const initialFood = spawnFood(initialSnake);

    setSnake(initialSnake);
    setDirection('RIGHT');
    setFood(initialFood);
    setScore(0);
    setRestartCountdown(null);
    setStatus('PLAYING');

    stateRef.current.snake = initialSnake;
    stateRef.current.direction = 'RIGHT';
    stateRef.current.nextDirection = 'RIGHT';
    stateRef.current.food = initialFood;
    stateRef.current.score = 0;
    stateRef.current.status = 'PLAYING';
    stateRef.current.runStartTime = Date.now();
    stateRef.current.lastEatTime = 0;
    stateRef.current.comboCount = 0;
    stateRef.current.lastIdleCommentaryTime = Date.now();
    stateRef.current.milestonesAnnounced.clear();
    stateRef.current.newHighAnnounced = false;

    setStats((prev) => ({
      ...prev,
      totalRuns: prev.totalRuns + 1,
    }));

    // Trigger Run Start commentary
    setTimeout(() => {
      commentaryManager.triggerEvent(
        'RUN_START',
        buildCommentaryContext(),
        stateRef.current.settings,
        true
      );
    }, 250);
  }, [rows, spawnFood, buildCommentaryContext]);

  /**
   * Handle Game Over (Wall or Self)
   */
  const handleGameOver = useCallback((reason: 'WALL' | 'SELF') => {
    setStatus('GAME_OVER');
    stateRef.current.status = 'GAME_OVER';

    soundManager.playGameOver();

    const ctx = buildCommentaryContext();
    const event = reason === 'WALL' ? 'GAME_OVER_WALL' : 'GAME_OVER_SELF';
    commentaryManager.triggerEvent(event, ctx, stateRef.current.settings, true);

    // Update stats
    setStats((prev) => {
      const isNewBest = stateRef.current.score > prev.highScore;
      const elapsed = stateRef.current.runStartTime > 0
        ? Math.floor((Date.now() - stateRef.current.runStartTime) / 1000)
        : 0;
      return {
        ...prev,
        highScore: isNewBest ? stateRef.current.score : prev.highScore,
        totalSecondsPlayed: prev.totalSecondsPlayed + elapsed,
        longestLength: Math.max(prev.longestLength, stateRef.current.snake.length),
      };
    });

    // Auto Restart logic for 24/7 continuous / autoplay
    if (stateRef.current.settings.continuousMode || stateRef.current.settings.autoPlay) {
      let countdown = Math.ceil(stateRef.current.settings.autoRestartDelaySec);
      setRestartCountdown(countdown);

      // Announce restart countdown cheer
      setTimeout(() => {
        if (stateRef.current.status === 'GAME_OVER') {
          commentaryManager.triggerEvent(
            'AUTO_RESTART',
            buildCommentaryContext(),
            stateRef.current.settings
          );
        }
      }, 1200);

      const countdownInterval = setInterval(() => {
        countdown -= 1;
        if (countdown <= 0) {
          clearInterval(countdownInterval);
          startNewRun();
        } else {
          setRestartCountdown(countdown);
        }
      }, 1000);
    }
  }, [buildCommentaryContext, startNewRun]);

  /**
   * Process one game tick
   */
  const step = useCallback(() => {
    if (stateRef.current.status !== 'PLAYING') return;

    const currentSnake = [...stateRef.current.snake];
    const currentHead = currentSnake[0];
    let nextDir = stateRef.current.direction;

    // AI Auto-Play Decision
    if (stateRef.current.settings.autoPlay) {
      const smartDir = getSmartNextMove(
        currentSnake,
        stateRef.current.food,
        stateRef.current.direction,
        cols,
        rows
      );
      nextDir = smartDir;
      stateRef.current.nextDirection = smartDir;
    } else {
      nextDir = stateRef.current.nextDirection;
    }

    // Near miss detection
    if (
      isNearMiss(
        currentHead,
        stateRef.current.direction,
        nextDir,
        currentSnake,
        cols,
        rows
      )
    ) {
      soundManager.playNearMiss();
      commentaryManager.triggerEvent(
        'NEAR_MISS',
        buildCommentaryContext(),
        stateRef.current.settings
      );
    }

    // Sound effect on turn (gives feeling of human key tap)
    if (nextDir !== stateRef.current.direction) {
      soundManager.playTurn();
    }

    stateRef.current.direction = nextDir;
    setDirection(nextDir);

    // Calculate new head position
    const dx = nextDir === 'RIGHT' ? 1 : nextDir === 'LEFT' ? -1 : 0;
    const dy = nextDir === 'DOWN' ? 1 : nextDir === 'UP' ? -1 : 0;
    const newHead: Point = { x: currentHead.x + dx, y: currentHead.y + dy };

    // 1. Check Wall Collision
    if (newHead.x < 0 || newHead.x >= cols || newHead.y < 0 || newHead.y >= rows) {
      handleGameOver('WALL');
      return;
    }

    // 2. Check Self Collision
    // If snake will eat food, tail doesn't move forward this step.
    const willEat = newHead.x === stateRef.current.food.x && newHead.y === stateRef.current.food.y;
    const bodyToCheck = willEat ? currentSnake : currentSnake.slice(0, -1);

    if (bodyToCheck.some((seg) => seg.x === newHead.x && seg.y === newHead.y)) {
      handleGameOver('SELF');
      return;
    }

    // Move snake
    const newSnake = [newHead, ...currentSnake];

    if (willEat) {
      // EAT FOOD
      soundManager.playEat();
      const newScore = stateRef.current.score + 1;
      setScore(newScore);
      stateRef.current.score = newScore;

      // Spawn next food
      const nextFood = spawnFood(newSnake);
      setFood(nextFood);
      stateRef.current.food = nextFood;

      // Combo streak logic
      const now = Date.now();
      if (now - stateRef.current.lastEatTime < 3500) {
        stateRef.current.comboCount += 1;
      } else {
        stateRef.current.comboCount = 1;
      }
      stateRef.current.lastEatTime = now;

      // Update total apples
      setStats((prev) => ({
        ...prev,
        totalApples: prev.totalApples + 1,
      }));

      const ctx = buildCommentaryContext();

      // Check for New High Score
      if (newScore > stateRef.current.stats.highScore && stateRef.current.stats.highScore > 0) {
        if (!stateRef.current.newHighAnnounced) {
          stateRef.current.newHighAnnounced = true;
          soundManager.playFanfare();
          try {
            confetti({
              particleCount: 50,
              spread: 60,
              origin: { y: 0.6 },
            });
          } catch {
            // safe
          }
          commentaryManager.triggerEvent('NEW_HIGH_SCORE', ctx, stateRef.current.settings, true);
        }
      }

      // Check Milestones (10, 25, 50, 75, 100)
      const milestones = [10, 25, 50, 75, 100];
      if (milestones.includes(newScore) && !stateRef.current.milestonesAnnounced.has(newScore)) {
        stateRef.current.milestonesAnnounced.add(newScore);
        soundManager.playFanfare();
        try {
          confetti({
            particleCount: 40,
            spread: 50,
            origin: { y: 0.65 },
          });
        } catch {
          // safe
        }
        commentaryManager.triggerEvent('SCORE_MILESTONE', ctx, stateRef.current.settings, true);
      } else if (stateRef.current.comboCount >= 3) {
        commentaryManager.triggerEvent('COMBO_STREAK', ctx, stateRef.current.settings);
      } else if (newSnake.length === 15 || newSnake.length === 35 || newSnake.length === 60) {
        commentaryManager.triggerEvent('GROWTH_MILESTONE', ctx, stateRef.current.settings);
      } else {
        // Standard food eat line (with cooldown filter)
        commentaryManager.triggerEvent('FOOD_EAT', ctx, stateRef.current.settings);
      }
    } else {
      // Normal step: pop tail
      newSnake.pop();
    }

    setSnake(newSnake);
    stateRef.current.snake = newSnake;

    // Periodic Idle thought or Danger Zone commentary check
    const now = Date.now();
    if (now - stateRef.current.lastIdleCommentaryTime > 18000) {
      stateRef.current.lastIdleCommentaryTime = now;
      const ctx = buildCommentaryContext();
      if (ctx.dangerLevel === 'HIGH') {
        commentaryManager.triggerEvent('DANGER_ZONE', ctx, stateRef.current.settings);
      } else {
        commentaryManager.triggerEvent('IDLE_THOUGHT', ctx, stateRef.current.settings);
      }
    }
  }, [cols, rows, spawnFood, buildCommentaryContext, handleGameOver]);

  /**
   * Main game tick loop with organic human player pacing
   */
  useEffect(() => {
    if (status !== 'PLAYING') return;

    let timeoutId: number;
    let isCancelled = false;

    const baseMs = SPEED_MS[settings.speed] || 110;

    const tick = () => {
      if (isCancelled || stateRef.current.status !== 'PLAYING') return;

      const prevDir = stateRef.current.direction;
      step();
      const currDir = stateRef.current.direction;
      const didTurn = prevDir !== currDir;

      // Organic human-like timing variation:
      // Real humans have slight micro-timing variance (like physical keystrokes)
      // and slight cadence when executing 90-degree corner turns vs straightaways
      let nextDelay = baseMs;
      if (settings.autoPlay) {
        const humanTapJitter = (Math.random() - 0.5) * 10;
        const cornerMicroHesitation = didTurn ? 8 : 0;
        nextDelay = Math.max(25, Math.round(baseMs + humanTapJitter + cornerMicroHesitation));
      }

      timeoutId = window.setTimeout(tick, nextDelay);
    };

    timeoutId = window.setTimeout(tick, baseMs);

    return () => {
      isCancelled = true;
      clearTimeout(timeoutId);
    };
  }, [status, settings.speed, settings.autoPlay, step]);

  /**
   * Auto start on mount (continuous mode default)
   */
  useEffect(() => {
    startNewRun();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /**
   * Direction change handler from keyboard or touch
   */
  const changeDirection = useCallback((newDir: Direction) => {
    if (stateRef.current.status !== 'PLAYING') return;
    // Disallow 180-degree instant reversal
    if (newDir === OPPOSITE_DIRECTIONS[stateRef.current.direction]) return;
    stateRef.current.nextDirection = newDir;
  }, []);

  /**
   * Keyboard controls listener
   */
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Toggle play/pause on Space
      if (e.code === 'Space') {
        e.preventDefault();
        if (status === 'PLAYING') {
          setStatus('PAUSED');
        } else if (status === 'PAUSED') {
          setStatus('PLAYING');
        } else if (status === 'GAME_OVER' || status === 'IDLE') {
          startNewRun();
        }
        return;
      }

      if (e.code === 'KeyR') {
        e.preventDefault();
        startNewRun();
        return;
      }

      let desiredDir: Direction | null = null;
      if (e.code === 'ArrowUp' || e.code === 'KeyW') desiredDir = 'UP';
      if (e.code === 'ArrowDown' || e.code === 'KeyS') desiredDir = 'DOWN';
      if (e.code === 'ArrowLeft' || e.code === 'KeyA') desiredDir = 'LEFT';
      if (e.code === 'ArrowRight' || e.code === 'KeyD') desiredDir = 'RIGHT';

      if (desiredDir) {
        e.preventDefault();
        // If user manually presses arrow keys while Auto-Play is ON, prompt manual takeover smoothly
        if (settings.autoPlay) {
          setSettings((prev) => ({ ...prev, autoPlay: false }));
          commentaryManager.triggerEvent(
            'AUTOPLAY_TOGGLE',
            buildCommentaryContext(),
            { ...settings, autoPlay: false }
          );
        }
        changeDirection(desiredDir);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [status, settings, changeDirection, startNewRun, buildCommentaryContext]);

  /**
   * Public control actions
   */
  const togglePlayPause = useCallback(() => {
    if (status === 'PLAYING') {
      setStatus('PAUSED');
    } else if (status === 'PAUSED') {
      setStatus('PLAYING');
    } else {
      startNewRun();
    }
  }, [status, startNewRun]);

  const toggleAutoPlay = useCallback(() => {
    const nextAuto = !settings.autoPlay;
    setSettings((prev) => ({ ...prev, autoPlay: nextAuto }));
    commentaryManager.triggerEvent(
      'AUTOPLAY_TOGGLE',
      buildCommentaryContext(),
      { ...settings, autoPlay: nextAuto },
      true
    );
  }, [settings, buildCommentaryContext]);

  const resetStats = useCallback(() => {
    const freshStats: GameStats = {
      highScore: 142,
      totalRuns: 0,
      totalApples: 0,
      totalSecondsPlayed: 0,
      longestLength: 3,
      currentStreak: 0,
    };
    setStats(freshStats);
    try {
      localStorage.setItem(STATS_KEY, JSON.stringify(freshStats));
    } catch {
      // safe
    }
  }, []);

  const setCustomHighScore = useCallback((newHigh: number) => {
    setStats((prev) => {
      const updated = {
        ...prev,
        highScore: newHigh,
      };
      try {
        localStorage.setItem(STATS_KEY, JSON.stringify(updated));
      } catch {
        // safe
      }
      return updated;
    });
  }, []);

  return {
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
  };
}
