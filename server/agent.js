import { callGemini } from "./gemini.js";
import { getMatchData, generateAlert } from "./tools.js";

let lastDataString = "";
let cachedResponse = null;

export async function runAgent() {
  console.log(`[${new Date().toISOString()}] Agent: Fetching match data...`);
  const data = await getMatchData();
  const currentDataString = JSON.stringify(data);

  if (cachedResponse && currentDataString === lastDataString) {
    console.log(`[${new Date().toISOString()}] Agent: Match data unchanged. Using cache.`);
    return cachedResponse;
  }

  console.log(`[${new Date().toISOString()}] Agent: New match data detected. Checking AI toggle...`);
  lastDataString = currentDataString;

  // Check if Gemini is enabled via env variable
  const useGemini = process.env.USE_GEMINI === "true";

  if (!useGemini) {
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
    return cachedResponse;
  }

  try {
    console.log(`[${new Date().toISOString()}] Agent: Gemini is ENABLED. Requesting commentary...`);
    const commentary = await callGemini(`You are a cricket commentator. Data: ${currentDataString}. Generate 1 exciting line.`);

    console.log(`[${new Date().toISOString()}] Agent: Requesting momentum analysis...`);
    const momentum = await callGemini(`Analyze match: ${currentDataString}. Return momentum and pressure.`);

    console.log(`[${new Date().toISOString()}] Agent: Requesting tactical decision...`);
    const decision = await callGemini(`You are captain. Match: ${currentDataString} Momentum: ${momentum}. Suggest next move.`);

    let alert = "";
    if (decision.toLowerCase().includes("change") || momentum.toLowerCase().includes("high")) {
      console.log(`[${new Date().toISOString()}] Agent: High pressure detected. Generating alert.`);
      alert = generateAlert("Momentum shifting! Change strategy!");
    }

    const getShortName = (name) => (name && name.includes('[')) ? name.split('[')[1].replace(']', '') : (name || "Unknown");
    const matchTitle = `${getShortName(data.t1)} vs ${getShortName(data.t2)}`;

    cachedResponse = { commentary, insight: momentum, decision, alert, matchTitle };
    return cachedResponse;
  } catch (error) {
    console.error(`[${new Date().toISOString()}] Agent ERROR:`, error.message);
    if (cachedResponse) {
      console.warn(`[${new Date().toISOString()}] Agent: Falling back to cached response.`);
      return cachedResponse;
    } else {
      console.error(`[${new Date().toISOString()}] Agent: No cache available. Serving default emergency response.`);
      return {
        commentary: "The match is incredibly tense! Anything can happen right now.",
        insight: "Momentum is constantly shifting. Pressure is extremely high for both sides.",
        decision: "Stick to the basics. Build pressure with dot balls and wait for a mistake.",
        alert: generateAlert("Stay focused!")
      };
    }
  }
}