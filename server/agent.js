import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";
import { callGemini } from "./gemini.js";
import { getMatchData, generateAlert } from "./tools.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const loadPrompt = async (filename, replacements = {}) => {
  const filePath = path.join(__dirname, "prompts", `${filename}.txt`);
  let content = await fs.readFile(filePath, "utf-8");
  for (const [key, value] of Object.entries(replacements)) {
    content = content.replace(new RegExp(`{{${key}}}`, "g"), value);
  }
  return content;
};

let lastDataString = "";
let cachedResponse = null;

export async function runAgent() {
  const config = {
    useGemini: process.env.USE_GEMINI === "true",
    useLiveMatchData: process.env.USE_LIVE_MATCH_DATA === "true",
    multiAgentMode: process.env.MULTI_AGENT_MODE === "true"
  };

  console.log(`[${new Date().toISOString()}] Agent: Fetching match data...`);
  const data = await getMatchData();
  const currentDataString = JSON.stringify(data);

  if (cachedResponse && currentDataString === lastDataString) {
    console.log(`[${new Date().toISOString()}] Agent: Match data unchanged. Using cache.`);
    return { ...cachedResponse, config };
  }

  console.log(`[${new Date().toISOString()}] Agent: New match data detected. Checking AI toggle...`);
  lastDataString = currentDataString;

  if (!config.useGemini) {
    console.log(`[${new Date().toISOString()}] Agent: Gemini is DISABLED. Returning mock AI response.`);
    const getShortName = (name) => (name && name.includes('[')) ? name.split('[')[1].replace(']', '') : (name || "Unknown");
    const matchTitle = `${getShortName(data.t1)} vs ${getShortName(data.t2)}`;

    cachedResponse = {
      commentary: "A magnificent shot! The ball races away to the boundary. The crowd is on its feet!",
      insight: "The batting side is looking very dominant right now. Momentum is high.",
      decision: "The captain needs to bring in a spinner to slow down the run rate.",
      alert: generateAlert("Strategic timeout approaching!"),
      matchTitle
    };
    return { ...cachedResponse, config };
  }

  try {
    let commentary, momentum, decision;

    if (config.multiAgentMode) {
      console.log(`[${new Date().toISOString()}] Agent: Multi-Agent Mode ENABLED (3 calls).`);
      
      console.log(`[${new Date().toISOString()}] Agent: Requesting commentary...`);
      const commentaryPrompt = await loadPrompt("commentary", { data: currentDataString });
      commentary = await callGemini(commentaryPrompt);

      console.log(`[${new Date().toISOString()}] Agent: Requesting momentum analysis...`);
      const momentumPrompt = await loadPrompt("momentum", { data: currentDataString });
      momentum = await callGemini(momentumPrompt);

      console.log(`[${new Date().toISOString()}] Agent: Requesting tactical decision...`);
      const decisionPrompt = await loadPrompt("decision", { data: currentDataString, momentum: momentum });
      decision = await callGemini(decisionPrompt);
    } else {
      console.log(`[${new Date().toISOString()}] Agent: Single-Agent Mode ENABLED (1 call).`);
      const prompt = await loadPrompt("single_agent", { data: currentDataString });
      
      const raw = await callGemini(prompt);
      try {
        const parsed = JSON.parse(raw.replace(/```json|```/g, "").trim());
        commentary = parsed.commentary;
        momentum = parsed.insight;
        decision = parsed.decision;
      } catch (e) {
        console.error("Failed to parse single-agent JSON. Using raw text.");
        commentary = raw;
        momentum = "Analysis unavailable in single-agent mode.";
        decision = "Strategic decision pending.";
      }
    }

    let alert = "";
    if (decision.toLowerCase().includes("change") || momentum.toLowerCase().includes("high")) {
      console.log(`[${new Date().toISOString()}] Agent: High pressure detected. Generating alert.`);
      alert = generateAlert("Momentum shifting! Change strategy!");
    }

    const getShortName = (name) => (name && name.includes('[')) ? name.split('[')[1].replace(']', '') : (name || "Unknown");
    const matchTitle = `${getShortName(data.t1)} vs ${getShortName(data.t2)}`;

    cachedResponse = { commentary, insight: momentum, decision, alert, matchTitle };
    return { ...cachedResponse, config };
  } catch (error) {
    console.error(`[${new Date().toISOString()}] Agent ERROR:`, error.message);
    if (cachedResponse) {
      console.warn(`[${new Date().toISOString()}] Agent: Falling back to cached response.`);
      return { ...cachedResponse, config };
    } else {
      console.error(`[${new Date().toISOString()}] Agent: No cache available. Serving default emergency response.`);
      return {
        commentary: "The match is incredibly tense! Anything can happen right now.",
        insight: "Momentum is constantly shifting. Pressure is extremely high for both sides.",
        decision: "Stick to the basics. Build pressure with dot balls and wait for a mistake.",
        alert: generateAlert("Stay focused!"),
        config
      };
    }
  }
}