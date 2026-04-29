import "dotenv/config";
import express from "express";
import cors from "cors";

import { fetchAllNews } from "./news.js";
import { deduplicateStories } from "./utils/dedupe.js";
import { summarizeNews } from "./summarizer.js";
import { connectRedis, redis } from "./redis.js";

const app = express();
const PORT = process.env.PORT || 4000;
const CACHE_TTL_SECONDS = Number(process.env.CACHE_TTL_SECONDS || 1800);

app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:3000",
  })
);

app.use(express.json());

function getCacheKey({ limit, threshold }) {
  return `news:${limit}:${threshold}`;
}

app.get("/health", (req, res) => {
  res.json({
    status: "ok",
    service: "ai-news-briefing-api",
  });
});

app.get("/api/news", async (req, res) => {
  try {
    const limit = Number(req.query.limit || 5);
    const threshold = Number(req.query.threshold || 0.55);

    if (!Number.isFinite(limit) || limit < 1 || limit > 20) {
      return res.status(400).json({
        error: "limit must be a number between 1 and 20",
      });
    }

    if (!Number.isFinite(threshold) || threshold < 0 || threshold > 1) {
      return res.status(400).json({
        error: "threshold must be a number between 0 and 1",
      });
    }

    const cacheKey = getCacheKey({ limit, threshold });

    const cached = await redis.get(cacheKey);

    if (cached) {
      return res.json({
        ...JSON.parse(cached),
        cached: true,
      });
    }

    const newsBySource = await fetchAllNews(limit);
    const stories = deduplicateStories(newsBySource, threshold);

    let summary = await summarizeNews(stories);

    const payload = {
      generatedAt: new Date().toISOString(),
      cached: false,
      sources: newsBySource.map((source) => ({
        source: source.source,
        articleCount: source.articles.length,
        error: source.error || null,
      })),
      totalStories: stories.length,
      summary,
      stories,
      rawSources: newsBySource,
    };

    await redis.set(cacheKey, JSON.stringify(payload), {
      EX: CACHE_TTL_SECONDS,
    });

    res.json(payload);
  } catch (error) {
    console.error(error);

    res.status(500).json({
      error: "Failed to generate news briefing",
      message: error.message,
    });
  }
});

async function startServer() {
  await connectRedis();

  app.listen(PORT, () => {
    console.log(`News API running on http://localhost:${PORT}`);
  });
}

startServer().catch((error) => {
  console.error("Failed to start server:", error);
  process.exit(1);
});
