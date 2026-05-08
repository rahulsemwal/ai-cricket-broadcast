import axios from "axios";
import { CRIC_API_BASE_URL, CRICKET_API_SOURCES, DEFAULT_CRICKET_API_SOURCE } from "./constants.js";

let ballIndex = 0;

/**
 * Generates simulated match data when real API data is unavailable or disabled.
 * Progresses the game state (score, overs, wickets) based on a global ball index.
 * @param {string} source - The data format to simulate ('cricAPI' or 'mock').
 * @returns {Promise<Object>} Simulated match data object.
 */
const _mockMatchdata = async (source = DEFAULT_CRICKET_API_SOURCE) => {
  if (source === CRICKET_API_SOURCES.CRIC_API) {
    const e = events[ballIndex % events.length];

    // Simulate runs, wickets, and overs progressing
    const runs = 125 + (ballIndex * Math.floor(Math.random() * 4 + 1));
    const wickets = 4 + Math.floor(ballIndex / 5);
    const overNum = 12 + Math.floor(ballIndex / 6);
    const ballNum = ballIndex % 6;

    ballIndex++;

    return {
      "id": "1153edf6-3ae1-4722-be1e-0256495b49cb",
      "dateTimeGMT": "2026-05-03T10:00:00",
      "matchType": "t20",
      "status": `Live Match - ${e.event.toUpperCase()} on this ball!`,
      "ms": "live",
      "t1": "Kolkata Knight Riders [KKR]",
      "t2": "Sunrisers Hyderabad [SRH]",
      "t1s": "199/8 (20)",
      "t2s": `${runs}/${wickets > 10 ? 10 : wickets} (${overNum}.${ballNum})`,
      "t1img": "https://g.cricapi.com/iapi/206-637852958714346149.png?w=48",
      "t2img": "https://g.cricapi.com/iapi/279-637852957609490368.png?w=48",
      "series": "Indian Premier League 2026",
      "recent_ball_event": e
    };
  }
  //mock
  const e = events[ballIndex % events.length];
  ballIndex++;

  return {
    batsman: "Virat Kohli",
    bowler: "Rashid Khan",
    over: `15.${ballIndex}`,
    score: `${140 + ballIndex}/${3 + (ballIndex % 2)}`,
    ...e
  };
}

/**
 * Parses raw API response data to find the best available match.
 * Priority: 1. Any LIVE match | 2. Any COMPLETED match (result)
 * @param {Object} response - The raw data from the API.
 * @param {string} source - The API source name.
 * @returns {Promise<Object>} The best available match object, or empty object if none found.
 */
const _parseRealMatchdata = async (response = {}, source = DEFAULT_CRICKET_API_SOURCE) => {
  if (source === CRICKET_API_SOURCES.CRIC_API) {
    const matches = response.data || [];

    // 1. Try to find the FIRST match that is currently LIVE
    const liveMatch = matches.find(match => match.ms === "live");
    if (liveMatch) {
      console.log(`[${new Date().toISOString()}] Tools: Found a LIVE match! (${liveMatch.t1} vs ${liveMatch.t2})`);
      return liveMatch;
    }

    // 2. If no live match, try to find the FIRST match that has a RESULT (contains scores)
    const resultMatch = matches.find(match => match.ms === "result");
    if (resultMatch) {
      console.log(`[${new Date().toISOString()}] Tools: No live matches. Found a COMPLETED match. (${resultMatch.t1} vs ${resultMatch.t2})`);
      return resultMatch;
    }

    console.log(`[${new Date().toISOString()}] Tools: No Live or Completed matches found in API feed.`);
  }
  return {};
}

/**
 * Performs the HTTP request to the cricket API to fetch live scores.
 * @param {string} url - Optional override URL.
 * @param {string} source - The API source name.
 * @returns {Promise<Object>} The parsed match data.
 */
const _getLiveMatchData = async (source = DEFAULT_CRICKET_API_SOURCE) => {
  if (source === CRICKET_API_SOURCES.CRIC_API) {
    const apiURL = `${CRIC_API_BASE_URL}?apikey=${process.env.CRIC_API_KEY}`;
    console.log(`\n\[${new Date().toISOString()}] Tools: Requesting CricAPI...`);
    const res = await axios.get(apiURL);
    console.log(`\n\[${new Date().toISOString()}] Tools: Raw CricAPI response: ${JSON.stringify(res.data)}`);
    const parsedData = await _parseRealMatchdata(res.data, source);
    console.log(`\n\[${new Date().toISOString()}] Tools: Parsed Live match data: ${JSON.stringify(parsedData)}`);
    return parsedData;
  }
}

