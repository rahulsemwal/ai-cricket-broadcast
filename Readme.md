# 🏏 AI-Vision Cricket Broadcast & Live Commentary Engine

![Status](https://img.shields.io/badge/Status-Active_Development-green?style=for-the-badge) ![Gemini API](https://img.shields.io/badge/Powered_by-Gemini_2.5_Flash-blue?style=for-the-badge)

🚀 **Live Demo:** [https://ai-cricket-broadcast.onrender.com/](https://ai-cricket-broadcast.onrender.com/)

## 🎯 The Vision
We built a highly scalable, multi-device **Generative AI Broadcasting System**. It transforms raw cricket match data into a professional broadcasting experience with live commentary, tactical insights, and momentum analysis, all powered by Google's Gemini AI.

---

## ✨ Key Features

- **🗣️ Live Multi-Device Audio**: Uses the Browser Speech Synthesis API. Any device opening the web app instantly becomes a synced broadcast speaker.
- **🧠 Flexible Agent Architecture**: Toggle between **Single-Agent** (cost-efficient) and **Multi-Agent** (high-quality) processing modes.
- **🔌 Hybrid Data Sources**: Seamlessly switch between real-time **CricAPI** data and a sophisticated **Dynamic Mock Simulator** for development and testing.
- **⚡ Smart API Caching**: Prevents redundant AI calls by hashing match states and only re-processing when the score or event changes.
- **🛡️ Resilience-First Design**: Built-in failover mechanisms ensure the broadcast remains live even if external APIs encounter rate limits or outages.

---

## 🏗️ Technical Architecture

The system is designed around a decoupled workflow involving an **Ingestion Layer**, an **Orchestration Layer**, and an **Intelligence Layer**.

### 1. Ingestion Layer (`tools.js`)
Responsible for sourcing and normalizing match data.
- **Live Mode**: Fetches real-time data from CricAPI.
- **Mock Mode**: A stateful simulator that progresses match events (runs, wickets, overs) using a global sequence, ensuring a continuous data stream for the agents.
- **Formatters**: Utilities to clean team names and generate consistent match titles with dynamic batting/bowling icons.

### 2. Orchestration Layer (`agent.js`)
The "brain" of the operation that manages how data is processed by the AI.
- **Prompt Management**: Dynamically loads and injects data into specialized prompt templates (`commentary.txt`, `momentum.txt`, `decision.txt`).
- **Caching Logic**: Implements a comparison-based cache to minimize Gemini API usage.

### 3. Intelligence Layer (Gemini AI)
Depending on the configuration, the system employs one of two workflows:

#### **A. Multi-Agent Mode (High-Precision)**
Executes three parallel/chained AI calls for a deep broadcasting experience:
1.  **The Commentator**: Generates an energetic, play-by-play audio script.
2.  **The Analyst**: Evaluates scorecards to determine momentum and pressure shifts.
3.  **The Captain**: Consumes the Analyst's report to provide highly contextual tactical decisions (e.g., bowling changes, field placements).

#### **B. Single-Agent Mode (Efficient)**
A single, complex prompt that instructs Gemini to return a structured JSON response containing commentary, insights, and decisions in one round-trip.

---

## ⚙️ Environment Configuration

The application is highly configurable via the `server/.env` file. 

> [!TIP]
> Please refer to the `server/.env.example` file and create your own `.env` file in the same directory with your specific API keys and configuration preferences.

| Variable | Description | Default |
| :--- | :--- | :--- |
| `GEMINI_API_KEY` | Your Google Gemini API key. | `Required` |
| `CRIC_API_KEY` | Your CricAPI key for live scores. | `Required` |
| `USE_GEMINI` | `true` to use real AI; `false` to use mock AI responses. | `true` |
| `USE_LIVE_MATCH_DATA` | `true` for real API data; `false` for simulated mock data. | `true` |
| `MULTI_AGENT_MODE` | `true` for 3-call Tri-Agent mode; `false` for 1-call Single-Agent mode. | `true` |
| `PORT` | The port the Express server runs on. | `3000` |

---

## 🚀 Setup & Installation

### 1. Prerequisites
- **Node.js** (v18 or higher)
- **API Keys**: Obtain keys from [Google AI Studio](https://aistudio.google.com/) and [CricAPI/CricketData.org](https://www.CricketData.org/).

### 2. Installation
```bash
# Clone the repository
git clone <your-repo-url>
cd ai-cricket-broadcast/server

# Install dependencies
npm install
```

### 3. Configure Environment
Create a `.env` file in the `server/` directory:
```env
GEMINI_API_KEY=your_gemini_key
CRIC_API_KEY=your_cricapi_key
PORT=3000
USE_GEMINI=true
USE_LIVE_MATCH_DATA=true
MULTI_AGENT_MODE=true
```

### 4. Run the Application
```bash
npm run dev
```
Open **http://localhost:3000** in your browser.

---

## 🐳 Docker Setup

If you prefer to run the application in a containerized environment, use the provided Dockerfile.

### 1. Build the Image
```bash
docker build -t ai-cricket-broadcast .
```

### 2. Run the Container
Make sure to pass your environment variables using the `-e` flag or an `--env-file`.
```bash
docker run -p 3000:3000 \
  -e GEMINI_API_KEY=your_key \
  -e CRIC_API_KEY=your_key \
  -e USE_LIVE_MATCH_DATA=true \
  ai-cricket-broadcast
```

---

## 🛠️ Tooling & Utilities

| Tool | Functionality |
| :--- | :--- |
| `getMatchData()` | Orchestrates live vs. mock data fetching with automatic failover. |
| `generateAlert()` | Deterministically flags high-pressure moments for UI emphasis. |
| `callGemini()` | A robust wrapper for Gemini API interactions with error handling. |
| `loadPrompt()` | Utility to read and hydrate prompt templates from the `/prompts` folder. |

---

## 🛡️ Troubleshooting
- **API Limits**: If you hit Gemini rate limits, the system will fallback to the last cached response.
- **Audio Autoplay**: Modern browsers block audio. You **must** click the "Start Broadcast" button on the UI to enable the AI commentary.
- **Port Conflict**: If port 3000 is busy, use `kill -9 $(lsof -t -i:3000)` on Mac/Linux to clear it.