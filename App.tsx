
import React, { useState, useCallback, useEffect } from 'react';
import { GameState, ClassType, BiomeType, ToneType, AIResponse, Achievement } from './types';
import { processPlayerAction, playNarrativeAudio } from './services/gemini';
import Visualizer from './components/Visualizer';
import NarrativePanel from './components/NarrativePanel';
import LandingPage from './components/LandingPage';
import { Icons, COLORS } from './constants';
import SoundManager from './services/sounds';

const SAVE_KEY = 'ai_dungeon_master_save';

const ACHIEVEMENTS: Achievement[] = [
  { id: 'first_blood', title: 'First Blood', description: 'Defeat your first dungeon denizen.' },
  { id: 'hoarder', title: 'Hoarder', description: 'Collect over 250 gold.' },
  { id: 'survivor', title: 'Survivor', description: 'Survive a near-death encounter.' },
  { id: 'explorer', title: 'Tread the Depths', description: 'Explore your first biome.' }
];

const SETTINGS = [
  { type: BiomeType.FOREST, label: 'Whispering Woods', icon: '🌲', desc: 'Lush greenery and ancient trees.' },
  { type: BiomeType.CAVE, label: 'Forgotten Depths', icon: '🕳️', desc: 'Damp tunnels and echoing halls.' },
  { type: BiomeType.VOLCANO, label: 'Obsidian Crags', icon: '🌋', desc: 'Rivers of magma and scorching air.' },
  { type: BiomeType.ICE, label: 'Frozen Expanse', icon: '❄️', desc: 'Glacial peaks and biting winds.' },
  { type: BiomeType.RUINS, label: 'Cursed Citadel', icon: '🏰', desc: 'Crumbling stone and dark history.' }
];

const TONES = [
  { type: ToneType.CLASSIC, label: 'Classic Fantasy', desc: 'A balanced and traditional adventure.' },
  { type: ToneType.GRIMDARK, label: 'Grimdark', desc: 'Visceral, unforgiving, and dark.' },
  { type: ToneType.HEROIC, label: 'Heroic Epic', desc: 'Grandiose, inspiring, and legendary.' }
];

const initialState: GameState = {
  player: {
    class: ClassType.WARRIOR,
    health: 100,
    maxHealth: 100,
    xp: 0,
    level: 1,
    gold: 50,
    attack: 10,
    defense: 5,
    inventory: []
  },
  currentEnemy: null,
  currentBiome: BiomeType.FOREST,
  tone: ToneType.CLASSIC,
  activeQuests: [
    { id: 'start', description: 'Begin your journey into the unknown.', type: 'Explore', target: 3, progress: 0, rewardXp: 50, rewardGold: 20 }
  ],
  narrativeLog: [],
  lastAction: '',
  turn: 0,
  isGameOver: false,
  stats: {
    enemiesDefeated: 0,
    goldCollected: 50,
    stepsTaken: 0
  },
  achievements: []
};

