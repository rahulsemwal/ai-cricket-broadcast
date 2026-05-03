import { callGemini } from "./gemini.js";
import { getMatchData, generateAlert } from "./tools.js";

let lastDataString = "";
let cachedResponse = null;

export async function runAgent() {
  const data = await getMatchData();
  const currentDataString = JSON.stringify(data);

  if (cachedResponse && currentDataString === lastDataString) {
    console.log("Match data unchanged. Using cached AI response to save Gemini quota.");
    return cachedResponse;
  }

  lastDataString = currentDataString;

  try {
    const commentary = await callGemini(`You are a cricket commentator. Data: ${currentDataString}. Generate 1 exciting line.`);

    const momentum = await callGemini(`Analyze match: ${currentDataString}. Return momentum and pressure.`);

    const decision = await callGemini(`You are captain. Match: ${currentDataString} Momentum: ${momentum}. Suggest next move.`);

    let alert = "";
    if (decision.toLowerCase().includes("change") || momentum.toLowerCase().includes("high")) {
      alert = generateAlert("Momentum shifting! Change strategy!");
    }

    const getShortName = (name) => (name && name.includes('[')) ? name.split('[')[1].replace(']', '') : (name || "Unknown");
    const matchTitle = `${getShortName(data.t1)} vs ${getShortName(data.t2)}`;

    cachedResponse = { commentary, insight: momentum, decision, alert, matchTitle };
    return cachedResponse;
  } catch (error) {
    console.error("Gemini API failed inside agent:", error.message);
    if (cachedResponse) {
      console.log("Falling back to last cached AI response.");
      return cachedResponse;
    } else {
      console.log("No cache available. Returning default mock AI response.");
      return {
        commentary: "The match is incredibly tense! Anything can happen right now.",
        insight: "Momentum is constantly shifting. Pressure is extremely high for both sides.",
        decision: "Stick to the basics. Build pressure with dot balls and wait for a mistake.",
        alert: generateAlert("Stay focused!")
      };
    }
  }
}