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

// Serve the frontend static files
app.use(express.static(path.join(__dirname, "../client")));

app.post("/live", async (req, res) => {
  try {
    const result = await runAgent();
    console.log("Result from runAgent:", result);
    res.json(result);
  } catch (e) {
    console.error("Error in /live endpoint:", e);
    res.status(500).send("Error: " + e.message);
  }
});

// Removed old "/" json route since it will now serve index.html

app.get("/health", (req, res) => {
  res.status(200).json({ status: "ok" });
});

app.listen(process.env.PORT || 3000, () =>
  console.log("Server running on port 3000")
);