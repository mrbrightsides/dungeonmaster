
import React from 'react';

interface LandingPageProps {
  onStart: () => void;
}

const LandingPage: React.FC<LandingPageProps> = ({ onStart }) => {
  return (
    <div className="min-h-screen bg-[#050505] text-white selection:bg-orange-500/30 overflow-x-hidden">
      {/* Background Ambience */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-orange-900/10 rounded-full blur-[120px] animate-pulse"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-amber-900/10 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: '2s' }}></div>
      </div>

      {/* Hero Section */}
      <section className="relative h-screen flex flex-col items-center justify-center p-6 text-center">
        <div className="absolute inset-0 z-0 opacity-40">
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/asfalt-dark.png')] opacity-20"></div>
          <div className="w-full h-full bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-orange-900/20 via-transparent to-transparent"></div>
        </div>

        <div className="relative z-10 max-w-4xl mx-auto space-y-8 animate-in fade-in zoom-in-95 duration-1000">
          <h1 className="cinzel text-6xl md:text-9xl tracking-tighter bg-clip-text text-transparent bg-gradient-to-b from-white via-orange-200 to-amber-600 drop-shadow-[0_0_30px_rgba(251,191,36,0.2)]">
            AI DUNGEON MASTER
          </h1>
          
          <div className="flex items-center justify-center gap-4">
            <div className="h-px w-12 bg-gradient-to-r from-transparent to-orange-500"></div>
            <p className="cinzel text-sm md:text-lg text-orange-400 tracking-[0.4em] uppercase font-bold">
              Infinite Realms Await
            </p>
            <div className="h-px w-12 bg-gradient-to-l from-transparent to-orange-500"></div>
          </div>

          <p className="text-neutral-400 text-lg md:text-xl max-w-2xl mx-auto font-light leading-relaxed px-4">
            Experience the next evolution of roleplaying. Every monster, every plot twist, and every cinematic description is generated in real-time by the power of <span className="text-orange-500 font-bold">Gemini 3</span>.
          </p>

          <div className="pt-8">
            <button 
              onClick={onStart}
              className="group relative px-12 py-5 bg-gradient-to-br from-orange-600 to-amber-700 rounded-full font-bold cinzel text-lg tracking-widest overflow-hidden transition-all hover:scale-105 active:scale-95 shadow-[0_0_40px_rgba(245,158,11,0.3)] hover:shadow-[0_0_60px_rgba(245,158,11,0.5)]"
            >
              <span className="relative z-10">Start Your Saga</span>
              <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-500"></div>
            </button>
          </div>
        </div>

        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 animate-bounce">
          <svg className="w-6 h-6 text-neutral-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 14l-7 7m0 0l-7-7m7 7V3" />
          </svg>
        </div>
      </section>

      {/* Features Grid */}
      <section className="relative z-10 max-w-6xl mx-auto px-6 py-24">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            {
              title: "Infinite Narrative",
              icon: "📜",
              desc: "No scripts. No boundaries. Gemini 3 crafts a living, breathing world that responds to your every word."
            },
            {
              title: "Cinematic Audio",
              icon: "🎙️",
              desc: "Fully voiced by an AI Dungeon Master. Hear the tension in every gravelly whisper and epic proclamation."
            },
            {
              title: "Dynamic World",
              icon: "⚔️",
              desc: "Function-calling mechanics track your loot, XP, and health with the precision of a tabletop expert."
            }
          ].map((feature, i) => (
            <div 
              key={i}
              className="group p-8 bg-neutral-900/40 backdrop-blur-xl border border-white/5 rounded-3xl hover:border-orange-500/50 transition-all duration-500 hover:-translate-y-2"
            >
              <div className="text-5xl mb-6 grayscale group-hover:grayscale-0 transition-all duration-500 transform group-hover:scale-110">
                {feature.icon}
              </div>
              <h3 className="cinzel text-xl text-white mb-4 group-hover:text-orange-400 transition-colors">
                {feature.title}
              </h3>
              <p className="text-neutral-500 text-sm leading-relaxed group-hover:text-neutral-300 transition-colors">
                {feature.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Technical Banner */}
      <section className="relative z-10 py-24 border-y border-white/5 bg-neutral-900/20">
        <div className="max-w-4xl mx-auto text-center px-6">
          <h2 className="cinzel text-2xl md:text-3xl text-neutral-400 mb-8">
            Powered by the <span className="text-white">Gemini 3 Pro Preview</span>
          </h2>
          <p className="text-neutral-500 text-sm max-w-xl mx-auto">
            Leveraging a massive thinking budget to maintain long-term story coherence and complex game state logic in a single, unified context window.
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-16 flex flex-col items-center gap-6 text-center">
        <div className="flex items-center gap-6">
          <a 
            href="https://github.com/mrbrightsides" 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-neutral-600 hover:text-orange-500 transition-colors transform hover:scale-110"
            title="GitHub Profile"
          >
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"/>
            </svg>
          </a>
          <a 
            href="https://rantai.elpeef.com" 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-neutral-600 hover:text-orange-500 transition-colors transform hover:scale-110"
            title="Personal Website"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
            </svg>
          </a>
        </div>
        <div className="text-neutral-700 text-[10px] uppercase tracking-[0.3em] cinzel">
          &copy; 2026 AI Dungeon Master Engine &bull; Forge Your Path
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
