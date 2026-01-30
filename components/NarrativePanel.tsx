
import React, { useEffect, useRef, useState } from 'react';

interface NarrativePanelProps {
  logs: string[];
  isThinking: boolean;
  onNarrativeComplete?: (text: string) => void;
}

const NarrativePanel: React.FC<NarrativePanelProps> = ({ logs, isThinking, onNarrativeComplete }) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [displayedText, setDisplayedText] = useState('');
  const [typingIndex, setTypingIndex] = useState(-1);
  
  const lastLog = logs[logs.length - 1];
  const isDM = lastLog && !lastLog.startsWith(">");

  // Auto-scroll whenever logs or typing updates
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [logs, isThinking, displayedText]);

  // Handle Typewriter Effect for the newest DM log
  useEffect(() => {
    if (isDM && typingIndex !== logs.length - 1) {
      setTypingIndex(logs.length - 1);
      setDisplayedText('');
      
      let charIndex = 0;
      const interval = setInterval(() => {
        setDisplayedText(lastLog.substring(0, charIndex + 1));
        charIndex++;
        
        if (charIndex >= lastLog.length) {
          clearInterval(interval);
          // Trigger audio only after typing finishes
          if (onNarrativeComplete) {
            onNarrativeComplete(lastLog);
          }
        }
      }, 25); // Typing speed: 25ms per character

      return () => clearInterval(interval);
    } else if (!isDM) {
      setTypingIndex(-1);
      setDisplayedText('');
    }
  }, [logs.length, isDM, lastLog, onNarrativeComplete]);

  return (
    <div className="flex-1 bg-neutral-900 border-x-4 border-black p-4 flex flex-col min-h-0 overflow-hidden">
      <h3 className="cinzel text-neutral-500 text-xs mb-4 uppercase tracking-widest border-b border-neutral-800 pb-2">
        Dungeon Log
      </h3>
      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto custom-scrollbar space-y-4 pr-2"
      >
        {logs.map((log, i) => {
            const isUser = log.startsWith(">");
            const isCurrentlyTyping = i === typingIndex;
            
            // If it's the message currently being typed, show the partial text
            const content = isCurrentlyTyping ? displayedText : log;

            return (
                <div 
                    key={i} 
                    className={`text-sm md:text-base leading-relaxed animate-in slide-in-from-bottom-2 duration-300 ${
                        isUser ? 'text-blue-400 font-bold italic pl-2 border-l-2 border-blue-900' : 'text-neutral-200'
                    }`}
                >
                    {content}
                    {isCurrentlyTyping && (
                        <span className="inline-block w-1.5 h-4 bg-blue-500 ml-1 animate-pulse align-middle"></span>
                    )}
                </div>
            )
        })}
        {isThinking && (
          <div className="text-neutral-500 text-sm italic animate-pulse flex items-center gap-2">
            <span className="w-2 h-2 bg-neutral-600 rounded-full"></span>
            The Dungeon Master is thinking...
          </div>
        )}
      </div>
    </div>
  );
};

export default NarrativePanel;
