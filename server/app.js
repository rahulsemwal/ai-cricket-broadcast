import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import { runAgent } from "./agent.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, ".env") });

const app = express();
app.use(cors());
app.use(express.json());

const CONFIG = {
  USE_GEMINI: process.env.USE_GEMINI === "true",
  USE_LIVE_MATCH_DATA: process.env.USE_LIVE_MATCH_DATA === "true",
  MULTI_AGENT_MODE: process.env.MULTI_AGENT_MODE === "true"
}

/**
 * Express Middleware: Logs all incoming requests with method, URL, and timestamp.
 */
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

// Serve the frontend static files
app.use(express.static(path.join(__dirname, "../client")));

/**
 * POST /live
 * Primary endpoint for the broadcasting engine. Triggers the AI agent 
 * workflow and returns the latest match commentary and analysis.
 */
app.post("/live", async (req, res) => {
  console.log(`[${new Date().toISOString()}] Processing /live request...`);
  try {
    const result = await runAgent();
    console.log(`[${new Date().toISOString()}] Successfully generated agent response.`);

    // Append current backend configuration for transparency
    const responseWithConfig = {
      ...result,
      CONFIG
    };
    console.log(`[${new Date().toISOString()}] SUCCESS: Response in /Live endpoint: ` + JSON.stringify(responseWithConfig));
    res.json(responseWithConfig);
  } catch (e) {
    console.error(`[${new Date().toISOString()}] FATAL: Error in /live endpoint:`, e.stack || e);
    res.status(500).send("Error: " + (e.message || "Unknown server error"));
  }
});

// Removed old "/" json route since it will now serve index.html

/**
 * GET /health
 * Simple health check endpoint to verify server status.
 */
app.get("/health", (req, res) => {
  res.status(200).json({ status: "ok", timestamp: new Date().toISOString() });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`[${new Date().toISOString()}] >>> Server is live on port ${PORT}`);
  console.log(`[${new Date().toISOString()}] >>> Access it at: http://localhost:${PORT}`);
});