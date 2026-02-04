# 🛠 Setup Guide - AI Dungeon Master

Welcome to the infinite realm. Follow these steps to get your local development environment running.

## 🚀 Quick Start

### 1. Clone the Repository
```bash
git clone https://github.com/mrbrightsides/dungeonmaster.git
cd dungeonmaster
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Configure Environment Variables
Create a `.env` file in the root directory and add your Google Gemini API Key:
```env
API_KEY=your_gemini_api_key_here
```

### 4. Launch Development Server
```bash
npm run dev
```

The app will be available at `http://localhost:5173`.

## 🌐 Deployment
The live version is hosted at: [dungeonmaster-ai.vercel.app](https://dungeonmaster-ai.vercel.app/)

## 🛠 Tech Stack
- **Framework:** React 19 + Vite
- **Styling:** Tailwind CSS (Standard Installation)
- **AI Engine:** Google Gemini API (@google/genai)
- **Voice:** Gemini 2.5 Flash TTS
- **State Management:** React Hooks + Function Calling