
import React from 'react';
import { Rarity } from './types';

export const COLORS = {
  [Rarity.COMMON]: 'text-gray-400',
  [Rarity.UNCOMMON]: 'text-green-400',
  [Rarity.RARE]: 'text-blue-400',
  [Rarity.EPIC]: 'text-purple-400',
  [Rarity.LEGENDARY]: 'text-orange-400',
};

export const BIOME_THEMES = {
  Forest: { bg: 'bg-green-950', accent: 'text-green-500', effect: 'leaves' },
  Cave: { bg: 'bg-neutral-900', accent: 'text-neutral-500', effect: 'dust' },
  Volcano: { bg: 'bg-red-950', accent: 'text-red-600', effect: 'embers' },
  Ice: { bg: 'bg-cyan-950', accent: 'text-cyan-400', effect: 'snow' },
  Ruins: { bg: 'bg-amber-950', accent: 'text-amber-500', effect: 'glint' },
};

export const CRIT_CHANCES = {
  Rogue: 0.25,
  Warrior: 0.15,
  Mage: 0.10,
};

export const Icons = {
  Heart: () => (
    <svg className="w-5 h-5 text-red-500" fill="currentColor" viewBox="0 0 24 24">
      <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
    </svg>
  ),
  Sword: () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
      <path d="M14.5 3l6.5 6.5-12.5 12.5-3.5 1 1-3.5L14.5 3z" />
    </svg>
  ),
  Shield: () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    </svg>
  ),
  Gold: () => (
    <svg className="w-5 h-5 text-yellow-500" fill="currentColor" viewBox="0 0 24 24">
      <circle cx="12" cy="12" r="10" />
      <text x="12" y="16" textAnchor="middle" fill="#000" fontSize="12" fontWeight="bold">$</text>
    </svg>
  ),
  EnemyIcon: ({ type }: { type?: string }) => {
    const t = type?.toLowerCase() || '';
    if (t.includes('skeleton')) return <span>💀</span>;
    if (t.includes('spider')) return <span>🕷️</span>;
    if (t.includes('ghost')) return <span>👻</span>;
    if (t.includes('dragon')) return <span>🐲</span>;
    if (t.includes('orc') || t.includes('goblin')) return <span>👹</span>;
    return <span>👾</span>;
  },
  ClassIcon: ({ className }: { className: string }) => {
    if (className === 'Rogue') return <span>🗡️</span>;
    if (className === 'Mage') return <span>✨</span>;
    return <span>🛡️</span>;
  }
};
