# Contributing to AI Dungeon Master

Thank you for your interest in contributing to AI Dungeon Master! This document provides guidelines and instructions for contributing to the project.

## Code of Conduct

### Our Pledge

We are committed to providing a welcoming and inclusive experience for everyone. We expect all contributors to:

- Use welcoming and inclusive language
- Be respectful of differing viewpoints and experiences
- Gracefully accept constructive criticism
- Focus on what is best for the community
- Show empathy towards other community members

### Unacceptable Behavior

- Harassment, trolling, or discriminatory comments
- Publishing others' private information without permission
- Any conduct which could reasonably be considered inappropriate

## How to Contribute

### Reporting Bugs

If you find a bug, please open an issue with:

1. **Clear title** describing the bug
2. **Steps to reproduce** the issue
3. **Expected behavior** vs actual behavior
4. **Screenshots** if applicable
5. **Environment details** (browser, OS, Node version)

**Example:**
```
Title: Combat damage calculation incorrect for Ice enemies

Steps:
1. Start game as Mage
2. Encounter Ice Golem in Ice biome
3. Cast fire spell
4. Observe damage dealt

Expected: 2x damage due to weakness
Actual: Normal damage dealt

Environment: Chrome 120, macOS 14, Node 20.10
```

### Suggesting Enhancements

We welcome feature suggestions! Please open an issue with:

1. **Clear description** of the enhancement
2. **Use case** - why is this useful?
3. **Proposed implementation** (if you have ideas)
4. **Alternative solutions** you've considered

### Pull Requests

#### Before You Start

1. **Check existing issues** - someone might already be working on it
2. **Open an issue** to discuss major changes before coding
3. **Fork the repository** and create a feature branch
4. **Keep changes focused** - one feature/fix per PR

#### Development Workflow

1. **Clone your fork**:
   ```bash
   git clone https://github.com/YOUR_USERNAME/dungeonmaster.git
   cd dungeonmaster
   ```

2. **Create a feature branch**:
   ```bash
   git checkout -b feature/your-feature-name
   # or
   git checkout -b fix/bug-description
   ```

3. **Install dependencies**:
   ```bash
   pnpm install
   ```

4. **Make your changes**:
   - Follow coding standards (see below)
   - Write clear commit messages
   - Test your changes thoroughly

5. **Run checks**:
   ```bash
   # Build to check for errors
   pnpm build
   
   # Run linter
   pnpm lint
   ```

6. **Commit your changes**:
   ```bash
   git add .
   git commit -m "feat: add new enemy type - Shadow Demon"
   ```

7. **Push to your fork**:
   ```bash
   git push origin feature/your-feature-name
   ```

8. **Open a Pull Request**:
   - Provide clear description of changes
   - Reference related issues
   - Include screenshots for UI changes
   - List testing performed

## Coding Standards

### TypeScript Guidelines

**1. Strict Typing**
```typescript
// ✅ GOOD: Explicit types
function calculateDamage(
  baseDamage: number,
  modifier: number,
  target: Enemy
): number {
  return Math.floor(baseDamage * modifier * target.defense);
}

// ❌ BAD: Implicit any
function calculateDamage(baseDamage, modifier, target) {
  return baseDamage * modifier * target.defense;
}
```

**2. Interfaces for Complex Types**
```typescript
// ✅ GOOD: Defined interface
interface CombatResult {
  damage: number;
  isCritical: boolean;
  statusEffects: StatusEffect[];
}

// ❌ BAD: Object literal everywhere
function attack(): { damage: number; isCritical: boolean; statusEffects: any[] } {
  // ...
}
```

**3. Type Imports**
```typescript
// ✅ GOOD: Type-only imports
import type { Enemy, Item } from '@/types/game';

// ❌ BAD: Regular imports for types
import { Enemy, Item } from '@/types/game';
```

### React Best Practices

