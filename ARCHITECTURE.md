# Architecture Documentation

## System Overview

AI Dungeon Master is built as a modern web application that seamlessly integrates multiple AI services, a 2D game engine, and real-time state management to create a dynamic, narrative-driven dungeon crawler experience.

## High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                      Frontend Layer                          │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │   Next.js    │  │    Phaser    │  │    React     │      │
│  │  Routing &   │  │   Game       │  │  UI          │      │
│  │  SSR         │  │   Engine     │  │  Components  │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
└─────────────────────────────────────────────────────────────┘
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                    API Route Layer                           │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │   /gemini    │  │ /elevenlabs  │  │   /siwe      │      │
│  │  AI Narrative│  │  Voice       │  │  Web3 Auth   │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
└─────────────────────────────────────────────────────────────┘
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                   External Services                          │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │   Gemini 3   │  │  ElevenLabs  │  │   Ethereum   │      │
│  │   API        │  │  API         │  │   Network    │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
└─────────────────────────────────────────────────────────────┘
```

## Frontend Architecture

### Next.js Application Structure

```
src/
├── app/                    # Next.js 15 App Router
│   ├── page.tsx           # Landing page (/)
│   ├── game/page.tsx      # Main game interface (/game)
│   ├── layout.tsx         # Root layout with metadata
│   └── api/               # API route handlers
│       ├── gemini/        # AI narrative generation
│       ├── elevenlabs/    # Voice synthesis
│       ├── siwe/          # Web3 authentication
│       └── proxy/         # External API proxy
│
├── components/            # React components
│   ├── GameCanvas.tsx     # Phaser game integration
│   ├── NarrativePanel.tsx # Story display
│   ├── EnhancedInventory.tsx
│   ├── QuestTracker.tsx
│   ├── StatusEffectsDisplay.tsx
│   └── ui/                # shadcn/ui components
│
├── game/                  # Phaser game engine
│   ├── config.ts          # Phaser configuration
│   └── scenes/
│       └── DungeonScene.ts # Main game scene
│
├── lib/                   # Core game systems
│   ├── enemySystem.ts     # Enemy types & spawning
│   ├── combatSystem.ts    # Combat mechanics
│   ├── questSystem.ts     # Quest generation
│   ├── itemSystem.ts      # Loot & inventory
│   ├── achievementSystem.ts
│   ├── biomeSystem.ts
│   ├── particleEffects.ts
│   ├── gemini.ts          # AI client
│   └── voiceManager.ts    # Audio management
│
└── types/                 # TypeScript definitions
    ├── game.ts            # Game state types
    └── index.ts           # Shared types
```

### Component Architecture

**GameCanvas Component** (`src/components/GameCanvas.tsx`):
- Manages Phaser game instance lifecycle
- Bridges React state with Phaser game world
- Handles component mount/unmount properly to prevent memory leaks
- Emits game events back to React layer

**State Management Flow**:
```
User Action → React Handler → State Update → Phaser Props
                                    ↓
                            UI Components Re-render
                                    ↓
                            Phaser Scene Updates
```

### Phaser Integration

**DungeonScene** (`src/game/scenes/DungeonScene.ts`):
- Main game scene handling rendering, physics, and input
- Player character with animations and movement
- Enemy spawning and AI behavior
- Particle effects for combat and environmental feedback
- Camera following and minimap rendering
- Collision detection and combat resolution

**Phaser-React Bridge**:
```typescript
// React component initializes Phaser
useEffect(() => {
  const game = new Phaser.Game(config);
  return () => game.destroy(true);
}, []);

// React passes state to Phaser via events
phaserGame.events.emit('playerMove', { x, y });

// Phaser emits events back to React
scene.events.on('enemyDefeated', (enemy) => {
  updateGameState({ enemiesDefeated: count + 1 });
});
```

## Backend Architecture

### API Route Handlers

**Gemini AI Route** (`src/app/api/gemini/route.ts`):
- Receives player action and full game state
- Constructs prompt with context (biome, enemies, quests, inventory)
- Uses function calling to get structured responses
- Streams text responses for real-time narrative delivery
- Handles errors with fallback responses

**Request Flow**:
```
Client → POST /api/gemini
  Body: {
    action: string,
    gameState: GameState,
    context: string
  }
     ↓
Gemini 3 API (gemini-2.0-flash-exp)
  - Function calling enabled
  - Temperature: 0.9 for creativity
  - Max tokens: 2048
     ↓
