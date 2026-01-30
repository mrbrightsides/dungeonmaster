
import { GoogleGenAI, Type, Modality } from "@google/genai";
import { GameState, AIResponse, ClassType, BiomeType, ToneType } from "../types";

function decode(base64: string) {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

async function decodeAudioData(
  data: Uint8Array,
  ctx: AudioContext,
  sampleRate: number,
  numChannels: number,
): Promise<AudioBuffer> {
  const dataInt16 = new Int16Array(data.buffer);
  const frameCount = dataInt16.length / numChannels;
  const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);

  for (let channel = 0; channel < numChannels; channel++) {
    const channelData = buffer.getChannelData(channel);
    for (let i = 0; i < frameCount; i++) {
      channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
    }
  }
  return buffer;
}

const ai = new GoogleGenAI({ apiKey: import.meta.env.VITE_GEMINI_API_KEY });

const updateGameStateTool = {
  name: "updateGameState",
  parameters: {
    type: Type.OBJECT,
    description: "Update the game state based on player action and narrative outcomes.",
    properties: {
      narrative: { type: Type.STRING, description: "The storytelling text describing the outcome." },
      enemyToSpawn: {
        type: Type.OBJECT,
        description: "An optional enemy to spawn.",
        properties: {
          name: { type: Type.STRING },
          type: { type: Type.STRING },
          health: { type: Type.NUMBER },
          maxHealth: { type: Type.NUMBER },
          attack: { type: Type.NUMBER },
          resistances: { type: Type.OBJECT, additionalProperties: { type: Type.NUMBER } }
        }
      },
      biomeChange: {
        type: Type.STRING,
        enum: Object.values(BiomeType)
      },
      questUpdate: {
        type: Type.OBJECT,
        properties: {
          id: { type: Type.STRING },
          progressDelta: { type: Type.NUMBER },
          isNew: { type: Type.BOOLEAN },
          newQuest: {
            type: Type.OBJECT,
            properties: {
              id: { type: Type.STRING },
              description: { type: Type.STRING },
              type: { type: Type.STRING, enum: ['Kill', 'Explore', 'Collect', 'Survive', 'Boss'] },
              target: { type: Type.NUMBER },
              rewardXp: { type: Type.NUMBER },
              rewardGold: { type: Type.NUMBER }
            }
          }
        }
      },
      itemDrop: {
        type: Type.OBJECT,
        properties: {
          id: { type: Type.STRING },
          name: { type: Type.STRING },
          rarity: { type: Type.STRING, enum: ['Common', 'Uncommon', 'Rare', 'Epic', 'Legendary'] },
          bonus: {
            type: Type.OBJECT,
            properties: {
              stat: { type: Type.STRING, enum: ['attack', 'defense', 'health'] },
              value: { type: Type.NUMBER }
            }
          }
        }
      },
      statChanges: {
        type: Type.OBJECT,
        properties: {
          health: { type: Type.NUMBER },
          xp: { type: Type.NUMBER },
          gold: { type: Type.NUMBER },
          attack: { type: Type.NUMBER },
          defense: { type: Type.NUMBER }
        }
      }
    },
    required: ["narrative"]
  }
};

export async function processPlayerAction(
  action: string,
  state: GameState
): Promise<AIResponse> {
  const prompt = `
    Roleplay as a cinematic Dungeon Master. The player is a ${state.player.class} (Level ${state.player.level}).
    Current Environment: ${state.currentBiome}
    Narrative Tone: ${state.tone}
    
    Current Vitals:
    - Player: ${state.player.health}/${state.player.maxHealth} HP, ${state.player.gold} Gold.
    - Enemy: ${state.currentEnemy ? `${state.currentEnemy.name} (${state.currentEnemy.health}/${state.currentEnemy.maxHealth} HP)` : "None"}
    - Active Quests: ${state.activeQuests.map(q => q.description).join('; ')}
    
    The player attempts: "${action}".
    
    Rules for the Dungeon Master:
    1. Narrative: Keep it to 2-3 sentences. Focus on sensory details (sounds of the ${state.currentBiome}).
    2. Tone: Adhere strictly to the chosen tone (${state.tone}). 
       - Classic: Balanced fantasy.
       - Grimdark: Visceral, dark, bloody, and high stakes.
       - Heroic: Grandiose, legendary, and inspiring.
    3. Combat: If attacking, determine if it was a critical strike. If the player is low HP, increase the tension.
    4. State Updates: Always call updateGameState if anything changes (health, gold, enemy health, XP).
    5. Progression: Occasionally drop items or change biomes when the player explores.
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-pro-preview",
      contents: prompt,
      config: {
        tools: [{ functionDeclarations: [updateGameStateTool] }],
        thinkingConfig: { thinkingBudget: 1000 }
      }
    });

    const calls = response.functionCalls;
    if (calls && calls.length > 0) {
      return calls[0].args as unknown as AIResponse;
    }

    return {
      narrative: response.text || "The winds shift, but the path forward remains unchanged.",
      statChanges: {}
    };
  } catch (error) {
    console.error("AI Error:", error);
    return {
      narrative: "A thick mist descends, obscuring your vision and confusing your senses.",
      statChanges: {}
    };
  }
}

export async function playNarrativeAudio(text: string): Promise<void> {
    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash-preview-tts",
            contents: [{ parts: [{ text: `Read with a gravelly, wise, epic dungeon master voice: ${text}` }] }],
            config: {
                responseModalities: [Modality.AUDIO],
                speechConfig: {
                    voiceConfig: {
                        prebuiltVoiceConfig: { voiceName: 'Kore' },
                    },
                },
            },
        });

        const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
        if (!base64Audio) return;

        const ctx = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
        const audioBuffer = await decodeAudioData(decode(base64Audio), ctx, 24000, 1);

        const source = ctx.createBufferSource();
        source.buffer = audioBuffer;
        source.connect(ctx.destination);
        source.start();
    } catch (e) {
        console.warn("TTS suppressed or failed", e);
    }
}
