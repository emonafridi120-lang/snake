export type Direction = 'UP' | 'DOWN' | 'LEFT' | 'RIGHT';

export interface Point {
  x: number;
  y: number;
}

export type GameStatus = 'IDLE' | 'PLAYING' | 'PAUSED' | 'GAME_OVER';

export type GameSpeed = 'SLOW' | 'NORMAL' | 'FAST' | 'HYPER';

export type CommentatorPersona = 'HYPE' | 'FUNNY' | 'ANALYST';

export type SkinRarity = 'Common' | 'Rare' | 'Epic' | 'Legendary';

export type SnakeSkinId =
  | 'CLASSIC_GREEN'
  | 'NEON_BLUE'
  | 'FIRE_SNAKE'
  | 'ICE_SNAKE'
  | 'GALAXY_SNAKE'
  | 'FOREST_SNAKE'
  | 'GOLDEN_SNAKE'
  | 'CYBER_SNAKE'
  | 'RAINBOW_SNAKE'
  | 'LEGENDARY_DRAGON';

export interface GameSettings {
  autoPlay: boolean;
  speed: GameSpeed;
  soundEnabled: boolean;
  bgmEnabled: boolean;
  voiceEnabled: boolean;
  voiceVolume: number;
  voiceRate: number;
  voicePitch: number;
  selectedVoiceURI: string;
  persona: CommentatorPersona;
  autoRestartDelaySec: number;
  continuousMode: boolean;
  streamerLayout: boolean;
  gridSize: { cols: number; rows: number };
  skin: SnakeSkinId;
}

export interface GameStats {
  highScore: number;
  totalRuns: number;
  totalApples: number;
  totalSecondsPlayed: number;
  longestLength: number;
  currentStreak: number;
}

export type CommentaryEvent =
  | 'RUN_START'
  | 'FOOD_EAT'
  | 'COMBO_STREAK'
  | 'GROWTH_MILESTONE'
  | 'NEAR_MISS'
  | 'DANGER_ZONE'
  | 'SCORE_MILESTONE'
  | 'NEW_HIGH_SCORE'
  | 'TIME_SURVIVAL'
  | 'GAME_OVER_WALL'
  | 'GAME_OVER_SELF'
  | 'AUTO_RESTART'
  | 'IDLE_THOUGHT'
  | 'AUTOPLAY_TOGGLE'
  | 'MANUAL_TAKE_OVER';

export interface CommentaryContext {
  score: number;
  highScore: number;
  isNewHigh: boolean;
  length: number;
  comboCount: number;
  survivedSeconds: number;
  runCount: number;
  autoPlay: boolean;
  dangerLevel: 'LOW' | 'MEDIUM' | 'HIGH';
}
