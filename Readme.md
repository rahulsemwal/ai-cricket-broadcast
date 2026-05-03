# 🏏 AI-Vision Cricket Broadcast/commentry Engine

![Hackathon Winner](https://img.shields.io/badge/Status-Hackathon_Winner-gold?style=for-the-badge&logo=trophy) ![Gemini API](https://img.shields.io/badge/Powered_by-Gemini_2.5_Flash-blue?style=for-the-badge)

## 🎯 The Problem Statement
> *"How about generating live commentary for a match when you point your camera towards it? Can that live commentary be related to more than one device over a call (Bluetooth or anything else) for people who are not sitting in the match but are on a video call?"*

## 💡 Our Solution
We built a highly scalable, multi-device **Generative AI Broadcasting System**. 

Instead of locking the broadcast to a single local Bluetooth connection, we built a **Web-Native Audio Broadcasting Server**. As live match events occur (either via camera vision pipelines or real-time APIs), the data is piped into **Google Gemini 2.5 Flash**, which acts as a dynamic triad of AI personalities:
1. **The Excitable Commentator** (Play-by-play audio)
2. **The Analyst** (Momentum and pressure insights)
3. **The Captain** (Tactical decision making)

This data is instantly broadcasted to a modern web frontend. **Anyone, anywhere on any device** (mobile, tablet, laptop, or over a video call screen-share) can connect to the web interface and hear the **Live Text-to-Speech Commentary** in perfect sync.

---

## ✨ Key Features

- **🗣️ Live Multi-Device Audio**: Uses the Browser Speech Synthesis API. Any device opening the web app instantly becomes a synced broadcast speaker.
- **🧠 Tri-Agent AI Architecture (Chained)**: Three distinct Gemini prompts are chained sequentially. The Analyst evaluates the score, and the Captain reads the Analyst's output to make highly contextual tactical decisions.
- **⚡ Smart API Caching**: To prevent rate limits and ensure lightning-fast responses, the backend caches AI analysis and only re-prompts Gemini when actual match events change.
- **🛡️ Bulletproof Fallbacks**: If live match data fails or APIs hit limits, the system seamlessly degrades to a dynamic mock-match simulation, ensuring the broadcast *never* goes down.
- **🎨 Beautiful UI**: A clean, responsive grid layout that highlights the most critical match data and actionable alerts.

## 🤖 AI Agent Implementation (High-Level)

The core intelligence of the application runs on a custom **Agentic Workflow** built around Google's Gemini API. When live data is ingested, the system orchestrates multiple AI tasks to simulate a full broadcasting studio:

1. **The Ingestion Layer (`tools.js`)**: Fetches real-time JSON match data using CricAPI. If the API fails or rate-limits are hit, it automatically falls back to a **Dynamic Mock Generator** (`_mockMatchdata`). This generator uses a `ballIndex` to mathematically simulate live ball-by-ball events (progressing runs, wickets, and overs) to keep the broadcast completely alive.
2. **The Tri-Agent Processing (`agent.js`)**:
   - **🎙️ Play-by-Play Agent**: Instructed to act as an energetic cricket commentator, translating the raw JSON score into an exciting one-liner audio script.
   - **📊 Analyst Agent**: Evaluates the match data to determine momentum and pressure shifts.
   - **🧠 Captain Agent**: Takes the **Analyst's momentum report** as direct input alongside the raw match data to output a highly-contextual tactical "next-move" decision.
   - **🚨 Actionable Alerts**: A deterministic rule engine that parses the Captain and Analyst outputs to flash UI alerts (e.g., if the Analyst detects "high" pressure or Captain says "change").
3. **Smart Rate-Limit Guardrails**: The `agent.js` file implements a strict memory cache (`cachedResponse` and `lastDataString`). It hashes the incoming JSON match state and *only* triggers the 3 Gemini API calls if the score has genuinely changed.
4. **Resilience & Fallbacks**: The entire agent logic is wrapped in a massive `try-catch` block. If Gemini API quotas are exhausted (429 errors), the agent instantly serves the last known `cachedResponse`, or defaults to a tense fallback script. The frontend *never* receives a 500 error.

## 🛠️ Tech Stack
* **Backend:** Node.js, Express.js
* **AI Model:** Google Gemini 2.5 Flash
* **Live Data:** CricAPI (with dynamic mock failovers)
* **Frontend:** Vanilla HTML/JS/CSS (No heavy frameworks for maximum speed)
* **Audio:** Native Browser `SpeechSynthesisUtterance` API

---

## 🚀 Setup & Installation

### 1. Prerequisites
- Node.js (v18+)
- A Google Gemini API Key
- A CricAPI Key

### 2. Environment Setup
Navigate to the `server/` directory and ensure your `.env` file looks like this:
```env
GEMINI_API_KEY=your_gemini_api_key
CRIC_API_KEY=your_cricapi_key
PORT=3000
```

### 3. Start the Server
```bash
cd server
npm install
node index.js
```

### 4. Open the Web App
The Node server automatically hosts the frontend interface! 
Simply open your web browser and navigate to:
👉 **http://localhost:3000**

*(Note: Modern browsers block autoplaying audio. Be sure to click the **"Start Broadcast Audio"** button on the webpage to hear the live commentary!)*

---

## 🔧 Troubleshooting & Hacks

**Port 3000 already in use?**
If you need to quickly kill a hung Node server on Mac/Linux, run:
```bash
kill -9 $(lsof -t -i:3000)
```