**1. Component Structure**
```typescript
// ✅ GOOD: Clear component structure
interface Props {
  enemy: Enemy;
  onDefeat: (enemy: Enemy) => void;
}

export function EnemyCard({ enemy, onDefeat }: Props) {
  const [health, setHealth] = useState(enemy.maxHealth);
  
  // ... component logic
  
  return (
    <div className="enemy-card">
      {/* ... JSX */}
    </div>
  );
}
```

**2. Use Client Directive When Needed**
```typescript
// ✅ GOOD: Client component with directive
'use client';

import { useEffect, useState } from 'react';

export function InteractiveComponent() {
  // ... uses browser APIs or hooks
}
```

**3. Hooks Usage**
```typescript
// ✅ GOOD: Custom hooks for reusable logic
function useEnemySpawner(biome: BiomeType) {
  const [enemies, setEnemies] = useState<Enemy[]>([]);
  
  useEffect(() => {
    const interval = setInterval(() => {
      const newEnemy = spawnEnemyForBiome(biome);
      setEnemies(prev => [...prev, newEnemy]);
    }, 5000);
    
    return () => clearInterval(interval);
  }, [biome]);
  
  return enemies;
}
```

### Code Formatting

**Use Prettier** (automatic formatting):
```bash
pnpm format
```

**Conventions:**
- 2 spaces for indentation
- Single quotes for strings
- Semicolons required
- Trailing commas in objects/arrays
- Arrow functions preferred

### Naming Conventions

**Files:**
- Components: `PascalCase.tsx` (e.g., `EnemyCard.tsx`)
- Utils/libs: `camelCase.ts` (e.g., `combatSystem.ts`)
- Types: `camelCase.ts` (e.g., `game.ts`)

**Variables/Functions:**
- Variables: `camelCase` (e.g., `currentHealth`)
- Constants: `UPPER_SNAKE_CASE` (e.g., `MAX_ENEMIES`)
- Functions: `camelCase` (e.g., `calculateDamage`)
- React Components: `PascalCase` (e.g., `EnemyCard`)

**Types:**
- Interfaces: `PascalCase` (e.g., `Enemy`, `GameState`)
- Type aliases: `PascalCase` (e.g., `BiomeType`)
- Enums: `PascalCase` with `UPPER_SNAKE_CASE` values

## Git Workflow

### Commit Message Format

Use conventional commits:

```
<type>(<scope>): <subject>

<body>

<footer>
```

**Types:**
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, no logic change)
- `refactor`: Code refactoring
- `perf`: Performance improvements
- `test`: Adding or updating tests
- `chore`: Maintenance tasks

**Examples:**
```bash
feat(combat): add status effect system

Implements 6 status effects: Burning, Frozen, Poison, Stunned, Blessed, Cursed.
Each effect has unique visual feedback and damage calculations.

Closes #42

---

fix(ai): handle empty Gemini response

Add fallback when AI returns no function call.
Game continues with default narrative instead of crashing.

---

docs(readme): update feature list

Add new combat and quest system documentation.
```

### Branch Naming

- `feature/` - New features (e.g., `feature/multiplayer-mode`)
- `fix/` - Bug fixes (e.g., `fix/combat-damage-calculation`)
- `docs/` - Documentation (e.g., `docs/api-guide`)
- `refactor/` - Code refactoring (e.g., `refactor/enemy-system`)
- `chore/` - Maintenance (e.g., `chore/update-dependencies`)

## Testing Guidelines

### Manual Testing

Before submitting a PR, test:

1. **Feature works as expected**
2. **No console errors** in browser
3. **Build succeeds**: `pnpm build`
4. **No TypeScript errors**: `pnpm type-check`
5. **Responsive design** (mobile + desktop)
6. **Cross-browser** (Chrome, Firefox, Safari)

### Game Testing Checklist

- [ ] Player movement works correctly
- [ ] Combat calculations are accurate
- [ ] Enemy spawning matches biome
- [ ] Quests update progress properly
- [ ] Inventory manages items correctly
- [ ] Achievements unlock at right times
- [ ] Voice narration plays smoothly
- [ ] No memory leaks (Phaser cleanup)
- [ ] Mobile controls work on touchscreen

