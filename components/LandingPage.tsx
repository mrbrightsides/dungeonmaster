import React from 'react';

interface LandingPageProps {
  onStart: () => void;
  onContinue?: () => void;
  hasSave?: boolean;
}

const LandingPage: React.FC<LandingPageProps> = ({ onStart, onContinue, hasSave }) => {
  return (
    <div className="min-h-screen bg-[#050505] text-white selection:bg-orange-500/30 overflow-x-hidden font-sans">
      {/* Background Ambience */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-orange-900/10 rounded-full blur-[120px] animate-pulse"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-amber-900/10 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: '2s' }}></div>
      </div>

      {/* Hero Section */}
      <section className="relative h-screen flex flex-col items-center justify-center p-6 text-center overflow-hidden">
        <div className="absolute inset-0 z-0 opacity-30">
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/asfalt-dark.png')] opacity-20"></div>
          <div className="w-full h-full bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-orange-900/30 via-transparent to-transparent"></div>
        </div>

        <div className="relative z-10 max-w-5xl mx-auto space-y-12 animate-hero-entrance">
          <div className="space-y-4">
            <h1 className="cinzel text-5xl md:text-8xl lg:text-9xl tracking-tighter leading-none bg-clip-text text-transparent bg-gradient-to-b from-white via-orange-100 to-amber-600 drop-shadow-[0_0_35px_rgba(251,191,36,0.3)] select-none">
              AI DUNGEON MASTER
            </h1>
            
            <div className="flex items-center justify-center gap-6">
              <div className="h-px w-8 md:w-24 bg-gradient-to-r from-transparent to-orange-500"></div>
              <p className="cinzel text-[10px] md:text-sm text-orange-400 tracking-[0.5em] uppercase font-bold whitespace-nowrap">
                Infinite Realms Await
              </p>
              <div className="h-px w-8 md:w-24 bg-gradient-to-l from-transparent to-orange-500"></div>
            </div>
          </div>

          <p className="text-neutral-400 text-base md:text-xl max-w-3xl mx-auto font-light leading-relaxed px-4 md:px-0 opacity-80">
            Experience the next evolution of roleplaying. Every monster, plot twist, and cinematic description is generated in real-time by <span className="text-orange-500 font-bold border-b border-orange-500/20">Gemini 3</span>.
          </p>

          <div className="pt-8 flex flex-col items-center gap-6">
            <div className="flex flex-col md:flex-row items-center gap-4">
              <button 
                onClick={onStart}
                className="group relative px-10 md:px-16 py-4 md:py-6 bg-gradient-to-br from-orange-600 to-amber-700 rounded-full font-bold cinzel text-base md:text-xl tracking-[0.2em] overflow-hidden transition-all hover:scale-105 active:scale-95 shadow-[0_0_50px_rgba(245,158,11,0.25)] hover:shadow-[0_0_70px_rgba(245,158,11,0.4)]"
              >
                <span className="relative z-10 uppercase">New Saga</span>
                <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-500"></div>
              </button>

              {hasSave && onContinue && (
                <button 
                  onClick={onContinue}
                  className="group relative px-10 md:px-16 py-4 md:py-6 bg-neutral-900 border border-orange-500/30 text-orange-400 rounded-full font-bold cinzel text-base md:text-xl tracking-[0.2em] overflow-hidden transition-all hover:scale-105 active:scale-95 shadow-xl hover:border-orange-500/60"
                >
                  <span className="relative z-10 uppercase">Continue Journey</span>
                  <div className="absolute inset-0 bg-orange-500/5 translate-y-full group-hover:translate-y-0 transition-transform duration-500"></div>
                </button>
              )}
            </div>
            <span className="text-[10px] text-neutral-600 uppercase tracking-widest cinzel font-bold">Progress is automatically saved</span>
          </div>
        </div>

        <div className="absolute bottom-12 left-1/2 -translate-x-1/2 animate-bounce opacity-40">
          <svg className="w-5 h-5 text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 14l-7 7m0 0l-7-7m7 7V3" />
          </svg>
        </div>
      </section>

      {/* Features Grid */}
      <section className="relative z-10 max-w-7xl mx-auto px-6 py-24 md:py-32">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12">
          {[
            {
              title: "Infinite Narrative",
              icon: "📜",
              desc: "Traditional scripts are dead. Gemini 3 crafts a living world that remembers your choices and evolves with every step."
            },
            {
              title: "Cinematic Voice",
              icon: "🎙️",
              desc: "A fully voiced Dungeon Master experience. Hear the gravitas of the lore with cinematic text-to-speech narration."
            },
            {
              title: "Dynamic World",
              icon: "⚔️",
              desc: "Deep mechanics including loot rarities, XP progression, and status tracking—all managed by advanced AI logic."
            }
          ].map((feature, i) => (
            <div 
              key={i}
              className="group p-10 bg-neutral-900/30 backdrop-blur-2xl border border-white/5 rounded-[2rem] hover:border-orange-500/40 transition-all duration-700 hover:-translate-y-3 shadow-2xl"
            >
              <div className="text-6xl mb-8 grayscale group-hover:grayscale-0 transition-all duration-700 transform group-hover:scale-110">
                {feature.icon}
              </div>
              <h3 className="cinzel text-xl md:text-2xl text-white mb-4 group-hover:text-orange-400 transition-colors tracking-wide">
                {feature.title}
              </h3>
              <p className="text-neutral-500 text-sm md:text-base leading-relaxed group-hover:text-neutral-300 transition-colors font-light">
                {feature.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 pt-24 pb-16 flex flex-col items-center gap-8 text-center border-t border-white/5 bg-gradient-to-t from-black to-transparent">
        <div className="flex items-center gap-10">
          <a 
            href="https://github.com/mrbrightsides" 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-neutral-600 hover:text-white transition-all transform hover:scale-125"
            title="GitHub Profile"
          >
            <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"/>
            </svg>
          </a>
          <a 
            href="https://rantai.elpeef.com" 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-neutral-600 hover:text-orange-500 transition-all transform hover:scale-125"
            title="Personal Website"
          >
            <svg className="w-8 h-8" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
            </svg>
          </a>
        </div>
        <div className="space-y-2">
          <div className="text-neutral-500 text-[10px] md:text-xs uppercase tracking-[0.4em] cinzel font-bold">
            &copy; 2026 AI Dungeon Master Engine
          </div>
          <div className="text-neutral-700 text-[9px] uppercase tracking-[0.2em] font-medium">
            Procedurally Forge Your Own Path
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
