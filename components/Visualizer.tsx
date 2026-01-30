
import React, { useMemo, useEffect, useRef, useState } from 'react';
import { GameState, BiomeType } from '../types';
import { BIOME_THEMES, Icons } from '../constants';

interface DamagePop {
  id: number;
  value: number;
  x: string;
  y: string;
  isPlayer: boolean;
}

interface VisualizerProps {
  state: GameState;
}

const Visualizer: React.FC<VisualizerProps> = ({ state }) => {
  const theme = BIOME_THEMES[state.currentBiome] || BIOME_THEMES.Forest;
  const [enemyAnimClass, setEnemyAnimClass] = useState('');
  const [containerAnimClass, setContainerAnimClass] = useState('');
  const [showHitEffect, setShowHitEffect] = useState(false);
  const [hitRotation, setHitRotation] = useState(0);
  const [damagePops, setDamagePops] = useState<DamagePop[]>([]);
  
  const prevEnemyHealth = useRef<number | undefined>(state.currentEnemy?.health);
  const prevPlayerHealth = useRef<number>(state.player.health);

  const addDamagePop = (value: number, isPlayer: boolean) => {
    const id = Date.now() + Math.random();
    const x = isPlayer ? '25%' : '75%';
    const y = '40%';
    setDamagePops(prev => [...prev, { id, value, x, y, isPlayer }]);
    setTimeout(() => {
      setDamagePops(prev => prev.filter(p => p.id !== id));
    }, 1000);
  };

  useEffect(() => {
    // Check if enemy took damage
    if (state.currentEnemy) {
      if (prevEnemyHealth.current !== undefined && state.currentEnemy.health < prevEnemyHealth.current) {
        const damage = prevEnemyHealth.current - state.currentEnemy.health;
        addDamagePop(damage, false);
        setEnemyAnimClass('animate-enemy-hurt');
        setTimeout(() => setEnemyAnimClass(''), 500);
      }
      prevEnemyHealth.current = state.currentEnemy.health;
    } else {
      prevEnemyHealth.current = undefined;
    }

    // Check if player took damage
    if (state.player.health < prevPlayerHealth.current) {
      const damage = prevPlayerHealth.current - state.player.health;
      addDamagePop(damage, true);
      
      setEnemyAnimClass('animate-enemy-attack');
      setContainerAnimClass('animate-screen-shake');
      setHitRotation(Math.random() * 360);
      setShowHitEffect(true);
      
      setTimeout(() => {
        setEnemyAnimClass('');
        setContainerAnimClass('');
        setShowHitEffect(false);
      }, 500);
    }
    prevPlayerHealth.current = state.player.health;
  }, [state.currentEnemy?.health, state.player.health]);

  const particles = useMemo(() => {
    return Array.from({ length: 30 }).map((_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 4 + 2,
      duration: Math.random() * 5 + 5,
      delay: Math.random() * -10,
      opacity: Math.random() * 0.5 + 0.2
    }));
  }, [state.currentBiome]);

  return (
    <div className={`relative w-full h-64 md:h-96 rounded-t-lg overflow-hidden ${theme.bg} transition-all duration-1000 border-b-4 border-black group ${containerAnimClass}`}>
      <div className="scanlines"></div>
      
      {/* Visual concussive/chromatic effect when hit */}
      <div className={`absolute inset-0 pointer-events-none transition-all duration-300 ${containerAnimClass ? 'opacity-100 backdrop-invert-[0.1] contrast-[1.4] brightness-[1.2] shadow-[inset_0_0_50px_rgba(245,158,11,0.4)]' : 'opacity-0'}`} />
      
      <div className={`absolute inset-0 bg-orange-600/10 pointer-events-none transition-opacity duration-300 ${containerAnimClass ? 'opacity-100' : 'opacity-0'}`} />

      {/* Environmental Weather Overlay */}
      <div className="absolute inset-0 pointer-events-none z-10 overflow-hidden">
        {particles.map((p) => (
          <div
            key={p.id}
            className={`absolute rounded-full bg-white shadow-[0_0_8px_white]`}
            style={{
              left: `${p.x}%`,
              top: `${p.y}%`,
              width: `${p.size}px`,
              height: `${p.size}px`,
              opacity: p.opacity,
              animation: `weather-float-${theme.effect} ${p.duration}s infinite linear`,
              animationDelay: `${p.delay}s`
            }}
          />
        ))}
      </div>

      {/* Floating Damage Numbers */}
      {damagePops.map((pop) => (
        <div
          key={pop.id}
          className={`absolute z-50 pointer-events-none font-bold cinzel animate-damage-pop ${pop.isPlayer ? 'text-orange-500 drop-shadow-[0_0_10px_rgba(245,158,11,0.8)] text-3xl' : 'text-white drop-shadow-[0_0_10px_rgba(255,255,255,0.8)] text-4xl'}`}
          style={{ left: pop.x, top: pop.y, transform: 'translateX(-50%)' }}
        >
          -{pop.value}
        </div>
      ))}

      <svg className="absolute inset-0 w-full h-full opacity-30" viewBox="0 0 100 100" preserveAspectRatio="none">
        {state.currentBiome === BiomeType.FOREST && <path d="M0 100 L15 40 L30 100 L45 30 L60 100 L75 50 L100 100 Z" fill="#064e3b" />}
        {state.currentBiome === BiomeType.VOLCANO && <path d="M0 100 L25 10 L50 100 L75 20 L100 100 Z" fill="#7f1d1d" />}
        {state.currentBiome === BiomeType.ICE && <path d="M0 100 L33 20 L66 100 L100 40 L100 100 Z" fill="#164e63" />}
      </svg>

      {/* Player */}
      <div className="absolute left-1/4 bottom-10 transform -translate-x-1/2 flex flex-col items-center z-20">
        <div className="relative">
          <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-amber-700 rounded-lg border-2 border-amber-300 shadow-[0_0_20px_rgba(245,158,11,0.5)] animate-bounce flex items-center justify-center text-3xl">
            <Icons.ClassIcon className={state.player.class} />
          </div>
          {showHitEffect && (
            <div className="absolute inset-0 -m-8 z-30 pointer-events-none flex items-center justify-center" style={{ transform: `rotate(${hitRotation}deg)` }}>
              <svg className="w-24 h-24 text-red-500 animate-ping" viewBox="0 0 100 100">
                <path d="M10 10 L90 90 M90 10 L10 90" stroke="currentColor" strokeWidth="12" strokeLinecap="round" />
              </svg>
              <svg className="absolute w-20 h-20 text-orange-500 animate-slash-bright" viewBox="0 0 100 100">
                <path d="M20 20 L80 80 M80 20 L20 80" stroke="currentColor" strokeWidth="12" strokeLinecap="round" />
              </svg>
            </div>
          )}
        </div>
        <div className="mt-2 text-[10px] font-bold bg-black/80 px-2 py-0.5 rounded text-orange-300 border border-orange-500/50 uppercase tracking-widest shadow-lg">
          {state.player.class} Lv.{state.player.level}
        </div>
      </div>

      {/* Enemy */}
      {state.currentEnemy && (
        <div className={`absolute right-1/4 bottom-10 transform translate-x-1/2 flex flex-col items-center z-20 transition-all duration-500 ${enemyAnimClass}`}>
           <div className="w-20 h-20 bg-gradient-to-tr from-red-900 to-red-600 rounded-xl border-2 border-red-400 shadow-[0_0_30px_rgba(220,38,38,0.6)] flex items-center justify-center text-5xl animate-pulse">
                <Icons.EnemyIcon type={state.currentEnemy.type} />
           </div>
           <div className="mt-3 text-[10px] font-bold bg-black/80 px-3 py-1 rounded text-red-400 border border-red-600/50 uppercase tracking-widest shadow-xl">
             {state.currentEnemy.name}
           </div>
           <div className="w-32 h-1.5 bg-neutral-900 mt-2 rounded-full border border-white/10 overflow-hidden">
                <div 
                    className="h-full bg-gradient-to-r from-red-600 to-orange-400 transition-all duration-500" 
                    style={{ width: `${(state.currentEnemy.health / state.currentEnemy.maxHealth) * 100}%` }}
                />
           </div>
        </div>
      )}

      <div className="absolute top-4 left-4 z-30">
        <div className={`px-4 py-1.5 rounded-full bg-black/60 backdrop-blur-sm border border-orange-500/30 text-xs font-bold flex items-center gap-2 text-orange-500 shadow-2xl`}>
          <div className="w-1.5 h-1.5 rounded-full bg-current animate-ping"></div>
          {state.currentBiome.toUpperCase()}
        </div>
      </div>

      <style>{`
        @keyframes weather-float-leaves {
          0% { transform: translateY(-20px) translateX(0) rotate(0deg); opacity: 0; }
          10% { opacity: 0.6; }
          90% { opacity: 0.6; }
          100% { transform: translateY(400px) translateX(100px) rotate(360deg); opacity: 0; }
        }
        @keyframes weather-float-embers {
          0% { transform: translateY(400px) translateX(0); opacity: 0; }
          50% { opacity: 0.8; }
          100% { transform: translateY(-100px) translateX(50px); opacity: 0; }
        }
        @keyframes weather-float-snow {
          0% { transform: translateY(-50px) translateX(0); opacity: 0; }
          10% { opacity: 0.8; }
          100% { transform: translateY(400px) translateX(20px); opacity: 0; }
        }
        @keyframes weather-float-dust {
          0% { transform: translate(0, 0); opacity: 0; }
          50% { opacity: 0.3; }
          100% { transform: translate(100px, 100px); opacity: 0; }
        }
        @keyframes weather-float-glint {
          0%, 100% { opacity: 0; transform: scale(0.5); }
          50% { opacity: 1; transform: scale(1); }
        }

        @keyframes damage-pop {
          0% { transform: translateY(0) translateX(-50%) scale(0.5); opacity: 0; }
          20% { transform: translateY(-20px) translateX(-50%) scale(1.2); opacity: 1; }
          100% { transform: translateY(-60px) translateX(-50%) scale(1); opacity: 0; }
        }
        .animate-damage-pop {
          animation: damage-pop 0.8s ease-out forwards;
        }

        @keyframes slash-bright {
          0% { opacity: 0; transform: scale(0.5) rotate(-10deg); filter: brightness(3); }
          20% { opacity: 1; transform: scale(1.1) rotate(0deg); filter: brightness(2); }
          100% { opacity: 0; transform: scale(1.3) rotate(10deg); filter: brightness(1); }
        }
        .animate-slash-bright {
          animation: slash-bright 0.3s ease-out forwards;
        }

        .animate-enemy-attack {
          animation: enemy-lunge 0.4s cubic-bezier(0.17, 0.67, 0.83, 0.67);
          z-index: 40;
        }
        .animate-enemy-hurt {
          animation: enemy-shake 0.4s ease-in-out;
        }
        .animate-screen-shake {
          animation: screen-shake 0.3s cubic-bezier(.36,.07,.19,.97) both;
        }
        @keyframes enemy-lunge {
          0% { transform: translate(50%, 0) scale(1); }
          30% { transform: translate(-100%, -40px) scale(1.4); }
          100% { transform: translate(50%, 0) scale(1); }
        }
        @keyframes enemy-shake {
          0%, 100% { transform: translate(50%, 0); filter: brightness(1); }
          20% { transform: translate(55%, 5px); filter: brightness(2) drop-shadow(0 0 10px red); }
          40% { transform: translate(45%, -5px); }
          60% { transform: translate(55%, 5px); }
        }
        @keyframes screen-shake {
          10%, 90% { transform: translate3d(-1px, 0, 0); }
          20%, 80% { transform: translate3d(2px, 0, 0); }
          30%, 50%, 70% { transform: translate3d(-4px, 0, 0); }
          40%, 60% { transform: translate3d(4px, 0, 0); }
        }
      `}</style>
    </div>
  );
};

export default Visualizer;
