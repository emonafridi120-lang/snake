import { SnakeSkinId, SkinRarity } from '../types/game';

export interface SnakeSkinDef {
  id: SnakeSkinId;
  name: string;
  rarity: SkinRarity;
  icon: string;
  description: string;
  primaryColor: string;
  secondaryColor: string;
  headColor: string;
  eyePupil: string;
  eyeGlint?: string;
  glowColor?: string;
  isRainbow?: boolean;
  isDragon?: boolean;
  trailType: 'NORMAL' | 'ELECTRIC' | 'FIRE' | 'ICE' | 'GALAXY' | 'LEAF' | 'GOLD' | 'CYBER' | 'RAINBOW' | 'DRAGON_FIRE';
}

export const SNAKE_SKINS: Record<SnakeSkinId, SnakeSkinDef> = {
  CLASSIC_GREEN: {
    id: 'CLASSIC_GREEN',
    name: 'Classic Green',
    rarity: 'Common',
    icon: '🟢',
    description: 'The beloved classic garden snake with smooth green scales.',
    primaryColor: '#4CAF50',
    secondaryColor: '#388E3C',
    headColor: '#2E7D32',
    eyePupil: '#1B3B0C',
    eyeGlint: '#FFFFFF',
    trailType: 'NORMAL',
  },
  NEON_BLUE: {
    id: 'NEON_BLUE',
    name: 'Neon Blue',
    rarity: 'Rare',
    icon: '⚡',
    description: 'High-voltage electric cyan snake with energized pulses.',
    primaryColor: '#00E5FF',
    secondaryColor: '#0091EA',
    headColor: '#00B0FF',
    eyePupil: '#18FFFF',
    eyeGlint: '#FFFFFF',
    glowColor: 'rgba(0, 229, 255, 0.55)',
    trailType: 'ELECTRIC',
  },
  FIRE_SNAKE: {
    id: 'FIRE_SNAKE',
    name: 'Fire Snake',
    rarity: 'Epic',
    icon: '🔥',
    description: 'Born from molten lava, burning hot with blazing embers.',
    primaryColor: '#FF5722',
    secondaryColor: '#E64A19',
    headColor: '#D84315',
    eyePupil: '#FFD600',
    eyeGlint: '#FFFFFF',
    glowColor: 'rgba(255, 87, 34, 0.6)',
    trailType: 'FIRE',
  },
  ICE_SNAKE: {
    id: 'ICE_SNAKE',
    name: 'Ice Snake',
    rarity: 'Epic',
    icon: '❄️',
    description: 'Frozen glacial scales that leave sub-zero frost crystals.',
    primaryColor: '#80D8FF',
    secondaryColor: '#40C4FF',
    headColor: '#00B0FF',
    eyePupil: '#01579B',
    eyeGlint: '#FFFFFF',
    glowColor: 'rgba(128, 216, 255, 0.6)',
    trailType: 'ICE',
  },
  GALAXY_SNAKE: {
    id: 'GALAXY_SNAKE',
    name: 'Galaxy Snake',
    rarity: 'Epic',
    icon: '🌌',
    description: 'Woven from cosmic stardust, nebulae, and violet mysteries.',
    primaryColor: '#7C4DFF',
    secondaryColor: '#4A148C',
    headColor: '#311B92',
    eyePupil: '#E040FB',
    eyeGlint: '#FFFFFF',
    glowColor: 'rgba(124, 77, 255, 0.65)',
    trailType: 'GALAXY',
  },
  FOREST_SNAKE: {
    id: 'FOREST_SNAKE',
    name: 'Forest Snake',
    rarity: 'Rare',
    icon: '🍃',
    description: 'Ancient woodland guardian adorned with deep moss and ivy.',
    primaryColor: '#2E7D32',
    secondaryColor: '#1B5E20',
    headColor: '#1B5E20',
    eyePupil: '#0D3812',
    eyeGlint: '#FFFFFF',
    glowColor: 'rgba(46, 125, 50, 0.4)',
    trailType: 'LEAF',
  },
  GOLDEN_SNAKE: {
    id: 'GOLDEN_SNAKE',
    name: 'Golden Snake',
    rarity: 'Epic',
    icon: '✨',
    description: 'Forged from pure 24K gold with gleaming royal ruby eyes.',
    primaryColor: '#FFD700',
    secondaryColor: '#FFA000',
    headColor: '#FF8F00',
    eyePupil: '#D50000',
    eyeGlint: '#FFFFFF',
    glowColor: 'rgba(255, 215, 0, 0.65)',
    trailType: 'GOLD',
  },
  CYBER_SNAKE: {
    id: 'CYBER_SNAKE',
    name: 'Cyber Snake',
    rarity: 'Epic',
    icon: '🤖',
    description: 'Futuristic synthwave runner with laser circuit telemetry.',
    primaryColor: '#18FFFF',
    secondaryColor: '#D500F9',
    headColor: '#00E5FF',
    eyePupil: '#FF007F',
    eyeGlint: '#FFFFFF',
    glowColor: 'rgba(213, 0, 249, 0.6)',
    trailType: 'CYBER',
  },
  RAINBOW_SNAKE: {
    id: 'RAINBOW_SNAKE',
    name: 'Rainbow Snake',
    rarity: 'Legendary',
    icon: '🌈',
    description: 'Prismatic mythical serpentine radiating chromatic light waves.',
    primaryColor: '#FF1744',
    secondaryColor: '#651FFF',
    headColor: '#F50057',
    eyePupil: '#FFFFFF',
    eyeGlint: '#000000',
    glowColor: 'rgba(255, 255, 255, 0.7)',
    isRainbow: true,
    trailType: 'RAINBOW',
  },
  LEGENDARY_DRAGON: {
    id: 'LEGENDARY_DRAGON',
    name: 'Legendary Dragon',
    rarity: 'Legendary',
    icon: '🐉',
    description: 'Ancient celestial beast with imperial gold scales, horns, glowing amber slit eyes, and billowing dragon flames.',
    primaryColor: '#D50000',
    secondaryColor: '#B71C1C',
    headColor: '#B71C1C',
    eyePupil: '#FF6D00',
    eyeGlint: '#FFE082',
    glowColor: 'rgba(255, 179, 0, 0.85)',
    isDragon: true,
    trailType: 'DRAGON_FIRE',
  },
};

export const RARITY_CONFIG: Record<
  SkinRarity,
  { label: string; badgeBg: string; textColor: string; border: string; glow: string }
> = {
  Common: {
    label: 'Common',
    badgeBg: 'bg-neutral-100 dark:bg-neutral-800',
    textColor: 'text-neutral-700 dark:text-neutral-300',
    border: 'border-neutral-300 dark:border-neutral-700',
    glow: '',
  },
  Rare: {
    label: 'Rare',
    badgeBg: 'bg-blue-500/15',
    textColor: 'text-blue-600 dark:text-blue-400',
    border: 'border-blue-500/40',
    glow: 'shadow-blue-500/20',
  },
  Epic: {
    label: 'Epic',
    badgeBg: 'bg-purple-500/15',
    textColor: 'text-purple-600 dark:text-purple-400',
    border: 'border-purple-500/40',
    glow: 'shadow-purple-500/20',
  },
  Legendary: {
    label: 'Legendary',
    badgeBg: 'bg-amber-500/15',
    textColor: 'text-amber-600 dark:text-amber-400',
    border: 'border-amber-500/50',
    glow: 'shadow-amber-500/30',
  },
};
