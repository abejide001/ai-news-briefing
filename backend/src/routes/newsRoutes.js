import { Router } from "express";
import { generateBriefing } from "../briefing/generateBriefing.js";
import { redis } from "../lib/redis.js";
import { deduplicateStories } from "../news/deduplicateStories.js";
import { fetchAllNews } from "../news/fetchNews.js";

const CACHE_TTL_SECONDS = Number(process.env.CACHE_TTL_SECONDS || 1800);

export const newsRouter = Router();

function getCacheKey({ limit, threshold }) {
  return `news:${limit}:${threshold}`;
}

newsRouter.get("/news", async (req, res) => {
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
    const summary = await generateBriefing(stories);

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
