
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
      enemyActionUsed: { type: Type.STRING, description: "Optional name of a special ability the enemy just used." },
      enemyToSpawn: {
        type: Type.OBJECT,
        description: "An optional enemy to spawn.",
        properties: {
          name: { type: Type.STRING },
          type: { type: Type.STRING },
          health: { type: Type.NUMBER },
          maxHealth: { type: Type.NUMBER },
          attack: { type: Type.NUMBER },
          resistances: { type: Type.OBJECT, additionalProperties: { type: Type.NUMBER } },
          abilities: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                name: { type: Type.STRING },
                description: { type: Type.STRING }
              }
            }
          }
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
      },
      newStatusEffects: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            target: { type: Type.STRING, enum: ['player', 'enemy'] },
            effect: {
              type: Type.OBJECT,
              properties: {
                id: { type: Type.STRING },
                name: { type: Type.STRING },
                type: { type: Type.STRING, enum: ['buff', 'debuff'] },
                description: { type: Type.STRING },
                icon: { type: Type.STRING },
                duration: { type: Type.NUMBER },
                modifiers: {
                  type: Type.OBJECT,
                  properties: {
                    attack: { type: Type.NUMBER },
                    defense: { type: Type.NUMBER },
                    healthPerTurn: { type: Type.NUMBER }
                  }
                }
              },
              required: ['id', 'name', 'type', 'icon', 'duration']
            }
          }
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
    - Player: ${state.player.health}/${state.player.maxHealth} HP. 
    - Active Effects: ${state.player.statusEffects.map(e => `${e.name} (${e.duration} turns)`).join(', ') || 'None'}
    - Enemy: ${state.currentEnemy ? `${state.currentEnemy.name} (${state.currentEnemy.health}/${state.currentEnemy.maxHealth} HP)` : "None"}
    - Enemy Abilities: ${state.currentEnemy?.abilities?.map(a => a.name).join(', ') || 'Standard Attacks Only'}
    - Active Quests: ${state.activeQuests.map(q => q.description).join('; ')}
    
    The player attempts: "${action}".
    
    STRATEGIC COMBAT RULES:
    1. REACTIVE AI: Enemies are smart. If a player is low health, they use high-damage finishers. If a player has high defense, they use armor-piercing status effects or magic.
    2. SPECIAL MOVES: When spawning an enemy, give them 2-3 unique abilities. During combat, use 'enemyActionUsed' to specify if they used one.
    3. COUNTER-PLAY: If a player is a Mage, enemies might use 'Magic Resist' buffs. If a Rogue is dodging, they might use 'Wide Sweeps' (can't miss).
    4. NARRATIVE: Focus on the visceral impact of the combat. Adhere to the ${state.tone} tone.
    5. STATUS EFFECTS: Use them strategically. Bleeding for sustain damage, Stunned to skip player turns (by reducing their effectiveness in narrative), or Weakened to lower attack.
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-pro-preview",
      contents: prompt,
      config: {
        tools: [{ functionDeclarations: [updateGameStateTool] }],
        thinkingConfig: { thinkingBudget: 1500 }
      }
    });

    const calls = response.functionCalls;
    if (calls && calls.length > 0) {
      return calls[0].args as unknown as AIResponse;
    }

    return {
      narrative: response.text || "The enemy watches you warily, waiting for an opening.",
      statChanges: {}
    };
  } catch (error) {
    console.error("AI Error:", error);
    return {
      narrative: "A sudden chill fills the room as the enemy's presence looms darker.",
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
