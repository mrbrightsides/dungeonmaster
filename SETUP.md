# Setup Guide

This guide will help you set up and run AI Dungeon Master locally on your machine.

## Prerequisites

Before you begin, ensure you have the following installed:

### Required Software

1. **Node.js** (version 20.x or higher)
   - Download from [nodejs.org](https://nodejs.org/)
   - Verify installation:
     ```bash
     node --version  # Should output v20.x.x or higher
     ```

2. **pnpm** (version 8.x or higher)
   - Install globally:
     ```bash
     npm install -g pnpm
     ```
   - Verify installation:
     ```bash
     pnpm --version  # Should output 8.x.x or higher
     ```

3. **Git**
   - Download from [git-scm.com](https://git-scm.com/)
   - Verify installation:
     ```bash
     git --version
     ```

### API Keys Required

You'll need API keys from these services:

1. **Google Gemini API**
   - Sign up at [Google AI Studio](https://makersuite.google.com/app/apikey)
   - Free tier available (60 requests per minute)
   - Model used: `gemini-2.0-flash-exp`

2. **ElevenLabs API** (Optional for voice narration)
   - Sign up at [ElevenLabs](https://elevenlabs.io/)
   - Free tier: 10,000 characters/month
   - Voice model: Adam

3. **Ethereum Wallet** (Optional for Web3 features)
   - Install [MetaMask](https://metamask.io/) browser extension
   - Not required for core game functionality

## Installation

### Step 1: Clone the Repository

```bash
# Clone the repo
git clone https://github.com/mrbrightsides/dungeonmaster.git

# Navigate to project directory
cd dungeonmaster
```

### Step 2: Install Dependencies

```bash
# Install all dependencies using pnpm
pnpm install
```

This will install:
- Next.js 15.3.8+
- React 19
- Phaser 3.80
- TypeScript 5.x
- All required dependencies (~200+ packages)

**Installation time:** 2-5 minutes depending on internet speed

### Step 3: Environment Configuration

Create a `.env.local` file in the root directory:

```bash
# Create environment file
touch .env.local
```

Add the following environment variables:

```env
# ===========================
# Google Gemini API
# ===========================
GEMINI_API_KEY=your_gemini_api_key_here

# Get your key at: https://makersuite.google.com/app/apikey
# Free tier: 60 requests per minute
# Model used: gemini-2.0-flash-exp


# ===========================
# ElevenLabs API (Optional)
# ===========================
ELEVENLABS_API_KEY=your_elevenlabs_api_key_here

# Get your key at: https://elevenlabs.io/
# Free tier: 10,000 characters/month
# Voice model: Adam (male, deep voice for dungeon master)
# Note: Game works without this - voice narration will be disabled


# ===========================
# Application URL
# ===========================
NEXT_PUBLIC_APP_URL=http://localhost:3000

# For production deployment, change to your domain:
# NEXT_PUBLIC_APP_URL=https://dungeonmaster.elpeef.com


# ===========================
# Web3 Configuration (Optional)
# ===========================
# SIWE (Sign-In With Ethereum) for authentication
# Game works without Web3 - this is optional feature

# Ethereum RPC URL (default: public endpoint)
NEXT_PUBLIC_ETH_RPC_URL=https://eth-mainnet.g.alchemy.com/v2/demo

# WalletConnect Project ID (get from: https://cloud.walletconnect.com/)
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=your_project_id_here
```

### Step 4: API Key Setup

#### Google Gemini API

1. Visit [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Sign in with your Google account
3. Click "Create API Key"
4. Copy the key and paste it in `.env.local`:
   ```env
   GEMINI_API_KEY=AIzaSy...your_key_here
   ```

**Rate Limits:**
- Free tier: 60 requests per minute
- Sufficient for testing and hackathon demos
- Upgrade available for higher limits

#### ElevenLabs API (Optional)

1. Sign up at [ElevenLabs](https://elevenlabs.io/)
2. Go to Profile Settings → API Keys
3. Generate new API key
4. Copy and add to `.env.local`:
   ```env
   ELEVENLABS_API_KEY=sk_...your_key_here
   ```

**Free Tier:**
- 10,000 characters per month
- ~30-50 narrative responses
- Upgrade for unlimited narration

**Note:** If you don't provide this key, the game will work perfectly - just without voice narration.

#### Web3 Setup (Optional)

**For WalletConnect:**
1. Visit [WalletConnect Cloud](https://cloud.walletconnect.com/)
2. Create a project
3. Copy Project ID
4. Add to `.env.local`:
   ```env
   NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=abc123...
   ```

**Note:** Web3 features are completely optional. The game works fully without wallet connection.

### Step 5: Verify Installation

Run the development server:

```bash
pnpm dev
```

You should see:
```
 ▲ Next.js 15.3.8
  - Local:        http://localhost:3000
  - Environments: .env.local

 ✓ Ready in 2.3s
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Development Commands

### Running the App

```bash
# Development server (hot reload enabled)
pnpm dev

# Production build
pnpm build

# Start production server
pnpm start

# Run on different port
PORT=3001 pnpm dev
```

### Code Quality

```bash
# Type checking
pnpm type-check

# Linting
pnpm lint

# Fix linting issues automatically
pnpm lint --fix

# Format code with Prettier
pnpm format
```

### Dependency Management

```bash
# Install new dependency
pnpm add package-name

# Install dev dependency
pnpm add -D package-name

# Update all dependencies
pnpm update

# Check for outdated packages
pnpm outdated

# Remove unused dependencies
pnpm prune
```

## Project Structure After Setup

```
dungeonmaster/
├── .env.local              # Your environment variables (git-ignored)
├── .next/                  # Next.js build output (auto-generated)
├── node_modules/           # Dependencies (auto-generated)
├── public/                 # Static assets
│   ├── .well-known/       # Farcaster configuration
│   └── favicon.ico
├── src/                    # Source code
│   ├── app/               # Next.js app router
│   ├── components/        # React components
│   ├── game/              # Phaser game engine
│   ├── hooks/             # Custom React hooks
│   ├── lib/               # Core game systems
│   └── types/             # TypeScript definitions
├── package.json            # Project dependencies
├── tsconfig.json          # TypeScript configuration
├── next.config.mjs        # Next.js configuration
├── tailwind.config.ts     # Tailwind CSS configuration
├── README.md              # Project overview
├── ARCHITECTURE.md        # Technical deep dive
├── CONTRIBUTING.md        # Contribution guidelines
├── SETUP.md               # This file
└── THIRD_PARTY_APIs.md    # API documentation
```

## Build and Deployment

### Local Production Build

```bash
# Create optimized production build
pnpm build

# Start production server
pnpm start
```

Build output:
```
Route (app)                Size     First Load JS
┌ ○ /                     256 kB         356 kB
├ ○ /game                 899 kB         999 kB
└ ○ /api/*                0 B            0 B

○  (Static)  prerendered as static content
```

### Deploy to Vercel

1. **Install Vercel CLI**:
   ```bash
   npm i -g vercel
   ```

2. **Login**:
   ```bash
   vercel login
   ```

3. **Deploy**:
   ```bash
   vercel
   ```

4. **Set Environment Variables** in Vercel Dashboard:
   - Go to Project Settings → Environment Variables
   - Add all variables from `.env.local`
   - Redeploy for changes to take effect

**Production URL:** https://dungeonmaster.elpeef.com

### Deploy to Other Platforms

**Netlify:**
```bash
# Install Netlify CLI
npm i -g netlify-cli

# Deploy
netlify deploy --prod
```

**Docker (Optional):**
```bash
# Build Docker image
docker build -t dungeonmaster .

# Run container
docker run -p 3000:3000 dungeonmaster
```

## Troubleshooting

### Port Already in Use

**Error:**
```
Error: listen EADDRINUSE: address already in use :::3000
```

**Solution:**
```bash
# Find process using port 3000
lsof -ti:3000

# Kill the process
kill -9 $(lsof -ti:3000)

# Or use different port
PORT=3001 pnpm dev
```

### API Key Issues

**Error:** "API key invalid" or "Authentication failed"

**Solution:**
1. Verify `.env.local` file exists in root directory
2. Check API key has no extra spaces or quotes
3. Restart development server after changing env variables
4. Verify API key is active in provider dashboard

**For Gemini:**
- Check quota at [Google AI Studio](https://makersuite.google.com/)
- Ensure you haven't exceeded 60 requests/minute

**For ElevenLabs:**
- Check usage at [ElevenLabs Dashboard](https://elevenlabs.io/)
- Verify you haven't exceeded monthly character limit

### Build Errors

**Error:** "Type error: Property 'X' does not exist on type 'Y'"

**Solution:**
```bash
# Clear Next.js cache
rm -rf .next

# Reinstall dependencies
rm -rf node_modules
pnpm install

# Rebuild
pnpm build
```

### Module Not Found

**Error:** "Module not found: Can't resolve '@/components/...'"

**Solution:**
1. Check file path is correct
2. Ensure file extension is included (.tsx, .ts)
3. Verify import alias in `tsconfig.json`:
   ```json
   {
     "compilerOptions": {
       "paths": {
         "@/*": ["./src/*"]
       }
     }
   }
   ```

### Phaser/Game Not Loading

**Error:** Black screen or "Phaser is not defined"

**Solution:**
1. Ensure you're on the `/game` route (not `/`)
2. Check browser console for errors
3. Verify Phaser is installed:
   ```bash
   pnpm list phaser
   ```
4. Clear browser cache and reload

### Performance Issues

**Symptoms:** Low FPS, stuttering, memory leaks

**Solution:**
1. Check browser DevTools Performance tab
2. Ensure Phaser game properly destroys on unmount
3. Reduce particle effect count in settings
4. Close other browser tabs
5. Update to latest Chrome/Firefox

### Web3 Connection Fails

**Error:** "WalletConnect error" or "MetaMask not detected"

**Solution:**
1. Install MetaMask browser extension
2. Unlock your wallet
3. Refresh the page
4. Check NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID is set
5. **Note:** Web3 is optional - game works without it

## Testing Your Setup

### Quick Test Checklist

Run through this checklist to ensure everything works:

- [ ] Development server starts without errors
- [ ] Landing page loads at http://localhost:3000
- [ ] Game interface loads at http://localhost:3000/game
- [ ] Character selection works
- [ ] Player can move around dungeon
- [ ] Actions can be submitted
- [ ] AI generates narrative responses
- [ ] Enemies spawn correctly
- [ ] Combat system works
- [ ] Inventory displays items
- [ ] Quests appear and update
- [ ] Achievements unlock
- [ ] Voice narration plays (if ElevenLabs key provided)
- [ ] No console errors in browser DevTools

### Test Game Flow

1. **Start New Game**:
   - Visit http://localhost:3000
   - Click "Start Adventure"
   - Select a character class

2. **Test AI Integration**:
   - Type action: "I explore the dungeon"
   - Verify narrative response appears
   - Check enemy spawns

3. **Test Combat**:
   - Type action: "I attack the goblin"
   - Verify damage calculations
   - Check status effects apply

4. **Test Quests**:
   - Accept a quest from quest panel
   - Complete quest objective
   - Verify rewards received

5. **Test Items**:
   - Pick up items from defeated enemies
   - Open inventory
   - Use consumable item

## Development Tips

### Hot Reload

Next.js automatically reloads when you save files:
- `.tsx`, `.ts` files: Fast Refresh (preserves component state)
- `.css` files: Instant style updates
- `.env.local`: Requires server restart

### Browser DevTools

**Recommended Settings:**
- Open DevTools (F12 or Cmd+Option+I)
- Enable "Preserve log" for debugging
- Use React DevTools extension
- Monitor Network tab for API calls

### VS Code Extensions

Recommended extensions:
- ESLint
- Prettier
- TypeScript and JavaScript Language Features
- Tailwind CSS IntelliSense
- GitLens

### Debug Mode

Enable verbose logging:
```typescript
// In src/lib/logger.ts
const DEBUG = true;  // Change to true for detailed logs
```

## Getting Help

### Resources

- **Documentation**: See other .md files in this repo
- **Issues**: [GitHub Issues](https://github.com/mrbrightsides/dungeonmaster/issues)
- **Live Demo**: [dungeonmaster-ai.vercel.app](https://dungeonmaster-ai.vercel.app/)

### Contact Support

- **Email**: support@elpeef.com
- **Telegram**: https://t.me/khudriakhmad
- **Discord**: @khudri_61362
- **Website**: https://rantai.elpeef.com

---

## Next Steps

Once you have the project running:

1. **Explore the Code**: Start with `src/app/game/page.tsx`
2. **Read Architecture**: See ARCHITECTURE.md for system design
3. **Check APIs**: See THIRD_PARTY_APIs.md for integration details
4. **Contribute**: See CONTRIBUTING.md for guidelines
5. **Play the Game**: Test all features thoroughly!

---

**Happy coding! 🎮✨**

**Repository:** https://github.com/mrbrightsides/dungeonmaster
**Live Demo:** https://dungeonmaster-ai.vercel.app/
**Website:** https://rantai.elpeef.com