Response: {
  narrative: string,
  gameStateChanges: {
    enemyToSpawn?: EnemyType,
    biomeChange?: BiomeType,
    questUpdate?: QuestProgress,
    itemDrop?: Item
  }
}
     ↓
Client receives structured response
```

**ElevenLabs Voice Route** (`src/app/api/elevenlabs/route.ts`):
- Receives narrative text
- Streams audio data from ElevenLabs API
- Uses "Adam" voice model for dungeon master narration
- Returns audio stream to client

**SIWE Authentication Route** (`src/app/api/siwe/route.ts`):
- Handles Web3 wallet authentication
- Verifies signature using SIWE standard
- Creates session for authenticated users
- Optional feature - game works without Web3

### Proxy Route

**System Proxy** (`src/app/api/proxy/route.ts`):
- Reserved infrastructure for CORS handling
- Supports JSON and multipart/form-data
- Required fields: protocol, origin, path, method, headers, body
- **Note**: This is system infrastructure - custom API calls should use dedicated routes

## Data Flow

### Game Loop Data Flow

```
1. Player takes action
   └─> ActionInput component captures input
   
2. Action sent to AI
   └─> POST /api/gemini with action + game state
   
3. AI processes and responds
   └─> Gemini 3 returns narrative + state changes
   
4. State updates
   └─> React state updated with new values
   └─> Phaser scene receives updated props
   └─> UI components re-render
   
5. Voice narration (parallel)
   └─> POST /api/elevenlabs with narrative text
   └─> Audio stream plays via VoiceManager
   
6. Visual feedback
   └─> Particle effects trigger
   └─> Enemy spawns/despawns
   └─> Quest progress updates
   └─> Achievement notifications
```

### Combat System Data Flow

```
Player attacks enemy
   ↓
CombatSystem.calculateDamage()
   ├─> Check for critical hit (class-based chance)
   ├─> Apply damage type modifiers
   ├─> Calculate resistance/weakness
   ├─> Apply status effects
   └─> Return damage result
   ↓
Update game state
   ├─> Reduce enemy health
   ├─> Apply status effect duration
   ├─> Check for enemy defeat
   └─> Award XP/gold/items
   ↓
Visual feedback
   ├─> Particle effects (blood, ice, fire)
   ├─> Damage numbers
   ├─> Status effect icons
   └─> Achievement popup (if milestone reached)
```

## State Management

### Game State Structure

```typescript
interface GameState {
  // Player stats
  health: number;
  maxHealth: number;
  level: number;
  experience: number;
  gold: number;
  
  // Combat modifiers
  damageBonus: number;
  defenseBonus: number;
  
  // Character
  class: 'warrior' | 'mage' | 'rogue';
  
  // Progress
  enemiesDefeated: number;
  achievements: Achievement[];
  
  // World state
  currentBiome: BiomeType;
  
  // Systems
  inventory: Item[];
  activeQuests: Quest[];
  activeEffects: StatusEffect[];
}
```

### State Update Pattern

```typescript
// Centralized state in React
const [gameState, setGameState] = useState<GameState>(initialState);

// Immutable updates
const updateHealth = (damage: number) => {
  setGameState(prev => ({
    ...prev,
    health: Math.max(0, prev.health - damage)
  }));
};

// Batch updates for efficiency
const handleCombatResult = (result: CombatResult) => {
  setGameState(prev => ({
    ...prev,
    health: prev.health - result.damage,
    experience: prev.experience + result.xp,
    gold: prev.gold + result.gold,
    inventory: [...prev.inventory, ...result.items]
  }));
};
```

## AI Integration

### Gemini 3 Function Calling

**Function Definition**:
```typescript
const functions = [{
  name: "updateGameState",
  description: "Update the game state based on player action",
  parameters: {
    type: "object",
    properties: {
      narrative: {
        type: "string",
        description: "Narrative response to player action"
      },
      enemyToSpawn: {
        type: "string",
        enum: ["goblin", "skeleton", "orc", "spider", "ghost", 
               "dragon", "mimic", "golem", "vampire", "demon"]
      },
      biomeChange: {
        type: "string",
        enum: ["forest", "cave", "volcano", "ice", "ruins"]
      },
      questUpdate: {
        type: "object",
        properties: {
          questId: { type: "string" },
          progress: { type: "number" }
        }
      },
      itemDrop: {
        type: "object",
        properties: {
          name: { type: "string" },
          rarity: { type: "string" },
          type: { type: "string" }
        }
      }
    },
    required: ["narrative"]
  }
}];
```

**AI Context Management**:
- Full game state sent with each request
- Current biome influences narrative tone
- Enemy types match environment
- Quest objectives integrated into storytelling
- Token optimization: keep context under 1500 tokens

### Prompt Engineering

**System Prompt Structure**:
```
You are an expert dungeon master running a 2D dungeon crawler.
Current environment: {biome}
Player class: {class}, Level {level}
Active quests: {quests}
Recent narrative: {lastNarrative}