type AppView = 'landing' | 'setup' | 'play';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<AppView>('landing');
  const [gameState, setGameState] = useState<GameState>(initialState);
  const [actionInput, setActionInput] = useState('');
  const [isThinking, setIsThinking] = useState(false);
  const [toasts, setToasts] = useState<string[]>([]);
  const [hasSave, setHasSave] = useState(false);
  const [isMuted, setIsMuted] = useState(false);

  const [selectedBiome, setSelectedBiome] = useState<BiomeType>(BiomeType.FOREST);
  const [selectedTone, setSelectedTone] = useState<ToneType>(ToneType.CLASSIC);

  useEffect(() => {
    SoundManager.init();
    const saved = localStorage.getItem(SAVE_KEY);
    if (saved) {
      setHasSave(true);
    }
  }, []);

  useEffect(() => {
    if (currentView === 'play' || gameState.turn > 0 || gameState.isGameOver) {
      localStorage.setItem(SAVE_KEY, JSON.stringify(gameState));
      setHasSave(true);
    }
    
    if (gameState.isGameOver && gameState.turn > 0) {
      SoundManager.play('death');
    }
  }, [gameState.turn, gameState.isGameOver, currentView]);

  const addToast = (msg: string) => {
    setToasts(prev => [...prev, msg]);
    setTimeout(() => {
      setToasts(prev => prev.slice(1));
    }, 4000);
  };

  const handleAction = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!actionInput.trim() || isThinking || gameState.isGameOver) return;

    const action = actionInput;
    setActionInput('');
    setIsThinking(true);
    
    const lowerAction = action.toLowerCase();
    if (lowerAction.includes('attack') || lowerAction.includes('strike') || lowerAction.includes('hit')) {
      SoundManager.play('attack');
    } else if (lowerAction.includes('cast') || lowerAction.includes('magic') || lowerAction.includes('spell')) {
      SoundManager.play('spell');
    } else {
      SoundManager.play('click');
    }

    setGameState(prev => ({
        ...prev,
        turn: prev.turn + 1,
        narrativeLog: [...prev.narrativeLog, `> ${action}`],
        stats: { ...prev.stats, stepsTaken: prev.stats.stepsTaken + 1 }
    }));

    const response: AIResponse = await processPlayerAction(action, gameState);
    
    setGameState(prev => {
      let newState = { ...prev };
      newState.narrativeLog = [...newState.narrativeLog, response.narrative];
      
      if (response.statChanges) {
        const changes = response.statChanges;
        if (changes.gold) newState.stats.goldCollected += changes.gold;
        
        newState.player = {
          ...newState.player,
          health: Math.min(newState.player.maxHealth, Math.max(0, (newState.player.health + (changes.health || 0)))),
          xp: newState.player.xp + (changes.xp || 0),
          gold: newState.player.gold + (changes.gold || 0),
          attack: newState.player.attack + (changes.attack || 0),
          defense: newState.player.defense + (changes.defense || 0)
        };
      }

      if (newState.stats.goldCollected >= 250 && !newState.achievements.find(a => a.id === 'hoarder')) {
        const ach = ACHIEVEMENTS.find(a => a.id === 'hoarder')!;
        newState.achievements.push({ ...ach, unlockedAt: Date.now() });
        addToast(`🏆 Achievement Unlocked: ${ach.title}`);
        SoundManager.play('level_up');
      }

      if (newState.player.xp >= newState.player.level * 100) {
        newState.player.xp -= newState.player.level * 100;
        newState.player.level += 1;
        newState.player.maxHealth += 20;
        newState.player.health = newState.player.maxHealth;
        newState.narrativeLog.push("✨ LEVEL UP! You feel a surge of power coursing through your veins.");
        addToast("✨ Level Up!");
        SoundManager.play('level_up');
      }

      if (response.enemyToSpawn) {
        newState.currentEnemy = response.enemyToSpawn;
      }

      if (newState.currentEnemy && newState.currentEnemy.health <= 0) {
          newState.stats.enemiesDefeated += 1;
          newState.narrativeLog.push(`💀 The ${newState.currentEnemy.name} collapses into the dust.`);
          newState.player.gold += 15;
          newState.player.xp += 25;
          newState.currentEnemy = null;
          
          if (newState.stats.enemiesDefeated === 1 && !newState.achievements.find(a => a.id === 'first_blood')) {
            const ach = ACHIEVEMENTS.find(a => a.id === 'first_blood')!;
            newState.achievements.push({ ...ach, unlockedAt: Date.now() });
            addToast(`⚔️ Achievement Unlocked: ${ach.title}`);
          }
      }

      if (response.biomeChange && response.biomeChange !== newState.currentBiome) {
        newState.currentBiome = response.biomeChange;
        SoundManager.play('quest');
        if (!newState.achievements.find(a => a.id === 'explorer')) {
            const ach = ACHIEVEMENTS.find(a => a.id === 'explorer')!;
            newState.achievements.push({ ...ach, unlockedAt: Date.now() });
            addToast(`🌍 Achievement Unlocked: ${ach.title}`);
        }
      }

      if (response.questUpdate) {
        const { id, progressDelta, isNew, newQuest } = response.questUpdate;
        if (isNew && newQuest) {
           newState.activeQuests = [...newState.activeQuests, newQuest].slice(-3);
           addToast("📜 New Quest Added!");
           SoundManager.play('quest');
        } else {
           newState.activeQuests = newState.activeQuests.map(q => 
             q.id === id ? { ...q, progress: Math.min(q.target, q.progress + progressDelta) } : q
           );
        }
      }

      if (response.itemDrop) {
        newState.player.inventory = [...newState.player.inventory, response.itemDrop];
        newState.narrativeLog.push(`🎁 Found: ${response.itemDrop.name} (${response.itemDrop.rarity})`);
        addToast(`🎁 Found ${response.itemDrop.name}`);
        SoundManager.play('item');
      }

      if (newState.player.health <= 0) {
        newState.player.health = 0;
        newState.isGameOver = true;
        newState.narrativeLog.push("🔴 Darkness finally claims you. The dungeon master closes the book.");
      }

      return newState;
    });

    setIsThinking(false);
  };

  const handleNarrativeComplete = (text: string) => {
    if (text.length > 20) {
      playNarrativeAudio(text);
    }
  };

  const handleContinue = () => {
    SoundManager.play('click');
    const saved = localStorage.getItem(SAVE_KEY);
    if (saved) {
      setGameState(JSON.parse(saved));
      setCurrentView('play');
    }
  };

  const handleReset = () => {
    SoundManager.play('click');
    localStorage.removeItem(SAVE_KEY);
    setHasSave(false);
    setGameState(initialState);
    setCurrentView('landing');
  };

  const toggleMute = () => {
    const newVal = SoundManager.toggleMute();
    setIsMuted(newVal);
  };

  const startGameWithClass = (type: ClassType) => {
    SoundManager.play('click');
    SoundManager.play('quest');
    
    const basePlayer = { ...initialState.player, class: type };
    if (type === ClassType.WARRIOR) { basePlayer.maxHealth = 120; basePlayer.health = 120; basePlayer.attack = 12; }
    if (type === ClassType.ROGUE) { basePlayer.maxHealth = 90; basePlayer.health = 90; basePlayer.attack = 15; }
    if (type === ClassType.MAGE) { basePlayer.maxHealth = 70; basePlayer.health = 70; basePlayer.attack = 20; }
    
    const settingLabel = SETTINGS.find(s => s.type === selectedBiome)?.label || 'Unknown';
    const initialNarrative = `You arrive at the ${settingLabel}. The air is thick with the scent of adventure and danger. Your path as a ${type} begins here.`;

    setGameState({ 
        ...initialState, 
        player: basePlayer, 
        currentBiome: selectedBiome, 
        tone: selectedTone,
        narrativeLog: [initialNarrative],
        turn: 1
    });
    setCurrentView('play');
  };

  if (currentView === 'landing') {
    return <LandingPage onStart={() => { SoundManager.play('click'); setCurrentView('setup'); }} onContinue={handleContinue} hasSave={hasSave} />;
  }

  if (currentView === 'setup') {
    return (
      <div className="min-h-screen flex flex-col items-center justify-start p-6 bg-[#0a0a0a] relative overflow-y-auto custom-scrollbar pt-16">
        <div className="absolute inset-0 opacity-20 pointer-events-none">
            <div className="w-full h-full bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-orange-900 via-amber-900/10 to-transparent"></div>
        </div>
        
        <div className="relative z-10 flex flex-col items-center">
            <h1 className="cinzel text-4xl md:text-5xl mb-2 text-center tracking-tighter text-white">
              INITIALIZE YOUR SAGA
            </h1>
            <p className="text-orange-500 mb-12 max-w-md text-center cinzel tracking-widest uppercase text-[10px] font-bold">
              The Dungeon Master awaits your decisions
            </p>
        </div>

        <div className="w-full max-w-5xl space-y-12 pb-12 relative z-10">
            <section className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                <h2 className="cinzel text-xl text-orange-500 mb-6 border-b border-orange-900/30 pb-2 flex items-center gap-4">
                    <span className="bg-gradient-to-br from-orange-500 to-amber-600 text-white w-6 h-6 rounded-full flex items-center justify-center text-[10px] shadow-[0_0_10px_rgba(245,158,11,0.5)] font-bold">1</span>
                    Choose Your Starting Setting
                </h2>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                    {SETTINGS.map((s) => (
                        <button
                            key={s.type}
                            onClick={() => { SoundManager.play('click'); setSelectedBiome(s.type); }}
                            className={`p-4 rounded-xl border transition-all text-center flex flex-col items-center gap-2 group ${
                                selectedBiome === s.type 
                                ? 'bg-orange-600/20 border-orange-500 shadow-[0_0_20px_rgba(245,158,11,0.25)] scale-105' 
                                : 'bg-neutral-900/40 border-neutral-800 hover:border-orange-900'
                            }`}
                        >
                            <span className="text-3xl group-hover:scale-110 transition-transform">{s.icon}</span>
                            <span className={`text-xs cinzel ${selectedBiome === s.type ? 'text-white' : 'text-neutral-400'}`}>{s.label}</span>
                        </button>
                    ))}
                </div>
            </section>

            <section className="animate-in fade-in slide-in-from-bottom-4 duration-700">
                <h2 className="cinzel text-xl text-orange-500 mb-6 border-b border-orange-900/30 pb-2 flex items-center gap-4">
                    <span className="bg-gradient-to-br from-orange-500 to-amber-600 text-white w-6 h-6 rounded-full flex items-center justify-center text-[10px] shadow-[0_0_10px_rgba(245,158,11,0.5)] font-bold">2</span>
                    Select Your Narrative Tone
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {TONES.map((t) => (
                        <button
                            key={t.type}
                            onClick={() => { SoundManager.play('click'); setSelectedTone(t.type); }}
                            className={`p-6 rounded-xl border transition-all text-left group ${
                                selectedTone === t.type 
                                ? 'bg-orange-600/20 border-orange-500 shadow-[0_0_20px_rgba(245,158,11,0.25)]' 
                                : 'bg-neutral-900/40 border-neutral-800 hover:border-orange-900'
                            }`}
                        >
                            <div className={`text-sm cinzel mb-2 ${selectedTone === t.type ? 'text-white' : 'text-neutral-400'}`}>{t.label}</div>
                            <p className="text-xs text-neutral-500 leading-relaxed">{t.desc}</p>
                        </button>
                    ))}
                </div>
            </section>

            <section className="animate-in fade-in slide-in-from-bottom-4 duration-1000">
                <h2 className="cinzel text-xl text-orange-500 mb-6 border-b border-orange-900/30 pb-2 flex items-center gap-4">
                    <span className="bg-gradient-to-br from-orange-500 to-amber-600 text-white w-6 h-6 rounded-full flex items-center justify-center text-[10px] shadow-[0_0_10px_rgba(245,158,11,0.5)] font-bold">3</span>
                    Pick Your Hero Class
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {[
                        { type: ClassType.WARRIOR, desc: 'A juggernaut of steel. High defense and reliable physical power.', stats: 'HP: 120 | ATK: 12' },
                        { type: ClassType.ROGUE, desc: 'A shadow in the dark. Master of evasion and high critical strikes.', stats: 'HP: 90 | ATK: 15' },
                        { type: ClassType.MAGE, desc: 'Wielder of cosmic forces. Low durability but overwhelming magical potential.', stats: 'HP: 70 | ATK: 20' }
                    ].map((cls) => (
                        <button
                            key={cls.type}
                            onClick={() => startGameWithClass(cls.type)}
                            className="group relative p-8 bg-neutral-900/40 backdrop-blur-sm border border-neutral-800 hover:border-orange-500 rounded-xl transition-all transform hover:-translate-y-2 text-left"
                        >
                            <div className="cinzel text-2xl mb-2 text-white group-hover:text-orange-400 flex items-center gap-3">
                                <Icons.ClassIcon className={cls.type} />
                                {cls.type}
                            </div>
                            <div className="text-[10px] text-orange-500 uppercase font-bold tracking-widest mb-3 opacity-60">
                                {cls.stats}
                            </div>
                            <div className="text-sm text-neutral-400 leading-relaxed">
                                {cls.desc}
                            </div>
                            <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                <div className="w-2 h-2 bg-orange-500 rounded-full animate-ping" />
                            </div>
                        </button>
                    ))}
                </div>
            </section>
        </div>

        <button 
            onClick={() => { SoundManager.play('click'); setCurrentView('landing'); }}
            className="mt-12 text-neutral-600 hover:text-orange-500 text-[10px] uppercase tracking-[0.2em] cinzel transition-colors"
        >
            &larr; Return to Entrance
        </button>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-black text-white font-sans selection:bg-orange-500/30 overflow-hidden">
      
      <div className="fixed top-20 right-4 z-[100] flex flex-col gap-2">
        {toasts.map((toast, i) => (
            <div key={i} className="bg-neutral-900 border-l-4 border-orange-500 p-4 shadow-2xl animate-in slide-in-from-right duration-300 cinzel text-xs tracking-widest border border-white/5">
                {toast}
            </div>
        ))}
      </div>

      <div className="bg-neutral-900 p-3 border-b-4 border-black flex items-center justify-between z-50">
        <div className="flex items-center gap-8">
          <div className="flex flex-col">
            <span className="text-[9px] text-neutral-500 uppercase font-bold tracking-[0.2em] mb-1">Vitality</span>
            <div className="flex items-center gap-2">
              <Icons.Heart />
              <div className="flex items-baseline gap-1">
                <span className="font-bold text-xl cinzel leading-none">{gameState.player.health}</span>
                <span className="text-neutral-600 text-xs">/ {gameState.player.maxHealth}</span>
              </div>
            </div>
          </div>

          <div className="flex flex-col w-40">
            <span className="text-[9px] text-neutral-500 uppercase font-bold tracking-[0.2em] mb-1">Progression</span>
            <div className="w-full h-2 bg-black rounded-full overflow-hidden border border-white/5">
                <div 
                    className="h-full bg-gradient-to-r from-blue-600 via-orange-500 to-amber-400 transition-all duration-1000" 
                    style={{ width: `${(gameState.player.xp / (gameState.player.level * 100)) * 100}%` }}
                />
            </div>
            <div className="flex justify-between mt-1 text-[8px] text-orange-500 font-bold uppercase tracking-widest">
                <span>XP {gameState.player.xp}</span>
                <span>LVL {gameState.player.level}</span>
            </div>
          </div>
        </div>

        <div className="flex flex-col items-center">
             <div className="flex items-center gap-2 px-3 py-1 rounded-full border border-orange-900 bg-orange-900/20 shadow-[0_0_10px_rgba(245,158,11,0.1)]">
                <Icons.ClassIcon className={gameState.player.class} />
                <span className="text-xs text-orange-300 font-bold uppercase tracking-[0.1em]">{gameState.player.class}</span>
             </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex flex-col items-end">
            <span className="text-[9px] text-neutral-500 uppercase font-bold tracking-[0.2em] mb-1">Treasury</span>
            <div className="flex items-center gap-2">
              <span className="font-bold text-xl text-yellow-500 cinzel leading-none">{gameState.player.gold}</span>
              <Icons.Gold />
            </div>
          </div>
          
          <div className="flex items-center gap-1">
            <button 
              onClick={toggleMute}
              title={isMuted ? "Unmute" : "Mute"}
              className="p-2 text-neutral-600 hover:text-orange-500 transition-colors bg-black/40 rounded border border-white/5"
            >
              {isMuted ? (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5.586 15H4a1 1 0 01-1-1V10a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2" /></svg>
              ) : (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1V10a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" /></svg>
              )}
            </button>
            <button 
              onClick={handleReset} 
              title="Reset Game"
              className="p-2 text-neutral-600 hover:text-red-500 transition-colors bg-black/40 rounded border border-white/5"
            >
               <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
            </button>
          </div>
        </div>
      </div>

      <div className="flex-1 flex flex-col md:flex-row min-h-0 overflow-hidden">
        
        <div className="hidden lg:flex w-80 flex-col bg-neutral-900/50 p-5 border-r-4 border-black gap-8 overflow-y-auto custom-scrollbar">
            <section>
                <h4 className="cinzel text-[10px] text-neutral-600 uppercase tracking-widest mb-4 border-b border-white/5 pb-2">Active Objectives</h4>
                <div className="space-y-4">
                    {gameState.activeQuests.map((q) => (
                        <div key={q.id} className="p-3 bg-black/40 rounded border border-white/5 hover:border-orange-500/30 transition-colors group">
                            <div className="text-xs font-bold text-neutral-300 mb-2 leading-relaxed group-hover:text-orange-300 transition-colors">{q.description}</div>
                            <div className="w-full h-1 bg-neutral-900 rounded-full overflow-hidden">
                                <div className="h-full bg-gradient-to-r from-orange-600 to-amber-400" style={{ width: `${(q.progress / q.target) * 100}%` }}></div>
                            </div>
                            <div className="flex justify-between mt-2 text-[8px] text-neutral-500 font-bold uppercase tracking-wider">
                                <span>{q.type}</span>
                                <span className="text-orange-500">{q.progress} / {q.target}</span>
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            <section>
                <div className="flex justify-between items-center mb-4 border-b border-white/5 pb-2">
                    <h4 className="cinzel text-[10px] text-neutral-600 uppercase tracking-widest">Backpack</h4>
                    <span className="text-[8px] font-bold text-neutral-700 uppercase tracking-tighter">{gameState.player.inventory.length}/16 SLOTS</span>
                </div>
                <div className="grid grid-cols-4 gap-2">
                    {gameState.player.inventory.map((item, i) => (
                        <div key={i} title={`${item.name} (+${item.bonus.value} ${item.bonus.stat})`} 
                             className={`w-12 h-12 bg-black/60 rounded border border-white/5 flex items-center justify-center cursor-help transition-all hover:scale-105 active:scale-95 group`}>
                             <div className={`text-xl drop-shadow-lg ${(COLORS as any)[item.rarity]} group-hover:scale-110 transition-transform`}>
                                {item.bonus.stat === 'attack' ? '⚔️' : item.bonus.stat === 'defense' ? '🛡️' : '🧪'}
                             </div>
                        </div>
                    ))}
                    {Array.from({ length: Math.max(0, 16 - gameState.player.inventory.length) }).map((_, i) => (
                        <div key={`empty-${i}`} className="w-12 h-12 bg-black/20 rounded border border-white/5"></div>
                    ))}
                </div>
            </section>

            <section>
                <h4 className="cinzel text-[10px] text-neutral-600 uppercase tracking-widest mb-4 border-b border-white/5 pb-2">Saga Statistics</h4>
                <div className="space-y-3">
                    <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-widest">
                        <span className="text-neutral-500 flex items-center gap-2">💀 Enemies Defeated</span>
                        <span className="text-white">{gameState.stats.enemiesDefeated}</span>
                    </div>
                    <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-widest">
                        <span className="text-neutral-500 flex items-center gap-2">💰 Total Gold Found</span>
                        <span className="text-yellow-500">{gameState.stats.goldCollected}</span>
                    </div>
                    <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-widest">
                        <span className="text-neutral-500 flex items-center gap-2">👣 Distance Traveled</span>
                        <span className="text-blue-400">{gameState.stats.stepsTaken}</span>
                    </div>
                </div>
            </section>

            <section className="mt-auto">
                <div className="p-3 bg-orange-900/10 border border-orange-900/30 rounded shadow-[0_0_15px_rgba(245,158,11,0.05)]">
                    <div className="text-[10px] text-orange-400 cinzel mb-1">Combat Potency</div>
                    <div className="flex justify-between text-xs font-bold text-white">
                        <span className="flex items-center gap-1"><Icons.Sword /> {gameState.player.attack}</span>
                        <span className="flex items-center gap-1"><Icons.Shield /> {gameState.player.defense}</span>
                    </div>
                </div>
            </section>
        </div>

        <div className="flex-1 flex flex-col min-h-0">
          <Visualizer state={gameState} />
          <NarrativePanel logs={gameState.narrativeLog} isThinking={isThinking} onNarrativeComplete={handleNarrativeComplete} />
          
          <div className="p-4 bg-neutral-900 border-t-4 border-black">
            {!gameState.isGameOver ? (
                <form onSubmit={handleAction} className="flex gap-2 max-w-4xl mx-auto">
                    <input
                        autoFocus
                        type="text"
                        value={actionInput}
                        onChange={(e) => setActionInput(e.target.value)}
                        disabled={isThinking}
                        placeholder="Type your action... (e.g. 'Investigate the ruins', 'Strike the goblin')"
                        className="flex-1 bg-black border border-white/5 px-4 py-4 text-sm text-white focus:outline-none focus:border-orange-500 transition-colors placeholder-neutral-700 disabled:opacity-50 font-medium"
                    />
                    <button
                        type="submit"
                        disabled={isThinking || !actionInput.trim()}
                        className="bg-gradient-to-br from-orange-600 to-amber-700 hover:from-orange-500 hover:to-amber-600 disabled:bg-neutral-800 px-10 py-2 font-bold uppercase tracking-widest transition-all cinzel text-xs shadow-[0_0_20px_rgba(245,158,11,0.3)] active:scale-95"
                    >
                        {isThinking ? '...' : 'Act'}
                    </button>
                </form>
            ) : (
                <div className="flex flex-col items-center gap-6 py-6 animate-in zoom-in duration-500">
                    <div className="text-center">
                        <div className="cinzel text-red-500 text-3xl animate-pulse tracking-[0.3em] font-bold mb-2">YOUR STORY HAS ENDED</div>
                        <p className="text-neutral-500 text-xs cinzel tracking-widest">Saga Summary</p>
                    </div>

                    <div className="grid grid-cols-3 gap-8 w-full max-w-lg bg-white/5 p-6 rounded-lg border border-white/10">
                        <div className="text-center">
                            <div className="text-2xl mb-1">💀</div>
                            <div className="text-xl font-bold cinzel">{gameState.stats.enemiesDefeated}</div>
                            <div className="text-[8px] text-neutral-500 uppercase tracking-widest font-bold">Enemies Slain</div>
                        </div>
                        <div className="text-center">
                            <div className="text-2xl mb-1">💰</div>
                            <div className="text-xl font-bold cinzel">{gameState.stats.goldCollected}</div>
                            <div className="text-[8px] text-neutral-500 uppercase tracking-widest font-bold">Gold Amassed</div>
                        </div>
                        <div className="text-center">
                            <div className="text-2xl mb-1">🗺️</div>
                            <div className="text-xl font-bold cinzel">{gameState.stats.stepsTaken}</div>
                            <div className="text-[8px] text-neutral-500 uppercase tracking-widest font-bold">Steps Taken</div>
                        </div>
                    </div>

                    <button 
                        onClick={handleReset}
                        className="bg-white text-black px-12 py-3 font-bold cinzel hover:bg-neutral-200 transition-all text-xs tracking-widest active:scale-95 shadow-[0_0_30px_rgba(255,255,255,0.2)]"
                    >
                        Reincarnate
                    </button>
                </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default App;