## Documentation Standards

### Code Comments

```typescript
/**
 * Calculates combat damage with critical hit chance and resistances
 * 
 * @param attacker - The entity performing the attack
 * @param defender - The entity receiving the attack
 * @param damageType - Type of damage (physical, magical, fire, ice, poison, holy)
 * @returns Combat result with damage, critical status, and effects applied
 */
function calculateCombat(
  attacker: Entity,
  defender: Entity,
  damageType: DamageType
): CombatResult {
  // Calculate base damage from attacker stats
  const baseDamage = attacker.attack * attacker.damageBonus;
  
  // Check for critical hit based on attacker class
  const critChance = CRIT_CHANCES[attacker.class];
  const isCritical = Math.random() < critChance;
  
  // Apply critical multiplier if successful
  const critMultiplier = isCritical ? 2.0 : 1.0;
  
  // Calculate resistances and weaknesses
  const resistance = defender.resistances[damageType] || 1.0;
  
  // Final damage calculation
  const finalDamage = Math.floor(
    baseDamage * critMultiplier * resistance
  );
  
  return {
    damage: finalDamage,
    isCritical,
    statusEffects: applyStatusEffects(damageType, defender)
  };
}
```

### Inline Comments

```typescript
// ✅ GOOD: Explain why, not what
// Prevent negative health to avoid UI display issues
const health = Math.max(0, currentHealth - damage);

// ❌ BAD: Obvious comment
// Set health to max of 0 and current health minus damage
const health = Math.max(0, currentHealth - damage);
```

## Pull Request Review Process

### What We Look For

1. **Code Quality**
   - Follows TypeScript/React best practices
   - Clear, readable code with appropriate comments
   - No unnecessary complexity

2. **Functionality**
   - Feature works as described
   - No breaking changes to existing features
   - Edge cases handled

3. **Testing**
   - Thoroughly tested manually
   - No console errors or warnings
   - Builds successfully

4. **Documentation**
   - Code is well-commented
   - README updated if needed
   - API changes documented

### Review Timeline

- Small fixes: 1-2 days
- New features: 3-5 days
- Major changes: 1-2 weeks

### Responding to Feedback

- Be open to suggestions
- Ask questions if unclear
- Update PR based on feedback
- Re-request review after changes

## Enhancement Priorities

We're particularly interested in contributions for:

1. **New Enemy Types**
   - Unique abilities and behaviors
   - Balanced stats for different levels
   - Biome-appropriate enemies

2. **Quest Varieties**
   - Creative quest objectives
   - Multi-step quest chains
   - Branching quest paths

3. **Item Types**
   - Weapons with unique abilities
   - Consumables with strategic uses
   - Set items with bonuses

4. **Visual Effects**
   - Combat animations
   - Environmental particles
   - Status effect visuals

5. **AI Improvements**
   - Better narrative variety
   - Context-aware responses
   - Dynamic difficulty adjustment

6. **Performance Optimizations**
   - Rendering improvements
   - Memory management
   - Bundle size reduction

## Getting Help

### Resources

- **Documentation**: See ARCHITECTURE.md, SETUP.md, THIRD_PARTY_APIs.md
- **Issues**: Check existing issues for similar questions
- **Discussions**: Start a discussion for general questions

### Contact

- **Email**: support@elpeef.com
- **Telegram**: https://t.me/khudriakhmad
- **Discord**: @khudri_61362

### Response Time

- Issues: 1-3 days
- Pull requests: 1-7 days depending on complexity
- Discussions: 1-2 days

---

## Recognition

Contributors will be:
- Listed in README.md
- Credited in release notes
- Mentioned in project announcements

Thank you for contributing to AI Dungeon Master! Your efforts help make this project better for everyone. 🎮✨

---

**Repository:** https://github.com/mrbrightsides/dungeonmaster
**Live Demo:** https://dungeonmaster-ai.vercel.app/
**Website:** https://rantai.elpeef.com