const events = [
  { runs: 4, event: "boundary" },
  { runs: 0, event: "dot" },
  { runs: 6, event: "six" },
  { runs: 1, event: "single" },
  { event: "wicket" }
];

/**
 * Main entry point for match data. Orchestrates between live API fetching 
 * and fallback mock simulation based on environment configuration.
 * @returns {Promise<Object>} Current match state.
 */
export async function getMatchData() {
  const useLiveMatchData = process.env.USE_LIVE_MATCH_DATA === "true";
  const source = DEFAULT_CRICKET_API_SOURCE;
  if (useLiveMatchData) {
    try {
      console.log(`\n\[${new Date().toISOString()}] Tools: Live Data is ENABLED. Fetching...`);
      const liveMatchData = await _getLiveMatchData(source);
      // Ensure data was received and is not empty
      if (!liveMatchData || Object.keys(liveMatchData).length === 0) {
        throw new Error("Received empty or invalid match data");
      }

      return liveMatchData;

    } catch (error) {
      console.warn(`[${new Date().toISOString()}] Tools WARNING: ${error.message}. Falling back to dynamic mock.`);
      return await _mockMatchdata(source);
    } finally {
      console.log(`[${new Date().toISOString()}] Tools: getMatchData operation completed.`);
    }
  } else {
    console.log(`[${new Date().toISOString()}] Tools: Live Data is DISABLED. Using mock.`);
    return await _mockMatchdata(source);
  }
}

/**
 * Formats a message string into a standardized UI alert with icons.
 * @param {string} msg - The message to format.
 * @returns {string} The formatted alert string.
 */
export function generateAlert(msg) {
  return `🚨 ${msg}`;
}

/**
 * Extracts the short team name from a string (e.g., "Kolkata Knight Riders [KKR]" -> "KKR").
 * @param {string} name - The full team name.
 * @returns {string} The short team name or "Unknown".
 */
export function getShortName(name) {
  return (name && name.includes('[')) ? name.split('[')[1].replace(']', '') : (name || "Unknown");
}

/**
 * Formats a professional match title with batting/bowling icons.
 * @param {Object} data - The raw match data.
 * @returns {string} A formatted title like "KKR 🏏 (169/3) vs SRH ⚾ (165/10)"
 */
export function formatMatchTitle(data, source = DEFAULT_CRICKET_API_SOURCE) {
  if (source === CRICKET_API_SOURCES.CRIC_API) {
    const t1Name = data.t1 || "Unknown";
    const t2Name = data.t2 || "Unknown";
    const t1Score = data.t1s || "0/0";
    const t2Score = data.t2s || "0/0";
    const status = (data.status || "").toLowerCase();
    const shortT1 = getShortName(t1Name).toLowerCase();
    const shortT2 = getShortName(t2Name).toLowerCase();

    // Smart Batting Detection
    let t1IsBatting = false;
    let t2IsBatting = false;

    if (status.includes(shortT1) && status.includes("need")) {
      t1IsBatting = true;
    } else if (status.includes(shortT2) && status.includes("need")) {
      t2IsBatting = true;
    } else {
      const t1AllOut = t1Score.includes("/10");
      const t2AllOut = t2Score.includes("/10");
      if (t2Score !== "0/0" && !t2AllOut && t2Score.includes("(")) {
        t2IsBatting = true;
      } else if (t1Score !== "0/0" && !t1AllOut) {
        t1IsBatting = true;
      }
    }

    // Smart Icon Assignment: Only show icons if someone is actually batting
    let t1Icon = "";
    let t2Icon = "";

    if (t1IsBatting) {
      t1Icon = "🏏 ";
      t2Icon = "⚾ ";
    } else if (t2IsBatting) {
      t2Icon = "🏏 ";
      t1Icon = "⚾ ";
    }

    // Format scores to be cleaner (remove extra parentheses if they exist)
    const cleanScore1 = t1Score.replace(/\((.*?)\)/, '$1').trim();
    const cleanScore2 = t2Score.replace(/\((.*?)\)/, '$1').trim();

    // End of match check
    if (status.includes("won") || status.includes("drawn") || status.includes("result")) {
      return `${t1Name} (${cleanScore1}) vs ${t2Name} (${cleanScore2})`;
    }

    // Smart UX: "Full Name [SHORT] Icon (Score)"
    return `${t1Name} ${t1Icon} (${cleanScore1}) vs ${t2Name} ${t2Icon} (${cleanScore2})`;
  }
}