Generate a response to the player's action that:
1. Advances the story meaningfully
2. Spawns appropriate enemies for the biome
3. Updates quest progress if relevant
4. Drops loot based on action success
5. Maintains narrative consistency
```

## Performance Optimizations

### Bundle Optimization
- Next.js code splitting by route
- Dynamic imports for heavy components
- Phaser loaded only on /game route
- Tree-shaking unused UI components

### Game Engine Performance
- Object pooling for particles (max 100 instances)
- Sprite atlas for all game assets
- Efficient collision detection (spatial hashing)
- Frame rate targeting (60 FPS)
- Memory management (destroy unused objects)

### API Optimization
- Streaming responses for real-time feel
- Request debouncing (prevent spam)
- Token usage optimization (context trimming)
- Parallel API calls (voice + narrative)
- Graceful degradation (fallbacks for failures)

## Security Considerations

### API Key Protection
- All external API calls through Next.js API routes
- Keys stored server-side only
- Client never sees sensitive credentials
- Rate limiting on API routes

### Web3 Security
- SIWE standard for wallet authentication
- Signature verification server-side
- Session-based authentication
- No private key handling

### Input Validation
- Sanitize user input before AI processing
- Type checking on all API parameters
- CORS protection
- Rate limiting per IP

## Deployment Architecture

### Vercel Platform
- Automatic deployments from Git
- Edge functions for API routes
- CDN for static assets
- Environment variable management

### Production Configuration
```
# Environment Variables
GEMINI_API_KEY=<key>
ELEVENLABS_API_KEY=<key>
NEXT_PUBLIC_APP_URL=https://dungeonmaster-ai.vercel.app/

# Build Configuration
Node.js: 20.x
Package Manager: pnpm
Build Command: pnpm build
Output Directory: .next
```

### Monitoring & Logging
- Error tracking with console logging
- API response time monitoring
- User action analytics
- Achievement unlock tracking

## Scalability

### Horizontal Scaling
- Stateless API routes (easy to replicate)
- Client-side game state (no server DB)
- CDN for static assets
- Serverless functions auto-scale

### Future Database Integration
- Player progress persistence
- Leaderboards and rankings
- Cross-device save sync
- Social features (multiplayer)

## Testing Strategy

### Component Testing
- React component unit tests
- Phaser scene integration tests
- Game system logic tests (combat, quests, items)

### API Testing
- Mock AI responses for consistent tests
- Error handling verification
- Rate limit testing
- Authentication flow tests

### End-to-End Testing
- Full game loop testing
- Multi-action narrative flow
- Combat scenarios
- Quest completion paths

## Development Workflow

### Local Development
```bash
# Install dependencies
pnpm install

# Run development server
pnpm dev

# Access at localhost:3000
```

### Code Quality
- TypeScript strict mode enabled
- ESLint for code standards
- Prettier for formatting
- Git hooks for pre-commit checks

---

## Architecture Highlights

✅ **Separation of Concerns**: Clear boundaries between UI, game logic, and AI services
✅ **Type Safety**: Comprehensive TypeScript interfaces across all layers
✅ **Scalable Design**: Stateless architecture ready for horizontal scaling
✅ **Performance First**: Optimizations at every layer (bundling, rendering, API)
✅ **Error Resilience**: Graceful degradation and fallback mechanisms
✅ **Developer Experience**: Clear structure, comprehensive types, well-documented

---

**For questions or technical support:**
- Email: support@elpeef.com
- Telegram: https://t.me/khudriakhmad
- Discord: @khudri_61362

**Repository:** https://github.com/mrbrightsides/dungeonmaster
**Live Demo:** https://dungeonmaster-ai.vercel.app/
