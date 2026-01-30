
export enum ClassType {
  ROGUE = 'Rogue',
  WARRIOR = 'Warrior',
  MAGE = 'Mage'
}

export enum BiomeType {
  FOREST = 'Forest',
  CAVE = 'Cave',
  VOLCANO = 'Volcano',
  ICE = 'Ice',
  RUINS = 'Ruins'
}

export enum ToneType {
  CLASSIC = 'Classic',
  GRIMDARK = 'Grimdark',
  HEROIC = 'Heroic'
}

export enum DamageType {
  PHYSICAL = 'Physical',
  MAGICAL = 'Magical',
  FIRE = 'Fire',
  ICE = 'Ice'
}

export enum Rarity {
  COMMON = 'Common',
  UNCOMMON = 'Uncommon',
  RARE = 'Rare',
  EPIC = 'Epic',
  LEGENDARY = 'Legendary'
}

export interface Item {
  id: string;
  name: string;
  rarity: Rarity;
  bonus: {
    stat: 'attack' | 'defense' | 'health';
    value: number;
  };
}

export interface Enemy {
  name: string;
  type: string;
  health: number;
  maxHealth: number;
  attack: number;
  resistances: Partial<Record<DamageType, number>>;
}

export interface Quest {
  id: string;
  description: string;
  type: 'Kill' | 'Explore' | 'Collect' | 'Survive' | 'Boss';
  target: number;
  progress: number;
  rewardXp: number;
  rewardGold: number;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  unlockedAt?: number;
}

export interface GameState {
  player: {
    class: ClassType;
    health: number;
    maxHealth: number;
    xp: number;
    level: number;
    gold: number;
    attack: number;
    defense: number;
    inventory: Item[];
  };
  currentEnemy: Enemy | null;
  currentBiome: BiomeType;
  tone: ToneType;
  activeQuests: Quest[];
  narrativeLog: string[];
  lastAction: string;
  turn: number;
  isGameOver: boolean;
  stats: {
    enemiesDefeated: number;
    goldCollected: number;
    stepsTaken: number;
  };
  achievements: Achievement[];
}

export interface AIResponse {
  narrative: string;
  enemyToSpawn?: Enemy;
  biomeChange?: BiomeType;
  questUpdate?: {
    id: string;
    progressDelta: number;
    isNew?: boolean;
    newQuest?: Quest;
  };
  itemDrop?: Item;
  statChanges?: Partial<GameState['player']>;
}
