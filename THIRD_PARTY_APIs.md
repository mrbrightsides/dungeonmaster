# 🔌 Third Party APIs & Integrations

AI Dungeon Master leverages state-of-the-art AI models to provide an immersive, scripts-free experience.

## 🧠 Primary AI Engine: Google Gemini API

The core of the application is powered by the **@google/genai** SDK.

### 1. Narrative & Logic: Gemini 3.1 Pro Preview
Used for generating complex storylines, managing game state via **Function Calling**, and maintaining long-term context.
- **Model:** `gemini-3.1-pro-preview`
- **Key Features:** Large thinking budget for complex reasoning, high-fidelity world building.

### 2. Voice Narration: Gemini 2.5 Flash Preview TTS
Provides the cinematic "Dungeon Master" voice for all narrative logs.
- **Model:** `gemini-2.5-flash-preview-tts`
- **Voice Profile:** 'Kore' (Gravelly, Wise, Epic).

## 📦 Frontend Technologies
- **React 19:** Modern UI components and state management.
- **Tailwind CSS:** Professional utility-first styling.
- **Vite:** Blazing fast build tool and development server.

## 🔒 Privacy & Security
The `API_KEY` is handled securely via environment variables. All narrative generation is processed through Google's infrastructure. We do not store personal player data on our servers.

For technical inquiries, contact [support@elpeef.com](mailto:support@elpeef.com).
