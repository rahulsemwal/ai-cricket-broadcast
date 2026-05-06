import axios from "axios";

let ballIndex = 0;

const _mockMatchdata = async (source = "mock") => {
  if (source === "cricAPI") {
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

const _parseRealMatchdata = async (source = "cricAPI", response = {}) => {
  if (source === "cricAPI") {
    const apiResponse = response;

    // Find the live match between KKR and SRH
    const srhVsKkrMatch = apiResponse.data.find(match => {
      // Check if it's a live match
      const isLive = match.ms === "live";

      // Check if both teams (t1 and t2) contain KKR and SRH
      const hasKKR = match.t1.includes("[KKR]") || match.t2.includes("[KKR]");
      const hasSRH = match.t1.includes("[SRH]") || match.t2.includes("[SRH]");

      return isLive && hasKKR && hasSRH;
    });

    // If the match is found, you can extract the scores
    if (srhVsKkrMatch) {
      console.log(`[${new Date().toISOString()}] Tools: Live match found! Status: ${srhVsKkrMatch.status}`);
      return srhVsKkrMatch;
    } else {
      console.log(`[${new Date().toISOString()}] Tools: SRH vs KKR live match not in API feed.`);
    }
  }
  return {};
}

const _getLiveMatchData = async (source = "cricAPI", url = "") => {
  if (source === "cricAPI") {
    url = `https://api.cricapi.com/v1/cricScore?apikey=${process.env.CRIC_API_KEY}`
    console.log(`[${new Date().toISOString()}] Tools: Requesting CricAPI...`);
    const res = await axios.get(url);
    return await _parseRealMatchdata(source, res.data);
  }
}

const events = [
  { runs: 4, event: "boundary" },
  { runs: 0, event: "dot" },
  { runs: 6, event: "six" },
  { runs: 1, event: "single" },
  { event: "wicket" }
];

export async function getMatchData() {
  const useLiveMatchData = process.env.USE_LIVE_MATCH_DATA === "true";

  if (useLiveMatchData) {
    try {
      console.log(`[${new Date().toISOString()}] Tools: Live Data is ENABLED. Fetching...`);
      const liveMatchData = await _getLiveMatchData();

      if (!liveMatchData || Object.keys(liveMatchData).length === 0) {
        throw new Error("No live match data found for SRH vs KKR");
      }

      return liveMatchData;

    } catch (error) {
      console.warn(`[${new Date().toISOString()}] Tools WARNING: ${error.message}. Falling back to dynamic mock.`);
      return await _mockMatchdata("cricAPI");
    }
  } else {
    console.log(`[${new Date().toISOString()}] Tools: Live Data is DISABLED. Using mock.`);
    return await _mockMatchdata("cricAPI");
  }
}

export function generateAlert(msg) {
  return `🚨 ${msg}`;
}